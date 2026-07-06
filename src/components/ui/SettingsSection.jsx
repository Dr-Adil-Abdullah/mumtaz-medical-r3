import { useState, useRef, useEffect } from 'react';

/**
 * SettingsSection — Collapsible settings section with luxury minimalism
 * Each section is clickable to expand/collapse details
 */
export default function SettingsSection({
  icon,
  title,
  subtitle,
  summary,
  children,
  defaultOpen = false,
  badge,
  accentColor = 'brand',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      const updateHeight = () => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      };
      updateHeight();
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [children, isOpen]);

  return (
    <div
      className={`
        group rounded-2xl border border-white/[0.06]
        bg-gradient-to-br from-white/[0.03] to-transparent
        transition-all duration-300 ease-out
        ${isOpen ? 'border-white/[0.12] shadow-lg shadow-black/10' : 'hover:border-white/[0.10]'}
        ${className}
      `}
    >
      {/* Header - Always Visible & Clickable */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-5 text-left cursor-pointer transition-colors hover:bg-white/[0.02] rounded-2xl"
        aria-expanded={isOpen}
      >
        {/* Icon */}
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-2xl transition-transform duration-300 group-hover:scale-105">
            {icon}
          </div>
        )}

        {/* Title & Summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
          )}
          {summary && !isOpen && (
            <p className="mt-1 text-sm font-medium text-slate-400 truncate">
              <span className="text-slate-600 mr-1">›</span> {summary}
            </p>
          )}
        </div>

        {/* Expand Indicator */}
        <div
          className={`
            shrink-0 flex h-8 w-8 items-center justify-center rounded-lg
            bg-white/[0.04] text-slate-500
            transition-all duration-300
            group-hover:bg-white/[0.08] group-hover:text-slate-400
            ${isOpen ? 'rotate-180 text-brand-400 bg-brand-500/10' : ''}
          `}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expandable Content */}
      <div
        style={{
          maxHeight: isOpen ? `${contentHeight + 32}px` : '0px',
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 350ms ease-out, opacity 250ms ease-out',
          overflow: 'hidden'
        }}
      >
        <div ref={contentRef} className="px-5 pb-5 pt-2 border-t border-white/[0.06]">
          {children}
        </div>
      </div>
    </div>
  );
}
