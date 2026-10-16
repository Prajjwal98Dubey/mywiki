/** Messages for the `?error=` codes the OAuth callback redirects back with. */
export const OAUTH_ERRORS = {
  oauth_cancelled: 'Sign-in was cancelled. You can try again, or use your email and password.',
  oauth_email_unverified: 'Your Google account’s email isn’t verified, so we can’t use it to sign you in.',
  oauth_failed: 'We couldn’t sign you in with that account. Please try again.',
};

/** Message for a callback error code, or null. Unknown codes fall back to the generic failure. */
export const oauthErrorMessage = (code) => (code ? OAUTH_ERRORS[code] ?? OAUTH_ERRORS.oauth_failed : null);
