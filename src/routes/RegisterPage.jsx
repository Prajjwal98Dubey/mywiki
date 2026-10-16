import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { applyServerErrors, registerSchema, safeReturnTo } from '../lib/validation.js';
import AuthShell from '../components/app/AuthShell.jsx';
import OAuthButtons from '../components/app/OAuthButtons.jsx';
import { AppAlert, AppField, AppInput, PasswordInput } from '../components/app/forms.jsx';

const FIELDS = ['username', 'email', 'password', 'confirmPassword'];

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const { user, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = safeReturnTo(params.get('returnTo'), '/create');
  const [formError, setFormError] = useState(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  if (user && !isSubmitting) return <Navigate to={returnTo} replace />;

  const onSubmit = async ({ username, email, password }) => {
    setFormError(null);
    try {
      await registerUser({ username: username.trim(), email: email.trim(), password });
      navigate(returnTo, { replace: true });
    } catch (err) {
      if (err.code === 'USERNAME_TAKEN') setError('username', { type: 'server', message: 'That username is taken. Try another.' });
      else if (err.code === 'EMAIL_TAKEN') setError('email', { type: 'server', message: 'An account with this email already exists. Log in instead — or use Continue with Google if you signed up that way.' });
      else if (err.code === 'RATE_LIMITED') setFormError('Too many attempts. Please wait a few minutes and try again.');
      else if (!applyServerErrors(err, setError, FIELDS)) setFormError(err.message);
    }
  };

  const qs = params.get('returnTo') ? `?returnTo=${encodeURIComponent(returnTo)}` : '';

  return (
    <AuthShell title="Create your account" subtitle="Free, and it takes less than a minute. Your page comes next.">
      <div className="space-y-4">
        <OAuthButtons returnTo={returnTo} />
        {formError && <AppAlert>{formError}</AppAlert>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <AppField label="Username" hint="Shown as the author of your edits." error={errors.username?.message}>
            <AppInput autoComplete="username" placeholder="ram_singh" autoFocus {...register('username')} />
          </AppField>
          <AppField label="Email" hint="Used to log in. Never shown publicly." error={errors.email?.message}>
            <AppInput type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
          </AppField>
          <div className="grid gap-5 sm:grid-cols-2">
            <AppField label="Password" hint="At least 8 characters." error={errors.password?.message}>
              <PasswordInput autoComplete="new-password" placeholder="••••••••" {...register('password')} />
            </AppField>
            <AppField label="Confirm password" error={errors.confirmPassword?.message}>
              <PasswordInput autoComplete="new-password" placeholder="••••••••" {...register('confirmPassword')} />
            </AppField>
          </div>
          <button type="submit" className="app-btn app-btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating your account…' : 'Create account'}
          </button>
        </form>
        <p className="pt-2 text-center text-sm text-app-muted">
          Already have an account?{' '}
          <Link to={`/login${qs}`} className="font-semibold text-app-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
