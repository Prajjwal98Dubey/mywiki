import { getProviders, oauthStartUrl } from '../../api/auth.js';
import { useResource } from '../../hooks/useResource.js';
import Icon from '../ui/Icon.jsx';

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="size-[18px] shrink-0" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// Provider logos; any provider without one gets a generic icon, so new providers need no other client change.
const LOGOS = { google: GoogleLogo };

/**
 * "Continue with …" buttons for every provider the server has configured (PROJECT_SPEC §7.2.1).
 * Renders nothing while loading, on error, or when no providers are configured.
 */
export default function OAuthButtons({ returnTo = '/' }) {
  const { data } = useResource((signal) => getProviders(signal).catch(() => ({ providers: [] })), []);
  const providers = data?.providers ?? [];
  if (providers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {providers.map((p) => {
          const Logo = LOGOS[p.id];
          return (
            // A plain link: the server redirects the whole page to the provider and back.
            <a key={p.id} href={oauthStartUrl(p.id, returnTo)} className="app-btn app-btn-secondary w-full gap-3 font-semibold">
              {Logo ? <Logo /> : <Icon name="user" size={16} />}
              Continue with {p.name}
            </a>
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-xs font-medium tracking-wide text-app-muted uppercase" role="separator">
        <span className="h-px flex-1 bg-app-border" />
        or with email
        <span className="h-px flex-1 bg-app-border" />
      </div>
    </div>
  );
}
