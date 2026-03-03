'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Trash2, LogOut, LogIn, Menu, X, ChevronDown, ShoppingCart, Globe, Plus, Minus, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart, CartProvider } from '@/lib/cart-context';
import type { Product, Message, ChatSession } from '@/lib/types';

const translations = {
  zh: {
    welcome: '歡迎來到智慧客服',
    about: '關於我們',
    products: '產品介紹',
    contact: '聯繫我們',
    login: '登入',
    logout: '登出',
    register: '註冊',
    chat: '開始諮詢',
    aiChat: 'AI 客服助手',
    askQuestion: '輸入您的問題...',
    noMessages: '您好！我是 AI 客服助手',
    noMessagesDesc: '請告訴我您的問題，我很樂意幫助您',
    cart: '購物車',
    checkout: '結帳',
    addToCart: '加入購物車',
    total: '總計',
    emptyCart: '購物車是空的',
    orderSuccess: '訂單已建立',
    admin: '後台管理',
    orders: '訂單管理',
    customers: '客戶管理',
    statistics: '數據統計',
    language: '語言',
  },
  en: {
    welcome: 'Welcome to Smart Customer Service',
    about: 'About Us',
    products: 'Products',
    contact: 'Contact Us',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    chat: 'Start Chat',
    aiChat: 'AI Assistant',
    askQuestion: 'Enter your question...',
    noMessages: 'Hello! I am AI Assistant',
    noMessagesDesc: 'Tell me your question, I am happy to help',
    cart: 'Shopping Cart',
    checkout: 'Checkout',
    addToCart: 'Add to Cart',
    total: 'Total',
    emptyCart: 'Cart is empty',
    orderSuccess: 'Order Created',
    admin: 'Admin',
    orders: 'Orders',
    customers: 'Customers',
    statistics: 'Statistics',
    language: 'Language',
  }
};

type Lang = 'zh' | 'en';

