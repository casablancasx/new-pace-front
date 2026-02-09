import api from './api';

const relatorioService = {
  /**
   * Monta os parâmetros comuns para os relatórios
   * @param {Object} filtros - Filtros da busca
   * @param {boolean} includeView - Se deve incluir o parâmetro view (default: false)
   */
  _montarParametros(filtros, includeView = false) {
    const params = new URLSearchParams();
    
    params.append('dataInicio', filtros.dataInicio);
    params.append('dataFim', filtros.dataFim);
    
    if (filtros.userId) {
      params.append('userId', filtros.userId.toString());
    }
    
    if (filtros.orgaoJulgadorId) {
      params.append('orgaoJulgadorId', filtros.orgaoJulgadorId.toString());
    }
    
    if (filtros.tipoContestacao) {
      params.append('tipoContestacao', filtros.tipoContestacao);
    }
    
    if (filtros.subnucleo) {
      params.append('subnucleo', filtros.subnucleo);
    }
    
    if (filtros.classeJudicial) {
      params.append('classeJudicial', filtros.classeJudicial);
    }

    // Adiciona o parâmetro view apenas para endpoints que suportam
    if (includeView && filtros.view) {
      params.append('view', filtros.view);
    }
    
    return params;
  },

  /**
   * Busca relatório de escala com filtros (paginado)
   * @param {Object} filtros - Filtros da busca
   * @returns {Promise}
   */
  async buscarEscala(filtros) {
    const params = this._montarParametros(filtros);
    params.append('page', (filtros.page || 0).toString());
    params.append('size', (filtros.size || 10).toString());
    
    const response = await api.get(`/relatorio/escala?${params.toString()}`);
    
    const pageInfo = response.page || {};
    
    return {
      content: response.content || [],
      totalPages: pageInfo.totalPages || response.totalPages || 1,
      totalElements: pageInfo.totalElements || response.totalElements || 0,
    };
  },

  /**
   * Busca relatório de contestação
   * @param {Object} filtros - Filtros da busca
   * @returns {Promise<Array>} Lista de ContestacaoRelatorioDTO
   */
  async buscarContestacao(filtros) {
    const params = this._montarParametros(filtros, true);
    return api.get(`/relatorio/contestacao?${params.toString()}`);
  },

  /**
   * Busca relatório de totais
   * @param {Object} filtros - Filtros da busca
   * @returns {Promise<Object>} TotaisRelatorioDTO
   */
  async buscarTotais(filtros) {
    const params = this._montarParametros(filtros, true);
    return api.get(`/relatorio/totais?${params.toString()}`);
  },

  /**
   * Busca relatório de setores
   * @param {Object} filtros - Filtros da busca
   * @returns {Promise<Array>} Lista de SetorRelatorioDTO
   */
  async buscarSetores(filtros) {
    const params = this._montarParametros(filtros, true);
    return api.get(`/relatorio/setores?${params.toString()}`);
  },

  /**
   * Busca relatório de subnúcleos
   * @param {Object} filtros - Filtros da busca
   * @returns {Promise<Array>} Lista de SubnucleoRelatorioDTO
   */
  async buscarSubnucleos(filtros) {
    const params = this._montarParametros(filtros, true);
    return api.get(`/relatorio/subnucleos?${params.toString()}`);
  },
};

export default relatorioService;
