import api from './api';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

const planilhaService = {
  /**
   * Importa uma planilha para o backend
   * @param {File} file - Arquivo da planilha
   * @returns {Promise<PlanilhaDTO>} Resposta com informações do upload
   */
  async importar(file) {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/pace/api/planilha/importar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erro ao importar planilha');
    }

    return response.json();
  },

  /**
   * Lista planilhas com paginação
   * @param {number} page - Página (0-indexed)
   * @param {number} size - Tamanho da página
   * @returns {Promise<PageResponse<PlanilhaResponseDTO>>}
   */
  async listar(page = 0, size = 10) {
    return api.get(`/planilha?page=${page}&size=${size}`);
  },
};

export default planilhaService;
