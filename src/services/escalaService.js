import api from './api';

const escalaService = {
  /**
   * Escalar avaliadores
   * @param {Object} dados - Dados da escala
   * @returns {Promise}
   */
  async escalarAvaliadores(dados) {
    const ufs = dados.unidadesFederativas?.map(uf => uf.value);
    const tipoContestacao = dados.tipoContestacao?.map(tc => {
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
    });
    const orgaoJulgadorIds = dados.orgaoJulgadores?.map(oj => oj.id);
    const avaliadorIds = dados.pessoas?.map(p => p.id);

    const payload = {
      setorOrigemId: dados.setorOrigem?.id || null,
      setorResponsavelId: dados.setorResponsavel?.id || null,
      especieTarefaId: dados.especieTarefa?.id || null,
      dataInicio: dados.dataInicio || null,
      dataFim: dados.dataFim || null,
      ufs: ufs?.length > 0 ? ufs : null,
      tipoContestacao: tipoContestacao?.length > 0 ? tipoContestacao : null,
      orgaoJulgadorIds: orgaoJulgadorIds?.length > 0 ? orgaoJulgadorIds : null,
      avaliadorIds: avaliadorIds?.length > 0 ? avaliadorIds : null,
      pautistaIds: null,
      distribuicaoManualSetores: !dados.distribuicaoAutomaticaSetores,
      setorDestinoId: dados.setorDestino?.id || null,
    };

    return api.post('/escalar/avaliadores', payload);
  },

  /**
   * Escalar pautistas
   * @param {Object} dados - Dados da escala
   * @returns {Promise}
   */
  async escalarPautistas(dados) {
    const ufs = dados.unidadesFederativas?.map(uf => uf.value);
    const tipoContestacao = dados.tipoContestacao?.map(tc => {
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
    });
    const orgaoJulgadorIds = dados.orgaoJulgadores?.map(oj => oj.id);
    const pautistaIds = dados.pessoas?.map(p => p.id);

    const payload = {
      setorOrigemId: dados.setorOrigem?.id || null,
      setorResponsavelId: dados.setorResponsavel?.id || null,
      especieTarefaId: dados.especieTarefa?.id || null,
      dataInicio: dados.dataInicio || null,
      dataFim: dados.dataFim || null,
      ufs: ufs?.length > 0 ? ufs : null,
      tipoContestacao: tipoContestacao?.length > 0 ? tipoContestacao : null,
      orgaoJulgadorIds: orgaoJulgadorIds?.length > 0 ? orgaoJulgadorIds : null,
      avaliadorIds: null,
      pautistaIds: pautistaIds?.length > 0 ? pautistaIds : null,
      distribuicaoManualSetores: !dados.distribuicaoAutomaticaSetores,
      setorDestinoId: dados.setorDestino?.id || null,
    };

    return api.post('/escalar/pautistas', payload);
  },
};

export default escalaService;
