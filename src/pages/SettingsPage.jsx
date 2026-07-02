import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { db } from '../db/index';
import { useAuthStore } from '../store/authStore';
import { downloadBackupJSON, restoreBackupPayload } from '../db/backup';
import { applyThemeMode, DEFAULT_THEME_PALETTES, THEME_COLOR_FIELDS, THEME_PRESETS } from '../utils/theme';

export default function SettingsPage() {
  const settings = useLiveQuery(() => db.settings.get(1), []);
  const staffCount = useLiveQuery(() => db.staff.count(), []);
  const logCount = useLiveQuery(() => db.logs.count(), []);
  const user = useAuthStore((state) => state.user);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    shop_name: '',
    address: '',
    phone: '',
    pending_min_amount: 100,
    receipt_format: 'thermal',
    low_stock_default: 10,
    near_end_default: 5,
    allow_negative_stock: false,
    tax_enabled: false,
    tax_percent: 0,
    require_phone_for_vip: true,
    loyalty_enabled: true,
    loyalty_points_rate: 1,
    loyalty_redeem_rate: 1,
    loyalty_silver_at: 100,
    loyalty_gold_at: 500,
    loyalty_platinum_at: 2000,
    auto_block_overdue: false,
    cart_item_limit: 0,
    max_discount_percent: 100,
    global_discount_enabled: false,
    global_discount_type: 'flat',
    global_discount_percent: 0,
    theme_default_mode: 'dark',
    theme_palettes: DEFAULT_THEME_PALETTES
  });
  const [themeEditorMode, setThemeEditorMode] = useState('dark');
  const [status, setStatus] = useState('');
  const [backupStatus, setBackupStatus] = useState('');
  const [backupError, setBackupError] = useState('');
  const [selectedBackupName, setSelectedBackupName] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);

  function flashStatus(message) {
    setStatus(message);
    window.setTimeout(() => setStatus(''), 3000);
  }

  function updateThemeColor(mode, key, value) {
    setForm((current) => ({
      ...current,
      theme_palettes: {
        ...current.theme_palettes,
        [mode]: {
          ...(current.theme_palettes?.[mode] ?? DEFAULT_THEME_PALETTES[mode]),
          [key]: value
        }
      }
    }));
  }

  function applyPreset(mode, presetPalette) {
    setForm((current) => ({
      ...current,
      theme_palettes: {
        ...current.theme_palettes,
        [mode]: {
          ...presetPalette
        }
      }
    }));
  }

  useEffect(() => {
    if (settings) {
      setForm({
        shop_name: settings.shop_name ?? '',
        address: settings.address ?? '',
        phone: settings.phone ?? '',
        pending_min_amount: settings.pending_min_amount ?? 100,
        receipt_format: settings.receipt_format ?? 'thermal',
        low_stock_default: settings.low_stock_default ?? 10,
        near_end_default: settings.near_end_default ?? 5,
        allow_negative_stock: Boolean(settings.allow_negative_stock),
        tax_enabled: Boolean(settings.tax_enabled),
        tax_percent: settings.tax_percent ?? 0,
        require_phone_for_vip: settings.require_phone_for_vip ?? true,
        loyalty_enabled: settings.loyalty_enabled ?? true,
        loyalty_points_rate: settings.loyalty_points_rate ?? 1,
        loyalty_redeem_rate: settings.loyalty_redeem_rate ?? 1,
        loyalty_silver_at: settings.loyalty_silver_at ?? 100,
        loyalty_gold_at: settings.loyalty_gold_at ?? 500,
        loyalty_platinum_at: settings.loyalty_platinum_at ?? 2000,
        auto_block_overdue: Boolean(settings.auto_block_overdue),
        cart_item_limit: settings.cart_item_limit ?? 0,
        max_discount_percent: settings.max_discount_percent ?? 100,
        global_discount_enabled: Boolean(settings.global_discount_enabled),
        global_discount_type: settings.global_discount_type ?? 'flat',
        global_discount_percent: settings.global_discount_percent ?? 0,
        theme_default_mode: settings.theme_default_mode ?? 'dark',
        theme_palettes: {
          dark: {
            ...DEFAULT_THEME_PALETTES.dark,
            ...(settings.theme_palettes?.dark ?? {})
          },
          light: {
            ...DEFAULT_THEME_PALETTES.light,
            ...(settings.theme_palettes?.light ?? {})
          }
        }
      });
      setThemeEditorMode(settings.theme_default_mode ?? 'dark');
    }
  }, [settings]);

  useEffect(() => {
    applyThemeMode(form.theme_default_mode || 'dark', form);
  }, [form.theme_default_mode, form.theme_palettes]);

  async function handleSave(event) {
    event.preventDefault();
    if (!settings) return;

    const loyaltyPointsRate = Number(form.loyalty_points_rate) || 0;
    const loyaltyRedeemRate = Number(form.loyalty_redeem_rate) || 0;
    const loyaltySilverAt = Number(form.loyalty_silver_at) || 0;
    const loyaltyGoldAt = Number(form.loyalty_gold_at) || 0;
    const loyaltyPlatinumAt = Number(form.loyalty_platinum_at) || 0;

    if (loyaltyPointsRate < 0 || loyaltyRedeemRate < 0) {
      flashStatus('Loyalty rates cannot be negative.');
      return;
    }

    if (loyaltySilverAt < 1 || loyaltyGoldAt <= loyaltySilverAt || loyaltyPlatinumAt <= loyaltyGoldAt) {
      flashStatus('Loyalty thresholds must increase in order: Silver < Gold < Platinum.');
      return;
    }

    const next = {
      ...settings,
      ...form,
      pending_min_amount: Number(form.pending_min_amount) || 0,
      low_stock_default: Number(form.low_stock_default) || 0,
      near_end_default: Number(form.near_end_default) || 0,
      allow_negative_stock: Boolean(form.allow_negative_stock),
      tax_enabled: Boolean(form.tax_enabled),
      tax_percent: Number(form.tax_percent) || 0,
      require_phone_for_vip: Boolean(form.require_phone_for_vip),
      loyalty_enabled: Boolean(form.loyalty_enabled),
      loyalty_points_rate: loyaltyPointsRate,
      loyalty_redeem_rate: loyaltyRedeemRate,
      loyalty_silver_at: loyaltySilverAt,
      loyalty_gold_at: loyaltyGoldAt,
      loyalty_platinum_at: loyaltyPlatinumAt,
      auto_block_overdue: Boolean(form.auto_block_overdue),
      cart_item_limit: Number(form.cart_item_limit) || 0,
      max_discount_percent: Number(form.max_discount_percent) || 0,
      global_discount_enabled: Boolean(form.global_discount_enabled),
      global_discount_type: form.global_discount_type,
      global_discount_percent: Number(form.global_discount_percent) || 0,
      theme_default_mode: form.theme_default_mode,
      theme_palettes: form.theme_palettes,
      updated_at: new Date().toISOString()
    };

    await db.settings.put(next);
    await db.logs.add({
      id: crypto.randomUUID(),
      action: 'SETTING_CHANGE',
      user_id: user?.id,
      user_name: user?.name ?? 'Unknown',
      details: {
        changed: [
          'shop_name',
          'address',
          'phone',
          'pending_min_amount',
          'receipt_format',
          'low_stock_default',
          'near_end_default',
          'allow_negative_stock',
          'tax_enabled',
          'tax_percent',
          'require_phone_for_vip',
          'loyalty_enabled',
          'loyalty_points_rate',
          'loyalty_redeem_rate',
          'loyalty_silver_at',
          'loyalty_gold_at',
          'loyalty_platinum_at',
          'auto_block_overdue',
          'cart_item_limit',
          'max_discount_percent',
          'global_discount_enabled',
          'global_discount_type',
          'global_discount_percent',
          'theme_default_mode',
          'theme_palettes'
        ]
      },
      timestamp: new Date().toISOString()
    });

    setStatus('Settings saved locally in IndexedDB.');
    setTimeout(() => setStatus(''), 2500);
  }

  async function handleExportBackup() {
    setBackupLoading(true);
    setBackupError('');
    setBackupStatus('');

    try {
      const payload = await downloadBackupJSON();
      await db.logs.add({
        id: crypto.randomUUID(),
        action: 'BACKUP',
        user_id: user?.id,
        user_name: user?.name ?? 'Unknown',
        details: {
          exportedAt: payload.meta?.exportedAt ?? null,
          tableCount: payload.meta?.tableCount ?? 0
        },
        timestamp: new Date().toISOString()
      });
      setBackupStatus('Backup JSON exported successfully.');
    } catch (error) {
      setBackupError(error.message || 'Backup export failed.');
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleBackupFileChange(event) {
    const file = event.target.files?.[0];
    setSelectedBackupName(file?.name ?? '');
    if (!file) return;

    setBackupLoading(true);
    setBackupError('');
    setBackupStatus('');

    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const result = await restoreBackupPayload(payload, user);
      setBackupStatus(`Backup restored successfully. ${result.tableCount} table groups processed.`);
    } catch (error) {
      setBackupError(error.message || 'Backup restore failed.');
    } finally {
      setBackupLoading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-grid">
        <Card>
          <p className="text-sm text-slate-400">Shop name</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{settings?.shop_name ?? '...'}</h3>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Staff seeded</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{staffCount ?? '...'}</h3>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Logs stored</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{logCount ?? '...'}</h3>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Mode</p>
          <h3 className="mt-2 text-2xl font-bold text-white">Local only</h3>
        </Card>
      </div>

      <Card className="max-w-4xl border border-sky-500/20 bg-sky-500/10">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-200">System mode</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Cloud sync removed for stability</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-100">
          This build now runs in local-only mode. Online sync / Supabase data transfer has been removed to avoid the
          black-screen and related runtime issues.
        </p>
      </Card>

      <Card className="max-w-4xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-brand-300">System settings</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Bootstrap configuration</h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
            Stored in Dexie / IndexedDB
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSave}>
          <Input
            label="Shop name"
            value={form.shop_name}
            onChange={(event) => setForm((current) => ({ ...current, shop_name: event.target.value }))}
            placeholder="Mumtaz Medical"
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            placeholder="Shop address"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            placeholder="03xx-xxxxxxx"
          />
          <Input
            label="Minimum pending amount"
            type="number"
            min="0"
            value={form.pending_min_amount}
            onChange={(event) => setForm((current) => ({ ...current, pending_min_amount: event.target.value }))}
          />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">Receipt format</span>
            <select
              value={form.receipt_format}
              onChange={(event) => setForm((current) => ({ ...current, receipt_format: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="thermal">Thermal</option>
              <option value="a4">A4</option>
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Low stock default"
              type="number"
              min="0"
              value={form.low_stock_default}
              onChange={(event) => setForm((current) => ({ ...current, low_stock_default: event.target.value }))}
            />
            <Input
              label="Near-end default"
              type="number"
              min="0"
              value={form.near_end_default}
              onChange={(event) => setForm((current) => ({ ...current, near_end_default: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Cart item limit (0 = unlimited)"
              type="number"
              min="0"
              value={form.cart_item_limit}
              onChange={(event) => setForm((current) => ({ ...current, cart_item_limit: event.target.value }))}
            />
            <Input
              label="Max discount %"
              type="number"
              min="0"
              max="100"
              value={form.max_discount_percent}
              onChange={(event) => setForm((current) => ({ ...current, max_discount_percent: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Allow negative stock</div>
                <div className="mt-1 text-xs text-slate-400">If enabled, sales can continue even when stock drops below zero.</div>
              </div>
              <input
                type="checkbox"
                checked={form.allow_negative_stock}
                onChange={(event) => setForm((current) => ({ ...current, allow_negative_stock: event.target.checked }))}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Require phone for VIP</div>
                <div className="mt-1 text-xs text-slate-400">Blocks saving VIP customers unless a phone number is provided.</div>
              </div>
              <input
                type="checkbox"
                checked={form.require_phone_for_vip}
                onChange={(event) => setForm((current) => ({ ...current, require_phone_for_vip: event.target.checked }))}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Enable loyalty</div>
                <div className="mt-1 text-xs text-slate-400">Cash sales with a named customer can earn loyalty points automatically.</div>
              </div>
              <input
                type="checkbox"
                checked={form.loyalty_enabled}
                onChange={(event) => setForm((current) => ({ ...current, loyalty_enabled: event.target.checked }))}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Enable tax</div>
                <div className="mt-1 text-xs text-slate-400">Adds tax to checkout and receipts.</div>
              </div>
              <input
                type="checkbox"
                checked={form.tax_enabled}
                onChange={(event) => setForm((current) => ({ ...current, tax_enabled: event.target.checked }))}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300 md:col-span-2">
              <div>
                <div className="font-medium text-white">Auto-block overdue pending</div>
                <div className="mt-1 text-xs text-slate-400">Owner preference for customers with unpaid old balances.</div>
              </div>
              <input
                type="checkbox"
                checked={form.auto_block_overdue}
                onChange={(event) => setForm((current) => ({ ...current, auto_block_overdue: event.target.checked }))}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Loyalty settings</div>
                <div className="mt-1 text-xs text-slate-400">Configure point earning, redemption value, and stage thresholds.</div>
              </div>
              <Badge className={form.loyalty_enabled ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-500/30 bg-slate-500/10 text-slate-200'}>
                {form.loyalty_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Input
                label="Points rate"
                type="number"
                min="0"
                step="0.01"
                value={form.loyalty_points_rate}
                onChange={(event) => setForm((current) => ({ ...current, loyalty_points_rate: event.target.value }))}
              />
              <Input
                label="Redeem rate"
                type="number"
                min="0"
                step="0.01"
                value={form.loyalty_redeem_rate}
                onChange={(event) => setForm((current) => ({ ...current, loyalty_redeem_rate: event.target.value }))}
              />
              <Input
                label="Silver at"
                type="number"
                min="1"
                value={form.loyalty_silver_at}
                onChange={(event) => setForm((current) => ({ ...current, loyalty_silver_at: event.target.value }))}
              />
              <Input
                label="Gold at"
                type="number"
                min="1"
                value={form.loyalty_gold_at}
                onChange={(event) => setForm((current) => ({ ...current, loyalty_gold_at: event.target.value }))}
              />
              <Input
                label="Platinum at"
                type="number"
                min="1"
                value={form.loyalty_platinum_at}
                onChange={(event) => setForm((current) => ({ ...current, loyalty_platinum_at: event.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Tax %"
              type="number"
              min="0"
              max="100"
              value={form.tax_percent}
              onChange={(event) => setForm((current) => ({ ...current, tax_percent: event.target.value }))}
            />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Global discount type</span>
              <select
                value={form.global_discount_type}
                onChange={(event) => setForm((current) => ({ ...current, global_discount_type: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="flat">Flat</option>
                <option value="percent">Percent</option>
              </select>
            </label>
            <Input
              label="Global discount value"
              type="number"
              min="0"
              max="100"
              value={form.global_discount_percent}
              onChange={(event) => setForm((current) => ({ ...current, global_discount_percent: event.target.value }))}
            />
          </div>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
            <div>
              <div className="font-medium text-white">Enable global discount</div>
              <div className="mt-1 text-xs text-slate-400">Applies an automatic discount rule at bill level unless manually overridden.</div>
            </div>
            <input
              type="checkbox"
              checked={form.global_discount_enabled}
              onChange={(event) => setForm((current) => ({ ...current, global_discount_enabled: event.target.checked }))}
              className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
            />
          </label>

          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Theme palette controls</div>
                <div className="mt-1 text-xs text-slate-400">
                  Admin can define the app colors separately for dark mode and light mode. Choose the mode you want to edit,
                  update the color set, then save settings.
                </div>
              </div>
              <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-200">Theme editor</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Default app mode</span>
                <select
                  value={form.theme_default_mode}
                  onChange={(event) => setForm((current) => ({ ...current, theme_default_mode: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="dark">Dark mode</option>
                  <option value="light">Light mode</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Which palette do you want to edit?</span>
                <select
                  value={themeEditorMode}
                  onChange={(event) => setThemeEditorMode(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="dark">Edit dark palette</option>
                  <option value="light">Edit light palette</option>
                </select>
              </label>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                <div className="text-slate-500">Editing now</div>
                <div className="mt-1 font-semibold text-white">{themeEditorMode === 'dark' ? 'Dark palette' : 'Light palette'}</div>
                <div className="mt-2 text-xs text-slate-400">Changes are previewed immediately and saved after you click Save changes.</div>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-3 text-sm font-medium text-white">Preset themes for {themeEditorMode === 'dark' ? 'dark mode' : 'light mode'}</div>
              <div className="grid gap-4 md:grid-cols-3">
                {THEME_PRESETS[themeEditorMode].map((preset) => (
                  <button
                    key={`${themeEditorMode}-${preset.id}`}
                    type="button"
                    onClick={() => applyPreset(themeEditorMode, preset.palette)}
                    className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 text-left transition hover:border-sky-400/30 hover:bg-slate-900/90"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{preset.name}</div>
                        <div className="mt-1 text-xs text-slate-400">{preset.inspiration}</div>
                      </div>
                      <Badge className="border-white/10 bg-white/5 text-slate-200">Preset</Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[preset.palette.primary, preset.palette.secondary, preset.palette.accent, preset.palette.panel].map((color, index) => (
                        <span
                          key={`${preset.id}-${index}`}
                          className="h-7 w-7 rounded-full border border-white/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {THEME_COLOR_FIELDS.map((field) => {
                const value = form.theme_palettes?.[themeEditorMode]?.[field.key] ?? DEFAULT_THEME_PALETTES[themeEditorMode][field.key];
                return (
                  <label key={`${themeEditorMode}-${field.key}`} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <span className="text-sm font-medium text-slate-300">{field.label}</span>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="color"
                        value={value}
                        onChange={(event) => updateThemeColor(themeEditorMode, field.key, event.target.value)}
                        className="h-12 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
                      />
                      <input
                        type="text"
                        value={value}
                        readOnly
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
              <div className="text-slate-500">Negative stock</div>
              <div className="mt-1 font-semibold text-white">{settings?.allow_negative_stock ? 'Allowed' : 'Blocked'}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
              <div className="text-slate-500">Tax</div>
              <div className="mt-1 font-semibold text-white">{settings?.tax_enabled ? `${settings?.tax_percent}% enabled` : 'Disabled'}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
              <div className="text-slate-500">Emergency super key</div>
              <div className="mt-1 font-semibold text-white">Configured</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">Save changes</Button>
            <span className="text-sm text-brand-200">{status}</span>
          </div>
        </form>
      </Card>

      <Card className="max-w-4xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-brand-300">Backup & restore</p>
            <h2 className="mt-2 text-2xl font-bold text-white">JSON backup controls</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Export the current shop data to a JSON file or restore from an earlier backup. Restore replaces operational
              tables and appends backup logs for local recovery use.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
            Local-only backup mode
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleBackupFileChange}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
            <div className="text-slate-500">Restore mode</div>
            <div className="mt-1 font-semibold text-white">Replace live tables</div>
            <div className="mt-2 text-xs text-slate-400">Logs are appended, not deleted.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
            <div className="text-slate-500">Selected file</div>
            <div className="mt-1 font-semibold text-white">{selectedBackupName || 'No file selected'}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
            <div className="text-slate-500">Recovery mode</div>
            <div className="mt-1 font-semibold text-white">Local restore</div>
            <div className="mt-2 text-xs text-slate-400">Use this if a new change causes instability.</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={handleExportBackup} disabled={backupLoading}>
            {backupLoading ? 'Working...' : 'Export backup JSON'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={backupLoading}
          >
            {backupLoading ? 'Working...' : 'Import backup JSON'}
          </Button>
        </div>

        {backupStatus ? (
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            {backupStatus}
          </div>
        ) : null}
        {backupError ? (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">
            {backupError}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
