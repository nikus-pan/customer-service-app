'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Trash2, User, LogOut, LogIn, Menu, X, ChevronDown, ChevronUp, Package, ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api';
import type { Product, Message, ChatSession } from '@/lib/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'intro' | 'products'>('intro');
  const [showAuthModal, setShowAuthModal] = useState(false);
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
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedAnonymousId = localStorage.getItem('anonymousId');

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
      const data = await api.products.list();
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to load products:', error);
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
    setMessageCount(prev => prev + 1);

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
        content: '抱歉，發生了一些錯誤。請稍後再試。',
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
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);
  };

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
              <h1 className="text-xl font-bold text-dark-900">智慧客服</h1>
              <p className="text-xs text-dark-500">專業 · 快速 · 溫暖</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-dark-600">{user.name}</span>
                <button onClick={handleLogout} className="btn-secondary flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> 登出
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="btn-primary flex items-center gap-2">
                <LogIn className="w-4 h-4" /> 登入
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
        <div className="md:hidden bg-white border-b border-dark-200 p-4">
          {user ? (
            <div className="flex flex-col gap-3">
              <span className="text-dark-600">{user.name}</span>
              <button onClick={handleLogout} className="btn-secondary">
                登出
              </button>
            </div>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="btn-primary w-full">
              登入
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          {/* Left Panel - Company Intro */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-dark-200">
              <button
                onClick={() => setActiveTab('intro')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'intro' 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' 
                    : 'text-dark-500 hover:text-dark-700'
                }`}
              >
                關於我們
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  activeTab === 'products' 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50' 
                    : 'text-dark-500 hover:text-dark-700'
                }`}
              >
                產品介紹
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'intro' ? (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <h2 className="text-3xl font-bold text-dark-900 mb-4">歡迎來到智慧客服</h2>
                    <p className="text-dark-600 text-lg leading-relaxed">
                      我們致力於提供最專業、快速、溫暖的客戶服務體驗。
                      結合 AI 技術與人性化關懷，讓每位客戶都能感受到貼心的服務。
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-primary-600">24/7</div>
                      <div className="text-dark-600">全天候服務</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">99%</div>
                      <div className="text-dark-600">滿意度</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600">50K+</div>
                      <div className="text-dark-600">服務客戶</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-orange-600">&lt;30s</div>
                      <div className="text-dark-600">平均回應</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-dark-900">我們的價值</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 font-bold">專</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-dark-900">專業</h4>
                          <p className="text-dark-500 text-sm">訓練有素的客服團隊與 AI 系統</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-bold">速</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-dark-900">快速</h4>
                          <p className="text-dark-500 text-sm">30 秒內回應您的問題</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-pink-600 font-bold">溫</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-dark-900">溫暖</h4>
                          <p className="text-dark-500 text-sm">用心傾聽，關心您的需求</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map(product => (
                    <div key={product.id} className="bg-dark-50 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-dark-900">{product.name}</h3>
                        <span className="text-primary-600 font-bold">{formatPrice(product.price)}</span>
                      </div>
                      <p className="text-dark-500 text-sm mb-}</p>
                      <div className="flex flex-wrap gap-23">{product.description">
                        {product.features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded-full text-dark-500">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - AI Chat */}
          <div className="bg-dark-900 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            {/* Chat Header */}
            <div className="bg-dark-800 px-4 py-3 flex items-center justify-between border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">AI 客服助手</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="p-2 text-dark-400 hover:text-white transition-colors"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={handleClearChat}
                  className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* History Panel */}
            {showHistory && (
              <div className="bg-dark-800 border-b border-dark-700 max-h-48 overflow-y-auto">
                {chatSessions.length > 0 ? (
                  <div className="p-2">
                    {chatSessions.map(session => (
                      <button
                        key={session.id}
                        onClick={() => loadSession(session)}
                        className="w-full text-left px-3 py-2 text-dark-300 hover:bg-dark-700 rounded-lg text-sm truncate"
                      >
                        {session.title || '新對話'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-dark-500 text-sm text-center">尚無對話記錄</div>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-dark-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>您好！我是 AI 客服助手</p>
                  <p className="text-sm mt-2">請告訴我您的問題，我很樂意幫助您</p>
                </div>
              )}
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                    }`}
                  >
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

            {/* Prompt Register */}
            {shouldPromptRegister && !token && (
              <div className="bg-primary-600/20 border-t border-primary-600/30 p-3 text-center">
                <p className="text-primary-300 text-sm mb-2">
                  您已使用匿名諮詢 3 次
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary text-sm"
                >
                  註冊保存對話記錄
                </button>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="bg-dark-800 p-4 border-t border-dark-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="輸入您的問題..."
                  className="flex-1 bg-dark-700 text-white border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-dark-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-dark-600 text-white p-3 rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-dark-900">
                {authMode === 'login' ? '登入' : '註冊'}
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="text-dark-400 hover:text-dark-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">姓名</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    placeholder="您的姓名"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1">密碼</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                {authMode === 'login' ? '登入' : '註冊'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                {authMode === 'login' ? '還沒有帳號？立即註冊' : '已有帳號？立即登入'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
