import { describe, it, expect } from 'vitest';
import { routes } from './App.jsx';
import { RESERVED_SLUGS } from './lib/slug.js';

const topLevelStaticPaths = (list) =>
  list
    .flatMap((r) => (r.path ? [r.path] : r.children ? topLevelStaticPaths(r.children) : []))
    .map((p) => p.split('/')[0])
    .filter((seg) => seg && !seg.startsWith(':') && seg !== '*');

describe('route table', () => {
  it('reserves every top-level app route so no page slug can shadow it (PROJECT_SPEC §6.4)', () => {
    for (const seg of topLevelStaticPaths(routes)) {
      expect(RESERVED_SLUGS.has(seg), `"${seg}" must be in RESERVED_SLUGS and the spec`).toBe(true);
    }
  });
});
