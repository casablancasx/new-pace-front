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
  MenuItem,
} from '@mui/material';
import { IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';
import { IconPlayerPlay } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import sapiensService from '../../services/sapiensService';
import orgaoJulgadorService from '../../services/orgaoJulgadorService';
import avaliadorService from '../../services/avaliadorService';
import apoioService from '../../services/apoioService';
import pautistaService from '../../services/pautistaService';
import escalaService from '../../services/escalaService';
import { AuthContext } from '../../context/AuthContext';

const unidadesFederativasOptions = [
  { label: 'TODOS', value: null },
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
  { label: 'TODOS', value: null },
  { label: 'TIPO 1', value: 'TIPO1' },
  { label: 'TIPO 2', value: 'TIPO2' },
  { label: 'TIPO 3', value: 'TIPO3' },
  { label: 'TIPO 4', value: 'TIPO4' },
  { label: 'TIPO 5', value: 'TIPO5' },
  { label: 'SEM TIPO', value: 'SEM_TIPO' },
  { label: 'SEM CONTESTAÇÃO', value: 'SEM_CONTESTACAO' },
];

const subnucleoOptions = [
  { label: 'TODOS', value: null },
  { label: 'ESEAS', value: 'ESEAS' },
  { label: 'EBI', value: 'EBI' },
  { label: 'ERU', value: 'ERU' },
];

const tipoEscalaOptions = [
  { label: 'Avaliador', value: 'AVALIADOR' },
  { label: 'Apoio', value: 'APOIO' },
  {label: 'Pautista', value: 'PAUTISTA' },
];

const EscalaForm = () => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    tipoEscala: '',
    especieTarefa: null,
    unidade: null,
    setorOrigem: null,
    dataInicio: '',
    dataFim: '',
    unidadesFederativas: [],
    orgaoJulgadores: [],
    tipoContestacao: [],
    subnucleos: [],
    pessoas: [],
    distribuirParaMim: false,
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

  // Estados para busca de usuários (avaliadores ou apoio)
  const [usuarioOptions, setUsuarioOptions] = useState([]);
  const [usuarioSearchTerm, setUsuarioSearchTerm] = useState('');
  const [usuarioLoading, setUsuarioLoading] = useState(false);

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
        const ufs = formData.unidadesFederativas.map(uf => uf.value).filter(v => v !== null);
        const results = await orgaoJulgadorService.buscar(orgaoJulgadorSearchTerm || '', ufs);
        // Adicionar opção TODOS no início
        setOrgaoJulgadorOptions([
          { id: null, nome: 'TODOS' },
          ...results
        ]);
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

  // Buscar usuários conforme tipoEscala selecionado
  useEffect(() => {
    const buscar = async () => {
      if (!formData.tipoEscala) return;

      setUsuarioLoading(true);
      try {
        let results;
        if (formData.tipoEscala === 'AVALIADOR') {
          results = await avaliadorService.buscar(usuarioSearchTerm);
        } else if (formData.tipoEscala === 'PAUTISTA') {
          results = await pautistaService.buscar(usuarioSearchTerm);
        } else {
          results = await apoioService.buscar(usuarioSearchTerm);
        }
        // Adicionar opção TODOS no início
        setUsuarioOptions([
          { id: null, nome: 'TODOS', email: '' },
          ...results
        ]);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setUsuarioOptions([]);
      } finally {
        setUsuarioLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 300);
    return () => clearTimeout(timeoutId);
  }, [usuarioSearchTerm, formData.tipoEscala]);

  // Carregar usuários na montagem quando tipoEscala mudar
  useEffect(() => {
    if (!formData.tipoEscala) {
      setUsuarioOptions([]);
      return;
    }

    const carregar = async () => {
      setUsuarioLoading(true);
      try {
        let results;
        if (formData.tipoEscala === 'AVALIADOR') {
          results = await avaliadorService.buscar('');
        } else if (formData.tipoEscala === 'PAUTISTA') {
          results = await pautistaService.buscar('');
        } else {
          results = await apoioService.buscar('');
        }
        // Adicionar opção TODOS no início
        setUsuarioOptions([
          { id: null, nome: 'TODOS', email: '' },
          ...results
        ]);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
      } finally {
        setUsuarioLoading(false);
      }
    };
    carregar();
  }, [formData.tipoEscala]);

  // Limpar pessoas selecionadas quando tipoEscala mudar
  useEffect(() => {
    setFormData(prev => ({ ...prev, pessoas: [] }));
    setUsuarioSearchTerm('');
    setUsuarioOptions([]);
  }, [formData.tipoEscala]);

  // Estados para feedback do submit
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dialog, setDialog] = useState({ 
    open: false, 
    loading: false, 
    message: '', 
    success: false 
  });

  const handleCloseDialog = () => {
    setDialog({ open: false, loading: false, message: '', success: false });
    setFieldErrors({}); // Limpar erros ao fechar qualquer dialog
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!formData.especieTarefa) errors.especieTarefa = 'Campo obrigatório';
    if (!formData.unidade) errors.unidade = 'Campo obrigatório';
    if (!formData.setorOrigem) errors.setorOrigem = 'Campo obrigatório';
    if (!formData.dataInicio) errors.dataInicio = 'Campo obrigatório';
    if (!formData.dataFim) errors.dataFim = 'Campo obrigatório';
    if (!formData.unidadesFederativas || formData.unidadesFederativas.length === 0) errors.unidadesFederativas = 'Selecione pelo menos uma UF';
    if (!formData.tipoContestacao || formData.tipoContestacao.length === 0) errors.tipoContestacao = 'Selecione pelo menos um tipo de contestação';
    if (!formData.subnucleos || formData.subnucleos.length === 0) errors.subnucleos = 'Selecione pelo menos um subnúcleo';
    if (!formData.orgaoJulgadores || formData.orgaoJulgadores.length === 0) errors.orgaoJulgadores = 'Selecione pelo menos um órgão julgador';
    if (!formData.tipoEscala) errors.tipoEscala = 'Campo obrigatório';
    if (!formData.distribuicaoAutomaticaSetores) {
      if (!formData.unidadeDestino) errors.unidadeDestino = 'Campo obrigatório';
      if (!formData.setorDestino) errors.setorDestino = 'Campo obrigatório';
    }
    // Validar pessoas se "Distribuir para Mim" estiver desativado
    if (formData.tipoEscala && !formData.distribuirParaMim && (!formData.pessoas || formData.pessoas.length === 0)) {
      errors.pessoas = 'Selecione pelo menos uma pessoa ou ative "Distribuir para Mim"';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setDialog({ open: true, loading: false, message: 'Preencha todos os campos obrigatórios destacados em vermelho', success: false });
      return;
    }

    setDialog({ open: true, loading: true, message: 'Processando escala...', success: false });
    setSubmitting(true);
    
    try {
      // Preparar dados para envio
      const payloadData = { ...formData };

      // Se distribuirParaMim está ativado, enviar pessoas como vazio
      if (payloadData.distribuirParaMim) {
        payloadData.pessoas = [];
      }

      const response = await escalaService.escalar(payloadData);
      
      let tipoLabel;
      if (payloadData.tipoEscala === 'AVALIADOR') {
        tipoLabel = 'avaliadores';
      } else if (payloadData.tipoEscala === 'PAUTISTA') {
        tipoLabel = 'pautistas';
      } else {
        tipoLabel = 'apoio';
      }
      
      setDialog({ 
        open: true, 
        loading: false, 
        message: response?.message || `Processo de escala de ${tipoLabel} iniciado!`, 
        success: true 
      });
    } catch (error) {
      console.error('Erro ao escalar:', error);
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
    <PageContainer title="Escala" description="Página de Escala">
      <DashboardCard title="Escala">
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Espécie Tarefa */}
          <Autocomplete
            options={especieTarefaOptions}
            getOptionLabel={(option) => option.nome || ''}
            value={formData.especieTarefa}
            loading={especieTarefaLoading}
            slotProps={{ paper: { placement: 'bottom-start' } }}
            onChange={(event, newValue) => {
              setFormData({ ...formData, especieTarefa: newValue });
              if (newValue) setFieldErrors(prev => ({ ...prev, especieTarefa: undefined }));
            }}
            onInputChange={(event, newInputValue) => {
              setEspecieTarefaSearchTerm(newInputValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={especieTarefaSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : "Nenhuma espécie encontrada"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Espécie Tarefa *"
                variant="outlined"
                fullWidth
                placeholder="Digite para buscar..."
                error={!!fieldErrors.especieTarefa}
                helperText={fieldErrors.especieTarefa}
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

          {/* Unidade */}
          <Autocomplete
            options={unidadeOptions}
            getOptionLabel={(option) => `${option.nome}${option.sigla ? ` (${option.sigla})` : ''}`}
            value={formData.unidade}
            loading={unidadeLoading}
            slotProps={{ paper: { placement: 'bottom-start' } }}
            onChange={(event, newValue) => {
              setFormData({ ...formData, unidade: newValue });
              if (newValue) setFieldErrors(prev => ({ ...prev, unidade: undefined }));
            }}
            onInputChange={(event, newInputValue) => {
              setUnidadeSearchTerm(newInputValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={unidadeSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : "Nenhuma unidade encontrada"}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unidade *"
                variant="outlined"
                fullWidth
                placeholder="Digite para buscar unidade PFPA..."
                error={!!fieldErrors.unidade}
                helperText={fieldErrors.unidade}
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

          {/* Setor Origem */}
          <Autocomplete
            options={setorOrigemOptions}
            getOptionLabel={(option) => option.nome || ''}
            value={formData.setorOrigem}
            loading={setorOrigemLoading}
            disabled={!formData.unidade}
            slotProps={{ paper: { placement: 'bottom-start' } }}
            onChange={(event, newValue) => {
              setFormData({ ...formData, setorOrigem: newValue });
              if (newValue) setFieldErrors(prev => ({ ...prev, setorOrigem: undefined }));
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
                  <span>{option.nome}</span>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Setor Origem *"
                variant="outlined"
                fullWidth
                placeholder={!formData.unidade ? "Selecione uma unidade primeiro" : "Digite para buscar..."}
                error={!!fieldErrors.setorOrigem}
                helperText={fieldErrors.setorOrigem}
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
                slotProps={{ paper: { placement: 'bottom-start' } }}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, unidadeDestino: newValue });
                  if (newValue) setFieldErrors(prev => ({ ...prev, unidadeDestino: undefined }));
                }}
                onInputChange={(event, newInputValue) => {
                  setUnidadeDestinoSearchTerm(newInputValue);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText={unidadeDestinoSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : "Nenhuma unidade encontrada"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Unidade Destino *"
                    variant="outlined"
                    fullWidth
                    placeholder="Digite para buscar unidade destino..."
                    error={!!fieldErrors.unidadeDestino}
                    helperText={fieldErrors.unidadeDestino}
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
                slotProps={{ paper: { placement: 'bottom-start' } }}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, setorDestino: newValue });
                  if (newValue) setFieldErrors(prev => ({ ...prev, setorDestino: undefined }));
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
                      <span>{option.nome}</span>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Setor Destino *"
                    variant="outlined"
                    fullWidth
                    placeholder={!formData.unidadeDestino ? "Selecione uma unidade destino primeiro" : "Digite para buscar..."}
                    error={!!fieldErrors.setorDestino}
                    helperText={fieldErrors.setorDestino}
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
            label="Data Início *"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.dataInicio}
            onChange={(e) => {
              setFormData({ ...formData, dataInicio: e.target.value });
              if (e.target.value) setFieldErrors(prev => ({ ...prev, dataInicio: undefined }));
            }}
            error={!!fieldErrors.dataInicio}
            helperText={fieldErrors.dataInicio}
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Data Fim */}
          <TextField
            label="Data Fim *"
            type="date"
            fullWidth
            variant="outlined"
            value={formData.dataFim}
            onChange={(e) => {
              setFormData({ ...formData, dataFim: e.target.value });
              if (e.target.value) setFieldErrors(prev => ({ ...prev, dataFim: undefined }));
            }}
            error={!!fieldErrors.dataFim}
            helperText={fieldErrors.dataFim}
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
            slotProps={{ paper: { placement: 'bottom-start' } }}
            onChange={(e, newValue) => {
              setFormData({ ...formData, unidadesFederativas: newValue });
              if (newValue.length > 0) setFieldErrors(prev => ({ ...prev, unidadesFederativas: undefined }));
            }}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unidades Federativas *"
                variant="outlined"
                placeholder="Selecione as UFs"
                error={!!fieldErrors.unidadesFederativas}
                helperText={fieldErrors.unidadesFederativas}
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
            slotProps={{ paper: { placement: 'bottom-start' } }}
            disabled={formData.unidadesFederativas.length === 0}
            onChange={(event, newValue) => {
              setFormData({ ...formData, orgaoJulgadores: newValue });
              if (newValue.length > 0) setFieldErrors(prev => ({ ...prev, orgaoJulgadores: undefined }));
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
                label="Órgãos Julgadores *"
                variant="outlined"
                placeholder={formData.unidadesFederativas.length === 0 ? "Selecione UFs primeiro" : "Selecione ou digite para filtrar..."}
                error={!!fieldErrors.orgaoJulgadores}
                helperText={fieldErrors.orgaoJulgadores}
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
            slotProps={{ paper: { placement: 'bottom-start' } }}
            onChange={(e, newValue) => {
              // Se TODOS foi selecionado, selecionar todos os tipos de contestação
              const hasTodos = newValue.some(item => item.value === null);
              if (hasTodos) {
                // Remover a opção TODOS e colocar todos os outros tipos
                const allTypes = tipoContestacaoOptions.filter(option => option.value !== null);
                setFormData({ ...formData, tipoContestacao: allTypes });
                setFieldErrors(prev => ({ ...prev, tipoContestacao: undefined }));
              } else {
                setFormData({ ...formData, tipoContestacao: newValue });
                if (newValue.length > 0) setFieldErrors(prev => ({ ...prev, tipoContestacao: undefined }));
              }
            }}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tipo Contestação *"
                variant="outlined"
                placeholder="Selecione os tipos"
                error={!!fieldErrors.tipoContestacao}
                helperText={fieldErrors.tipoContestacao}
              />
            )}
          />

          {/* Subnúcleos - Multiple */}
          <Autocomplete
            multiple
            options={subnucleoOptions}
            getOptionLabel={(option) => option.label}
            value={formData.subnucleos}
            slotProps={{ paper: { placement: 'bottom-start' } }}
            onChange={(e, newValue) => {
              // Se TODOS foi selecionado, selecionar todos os subnúcleos
              const hasTodos = newValue.some(item => item.value === null);
              if (hasTodos) {
                // Remover a opção TODOS e colocar todos os outros subnúcleos
                const allSubnucleos = subnucleoOptions.filter(option => option.value !== null);
                setFormData({ ...formData, subnucleos: allSubnucleos });
                setFieldErrors(prev => ({ ...prev, subnucleos: undefined }));
              } else {
                setFormData({ ...formData, subnucleos: newValue });
                if (newValue.length > 0) setFieldErrors(prev => ({ ...prev, subnucleos: undefined }));
              }
            }}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                label="Subnúcleos *"
                variant="outlined"
                placeholder="Selecione os subnúcleos"
                error={!!fieldErrors.subnucleos}
                helperText={fieldErrors.subnucleos}
              />
            )}
          />

          {/* Tipo de Escala */}
          <TextField
            select
            label="Tipo de Escala *"
            value={formData.tipoEscala}
            onChange={(e) => {
              setFormData({ ...formData, tipoEscala: e.target.value });
              if (e.target.value) setFieldErrors(prev => ({ ...prev, tipoEscala: undefined }));
            }}
            variant="outlined"
            fullWidth
            error={!!fieldErrors.tipoEscala}
            helperText={fieldErrors.tipoEscala}
          >
            {tipoEscalaOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Distribuir para Mim - Switch que aparece após selecionar tipo de escala */}
          {formData.tipoEscala && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.distribuirParaMim}
                    onChange={(e) =>
                      setFormData({ ...formData, distribuirParaMim: e.target.checked, pessoas: [] })
                    }
                    color="primary"
                  />
                }
                label="Distribuir para Mim"
              />
              <Tooltip
                title="Ao ativar esta opção as tarefas serão cadastradas no seu grid do sapiens. Recomendamos essa opção somente para tipo de escala APOIO"
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
          )}

          {/* Usuários (Avaliadores ou Apoio) - Aparece apenas após selecionar tipo de escala e distribuirParaMim estar desativado */}
          {formData.tipoEscala && !formData.distribuirParaMim && (
            <Autocomplete
              multiple
              options={usuarioOptions}
              getOptionLabel={(option) => option.nome || ''}
              value={formData.pessoas}
              loading={usuarioLoading}
              slotProps={{ paper: { placement: 'bottom-start' } }}
              onChange={(event, newValue) => {
                setFormData({ ...formData, pessoas: newValue });
                if (newValue.length > 0) setFieldErrors(prev => ({ ...prev, pessoas: undefined }));
              }}
              onInputChange={(event, newInputValue) => {
                setUsuarioSearchTerm(newInputValue);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterSelectedOptions
              noOptionsText="Nenhum usuário encontrado"
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
                    <span>{option.nome}</span>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    formData.tipoEscala === 'AVALIADOR' 
                      ? 'Selecione os avaliadores' 
                      : formData.tipoEscala === 'PAUTISTA'
                      ? 'Selecione os pautistas'
                      : 'Selecione os agentes de apoio'
                  }
                  variant="outlined"
                  placeholder="Selecione ou digite para filtrar..."
                  error={!!fieldErrors.pessoas}
                  helperText={fieldErrors.pessoas}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {usuarioLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
