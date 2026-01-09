const SAPIENS_URL = import.meta.env.VITE_SAPIENS_URL || 'https://supersapiensbackend.agu.gov.br';

const sapiensService = {
  async buscarUsuarios(nome) {
    if (!nome || nome.length < 3) {
      return [];
    }

    // Pegar o token JWT do localStorage (mesmo usado para autenticação)
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Token não encontrado');
      return [];
    }

    // Dividir o nome em partes para busca
    const partes = nome.trim().split(/\s+/).filter(p => p.length >= 2);
    
    if (partes.length === 0) {
      return [];
    }

    // Construir o filtro "andX" com "like" para cada parte do nome
    const filtros = partes.map(parte => ({
      "colaborador.usuario.nome": `like:%${parte}%`
    }));

    const where = {
      andX: filtros
    };

    const params = new URLSearchParams({
      where: JSON.stringify(where),
      limit: '10',
      offset: '0',
      order: '{}',
      populate: JSON.stringify([
        'colaborador',
        'colaborador.usuario',
        'colaborador.usuario.colaborador',
        'setor',
        'setor.unidade'
      ]),
      context: JSON.stringify({ semAfastamento: true })
    });

    const url = `${SAPIENS_URL}/v1/administrativo/lotacao?${params.toString()}`;
    
    console.log('Buscando no Sapiens:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro na resposta do Sapiens:', response.status, response.statusText);
      throw new Error('Erro ao buscar usuários no Sapiens');
    }

    const data = await response.json();
    console.log('Resultados do Sapiens:', data);
    return data.entities || [];
  },

  // Transforma o resultado do Sapiens no formato esperado para exibição
  transformarParaExibicao(lotacao) {
    return {
      id: lotacao.colaborador?.usuario?.id,
      nome: lotacao.colaborador?.usuario?.nome || '',
      email: lotacao.colaborador?.usuario?.email || '',
      setor: {
        id: lotacao.setor?.id,
        nome: lotacao.setor?.nome || '',
      },
      unidade: {
        id: lotacao.setor?.unidade?.id,
        nome: lotacao.setor?.unidade?.nome || '',
      },
      lotacaoOriginal: lotacao,
    };
  },

  // Transforma para o payload de cadastro no backend
  transformarParaCadastro(lotacao) {
    const usuario = lotacao.colaborador?.usuario;
    const setor = lotacao.setor;
    const unidade = setor?.unidade;

    return {
      sapiensId: usuario?.id,
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      telefone: '',
      setor: {
        setorId: setor?.id,
        nomeSetor: setor?.nome || '',
        unidadeId: unidade?.id,
        nomeUnidade: unidade?.nome || '',
      },
    };
  },

  // Buscar espécies de tarefa na API do Sapiens
  async buscarEspecieTarefa(nome) {
    if (!nome || nome.length < 2) {
      return [];
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Token não encontrado');
      return [];
    }

    const where = {
      andX: [
        { nome: `like:%${nome}%` }
      ]
    };

    const params = new URLSearchParams({
      where: JSON.stringify(where),
      limit: '30',
      offset: '0',
      order: '{}',
      populate: JSON.stringify(['generoTarefa']),
      context: '{}'
    });

    const url = `${SAPIENS_URL}/v1/administrativo/especie_tarefa?${params.toString()}`;
    
    console.log('Buscando espécie tarefa no Sapiens:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro na resposta do Sapiens:', response.status, response.statusText);
      throw new Error('Erro ao buscar espécies de tarefa no Sapiens');
    }

    const data = await response.json();
    console.log('Resultados espécie tarefa:', data);
    
    // Retorna apenas id e nome de cada espécie
    return (data.entities || []).map(entity => ({
      id: entity.id,
      nome: entity.nome,
    }));
  },

  // Buscar setores na API do Sapiens
  async buscarSetor(termo, unidadeId = 9) {
    if (!termo || termo.length < 2) {
      return [];
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Token não encontrado');
      return [];
    }

    // Busca por nome OU sigla do setor
    const where = {
      'unidade.id': `eq:${unidadeId}`,
      'parent': 'isNotNull',
      orX: [
        { andX: [{ nome: `like:%${termo}%` }] },
        { andX: [{ sigla: `like:%${termo}%` }] }
      ]
    };

    const params = new URLSearchParams({
      where: JSON.stringify(where),
      limit: '30',
      offset: '0',
      order: '{}',
      populate: JSON.stringify(['unidade', 'parent']),
      context: '{}'
    });

    const url = `${SAPIENS_URL}/v1/administrativo/setor?${params.toString()}`;
    
    console.log('Buscando setor no Sapiens:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro na resposta do Sapiens:', response.status, response.statusText);
      throw new Error('Erro ao buscar setores no Sapiens');
    }

    const data = await response.json();
    console.log('Resultados setor:', data);
    
    // Retorna id, nome do setor e nome da unidade
    return (data.entities || []).map(entity => ({
      id: entity.id,
      nome: entity.nome,
      unidadeNome: entity.unidade?.nome || '',
    }));
  },

  // Buscar unidades na API do Sapiens (setores sem parent = unidades)
  async buscarUnidade(termo) {
    if (!termo || termo.length < 2) {
      return [];
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Token não encontrado');
      return [];
    }

    // Unidades são setores com parent = null
    const where = {
      'parent': 'isNull',
      orX: [
        { andX: [{ nome: `like:%${termo}%` }] },
        { andX: [{ sigla: `like:%${termo}%` }] }
      ]
    };

    const params = new URLSearchParams({
      where: JSON.stringify(where),
      limit: '30',
      offset: '0',
      order: '{}',
      populate: JSON.stringify([]),
      context: '{}'
    });

    const url = `${SAPIENS_URL}/v1/administrativo/setor?${params.toString()}`;
    
    console.log('Buscando unidade no Sapiens:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro na resposta do Sapiens:', response.status, response.statusText);
      throw new Error('Erro ao buscar unidades no Sapiens');
    }

    const data = await response.json();
    console.log('Resultados unidade:', data);
    
    // Retorna id e nome da unidade
    return (data.entities || []).map(entity => ({
      id: entity.id,
      nome: entity.nome,
      sigla: entity.sigla || '',
    }));
  },

  // Buscar lotações de um colaborador na API do Sapiens
  async buscarLotacoesColaborador(colaboradorId) {
    if (!colaboradorId) {
      return [];
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('Token não encontrado');
      return [];
    }

    const where = {
      'colaborador.id': `eq:${colaboradorId}`
    };

    const params = new URLSearchParams({
      where: JSON.stringify(where),
      limit: '10',
      offset: '0',
      order: JSON.stringify({ id: 'DESC' }),
      populate: JSON.stringify(['populateAll', 'setor.unidade']),
      context: '{}'
    });

    const url = `${SAPIENS_URL}/v1/administrativo/lotacao?${params.toString()}`;
    
    console.log('Buscando lotações do colaborador no Sapiens:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro na resposta do Sapiens:', response.status, response.statusText);
      throw new Error('Erro ao buscar lotações no Sapiens');
    }

    const data = await response.json();
    console.log('Resultados lotações:', data);
    
    // Retorna as lotações formatadas com setor e unidade
    return (data.entities || []).map(entity => ({
      id: entity.setor?.id,
      nome: entity.setor?.nome || '',
      unidade: {
        id: entity.setor?.unidade?.id,
        nome: entity.setor?.unidade?.nome || '',
      },
    }));
  },
};

export default sapiensService;
