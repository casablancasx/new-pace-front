import api from './api';

const orgaoJulgadorService = {
  /**
   * Busca órgãos julgadores pelo nome e lista de UFs
   * @param {string} nome - Nome ou parte do nome do órgão julgador (pode ser vazio)
   * @param {string[]} ufs - Lista de siglas de UFs (ex: ['PA', 'SP', 'RJ'])
   * @returns {Promise<Array>} Lista de órgãos julgadores
   */
  async buscar(nome = '', ufs = []) {
    try {
      // Construir query params
      const params = new URLSearchParams();
      params.append('nome', nome);
      
      // Adicionar cada UF como parâmetro separado
      if (ufs && ufs.length > 0) {
        ufs.forEach(uf => {
          params.append('ufs', uf);
        });
      }

      const response = await api.get(`/orgao-julgador?${params.toString()}`);
      
      // Mapear resposta para o formato esperado pelo Autocomplete
      return (response || []).map(item => ({
        id: item.orgaoJulgadorId,
        nome: item.nome,
      }));
    } catch (error) {
      console.error('Erro ao buscar órgãos julgadores:', error);
      return [];
    }
  },
};

export default orgaoJulgadorService;
