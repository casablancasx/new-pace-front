import authService from './authService';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080') + '/pace/api';

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let refreshPromise = null;

const api = {
  async request(endpoint, options = {}, isRetry = false) {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      // Se for endpoint de login, deixar o erro passar para o componente tratar
      if (endpoint.includes('/auth/login')) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erro ao fazer login');
      }

      // Se já é uma tentativa de retry ou endpoint de refresh, fazer logout
      if (isRetry || endpoint.includes('/auth/refresh')) {
        console.log('[API] Token expirado e refresh falhou. Fazendo logout...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Tentar fazer refresh do token
      try {
        console.log('[API] Token expirado. Tentando refresh...');
        
        // Evitar múltiplos refreshes simultâneos
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = authService.refreshToken();
        }
        
        await refreshPromise;
        isRefreshing = false;
        
        console.log('[API] Token renovado. Repetindo requisição...');
        // Repetir a requisição original com o novo token
        return this.request(endpoint, options, true);
      } catch (refreshError) {
        isRefreshing = false;
        console.error('[API] Falha ao renovar token:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      // StandardError: { timestamp, status, error, message, path }
      const errorMessage = errorBody.message || errorBody.error || `Erro na requisição (${response.status})`;
      throw new Error(errorMessage);
    }

    // Retornar null para respostas sem corpo (204 No Content)
    if (response.status === 204) {
      return null;
    }

    return response.json();
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async downloadBlob(endpoint) {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {};

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method: 'GET',
      headers: defaultHeaders,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      if (endpoint.includes('/auth/login')) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erro ao fazer login');
      }

      try {
        console.log('[API] Token expirado. Tentando refresh...');
        
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = authService.refreshToken();
        }
        
        await refreshPromise;
        isRefreshing = false;
        
        console.log('[API] Token renovado. Repetindo requisição...');
        return this.downloadBlob(endpoint);
      } catch (refreshError) {
        isRefreshing = false;
        console.error('[API] Falha ao renovar token:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody.message || errorBody.error || `Erro na requisição (${response.status})`;
      throw new Error(errorMessage);
    }

    return response.blob();
  },
};

export default api;
