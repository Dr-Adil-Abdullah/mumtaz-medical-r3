import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * ExpandableCard — Luxury Minimalism + Progressive Disclosure
 *
 * A reusable accordion-style card component that shows only core fields by default
 * and smoothly reveals additional details on click.
 *
 * Usage:
 *   <ExpandableCard
 *     primary="Paracetamol 500mg"        // Bold name (always visible)
 *     secondary="Rs. 120"                // Key number (always visible)
 *     tertiary="Stock: 45"               // Optional third field (always visible)
 *     icon={<PackageIcon />}             // Optional icon
 *     badge={<Badge>Healthy</Badge>}     // Optional badge
 *     expandedId={expandedId}            // Controlled expanded state (optional)
 *     id="product-123"                   // Unique ID for accordion behavior
 *     onToggle={(id) => setExpandedId(id)} // Toggle handler for accordion
 *   >
 *     <div>Batch: ABC123</div>
 *     <div>Expiry: 2025-12-31</div>
 *     <div>Company: Searle</div>
 *   </ExpandableCard>
 */
export default function ExpandableCard({
  primary,
  secondary,
  tertiary,
  icon,
  badge,
  children,
  id,
  expandedId,
  onToggle,
  onContextMenu,
  className = '',
  expanded = false,
  onClick,
  rightSlot,
  compact = false,
}) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Controlled vs uncontrolled expansion
  const isControlled = onToggle && expandedId !== undefined;
  const isExpanded = isControlled ? expandedId === id : internalExpanded;

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, isExpanded]);

  const handleToggle = useCallback(() => {
    if (isControlled) {
      onToggle(isExpanded ? null : id);
    } else {
      setInternalExpanded((prev) => !prev);
    }
    onClick?.();
  }, [isControlled, isExpanded, id, onToggle, onClick]);

  return (
    <div
      className={`
        group relative cursor-pointer select-none
        rounded-2xl border border-white/[0.06]
        bg-gradient-to-br from-white/[0.04] to-white/[0.01]
        backdrop-blur-sm
        transition-all duration-300 ease-out
        hover:border-white/[0.12] hover:from-white/[0.06] hover:to-white/[0.02]
        ${isExpanded ? 'border-white/[0.1] shadow-lg shadow-black/10' : 'shadow-sm'}
        ${compact ? 'px-4 py-3' : 'px-5 py-4'}
        ${className}
      `}
      onClick={handleToggle}
      onContextMenu={onContextMenu}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
      }}
      aria-expanded={isExpanded}
    >
      {/* Main row — always visible */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Icon slot */}
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-slate-400 transition-colors group-hover:text-slate-300">
            {icon}
          </div>
        )}

        {/* Primary + secondary content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className={`font-bold text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
              {primary}
            </span>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
            {secondary && (
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-brand-300/80`}>
                {secondary}
              </span>
            )}
            {secondary && tertiary && (
              <span className="text-slate-600">•</span>
            )}
            {tertiary && (
              <span className={`${compact ? 'text-xs' : 'text-xs'} text-slate-500`}>
                {tertiary}
              </span>
            )}
          </div>
        </div>

        {/* Right slot (e.g., action button) */}
        {rightSlot && (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {rightSlot}
          </div>
        )}

        {/* Expand indicator */}
        <div
          className={`
            shrink-0 flex h-7 w-7 items-center justify-center rounded-lg
            bg-white/[0.04] text-slate-500
            transition-all duration-300
            group-hover:bg-white/[0.08] group-hover:text-slate-400
            ${isExpanded ? 'rotate-180 text-brand-400 bg-brand-500/10' : ''}
          `}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Expandable detail area */}
      <div
        style={{
          maxHeight: isExpanded ? `${contentHeight + 20}px` : '0px',
          opacity: isExpanded ? 1 : 0,
          transition: 'max-height 300ms ease-out, opacity 250ms ease-out, margin-top 200ms ease-out',
          marginTop: isExpanded ? '16px' : '0px',
          overflow: 'hidden',
        }}
      >
        <div
          ref={contentRef}
          className="border-t border-white/[0.06] pt-4 space-y-2.5"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * DetailRow — Small helper for showing key-value pairs inside expanded content
 */
export function DetailRow({ icon, label, value, highlight = false, action }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-xs text-slate-500">
            {icon}
          </span>
        )}
        <span className="text-sm text-slate-500 whitespace-nowrap">{label}</span>
      </div>
      <div className="flex items-center gap-2 min-w-0 justify-end">
        <span className={`text-sm font-medium truncate ${highlight ? 'text-white' : 'text-slate-300'}`}>
          {value}
        </span>
        {action && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
      </div>
    </div>
  );
}

/**
 * DetailDivider — Thin separator line for expanded sections
 */
export function DetailDivider({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      {label && <span className="text-[10px] uppercase tracking-wider text-slate-600">{label}</span>}
      <div className="flex-1 border-t border-white/[0.04]" />
    </div>
  );
}
