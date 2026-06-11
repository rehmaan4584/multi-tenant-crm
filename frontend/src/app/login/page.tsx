'use client';

import { FormEvent, useState } from 'react';
import { ApiRequestError } from '@/lib/api';
import { DEMO_ORG_NAME } from '@/lib/constants';
import { useAuth } from '@/providers/auth-provider';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : 'Login failed',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col bg-sidebar p-10 text-white lg:flex">
  <div>
    <span className="text-xl font-semibold tracking-tight">
      Multi-Tenant CRM
    </span>
  </div>
  <div className="flex flex-1 flex-col items-start justify-center">
    <h1 className="text-3xl font-bold leading-tight">
      Manage customers across your organization
    </h1>
    <p className="mt-4 max-w-md text-slate-300">
      Role-based access, customer assignment, and notes — all scoped to{' '}
      {DEMO_ORG_NAME}.
    </p>
    <p className="mt-6 text-xs text-slate-500">
      Secure multi-tenant workspace for modern teams
    </p>
  </div>
</div>

      <div className="flex flex-1 items-center justify-center bg-surface-muted p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-surface p-8 shadow-lg"
        >
          <div>
            <h1 className="text-xl font-semibold text-text">Sign in</h1>
            <p className="mt-1 text-sm text-text-muted">
              Welcome back to {DEMO_ORG_NAME}
            </p>
          </div>

          {error && <Alert>{error}</Alert>}

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@acme.test"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <button
            type="button"
            onClick={() => setShowDemo((v) => !v)}
            className="w-full text-center text-xs text-text-muted hover:text-text"
          >
            {showDemo ? 'Hide demo credentials' : 'Show demo credentials'}
          </button>
          {showDemo && (
            <p className="rounded-lg bg-surface-muted px-3 py-2 text-xs text-text-muted">
              admin@acme.test / password123
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
