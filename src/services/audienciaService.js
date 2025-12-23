import api from './api';

const audienciaService = {
  /**
   * Lista audiências com paginação e filtros
   * @param {number} page - Página (0-indexed)
   * @param {number} size - Tamanho da página
   * @param {number} orgaoJulgadorId - ID do órgão julgador (opcional)
   * @param {string} numeroProcesso - Número do processo (opcional)
   * @param {string} orderBy - Campo para ordenação (id, data)
   * @param {string} sort - Direção da ordenação (ASC, DESC)
   * @returns {Promise<Object>} Resposta paginada com audiências
   */
  async listar(page = 0, size = 10, orgaoJulgadorId = null, numeroProcesso = null, orderBy = 'id', sort = 'DESC') {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('orderBy', orderBy);
    params.append('sort', sort);
    
    if (orgaoJulgadorId) {
      params.append('orgaoJulgadorId', orgaoJulgadorId.toString());
    }
    
    if (numeroProcesso && numeroProcesso.trim()) {
      params.append('numeroProcesso', numeroProcesso.trim());
    }
    
    return api.get(`/audiencia?${params.toString()}`);
  },

  /**
   * Atualiza a análise de comparecimento e observação de uma audiência
   * @param {number} audienciaId - ID da audiência
   * @param {string} analiseComparecimento - Status da análise (ANALISE_PENDENTE, COMPARECIMENTO, NAO_COMPARECER, CANCELADA)
   * @param {string} observacao - Observação/análise textual
   * @returns {Promise<AudienciaResponseDTO>}
   */
  async atualizar(audienciaId, analiseComparecimento, observacao) {
    return api.patch('/audiencia', {
      audienciaId,
      analiseComparecimento,
      observacao,
    });
  },
};

export default audienciaService;
