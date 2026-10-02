import { LoginForm } from '@/components/LoginForm';
import { BrandLogo } from '@/components/BrandLogo';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getPocPassword } from '@/lib/supabase/admin';

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabaseEnabled = isSupabaseConfigured();
  const { error } = await searchParams;
  const pocPassword = getPocPassword();

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <BrandLogo size="lg" />
          <h1>Veersa Stock Agent</h1>
          <p>Sign in — framework, StockBook, news, and Ask Agent.</p>
          {supabaseEnabled && <span className="auth-badge">Supabase · POC login</span>}
        </div>
        <LoginForm
          supabaseEnabled={supabaseEnabled}
          initialError={error}
          pocPasswordHint={pocPassword ?? undefined}
        />
      </div>
    </div>
  );
}
