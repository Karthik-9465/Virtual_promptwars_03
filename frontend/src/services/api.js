import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const baseURL = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const apiInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AWS API Gateway Configuration (configurable via VITE_AWS_API_GATEWAY_URL)
const AWS_API_GATEWAY_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL || '';

// Request Interceptor: Attach JWT Token if it exists
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('carbon_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    
    if (status === 401) {
      // Clear credentials and force redirect to login on token expiration
      localStorage.removeItem('carbon_auth_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    const data = error.response ? error.response.data : null;
    const errorMessage = data && (data.error || data.message)
      ? (data.error || data.message)
      : error.message || 'An unexpected request error occurred';
      
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Formats user profile/form data into the structured schema accepted by AWS Lambda & API Gateway:
 * {
 *   transport: { mode, weeklyDistanceKm, flightHoursPerYear },
 *   homeEnergy: { location, electricityKwhM, acHoursPerDay },
 *   food: { diet },
 *   shopping: { frequency },
 *   waste: { recyclingRate }
 * }
 */
export const formatAwsPayload = (data = {}) => {
  return {
    transport: {
      mode: data.transportMode || 'public',
      weeklyDistanceKm: Number(data.weeklyDistanceKm || 0),
      flightHoursPerYear: Number(data.flightHoursPerYear || 0),
    },
    homeEnergy: {
      location: data.location || 'India',
      electricityKwhM: Number(data.electricityKwhM || 0),
      acHoursPerDay: Number(data.acHoursPerDay || 0),
    },
    food: {
      diet: data.diet || 'low_meat',
    },
    shopping: {
      frequency: data.shoppingFrequency || 'medium',
    },
    waste: {
      recyclingRate: Number(data.wasteRecyclingRate || 0),
    },
    // Retain legacy fields as well for fallback consistency
    ...data,
  };
};

/**
 * Calculates carbon emissions using AWS API Gateway + Lambda.
 * If AWS is unconfigured, unreachable, or times out, safely falls back to local Express calculation.
 */
export const calculateCarbonWithAWS = async (data = {}) => {
  const payload = formatAwsPayload(data);

  if (AWS_API_GATEWAY_URL) {
    try {
      const endpoint = AWS_API_GATEWAY_URL.endsWith('/carbon/calculate')
        ? AWS_API_GATEWAY_URL
        : `${AWS_API_GATEWAY_URL.replace(/\/+$/, '')}/carbon/calculate`;

      const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 6000,
      });

      return {
        ...response.data,
        _source: 'AWS Lambda (API Gateway)',
        _isAws: true,
      };
    } catch (awsError) {
      console.warn(
        '⚠️ AWS API Gateway calculation call failed, unconfigured, or timed out. Falling back smoothly to Spring Boot engine.',
        awsError.message
      );
    }
  }

  // Graceful Local Fallback: Call Spring Boot backend
  try {
    const res = await apiInstance.post('/footprint/calculate', payload);
    return {
      ...res.data,
      _source: 'Spring Boot Engine (Deterministic Cloud & Local Ready)',
      _isAws: false,
    };
  } catch (localError) {
    console.error('Spring Boot calculation failed:', localError);
    throw localError;
  }
};

export const api = {
  // Authentication
  async register(data) {
    const res = await apiInstance.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('carbon_auth_token', res.data.token);
    }
    return res.data;
  },

  async login(data) {
    const res = await apiInstance.post('/auth/login', data);
    if (res.data.token) {
      localStorage.setItem('carbon_auth_token', res.data.token);
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem('carbon_auth_token');
  },

  async getMe() {
    const res = await apiInstance.get('/auth/me');
    return res.data;
  },

  // Profile
  async getProfile() {
    const res = await apiInstance.get('/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await apiInstance.put('/profile', data);
    return res.data;
  },

  // Carbon calculator custom calculation (AWS Lambda with automatic local fallback)
  async calculateCustom(data) {
    return calculateCarbonWithAWS(data);
  },

  async calculateViaLambda(data) {
    return calculateCarbonWithAWS(data);
  },

  async getHistory() {
    const res = await apiInstance.get('/footprint/history');
    return res.data;
  },

  // Recommendations
  async getRecommendations() {
    const res = await apiInstance.get('/recommendations');
    return res.data;
  },

  async performAction(recommendationId, status) {
    const res = await apiInstance.post('/recommendations/action', { recommendationId, status });
    return res.data;
  },

  async regenerateRecommendations() {
    const res = await apiInstance.post('/recommendations/regenerate');
    return res.data;
  },

  // Goals
  async getGoals() {
    const res = await apiInstance.get('/goals');
    return res.data;
  },

  async createGoal(data) {
    const res = await apiInstance.post('/goals', data);
    return res.data;
  },

  async updateGoal(id, data) {
    const res = await apiInstance.put(`/goals/${id}`, data);
    return res.data;
  },

  async deleteGoal(id) {
    const res = await apiInstance.delete(`/goals/${id}`);
    return res.data;
  },

  // Chatbot
  async getChatHistory() {
    const res = await apiInstance.get('/chat/history');
    return res.data;
  },

  async sendChatMessage(message) {
    const res = await apiInstance.post('/chat', { message });
    return res.data;
  },

  async clearChatHistory() {
    const res = await apiInstance.delete('/chat/history');
    return res.data;
  },

  // Notifications
  async getNotifications() {
    const res = await apiInstance.get('/notifications');
    return res.data;
  },

  async markAllNotificationsRead() {
    const res = await apiInstance.put('/notifications/mark-all');
    return res.data;
  },

  async markNotificationRead(id) {
    const res = await apiInstance.put(`/notifications/${id}/read`);
    return res.data;
  },

  async deleteNotification(id) {
    const res = await apiInstance.delete(`/notifications/${id}`);
    return res.data;
  },

  // Dashboard Analytics
  async getAnalyticsSummary() {
    const res = await apiInstance.get('/analytics/summary');
    return res.data;
  },

  // Admin User CRUD Management APIs
  async listUsers() {
    const res = await apiInstance.get('/auth/users');
    return res.data;
  },

  async updateUserRole(id, role) {
    const res = await apiInstance.put(`/auth/users/${id}/role`, { role });
    return res.data;
  },

  async deleteUser(id) {
    const res = await apiInstance.delete(`/auth/users/${id}`);
    return res.data;
  },
};
