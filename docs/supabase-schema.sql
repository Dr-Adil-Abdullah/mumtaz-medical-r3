-- Mumtaz Medical Database Schema for Supabase
-- Run this in Supabase SQL Editor to create all tables

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES REVOKE ALL ON TABLES FROM authenticated;

-- ==========================================
-- TABLE: settings
-- ==========================================
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  shop_name TEXT,
  phone TEXT,
  address TEXT,
  currency TEXT DEFAULT 'PKR',
  tax_enabled BOOLEAN DEFAULT false,
  tax_rate NUMERIC DEFAULT 0,
  discount_enabled BOOLEAN DEFAULT false,
  discount_rate NUMERIC DEFAULT 0,
  low_stock_default INTEGER DEFAULT 10,
  near_end_default INTEGER DEFAULT 5,
  loyalty_enabled BOOLEAN DEFAULT false,
  loyalty_points_per_sale NUMERIC DEFAULT 1,
  loyalty_silver_threshold INTEGER DEFAULT 100,
  loyalty_gold_threshold INTEGER DEFAULT 500,
  loyalty_platinum_threshold INTEGER DEFAULT 1000,
  require_phone_for_vip BOOLEAN DEFAULT false,
  theme_default_mode TEXT DEFAULT 'dark',
  receipt_header TEXT,
  receipt_footer TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE: staff
-- ==========================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'salesperson',
  short_code TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  must_change_pin BOOLEAN DEFAULT false,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE: products
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  barcode TEXT,
  brand TEXT,
  category TEXT,
  unit TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE: product_batches
-- ==========================================
CREATE TABLE IF NOT EXISTS product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  batch_number TEXT,
  purchase_price NUMERIC DEFAULT 0,
  sale_price NUMERIC DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  expiry_date DATE,
  low_stock_alert INTEGER DEFAULT 10,
  near_end_alert INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE: customers
-- ==========================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  type TEXT DEFAULT 'regular',
  pending_amount NUMERIC DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE: suppliers
-- ==========================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  type TEXT DEFAULT 'normal',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE: sales
-- ==========================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT,
  cashier_id UUID REFERENCES staff(id),
  cashier_name TEXT,
  items JSONB DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  balance_owed NUMERIC DEFAULT 0,
  payment_mode TEXT DEFAULT 'cash',
  is_return BOOLEAN DEFAULT false,
  return_reason TEXT,
  original_sale_id UUID REFERENCES sales(id),
  original_bill_number TEXT,
  approval_status TEXT DEFAULT 'pending',
  payback_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE: expenses
-- ==========================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id),
  sale_id UUID REFERENCES sales(id),
  is_enabled BOOLEAN DEFAULT true,
  date DATE DEFAULT CURRENT_DATE,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE: partial_payments
-- ==========================================
CREATE TABLE IF NOT EXISTS partial_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  customer_id UUID REFERENCES customers(id),
  amount NUMERIC DEFAULT 0,
  received_by UUID REFERENCES staff(id),
  received_by_name TEXT,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE: day_sessions
-- ==========================================
CREATE TABLE IF NOT EXISTS day_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opened_by UUID REFERENCES staff(id),
  opened_by_name TEXT,
  opening_cash NUMERIC DEFAULT 0,
  expected_cash NUMERIC,
  closing_cash NUMERIC,
  difference NUMERIC,
  closed_by UUID REFERENCES staff(id),
  closed_by_name TEXT,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'open'
);

-- ==========================================
-- TABLE: logs
-- ==========================================
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id UUID,
  user_name TEXT,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE: purchase_list
-- ==========================================
CREATE TABLE IF NOT EXISTS purchase_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  supplier_id UUID REFERENCES suppliers(id),
  quantity INTEGER DEFAULT 0,
  is_done BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Enable Row Level Security (RLS)
-- ==========================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE partial_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_list ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Create permissive policies (allow all for now)
-- TODO: Add role-based policies later
-- ==========================================
CREATE POLICY "Allow all access to settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to staff" ON staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to product_batches" ON product_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to partial_payments" ON partial_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to day_sessions" ON day_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to logs" ON logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to purchase_list" ON purchase_list FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- Create indexes for better performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_staff_staff_id ON staff(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_batches_product_id ON product_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_sales_bill_number ON sales(bill_number);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_supplier_id ON expenses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_day_sessions_status ON day_sessions(status);

-- ==========================================
-- Insert default settings row
-- ==========================================
INSERT INTO settings (id, shop_name, currency)
VALUES (1, 'Mumtaz Medical', 'PKR')
ON CONFLICT (id) DO NOTHING;

-- Done! Schema created successfully.
