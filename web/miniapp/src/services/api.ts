
const API_BASE = 'http://localhost:8080';

function getTelegramInitData(): string {
  const webApp = (window as any).Telegram?.WebApp;
  return webApp?.initData || '';
}

function getJwtToken(): string | null {
  return localStorage.getItem('jwt_token');
}

function authHeaders(includeContentType = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeContentType) headers['Content-Type'] = 'application/json';
  const token = getJwtToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const initData = getTelegramInitData();
  if (initData) headers['X-Telegram-InitData'] = initData;
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    if (res.status === 401) {
        throw new Error('Authentication required. Please login or connect Telegram.');
      }
      throw new Error(error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface AuthResponse {
  token: string;
  merchant_id: string;
  role: string;
}

export interface Invoice {
  id: string;
  amount: string;
  source_currency: string;
  dest_currency: string;
  dest_amount?: string;
  status: string;
  payment_link?: string;
  expires_at: string;
}

export interface Gateway {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_invoices: number;
  total_volume: number;
  total_settled: number;
  total_pending: number;
}

export interface Transaction {
  id: string;
  invoice_id: string;
  tx_hash: string;
  amount_src: string;
  amount_dst: string;
  status: string;
  created_at: string;
}

export const authApi = {
  registerEmail: (data: { name: string; email: string; password: string; settlement_address: string; settlement_currency: string }) =>
    request<AuthResponse>('/v2/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  loginEmail: (data: { email: string; password: string }) =>
    request<AuthResponse>('/v2/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  registerTelegram: (data: { name: string; settlement_address: string; settlement_currency: string }) =>
    request<AuthResponse>('/v2/merchants/register-tg', { method: 'POST', body: JSON.stringify(data) }),
};

export const invoiceApi = {
  create: (data: { amount: string; source_currency: string; dest_currency: string; dest_address?: string; expires_in?: number }) =>
    request<Invoice>('/v2/invoices', { method: 'POST', body: JSON.stringify(data) }),
  list: (limit = 20, offset = 0) =>
    request<Invoice[]>(`/v2/invoices?limit=${limit}&offset=${offset}`),
  get: (id: string) => request<Invoice>(`/v2/invoices/${id}`),
};

export const gatewayApi = {
  list: () => request<Gateway[]>('/v2/gateways'),
  create: (data: { name: string }) => request<Gateway>('/v2/gateways', { method: 'POST', body: JSON.stringify(data) }),
  revoke: (id: string) => request<void>(`/v2/gateways/${id}`, { method: 'DELETE' }),
  toggle: (id: string) => request<Gateway>(`/v2/gateways/${id}/toggle`, { method: 'POST' }),
};

export const statsApi = {
  get: () => request<DashboardStats>('/v2/stats'),
  recentTransactions: (limit = 10) => request<Transaction[]>(`/v2/stats/transactions?limit=${limit}`),
};

export const publicApi = {
  getInvoice: (id: string) => request<Invoice>(`/pay/${id}`),
  getQuote: (invoiceId: string) => request<any>(`/api/pay/quote?invoice_id=${invoiceId}`),
  getPairs: () => request<any[]>('/api/pay/pairs'),
};
