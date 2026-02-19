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
  NAO_ESCALADA: {
    value: 'NAO_ESCALADA',
    label: 'Não Escalada',
    descricao: 'Não Escalada',
    color: 'error', // Vermelho
    hexColor: '#F44336',
  },
};

/**
 * Mapeamento reverso: descrição/label → enum value
 * Permite buscar pelo que o backend pode retornar (Comparecer, Não Comparecer, etc)
 */
const DESCRICAO_TO_VALUE = {};
Object.values(RESPOSTA_ANALISE_AVALIADOR).forEach((item) => {
  DESCRICAO_TO_VALUE[item.descricao] = item.value;
  DESCRICAO_TO_VALUE[item.label] = item.value;
});

/**
 * Normaliza a resposta para o enum value
 * Aceita tanto "COMPARECER" quanto "Comparecer"
 * @param {string} resposta - Valor ou descrição
 * @returns {string} Enum value normalizado
 */
const normalizarResposta = (resposta) => {
  if (!resposta) return 'ANALISE_PENDENTE';
  
  // Se já é um valor válido do enum, retorna
  if (RESPOSTA_ANALISE_AVALIADOR[resposta]) {
    return resposta;
  }
  
  // Tenta buscar pela descrição/label
  if (DESCRICAO_TO_VALUE[resposta]) {
    return DESCRICAO_TO_VALUE[resposta];
  }
  
  // Fallback para padrão
  return 'ANALISE_PENDENTE';
};

/**
 * Array de opções para select/dropdown (excluindo ANALISE_PENDENTE)
 */
export const RESPOSTA_ANALISE_OPTIONS = Object.values(RESPOSTA_ANALISE_AVALIADOR)
  .filter((item) => item.value !== 'ANALISE_PENDENTE')
  .map((item) => ({
    value: item.value,
    label: item.label,
  }));

/**
 * Opções de Subnúcleo
 */
export const SUBNUCLEO_OPTIONS = [
  { value: 'ESEAS', label: 'ESEAS' },
  { value: 'EBI', label: 'EBI' },
  { value: 'ERU', label: 'ERU' },
];

/**
 * Opções de Tipo Contestação
 */
export const TIPO_CONTESTACAO_OPTIONS = [
  { value: 'TIPO1', label: 'TIPO 1' },
  { value: 'TIPO2', label: 'TIPO 2' },
  { value: 'TIPO3', label: 'TIPO 3' },
  { value: 'TIPO4', label: 'TIPO 4' },
  { value: 'TIPO5', label: 'TIPO 5' },
  { value: 'SEM_CONTESTACAO', label: 'SEM CONTESTAÇÃO' },
  { value: 'SEM_TIPO', label: 'SEM TIPO' },
  { value: 'ERRO_SAPIENS', label: 'ERRO SAPIENS' },
];

/**
 * Normaliza tipoContestacao: converte descrição ("TIPO 3") para enum value ("TIPO3")
 */
const TIPO_CONTESTACAO_DESC_TO_VALUE = {};
TIPO_CONTESTACAO_OPTIONS.forEach((opt) => {
  TIPO_CONTESTACAO_DESC_TO_VALUE[opt.label] = opt.value;
  TIPO_CONTESTACAO_DESC_TO_VALUE[opt.value] = opt.value;
});

export const normalizarTipoContestacao = (tipo) => {
  if (!tipo) return '';
  return TIPO_CONTESTACAO_DESC_TO_VALUE[tipo] || tipo;
};

/**
 * Opções de Classe Judicial
 */
export const CLASSE_JUDICIAL_OPTIONS = [
  { value: 'COMUM', label: 'COMUM' },
  { value: 'JEF', label: 'JEF' },
];

/**
 * Enum ViewRelatorio - Tipo de visão do relatório
 * ESCALA: Filtra apenas audiências que possuem escala associada
 * AUDIENCIA: Considera todas as audiências, independente de terem escala
 */
export const VIEW_RELATORIO = {
  ESCALA: 'ESCALA',
  AUDIENCIA: 'AUDIENCIA',
  AUDIENCIA_NAO_ENCONTRADA: 'AUDIENCIA_NAO_ENCONTRADA',
};

export const VIEW_RELATORIO_OPTIONS = [
  { value: 'ESCALA', label: 'Escala' },
  { value: 'AUDIENCIA', label: 'Audiência' },
  { value: 'AUDIENCIA_NAO_ENCONTRADA', label: 'Audiência Não Encontrada' },
];

/**
 * Função para obter a cor e descrição de uma resposta
 * Aceita tanto enum value quanto descrição do backend
 * @param {string} resposta - Valor do enum ou descrição (ex: 'COMPARECER' ou 'Comparecer')
 * @returns {Object} Objeto com color, label, descricao, hexColor
 */
export const getRespostaAnaliseInfo = (resposta) => {
  const normalized = normalizarResposta(resposta);
  return RESPOSTA_ANALISE_AVALIADOR[normalized] || RESPOSTA_ANALISE_AVALIADOR.ANALISE_PENDENTE;
};

/**
 * Função para obter a cor MUI de uma resposta
 * @param {string} resposta - Valor do enum ou descrição
 * @returns {string} Cor MUI (success, error, warning, secondary, default)
 */
export const getRespostaAnaliseColor = (resposta) => {
  return getRespostaAnaliseInfo(resposta).color;
};

/**
 * Função para obter a descrição de uma resposta
 * @param {string} resposta - Valor do enum ou descrição
 * @returns {string} Descrição legível
 */
export const getRespostaAnaliseDescricao = (resposta) => {
  return getRespostaAnaliseInfo(resposta).descricao;
};

export default RESPOSTA_ANALISE_AVALIADOR;
