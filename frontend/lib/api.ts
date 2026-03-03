const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const anonymousId = typeof window !== 'undefined' ? localStorage.getItem('anonymousId') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(anonymousId && { 'X-Anonymous-Id': anonymousId }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      fetchAPI<{ token: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      fetchAPI<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => fetchAPI<{ user: any }>('/api/auth/me'),
    anonymous: (anonymousId: string) =>
      fetchAPI<{ anonymousId: string; messageCount: number; shouldPromptRegister: boolean }>('/api/auth/anonymous', {
        method: 'POST',
        body: JSON.stringify({ anonymousId }),
      }),
  },

  chat: {
    send: (data: { message: string; sessionId?: string; anonymousId?: string }) =>
      fetchAPI<{ 
        sessionId: string; 
        message: string; 
        shouldPromptRegister: boolean 
      }>('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    history: () =>
      fetchAPI<{ sessions: any[] }>('/api/chat/history'),
    clear: (sessionId?: string) =>
      fetchAPI<{ message: string }>('/api/chat/clear', {
        method: 'DELETE',
        body: JSON.stringify({ sessionId }),
      }),
  },

  products: {
    list: () => fetchAPI<{ products: any[] }>('/api/products'),
    get: (id: string) => fetchAPI<{ product: any }>(`/api/products/${id}`),
  },

  sop: {
    search: (query: string) =>
      fetchAPI<{ results: any[] }>(`/api/sop/search?q=${encodeURIComponent(query)}`),
  },
};
