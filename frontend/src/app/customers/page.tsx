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
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
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

      {isLoading && <p className="text-sm text-gray-500">Loading customers...</p>}
      {isError && (
        <Alert>
          {error instanceof Error ? error.message : 'Failed to load customers'}
        </Alert>
      )}

      {data && (
        <>
          <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-gray-900">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Assigned to</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {data.data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  data.data.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 last:border-0">
                      <td className="px-3 py-2 text-gray-900">{c.name}</td>
                      <td className="px-3 py-2 text-gray-900">{c.email}</td>
                      <td className="px-3 py-2 text-gray-700">
                        {c.assignedTo?.name ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          href={`/customers/${c.id}`}
                          className="text-blue-600 hover:underline"
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
            <span className="font-medium text-gray-700">
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
