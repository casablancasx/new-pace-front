import api from './api';

const avaliadorService = {
  async listar(page = 0, size = 10) {
    return api.get(`/avaliador?page=${page}&size=${size}`);
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
    return (response.content || []).map(item => ({
      id: item.id || item.avaliadorId,
      nome: item.nome,
      email: item.email,
      setor: item.setor?.nome || '',
    }));
  },

  async cadastrar(avaliador) {
    return api.post('/avaliador', avaliador);
  },

  async remover(id) {
    return api.delete(`/avaliador/${id}`);
  },

  async buscarPorId(id) {
    return api.get(`/avaliador/${id}`);
  },
};

export default avaliadorService;
