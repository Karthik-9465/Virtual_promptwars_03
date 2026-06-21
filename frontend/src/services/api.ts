const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('carbon_auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  // Authentication
  async register(data: any) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    if (result.token) {
      localStorage.setItem('carbon_auth_token', result.token);
    }
    return result;
  },

  async login(data: any) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(res);
    if (result.token) {
      localStorage.setItem('carbon_auth_token', result.token);
    }
    return result;
  },

  logout() {
    localStorage.removeItem('carbon_auth_token');
  },

  async getMe() {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Profile
  async getProfile() {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(data: any) {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Calculator custom queries
  async calculateCustom(data: any) {
    const res = await fetch(`${API_URL}/footprint/calculate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Recommendations
  async getRecommendations() {
    const res = await fetch(`${API_URL}/recommendations`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async performAction(recommendationId: string, status: 'completed' | 'skipped') {
    const res = await fetch(`${API_URL}/recommendations/action`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ recommendationId, status }),
    });
    return handleResponse(res);
  },

  // Goals
  async getGoals() {
    const res = await fetch(`${API_URL}/goals`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createGoal(data: any) {
    const res = await fetch(`${API_URL}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Chat
  async getChatHistory() {
    const res = await fetch(`${API_URL}/chat/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async sendChatMessage(message: string) {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    return handleResponse(res);
  },

  // Analytics
  async getAnalyticsSummary() {
    const res = await fetch(`${API_URL}/analytics/summary`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
