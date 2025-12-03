import api from './api';

const advogadoService = {
  /**
   * Lista advogados com paginação e filtro por nome
   * @param {number} page
   * @param {number} size
   * @param {string} nome
   */
  async listar(page = 0, size = 10, nome = '') {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (nome && nome.trim()) {
      params.append('nome', nome.trim());
    }

    return api.get(`/advogado?${params.toString()}`);
  },

  /**
   * Cadastra um advogado prioritário
   * @param {string} nome - Nome do advogado
   * @param {string[]} ufs - Lista de UFs (ex: ['PA', 'SP'])
   * @returns {Promise<AdvogadoResponseDTO>}
   */
  async cadastrar(nome, ufs) {
    return api.post('/advogado', { nome, ufs });
  },

  /**
   * Deleta um advogado pelo ID
   * @param {number} id - ID do advogado
   * @returns {Promise<void>}
   */
  async deletar(id) {
    return api.delete(`/advogado/${id}`);
  },
};

export default advogadoService;
