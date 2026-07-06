import { Suspense, lazy, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/index';
import { ensureCoreData, seedInitialData } from './db/seed';
import { useAuthStore } from './store/authStore';
import { connectionManager } from './utils/connectionManager';
import { syncManager } from './utils/syncManager';

const FirstLaunch = lazy(() => import('./pages/FirstLaunch'));
const Login = lazy(() => import('./pages/Login'));
const AppShell = lazy(() => import('./components/layout/AppShell'));
const ForcePinChangePage = lazy(() => import('./pages/ForcePinChangePage'));

const TEMP_AUTH_BYPASS = true;
const TEMP_ADMIN_USER = {
  id: 'TEMP-SUPER-ADMIN',
  staff_id: 'TEMP-ADMIN',
  name: 'Temporary Super Admin',
  role: 'super_admin',
  short_code: 'SA',
  isEmergency: true,
  mustChangePin: false
};

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-6 py-5 text-sm text-slate-300">
        Preparing Mumtaz Medical...
      </div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const settings = useLiveQuery(() => db.settings.get(1), []);
  const staffCount = useLiveQuery(() => db.staff.count(), []);
  const user = useAuthStore((state) => state.user);
  const currentStaff = useLiveQuery(
    () => {
      if (!user || user.isEmergency || !user.id || typeof user.id !== 'string') return null;
      return db.staff.get(user.id);
    },
    [user?.id, user?.isEmergency]
  );

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        await ensureCoreData();
        
        // Start smart connection monitoring
        connectionManager.startMonitoring(30000);
        
        // Start automatic sync system
        syncManager.startAutoSync();
        
        // Do an initial quick sync attempt
        setTimeout(() => {
          if (connectionManager.internetOnline) {
            connectionManager.quickSyncAttempt();
          }
        }, 2000);

        if (active) setReady(true);
      } catch (error) {
        console.error('Boot error:', error);
        if (active) setReady(true);
      }
    }

    boot();

    return () => {
      active = false;
      connectionManager.stopMonitoring();
    };
  }, []);

  if (!ready) {
    return <LoadingScreen />;
  }

  if (TEMP_AUTH_BYPASS) {
    const effectiveUser = user || TEMP_ADMIN_USER;
    if (!user) {
      useAuthStore.getState().setUser(TEMP_ADMIN_USER);
    }
    return <AppShell />;
  }

  if (!settings || staffCount === 0) {
    return <FirstLaunch />;
  }

  if (!user) {
    return <Login />;
  }

  if (user.mustChangePin) {
    return <ForcePinChangePage />;
  }

  return <AppShell />;
}
