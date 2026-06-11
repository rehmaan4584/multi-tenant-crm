'use client';

import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { ToastProvider } from '@/components/ui/toast-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <ToastProvider />
      </AuthProvider>
    </QueryProvider>
  );
}
