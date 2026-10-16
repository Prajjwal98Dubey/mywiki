import ArticleMock from './ArticleMock.jsx';
import { displayUrl } from '../../lib/slug.js';

/** Two-column auth layout: form on the left, a showcase panel on the right (lg+). */
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="mx-auto grid max-w-6xl items-stretch gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:py-14">
      <div className="app-rise flex flex-col justify-center">
        <div className="mx-auto w-full max-w-[25rem]">
          <h1 className="m-0 font-display text-4xl leading-tight font-medium">{title}</h1>
          {subtitle && <p className="mt-2 mb-8 text-app-muted">{subtitle}</p>}
          {children}
        </div>
      </div>

      <aside className="app-noise-dark relative hidden overflow-hidden rounded-[2rem] p-10 text-white lg:flex lg:flex-col">
        <p className="m-0 text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">Your page, your link</p>
        <p className="mt-4 mb-0 max-w-md font-display text-[2rem] leading-tight font-light">
          Tell your story once.
          <br />
          <em className="text-[#f0c36a]">Share it everywhere.</em>
        </p>
        <p className="mt-3 max-w-sm text-sm text-white/70">
          Every page gets a clean address like <span className="font-mono text-white">{displayUrl('sam-singh')}</span>.
        </p>
        <div className="relative mt-auto translate-x-6 translate-y-10 rotate-[-2deg] pt-8">
          <ArticleMock height={340} />
        </div>
      </aside>
    </div>
  );
}
