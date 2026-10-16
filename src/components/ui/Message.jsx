import Icon from './Icon.jsx';

const STYLES = {
  notice: { box: 'bg-wiki-subtle border-wiki-border-subtle', icon: 'info', color: 'text-wiki-subtle-text' },
  warning: { box: 'bg-wiki-warning-subtle border-wiki-border-warning', icon: 'alert', color: 'text-wiki-border-warning' },
  error: { box: 'bg-wiki-error-subtle border-wiki-border-error', icon: 'alert', color: 'text-wiki-destructive' },
  success: { box: 'bg-wiki-success-subtle border-wiki-border-success', icon: 'check', color: 'text-wiki-success' },
};

/** Codex-style message box. */
export default function Message({ type = 'notice', children, className = '', role }) {
  const s = STYLES[type];
  return (
    <div
      className={`flex items-start gap-3 rounded-[2px] border px-3 py-2 text-sm ${s.box} ${className}`}
      role={role ?? (type === 'error' ? 'alert' : 'status')}
    >
      <Icon name={s.icon} size={18} className={`mt-0.5 ${s.color}`} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
