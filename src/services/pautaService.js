import api from './api';

const pautaService = {
  /**
   * Lista pautas com filtros opcionais
   * @param {number} page - Página
   * @param {number} size - Tamanho da página
  * @param {Object} filtros - Filtros opcionais
  * @param {number} filtros.orgaoJulgadorId - ID do órgão julgador
  * @param {string} filtros.uf - Sigla da UF
  * @param {number} filtros.userId - ID do usuário (para filtrar pautas do usuário)
  * @param {string} filtros.orderBy - Campo para ordenação (default: criadoEm)
  * @param {string} filtros.sort - Direção da ordenação (ASC ou DESC, default: DESC)
   * @returns {Promise<PageResponse<PautaResponseDTO>>}
   */
  async listar(page = 0, size = 10, filtros = {}) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filtros.orgaoJulgadorId) {
      params.append('orgaoJulgadorId', filtros.orgaoJulgadorId.toString());
    }
    if (filtros.uf) {
      params.append('uf', filtros.uf);
    }
    if (filtros.userId) {
      params.append('userId', filtros.userId.toString());
    }
    if (filtros.orderBy) {
      params.append('orderBy', filtros.orderBy);
    }
    if (filtros.sort) {
      params.append('sort', filtros.sort);
    }

    return api.get(`/pauta?${params.toString()}`);
  },

  /**
   * Busca uma pauta detalhada por ID
   * @param {number} id - ID da pauta
   * @returns {Promise<PautaDetalhadaDTO>}
   */
  async buscarPorId(id) {
    return api.get(`/pauta/${id}`);
  },

  /**
   * Deleta uma pauta por ID
   * @param {number} id - ID da pauta
   * @returns {Promise<void>}
   */
  async deletar(id) {
    return api.delete(`/pauta/${id}`);
  },
};

export default pautaService;
