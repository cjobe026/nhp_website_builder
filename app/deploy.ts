import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase-config';
import { Change } from './ChangeSetContext';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase-config';

function removeUndefinedFields(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
}

async function uploadBase64Image(base64: string, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const uploadResult = await uploadString(storageRef, base64, 'data_url');
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('Image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

export async function deployChanges(changes: Change[]) {
  const results = [];
  
  for (const change of changes) {
    try {
      if (change.type === 'article') {
        if (change.action === 'deleted') {
          const docRef = doc(db, 'articles', change.data.id);
          await deleteDoc(docRef);
          results.push({ success: true, change });
          continue;
        }
        
        const data = { ...change.data };
        
        // Upload images to Firebase Storage
        if (data.imageFile) {
          const imageUrl = await uploadBase64Image(data.imageFile, `articles/${data.id}/desktop-${Date.now()}.jpg`);
          data.image = imageUrl;
        }
        delete data.imageFile;
        
        if (data.mobileImageFile) {
          const mobileUrl = await uploadBase64Image(data.mobileImageFile, `articles/${data.id}/mobile-${Date.now()}.jpg`);
          data.mobileImage = mobileUrl;
        }
        delete data.mobileImageFile;
        
        const docRef = doc(db, 'articles', data.id);
        if (change.action === 'created') {
          await setDoc(docRef, data);
        } else {
          await updateDoc(docRef, removeUndefinedFields(data));
        }
        results.push({ success: true, change });
      } else if (change.type === 'film') {
        if (change.action === 'deleted') {
          const docRef = doc(db, 'films', change.data.id);
          await deleteDoc(docRef);
          results.push({ success: true, change });
          continue;
        }
        
        const docRef = doc(db, 'films', change.data.id);
        if (change.action === 'created') {
          await setDoc(docRef, change.data);
        } else {
          await updateDoc(docRef, removeUndefinedFields(change.data));
        }
        results.push({ success: true, change });
      } else if (change.type === 'event') {
        if (change.action === 'deleted') {
          const docRef = doc(db, 'events', change.data.id);
          await deleteDoc(docRef);
          results.push({ success: true, change });
          continue;
        }
        
        const docRef = doc(db, 'events', change.data.id);
        if (change.action === 'created') {
          await setDoc(docRef, change.data);
        } else {
          await updateDoc(docRef, removeUndefinedFields(change.data));
        }
        results.push({ success: true, change });
      }
    } catch (error) {
      console.error('Deploy error:', error);
      results.push({ success: false, change, error });
    }
  }
  
  return results;
}

export async function triggerRebuild() {
  const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO; // format: owner/repo
  
  if (!githubToken || !repo) {
    console.warn('GitHub token or repo not configured');
    return { success: false, message: 'GitHub not configured' };
  }
  
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'deploy-dev'
      })
    });
    
    return { 
      success: response.status === 204, 
      message: response.status === 204 ? 'Rebuild triggered' : 'Rebuild failed' 
    };
  } catch (error) {
    console.error('Rebuild trigger error:', error);
    return { success: false, message: 'Rebuild trigger failed' };
  }
}

export async function checkWorkflowStatus() {
  const githubToken = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  
  if (!githubToken || !repo) return null;
  
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/actions/runs?event=repository_dispatch&per_page=1&_=${Date.now()}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${githubToken}`,
      },
      cache: 'no-store',
    });
    
    const data = await response.json();
    const latestRun = data.workflow_runs?.[0];
    
    if (!latestRun) return null;
    
    return {
      status: latestRun.status,
      conclusion: latestRun.conclusion,
      url: latestRun.html_url,
    };
  } catch (error) {
    return null;
  }
}
