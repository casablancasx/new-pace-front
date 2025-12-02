import api from './api';

const escalaService = {
  /**
   * Escalar avaliadores
   * @param {Object} dados - Dados da escala
   * @returns {Promise}
   */
  async escalarAvaliadores(dados) {
    const payload = {
      setorOrigemId: dados.setorResponsavel?.id || null,
      especieTarefaId: dados.especieTarefa?.id || null,
      dataInicio: dados.dataInicio || null,
      dataFim: dados.dataFim || null,
      ufs: dados.unidadesFederativas?.map(uf => uf.value) || [],
      tipoContestacao: dados.tipoContestacao?.map(tc => {
        // Converter o value para o formato do enum do backend
        const mapping = {
          'TIPO_1': 'TIPO1',
          'TIPO_2': 'TIPO2',
          'TIPO_3': 'TIPO3',
          'TIPO_4': 'TIPO4',
          'TIPO_5': 'TIPO5',
          'SEM_TIPO': 'SEM_TIPO',
          'SEM_CONTESTACAO': 'SEM_CONTESTACAO',
        };
        return mapping[tc.value] || tc.value;
      }) || [],
      orgaoJulgadorIds: dados.orgaoJulgadores?.map(oj => oj.id) || [],
      avaliadorIds: dados.pessoas?.map(p => p.id) || [],
      pautistaIds: null, // Para escala de avaliadores, pautistaIds é null
    };

    return api.post('/api/escalar/avaliadores', payload);
  },

  /**
   * Escalar pautistas
   * @param {Object} dados - Dados da escala
   * @returns {Promise}
   */
  async escalarPautistas(dados) {
    const payload = {
      setorOrigemId: dados.setorResponsavel?.id || null,
      especieTarefaId: dados.especieTarefa?.id || null,
      dataInicio: dados.dataInicio || null,
      dataFim: dados.dataFim || null,
      ufs: dados.unidadesFederativas?.map(uf => uf.value) || [],
      tipoContestacao: dados.tipoContestacao?.map(tc => {
        // Converter o value para o formato do enum do backend
        const mapping = {
          'TIPO_1': 'TIPO1',
          'TIPO_2': 'TIPO2',
          'TIPO_3': 'TIPO3',
          'TIPO_4': 'TIPO4',
          'TIPO_5': 'TIPO5',
          'SEM_TIPO': 'SEM_TIPO',
          'SEM_CONTESTACAO': 'SEM_CONTESTACAO',
        };
        return mapping[tc.value] || tc.value;
      }) || [],
      orgaoJulgadorIds: dados.orgaoJulgadores?.map(oj => oj.id) || [],
      avaliadorIds: null, // Para escala de pautistas, avaliadorIds é null
      pautistaIds: dados.pessoas?.map(p => p.id) || [],
    };

    return api.post('/api/escalar/pautistas', payload);
  },
};

export default escalaService;
