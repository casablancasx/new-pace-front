import api from './api';

const escalaService = {
  /**
   * Escalar usuários (avaliadores ou apoio)
   * @param {Object} dados - Dados da escala
   * @returns {Promise}
   */
  async escalar(dados) {
    const ufs = dados.unidadesFederativas?.map(uf => uf.value);
    const tipoContestacao = dados.tipoContestacao?.map(tc => {
      const mapping = {
        'TIPO1': 'TIPO1',
        'TIPO2': 'TIPO2',
        'TIPO3': 'TIPO3',
        'TIPO4': 'TIPO4',
        'TIPO5': 'TIPO5',
        'SEM_TIPO': 'SEM_TIPO',
        'SEM_CONTESTACAO': 'SEM_CONTESTACAO',
      };
      return mapping[tc.value] || tc.value;
    });
    const orgaoJulgadorIds = dados.orgaoJulgadores?.map(oj => oj.id);
    const usuarioIds = dados.pessoas?.map(p => p.id);
    const subnucleos = dados.subnucleos?.map(s => s.value);

    const payload = {
      setorOrigemId: dados.setorOrigem?.id || null,
      especieTarefaId: dados.especieTarefa?.id || null,
      dataInicio: dados.dataInicio || null,
      dataFim: dados.dataFim || null,
      tipoEscala: dados.tipoEscala || null,
      ufs: ufs?.length > 0 ? ufs : null,
      tipoContestacao: tipoContestacao?.length > 0 ? tipoContestacao : null,
      subnucleos: subnucleos?.length > 0 ? subnucleos : null,
      orgaoJulgadorIds: orgaoJulgadorIds?.length > 0 ? orgaoJulgadorIds : null,
      usuarioIds: usuarioIds?.length > 0 ? usuarioIds : [],
      distribuicaoManualSetores: !dados.distribuicaoAutomaticaSetores,
      setorDestinoId: dados.setorDestino?.id || null,
    };

    return api.post('/escala', payload);
  },
};

export default escalaService;
