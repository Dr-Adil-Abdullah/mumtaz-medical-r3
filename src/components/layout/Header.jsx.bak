import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { navItems } from '../../constants/navigation';
import { db } from '../../db/index';
import OfflineBadge from './OfflineBadge';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import GlobalSearchModal from '../shared/GlobalSearchModal';
import ConnectionStatusBadge from '../shared/ConnectionStatusBadge';
import { ROLE_BADGE_STYLES, ROLE_LABELS } from '../../constants/roles';
import { useAuthStore } from '../../store/authStore';
import { applyThemeMode, getStoredThemeMode, persistThemeMode } from '../../utils/theme';

export default function Header({ settings, user, onLogout, onMenuToggle, mobileNavOpen = false }) {
  const location = useLocation();
  const updateOwnPin = useAuthStore((state) => state.updateOwnPin);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [savingPin, setSavingPin] = useState(false);
  const [theme, setTheme] = useState('dark');
  const openSession = useLiveQuery(async () => {
    const sessions = await db.day_sessions.where('status').equals('open').toArray();
    return sessions[0] ?? null;
  }, []);
  const pendingReturnCount = useLiveQuery(
    async () => {
      const rows = await db.sales.toArray();
      return rows.filter((sale) => sale.is_return === true && sale.approval_status !== 'approved').length;
    },
    []
  );
  const canApproveReturns = ['owner', 'super_admin'].includes(user?.role);
  const tempBypass = user?.staff_id === 'TEMP-ADMIN';

  useEffect(() => {
    if (!settings) return;
    const storedMode = getStoredThemeMode();
    const resolvedMode = storedMode || settings.theme_default_mode || 'dark';
    setTheme((current) => (current === resolvedMode ? current : resolvedMode));
  }, [settings?.theme_default_mode]);

  useEffect(() => {
    if (!settings) return;
    applyThemeMode(theme, settings);
    persistThemeMode(theme);
  }, [theme, settings]);

  const page = useMemo(
    () => navItems.find((item) => location.pathname.startsWith(item.path)) ?? navItems[0],
    [location.pathname]
  );

  // Keyboard shortcut: Ctrl/Cmd + K to open search
  const handleKeyDown = useCallback((event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      setSearchOpen((prev) => !prev);
    }
    if (event.key === 'Escape') {
      setSearchOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function resetPinModal() {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setPinSuccess('');
    setSavingPin(false);
  }

  async function handlePinSubmit(event) {
    event.preventDefault();
    setPinError('');
    setPinSuccess('');
    setSavingPin(true);

    try {
      await updateOwnPin({ currentPin, newPin, confirmPin });
      setPinSuccess('Your PIN has been changed successfully.');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      setPinError(error.message || 'PIN could not be changed.');
    } finally {
      setSavingPin(false);
    }
  }

  return (
    <>
      <header className="glass panel-elevated sticky top-3 z-20 mb-5 rounded-[30px] px-4 py-4 sm:px-5 lg:top-6 lg:mb-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onMenuToggle}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-slate-200 transition hover:bg-white/10 lg:hidden"
                aria-label="Toggle navigation"
              >
                {mobileNavOpen ? '✕' : '☰'}
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-300">{settings?.shop_name ?? 'Mumtaz Medical'}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-2xl font-bold text-white">{page.label}</h1>
                  <span className="hidden text-slate-400 md:inline">{page.description}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {user?.mustChangePin ? (
                <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-100">PIN change pending</Badge>
              ) : null}
              <Badge className={openSession ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-500/30 bg-slate-500/10 text-slate-200'}>
                {openSession ? 'Day Open' : 'Day Closed'}
              </Badge>
              {tempBypass ? (
                <Badge className="border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-100">Temporary admin bypass</Badge>
              ) : null}
              <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-200">Local-only mode</Badge>
              {canApproveReturns && (pendingReturnCount ?? 0) > 0 ? (
                <Link to="/return-approvals">
                  <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-100">
                    {pendingReturnCount} pending return approval{pendingReturnCount === 1 ? '' : 's'}
                  </Badge>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 xl:justify-end">
            {/* ── Search Button ── */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group relative inline-flex h-11 items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 text-slate-400 transition-all duration-200 hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-brand-300"
              aria-label="Global Search"
              title="Search (Ctrl+K)"
            >
              {/* Magnifying glass icon with a subtle circular ring */}
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/[0.08] transition-all duration-200 group-hover:bg-brand-500/15 group-hover:ring-brand-400/20">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <span className="hidden text-sm font-medium sm:inline">Search</span>
              <kbd className="hidden rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-slate-500 md:inline">⌘K</kbd>
            </button>

            <OfflineBadge />
            <ConnectionStatusBadge />
            <Button variant="secondary" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </Button>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <span className="font-semibold text-white">{user.name}</span>
              <span className="mx-2 text-slate-500">•</span>
              <span className="uppercase tracking-wide text-brand-300">{ROLE_LABELS[user.role] ?? user.role}</span>
              {user.isEmergency ? <span className="ml-2 text-fuchsia-300">⚡</span> : null}
            </div>
            <Badge className={ROLE_BADGE_STYLES[user.role] ?? 'border-white/10 bg-white/5 text-white'}>
              {ROLE_LABELS[user.role] ?? user.role}
            </Badge>
            {!user.isEmergency ? (
              <Button
                variant="secondary"
                onClick={() => {
                  resetPinModal();
                  setPinModalOpen(true);
                }}
              >
                Change PIN
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* ── Global Search Modal ── */}
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Modal
        open={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          resetPinModal();
        }}
        title="Change your PIN"
        size="sm"
      >
        <form className="space-y-4" onSubmit={handlePinSubmit}>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
            Update the PIN for <span className="font-semibold text-white">{user?.name}</span>. Your current PIN is required,
            and weak patterns like 1111 or 1234 are blocked.
          </div>

          <Input
            label="Current PIN"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={currentPin}
            onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
          />
          <Input
            label="New PIN"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={newPin}
            onChange={(event) => setNewPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
          />
          <Input
            label="Confirm new PIN"
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={confirmPin}
            onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
          />

          {pinError ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">{pinError}</div> : null}
          {pinSuccess ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              {pinSuccess}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={savingPin || currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4}>
              {savingPin ? 'Updating...' : 'Update PIN'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPinModalOpen(false);
                resetPinModal();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
