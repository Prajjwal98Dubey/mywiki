import { describe, it, expect, beforeAll } from 'vitest';
import { mockApi } from './mock.js';
import { draftToInput, emptyDraft, pageToDraft } from '../lib/pageDraft.js';
import { validatePage } from '../lib/pageValidation.js';

const call = (path, method = 'GET', body) => mockApi(path, { method, body });

describe('page visibility (PROJECT_SPEC §6.5, mock backend)', () => {
  let slug;
  beforeAll(async () => {
    await call('/auth/login', 'POST', { email: 'demo@mywiki.local', password: 'x' });
    const input = { ...draftToInput({ ...emptyDraft('Zara Unlisted'), visibility: 'unlisted' }) };
    delete input.editSummary;
    ({ page: { slug } } = await call('/pages', 'POST', input));
  });

  it('keeps unlisted pages reachable by URL', async () => {
    const { page } = await call(`/pages/${slug}`);
    expect(page.visibility).toBe('unlisted');
  });

  it('hides unlisted pages from recent, count, search, suggestions and random', async () => {
    const recent = await call('/pages?sort=recent&limit=50');
    expect(recent.pages.map((p) => p.slug)).not.toContain(slug);
    expect((await call('/pages/count')).count).toBe(recent.total);
    expect((await call('/search/suggest?q=zara')).results).toHaveLength(0);
    expect((await call('/search?q=zara')).results).toHaveLength(0);
    for (let i = 0; i < 20; i++) expect((await call('/pages/random')).slug).not.toBe(slug);
  });

  it('still lists it under My pages, with its visibility', async () => {
    const mine = await call('/pages/mine');
    expect(mine.pages.find((p) => p.slug === slug)?.visibility).toBe('unlisted');
  });

  it('makes it discoverable again when switched to public, without a new revision', async () => {
    const before = (await call(`/pages/${slug}`)).page.revisionCount;
    await call(`/pages/${slug}/settings`, 'PATCH', { visibility: 'public' });
    expect((await call('/search/suggest?q=zara')).results.map((r) => r.slug)).toContain(slug);
    expect((await call(`/pages/${slug}`)).page.revisionCount).toBe(before);
  });

  it('rejects "private" until custom access exists', async () => {
    await expect(call(`/pages/${slug}/settings`, 'PATCH', { visibility: 'private' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

describe('visibility in the wizard form model', () => {
  it('defaults to public and treats pages without the field as public', () => {
    expect(emptyDraft().visibility).toBe('public');
    expect(pageToDraft({ title: 'Old page' }).visibility).toBe('public');
    expect(pageToDraft({ title: 'X', visibility: 'unlisted' }).visibility).toBe('unlisted');
  });

  it('only accepts public or unlisted', () => {
    const paths = (v) => validatePage({ ...emptyDraft('A'), visibility: v }).map((i) => i.path.join('.'));
    expect(paths('unlisted')).not.toContain('visibility');
    expect(paths('private')).toContain('visibility');
  });
});
