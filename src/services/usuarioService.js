import api from './api';

const usuarioService = {
  /**
   * Lista usuários com paginação e filtro opcional por nome
   * @param {number} page - Página (default 0)
   * @param {number} size - Tamanho da página (default 10)
   * @param {string} nome - Nome para filtrar (opcional)
   * @returns {Promise}
   */
  async listar(page = 0, size = 10, nome = '') {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (nome && nome.trim()) {
      params.append('nome', nome.trim());
    }
    
    const response = await api.get(`/usuarios?${params.toString()}`);
    
    // Mapear resposta para o formato esperado pelo frontend
    const content = (response.content || []).map(item => ({
      id: item.id,
      nome: item.nome,
      email: item.email,
      telefone: item.telefone,
      setor: item.setor || '',
      unidade: item.unidade || '',
      role: item.role,
      isContaAtiva: item.isContaAtiva,
    }));
    
    // Suporta tanto formato antigo quanto novo de paginação
    const pageInfo = response.page || {};
    
    return {
      content,
      totalPages: pageInfo.totalPages || response.totalPages || 1,
      totalElements: pageInfo.totalElements || response.totalElements || 0,
    };
  },

  /**
   * Atualiza o role de um usuário
   * @param {number} id - ID do usuário
   * @param {string} role - Novo role (USER, ADMIN)
   * @returns {Promise}
   */
  async atualizarRole(id, role) {
    return api.patch(`/usuarios/${id}/role`, { role });
  },

  /**
   * Ativa ou desativa a conta de um usuário
   * @param {number} id - ID do usuário
   * @param {boolean} ativo - Status da conta
   * @returns {Promise}
   */
  async atualizarStatusConta(id, ativo) {
    return api.patch(`/usuarios/${id}/status`, { isContaAtiva: ativo });
  },
};

export default usuarioService;
