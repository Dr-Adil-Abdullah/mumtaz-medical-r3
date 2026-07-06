import { Suspense, lazy, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db/index';
import { ensureCoreData, seedInitialData } from './db/seed';
import { useAuthStore } from './store/authStore';

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
      await db.open();

      if (TEMP_AUTH_BYPASS) {
        const currentSettings = await db.settings.get(1);
        const currentStaffCount = await db.staff.count();

        if (!currentSettings || currentStaffCount === 0) {
          await seedInitialData();
        } else {
          await ensureCoreData();
        }
      }

      if (active) setReady(true);
    }

    boot().catch(() => {
      if (active) setReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !TEMP_AUTH_BYPASS) return;
    if (!settings || staffCount === 0) return;
    if (!user) {
      useAuthStore.setState({ user: TEMP_ADMIN_USER });
    }
  }, [ready, settings?.id, staffCount, user]);

  useEffect(() => {
    if (!settings || TEMP_AUTH_BYPASS) return;
    ensureCoreData();
  }, [settings?.id]);

  if (!ready) {
    return <LoadingScreen />;
  }

  if (!settings || staffCount === 0) {
    if (TEMP_AUTH_BYPASS) {
      return <LoadingScreen />;
    }

    return (
      <Suspense fallback={<LoadingScreen />}>
        <FirstLaunch onCreate={seedInitialData} />
      </Suspense>
    );
  }

  if (TEMP_AUTH_BYPASS && !user) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Login shopName={settings.shop_name} />
      </Suspense>
    );
  }

  if ((user.mustChangePin || currentStaff?.must_change_pin) && !user.isEmergency) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <ForcePinChangePage user={user} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AppShell />
    </Suspense>
  );
}
