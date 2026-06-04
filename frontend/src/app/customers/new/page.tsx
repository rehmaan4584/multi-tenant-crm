'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ApiRequestError, apiFetch } from '@/lib/api';
import type { Customer } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewCustomerPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch<Customer>('/customers', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
        }),
      }),
    onSuccess: (customer) => router.push(`/customers/${customer.id}`),
    onError: (err) =>
      setError(
        err instanceof ApiRequestError ? err.message : 'Create failed',
      ),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">New customer</h1>
      {error && <Alert>{error}</Alert>}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded border border-gray-200 bg-white p-4 text-gray-900 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Name
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Phone
          </label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Create'}
          </Button>
          <Link href="/customers">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
