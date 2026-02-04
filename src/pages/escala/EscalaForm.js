import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Fab,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';
import { IconPlayerPlay } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import sapiensService from '../../services/sapiensService';
import orgaoJulgadorService from '../../services/orgaoJulgadorService';
import avaliadorService from '../../services/avaliadorService';
import pautistaService from '../../services/pautistaService';
import escalaService from '../../services/escalaService';
import { AuthContext } from '../../context/AuthContext';

const unidadesFederativasOptions = [
  { label: 'Acre (AC)', value: 'AC' },
  { label: 'Alagoas (AL)', value: 'AL' },
  { label: 'Amapá (AP)', value: 'AP' },
  { label: 'Amazonas (AM)', value: 'AM' },
  { label: 'Bahia (BA)', value: 'BA' },
  { label: 'Ceará (CE)', value: 'CE' },
  { label: 'Distrito Federal (DF)', value: 'DF' },
  { label: 'Espírito Santo (ES)', value: 'ES' },
  { label: 'Goiás (GO)', value: 'GO' },
  { label: 'Maranhão (MA)', value: 'MA' },
  { label: 'Mato Grosso (MT)', value: 'MT' },
  { label: 'Mato Grosso do Sul (MS)', value: 'MS' },
  { label: 'Minas Gerais (MG)', value: 'MG' },
  { label: 'Pará (PA)', value: 'PA' },
  { label: 'Paraíba (PB)', value: 'PB' },
  { label: 'Paraná (PR)', value: 'PR' },
  { label: 'Pernambuco (PE)', value: 'PE' },
  { label: 'Piauí (PI)', value: 'PI' },
  { label: 'Rio de Janeiro (RJ)', value: 'RJ' },
  { label: 'Rio Grande do Norte (RN)', value: 'RN' },
  { label: 'Rio Grande do Sul (RS)', value: 'RS' },
  { label: 'Rondônia (RO)', value: 'RO' },
  { label: 'Roraima (RR)', value: 'RR' },
  { label: 'Santa Catarina (SC)', value: 'SC' },
  { label: 'São Paulo (SP)', value: 'SP' },
  { label: 'Sergipe (SE)', value: 'SE' },
  { label: 'Tocantins (TO)', value: 'TO' },
];

const tipoContestacaoOptions = [
  { label: 'TIPO 1', value: 'TIPO1' },
  { label: 'TIPO 2', value: 'TIPO2' },
  { label: 'TIPO 3', value: 'TIPO3' },
  { label: 'TIPO 4', value: 'TIPO4' },
  { label: 'TIPO 5', value: 'TIPO5' },
  { label: 'SEM TIPO', value: 'SEM_TIPO' },
  { label: 'SEM CONTESTAÇÃO', value: 'SEM_CONTESTACAO' },
];

