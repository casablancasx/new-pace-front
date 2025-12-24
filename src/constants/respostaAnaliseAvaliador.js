/**
 * Constantes para RespostaAnaliseAvaliador enum
 * Mapeamento de valores, descrições e cores
 */

export const RESPOSTA_ANALISE_AVALIADOR = {
  ANALISE_PENDENTE: {
    value: 'ANALISE_PENDENTE',
    label: 'Análise Pendente',
    descricao: 'Análise Pendente',
    color: 'default', // Cinza
    hexColor: '#9E9E9E',
  },
  COMPARECER: {
    value: 'COMPARECER',
    label: 'Comparecer',
    descricao: 'Comparecer',
    color: 'success', // Verde
    hexColor: '#4CAF50',
  },
  NAO_COMPARECER: {
    value: 'NAO_COMPARECER',
    label: 'Não Comparecer',
    descricao: 'Não Comparecer',
    color: 'error', // Vermelho
    hexColor: '#F44336',
  },
  CANCELADA: {
    value: 'CANCELADA',
    label: 'Cancelada',
    descricao: 'Cancelada',
    color: 'secondary', // Roxo/Lilás
    hexColor: '#9C27B0',
  },
  REDESIGNADA: {
    value: 'REDESIGNADA',
    label: 'Redesignada',
    descricao: 'Redesignada',
    color: 'warning', // Amarelo
    hexColor: '#FF9800',
  },
};

/**
 * Array de opções para select/dropdown
 */
export const RESPOSTA_ANALISE_OPTIONS = Object.values(RESPOSTA_ANALISE_AVALIADOR).map((item) => ({
  value: item.value,
  label: item.label,
}));

/**
 * Função para obter a cor e descrição de uma resposta
 * @param {string} resposta - Valor do enum (ex: 'COMPARECER')
 * @returns {Object} Objeto com color, label, descricao, hexColor
 */
export const getRespostaAnaliseInfo = (resposta) => {
  return RESPOSTA_ANALISE_AVALIADOR[resposta] || RESPOSTA_ANALISE_AVALIADOR.ANALISE_PENDENTE;
};

/**
 * Função para obter a cor MUI de uma resposta
 * @param {string} resposta - Valor do enum
 * @returns {string} Cor MUI (success, error, warning, secondary, default)
 */
export const getRespostaAnaliseColor = (resposta) => {
  return getRespostaAnaliseInfo(resposta).color;
};

/**
 * Função para obter a descrição de uma resposta
 * @param {string} resposta - Valor do enum
 * @returns {string} Descrição legível
 */
export const getRespostaAnaliseDescricao = (resposta) => {
  return getRespostaAnaliseInfo(resposta).descricao;
};

export default RESPOSTA_ANALISE_AVALIADOR;
