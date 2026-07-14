import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { navItems } from '../../constants/navigation';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../db/index';
import Button from '../ui/Button';
import GlobalSearchModal from '../shared/GlobalSearchModal';

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const scrollRef = useRef(null);
  const visibleItems = useMemo(() => navItems.filter((item) => item.allowedRoles.includes(user?.role)), [user?.role]);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pendingReturnCount = useLiveQuery(
    async () => {
      const rows = await db.sales.toArray();
      return rows.filter((sale) => sale.is_return === true && sale.approval_status !== 'approved').length;
    },
    []
  );

  useEffect(() => {
    if (!mobileOpen) return;
    onClose();
  }, [location.pathname]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const update = () => {
      setCanScrollUp(container.scrollTop > 8);
      setCanScrollDown(container.scrollTop + container.clientHeight < container.scrollHeight - 8);
    };

    update();
    container.addEventListener('scroll', update);
    window.addEventListener('resize', update);

    return () => {
      container.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [visibleItems.length, mobileOpen]);

  function moveSidebar(direction) {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ top: direction * 220, behavior: 'smooth' });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition lg:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`glass panel-elevated fixed inset-y-3 left-3 z-50 flex w-[min(88vw,320px)] flex-col rounded-[30px] p-4 transition duration-300 lg:sticky lg:top-6 lg:z-20 lg:h-[calc(100vh-3rem)] lg:w-auto lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 opacity-100' : '-translate-x-[112%] opacity-0 lg:opacity-100'
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 rounded-3xl text-left transition hover:opacity-90"
            title="Open global search"
          >
            <div className="brand-icon-ring flex h-14 w-14 items-center justify-center rounded-3xl text-2xl">💊</div>
            <div>
              <p className="text-sm font-semibold text-white">Mumtaz Medical</p>
              <p className="text-xs text-slate-400">Tap here to search everything</p>
            </div>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 lg:hidden"
          >
            Close
          </button>
        </div>

        <div className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-white">Menu navigation</div>
              <div className="mt-1 text-slate-400">Use the buttons to move the sidebar list up or down when needed.</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => moveSidebar(-1)} disabled={!canScrollUp}>
              ↑ Up
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => moveSidebar(1)} disabled={!canScrollDown}>
              ↓ More
            </Button>
          </div>
        </div>

        <nav ref={scrollRef} className="sidebar-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {visibleItems.map((item) => {
            const badgeCount = item.path === '/return-approvals' ? pendingReturnCount ?? 0 : 0;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-3xl px-4 py-3.5 text-sm transition ${
                    isActive
                      ? 'bg-[color:var(--nav-active-bg)] text-[color:var(--nav-active-text)] ring-1 ring-[color:var(--nav-active-ring)] shadow-[0_14px_34px_rgba(14,165,233,0.14)]'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg transition group-hover:bg-white/10">
                  {item.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">{item.label}</div>
                    {badgeCount > 0 ? (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-100">
                        {badgeCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{item.description}</div>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
