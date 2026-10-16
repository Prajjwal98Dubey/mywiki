import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import OAuthButtons from './OAuthButtons.jsx';
import { oauthErrorMessage } from '../../lib/oauthErrors.js';
import { getProviders } from '../../api/auth.js';

vi.mock('../../api/auth.js', async (orig) => ({ ...(await orig()), getProviders: vi.fn() }));

describe('OAuthButtons', () => {
  beforeEach(() => vi.mocked(getProviders).mockReset());

  it('links each configured provider to its start URL, keeping returnTo', async () => {
    vi.mocked(getProviders).mockResolvedValue({ providers: [{ id: 'google', name: 'Google' }] });
    render(<OAuthButtons returnTo="/create?title=Sam Singh" />);
    const link = await screen.findByRole('link', { name: 'Continue with Google' });
    expect(link).toHaveAttribute('href', '/api/auth/oauth/google/start?returnTo=%2Fcreate%3Ftitle%3DSam%20Singh');
  });

  it('shows a generic button for providers without a logo (new providers need no client change)', async () => {
    vi.mocked(getProviders).mockResolvedValue({ providers: [{ id: 'github', name: 'GitHub' }] });
    render(<OAuthButtons />);
    expect(await screen.findByRole('link', { name: 'Continue with GitHub' })).toHaveAttribute('href', '/api/auth/oauth/github/start?returnTo=%2F');
  });

  it('renders nothing when no providers are configured', async () => {
    vi.mocked(getProviders).mockResolvedValue({ providers: [] });
    const { container } = render(<OAuthButtons />);
    await new Promise((r) => setTimeout(r, 0));
    expect(container).toBeEmptyDOMElement();
  });
});

describe('oauthErrorMessage', () => {
  it('maps callback error codes and falls back for unknown ones', () => {
    expect(oauthErrorMessage(null)).toBeNull();
    expect(oauthErrorMessage('oauth_cancelled')).toMatch(/cancelled/);
    expect(oauthErrorMessage('something_new')).toMatch(/couldn’t sign you in/);
  });
});
