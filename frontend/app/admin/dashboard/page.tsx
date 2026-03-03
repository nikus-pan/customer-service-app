'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Users, BarChart3, LogOut, FileText, Plus, Edit, Trash2, X, Save, Tag, Truck, CreditCard, Mail, MessageCircle, Settings } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  user_email?: string;
  items: any[];
  total: number;
  discount: number;
  status: string;
  shipping_status: string;
  tracking_number: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  category: string;
  features: string;
  stock: number;
  published: boolean;
  intro: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
}

interface MemberLevel {
  name: string;
  discount: number;
  min_purchase: number;
  color: string;
}

const defaultProducts: Product[] = [
  { id: '1', name: '智慧客服系統 Enterprise', description: '全方位企業客服解決方案', price: 49900, original_price: 59900, category: '軟體', features: '["AI 智慧對話", "多管道整合", "數據儀表板"]', stock: 100, published: true, intro: ' Enterprise 版本是專為大型企業設計的全方位客服解決方案，支援多人同時上線、部門分工、權限管理，並提供完整的數據分析儀表板。\n\n✅ 產品特色\n- AI 智慧對話：使用最新 AI 模型，理解客戶意圖並給予精準回覆\n- 多管道整合：支援 LINE、Facebook、Email、網站chat統一收件匣\n- 數據儀表板：即時顯示客服滿意度、響應時間、熱門問題等指標\n- API 串接：提供完整 API 與現有系統整合\n- 優先客服支援：享有 24 小時優先客服服務' },
  { id: '2', name: '智慧客服系統 Pro', description: '專業級客服系統', price: 19900, original_price: 25000, category: '軟體', features: '["AI 對話", "RAG 知識庫"]', stock: 50, published: true, intro: ' Pro 版本適合中小型企業，提供專業級客服功能。' },
  { id: '3', name: '客服系統 Starter', description: '入門級客服系統', price: 4900, original_price: 9900, category: '軟體', features: '["基本對話", "產品目錄"]', stock: 200, published: false, intro: ' Starter 是入門首選，適合新創公司和個人工作室。' },
];

const defaultSOP = `# 產品問題 FAQ

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
- Email：support@example.com`;

const defaultCoupons: Coupon[] = [
  { id: '1', code: 'WELCOME100', discount_type: 'fixed', discount_value: 100, min_purchase: 500, max_uses: 100, used_count: 0, valid_from: '2024-01-01', valid_until: '2024-12-31', active: true },
  { id: '2', code: 'SUMMER20', discount_type: 'percent', discount_value: 20, min_purchase: 1000, max_uses: 50, used_count: 0, valid_from: '2024-06-01', valid_until: '2024-08-31', active: true },
];

