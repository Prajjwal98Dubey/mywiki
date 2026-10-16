import Icon from '../ui/Icon.jsx';

/** Steps across the top. Steps up to `furthest` are clickable; `errorSteps` get a red dot. */
export default function StepIndicator({ steps, current, furthest, errorSteps, onGoTo }) {
  return (
    <nav aria-label="Steps">
      <ol className="m-0 flex list-none gap-1.5 overflow-x-auto p-0 pb-1">
        {steps.map((label, i) => {
          const done = i < current;
          const reachable = i <= furthest;
          const isCurrent = i === current;
          return (
            <li key={label} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={!reachable}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onGoTo(i)}
                className={`group flex w-full min-w-[6.5rem] flex-col gap-2 rounded-xl px-2 py-1.5 text-left transition-colors ${reachable && !isCurrent ? 'hover:bg-app-surface-muted' : ''} disabled:cursor-not-allowed`}
              >
                <span className={`h-1 w-full rounded-full ${isCurrent || done ? 'bg-app-accent' : 'bg-app-border'}`} />
                <span className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-semibold ${
                      isCurrent ? 'bg-app-accent text-app-on-accent' : done ? 'bg-app-accent-soft text-app-accent' : 'bg-app-surface-muted text-app-muted'
                    }`}
                  >
                    {done && !errorSteps.has(i) ? <Icon name="check" size={11} /> : i + 1}
                  </span>
                  <span className={`truncate ${isCurrent ? 'font-semibold text-app-ink' : 'text-app-muted'}`}>{label}</span>
                  {errorSteps.has(i) && i !== current && <span className="size-1.5 shrink-0 rounded-full bg-app-danger" aria-label="has errors" />}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
