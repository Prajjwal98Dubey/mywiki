import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { Link, useBlocker, useNavigate } from 'react-router';
import { createPage, updatePage, updatePageSettings, clearSummaryCache } from '../../api/pages.js';
import { visibilityOf } from '../../lib/visibility.js';
import { clearDraft, draftKey, readDraft, useDraftAutosave } from '../../hooks/useDraftAutosave.js';
import { formatDateTime } from '../../lib/dates.js';
import { draftToInput } from '../../lib/pageDraft.js';
import { pageResolver, STEP_FIELDS, stepForPath } from '../../lib/pageValidation.js';
import { pagePath } from '../../lib/slug.js';
import { AppAlert } from '../app/forms.jsx';
import Dialog from '../ui/Dialog.jsx';
import Icon from '../ui/Icon.jsx';
import StepIndicator from './StepIndicator.jsx';
import WizardPreview from './WizardPreview.jsx';
import BasicsStep from './steps/BasicsStep.jsx';
import InfoboxStep from './steps/InfoboxStep.jsx';
import IntroStep from './steps/IntroStep.jsx';
import SectionsStep from './steps/SectionsStep.jsx';
import ReferencesStep from './steps/ReferencesStep.jsx';
import ReviewStep from './steps/ReviewStep.jsx';

const STEPS = ['Basics', 'Photo & infobox', 'Introduction', 'Sections', 'References & extras', 'Review & publish'];
const STEP_INTROS = [
  'Who is this page about?',
  'The summary box on the right side of the page.',
  'The opening paragraphs, before any heading.',
  'The main body of the article, split into headings.',
  'Sources, related pages, links and categories.',
  'Check everything, then publish.',
];
const LAST = STEPS.length - 1;

function DraftBanner({ draft, onRestore, onDiscard }) {
  return (
    <AppAlert type="info" className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>You have an unsaved draft from {formatDateTime(draft.savedAt)}.</span>
        <span className="flex gap-2">
          <button type="button" className="app-btn app-btn-primary app-btn-sm h-8" onClick={onRestore}>
            Restore
          </button>
          <button type="button" className="app-btn app-btn-secondary app-btn-sm h-8" onClick={onDiscard}>
            Discard
          </button>
        </span>
      </div>
    </AppAlert>
  );
}

/**
 * Six-step page editor (FRONTEND_PLAN §6).
 * mode 'create' | 'edit'. In edit mode pass slug, baseRevisionId and onReloadLatest (refetch + remount).
 */
