'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from './ui/button';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/customers" className="font-semibold text-gray-900">
            Multi-Tenant CRM
          </Link>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>
              {user?.name} ({user?.role})
            </span>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
