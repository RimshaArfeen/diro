const API_BASE = '/api';

function getToken() {
  const stored = localStorage.getItem('diro_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored).token;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    // Handle validation errors with multiple messages
    let errorMessage = data.error || data.message || 'Request failed';
    if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
      errorMessage = data.messages.join('; ');
    }
    const error = new Error(errorMessage);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Auth
export const authAPI = {
  login: (email, password, role) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) }),
  register: (name, email, password, role) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) }),
  googleLogin: (credential, role) =>
    request('/auth/google', { method: 'POST', body: JSON.stringify({ credential, role }) }),
};

// Users
export const usersAPI = {
  getProfile: () => request('/users/me'),
  updateProfile: (data) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getWallet: () => request('/users/me/wallet'),
  linkSocial: (platform, accountId) =>
    request('/users/me/social', { method: 'POST', body: JSON.stringify({ platform, accountId }) }),
  listUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/users${qs ? `?${qs}` : ''}`);
  },
};

// Campaigns
export const campaignsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/campaigns${qs ? `?${qs}` : ''}`);
  },
  get: (campaignId) => request(`/campaigns/${campaignId}`),
  create: (data) =>
    request('/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  update: (campaignId, data) =>
    request(`/campaigns/${campaignId}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (campaignId, status) =>
    request(`/campaigns/${campaignId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (campaignId) =>
    request(`/campaigns/${campaignId}`, { method: 'DELETE' }),
  analytics: (campaignId) => request(`/campaigns/${campaignId}/analytics`),
};

// Clips
export const clipsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/clips${qs ? `?${qs}` : ''}`);
  },
  get: (clipId) => request(`/clips/${clipId}`),
  submit: (data) =>
    request('/clips', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (clipId, status) =>
    request(`/clips/${clipId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  updateViews: (clipId, views) =>
    request(`/clips/${clipId}/views`, { method: 'PUT', body: JSON.stringify({ views }) }),
  myAnalytics: () => request('/clips/analytics/me'),
  delete: (clipId) => request(`/clips/${clipId}`, { method: 'DELETE' }),
};

// Payments
export const paymentsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/payments${qs ? `?${qs}` : ''}`);
  },
  get: (paymentId) => request(`/payments/${paymentId}`),
  deposit: (data) =>
    request('/payments/deposit', { method: 'POST', body: JSON.stringify(data) }),
  payout: (data) =>
    request('/payments/payout', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (paymentId, status) =>
    request(`/payments/${paymentId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  audit: () => request('/payments/audit'),
};

// Admin
export const adminAPI = {
  dashboard: () => request('/admin/dashboard'),
  getSettings: () => request('/admin/settings'),
  updateSettings: (data) =>
    request('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  // Toggle campaign creation permission for a brand
  updateBrandPermission: (brandId, canCreateCampaign) =>
    request(`/admin/brand/${brandId}/permission`, {
      method: 'PATCH',
      body: JSON.stringify({ canCreateCampaign }),
    }),
};