const defaultMemberLevels: MemberLevel[] = [
  { name: '一般會員', discount: 0, min_purchase: 0, color: '#64748b' },
  { name: 'VIP 會員', discount: 5, min_purchase: 10000, color: '#f59e0b' },
  { name: '企業會員', discount: 10, min_purchase: 50000, color: '#8b5cf6' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'sop' | 'coupons' | 'members' | 'settings' | 'stats'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [sopContent, setSopContent] = useState(defaultSOP);
  const [coupons, setCoupons] = useState<Coupon[]>(defaultCoupons);
  const [memberLevels, setMemberLevels] = useState<MemberLevel[]>(defaultMemberLevels);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({});

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    if (!adminToken || !adminUser) {
      router.push('/admin/login');
      return;
    }
    const user = JSON.parse(adminUser);
    if (user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setIsAdmin(true);
    loadData();
  }, [router]);

  const loadData = () => {
    const storedOrders = localStorage.getItem('admin_orders');
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    
    const storedProducts = localStorage.getItem('admin_products');
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    else {
      setProducts(defaultProducts);
      localStorage.setItem('admin_products', JSON.stringify(defaultProducts));
    }
    
    const storedCoupons = localStorage.getItem('admin_coupons');
    if (storedCoupons) setCoupons(JSON.parse(storedCoupons));
    else {
      setCoupons(defaultCoupons);
      localStorage.setItem('admin_coupons', JSON.stringify(defaultCoupons));
    }
    
    const storedSOP = localStorage.getItem('admin_sop');
    if (storedSOP) setSopContent(storedSOP);
    
    const storedLevels = localStorage.getItem('admin_member_levels');
    if (storedLevels) setMemberLevels(JSON.parse(storedLevels));
    else {
      setMemberLevels(defaultMemberLevels);
      localStorage.setItem('admin_member_levels', JSON.stringify(defaultMemberLevels));
    }
  };

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('admin_products', JSON.stringify(newProducts));
  };

  const saveCoupons = (newCoupons: Coupon[]) => {
    setCoupons(newCoupons);
    localStorage.setItem('admin_coupons', JSON.stringify(newCoupons));
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('admin_orders', JSON.stringify(newOrders));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return alert('請填寫產品名稱和價格');
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name || '',
      description: newProduct.description || '',
      price: newProduct.price || 0,
      original_price: newProduct.original_price || 0,
      category: newProduct.category || '',
      features: newProduct.features || '[]',
      stock: newProduct.stock || 0,
      published: newProduct.published || false,
      intro: newProduct.intro || ''
    };
    saveProducts([...products, product]);
    setNewProduct({});
  };

  const handleEditProduct = (product: Product) => setEditingProduct(product);
  const handleSaveProduct = () => {
    if (!editingProduct) return;
    saveProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
  };
  const handleDeleteProduct = (id: string) => {
    if (!confirm('確定要刪除？')) return;
    saveProducts(products.filter(p => p.id !== id));
  };

  const handleAddCoupon = () => {
    if (!newCoupon.code || !newCoupon.discount_value) return alert('請填寫優惠碼和折扣');
    const coupon: Coupon = {
      id: Date.now().toString(),
      code: newCoupon.code || '',
      discount_type: newCoupon.discount_type || 'fixed',
      discount_value: newCoupon.discount_value || 0,
      min_purchase: newCoupon.min_purchase || 0,
      max_uses: newCoupon.max_uses || 999,
      used_count: 0,
      valid_from: newCoupon.valid_from || new Date().toISOString().split('T')[0],
      valid_until: newCoupon.valid_until || '2024-12-31',
      active: true
    };
    saveCoupons([...coupons, coupon]);
    setNewCoupon({});
  };

  const handleToggleCoupon = (id: string) => {
    saveCoupons(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleDeleteCoupon = (id: string) => {
    if (!confirm('確定要刪除？')) return;
    saveCoupons(coupons.filter(c => c.id !== id));
  };

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    saveOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleUpdateShipping = (orderId: string, tracking_number: string, shipping_status: string) => {
    saveOrders(orders.map(o => o.id === orderId ? { ...o, tracking_number, shipping_status } : o));
  };

  const handleSaveSOP = () => localStorage.setItem('admin_sop', sopContent);
  const handleSaveMemberLevels = (levels: MemberLevel[]) => {
    setMemberLevels(levels);
    localStorage.setItem('admin_member_levels', JSON.stringify(levels));
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-dark-50">
      <header className="bg-dark-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">後台管理系統</h1>
              <p className="text-xs text-dark-400">Admin Dashboard</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg">
            <LogOut className="w-4 h-4" /> 登出
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'orders', icon: Package, label: '訂單' },
            { key: 'products', icon: Package, label: '產品' },
            { key: 'coupons', icon: Tag, label: '優惠券' },
            { key: 'members', icon: Users, label: '會員' },
            { key: 'sop', icon: FileText, label: 'SOP' },
            { key: 'settings', icon: Settings, label: '設定' },
            { key: 'stats', icon: BarChart3, label: '統計' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${activeTab === tab.key ? 'bg-primary-600 text-white' : 'bg-white text-dark-600 hover:bg-dark-100'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-dark-500">尚無訂單</div>
            ) : orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-4 border">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                  <div>
                    <p className="font-medium">訂單 {order.id.slice(0, 8)}</p>
                    <p className="text-sm text-dark-500">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <select value={order.status} onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="px-3 py-1 border rounded-lg text-sm">
                      <option value="pending">待處理</option>
                      <option value="processing">處理中</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                </div>
                <div className="mb-2">
                  {order.items?.map((item: any, i: number) => (
                    <p key={i} className="text-sm">{item.name} x{item.quantity}</p>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-dark-500">總金額：</span>
                    <span className="font-bold text-primary-600">{formatPrice(order.total)}</span>
                    {order.discount > 0 && <span className="text-green-600 ml-2">(-{formatPrice(order.discount)})</span>}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <select value={order.shipping_status || 'pending'} onChange={e => handleUpdateShipping(order.id, order.tracking_number || '', e.target.value)}
                      className="text-sm border rounded px-2 py-1">
                      <option value="pending">待出貨</option>
                      <option value="shipped">已出貨</option>
                      <option value="delivered">已送達</option>
                    </select>
                  </div>
                  <input type="text" placeholder="追蹤號碼" value={order.tracking_number || ''}
                    onChange={e => handleUpdateShipping(order.id, e.target.value, order.shipping_status || 'pending')}
                    className="text-sm border rounded px-2 py-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold mb-3">新增產品</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <input placeholder="名稱" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="border rounded px-3 py-2" />
                <input type="number" placeholder="售價" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: +e.target.value})} className="border rounded px-3 py-2" />
                <input type="number" placeholder="原價" value={newProduct.original_price || ''} onChange={e => setNewProduct({...newProduct, original_price: +e.target.value})} className="border rounded px-3 py-2" />
                <input placeholder="分類" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="border rounded px-3 py-2" />
                <input type="number" placeholder="庫存" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: +e.target.value})} className="border rounded px-3 py-2" />
                <button onClick={handleAddProduct} className="bg-primary-600 text-white rounded px-4 py-2 col-span-2 md:col-span-5">新增</button>
              </div>
            </div>
            <div className="bg-white rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-50">
                  <tr>
                    <th className="text-left p-3">產品</th>
                    <th className="text-left p-3">分類</th>
                    <th className="text-right p-3">售價</th>
                    <th className="text-right p-3">原價</th>
                    <th className="text-right p-3">庫存</th>
                    <th className="text-center p-3">發布</th>
                    <th className="text-center p-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">{p.name}</td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3 text-right font-bold text-primary-600">{formatPrice(p.price)}</td>
                      <td className="p-3 text-right text-dark-400 line-through">{formatPrice(p.original_price)}</td>
                      <td className="p-3 text-right">
                        <span className={p.stock < 10 ? 'text-red-500' : ''}>{p.stock}</span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => {
                          const newProducts = products.map(prod => prod.id === p.id ? { ...prod, published: !prod.published } : prod);
                          saveProducts(newProducts);
                        }} className={`px-2 py-1 rounded text-xs ${p.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.published ? '已發布' : '未發布'}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleEditProduct(p)} className="text-blue-600 mr-2"><Edit className="w-4 h-4 inline" /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coupons */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-bold mb-3">新增優惠券</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <input placeholder="優惠碼" value={newCoupon.code || ''} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="border rounded px-3 py-2" />
                <select value={newCoupon.discount_type || 'fixed'} onChange={e => setNewCoupon({...newCoupon, discount_type: e.target.value as any})} className="border rounded px-3 py-2">
                  <option value="fixed">固定金額</option>
                  <option value="percent">百分比</option>
                </select>
                <input type="number" placeholder="折扣" value={newCoupon.discount_value || ''} onChange={e => setNewCoupon({...newCoupon, discount_value: +e.target.value})} className="border rounded px-3 py-2" />
                <input type="number" placeholder="最低消費" value={newCoupon.min_purchase || ''} onChange={e => setNewCoupon({...newCoupon, min_purchase: +e.target.value})} className="border rounded px-3 py-2" />
                <input type="date" value={newCoupon.valid_until || ''} onChange={e => setNewCoupon({...newCoupon, valid_until: e.target.value})} className="border rounded px-3 py-2" />
                <button onClick={handleAddCoupon} className="bg-primary-600 text-white rounded px-4 py-2">新增</button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {coupons.map(c => (
                <div key={c.id} className={`bg-white rounded-xl p-4 border ${!c.active ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-lg">{c.code}</span>
                      <p className="text-sm text-dark-500">
                        {c.discount_type === 'percent' ? `${c.discount_value}%` : formatPrice(c.discount_value)} 折扣
                        {c.min_purchase > 0 && `，滿 ${formatPrice(c.min_purchase)}`}
                      </p>
                      <p className="text-xs text-dark-400">期限：{c.valid_until} | 已用：{c.used_count}/{c.max_uses}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleCoupon(c.id)} className={`px-2 py-1 rounded text-sm ${c.active ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                        {c.active ? '啟用' : '停用'}
                      </button>
                      <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold mb-4">會員等級設定</h3>
              <div className="space-y-3">
                {memberLevels.map((level, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-dark-50 rounded-lg">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: level.color }}></div>
                    <input value={level.name} onChange={e => {
                      const newLevels = [...memberLevels];
                      newLevels[i].name = e.target.value;
                      handleSaveMemberLevels(newLevels);
                    }} className="border rounded px-2 py-1" />
                    <span>消費滿</span>
                    <input type="number" value={level.min_purchase} onChange={e => {
                      const newLevels = [...memberLevels];
                      newLevels[i].min_purchase = +e.target.value;
                      handleSaveMemberLevels(newLevels);
                    }} className="border rounded px-2 py-1 w-24" />
                    <span>享</span>
                    <input type="number" value={level.discount} onChange={e => {
                      const newLevels = [...memberLevels];
                      newLevels[i].discount = +e.target.value;
                      handleSaveMemberLevels(newLevels);
                    }} className="border rounded px-2 py-1 w-16" />
                    <span>% 折扣</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold mb-4">會員列表</h3>
              <p className="text-dark-500">（需連接正式資料庫）</p>
            </div>
          </div>
        )}

        {/* SOP */}
        {activeTab === 'sop' && (
          <div className="bg-white rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">客服 SOP 管理</h2>
              <button onClick={handleSaveSOP} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Save className="w-4 h-4" /> 儲存
              </button>
            </div>
            <textarea value={sopContent} onChange={e => setSopContent(e.target.value)} className="w-full h-96 border rounded-lg p-4 font-mono text-sm" />
            <p className="text-sm text-dark-500 mt-2">* 使用 Markdown 格式</p>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Mail className="w-5 h-5" /> Email 設定</h3>
              <div className="space-y-3">
                <input placeholder="SMTP Host" className="w-full border rounded px-3 py-2" />
                <input placeholder="SMTP Port" className="w-full border rounded px-3 py-2" />
                <input placeholder="Email帳號" className="w-full border rounded px-3 py-2" />
                <input type="password" placeholder="密碼" className="w-full border rounded px-3 py-2" />
                <button className="bg-primary-600 text-white px-4 py-2 rounded">儲存</button>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5" /> LINE 機器人設定</h3>
              <div className="space-y-3">
                <input placeholder="LINE Channel Access Token" className="w-full border rounded px-3 py-2" />
                <input placeholder="LINE Channel Secret" className="w-full border rounded px-3 py-2" />
                <button className="bg-primary-600 text-white px-4 py-2 rounded">儲存</button>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" /> 金流設定</h3>
              <div className="space-y-3">
                <input placeholder="金流 API Key" className="w-full border rounded px-3 py-2" />
                <button className="bg-primary-600 text-white px-4 py-2 rounded">儲存</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {activeTab === 'stats' && (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8 text-primary-600" />
                <span className="text-dark-600">總訂單</span>
              </div>
              <p className="text-3xl font-bold">{orders.length}</p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Tag className="w-8 h-8 text-green-600" />
                <span className="text-dark-600">總營收</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{formatPrice(orders.reduce((s, o) => s + (o.total || 0), 0))}</p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Truck className="w-8 h-8 text-purple-600" />
                <span className="text-dark-600">待出貨</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-orange-600" />
                <span className="text-dark-600">產品數</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">{products.length}</p>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">編輯產品</h3>
              <button onClick={() => setEditingProduct(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="名稱" className="w-full border rounded px-3 py-2" />
              <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: +e.target.value})} placeholder="售價" className="w-full border rounded px-3 py-2" />
              <input type="number" value={editingProduct.original_price} onChange={e => setEditingProduct({...editingProduct, original_price: +e.target.value})} placeholder="原價" className="w-full border rounded px-3 py-2" />
              <input value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} placeholder="分類" className="w-full border rounded px-3 py-2" />
              <input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: +e.target.value})} placeholder="庫存" className="w-full border rounded px-3 py-2" />
              <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} placeholder="簡短描述" className="w-full border rounded px-3 py-2" rows={2} />
              <textarea value={editingProduct.intro || ''} onChange={e => setEditingProduct({...editingProduct, intro: e.target.value})} placeholder="軟體介紹（可使用換行）" className="w-full border rounded px-3 py-2" rows={6} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingProduct.published} onChange={e => setEditingProduct({...editingProduct, published: e.target.checked})} />
                發布到首頁
              </label>
              <button onClick={handleSaveProduct} className="w-full bg-primary-600 text-white py-2 rounded">儲存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
