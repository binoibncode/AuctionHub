import { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  token?: string;
  newPassword?: string;
};

function normalizeDoc<T extends Record<string, unknown>>(doc: T): T {
  if (doc && typeof doc === 'object' && '_id' in doc) {
    const normalized = { ...doc, id: String(doc._id), _id: undefined } as T;
    return normalized;
  }
  return doc;
}

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Request failed');
  }

  return json;
}

export const api = {
  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  clearToken() {
    localStorage.removeItem('auth_token');
  },

  getToken,

  async login(email: string, password: string) {
    return request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    phone?: string;
    city?: string;
    photoUrl?: string;
    purse?: number;
    isIcon?: boolean;
  }) {
    return request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async me() {
    return request<User>('/auth/me');
  },

  async updateMe(payload: Partial<User>) {
    return request<User>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async forgotPasswordDemo(email: string) {
    return request<{ message: string; newPassword?: string }>('/auth/forgot-password-demo', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async getAuctions() {
    const res = await request<Array<Record<string, unknown>>>('/auctions');
    const data = (res.data || []).map((item) => normalizeDoc(item));
    return { ...res, data };
  },

  async getAuctionById(id: string) {
    const res = await request<Record<string, unknown>>(`/auctions/${id}`);
    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async getAuctionByCode(code: string) {
    const res = await request<Record<string, unknown>>(`/auctions/code/${code}`);
    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async createAuction(payload: Record<string, unknown>) {
    const res = await request<Record<string, unknown>>('/auctions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async updateAuction(auctionId: string, payload: Record<string, unknown>) {
    const res = await request<Record<string, unknown>>(`/auctions/${auctionId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async updateAuctionStatus(auctionId: string, status: string) {
    const res = await request<Record<string, unknown>>(`/auctions/${auctionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async deleteAuction(auctionId: string) {
    return request<null>(`/auctions/${auctionId}`, { method: 'DELETE' });
  },

  async getPlayers(params?: { auctionId?: string; status?: string }) {
    const q = new URLSearchParams();
    if (params?.auctionId) q.set('auctionId', params.auctionId);
    if (params?.status) q.set('status', params.status);

    const suffix = q.toString() ? `?${q.toString()}` : '';
    const res = await request<Array<Record<string, unknown>>>(`/players${suffix}`);
    const data = (res.data || []).map((item) => normalizeDoc(item));
    return { ...res, data };
  },

  async purchasePlayer(playerId: string, teamId: string, amount: number) {
    const res = await request<Record<string, unknown>>(`/players/${playerId}/purchase`, {
      method: 'PATCH',
      body: JSON.stringify({ teamId, amount }),
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async updatePlayer(playerId: string, payload: Record<string, unknown>) {
    const res = await request<Record<string, unknown>>(`/players/${playerId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async deletePlayer(playerId: string) {
    return request<null>(`/players/${playerId}`, { method: 'DELETE' });
  },

  async markPlayerUnsold(playerId: string) {
    const res = await request<Record<string, unknown>>(`/players/${playerId}/unsold`, {
      method: 'PATCH',
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async getTeams(params?: { auctionId?: string }) {
    const q = new URLSearchParams();
    if (params?.auctionId) q.set('auctionId', params.auctionId);

    const suffix = q.toString() ? `?${q.toString()}` : '';
    const res = await request<Array<Record<string, unknown>>>(`/teams${suffix}`);
    const data = (res.data || []).map((item) => normalizeDoc(item));
    return { ...res, data };
  },

  async createTeam(payload: Record<string, unknown>) {
    const res = await request<Record<string, unknown>>('/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async updateTeam(teamId: string, payload: Record<string, unknown>) {
    const res = await request<Record<string, unknown>>(`/teams/${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async deleteTeam(teamId: string) {
    return request<null>(`/teams/${teamId}`, { method: 'DELETE' });
  },

  async createPlayer(payload: Record<string, unknown>) {
    const res = await request<Record<string, unknown>>('/players', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async registerPlayerForAuction(auctionCode: string, playerData: Record<string, unknown>) {
    return request<Record<string, unknown>>('/registrations/join', {
      method: 'POST',
      body: JSON.stringify({ auctionCode, playerData }),
    });
  },

  async getMyRegistrations() {
    const res = await request<Array<Record<string, unknown>>>('/registrations/me');
    const data = (res.data || []).map((item) => normalizeDoc(item));
    return { ...res, data };
  },

  async getPricingPlans() {
    const res = await request<Array<Record<string, unknown>>>('/pricing-plans');
    const data = (res.data || []).map((item) => normalizeDoc(item));
    return { ...res, data };
  },

  async createPricingPlan(payload: Record<string, unknown>) {
    const res = await request<Record<string, unknown>>('/pricing-plans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async updatePricingPlan(planId: string, payload: Record<string, unknown>) {
    const res = await request<Record<string, unknown>>(`/pricing-plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return {
      ...res,
      data: res.data ? normalizeDoc(res.data) : undefined,
    };
  },

  async deletePricingPlan(planId: string) {
    return request<null>(`/pricing-plans/${planId}`, { method: 'DELETE' });
  },
};
