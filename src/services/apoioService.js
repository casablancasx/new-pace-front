import api from './api';

const apoioService = {
  async listar(page = 0, size = 10) {
    const response = await api.get(`/apoio?page=${page}&size=${size}`);

    const content = (response.content || []).map(item => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
      setores: item.setores || [],
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

  async buscarEquipeParaEscala(nome = '', page = 0, size = 50) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (nome && nome.trim()) {
      params.append('nome', nome.trim());
    }
    const response = await api.get(`/apoio/equipe-escala?${params.toString()}`);
    return (response.content || []).map(item => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
      setores: item.setores || [],
    }));
  },

  async cadastrar(payload) {
    return api.post('/apoio', payload);
  },

  async remover(id) {
    return api.delete(`/apoio/${id}`);
  },
};

export default apoioService;
