'use client';

import { useState, useEffect } from 'react';
import { Check, X, ShoppingCart, MessageCircle, Star, Zap, Shield, HeadphonesIcon, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  category: string;
  features: string[];
  stock: number;
  published: boolean;
  intro: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('published', true)
        .order('price', { ascending: true });

      if (data) {
        setProducts(data.map(p => ({
          ...p,
          features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features
        })));
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const formatPrice = (price: number) => 
    new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);

  const addItem = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    alert('已加入購物車！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            智慧客服系統
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            結合 AI 人工智慧與人性化服務，打造最專業、快速、溫暖的客戶服務體驗
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-blue-100">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" /> 24/7 全天候服務
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" /> AI 智慧回覆
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" /> 多元整合
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            為什麼選擇我們？
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">快速部署</h3>
              <p className="text-slate-600">幾分鐘內即可上線，無需複雜設定</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">安全可靠</h3>
              <p className="text-slate-600">企業級資安保護，資料加密儲存</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeadphonesIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">專業支援</h3>
              <p className="text-slate-600">專屬客服團隊，解決各種問題</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">持續優化</h3>
              <p className="text-slate-600">定期更新功能，聆聽用戶回饋</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-4">
            選擇適合您的方案
          </h2>
          <p className="text-center text-slate-600 mb-12">
            根據您的需求，選擇最適合的客服系統
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                  index === 1 ? 'ring-2 ring-blue-500 transform md:-translate-y-4' : ''
                }`}
              >
                {index === 1 && (
                  <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium">
                    熱門推薦
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{product.name}</h3>
                  <p className="text-slate-600 mb-4">{product.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                    {product.original_price > product.price && (
                      <span className="text-lg text-slate-400 line-through ml-2">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>

                  {product.intro && (
                    <div className="mb-6 text-sm text-slate-600 whitespace-pre-line bg-slate-50 p-4 rounded-lg">
                      {product.intro}
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-medium text-slate-800 mb-3">功能特色：</h4>
                    <ul className="space-y-2">
                      {product.features?.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                      index === 1
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-800 text-white hover:bg-slate-900'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    立即購買
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">
            功能比較
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-4 px-4 font-bold text-slate-800">功能</th>
                  <th className="text-center py-4 px-4 font-bold text-slate-800">Starter</th>
                  <th className="text-center py-4 px-4 font-bold text-blue-600">Pro</th>
                  <th className="text-center py-4 px-4 font-bold text-slate-800">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI 智慧對話', true, true, true],
                  ['RAG 知識庫', false, true, true],
                  ['多管道整合 (LINE/FB)', false, false, true],
                  ['數據儀表板', false, false, true],
                  ['API 串接', false, false, true],
                  ['優先客服支援', false, false, true],
                  ['部門分工權限', false, false, true],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-slate-600">{row[0]}</td>
                    <td className="py-3 px-4 text-center">
                      {row[1] ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-4 text-center bg-blue-50">
                      {row[2] ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {row[3] ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">準備好升級您的客戶服務了嗎？</h2>
          <p className="text-xl text-blue-100 mb-8">
            立即開始免費試用，讓 AI 為您服務
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#products"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
            >
              開始試用 <ChevronRight className="w-5 h-5" />
            </a>
            <button
              onClick={() => {
                const chatBtn = document.querySelector('[data-chat-button]') as HTMLButtonElement;
                chatBtn?.click();
              }}
              className="px-8 py-4 bg-blue-500 bg-opacity-30 border border-white text-white rounded-xl font-bold hover:bg-opacity-40 transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" /> 聯繫客服
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 智慧客服系統. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-white transition-colors">隱私權政策</a>
            <a href="#" className="hover:text-white transition-colors">服務條款</a>
            <a href="#" className="hover:text-white transition-colors">聯繫我們</a>
          </div>
        </div>
      </div>
    </div>
  );
}
