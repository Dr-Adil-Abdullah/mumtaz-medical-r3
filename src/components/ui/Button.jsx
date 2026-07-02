export default function Button({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  ...props
}) {
  const variants = {
    primary:
      'border border-[color:var(--button-primary-border)] bg-[color:var(--button-primary-bg)] text-[color:var(--button-primary-text)] shadow-[0_14px_30px_rgba(14,165,233,0.18)] hover:translate-y-[-1px] hover:bg-[color:var(--button-primary-hover)]',
    secondary:
      'border border-[color:var(--button-secondary-border)] bg-[color:var(--button-secondary-bg)] text-[color:var(--button-secondary-text)] hover:translate-y-[-1px] hover:bg-[color:var(--button-secondary-hover)]',
    ghost:
      'border border-transparent bg-transparent text-[color:var(--button-ghost-text)] hover:bg-[color:var(--button-ghost-hover)]',
    danger:
      'border border-rose-500/20 bg-rose-500 text-white shadow-[0_14px_30px_rgba(244,63,94,0.18)] hover:translate-y-[-1px] hover:bg-rose-400'
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-[color:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
