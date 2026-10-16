import { useMemo } from 'react';
import { createAnchorFactory, buildTocTree } from '../../lib/headings.js';
import { humanizeSlug, slugify } from '../../lib/slug.js';
import { parseBlocks } from '../../lib/wikitext/parser.js';
import { buildReferenceList, numberCitations } from '../../lib/wikitext/citations.js';
import { isSafeExternalUrl } from '../../lib/wikitext/parser.js';
import { WikiContext } from '../wikitext/WikiContext.js';
import { WikiNodes } from '../wikitext/WikiText.jsx';
import InternalLink from '../wikitext/InternalLink.jsx';
import ExternalLink from '../wikitext/ExternalLink.jsx';
import PageFrame from '../layout/PageFrame.jsx';
import Infobox from './Infobox.jsx';
import SectionHeading from './SectionHeading.jsx';
import References from './References.jsx';
import Categories from './Categories.jsx';
import PageTabs from './PageTabs.jsx';

/** Parses everything once and numbers citations in reading order (lead, then sections). */
function useArticleModel(page) {
  return useMemo(() => {
    const lead = parseBlocks(page.lead);
    const sections = (page.sections || []).map((s) => ({ ...s, nodes: parseBlocks(s.content) }));
    const references = page.references || [];
    const citeMap = numberCitations([lead, ...sections.map((s) => s.nodes)], references);
    const refEntries = buildReferenceList(references, citeMap);
    // Entries are titles ("John Doe") or slugs ("john-doe-1rqdasr3r"); slug-shaped ones get a readable label.
    const seeAlso = (page.seeAlso || [])
      .map((entry) => {
        const text = String(entry ?? '').trim();
        const slug = slugify(text);
        return { slug, label: text === slug ? humanizeSlug(slug) : text };
      })
      .filter((e) => e.slug);
    const externalLinks = (page.externalLinks || []).filter((l) => isSafeExternalUrl(l.url));

    const anchor = createAnchorFactory();
    const headings = [];
    for (const s of sections) {
      s.anchor = anchor(s.heading);
      headings.push({ id: s.anchor, text: s.heading, level: s.level === 3 ? 3 : 2 });
    }
    const extraAnchors = {};
    const addExtra = (key, text) => {
      extraAnchors[key] = anchor(text);
      headings.push({ id: extraAnchors[key], text, level: 2 });
    };
    if (seeAlso.length) addExtra('seeAlso', 'See also');
    if (refEntries.length) addExtra('references', 'References');
    if (externalLinks.length) addExtra('externalLinks', 'External links');

    return {
      lead,
      sections,
      refEntries,
      seeAlso,
      externalLinks,
      extraAnchors,
      toc: buildTocTree(headings),
      referenceMap: new Map(references.map((r) => [r.id, r])),
    };
  }, [page]);
}

/**
 * Pure article renderer, shared by the article page, revision view and wizard preview.
 * mode: 'live' | 'revision' | 'preview'. In preview mode links are inert and there is no TOC/tabs.
 * editSectionHref(sectionId) → URL for [edit] links (owner, live mode only).
 */
export default function Article({
  page,
  linkStatus = {},
  canEdit = false,
  mode = 'live',
  editSectionHref,
  tabs,
  notice,
  now,
}) {
  const model = useArticleModel(page);
  const ctx = useMemo(
    () => ({ linkStatus: linkStatus || {}, mode, references: model.referenceMap }),
    [linkStatus, mode, model.referenceMap],
  );
  const isPreview = mode === 'preview';
  const showEdit = canEdit && mode === 'live' && editSectionHref;

  const body = (
    <div className={`mw-content${isPreview ? ' is-preview' : ''}`} lang="en">
      {notice}
      <Infobox infobox={page.infobox} title={page.title} now={now} />
      <WikiNodes nodes={model.lead} />

      {model.sections.map((s) => (
        <section key={s.id} aria-labelledby={s.anchor} className="contents">
          <SectionHeading id={s.anchor} level={s.level} editTo={showEdit ? editSectionHref(s.id) : undefined}>
            {s.heading}
          </SectionHeading>
          <WikiNodes nodes={s.nodes} />
        </section>
      ))}

      {model.seeAlso.length > 0 && (
        <>
          <SectionHeading id={model.extraAnchors.seeAlso} level={2}>
            See also
          </SectionHeading>
          <ul>
            {model.seeAlso.map(({ slug, label }) => (
              <li key={slug}>
                <InternalLink slug={slug} title={label}>
                  {label}
                </InternalLink>
              </li>
            ))}
          </ul>
        </>
      )}

      {model.refEntries.length > 0 && (
        <>
          <SectionHeading id={model.extraAnchors.references} level={2}>
            References
          </SectionHeading>
          <References entries={model.refEntries} inert={isPreview} />
        </>
      )}

      {model.externalLinks.length > 0 && (
        <>
          <SectionHeading id={model.extraAnchors.externalLinks} level={2}>
            External links
          </SectionHeading>
          <ul>
            {model.externalLinks.map((l, i) => (
              <li key={i}>
                <ExternalLink url={l.url}>{l.label || l.url}</ExternalLink>
              </li>
            ))}
          </ul>
        </>
      )}

      <Categories categories={page.categories || []} />
    </div>
  );

  if (isPreview) {
    return (
      <WikiContext.Provider value={ctx}>
        <article>
          <div className="mw-page-title mb-2">
            <h1 className="firstHeading">{page.title || <span className="text-wiki-placeholder">Untitled</span>}</h1>
          </div>
          {body}
        </article>
      </WikiContext.Provider>
    );
  }

  return (
    <WikiContext.Provider value={ctx}>
      <PageFrame
        title={page.title}
        tocEntries={model.toc}
        tabs={tabs ?? <PageTabs slug={page.slug} active="read" canEdit={canEdit} />}
      >
        {body}
      </PageFrame>
    </WikiContext.Provider>
  );
}
