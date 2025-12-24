import api from './api';

const orgaoJulgadorService = {
  /**
   * Busca órgãos julgadores pelo nome e lista de UFs
   * @param {string} nome - Nome ou parte do nome do órgão julgador (pode ser vazio)
   * @param {string[]} ufs - Lista de siglas de UFs (ex: ['PA', 'SP', 'RJ'])
   * @returns {Promise<Array>} Lista de órgãos julgadores
   */
  async buscar(nome = '', ufs = [], page = 0, size = 20, orderBy = 'nome', sort = 'ASC') {
    try {
      const params = new URLSearchParams();

      if (nome) {
        params.append('nome', nome);
      }

      params.append('page', page);
      params.append('size', size);

      if (orderBy) {
        params.append('orderBy', orderBy);
      }

      if (sort) {
        params.append('sort', sort.toString().toUpperCase());
      }

      // Mantém envio das UFs selecionadas para compatibilidade caso a API passe a aceitar esse filtro
      if (ufs && ufs.length > 0) {
        ufs.forEach(uf => {
          params.append('ufs', uf);
        });
      }

      const response = await api.get(`/orgaoJulgador?${params.toString()}`);

      // API retorna um Page; garantimos fallback se vier lista simples
      const content = response?.content ?? response ?? [];

      return content.map(item => ({
        id: item.orgaoJulgadorId,
        nome: item.nome,
        uf: item.uf?.sigla,
      }));
    } catch (error) {
      console.error('Erro ao buscar órgãos julgadores:', error);
      return [];
    }
  },
};

export default orgaoJulgadorService;
