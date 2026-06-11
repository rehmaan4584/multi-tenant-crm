'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'rounded-lg border border-border shadow-lg',
          success: 'bg-surface text-text',
          error: 'bg-surface text-text',
        },
      }}
    />
  );
}
