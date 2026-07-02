import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { db } from '../../db/index';

const SEARCH_SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'staff', label: 'Staff' },
  { id: 'bills', label: 'Bills & Returns' },
  { id: 'activity', label: 'Activities' },
  { id: 'settings', label: 'Settings' }
];

function textParts(values = []) {
  return values.filter(Boolean).map((value) => String(value).toLowerCase());
}

function matchesQuery(values, query) {
  if (!query) return true;
  return textParts(values).some((value) => value.includes(query));
}

function buildSettingResults(settings) {
  if (!settings) return [];
  return Object.entries(settings)
    .filter(([key]) => !['id', 'updated_at'].includes(key))
    .map(([key, value]) => ({
      scope: 'settings',
      route: '/settings',
      title: key.replaceAll('_', ' '),
      subtitle: String(value),
      keywords: [key, value, 'settings', 'configuration']
    }));
}

function buildStaticResults() {
  return [
    {
      scope: 'bills',
      route: '/print-history',
      title: 'Return / Refund items',
      subtitle: 'Open Bills & Returns, then choose a sale bill and click Return / refund.',
      keywords: ['return', 'refund', 'sale return', 'bill return', 'item return']
    },
    {
      scope: 'inventory',
      route: '/inventory',
      title: 'Inventory module',
      subtitle: 'Products, stock-in, batches, and expiry alerts.',
      keywords: ['inventory', 'stock', 'batch', 'expiry', 'product']
    },
    {
      scope: 'ledger',
      route: '/ledger',
      title: 'Ledger module',
      subtitle: 'Customers, suppliers, dues, and partial payments.',
      keywords: ['ledger', 'customer', 'supplier', 'dues', 'payments', 'doctor', 'vip']
    },
    {
      scope: 'staff',
      route: '/staff',
      title: 'Staff module',
      subtitle: 'Staff roles, PINs, and access control.',
      keywords: ['staff', 'employee', 'pin', 'role', 'manager', 'salesperson']
    },
    {
      scope: 'activity',
      route: '/logs',
      title: 'Activity Log module',
      subtitle: 'Search actions, logins, system updates, and operational history.',
      keywords: ['logs', 'activity', 'audit', 'history', 'actions']
    },
    {
      scope: 'settings',
      route: '/settings',
      title: 'Settings module',
      subtitle: 'Shop profile, thresholds, loyalty, backup, and system controls.',
      keywords: ['settings', 'theme', 'tax', 'discount', 'backup', 'loyalty']
    }
  ];
}

export default function GlobalSearchModal({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const products = useLiveQuery(() => db.products.toArray(), []);
  const customers = useLiveQuery(() => db.customers.toArray(), []);
  const suppliers = useLiveQuery(() => db.suppliers.toArray(), []);
  const staff = useLiveQuery(() => db.staff.toArray(), []);
  const sales = useLiveQuery(() => db.sales.toArray(), []);
  const logs = useLiveQuery(() => db.logs.orderBy('timestamp').reverse().limit(120).toArray(), []);
  const settings = useLiveQuery(() => db.settings.get(1), []);

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    const inventoryResults = (products ?? []).map((product) => ({
      scope: 'inventory',
      route: '/inventory',
      title: product.name,
      subtitle: [product.brand, product.category, product.barcode].filter(Boolean).join(' • '),
      keywords: [product.name, product.brand, product.category, product.barcode, product.unit]
    }));

    const ledgerResults = [
      ...(customers ?? []).map((customer) => ({
        scope: 'ledger',
        route: '/ledger',
        title: customer.name,
        subtitle: ['Customer', customer.customer_id, customer.type, customer.phone].filter(Boolean).join(' • '),
        keywords: [customer.name, customer.customer_id, customer.type, customer.phone, 'customer', 'ledger']
      })),
      ...(suppliers ?? []).map((supplier) => ({
        scope: 'ledger',
        route: '/ledger',
        title: supplier.name,
        subtitle: ['Supplier', supplier.type, supplier.phone, supplier.email].filter(Boolean).join(' • '),
        keywords: [supplier.name, supplier.type, supplier.phone, supplier.email, supplier.address, 'supplier', 'ledger']
      }))
    ];

    const staffResults = (staff ?? []).map((member) => ({
      scope: 'staff',
      route: '/staff',
      title: member.name,
      subtitle: [member.staff_id, member.role, member.phone].filter(Boolean).join(' • '),
      keywords: [member.name, member.staff_id, member.role, member.phone, member.short_code, 'staff']
    }));

    const billResults = (sales ?? []).map((sale) => ({
      scope: 'bills',
      route: '/print-history',
      title: sale.bill_number,
      subtitle: [sale.customer_name || 'Walk-in', sale.cashier_name, sale.payment_mode, sale.is_return ? 'Return bill' : 'Sale bill']
        .filter(Boolean)
        .join(' • '),
      keywords: [sale.bill_number, sale.customer_name, sale.cashier_name, sale.payment_mode, sale.return_reason, sale.original_bill_number, sale.is_return ? 'return' : 'sale']
    }));

    const activityResults = (logs ?? []).map((log) => ({
      scope: 'activity',
      route: '/logs',
      title: log.action,
      subtitle: [log.user_name, new Date(log.timestamp).toLocaleString()].filter(Boolean).join(' • '),
      keywords: [log.action, log.user_name, JSON.stringify(log.details || {})]
    }));

    const allResults = [
      ...buildStaticResults(),
      ...inventoryResults,
      ...ledgerResults,
      ...staffResults,
      ...billResults,
      ...activityResults,
      ...buildSettingResults(settings)
    ];

    return allResults
      .filter((item) => (scope === 'all' ? true : item.scope === scope))
      .filter((item) => matchesQuery([item.title, item.subtitle, ...(item.keywords || [])], normalizedQuery))
      .slice(0, 60);
  }, [products, customers, suppliers, staff, sales, logs, settings, scope, normalizedQuery]);

  function openResult(route) {
    navigate(route);
    onClose?.();
    setQuery('');
  }

  return (
    <Modal open={open} onClose={onClose} title="Global Search" size="xl">
      <div className="space-y-5">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          Search across inventory, ledger, staff, bills & returns, activity log, and settings from one place.
        </div>

        <Input
          label="Search everywhere"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search product, doctor, VIP, supplier, staff, bill, return, setting..."
          autoFocus
        />

        <div className="flex flex-wrap gap-2">
          {SEARCH_SCOPES.map((item) => (
            <Button key={item.id} variant={scope === item.id ? 'primary' : 'secondary'} onClick={() => setScope(item.id)}>
              {item.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-400">{results.length} matching result(s)</div>
          <Badge className="border-white/10 bg-white/5 text-slate-200">Scope: {SEARCH_SCOPES.find((item) => item.id === scope)?.label}</Badge>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {results.map((item, index) => (
            <button
              type="button"
              key={`${item.scope}-${item.route}-${item.title}-${index}`}
              onClick={() => openResult(item.route)}
              className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-sky-400/30 hover:bg-white/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.subtitle}</div>
                </div>
                <Badge className="border-sky-500/30 bg-sky-500/10 text-sky-200">{item.scope}</Badge>
              </div>
            </button>
          ))}

          {!results.length ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
              No matching result found. Try another keyword or change the search scope.
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
