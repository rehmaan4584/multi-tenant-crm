'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { AppShell } from './app-shell';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !token) {
      router.replace('/login');
    }
  }, [isReady, token, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!token) return null;

  return <AppShell>{children}</AppShell>;
}
