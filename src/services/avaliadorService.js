import api from './api';

const avaliadorService = {
  async listar(page = 0, size = 10) {
    const response = await api.get(`/avaliador?page=${page}&size=${size}`);
    
    // Mapear resposta para o formato esperado pelo frontend
    // Novo formato da API: { content: [...], page: { size, number, totalElements, totalPages } }
    const content = (response.content || []).map(item => ({
      sapiensId: item.id,
      nome: item.nome,
      email: item.email,
      setor: { nome: item.setor || '' },
      unidade: { nome: item.unidade || '' },
      quantidadePautas: item.quantidadePautas || 0,
      quantidadeAudiencias: item.quantidadeAudiencias || 0,
      disponivel: item.disponivel,
      quantidadeAudienciasAvaliadas: item.quantidadeAudienciasAvaliadas || 0,
      quantidadeTotalAudiencias: item.quantidadeAudiencias || 0,
    }));
    
    // Suporta tanto formato antigo (totalPages direto) quanto novo (page.totalPages)
    const pageInfo = response.page || {};
    
    return {
      content,
      totalPages: pageInfo.totalPages || response.totalPages || 1,
      totalElements: pageInfo.totalElements || response.totalElements || 0,
    };
  },

  /**
   * Busca avaliadores com filtro por nome (para autocomplete)
   * @param {string} nome - Nome para filtrar (opcional)
   * @param {number} page - Página (default 0)
   * @param {number} size - Tamanho da página (default 50)
   * @returns {Promise<Array>} Lista de avaliadores
   */
  async buscar(nome = '', page = 0, size = 50) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', 'nome');
    
    if (nome && nome.trim()) {
      params.append('nome', nome.trim());
    }
    
    const response = await api.get(`/avaliador?${params.toString()}`);
    
    // Mapear resposta para o formato esperado pelo Autocomplete
    // Suporta novo formato da API onde setor é string
    return (response.content || []).map(item => ({
      id: item.id || item.sapiensId,
      nome: item.nome,
      email: item.email,
      setor: typeof item.setor === 'string' ? item.setor : (item.setor?.nome || ''),
    }));
  },

  async cadastrar(avaliador) {
    return api.post('/avaliador', avaliador);
  },

  async remover(sapiensId) {
    return api.delete(`/avaliador/${sapiensId}`);
  },

  async buscarPorId(sapiensId) {
    return api.get(`/avaliador/${sapiensId}`);
  },
};

export default avaliadorService;
