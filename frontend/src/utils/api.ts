// API utility for making authenticated requests

// Prefer environment variable; in production, fall back to the hosted API if missing
const resolvedBaseEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
const API_BASE_URL =
  resolvedBaseEnv && resolvedBaseEnv.trim() !== ''
    ? resolvedBaseEnv
    : (import.meta as any).env?.PROD
      ? 'https://spexadmin.onrender.com'
      : 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge any additional headers
  if (fetchOptions.headers) {
    Object.assign(headers, fetchOptions.headers);
  }

  // Add JWT token if authentication is required
  if (requireAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  // Handle other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    const baseMsg = errorData.error || `HTTP ${response.status}`;
    const detailsMsg = errorData.details ? `: ${errorData.details}` : '';
    throw new Error(`${baseMsg}${detailsMsg}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * GET request
 */
export async function get<T>(endpoint: string, requireAuth = true): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET', requireAuth });
}

/**
 * POST request
 */
export async function post<T>(endpoint: string, data?: any, requireAuth = true): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth,
  });
}

/**
 * PUT request
 */
export async function put<T>(endpoint: string, data?: any, requireAuth = true): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    requireAuth,
  });
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string, requireAuth = true): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE', requireAuth });
}

// Specific API endpoints

/**
 * Authentication APIs
 */
export const authAPI = {
  login: (email: string, password: string) =>
    post<{ user: any; token: string }>('/api/auth/login', { email, password }, false),

  register: (data: any) => post<{ user: any; token: string }>('/api/auth/register', data, false),

  getCurrentUser: () => get<any>('/api/users/me'),
};

/**
 * User APIs
 */
export const userAPI = {
  getAll: () => get<{ users: any[] }>('/api/users'),

  getById: (id: string) => get<any>(`/api/users/${id}`),

  update: (id: string, data: any) => put<any>(`/api/users/${id}`, data),

  delete: (id: string) => del<any>(`/api/users/${id}`),

  updateProfile: (data: any) => put<any>('/api/users/me', data),

  updatePassword: (currentPassword: string, newPassword: string) =>
    put<{ message: string }>('/api/users/me/password', { currentPassword, newPassword }),

  updatePreferences: (foodpreference?: string, allergys?: string) =>
    put<any>('/api/users/me/preferences', { foodpreference, allergys }),
};

/**
 * Event APIs
 */
export const eventAPI = {
  getAll: () => get<{ events: any[] }>('/api/events'),

  getById: (id: string) => get<any>(`/api/events/${id}`),

  create: (data: any) => post<any>('/api/events', data),

  update: (id: string, data: any) => put<any>(`/api/events/${id}`, data),

  delete: (id: string) => del<any>(`/api/events/${id}`),

  rsvp: (eventId: string, userId: string, status: 'yes' | 'no') =>
    post<any>(`/api/events/${eventId}/rsvp/${userId}`, { status }),
};

/**
 * Group APIs
 */
export const groupAPI = {
  getAll: () => get<{ groups: any[] }>('/api/groups'),

  getById: (id: string) => get<any>(`/api/groups/${id}`),

  create: (data: any) => post<any>('/api/groups', data),

  update: (id: string, data: any) => put<any>(`/api/groups/${id}`, data),

  delete: (id: string) => del<any>(`/api/groups/${id}`),

  addMember: (groupId: string, userId: string) =>
    post<any>(`/api/groups/${groupId}/members/${userId}`),

  removeMember: (groupId: string, userId: string) =>
    del<any>(`/api/groups/${groupId}/members/${userId}`),

  addManager: (groupId: string, userId: string) =>
    post<any>(`/api/groups/${groupId}/managers/${userId}`),

  removeManager: (groupId: string, userId: string) =>
    del<any>(`/api/groups/${groupId}/managers/${userId}`),
};

/**
 * Dashboard APIs
 */
export const dashboardAPI = {
  getStats: () =>
    get<{
      totalUsers: number;
      activeUsers: number;
      totalEvents: number;
      upcomingEvents: number;
      totalGroups: number;
      recentEvents: any[];
    }>('/api/dashboard/stats'),
};
