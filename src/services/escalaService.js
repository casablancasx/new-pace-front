import api from './api';

const escalaService = {
  /**
   * Escalar usuários (avaliadores ou apoio)
   * @param {Object} dados - Dados da escala
   * @returns {Promise}
   */
  async escalar(dados) {
    // Processar UFs - se TODOS foi selecionado (contém null) ou lista vazia, enviar null
    const hasTodosUfs = dados.unidadesFederativas?.some(item => item.value === null);
    const ufs = hasTodosUfs || !dados.unidadesFederativas?.length 
      ? null 
      : dados.unidadesFederativas.map(uf => uf.value);

    // Processar Tipo Contestação - se TODOS foi selecionado ou lista vazia, enviar null
    const hasTodosTipoContestacao = dados.tipoContestacao?.some(item => item.value === null);
    const tipoContestacao = hasTodosTipoContestacao || !dados.tipoContestacao?.length
      ? null
      : dados.tipoContestacao.map(tc => {
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

    // Processar Órgão Julgador - se TODOS foi selecionado ou lista vazia, enviar null
    const hasTodosOrgao = dados.orgaoJulgadores?.some(item => item.id === null);
    const orgaoJulgadorIds = hasTodosOrgao || !dados.orgaoJulgadores?.length
      ? null
      : dados.orgaoJulgadores.map(oj => oj.id);

    // Processar Subnúcleos - se TODOS foi selecionado ou lista vazia, enviar null
    const hasTodosSubnucleo = dados.subnucleos?.some(item => item.value === null);
    const subnucleos = hasTodosSubnucleo || !dados.subnucleos?.length
      ? null
      : dados.subnucleos.map(s => s.value);

    // Processar Usuários - se TODOS foi selecionado ou lista vazia, enviar null
    const hasTodosUsuarios = dados.pessoas?.some(item => item.id === null);
    const usuarioIds = hasTodosUsuarios || !dados.pessoas?.length
      ? null
      : dados.pessoas.map(p => p.id);

    const payload = {
      setorOrigemId: dados.setorOrigem?.id || null,
      especieTarefaId: dados.especieTarefa?.id || null,
      dataInicio: dados.dataInicio || null,
      dataFim: dados.dataFim || null,
      tipoEscala: dados.tipoEscala || null,
      ufs: ufs,
      tipoContestacao: tipoContestacao,
      subnucleos: subnucleos,
      orgaoJulgadorIds: orgaoJulgadorIds,
      usuarioIds: usuarioIds,
      distribuicaoManualSetores: !dados.distribuicaoAutomaticaSetores,
      distribuirParaMim: dados.distribuirParaMim || false,
      setorDestinoId: dados.setorDestino?.id || null,
    };

    return api.post('/escala', payload);
  },
};

export default escalaService;