export default function Wizard({ mode, initialValues, slug, baseRevisionId: initialBase, initialStep = 0, focusSectionId, onReloadLatest }) {
  const navigate = useNavigate();
  const key = draftKey(mode === 'edit' ? slug : null);
  const methods = useForm({ defaultValues: initialValues, resolver: pageResolver, mode: 'onSubmit', reValidateMode: 'onChange' });
  const { control, formState, handleSubmit, reset, trigger, setError, setValue } = methods;
  const values = useWatch({ control });

  const [step, setStep] = useState(initialStep);
  const [furthest, setFurthest] = useState(mode === 'edit' ? LAST : initialStep);
  const [baseRevisionId, setBaseRevisionId] = useState(initialBase);
  const [showPreview, setShowPreview] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [conflict, setConflict] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const allowLeave = useRef(false);
  const topRef = useRef(null);

  // Offer to restore a saved draft that differs from what we opened with.
  const [pendingDraft, setPendingDraft] = useState(() => {
    const d = readDraft(key);
    return d && JSON.stringify(d.values) !== JSON.stringify(initialValues) ? d : null;
  });
  const { savedAt } = useDraftAutosave(key, values, {
    enabled: !pendingDraft && formState.isDirty && !publishing,
    extra: { baseRevisionId },
  });

  const goTo = useCallback((i) => {
    setStep(i);
    setFurthest((f) => Math.max(f, i));
    setShowPreview(false);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }, []);

  // Leave guard: the draft is autosaved, but confirm before navigating away mid-edit.
  const dirty = formState.isDirty && !publishing;
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !allowLeave.current && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const errorSteps = new Set(Object.keys(formState.errors).map(stepForPath));

  const next = async () => {
    const ok = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (ok) goTo(step + 1);
  };

  const publish = async (data, base = baseRevisionId) => {
    setServerError(null);
    setPublishing(true);
    const { editSummary, visibility, ...input } = draftToInput(data);
    try {
      const res =
        mode === 'edit'
          ? await updatePage(slug, { ...input, editSummary, baseRevisionId: base })
          : await createPage({ ...input, visibility });
      // Visibility is a page setting (PROJECT_SPEC §6.5): PUT ignores it, so apply changes separately.
      let visibilityFailed = false;
      if (visibilityOf(res.page) !== visibility) {
        try {
          await updatePageSettings(res.page.slug, { visibility });
        } catch {
          visibilityFailed = true;
        }
      }
      clearDraft(key);
      clearSummaryCache(res.page.slug);
      allowLeave.current = true;
      navigate(pagePath(res.page.slug), { state: visibilityFailed ? { visibilityFailed: visibility } : undefined });
    } catch (err) {
      setPublishing(false);
      if (err.code === 'EDIT_CONFLICT') {
        setConflict({ currentRevisionId: err.details?.currentRevisionId, data });
      } else if (err.code === 'VALIDATION_ERROR' && Array.isArray(err.details) && err.details.length) {
        for (const d of err.details) setError(String(d.path), { type: 'server', message: d.message });
        setServerError('The server found a problem with the page. Fix the highlighted fields and try again.');
        goTo(stepForPath(err.details[0].path));
      } else if (err.code === 'UNAUTHENTICATED') {
        setServerError('Your session has expired. Log in again in another tab, then publish — your draft is saved.');
      } else {
        setServerError(err.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const onInvalid = (errors) => {
    const first = Math.min(...Object.keys(errors).map(stepForPath));
    if (first !== step) goTo(first);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (step < LAST) next();
    else handleSubmit((d) => publish(d), onInvalid)(e);
  };

  const stepContent = [
    <BasicsStep key="basics" mode={mode} slug={slug} />,
    <InfoboxStep key="infobox" />,
    <IntroStep key="intro" />,
    <SectionsStep key="sections" focusSectionId={focusSectionId} />,
    <ReferencesStep key="refs" />,
    <ReviewStep key="review" mode={mode} steps={STEPS} onGoTo={goTo} serverError={serverError} />,
  ][step];

  return (
    <FormProvider {...methods}>
      <div ref={topRef} className="mx-auto max-w-[90rem] scroll-mt-20 px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="m-0 font-display text-3xl font-medium sm:text-4xl">
              {mode === 'edit' ? (
                <>
                  Editing <em className="text-app-accent">{initialValues.title}</em>
                </>
              ) : (
                'Create a page'
              )}
            </h1>
            <p className="m-0 mt-1 text-app-muted">
              Step {step + 1} of {STEPS.length} · {STEP_INTROS[step]}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-app-muted" aria-live="polite">
            {savedAt && (
              <span className="flex items-center gap-1.5">
                <Icon name="check" size={13} className="text-app-success" /> Draft saved {formatDateTime(savedAt).split(',')[0]}
              </span>
            )}
            {mode === 'edit' && (
              <Link to={pagePath(slug)} className="app-btn app-btn-ghost app-btn-sm">
                Cancel
              </Link>
            )}
          </div>
        </div>

        {pendingDraft && (
          <DraftBanner
            draft={pendingDraft}
            onRestore={() => {
              reset({ ...initialValues, ...pendingDraft.values }); // older drafts may lack newer fields
              if (mode === 'edit' && pendingDraft.baseRevisionId) setBaseRevisionId(pendingDraft.baseRevisionId);
              setPendingDraft(null);
              setFurthest(LAST);
            }}
            onDiscard={() => {
              clearDraft(key);
              setPendingDraft(null);
            }}
          />
        )}

        <div className="mb-8">
          <StepIndicator steps={STEPS} current={step} furthest={furthest} errorSteps={errorSteps} onGoTo={goTo} />
        </div>

        <div className={step === LAST ? '' : 'grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'}>
          <form onSubmit={onSubmit} noValidate className="min-w-0">
            <div className={step === LAST ? '' : 'app-card p-5 sm:p-7'}>{stepContent}</div>

            {step < LAST && (
              <div className="mt-4 xl:hidden">
                <button type="button" className="app-btn app-btn-ghost app-btn-sm" aria-expanded={showPreview} onClick={() => setShowPreview((s) => !s)}>
                  <Icon name={showPreview ? 'collapse' : 'expand'} size={12} /> {showPreview ? 'Hide preview' : 'Show preview'}
                </button>
                {showPreview && <WizardPreview values={values} slug={slug} className="mt-3 max-h-[70vh]" />}
              </div>
            )}

            <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-app-border bg-app-bg/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
              <button type="button" className="app-btn app-btn-secondary" disabled={step === 0} onClick={() => goTo(step - 1)}>
                <Icon name="previous" size={13} /> Back
              </button>
              {step < LAST ? (
                <button type="submit" className="app-btn app-btn-primary">
                  {step === LAST - 1 ? 'Review' : 'Next'} <Icon name="arrowNext" size={14} />
                </button>
              ) : (
                <button type="submit" className="app-btn app-btn-primary" disabled={publishing}>
                  {publishing ? 'Publishing…' : mode === 'edit' ? 'Save changes' : 'Publish page'}
                </button>
              )}
            </div>
          </form>

          {step < LAST && (
            <aside className="hidden min-w-0 xl:block" aria-label="Live preview">
              <div className="sticky top-20">
                <WizardPreview values={values} slug={slug} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {blocker.state === 'blocked' && (
        <Dialog
          variant="app"
          title="Leave this page?"
          onClose={() => blocker.reset()}
          actions={
            <>
              <button type="button" className="app-btn app-btn-secondary app-btn-sm" onClick={() => blocker.reset()}>
                Keep editing
              </button>
              <button type="button" className="app-btn app-btn-primary app-btn-sm" onClick={() => blocker.proceed()}>
                Leave
              </button>
            </>
          }
        >
          <p className="m-0 text-app-muted">Your page isn’t published yet. Your draft is saved in this browser, so you can pick up where you left off.</p>
        </Dialog>
      )}

      {conflict && (
        <Dialog
          variant="app"
          title="This page was changed"
          onClose={() => setConflict(null)}
          actions={
            <>
              <button type="button" className="app-btn app-btn-ghost app-btn-sm" onClick={() => setConflict(null)}>
                Cancel
              </button>
              {onReloadLatest && (
                <button
                  type="button"
                  className="app-btn app-btn-secondary app-btn-sm"
                  onClick={() => {
                    allowLeave.current = true;
                    setConflict(null);
                    onReloadLatest();
                  }}
                >
                  Load latest version
                </button>
              )}
              <button
                type="button"
                className="app-btn app-btn-primary app-btn-sm"
                onClick={() => {
                  const { data, currentRevisionId } = conflict;
                  setConflict(null);
                  setBaseRevisionId(currentRevisionId);
                  setValue('editSummary', data.editSummary);
                  publish(data, currentRevisionId);
                }}
              >
                Save my version
              </button>
            </>
          }
        >
          <p className="m-0 text-app-muted">
            Someone (maybe you, in another tab) saved this page since you started editing. Save your version over it, or
            load the latest version — your draft stays saved in this browser and you can restore it.
          </p>
        </Dialog>
      )}
    </FormProvider>
  );
}
