'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Users, BarChart3, LogOut, X, ShoppingCart, MessageCircle, Trash2 } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'stats'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);
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
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'orders' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-dark-600 hover:bg-dark-100'
            }`}
          >
            <Package className="w-5 h-5" /> 訂單管理
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'customers' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-dark-600 hover:bg-dark-100'
            }`}
          >
            <Users className="w-5 h-5" /> 客戶管理
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'stats' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-dark-600 hover:bg-dark-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" /> 數據統計
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
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        order.status === 'completed' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status === 'pending' ? '待處理' : order.status}
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

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-dark-900 mb-4">客戶列表</h2>
            <div className="text-center text-dark-500 py-8">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>客戶管理功能開發中...</p>
            </div>
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
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                  <span className="text-dark-600">總營收</span>
                </div>
                <p className="text-3xl font-bold text-green-600">{formatPrice(orders.reduce((sum, o) => sum + (o.total || 0), 0))}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <span className="text-dark-600">待處理</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="w-8 h-8 text-orange-600" />
                  <span className="text-dark-600">已完成</span>
                </div>
                <p className="text-3xl font-bold text-orange-600">{orders.filter(o => o.status === 'completed').length}</p>
              </div>
            </div>

            {/* Recent Orders Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-dark-900 mb-4">最近訂單</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-200">
                      <th className="text-left py-3 px-4 text-dark-600">訂單編號</th>
                      <th className="text-left py-3 px-4 text-dark-600">日期</th>
                      <th className="text-left py-3 px-4 text-dark-600">狀態</th>
                      <th className="text-right py-3 px-4 text-dark-600">金額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-b border-dark-100">
                        <td className="py-3 px-4 text-dark-900">{order.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4 text-dark-600">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {order.status === 'pending' ? '待處理' : '已完成'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-primary-600">{formatPrice(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
