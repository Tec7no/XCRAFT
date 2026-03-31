// src/lib/api.ts
// Base API client — reads token from localStorage (townteam_user)

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken(): string | null {
  try {
    // جرب الاتنين
    const raw = localStorage.getItem("townteam_user") || localStorage.getItem("townteam_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

interface ApiOptions extends RequestInit {
  auth?: boolean; // send Authorization header
}

export async function apiRequest<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { auth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp: (email: string) =>
    apiRequest("/auth/send-otp", { method: "POST", body: JSON.stringify({ email }) }),

  verifyOtp: (email: string, otp: string) =>
    apiRequest("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) }),

  signup: (data: { name: string; email: string; password: string; confirmPassword: string; phone?: string }) =>
    apiRequest("/auth/signup", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getProfile: () =>
    apiRequest("/auth/profile", { auth: true }),

  updateProfile: (data: { name?: string; phone?: string; addresses?: any[] }) =>
    apiRequest("/auth/profile", { method: "PATCH", auth: true, body: JSON.stringify(data) }),

  forgotPassword: (email: string) =>
    apiRequest("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    apiRequest("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params?: { category?: string; badge?: string; featured?: string; search?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return apiRequest(`/products${qs}`);
  },

  getOne: (id: string) =>
    apiRequest(`/products/${id}`),

  create: (data: any) =>
    apiRequest("/products", { method: "POST", auth: true, body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    apiRequest(`/products/${id}`, { method: "PUT", auth: true, body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiRequest(`/products/${id}`, { method: "DELETE", auth: true }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const ordersApi = {
  create: (data: any) =>
    apiRequest("/orders", { method: "POST", body: JSON.stringify(data) }),

  getMyOrders: () =>
    apiRequest("/orders/my", { auth: true }),

  // Admin
  getAll: (params?: { status?: string; archived?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params as any).toString() : "";
    return apiRequest(`/orders${qs}`, { auth: true });
  },

  getOne: (id: string) =>
    apiRequest(`/orders/${id}`, { auth: true }),

  updateStatus: (id: string, status: string, rejectionReason?: string) =>
    apiRequest(`/orders/${id}/status`, {
      method: "PATCH", auth: true,
      body: JSON.stringify({ status, rejectionReason }),
    }),

  archive: (id: string, archived: boolean) =>
    apiRequest(`/orders/${id}/archive`, {
      method: "PATCH", auth: true,
      body: JSON.stringify({ archived }),
    }),

  delete: (id: string) =>
    apiRequest(`/orders/${id}`, { method: "DELETE", auth: true }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () =>
    apiRequest("/admin/stats", { auth: true }),

  getUsers: () =>
    apiRequest("/admin/users", { auth: true }),

  deleteUser: (id: string) =>
    apiRequest(`/admin/users/${id}`, { method: "DELETE", auth: true }),

  updateUserRole: (id: string, role: string) =>
    apiRequest(`/admin/users/${id}/role`, { method: "PATCH", auth: true, body: JSON.stringify({ role }) }),
};
