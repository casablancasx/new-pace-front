import api from './api';

const controleEscalaService = {
  /**
   * Listar escalas com filtros e paginação
   */
  async listar({ page = 0, size = 10, tipoEscala, numeroProcesso, dataInicio, dataFim } = {}) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (tipoEscala) params.append('tipoEscala', tipoEscala);
    if (numeroProcesso && numeroProcesso.trim()) params.append('numeroProcesso', numeroProcesso.trim());
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);

    return api.get(`/escala?${params.toString()}`);
  },

  /**
   * Trocar usuário da escala
   * Envia TrocarEscalaDTO: { escalaId, antigoUsuarioId, novoUsuarioId, tipoEscala }
   */
  async trocar({ escalaId, antigoUsuarioId, novoUsuarioId, tipoEscala }) {
    return api.post('/escala/trocar', { escalaId, antigoUsuarioId, novoUsuarioId, tipoEscala });
  },

  /**
   * Listar usuários por tipo de escala (para o dropdown de troca)
   */
  async listarUsuariosPorTipo(tipoEscala, nome = '') {
    const endpointMap = {
      PAUTISTA: '/usuarios/pautista',
      AVALIADOR: '/usuarios/avaliadores',
      APOIO: '/usuarios/apoio',
    };
    const endpoint = endpointMap[tipoEscala];
    if (!endpoint) throw new Error(`Tipo de escala inválido: ${tipoEscala}`);

    const params = new URLSearchParams();
    params.append('page', '0');
    params.append('size', '100');
    if (nome && nome.trim()) params.append('nome', nome.trim());

    const response = await api.get(`${endpoint}?${params.toString()}`);
    return (response.content || []).map(item => ({
      sapiensId: item.id || item.sapiensId,
      nome: item.nome,
      email: item.email,
      contaAtiva: item.contaAtiva !== undefined ? item.contaAtiva : item.disponivel !== false,
    }));
  },
};

export default controleEscalaService;
