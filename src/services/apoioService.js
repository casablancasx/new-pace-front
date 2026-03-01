import api from './api';

const apoioService = {
  async listar(page = 0, size = 10, nome = '') {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (nome && nome.trim()) {
      params.append('nome', nome.trim());
    }
    
    const response = await api.get(`/usuarios/apoio?${params.toString()}`);

    const content = (response.content || []).map(item => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
      cargo: item.cargo || '',
      quantidadeAudiencias: item.quantidadeAudiencias || 0,
      quantidadePautas: item.quantidadePautas || 0,
      disponivel: item.disponivel,
    }));

    const pageInfo = response.page || {};

    return {
      content,
      totalPages: pageInfo.totalPages || response.totalPages || 1,
      totalElements: pageInfo.totalElements || response.totalElements || 0,
    };
  },

  /**
   * Busca agentes de apoio com filtro por nome (para autocomplete)
   * @param {string} nome - Nome para filtrar (opcional)
   * @param {number} page - Página (default 0)
   * @param {number} size - Tamanho da página (default 50)
   * @returns {Promise<Array>} Lista de agentes de apoio
   */
  async buscar(nome = '', page = 0, size = 50) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (nome && nome.trim()) {
      params.append('nome', nome.trim());
    }
    
    const response = await api.get(`/usuarios/apoio?${params.toString()}`);
    
    // Mapear resposta para o formato esperado pelo Autocomplete
    return (response.content || []).map(item => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
      cargo: item.cargo || '',
    }));
  },

  async cadastrar(payload) {
    return api.post('/usuarios', payload);
  },

  async remover(id) {
    return api.delete(`/usuarios/${id}`);
  },
};

export default apoioService;
