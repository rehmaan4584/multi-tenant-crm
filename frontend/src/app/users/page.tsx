'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import type { UserListItem } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { RoleBadge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { TableSkeleton } from '@/components/ui/skeleton';

export default function UsersPage() {
  const { token, user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && user && user.role !== 'admin') {
      router.replace('/customers');
    }
  }, [isReady, user, router]);

  const query = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<UserListItem[]>('/users', { token }),
    enabled: !!token && user?.role === 'admin',
  });

  if (!isReady || user?.role !== 'admin') {
    return null;
  }

  const { data, isLoading, isError, error } = query;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-text">Team members</h1>
        <p className="mt-1 text-sm text-text-muted">
          Users in your organization
        </p>
      </div>

      {isLoading && <TableSkeleton rows={4} cols={3} />}

      {isError && (
        <Alert>
          {error instanceof Error ? error.message : 'Failed to load users'}
        </Alert>
      )}

      {data && (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border last:border-0 hover:bg-surface-muted/50"
                >
                  <td className="px-4 py-3 font-medium text-text">{u.name}</td>
                  <td className="px-4 py-3 text-text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
