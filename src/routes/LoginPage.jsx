import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { USE_FIXTURES } from '../api/client.js';
import { applyServerErrors, loginSchema, safeReturnTo } from '../lib/validation.js';
import AuthShell from '../components/app/AuthShell.jsx';
import OAuthButtons from '../components/app/OAuthButtons.jsx';
import { oauthErrorMessage } from '../lib/oauthErrors.js';
import { AppAlert, AppField, AppInput, PasswordInput } from '../components/app/forms.jsx';

export default function LoginPage() {
  useDocumentTitle('Log in');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = safeReturnTo(params.get('returnTo'));
  // Errors from the OAuth callback arrive as ?error=<code> (PROJECT_SPEC §7.2.1).
  const [formError, setFormError] = useState(() => oauthErrorMessage(params.get('error')));
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  if (user && !isSubmitting) return <Navigate to={returnTo} replace />;

  const onSubmit = async (values) => {
    setFormError(null);
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(returnTo, { replace: true });
    } catch (err) {
      if (err.code === 'UNAUTHENTICATED') setFormError('That email and password don’t match. Please try again.');
      else if (err.code === 'RATE_LIMITED') setFormError('Too many attempts. Please wait a few minutes and try again.');
      else if (!applyServerErrors(err, setError, ['email', 'password'])) setFormError(err.message);
    }
  };

  const qs = params.get('returnTo') ? `?returnTo=${encodeURIComponent(returnTo)}` : '';

  return (
    <AuthShell title="Welcome back" subtitle="Log in to edit your pages and publish new ones.">
      <div className="space-y-4">
        <OAuthButtons returnTo={returnTo} />
        {params.get('returnTo') && !formError && <AppAlert type="info">Please log in to continue.</AppAlert>}
        {USE_FIXTURES && (
          <AppAlert type="info">
            Mock API: use <code>demo@mywiki.local</code> with any password.
          </AppAlert>
        )}
        {formError && <AppAlert>{formError}</AppAlert>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <AppField label="Email" error={errors.email?.message}>
            <AppInput type="email" autoComplete="email" placeholder="you@example.com" autoFocus {...register('email')} />
          </AppField>
          <AppField label="Password" error={errors.password?.message}>
            <PasswordInput autoComplete="current-password" placeholder="Your password" {...register('password')} />
          </AppField>
          <button type="submit" className="app-btn app-btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="pt-2 text-center text-sm text-app-muted">
          New to MyWiki?{' '}
          <Link to={`/register${qs}`} className="font-semibold text-app-accent hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
