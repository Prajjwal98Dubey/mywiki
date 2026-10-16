const cx =(...c) => c.filter(Boolean).join(' ');

/** Codex-style button. variant: 'normal' | 'primary' | 'quiet'; action: 'default' | 'destructive'. */
export default function Button({ variant = 'normal', action = 'default', className, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cx(
        'cdx-button',
        variant === 'primary' && 'cdx-button--primary',
        variant === 'quiet' && 'cdx-button--quiet',
        action === 'destructive' && 'cdx-button--destructive',
        className,
      )}
      {...props}
    />
  );
}
