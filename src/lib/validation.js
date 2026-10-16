import { z } from 'zod';

// Mirrors the server rules in PROJECT_SPEC §6.1 / §7.2.
export const usernameSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_]{3,30}$/, 'Use 3–30 letters, numbers or underscores.');

export const emailSchema = z.string().trim().min(1, 'Enter your email address.').email('Enter a valid email address.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
});

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: z.string().min(8, 'Use at least 8 characters.').max(200, 'Use at most 200 characters.'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The passwords you entered do not match.',
  });

/** Only allow same-site relative paths as login redirects. */
export function safeReturnTo(value, fallback = '/') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  return value;
}

/** Copies server `details` ([{ path, message }]) onto react-hook-form fields. Returns true if any matched. */
export function applyServerErrors(err, setError, fields) {
  let matched = false;
  if (Array.isArray(err?.details)) {
    for (const d of err.details) {
      const name = String(d.path ?? '');
      if (fields.includes(name)) {
        setError(name, { type: 'server', message: d.message });
        matched = true;
      }
    }
  }
  return matched;
}
