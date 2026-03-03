'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Users, BarChart3, LogOut, FileText, Plus, Edit, Trash2, X, Save } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  features: string;
}

const defaultProducts: Product[] = [
  { id: '1', name: '智慧客服系統 Enterprise', description: '全方位企業客服解決方案', price: 49900, category: '軟體', features: '["AI 智慧對話", "多管道整合", "數據儀表板"]' },
  { id: '2', name: '智慧客服系統 Pro', description: '專業級客服系統', price: 19900, category: '軟體', features: '["AI 對話", "RAG 知識庫"]' },
  { id: '3', name: '客服系統 Starter', description: '入門級客服系統', price: 4900, category: '軟體', features: '["基本對話", "產品目錄"]' },
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

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'sop' | 'customers' | 'stats'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [sopContent, setSopContent] = useState(defaultSOP);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Product>({ id: '', name: '', description: '', price: 0, category: '', features: '[]' });

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
    loadOrders();
    loadProducts();
    loadSOP();
  }, [router]);

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const loadProducts = () => {
    const stored = localStorage.getItem('admin_products');
    if (stored) {
      setProducts(JSON.parse(stored));
    } else {
      setProducts(defaultProducts);
      localStorage.setItem('admin_products', JSON.stringify(defaultProducts));
    }
  };

  const loadSOP = () => {
    const stored = localStorage.getItem('admin_sop');
    if (stored) {
      setSopContent(stored);
    } else {
      setSopContent(defaultSOP);
    }
  };

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('admin_products', JSON.stringify(newProducts));
  };

  const saveSOP = () => {
    localStorage.setItem('admin_sop', sopContent);
    alert('SOP 已儲存');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert('請填寫產品名稱和價格');
      return;
    }
    const product = { ...newProduct, id: Date.now().toString() };
    saveProducts([...products, product]);
    setNewProduct({ id: '', name: '', description: '', price: 0, category: '', features: '[]' });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;
    const newProducts = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    saveProducts(newProducts);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (!confirm('確定要刪除此產品？')) return;
    const newProducts = products.filter(p => p.id !== id);
    saveProducts(newProducts);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
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
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> 登出
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'orders' ? 'bg-primary-600 text-white' : 'bg-white text-dark-600 hover:bg-dark-100'
            }`}
          >
            <Package className="w-4 h-4" /> 訂單管理
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'products' ? 'bg-primary-600 text-white' : 'bg-white text-dark-600 hover:bg-dark-100'
            }`}
          >
            <Package className="w-4 h-4" /> 產品管理
          </button>
          <button
            onClick={() => setActiveTab('sop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'sop' ? 'bg-primary-600 text-white' : 'bg-white text-dark-600 hover:bg-dark-100'
            }`}
          >
            <FileText className="w-4 h-4" /> SOP 管理
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'stats' ? 'bg-primary-600 text-white' : 'bg-white text-dark-600 hover:bg-dark-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> 數據統計
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-dark-900 mb-4">訂單列表</h2>
            {orders.length === 0 ? (
              <p className="text-center text-dark-500 py-8">尚無訂單</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-dark-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-dark-900">訂單編號：{order.id.slice(0, 8)}...</p>
                        <p className="text-sm text-dark-500">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {order.status === 'pending' ? '待處理' : '已完成'}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items?.map((item: any, i: number) => (
                        <p key={i} className="text-sm text-dark-600">
                          {item.name} x{item.quantity} - {formatPrice(item.price * item.quantity)}
                        </p>
                      ))}
                    </div>
                    <p className="text-lg font-bold text-primary-600">總金額：{formatPrice(order.total)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Add Product Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> 新增產品
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="產品名稱"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="px-4 py-2 border border-dark-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="價格"
                  value={newProduct.price || ''}
                  onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  className="px-4 py-2 border border-dark-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="分類"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="px-4 py-2 border border-dark-200 rounded-lg"
                />
                <button onClick={handleAddProduct} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> 新增
                </button>
              </div>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark-900 mb-4">產品列表</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-200">
                      <th className="text-left py-3 px-4 text-dark-600">產品名稱</th>
                      <th className="text-left py-3 px-4 text-dark-600">分類</th>
                      <th className="text-right py-3 px-4 text-dark-600">價格</th>
                      <th className="text-center py-3 px-4 text-dark-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b border-dark-100">
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary-600">{formatPrice(product.price)}</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleEditProduct(product)} className="text-blue-600 hover:text-blue-800 mr-2">
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SOP Tab */}
        {activeTab === 'sop' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark-900">客服 SOP 管理</h2>
              <button onClick={saveSOP} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
                <Save className="w-4 h-4" /> 儲存
              </button>
            </div>
            <textarea
              value={sopContent}
              onChange={e => setSopContent(e.target.value)}
              className="w-full h-96 px-4 py-2 border border-dark-200 rounded-lg font-mono text-sm"
              placeholder="輸入 SOP 內容..."
            />
            <p className="text-sm text-dark-500 mt-2">* 使用 Markdown 格式編輯，AI 客服會根據此內容回答客戶問題</p>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-8 h-8 text-primary-600" />
                  <span className="text-dark-600">總訂單</span>
                </div>
                <p className="text-3xl font-bold text-dark-900">{orders.length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-8 h-8 text-green-600" />
                  <span className="text-dark-600">總營收</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{formatPrice(orders.reduce((sum, o) => sum + (o.total || 0), 0))}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-8 h-8 text-purple-600" />
                  <span className="text-dark-600">待處理</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-8 h-8 text-orange-600" />
                  <span className="text-dark-600">產品數</span>
                </div>
                <p className="text-3xl font-bold text-orange-600">{products.length}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">編輯產品</h3>
              <button onClick={() => setEditingProduct(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">產品名稱</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-4 py-2 border border-dark-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">價格</label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-dark-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分類</label>
                <input
                  type="text"
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="w-full px-4 py-2 border border-dark-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <textarea
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full px-4 py-2 border border-dark-200 rounded-lg"
                  rows={3}
                />
              </div>
              <button onClick={handleSaveProduct} className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700">
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
