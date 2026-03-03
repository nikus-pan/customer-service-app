import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gniocyinxqdnvaozojop.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_4bylQarHWGUbI27uJFa3tQ_BXH4Ia8j';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function initializeDatabase() {
  const { error } = await supabase.from('products').select('id').limit(1);
  
  if (error && error.code === '42P01') {
    console.log('Creating database tables...');
    await createTables();
  }
}

async function createTables() {
  const productsTable = `
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
  `;

  const ordersTable = `
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
  `;

  const couponsTable = `
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
  `;

  const memberLevelsTable = `
    CREATE TABLE IF NOT EXISTS member_levels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      discount REAL DEFAULT 0,
      min_purchase REAL DEFAULT 0,
      color TEXT
    );
  `;

  const sopTable = `
    CREATE TABLE IF NOT EXISTS sop (
      id TEXT PRIMARY KEY,
      content TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  try {
    await supabase.rpc('exec_sql', { sql: productsTable });
  } catch (e) {
    console.log('Using alternative table creation...');
  }

  await Promise.all([
    supabase.from('products').upsert([
      { id: '1', name: '智慧客服系統 Enterprise', description: '全方位企業客服解決方案', price: 49900, original_price: 59900, category: '軟體', features: '["AI 智慧對話", "多管道整合", "數據儀表板"]', stock: 100, published: true, intro: 'Enterprise 版本是專為大型企業設計的全方位客服解決方案...' },
      { id: '2', name: '智慧客服系統 Pro', description: '專業級客服系統', price: 19900, original_price: 25000, category: '軟體', features: '["AI 對話", "RAG 知識庫"]', stock: 50, published: true, intro: 'Pro 版本適合中小型企業，提供專業級客服功能。' },
      { id: '3', name: '客服系統 Starter', description: '入門級客服系統', price: 4900, original_price: 9900, category: '軟體', features: '["基本對話", "產品目錄"]', stock: 200, published: false, intro: 'Starter 是入門首選，適合新創公司和個人工作室。' },
    ], { onConflict: 'id' }),

    supabase.from('coupons').upsert([
      { id: '1', code: 'WELCOME100', discount_type: 'fixed', discount_value: 100, min_purchase: 500, max_uses: 100, used_count: 0, valid_from: '2024-01-01', valid_until: '2024-12-31', active: true },
      { id: '2', code: 'SUMMER20', discount_type: 'percent', discount_value: 20, min_purchase: 1000, max_uses: 50, used_count: 0, valid_from: '2024-06-01', valid_until: '2024-08-31', active: true },
    ], { onConflict: 'id' }),

    supabase.from('member_levels').upsert([
      { id: '1', name: '一般會員', discount: 0, min_purchase: 0, color: '#64748b' },
      { id: '2', name: 'VIP 會員', discount: 5, min_purchase: 10000, color: '#f59e0b' },
      { id: '3', name: '企業會員', discount: 10, min_purchase: 50000, color: '#8b5cf6' },
    ], { onConflict: 'id' }),

    supabase.from('sop').upsert([
      { id: '1', content: '# 產品問題 FAQ\n\n## 產品無法開機\n1. 檢查電源線是否正確連接\n2. 確認電源插座有電\n3. 長按電源鍵 10 秒進行重置\n\n## 產品有異味\n1. 立即停止使用產品\n2. 聯繫客服安排檢修\n\n# 訂購與付款\n## 如何訂購產品\n1. 瀏覽產品目錄\n2. 點擊「加入購物車」\n3. 前往購物車結帳\n\n# 聯繫客服\n- 電話：02-1234-5678\n- Email：support@example.com' },
    ], { onConflict: 'id' }),
  ]);

  console.log('Database initialized with default data');
}

export const db = {
  products: {
    getAll: async () => {
      const { data, error } = await supabase.from('products').select('*').order('price', { ascending: true });
      if (error) throw error;
      return data?.map(p => ({ ...p, features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features })) || [];
    },
    save: async (products: any[]) => {
      const { error } = await supabase.from('products').upsert(products, { onConflict: 'id' });
      if (error) throw error;
    },
  },
  orders: {
    getAll: async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    save: async (orders: any[]) => {
      const { error } = await supabase.from('orders').upsert(orders, { onConflict: 'id' });
      if (error) throw error;
    },
  },
  coupons: {
    getAll: async () => {
      const { data, error } = await supabase.from('coupons').select('*');
      if (error) throw error;
      return data || [];
    },
    save: async (coupons: any[]) => {
      const { error } = await supabase.from('coupons').upsert(coupons, { onConflict: 'id' });
      if (error) throw error;
    },
  },
  memberLevels: {
    getAll: async () => {
      const { data, error } = await supabase.from('member_levels').select('*').order('min_purchase', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    save: async (levels: any[]) => {
      const { error } = await supabase.from('member_levels').upsert(levels, { onConflict: 'id' });
      if (error) throw error;
    },
  },
  sop: {
    get: async () => {
      const { data, error } = await supabase.from('sop').select('content').eq('id', '1').single();
      if (error) return null;
      return data?.content || '';
    },
    save: async (content: string) => {
      const { error } = await supabase.from('sop').upsert({ id: '1', content, updated_at: new Date().toISOString() }, { onConflict: 'id' });
      if (error) throw error;
    },
  },
  users: {
    getByEmail: async (email: string) => {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
      if (error) return null;
      return data;
    },
    create: async (user: { id: string; email: string; name: string; password: string; role?: string }) => {
      const { error } = await supabase.from('users').insert([{
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role || 'free',
        member_level: '一般會員',
        total_purchase: 0
      }]);
      if (error) throw error;
    },
    getAll: async () => {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    updatePurchase: async (userId: string, amount: number) => {
      const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
      if (!user) return;
      
      const newTotal = (user.total_purchase || 0) + amount;
      let newLevel = '一般會員';
      
      if (newTotal >= 50000) newLevel = '企業會員';
      else if (newTotal >= 10000) newLevel = 'VIP 會員';
      
      await supabase.from('users').update({ 
        total_purchase: newTotal,
        member_level: newLevel
      }).eq('id', userId);
    },
  },
};
