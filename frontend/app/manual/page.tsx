'use client';

import { useState, useEffect } from 'react';
import { Check, X, ShoppingCart, Star, Zap, Shield, HeadphonesIcon, BookOpen, Download, Printer } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

export default function ManualPage() {
  const [products, setProducts] = useState<Product[]>([]);

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

  const printManual = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Print-friendly header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-8 print:hidden">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                軟體介紹手冊
              </h1>
              <p className="text-slate-300 mt-2">智慧客服系統 - 產品功能說明</p>
            </div>
            <button
              onClick={printManual}
              className="flex items-center gap-2 bg-white text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100"
            >
              <Printer className="w-5 h-5" />
              列印手冊
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 print:px-0 print:py-0">
        
        {/* Document Info */}
        <div className="text-center mb-12 print:mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">產品功能介紹</h2>
          <p className="text-slate-500">版本 1.0 | 2026年3月</p>
        </div>

        {/* Table of Contents */}
        <div className="bg-slate-50 rounded-xl p-6 mb-12 print:mb-8 print:p-4">
          <h3 className="font-bold text-lg mb-4">目錄</h3>
          <ol className="space-y-2 text-slate-600">
            <li>1. 系統概述</li>
            <li>2. 核心功能</li>
            <li>3. 產品方案</li>
            <li>4. 功能比較</li>
            <li>5. 技術規格</li>
            <li>6. 服務支援</li>
          </ol>
        </div>

        {/* Section 1: Overview */}
        <section className="mb-12 print:mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-slate-200 pb-2">
            1. 系統概述
          </h2>
          <div className="prose max-w-none text-slate-600">
            <p className="mb-4">
              智慧客服系統是一套結合人工智慧與客戶服務的全方位解決方案。我們致力於幫助企業提供最專業、快速、溫暖的客戶服務體驗。
            </p>
            <p>
              透過 AI 技術與人性化關懷的結合，讓每位客戶都能感受到貼心的服務，同時大幅提升客服效率，降低營運成本。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-slate-600">全天候服務</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">99%</div>
              <div className="text-sm text-slate-600">客戶滿意度</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">50K+</div>
              <div className="text-sm text-slate-600">服務客戶</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">&lt;30s</div>
              <div className="text-sm text-slate-600">平均回應時間</div>
            </div>
          </div>
        </section>

        {/* Section 2: Core Features */}
        <section className="mb-12 print:mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-slate-200 pb-2">
            2. 核心功能
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">AI 智慧對話</h3>
                <p className="text-slate-600">使用最新的 AI 模型，能夠理解客戶意圖並給予精準回覆。支援自然語言處理，讓對話更加流暢自然。</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">RAG 知識庫</h3>
                <p className="text-slate-600">強大的檢索增強生成功能，能夠從企業文件、FAQ、產品手冊中快速擷取相關資訊，提供準確的回答。</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <HeadphonesIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">多管道整合</h3>
                <p className="text-slate-600">支援 LINE、Facebook、Instagram、Email、網站即時聊天等多種管道，統一收件匣管理，不錯過任何客戶訊息。</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">數據分析儀表板</h3>
                <p className="text-slate-600">即時顯示客服滿意度、響應時間、熱門問題等關鍵指標，幫助企業優化服務品質。</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Products */}
        <section className="mb-12 print:mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-slate-200 pb-2">
            3. 產品方案
          </h2>

          <div className="space-y-6">
            {products.map((product, index) => (
              <div key={product.id} className="border border-slate-200 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{product.name}</h3>
                    <p className="text-slate-500">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</div>
                    {product.original_price > product.price && (
                      <div className="text-sm text-slate-400 line-through">
                        {formatPrice(product.original_price)}
                      </div>
                    )}
                  </div>
                </div>

                {product.intro && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 text-slate-600 whitespace-pre-line">
                    {product.intro}
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-slate-800 mb-2">功能特色：</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {product.features?.slice(0, 6).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Comparison */}
        <section className="mb-12 print:mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-slate-200 pb-2">
            4. 功能比較
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-4 border border-slate-200">功能</th>
                  {products.map(p => (
                    <th key={p.id} className="text-center p-4 border border-slate-200 font-bold">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI 智慧對話', [true, true, true]],
                  ['RAG 知識庫', [false, true, true]],
                  ['多管道整合 (LINE/FB)', [false, false, true]],
                  ['數據儀表板', [false, false, true]],
                  ['API 串接', [false, false, true]],
                  ['優先客服支援', [false, false, true]],
                  ['部門分工權限', [false, false, true]],
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="p-3 border border-slate-200 text-slate-600">{row[0]}</td>
                    {(row[1] as boolean[]).map((val, j) => (
                      <td key={j} className="text-center p-3 border border-slate-200">
                        {val ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Tech Specs */}
        <section className="mb-12 print:mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-slate-200 pb-2">
            5. 技術規格
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold mb-3">系統需求</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• 支援瀏覽器：Chrome、Firefox、Safari、Edge</li>
                <li>• 網路連線：穩定網路環境</li>
                <li>• 作業系統：Windows / macOS / Linux</li>
                <li>• 行動支援：iOS / Android 瀏覽器</li>
              </ul>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold mb-3">安全規格</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• 資料傳輸：SSL/TLS 加密</li>
                <li>• 資料儲存：加密儲存</li>
                <li>• 權限管理：角色權限控制</li>
                <li>• 備份機制：每日自動備份</li>
              </ul>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold mb-3">整合支援</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• RESTful API</li>
                <li>• LINE Messaging API</li>
                <li>• Facebook Messenger</li>
                <li>• Webhook 通知</li>
              </ul>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-bold mb-3">服務等級</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• 可用性：99.9%</li>
                <li>• 客服回應：24小時內</li>
                <li>• 系統更新：每月更新</li>
                <li>• 技術支援：Email / 電話</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 6: Support */}
        <section className="mb-12 print:mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-slate-200 pb-2">
            6. 服務支援
          </h2>

          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">聯繫資訊</h3>
            <div className="grid md:grid-cols-2 gap-4 text-slate-600">
              <div>
                <p className="font-medium">客服電話</p>
                <p>02-1234-5678</p>
              </div>
              <div>
                <p className="font-medium">電子郵件</p>
                <p>support@example.com</p>
              </div>
              <div>
                <p className="font-medium">服務時間</p>
                <p>週一至週五 9:00-18:00</p>
              </div>
              <div>
                <p className="font-medium">官方網站</p>
                <p>www.example.com</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm pt-8 border-t border-slate-200 print:hidden">
          <p>&copy; 2026 智慧客服系統. 版權所有。</p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { 
            font-size: 12pt; 
            line-height: 1.5;
          }
          section { 
            page-break-inside: avoid;
          }
          .print\\:hidden { 
            display: none !important;
          }
          .print\\:px-0 { 
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .print\\:py-0 { 
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:mb-8 { 
            margin-bottom: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
