'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Lock, LogIn } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Hardcoded admin check
    if (email === 'admin@system.com' && password === 'ADMIN') {
      const adminUser = { id: 'admin-001', email: 'admin@system.com', name: '系統管理員', role: 'admin' };
      const fakeToken = 'admin-token-' + Date.now();
      localStorage.setItem('adminToken', fakeToken);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      router.push('/admin/dashboard');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        router.push('/admin/dashboard');
      } else {
        setError('無效的帳號或密碼');
      }
    } catch (err) {
      setError('登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">後台管理系統</h1>
          <p className="text-dark-400 mt-2">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-dark-900 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            管理員登入
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">帳號 (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="admin@system.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-dark-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="ADMIN"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? '登入中...' : <><LogIn className="w-5 h-5" /> 登入</>}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>預設帳號：</strong> admin@system.com<br />
              <strong>預設密碼：</strong> ADMIN
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-primary-400 hover:text-primary-300 text-sm">
            ← 返回首頁
          </a>
        </div>
      </div>
    </div>
  );
}
