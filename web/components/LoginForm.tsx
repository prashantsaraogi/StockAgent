'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LoginFormProps {
  supabaseEnabled: boolean;
  initialError?: string;
  pocPasswordHint?: string;
}

export function LoginForm({
  supabaseEnabled,
  initialError,
  pocPasswordHint,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError ?? '');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (supabaseEnabled) {
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error ?? 'Sign in failed');
          return;
        }
        router.push('/home');
        router.refresh();
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }
      router.push('/home');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {supabaseEnabled && (
        <>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="POC password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </>
      )}

      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary btn-block" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="login-note">
        {supabaseEnabled ? (
          <>
            POC login — no magic link emails. New emails auto-register on first sign-in
            {pocPasswordHint ? (
              <>
                {' '}
                with shared password <code>{pocPasswordHint}</code>.
              </>
            ) : (
              '. Set AUTH_POC_PASSWORD in .env.local.'
            )}
          </>
        ) : (
          'Dev mode — email only, cookie session.'
        )}
      </p>
    </form>
  );
}
