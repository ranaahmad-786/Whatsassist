/**
 * WhatsAssist - Enterprise Frontend API Client
 *
 * @author Muhammad Ahmad Khan - 24-ST-027
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('wa_token');
      localStorage.removeItem('wa_merchant');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
};

export const chatsAPI = {
  getSessions: () => api.get('/chats/sessions'),
  getMessages: (sessionId) => api.get(`/chats/sessions/${sessionId}/messages`),
  takeover: (sessionId) => api.post(`/chats/sessions/${sessionId}/takeover`),
  sendReply: (sessionId, message_text) => api.post(`/chats/sessions/${sessionId}/reply`, { message_text }),
  clearMessages: (sessionId) => api.delete(`/chats/sessions/${sessionId}/messages`),
  deleteSession: (sessionId) => api.delete(`/chats/sessions/${sessionId}`),
  deleteCustomer: (customerId) => api.delete(`/chats/customers/${customerId}`),
};

export const knowledgeAPI = {
  getDocuments: () => api.get('/knowledge/documents'),
  upload: (data) => api.post('/knowledge/upload', data),
  simulate: (query) => api.post('/knowledge/simulate', { query }),
  deleteDocument: (id) => api.delete(`/knowledge/documents/${id}`),
};

export const leadsAPI = {
  getLeads: () => api.get('/leads'),
  updateStatus: (id, status) => api.put(`/leads/${id}`, { status }),
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
};

export const whatsappAPI = {
  getStatus: () => api.get('/whatsapp/status'),
  connect: () => api.post('/whatsapp/connect'),
  pair: (phone) => api.post('/whatsapp/pair', { phone }),
  disconnect: (clearAuth = false) => api.post('/whatsapp/disconnect', { clearAuth }),
  send: (to, message) => api.post('/whatsapp/send', { to, message }),
  simulate: (data) => api.post('/whatsapp/simulate', data),
};

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, order_status) => api.put(`/orders/${id}/status`, { order_status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const repairsAPI = {
  getAll: () => api.get('/repairs'),
  track: (token) => api.get(`/repairs/track/${token}`),
  create: (data) => api.post('/repairs', data),
  update: (id, data) => api.put(`/repairs/${id}`, data),
  delete: (id) => api.delete(`/repairs/${id}`),
};

export default api;
