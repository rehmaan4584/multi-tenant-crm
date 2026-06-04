'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiRequestError, apiFetch } from '@/lib/api';
import type { Customer, Note, UserListItem } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const customerQuery = useQuery({
    queryKey: ['customer', id],
    queryFn: () => apiFetch<Customer>(`/customers/${id}`, { token }),
    enabled: !!token && !!id,
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<UserListItem[]>('/users', { token }),
    enabled: !!token,
  });

  const notesQuery = useQuery({
    queryKey: ['notes', id],
    queryFn: () => apiFetch<Note[]>(`/customers/${id}/notes`, { token }),
    enabled: !!token && !!id,
  });

  const customer = customerQuery.data;

  useEffect(() => {
    if (!customer) return;
    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone ?? '');
    setAssigneeId(customer.assignedToId ?? '');
  }, [customer]);

  const updateMutation = useMutation({
    mutationFn: () =>
      apiFetch<Customer>(`/customers/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ name, email, phone: phone || undefined }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setFormError(null);
    },
    onError: (err) =>
      setFormError(
        err instanceof ApiRequestError ? err.message : 'Update failed',
      ),
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      apiFetch<Customer>(`/customers/${id}/assign`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ assignedToId: assigneeId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setFormError(null);
    },
    onError: (err) =>
      setFormError(
        err instanceof ApiRequestError ? err.message : 'Assign failed',
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/customers/${id}`, { method: 'DELETE', token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      window.location.href = '/customers';
    },
    onError: (err) =>
      setFormError(
        err instanceof ApiRequestError ? err.message : 'Delete failed',
      ),
  });

  const noteMutation = useMutation({
    mutationFn: () =>
      apiFetch<Note>(`/customers/${id}/notes`, {
        method: 'POST',
        token,
        body: JSON.stringify({ content: noteContent }),
      }),
    onSuccess: () => {
      setNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
      setFormError(null);
    },
    onError: (err) =>
      setFormError(
        err instanceof ApiRequestError ? err.message : 'Note failed',
      ),
  });

  function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    updateMutation.mutate();
  }

  if (customerQuery.isLoading) {
    return <p className="text-gray-500">Loading customer...</p>;
  }

  if (customerQuery.isError || !customer) {
    return (
      <Alert>
        {customerQuery.error instanceof Error
          ? customerQuery.error.message
          : 'Customer not found'}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{customer.name}</h1>
        <Link href="/customers" className="text-sm text-blue-600 hover:underline">
          Back to list
        </Link>
      </div>

      {formError && <Alert>{formError}</Alert>}

      <form
        onSubmit={handleUpdate}
        className="space-y-3 rounded border bg-white p-4"
      >
        <h2 className="font-medium">Edit customer</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>

      <div className="space-y-2 rounded border bg-white p-4">
        <h2 className="font-medium">Assign to user</h2>
        <select
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Select user...</option>
          {usersQuery.data?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
        <Button
          disabled={!assigneeId || assignMutation.isPending}
          onClick={() => {
            setFormError(null);
            assignMutation.mutate();
          }}
        >
          {assignMutation.isPending ? 'Assigning...' : 'Assign'}
        </Button>
      </div>

      <div className="space-y-3 rounded border bg-white p-4">
        <h2 className="font-medium">Notes</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!noteContent.trim()) return;
            setFormError(null);
            noteMutation.mutate();
          }}
          className="flex gap-2"
        >
          <Input
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add a note..."
          />
          <Button type="submit" disabled={noteMutation.isPending}>
            Add
          </Button>
        </form>
        {notesQuery.isLoading && (
          <p className="text-sm text-gray-500">Loading notes...</p>
        )}
        <ul className="space-y-2">
          {notesQuery.data?.map((note) => (
            <li key={note.id} className="rounded border bg-gray-50 p-3 text-sm">
              <p>{note.content}</p>
              <p className="mt-1 text-xs text-gray-500">
                {note.createdBy.name} ·{' '}
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
          {notesQuery.data?.length === 0 && (
            <p className="text-sm text-gray-500">No notes yet</p>
          )}
        </ul>
      </div>

      <Button
        variant="danger"
        disabled={deleteMutation.isPending}
        onClick={() => {
          if (confirm('Soft delete this customer?')) {
            setFormError(null);
            deleteMutation.mutate();
          }
        }}
      >
        {deleteMutation.isPending ? 'Deleting...' : 'Delete customer'}
      </Button>
    </div>
  );
}