function MainContent() {
  const [lang, setLang] = useState<Lang>('zh');
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'intro' | 'products'>('intro');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [shouldPromptRegister, setShouldPromptRegister] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, total: cartTotal } = useCart();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedAnonymousId = localStorage.getItem('anonymousId');
    const storedLang = localStorage.getItem('lang') as Lang;

    if (storedLang) setLang(storedLang);
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else if (!storedAnonymousId) {
      const newAnonymousId = 'anon_' + Math.random().toString(36).substring(2);
      localStorage.setItem('anonymousId', newAnonymousId);
      setAnonymousId(newAnonymousId);
    } else {
      setAnonymousId(storedAnonymousId);
    }

    loadProducts();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (token || anonymousId) {
      loadChatHistory();
    }
  }, [token, anonymousId]);

  const loadProducts = async () => {
    try {
      const storedProducts = localStorage.getItem('admin_products');
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        const productsWithFeatures = parsed.map((p: any) => ({
          ...p,
          features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features
        }));
        setProducts(productsWithFeatures);
      } else {
        const data = await api.products.list();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      const data = await api.products.list();
      setProducts(data.products);
    }
  };

  const loadChatHistory = async () => {
    try {
      const data = await api.chat.history();
      setChatSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.chat.send({
        message: userMessage.content,
        sessionId: sessionId || undefined,
        anonymousId: anonymousId || undefined,
      });

      setSessionId(response.sessionId);

      if (response.shouldPromptRegister && !token) {
        setShouldPromptRegister(true);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: lang === 'zh' ? '抱歉，發生了一些錯誤。請稍後再試。' : 'Sorry, something went wrong. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      if (authMode === 'register') {
        const data = await api.auth.register({ email, password, name });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      } else {
        const data = await api.auth.login({ email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }
      setShowAuthModal(false);
      loadChatHistory();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setMessages([]);
    setSessionId(null);
  };

  const handleClearChat = async () => {
    try {
      await api.chat.clear(sessionId || undefined);
      setMessages([]);
      setSessionId(null);
      loadChatHistory();
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          items: cartItems,
          total: cartTotal
        })
      }).then(r => r.json());

      if (response.success) {
        alert(lang === 'zh' ? '訂單已建立！' : 'Order created!');
        clearCart();
        setShowCartModal(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })));
    setSessionId(session.id);
    setShowHistory(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === 'zh' ? 'zh-TW' : 'en-US', { 
      style: 'currency', 
      currency: lang === 'zh' ? 'TWD' : 'USD' 
    }).format(price);
  };

  const toggleChat = () => setChatOpen(!chatOpen);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  // Admin functionality removed - use /admin/login instead

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-dark-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-900">{lang === 'zh' ? '智慧客服' : 'Smart Service'}</h1>
              <p className="text-xs text-dark-500">{lang === 'zh' ? '專業 · 快速 · 溫暖' : 'Professional · Fast · Warm'}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Language Selector */}
            <button 
              onClick={() => changeLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-2 text-dark-600 hover:text-primary-600"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm">{lang === 'zh' ? 'EN' : '中文'}</span>
            </button>

            {/* Cart Button */}
            <button 
              onClick={() => setShowCartModal(true)}
              className="relative p-2 text-dark-600 hover:text-primary-600"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* Admin Button - Removed for security */}
            {/* {user && user.role === 'admin' && (
              <button 
                onClick={openAdmin}
                className="p-2 text-dark-600 hover:text-primary-600"
              >
                <Settings className="w-5 h-5" />
              </button>
            )} */}

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-dark-600">{user.name}</span>
                <button onClick={handleLogout} className="btn-secondary flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> {t.logout}
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="btn-primary flex items-center gap-2">
                <LogIn className="w-4 h-4" /> {t.login}
              </button>
            )}
          </div>

          <button 
            className="md:hidden p-2" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-dark-200 p-4 space-y-3">
          <button 
            onClick={() => changeLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-2 text-dark-600"
          >
            <Globe className="w-5 h-5" /> {lang === 'zh' ? '切換英文' : 'Switch to Chinese'}
          </button>
          <button 
            onClick={() => setShowCartModal(true)}
            className="flex items-center gap-2 text-dark-600"
          >
            <ShoppingCart className="w-5 h-5" /> {t.cart} ({cartItems.length})
          </button>
          {user ? (
            <>
              {/* Admin link removed */}
              <button onClick={handleLogout} className="btn-secondary w-full">
                {t.logout}
              </button>
            </>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="btn-primary w-full">
              {t.login}
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="flex border-b border-dark-200">
              <button
                onClick={() => setActiveTab('intro')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'intro' 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' 
                    : 'text-dark-500 hover:text-dark-700'
                }`}
              >
                {t.about}
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'products' 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' 
                    : 'text-dark-500 hover:text-dark-700'
                }`}
              >
                {t.products}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'intro' ? (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <h2 className="text-3xl font-bold text-dark-900 mb-4">{t.welcome}</h2>
                    <p className="text-dark-600 text-lg leading-relaxed">
                      {lang === 'zh' 
                        ? '我們致力於提供最專業、快速、溫暖的客戶服務體驗。結合 AI 技術與人性化關懷，讓每位客戶都能感受到貼心的服務。'
                        : 'We are committed to providing the most professional, fast, and warm customer service experience. Combining AI technology with humanized care, we let every customer feel thoughtful service.'
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-primary-600">24/7</div>
                      <div className="text-dark-600">{lang === 'zh' ? '全天候服務' : '24/7 Service'}</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">99%</div>
                      <div className="text-dark-600">{lang === 'zh' ? '滿意度' : 'Satisfaction'}</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600">50K+</div>
                      <div className="text-dark-600">{lang === 'zh' ? '服務客戶' : 'Customers'}</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-orange-600">&lt;30s</div>
                      <div className="text-dark-600">{lang === 'zh' ? '平均回應' : 'Response'}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.filter(p => p.published).map(product => (
                    <div key={product.id} className="bg-dark-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-dark-900">{product.name}</h3>
                        <span className="text-primary-600 font-bold">{formatPrice(product.price)}</span>
                      </div>
                      <p className="text-dark-500 text-sm mb-2">{product.description}</p>
                      {product.intro && (
                        <div className="text-dark-600 text-sm mb-3 whitespace-pre-line bg-white p-3 rounded-lg">
                          {product.intro}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded-full text-dark-500">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <button 
                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price })}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" /> {t.addToCart}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-dark-900 mb-4">{t.contact}</h3>
              <div className="space-y-3 text-dark-600">
                <p>📞 {lang === 'zh' ? '電話' : 'Phone'}：02-1234-5678</p>
                <p>📧 Email：support@example.com</p>
                <p>💬 LINE@：@example</p>
                <p className="text-sm text-dark-500">{lang === 'zh' ? '週一至週五 09:00-18:00' : 'Mon-Fri 09:00-18:00'}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">{lang === 'zh' ? '需要立即協助？' : 'Need Help?'}</h3>
              <p className="text-primary-100 text-sm mb-4">
                {lang === 'zh' ? '點擊右下角的 AI 客服圖標開始諮詢' : 'Click the AI chat icon to start'}
              </p>
              <button 
                onClick={toggleChat}
                className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                {t.chat}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 bg-primary-600 hover:bg-primary-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          chatOpen ? 'scale-0' : 'scale-100'
        }`}
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-dark-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-dark-800 px-4 py-3 flex items-center justify-between border-b border-dark-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">{t.aiChat}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowHistory(!showHistory)} className="p-2 text-dark-400 hover:text-white">
                <ChevronDown className={`w-5 h-5 ${showHistory ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={handleClearChat} className="p-2 text-dark-400 hover:text-red-400">
                <Trash2 className="w-5 h-5" />
              </button>
              <button onClick={toggleChat} className="p-2 text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showHistory && (
            <div className="bg-dark-800 border-b border-dark-700 max-h-32 overflow-y-auto">
              {chatSessions.length > 0 ? (
                <div className="p-2">
                  {chatSessions.map(session => (
                    <button
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className="w-full text-left px-3 py-2 text-dark-300 hover:bg-dark-700 rounded-lg text-sm truncate"
                    >
                      {session.title || (lang === 'zh' ? '新對話' : 'New Chat')}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-dark-500 text-sm text-center">
                  {lang === 'zh' ? '尚無對話記錄' : 'No chat history'}
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-dark-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t.noMessages}</p>
                <p className="text-sm mt-2">{t.noMessagesDesc}</p>
              </div>
            )}
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="chat-bubble-ai">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {shouldPromptRegister && !token && (
            <div className="bg-primary-600/20 border-t border-primary-600/30 p-3 text-center">
              <p className="text-primary-300 text-sm mb-2">
                {lang === 'zh' ? '您已使用匿名諮詢 3 次' : 'You have used 3 times'}
              </p>
              <button onClick={() => setShowAuthModal(true)} className="btn-primary text-sm">
                {lang === 'zh' ? '註冊保存對話記錄' : 'Register to save chat'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-dark-800 p-4 border-t border-dark-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.askQuestion}
                className="flex-1 bg-dark-700 text-white border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-dark-400"
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="bg-primary-600 hover:bg-primary-700 disabled:bg-dark-600 text-white p-3 rounded-xl">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark-900">{t.cart}</h2>
              <button onClick={() => setShowCartModal(false)} className="text-dark-400 hover:text-dark-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-center text-dark-500 py-8">{t.emptyCart}</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                    <div className="flex-1">
                      <h4 className="font-medium text-dark-900">{item.name}</h4>
                      <p className="text-primary-600 font-bold">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-red-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">{t.total}</span>
                    <span className="text-xl font-bold text-primary-600">{formatPrice(cartTotal)}</span>
                  </div>
                  <button onClick={handleCheckout} className="btn-primary w-full flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" /> {t.checkout}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark-900">
                {authMode === 'login' ? t.login : t.register}
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="text-dark-400 hover:text-dark-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">
                    {lang === 'zh' ? '姓名' : 'Name'}
                  </label>
                  <input type="text" name="name" required className="input-field" placeholder={lang === 'zh' ? '您的姓名' : 'Your name'} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Email</label>
                <input type="email" name="email" required className="input-field" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">
                  {lang === 'zh' ? '密碼' : 'Password'}
                </label>
                <input type="password" name="password" required className="input-field" placeholder="••••••••" />
              </div>
              <button type="submit" className="btn-primary w-full">
                {authMode === 'login' ? t.login : t.register}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                {authMode === 'login' ? (lang === 'zh' ? '還沒有帳號？立即註冊' : 'No account? Register now') : (lang === 'zh' ? '已有帳號？立即登入' : 'Have account? Login')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <MainContent />
    </CartProvider>
  );
}
