'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiRequestError, apiFetch } from '@/lib/api';
import type { Customer, Note, UserListItem } from '@/lib/types';
import { useAuth } from '@/providers/auth-provider';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

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
      toast.success('Customer updated');
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Update failed';
      setFormError(msg);
      toast.error(msg);
    },
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
      toast.success('Customer assigned');
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Assign failed';
      setFormError(msg);
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/customers/${id}`, { method: 'DELETE', token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted');
      window.location.href = '/customers';
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Delete failed';
      setFormError(msg);
      toast.error(msg);
    },
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
      toast.success('Note added');
    },
    onError: (err) => {
      const msg = err instanceof ApiRequestError ? err.message : 'Note failed';
      setFormError(msg);
      toast.error(msg);
    },
  });

  function handleUpdate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    updateMutation.mutate();
  }

  if (customerQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">{customer.name}</h1>
          <p className="mt-1 text-sm text-text-muted">{customer.email}</p>
        </div>
        <Link
          href="/customers"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Back to list
        </Link>
      </div>

      {formError && <Alert>{formError}</Alert>}

      <Card>
        <form onSubmit={handleUpdate} className="space-y-3">
          <h2 className="font-medium text-text">Edit customer</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Name
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
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
            <label className="mb-1 block text-sm font-medium text-text">
              Phone
            </label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </Card>

      <Card className="space-y-2">
        <h2 className="font-medium text-text">Assign to user</h2>
        <Select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Select user...</option>
          {usersQuery.data?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </Select>
        <Button
          disabled={!assigneeId || assignMutation.isPending}
          onClick={() => {
            setFormError(null);
            assignMutation.mutate();
          }}
        >
          {assignMutation.isPending ? 'Assigning...' : 'Assign'}
        </Button>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-medium text-text">Notes</h2>
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
          <p className="text-sm text-text-muted">Loading notes...</p>
        )}
        <ul className="space-y-2">
          {notesQuery.data?.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border border-border bg-surface-muted p-3 text-sm"
            >
              <p className="text-text">{note.content}</p>
              <p className="mt-1 text-xs text-text-muted">
                {note.createdBy.name} ·{' '}
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
          {notesQuery.data?.length === 0 && (
            <p className="text-sm text-text-muted">No notes yet</p>
          )}
        </ul>
      </Card>

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
