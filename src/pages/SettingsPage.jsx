import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SettingsSection from '../components/ui/SettingsSection';
import { db } from '../db/index';
import { useAuthStore } from '../store/authStore';
import { downloadBackupJSON, restoreBackupPayload } from '../db/backup';
import { applyThemeMode, DEFAULT_THEME_PALETTES, THEME_COLOR_FIELDS, THEME_PRESETS } from '../utils/theme';
import CloudBackupSection from '../components/shared/CloudBackupSection';

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
        [mode]: { ...presetPalette }
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
          dark: { ...DEFAULT_THEME_PALETTES.dark, ...(settings.theme_palettes?.dark ?? {}) },
          light: { ...DEFAULT_THEME_PALETTES.light, ...(settings.theme_palettes?.light ?? {}) }
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
      details: { changed: Object.keys(form) },
      timestamp: new Date().toISOString()
    });

    setStatus('✅ Settings saved successfully!');
    setTimeout(() => setStatus(''), 3000);
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
        details: { exportedAt: payload.meta?.exportedAt ?? null, tableCount: payload.meta?.tableCount ?? 0 },
        timestamp: new Date().toISOString()
      });
      setBackupStatus('✅ Backup JSON exported successfully.');
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
      setBackupStatus(`✅ Backup restored. ${result.tableCount} table groups processed.`);
    } catch (error) {
      setBackupError(error.message || 'Backup restore failed.');
    } finally {
      setBackupLoading(false);
      event.target.value = '';
    }
  }

  return (
    <form onSubmit={handleSave}>
      <div className="space-y-5">
        {/* ═══ Overview Stats ═══ */}
        <div className="card-grid">
          <Card>
            <p className="text-sm text-slate-400">🏪 Shop name</p>
            <h3 className="mt-2 text-2xl font-bold text-white truncate">{settings?.shop_name ?? '...'}</h3>
          </Card>
          <Card>
            <p className="text-sm text-slate-400">👥 Staff seeded</p>
            <h3 className="mt-2 text-2xl font-bold text-white">{staffCount ?? '...'}</h3>
          </Card>
          <Card>
            <p className="text-sm text-slate-400">📋 Logs stored</p>
            <h3 className="mt-2 text-2xl font-bold text-white">{logCount ?? '...'}</h3>
          </Card>
          <Card>
            <p className="text-sm text-slate-400">💾 Storage</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Local-first</h3>
          </Card>
        </div>

        {/* ═══ 1. SHOP INFO ═══ */}
        <SettingsSection
          icon="🏪"
          title="Shop Information"
          subtitle="Basic shop details and contact info"
          summary={form.shop_name || 'Not set'}
          defaultOpen={true}
        >
          <div className="space-y-4 pt-4">
            <Input
              label="Shop name"
              value={form.shop_name}
              onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
              placeholder="Mumtaz Medical"
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Shop address"
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="03xx-xxxxxxx"
            />
            <Input
              label="Minimum pending amount"
              type="number"
              min="0"
              value={form.pending_min_amount}
              onChange={(e) => setForm({ ...form, pending_min_amount: e.target.value })}
            />
          </div>
        </SettingsSection>

        {/* ═══ 2. RECEIPT SETTINGS ═══ */}
        <SettingsSection
          icon="🧾"
          title="Receipt Settings"
          subtitle="Receipt format and printing options"
          summary={`Format: ${form.receipt_format === 'thermal' ? 'Thermal' : 'A4'}`}
        >
          <div className="space-y-4 pt-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Receipt format</span>
              <select
                value={form.receipt_format}
                onChange={(e) => setForm({ ...form, receipt_format: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="thermal">Thermal (58mm/80mm)</option>
                <option value="a4">A4 Paper</option>
              </select>
            </label>
          </div>
        </SettingsSection>

        {/* ═══ 3. INVENTORY & STOCK ═══ */}
        <SettingsSection
          icon="📦"
          title="Inventory & Stock"
          subtitle="Stock alerts and inventory rules"
          summary={`Low: ${form.low_stock_default} | Near-end: ${form.near_end_default} | Negative: ${form.allow_negative_stock ? 'Allowed' : 'Blocked'}`}
        >
          <div className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Low stock default"
                type="number"
                min="0"
                value={form.low_stock_default}
                onChange={(e) => setForm({ ...form, low_stock_default: e.target.value })}
              />
              <Input
                label="Near-end default"
                type="number"
                min="0"
                value={form.near_end_default}
                onChange={(e) => setForm({ ...form, near_end_default: e.target.value })}
              />
            </div>
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Allow negative stock</div>
                <div className="mt-1 text-xs text-slate-400">If enabled, sales can continue even when stock drops below zero.</div>
              </div>
              <input
                type="checkbox"
                checked={form.allow_negative_stock}
                onChange={(e) => setForm({ ...form, allow_negative_stock: e.target.checked })}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>
          </div>
        </SettingsSection>

        {/* ═══ 4. TAX & DISCOUNT ═══ */}
        <SettingsSection
          icon="💰"
          title="Tax & Discount"
          subtitle="Tax percentage and global discount rules"
          summary={`Tax: ${form.tax_enabled ? form.tax_percent + '%' : 'Off'} | Discount: ${form.global_discount_enabled ? form.global_discount_percent + (form.global_discount_type === 'percent' ? '%' : ' flat') : 'Off'}`}
          badge={
            <div className="flex gap-1.5">
              {form.tax_enabled && <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-200 text-[10px]">Tax ON</Badge>}
              {form.global_discount_enabled && <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-[10px]">Discount ON</Badge>}
            </div>
          }
        >
          <div className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Tax %"
                type="number"
                min="0"
                max="100"
                value={form.tax_percent}
                onChange={(e) => setForm({ ...form, tax_percent: e.target.value })}
              />
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Global discount type</span>
                <select
                  value={form.global_discount_type}
                  onChange={(e) => setForm({ ...form, global_discount_type: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="flat">Flat (Rs)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </label>
              <Input
                label="Global discount value"
                type="number"
                min="0"
                max="100"
                value={form.global_discount_percent}
                onChange={(e) => setForm({ ...form, global_discount_percent: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Cart item limit (0 = unlimited)"
                type="number"
                min="0"
                value={form.cart_item_limit}
                onChange={(e) => setForm({ ...form, cart_item_limit: e.target.value })}
              />
              <Input
                label="Max discount %"
                type="number"
                min="0"
                max="100"
                value={form.max_discount_percent}
                onChange={(e) => setForm({ ...form, max_discount_percent: e.target.value })}
              />
            </div>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Enable tax</div>
                <div className="mt-1 text-xs text-slate-400">Adds tax to checkout and receipts.</div>
              </div>
              <input
                type="checkbox"
                checked={form.tax_enabled}
                onChange={(e) => setForm({ ...form, tax_enabled: e.target.checked })}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Enable global discount</div>
                <div className="mt-1 text-xs text-slate-400">Applies automatic discount at bill level unless manually overridden.</div>
              </div>
              <input
                type="checkbox"
                checked={form.global_discount_enabled}
                onChange={(e) => setForm({ ...form, global_discount_enabled: e.target.checked })}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>
          </div>
        </SettingsSection>

        {/* ═══ 5. LOYALTY PROGRAM ═══ */}
        <SettingsSection
          icon="⭐"
          title="Loyalty Program"
          subtitle="Points earning, redemption, and stage thresholds"
          summary={form.loyalty_enabled ? `Rate: ${form.loyalty_points_rate} pts | Silver: ${form.loyalty_silver_at} | Gold: ${form.loyalty_gold_at} | Platinum: ${form.loyalty_platinum_at}` : 'Disabled'}
          badge={
            <Badge className={form.loyalty_enabled ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-slate-500/30 bg-slate-500/10 text-slate-200'}>
              {form.loyalty_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          }
        >
          <div className="space-y-4 pt-4">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Enable loyalty</div>
                <div className="mt-1 text-xs text-slate-400">Cash sales with a named customer earn loyalty points automatically.</div>
              </div>
              <input
                type="checkbox"
                checked={form.loyalty_enabled}
                onChange={(e) => setForm({ ...form, loyalty_enabled: e.target.checked })}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Input
                label="Points rate"
                type="number"
                min="0"
                step="0.01"
                value={form.loyalty_points_rate}
                onChange={(e) => setForm({ ...form, loyalty_points_rate: e.target.value })}
              />
              <Input
                label="Redeem rate"
                type="number"
                min="0"
                step="0.01"
                value={form.loyalty_redeem_rate}
                onChange={(e) => setForm({ ...form, loyalty_redeem_rate: e.target.value })}
              />
              <Input
                label="🥈 Silver at"
                type="number"
                min="1"
                value={form.loyalty_silver_at}
                onChange={(e) => setForm({ ...form, loyalty_silver_at: e.target.value })}
              />
              <Input
                label="🥇 Gold at"
                type="number"
                min="1"
                value={form.loyalty_gold_at}
                onChange={(e) => setForm({ ...form, loyalty_gold_at: e.target.value })}
              />
              <Input
                label="💎 Platinum at"
                type="number"
                min="1"
                value={form.loyalty_platinum_at}
                onChange={(e) => setForm({ ...form, loyalty_platinum_at: e.target.value })}
              />
            </div>
          </div>
        </SettingsSection>

        {/* ═══ 6. VIP & CUSTOMERS ═══ */}
        <SettingsSection
          icon="👤"
          title="VIP & Customers"
          subtitle="VIP rules and overdue customer controls"
          summary={`Phone required: ${form.require_phone_for_vip ? 'Yes' : 'No'} | Auto-block overdue: ${form.auto_block_overdue ? 'Yes' : 'No'}`}
        >
          <div className="space-y-4 pt-4">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Require phone for VIP</div>
                <div className="mt-1 text-xs text-slate-400">Blocks saving VIP customers unless a phone number is provided.</div>
              </div>
              <input
                type="checkbox"
                checked={form.require_phone_for_vip}
                onChange={(e) => setForm({ ...form, require_phone_for_vip: e.target.checked })}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-slate-300">
              <div>
                <div className="font-medium text-white">Auto-block overdue pending</div>
                <div className="mt-1 text-xs text-slate-400">Owner preference for customers with unpaid old balances.</div>
              </div>
              <input
                type="checkbox"
                checked={form.auto_block_overdue}
                onChange={(e) => setForm({ ...form, auto_block_overdue: e.target.checked })}
                className="h-5 w-5 rounded border-white/20 bg-slate-950 text-brand-500"
              />
            </label>
          </div>
        </SettingsSection>

        {/* ═══ 7. THEME & COLORS ═══ */}
        <SettingsSection
          icon="🎨"
          title="Theme & Colors"
          subtitle="Dark/light mode, presets, and custom color palette"
          summary={`${form.theme_default_mode === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'} active`}
          badge={<Badge className="border-sky-500/30 bg-sky-500/10 text-sky-200">Theme Editor</Badge>}
        >
          <div className="space-y-5 pt-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Default app mode</span>
                <select
                  value={form.theme_default_mode}
                  onChange={(e) => setForm({ ...form, theme_default_mode: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="dark">🌙 Dark mode</option>
                  <option value="light">☀️ Light mode</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-300">Edit palette for</span>
                <select
                  value={themeEditorMode}
                  onChange={(e) => setThemeEditorMode(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="dark">🌙 Dark palette</option>
                  <option value="light">☀️ Light palette</option>
                </select>
              </label>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                <div className="text-slate-500">Editing now</div>
                <div className="mt-1 font-semibold text-white">{themeEditorMode === 'dark' ? '🌙 Dark palette' : '☀️ Light palette'}</div>
                <div className="mt-2 text-xs text-slate-400">Changes preview immediately and save after clicking Save.</div>
              </div>
            </div>

            {/* Preset Themes */}
            <div>
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

            {/* Custom Colors */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {THEME_COLOR_FIELDS.map((field) => {
                const value = form.theme_palettes?.[themeEditorMode]?.[field.key] ?? DEFAULT_THEME_PALETTES[themeEditorMode][field.key];
                return (
                  <label key={`${themeEditorMode}-${field.key}`} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <span className="text-sm font-medium text-slate-300">{field.label}</span>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => updateThemeColor(themeEditorMode, field.key, e.target.value)}
                        className="h-12 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
                      />
                      <input
                        type="text"
                        value={value}
                        readOnly
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none font-mono text-sm"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </SettingsSection>

        {/* ═══ SAVE BUTTON ═══ */}
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-brand-500/20 bg-slate-900/95 px-6 py-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">💾 Save all settings</span>
            {status && <span className="text-sm font-medium text-emerald-300">{status}</span>}
          </div>
          <Button type="submit" className="px-8">
            Save All Changes
          </Button>
        </div>

        {/* ═══ 8. LOCAL BACKUP ═══ */}
        <SettingsSection
          icon="💾"
          title="Local Backup (JSON)"
          subtitle="Export or import your complete data as a JSON file"
          summary="Download or restore backup files from your computer"
        >
          <div className="space-y-4 pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleBackupFileChange}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                <div className="text-slate-500">📥 Export</div>
                <div className="mt-1 font-semibold text-white">Download JSON</div>
                <div className="mt-2 text-xs text-slate-400">Complete data backup to your computer.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                <div className="text-slate-500">📤 Import</div>
                <div className="mt-1 font-semibold text-white">{selectedBackupName || 'No file selected'}</div>
                <div className="mt-2 text-xs text-slate-400">Restore from a previous backup file.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                <div className="text-slate-500">🔄 Mode</div>
                <div className="mt-1 font-semibold text-white">Replace live tables</div>
                <div className="mt-2 text-xs text-slate-400">Logs are appended, not deleted.</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handleExportBackup} disabled={backupLoading}>
                {backupLoading ? '⏳ Working...' : '📥 Export Backup JSON'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={backupLoading}
              >
                {backupLoading ? '⏳ Working...' : '📤 Import Backup JSON'}
              </Button>
            </div>

            {backupStatus ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                {backupStatus}
              </div>
            ) : null}
            {backupError ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                {backupError}
              </div>
            ) : null}
          </div>
        </SettingsSection>

        {/* ═══ 9. CLOUD BACKUP (Google Drive + OneDrive) ═══ */}
        <CloudBackupSection />

        {/* bottom spacing */}
        <div className="h-8" />
      </div>
    </form>
  );
}
