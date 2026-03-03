-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  original_price REAL DEFAULT 0,
  category TEXT,
  features TEXT,
  stock INTEGER DEFAULT 0,
  published INTEGER DEFAULT 0,
  intro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  items TEXT,
  total REAL,
  discount REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  shipping_status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  discount_type TEXT,
  discount_value REAL,
  min_purchase REAL DEFAULT 0,
  max_uses INTEGER DEFAULT 999,
  used_count INTEGER DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  active INTEGER DEFAULT 1
);

-- Member levels table
CREATE TABLE IF NOT EXISTS member_levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  discount REAL DEFAULT 0,
  min_purchase REAL DEFAULT 0,
  color TEXT
);

-- SOP table
CREATE TABLE IF NOT EXISTS sop (
  id TEXT PRIMARY KEY,
  content TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'free',
  member_level TEXT DEFAULT '一般會員',
  total_purchase REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'free',
  member_level TEXT DEFAULT '一般會員',
  total_purchase REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default data
INSERT INTO products (id, name, description, price, original_price, category, features, stock, published, intro) VALUES
('1', '智慧客服系統 Enterprise', '全方位企業客服解決方案', 49900, 59900, '軟體', '["AI 智慧對話", "多管道整合", "數據儀表板"]', 100, 1, 'Enterprise 版本是專為大型企業設計的全方位客服解決方案，支援多人同時上線、部門分工、權限管理，並提供完整的數據分析儀表板。'),
('2', '智慧客服系統 Pro', '專業級客服系統', 19900, 25000, '軟體', '["AI 對話", "RAG 知識庫"]', 50, 1, 'Pro 版本適合中小型企業，提供專業級客服功能。'),
('3', '客服系統 Starter', '入門級客服系統', 4900, 9900, '軟體', '["基本對話", "產品目錄"]', 200, 0, 'Starter 是入門首選，適合新創公司和個人工作室。')
ON CONFLICT (id) DO NOTHING;

INSERT INTO coupons (id, code, discount_type, discount_value, min_purchase, max_uses, used_count, valid_from, valid_until, active) VALUES
('1', 'WELCOME100', 'fixed', 100, 500, 100, 0, '2024-01-01', '2024-12-31', 1),
('2', 'SUMMER20', 'percent', 20, 1000, 50, 0, '2024-06-01', '2024-08-31', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO member_levels (id, name, discount, min_purchase, color) VALUES
('1', '一般會員', 0, 0, '#64748b'),
('2', 'VIP 會員', 5, 10000, '#f59e0b'),
('3', '企業會員', 10, 50000, '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sop (id, content) VALUES
('1', '# 產品問題 FAQ

## 產品無法開機
1. 檢查電源線是否正確連接
2. 確認電源插座有電
3. 長按電源鍵 10 秒進行重置

## 產品有異味
1. 立即停止使用產品
2. 聯繫客服安排檢修

# 訂購與付款
## 如何訂購產品
1. 瀏覽產品目錄
2. 點擊「加入購物車」
3. 前往購物車結帳

# 聯繫客服
- 電話：02-1234-5678
- Email：support@example.com')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security) - optional
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE member_levels ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sop ENABLE ROW LEVEL SECURITY;
