'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { PaginatedCustomers } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableSkeleton } from '@/components/ui/skeleton';

export default function CustomersPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const query = useQuery({
    queryKey: ['customers', page, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
      });
      if (debouncedSearch.trim()) {
        params.set('search', debouncedSearch.trim());
      }
      return apiFetch<PaginatedCustomers>(`/customers?${params}`, {
        token,
      });
    },
    enabled: !!token,
  });

  const { data, isLoading, isError, error } = query;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">Customers</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage and assign customers to your team
          </p>
        </div>
        <Link href="/customers/new">
          <Button>New customer</Button>
        </Link>
      </div>

      <Input
        placeholder="Search name or email..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {isLoading && <TableSkeleton rows={5} cols={4} />}

      {isError && (
        <Alert>
          {error instanceof Error ? error.message : 'Failed to load customers'}
        </Alert>
      )}

      {data && (
        <>
          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Assigned to</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <p className="font-medium text-text">No customers found</p>
                      <p className="mt-1 text-sm text-text-muted">
                        {debouncedSearch
                          ? 'Try a different search term'
                          : 'Get started by creating your first customer'}
                      </p>
                      {!debouncedSearch && (
                        <Link href="/customers/new" className="mt-4 inline-block">
                          <Button>Create customer</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  data.data.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-0 hover:bg-surface-muted/50"
                    >
                      <td className="px-4 py-3 font-medium text-text">{c.name}</td>
                      <td className="px-4 py-3 text-text-muted">{c.email}</td>
                      <td className="px-4 py-3 text-text-muted">
                        {c.assignedTo?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/customers/${c.id}`}
                          className="font-medium text-brand-600 hover:text-brand-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">
              Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total}{' '}
              total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
