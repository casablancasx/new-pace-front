import api from './api';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/pace/api';

const authService = {
  async login(username, password) {
    const response = await api.post('/auth/login', { username, password });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      
      try {
        const decoded = jwtDecode(response.token);
        const user = {
            ...decoded,
            name: decoded.nome, // Map 'nome' from token to 'name' for consistency if needed
        };
        localStorage.setItem('user', JSON.stringify(user));
        
        // Return response combined with user for AuthContext
        return { ...response, user };
      } catch (e) {
        console.error("Error decoding token", e);
      }
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
