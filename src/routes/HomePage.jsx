import { Link } from 'react-router';
import { countPages, listPages } from '../api/pages.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useResource } from '../hooks/useResource.js';
import { formatNumber } from '../lib/format.js';
import { displayUrl } from '../lib/slug.js';
import ArticleMock from '../components/app/ArticleMock.jsx';
import PageCard from '../components/app/PageCard.jsx';
import Icon from '../components/ui/Icon.jsx';

const STEPS = [
  {
    icon: 'edit',
    title: 'Answer a few questions',
    text: 'A guided form asks for the basics — name, birth date, work, education — one step at a time.',
  },
  {
    icon: 'article',
    title: 'Tell your story',
    text: 'Add an introduction and sections like Early life or Career. Cite sources, link other people.',
  },
  {
    icon: 'globe',
    title: 'Publish and share',
    text: 'Get a page that reads like an encyclopedia entry, at a short link that is yours to share.',
  },
];

const FEATURES = [
  ['Infobox', 'Photo, birth date with age, occupation, education and more — in the familiar side box.'],
  ['Citations', 'Numbered footnotes and a reference list, so every claim can point to a source.'],
  ['Contents', 'A table of contents that follows you as you read, just like the real thing.'],
  ['History', 'Every save is kept. Look back at any version and restore it with one click.'],
];

function Hero({ user, count }) {
  const createHref = user ? '/create' : '/register?returnTo=%2Fcreate';
  return (
    <section className="relative overflow-hidden">
      <div className="app-hero-glow pointer-events-none absolute inset-0" />
      <div className="app-dots pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:pt-20">
        <div className="app-rise min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-app-border bg-app-surface/70 px-3 py-1 text-xs font-medium text-app-ink-soft backdrop-blur">
            <span className="size-1.5 rounded-full bg-app-gold" />
            {user ? `Signed in as ${user.username}` : 'The encyclopedia about you'}
          </span>
          <h1 className="mt-5 mb-0 font-display text-[2.6rem] leading-[1.05] font-medium sm:text-6xl">
            {user ? (
              <>
                Welcome back, <em className="text-app-accent">{user.username}</em>.
              </>
            ) : (
              <>
                Your life story,
                <br />
                written like an <em className="text-app-accent">encyclopedia</em>.
              </>
            )}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-app-muted">
            {user
              ? 'Start a new page, or keep improving the ones you already have.'
              : 'Answer a few guided questions and MyWiki turns them into a polished, Wikipedia-style biography — with an infobox, references and a link you can share.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={createHref} className="app-btn app-btn-primary app-btn-lg">
              {user ? 'Create a new page' : 'Create your page'} <Icon name="arrowNext" size={16} />
            </Link>
            <Link to={user ? '/my-pages' : '/random'} className="app-btn app-btn-secondary app-btn-lg">
              {user ? 'My pages' : 'See an example'}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-app-muted">
            <span className="inline-flex items-center gap-2">
              <Icon name="globe" size={15} className="text-app-accent" />
              <span className="font-mono text-app-ink-soft">{displayUrl('your-name')}</span>
            </span>
            {count != null && (
              <span className="inline-flex items-center gap-2">
                <Icon name="article" size={15} className="text-app-accent" />
                {formatNumber(count)} {count === 1 ? 'page' : 'pages'} published
              </span>
            )}
          </div>
        </div>

        <div className="app-rise relative min-w-0 [animation-delay:120ms]">
          <div className="absolute -inset-4 -z-10 rotate-3 rounded-[2rem] bg-app-accent-soft" />
          <ArticleMock height={460} />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="how-heading">
      <p className="m-0 text-xs font-semibold tracking-[0.2em] text-app-accent uppercase">How it works</p>
      <h2 id="how-heading" className="mt-2 mb-10 max-w-2xl font-display text-4xl leading-tight font-medium">
        From a blank form to a finished article in three steps.
      </h2>
      <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="app-card relative overflow-hidden p-6">
            <span className="absolute -top-4 right-3 font-display text-[5.5rem] leading-none font-semibold text-app-surface-muted select-none">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="relative flex size-11 items-center justify-center rounded-xl bg-app-accent-soft text-app-accent">
              <Icon name={s.icon} size={20} />
            </span>
            <h3 className="relative mt-5 mb-1.5 text-lg font-semibold">{s.title}</h3>
            <p className="relative m-0 text-sm text-app-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="features-heading">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <div>
          <p className="m-0 text-xs font-semibold tracking-[0.2em] text-app-accent uppercase">The real look</p>
          <h2 id="features-heading" className="mt-2 mb-4 font-display text-4xl leading-tight font-medium">
            Looks and reads exactly like an encyclopedia article.
          </h2>
          <p className="m-0 text-app-muted">
            The page you publish uses the same typography, layout and details people already trust — so your story
            gets read the way it deserves.
          </p>
        </div>
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
          {FEATURES.map(([title, text]) => (
            <li key={title} className="rounded-2xl border border-app-border bg-app-surface/60 p-5">
              <div className="flex items-center gap-2 font-semibold">
                <Icon name="check" size={16} className="text-app-success" /> {title}
              </div>
              <p className="m-0 mt-1.5 text-sm text-app-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Recent({ recent }) {
  const pages = recent.data?.pages ?? [];
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="recent-heading">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-semibold tracking-[0.2em] text-app-accent uppercase">Fresh off the press</p>
          <h2 id="recent-heading" className="mt-2 mb-0 font-display text-4xl leading-tight font-medium">
            Recently published
          </h2>
        </div>
        <Link to="/random" className="app-btn app-btn-ghost app-btn-sm">
          Surprise me <Icon name="sparkle" size={14} />
        </Link>
      </div>

      {recent.loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="app-card h-40 animate-pulse bg-app-surface-muted" />
          ))}
        </div>
      )}
      {recent.error && <p className="text-app-danger">Couldn’t load recent pages right now.</p>}
      {recent.data && pages.length === 0 && (
        <div className="app-card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-app-gold-soft text-app-gold">
            <Icon name="sparkle" size={24} />
          </span>
          <h3 className="mt-4 mb-1 font-display text-2xl font-medium">No pages yet</h3>
          <p className="m-0 max-w-sm text-sm text-app-muted">The first page on MyWiki could be yours.</p>
        </div>
      )}
      {pages.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <PageCard key={p.slug} page={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function CallToAction({ user }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <div className="app-noise-dark relative overflow-hidden rounded-[2rem] px-8 py-14 text-center text-white sm:px-16">
        <h2 className="m-0 font-display text-4xl leading-tight font-light sm:text-5xl">
          Every life deserves <em className="text-[#f0c36a]">a page</em>.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-white/70">
          Write yours, or one for a parent, a grandparent or a friend. You can own as many pages as you like.
        </p>
        <Link
          to={user ? '/create' : '/register?returnTo=%2Fcreate'}
          className="app-btn app-btn-lg mt-8 bg-white text-[#11141b] hover:bg-white/90"
        >
          Start writing <Icon name="arrowNext" size={16} />
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  useDocumentTitle(null);
  const { user } = useAuth();
  const count = useResource((signal) => countPages(signal), []);
  const recent = useResource((signal) => listPages({ sort: 'recent', limit: 6 }, signal), []);

  return (
    <>
      <Hero user={user} count={count.data?.count} />
      <HowItWorks />
      <Recent recent={recent} />
      <Features />
      <CallToAction user={user} />
    </>
  );
}
