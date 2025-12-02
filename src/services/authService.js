import api from './api';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  async refreshToken() {
    const currentToken = this.getToken();
    if (!currentToken) {
      throw new Error('Token não encontrado');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh_token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao renovar token');
    }

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      return data.token;
    }
    
    throw new Error('Token não retornado pelo servidor');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar se o token expirou (decodificar JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // converter para milliseconds
      return Date.now() < exp;
    } catch {
      return false;
    }
  },
};

export default authService;
