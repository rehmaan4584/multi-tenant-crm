'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { AppShell } from './app-shell';
import { Skeleton } from './ui/skeleton';

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
      <div className="flex min-h-screen bg-surface-muted">
        <Skeleton className="hidden w-64 shrink-0 lg:block" />
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!token) return null;

  return <AppShell>{children}</AppShell>;
}
