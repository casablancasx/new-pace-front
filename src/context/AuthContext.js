import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

// Intervalo de refresh: 30 minutos em milliseconds
const REFRESH_INTERVAL = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = useRef(null);

  // Função para fazer o refresh do token
  const refreshToken = useCallback(async () => {
    try {
      console.log('[Auth] Renovando token...');
      const newToken = await authService.refreshToken();
      setToken(newToken);
      console.log('[Auth] Token renovado com sucesso');
    } catch (error) {
      console.error('[Auth] Erro ao renovar token:', error);
      // Se falhar ao renovar, fazer logout
      authService.logout();
      setUser(null);
      setToken(null);
      window.location.href = '/auth/login';
    }
  }, []);

  // Iniciar o intervalo de refresh
  const startRefreshInterval = useCallback(() => {
    // Limpar intervalo anterior se existir
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Configurar novo intervalo
    refreshIntervalRef.current = setInterval(() => {
      if (authService.isAuthenticated()) {
        refreshToken();
      }
    }, REFRESH_INTERVAL);

    console.log('[Auth] Refresh automático configurado para cada 30 minutos');
  }, [refreshToken]);

  // Parar o intervalo de refresh
  const stopRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
      console.log('[Auth] Refresh automático parado');
    }
  }, []);

  // Inicializar estado do localStorage
  useEffect(() => {
    const storedUser = authService.getUser();
    const storedToken = authService.getToken();
    
    if (storedToken && authService.isAuthenticated()) {
      setUser(storedUser);
      setToken(storedToken);
      // Iniciar refresh automático se autenticado
      startRefreshInterval();
    } else {
      // Limpar dados inválidos/expirados
      authService.logout();
    }
    
    setLoading(false);

    // Cleanup: parar intervalo ao desmontar
    return () => {
      stopRefreshInterval();
    };
  }, [startRefreshInterval, stopRefreshInterval]);

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setToken(response.token);
    // Iniciar refresh automático após login
    startRefreshInterval();
    return response;
  }, [startRefreshInterval]);

  const logout = useCallback(() => {
    // Parar refresh automático ao fazer logout
    stopRefreshInterval();
    authService.logout();
    setUser(null);
    setToken(null);
  }, [stopRefreshInterval]);

  const hasRole = useCallback((allowedRoles) => {
    if (!user) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  }, [user]);

  const isAuthenticated = Boolean(user && token);

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
