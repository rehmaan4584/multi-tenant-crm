'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';

export default function HomePage() {
  const { token, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    router.replace(token ? '/customers' : '/login');
  }, [isReady, token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-gray-500">
      Loading...
    </div>
  );
}
