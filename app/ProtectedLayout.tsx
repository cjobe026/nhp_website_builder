'use client';

import { usePathname } from 'next/navigation';
import { AuthGuard } from './AuthGuard';

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname === '/login') {
    return <>{children}</>;
  }
  
  return <AuthGuard>{children}</AuthGuard>;
}
