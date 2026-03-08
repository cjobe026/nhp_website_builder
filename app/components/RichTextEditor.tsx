'use client';

import { useRef, useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      const selection = window.getSelection();
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
      
      editorRef.current.innerHTML = value;
      
      if (range && selection && editorRef.current.contains(range.startContainer)) {
        try {
          selection.removeAllRanges();
          selection.addRange(range);
        } catch (e) {
          // Ignore if range is invalid
        }
      }
    }
  }, [value]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          // Redo
          if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            const content = history[newIndex];
            if (editorRef.current) {
              editorRef.current.innerHTML = content;
              onChange(content);
            }
          }
        } else {
          // Undo
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const content = history[newIndex];
            if (editorRef.current) {
              editorRef.current.innerHTML = content;
              onChange(content);
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex, onChange]);

  const execCommand = (command: string, value?: string) => {
    // Save selection
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    
    // Restore selection
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      
      // Add to history (keep last 20)
      setHistory(prev => {
        const newHistory = prev.slice(Math.max(0, prev.length - 19));
        return [...newHistory, content];
      });
      setHistoryIndex(prev => Math.min(prev + 1, 19));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (e.key === 'Backspace' && range.collapsed) {
          const node = range.startContainer;
          const offset = range.startOffset;
          
          // Check if previous sibling is an image
          if (node.nodeType === Node.TEXT_NODE && offset === 0) {
            const parent = node.parentNode;
            const prevSibling = node.previousSibling;
            if (prevSibling && prevSibling.nodeName === 'IMG') {
              e.preventDefault();
              prevSibling.remove();
              handleInput();
              return;
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const prevNode = node.childNodes[offset - 1];
            if (prevNode && prevNode.nodeName === 'IMG') {
              e.preventDefault();
              prevNode.remove();
              handleInput();
              return;
            }
          }
        }
        
        // Check if selection contains an image
        const container = range.commonAncestorContainer;
        const parent = container.nodeType === Node.TEXT_NODE ? container.parentNode : container;
        if (parent) {
          const imgs = (parent as Element).querySelectorAll?.('img') || [];
          if (imgs.length > 0) {
            e.preventDefault();
            imgs.forEach(img => img.remove());
            handleInput();
            return;
          }
        }
      }
    }
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      e.preventDefault();
      const href = target.getAttribute('href');
      if (href) {
        const newUrl = prompt('Edit link URL:', href);
        if (newUrl !== null) {
          target.setAttribute('href', newUrl);
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = `<img src="${event.target?.result}" alt="" style="max-width: 100%; height: auto; margin: 1rem 0;" />`;
        document.execCommand('insertHTML', false, img);
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b-2 border-gray-300 p-2 flex gap-2 flex-wrap">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('bold')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('italic')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 italic"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('underline')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 underline"
        >
          U
        </button>
        <div className="w-px bg-gray-300" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold"
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('formatBlock', '<h3>')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-bold"
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('formatBlock', '<p>')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          P
        </button>
        <div className="w-px bg-gray-300" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          List
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const url = prompt('Enter link URL:');
            if (url) execCommand('createLink', url);
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          Link
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
        >
          Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onClick={handleEditorClick}
        className="p-4 min-h-[300px] focus:outline-none bg-white"
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      />
      
      <style jsx global>{`
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        [contenteditable] p {
          margin-bottom: 0.5rem;
        }
        [contenteditable] ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        [contenteditable] li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}