const EscalaForm = ({ tipo = 'pautista' }) => {
  const { user } = useContext(AuthContext);
  const isPautista = tipo === 'pautista';
  const title = isPautista ? 'Escalar Pautista' : 'Escalar Avaliador';
  const pessoaLabel = isPautista ? 'Pautistas' : 'Avaliadores';

  const [formData, setFormData] = useState({
    especieTarefa: null,
    unidade: null,
    setorOrigem: null,
    dataInicio: '',
    dataFim: '',
    unidadesFederativas: [],
    orgaoJulgadores: [],
    tipoContestacao: [],
    pessoas: [],
    distribuicaoAutomaticaSetores: true,
    unidadeDestino: null,
    setorDestino: null,
  });

  // Estados para busca de espécie tarefa
  const [especieTarefaOptions, setEspecieTarefaOptions] = useState([]);
  const [especieTarefaSearchTerm, setEspecieTarefaSearchTerm] = useState('');
  const [especieTarefaLoading, setEspecieTarefaLoading] = useState(false);

  // Estados para busca de unidade
  const [unidadeOptions, setUnidadeOptions] = useState([]);
  const [unidadeSearchTerm, setUnidadeSearchTerm] = useState('');
  const [unidadeLoading, setUnidadeLoading] = useState(false);

  // Estados para busca de setor origem
  const [setorOrigemOptions, setSetorOrigemOptions] = useState([]);
  const [setorOrigemSearchTerm, setSetorOrigemSearchTerm] = useState('');
  const [setorOrigemLoading, setSetorOrigemLoading] = useState(false);

  // Estados para busca de unidade destino
  const [unidadeDestinoOptions, setUnidadeDestinoOptions] = useState([]);
  const [unidadeDestinoSearchTerm, setUnidadeDestinoSearchTerm] = useState('');
  const [unidadeDestinoLoading, setUnidadeDestinoLoading] = useState(false);

  // Estados para busca de setor destino
  const [setorDestinoOptions, setSetorDestinoOptions] = useState([]);
  const [setorDestinoSearchTerm, setSetorDestinoSearchTerm] = useState('');
  const [setorDestinoLoading, setSetorDestinoLoading] = useState(false);

  // Estados para busca de órgão julgador
  const [orgaoJulgadorOptions, setOrgaoJulgadorOptions] = useState([]);
  const [orgaoJulgadorSearchTerm, setOrgaoJulgadorSearchTerm] = useState('');
  const [orgaoJulgadorLoading, setOrgaoJulgadorLoading] = useState(false);

  // Estados para busca de avaliadores
  const [avaliadorOptions, setAvaliadorOptions] = useState([]);
  const [avaliadorSearchTerm, setAvaliadorSearchTerm] = useState('');
  const [avaliadorLoading, setAvaliadorLoading] = useState(false);

  // Estados para busca de pautistas
  const [pautistaOptions, setPautistaOptions] = useState([]);
  const [pautistaSearchTerm, setPautistaSearchTerm] = useState('');
  const [pautistaLoading, setPautistaLoading] = useState(false);

  // Buscar espécies de tarefa com debounce
  useEffect(() => {
    const buscar = async () => {
      if (especieTarefaSearchTerm.length < 2) {
        setEspecieTarefaOptions([]);
        return;
      }

      setEspecieTarefaLoading(true);
      try {
        const results = await sapiensService.buscarEspecieTarefa(especieTarefaSearchTerm);
        setEspecieTarefaOptions(results);
      } catch (err) {
        console.error('Erro ao buscar espécies de tarefa:', err);
        setEspecieTarefaOptions([]);
      } finally {
        setEspecieTarefaLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [especieTarefaSearchTerm]);

  // Buscar unidades com filtro PFPA
  useEffect(() => {
    const buscar = async () => {
      if (unidadeSearchTerm.length < 2) {
        setUnidadeOptions([]);
        return;
      }

      setUnidadeLoading(true);
      try {
        const results = await sapiensService.buscarUnidadePFPA(unidadeSearchTerm);
        setUnidadeOptions(results);
      } catch (err) {
        console.error('Erro ao buscar unidades:', err);
        setUnidadeOptions([]);
      } finally {
        setUnidadeLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [unidadeSearchTerm]);

  // Buscar setor origem com debounce e filtro por unidade
  useEffect(() => {
    const buscar = async () => {
      if (setorOrigemSearchTerm.length < 2) {
        setSetorOrigemOptions([]);
        return;
      }

      if (!formData.unidade) {
        setSetorOrigemOptions([]);
        return;
      }

      setSetorOrigemLoading(true);
      try {
        const results = await sapiensService.buscarSetor(setorOrigemSearchTerm, formData.unidade.id);
        setSetorOrigemOptions(results);
      } catch (err) {
        console.error('Erro ao buscar setores origem:', err);
        setSetorOrigemOptions([]);
      } finally {
        setSetorOrigemLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [setorOrigemSearchTerm, formData.unidade]);

  // Limpar setor origem quando unidade mudar
  useEffect(() => {
    setFormData(prev => ({ ...prev, setorOrigem: null }));
    setSetorOrigemSearchTerm('');
    setSetorOrigemOptions([]);
  }, [formData.unidade]);

  // Buscar unidades destino com filtro PFPA
  useEffect(() => {
    const buscar = async () => {
      if (formData.distribuicaoAutomaticaSetores) return;
      
      if (unidadeDestinoSearchTerm.length < 2) {
        setUnidadeDestinoOptions([]);
        return;
      }

      setUnidadeDestinoLoading(true);
      try {
        const results = await sapiensService.buscarUnidadePFPA(unidadeDestinoSearchTerm);
        setUnidadeDestinoOptions(results);
      } catch (err) {
        console.error('Erro ao buscar unidades destino:', err);
        setUnidadeDestinoOptions([]);
      } finally {
        setUnidadeDestinoLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [unidadeDestinoSearchTerm, formData.distribuicaoAutomaticaSetores]);

  // Buscar setor destino com debounce e filtro por unidade destino
  useEffect(() => {
    const buscar = async () => {
      if (formData.distribuicaoAutomaticaSetores) return;
      
      if (setorDestinoSearchTerm.length < 2) {
        setSetorDestinoOptions([]);
        return;
      }

      if (!formData.unidadeDestino) {
        setSetorDestinoOptions([]);
        return;
      }

      setSetorDestinoLoading(true);
      try {
        const results = await sapiensService.buscarSetor(setorDestinoSearchTerm, formData.unidadeDestino.id);
        setSetorDestinoOptions(results);
      } catch (err) {
        console.error('Erro ao buscar setores destino:', err);
        setSetorDestinoOptions([]);
      } finally {
        setSetorDestinoLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [setorDestinoSearchTerm, formData.unidadeDestino, formData.distribuicaoAutomaticaSetores]);

  // Limpar setor destino quando unidade destino mudar
  useEffect(() => {
    setFormData(prev => ({ ...prev, setorDestino: null }));
    setSetorDestinoSearchTerm('');
    setSetorDestinoOptions([]);
  }, [formData.unidadeDestino]);

  // Limpar campos de destino quando ativar distribuição automática
  useEffect(() => {
    if (formData.distribuicaoAutomaticaSetores) {
      setFormData(prev => ({ ...prev, unidadeDestino: null, setorDestino: null }));
      setUnidadeDestinoSearchTerm('');
      setSetorDestinoSearchTerm('');
      setUnidadeDestinoOptions([]);
      setSetorDestinoOptions([]);
    }
  }, [formData.distribuicaoAutomaticaSetores]);

  // Buscar órgãos julgadores quando as UFs mudarem ou quando digitar
  useEffect(() => {
    const buscar = async () => {
      if (formData.unidadesFederativas.length === 0) {
        setOrgaoJulgadorOptions([]);
        return;
      }

      setOrgaoJulgadorLoading(true);
      try {
        // Extrair as siglas das UFs selecionadas
        const ufs = formData.unidadesFederativas.map(uf => uf.value);
        // Busca com o termo digitado ou string vazia para trazer todos
        const results = await orgaoJulgadorService.buscar(orgaoJulgadorSearchTerm || '', ufs);
        setOrgaoJulgadorOptions(results);
      } catch (err) {
        console.error('Erro ao buscar órgãos julgadores:', err);
        setOrgaoJulgadorOptions([]);
      } finally {
        setOrgaoJulgadorLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 300);
    return () => clearTimeout(timeoutId);
  }, [orgaoJulgadorSearchTerm, formData.unidadesFederativas]);

  // Limpar órgãos julgadores selecionados quando as UFs mudarem
  useEffect(() => {
    setFormData(prev => ({ ...prev, orgaoJulgadores: [] }));
    setOrgaoJulgadorSearchTerm('');
  }, [formData.unidadesFederativas.length]);

  // Buscar avaliadores (carrega na montagem e filtra conforme digita)
  useEffect(() => {
    const buscar = async () => {
      if (isPautista) return; // Só busca se for tela de avaliador
      
      setAvaliadorLoading(true);
      try {
        const results = await avaliadorService.buscar(avaliadorSearchTerm);
        setAvaliadorOptions(results);
      } catch (err) {
        console.error('Erro ao buscar avaliadores:', err);
        setAvaliadorOptions([]);
      } finally {
        setAvaliadorLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 300);
    return () => clearTimeout(timeoutId);
  }, [avaliadorSearchTerm, isPautista]);

  // Carregar avaliadores na montagem do componente (se for tela de avaliador)
  useEffect(() => {
    if (!isPautista) {
      const carregarAvaliadores = async () => {
        setAvaliadorLoading(true);
        try {
          const results = await avaliadorService.buscar('');
          setAvaliadorOptions(results);
        } catch (err) {
          console.error('Erro ao carregar avaliadores:', err);
        } finally {
          setAvaliadorLoading(false);
        }
      };
      carregarAvaliadores();
    }
  }, [isPautista]);

  // Buscar pautistas (carrega na montagem e filtra conforme digita)
  useEffect(() => {
    const buscar = async () => {
      if (!isPautista) return; // Só busca se for tela de pautista
      
      setPautistaLoading(true);
      try {
        const results = await pautistaService.buscar(pautistaSearchTerm);
        setPautistaOptions(results);
      } catch (err) {
        console.error('Erro ao buscar pautistas:', err);
        setPautistaOptions([]);
      } finally {
        setPautistaLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 300);
    return () => clearTimeout(timeoutId);
  }, [pautistaSearchTerm, isPautista]);

  // Carregar pautistas na montagem do componente (se for tela de pautista)
  useEffect(() => {
    if (isPautista) {
      const carregarPautistas = async () => {
        setPautistaLoading(true);
        try {
          const results = await pautistaService.buscar('');
          setPautistaOptions(results);
        } catch (err) {
          console.error('Erro ao carregar pautistas:', err);
        } finally {
          setPautistaLoading(false);
        }
      };
      carregarPautistas();
    }
  }, [isPautista]);

  // Estados para feedback do submit
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ 
    open: false, 
    loading: false, 
    message: '', 
    success: false 
  });

  const handleCloseDialog = () => {
    setDialog({ open: false, loading: false, message: '', success: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.especieTarefa) {
      setDialog({ open: true, loading: false, message: 'Selecione uma Espécie Tarefa', success: false });
      return;
    }
    if (!formData.unidade) {
      setDialog({ open: true, loading: false, message: 'Selecione uma Unidade', success: false });
      return;
    }
    if (!formData.setorOrigem) {
      setDialog({ open: true, loading: false, message: 'Selecione um Setor Origem', success: false });
      return;
    }
    if (!formData.dataInicio || !formData.dataFim) {
      setDialog({ open: true, loading: false, message: 'Preencha as datas de início e fim', success: false });
      return;
    }

    // Abre o dialog com loading
    setDialog({ open: true, loading: true, message: 'Processando escala...', success: false });
    setSubmitting(true);
    
    try {
      let response;
      if (isPautista) {
        response = await escalaService.escalarPautistas(formData);
      } else {
        response = await escalaService.escalarAvaliadores(formData);
      }
      
      // Atualiza o dialog com a mensagem de sucesso
      setDialog({ 
        open: true, 
        loading: false, 
        message: response?.message || `Processo de escala de ${isPautista ? 'pautistas' : 'avaliadores'} iniciado!`, 
        success: true 
      });
      
      // Limpar formulário após sucesso (opcional)
      // setFormData({ ... });
    } catch (error) {
      console.error('Erro ao escalar:', error);
      // Extrair mensagem de erro do backend (StandardError)
      let errorMessage = 'Erro ao processar escala';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setDialog({ 
        open: true, 
        loading: false, 
        message: errorMessage, 
        success: false 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title={title} description={`Página de ${title}`}>
      <DashboardCard title={title}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Espécie Tarefa - Autocomplete com busca na API do Sapiens */}
          <Autocomplete
            options={especieTarefaOptions}
            getOptionLabel={(option) => option.nome || ''}
            value={formData.especieTarefa}
            loading={especieTarefaLoading}
            onChange={(event, newValue) => {
              setFormData({ ...formData, especieTarefa: newValue });
            }}
            onInputChange={(event, newInputValue) => {
              setEspecieTarefaSearchTerm(newInputValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={especieTarefaSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : "Nenhuma espécie encontrada"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Espécie Tarefa"
                variant="outlined"
                fullWidth
                placeholder="Digite para buscar..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {especieTarefaLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Unidade - Autocomplete com busca na API do Sapiens (filtro PFPA) */}
          <Autocomplete
            options={unidadeOptions}
            getOptionLabel={(option) => `${option.nome}${option.sigla ? ` (${option.sigla})` : ''}`}
            value={formData.unidade}
            loading={unidadeLoading}
            onChange={(event, newValue) => {
              setFormData({ ...formData, unidade: newValue });
            }}
            onInputChange={(event, newInputValue) => {
              setUnidadeSearchTerm(newInputValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={unidadeSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : "Nenhuma unidade encontrada"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unidade"
                variant="outlined"
                fullWidth
                placeholder="Digite para buscar unidade PFPA..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {unidadeLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Setor Origem - Autocomplete com busca na API do Sapiens */}
          <Autocomplete
            options={setorOrigemOptions}
            getOptionLabel={(option) => option.nome || ''}
            value={formData.setorOrigem}
            loading={setorOrigemLoading}
            disabled={!formData.unidade}
            onChange={(event, newValue) => {
              setFormData({ ...formData, setorOrigem: newValue });
            }}
            onInputChange={(event, newInputValue) => {
              setSetorOrigemSearchTerm(newInputValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={
              !formData.unidade 
                ? "Selecione uma unidade primeiro" 
                : setorOrigemSearchTerm.length < 2 
                  ? "Digite pelo menos 2 caracteres" 
                  : "Nenhum setor encontrado"
            }
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <Box
                  component="li"
                  key={key}
                  {...otherProps}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start !important',
                    py: 1.5,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{option.nome}</span>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>{option.unidadeNome}</span>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Setor Origem"
                variant="outlined"
                fullWidth
                placeholder={!formData.unidade ? "Selecione uma unidade primeiro" : "Digite para buscar..."}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {setorOrigemLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Switch Distribuição Automática entre Setores */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.distribuicaoAutomaticaSetores}
                  onChange={(e) =>
                    setFormData({ ...formData, distribuicaoAutomaticaSetores: e.target.checked })
                  }
                  color="primary"
                />
              }
              label="Distribuição Automática entre Setores"
            />
            <Tooltip
              title="Quando ativada, a escala considerará automaticamente o subnúcleo da audiência para definir em qual setor a tarefa será cadastrada. Desative para definir manualmente a unidade e setor de destino."
              arrow
              placement="right"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: '#f5f5f5',
                    color: '#000',
                    fontSize: '0.875rem',
                    border: '1px solid #ccc',
                    '& .MuiTooltip-arrow': {
                      color: '#f5f5f5',
                    },
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'help' }}>
                <IconInfoCircle size={20} color="#1976d2" />
              </Box>
            </Tooltip>
          </Box>

          {/* Campos de Unidade e Setor Destino - aparecem quando distribuição automática está desativada */}
          {!formData.distribuicaoAutomaticaSetores && (
            <>
              {/* Unidade Destino */}
              <Autocomplete
                options={unidadeDestinoOptions}
                getOptionLabel={(option) => `${option.nome}${option.sigla ? ` (${option.sigla})` : ''}`}
                value={formData.unidadeDestino}
                loading={unidadeDestinoLoading}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, unidadeDestino: newValue });
                }}
                onInputChange={(event, newInputValue) => {
                  setUnidadeDestinoSearchTerm(newInputValue);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={unidadeDestinoSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : "Nenhuma unidade encontrada"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Unidade Destino"
                    variant="outlined"
                    fullWidth
                    placeholder="Digite para buscar unidade destino..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {unidadeDestinoLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              {/* Setor Destino */}
              <Autocomplete
                options={setorDestinoOptions}
                getOptionLabel={(option) => option.nome || ''}
                value={formData.setorDestino}
                loading={setorDestinoLoading}
                disabled={!formData.unidadeDestino}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, setorDestino: newValue });
                }}
                onInputChange={(event, newInputValue) => {
                  setSetorDestinoSearchTerm(newInputValue);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={
                  !formData.unidadeDestino 
                    ? "Selecione uma unidade destino primeiro" 
                    : setorDestinoSearchTerm.length < 2 
                      ? "Digite pelo menos 2 caracteres" 
                      : "Nenhum setor encontrado"
                }
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box
                      component="li"
                      key={key}
                      {...otherProps}
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start !important',
                        py: 1.5,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{option.nome}</span>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>{option.unidadeNome}</span>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Setor Destino"
                    variant="outlined"
                    fullWidth
                    placeholder={!formData.unidadeDestino ? "Selecione uma unidade destino primeiro" : "Digite para buscar..."}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {setorDestinoLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </>
          )}

          {/* Data Início */}
          <TextField
            label="Data Início"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.dataInicio}
            onChange={(e) =>
              setFormData({ ...formData, dataInicio: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Data Fim */}
          <TextField
            label="Data Fim"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.dataFim}
            onChange={(e) =>
              setFormData({ ...formData, dataFim: e.target.value })
            }
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Unidades Federativas - Multiple */}
          <Autocomplete
            multiple
            options={unidadesFederativasOptions}
            getOptionLabel={(option) => option.label}
            value={formData.unidadesFederativas}
            onChange={(e, newValue) =>
              setFormData({ ...formData, unidadesFederativas: newValue })
            }
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unidades Federativas"
                variant="outlined"
                placeholder="Selecione as UFs"
              />
            )}
          />

          {/* Órgãos Julgadores - Multiple com busca na API */}
          <Autocomplete
            multiple
            options={orgaoJulgadorOptions}
            getOptionLabel={(option) => option.nome || ''}
            value={formData.orgaoJulgadores}
            loading={orgaoJulgadorLoading}
            disabled={formData.unidadesFederativas.length === 0}
            onChange={(event, newValue) => {
              setFormData({ ...formData, orgaoJulgadores: newValue });
            }}
            onInputChange={(event, newInputValue) => {
              setOrgaoJulgadorSearchTerm(newInputValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterSelectedOptions
            noOptionsText={
              formData.unidadesFederativas.length === 0 
                ? "Selecione pelo menos uma UF primeiro" 
                : "Nenhum órgão julgador encontrado"
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Órgãos Julgadores"
                variant="outlined"
                placeholder={formData.unidadesFederativas.length === 0 ? "Selecione UFs primeiro" : "Selecione ou digite para filtrar..."}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {orgaoJulgadorLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Tipo Contestação - Multiple */}
          <Autocomplete
            multiple
            options={tipoContestacaoOptions}
            getOptionLabel={(option) => option.label}
            value={formData.tipoContestacao}
            onChange={(e, newValue) =>
              setFormData({ ...formData, tipoContestacao: newValue })
            }
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tipo Contestação"
                variant="outlined"
                placeholder="Selecione os tipos"
              />
            )}
          />

          {/* Pautistas ou Avaliadores - Multiple */}
          {isPautista ? (
            <Autocomplete
              multiple
              options={pautistaOptions}
              getOptionLabel={(option) => option.nome || ''}
              value={formData.pessoas}
              loading={pautistaLoading}
              onChange={(event, newValue) => {
                setFormData({ ...formData, pessoas: newValue });
              }}
              onInputChange={(event, newInputValue) => {
                setPautistaSearchTerm(newInputValue);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterSelectedOptions
              noOptionsText="Nenhum pautista encontrado"
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box
                    component="li"
                    key={key}
                    {...otherProps}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start !important',
                      py: 1.5,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{option.nome}</span>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{option.setor}</span>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={pessoaLabel}
                  variant="outlined"
                  placeholder="Selecione ou digite para filtrar..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {pautistaLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          ) : (
            <Autocomplete
              multiple
              options={avaliadorOptions}
              getOptionLabel={(option) => option.nome || ''}
              value={formData.pessoas}
              loading={avaliadorLoading}
              onChange={(event, newValue) => {
                setFormData({ ...formData, pessoas: newValue });
              }}
              onInputChange={(event, newInputValue) => {
                setAvaliadorSearchTerm(newInputValue);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterSelectedOptions
              noOptionsText="Nenhum avaliador encontrado"
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box
                    component="li"
                    key={key}
                    {...otherProps}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-start !important',
                      py: 1.5,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{option.nome}</span>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>{option.setor}</span>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={pessoaLabel}
                  variant="outlined"
                  placeholder="Selecione ou digite para filtrar..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {avaliadorLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          )}

          {/* Botão Iniciar Escala Automática */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Fab
              color="primary"
              variant="extended"
              type="submit"
              disabled={submitting}
              sx={{
                px: 4,
              }}
            >
              {submitting ? (
                <CircularProgress size={20} color="inherit" style={{ marginRight: 8 }} />
              ) : (
                <IconPlayerPlay size={20} style={{ marginRight: 8 }} />
              )}
              {submitting ? 'Processando...' : 'Iniciar Escala Automática'}
            </Fab>
          </Box>
        </Box>
      </DashboardCard>

      {/* Dialog para feedback com loading */}
      <Dialog
        open={dialog.open}
        onClose={dialog.loading ? undefined : handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, p: 1 }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {dialog.loading ? (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h6" color="textSecondary">
                {dialog.message}
              </Typography>
            </>
          ) : (
            <>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  bgcolor: dialog.success ? 'success.light' : 'error.light',
                }}
              >
                {dialog.success ? (
                  <IconCheck size={40} color="#2e7d32" />
                ) : (
                  <IconX size={40} color="#d32f2f" />
                )}
              </Box>
              <Typography variant="h6" gutterBottom>
                {dialog.success ? 'Sucesso!' : 'Erro'}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {dialog.message}
              </Typography>
            </>
          )}
        </DialogContent>
        {!dialog.loading && (
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              variant="contained"
              color={dialog.success ? 'primary' : 'error'}
              onClick={handleCloseDialog}
              sx={{ px: 4 }}
            >
              Fechar
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </PageContainer>
  );
};

export default EscalaForm;
