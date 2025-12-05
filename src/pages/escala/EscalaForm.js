import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Fab,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { IconPlayerPlay } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import sapiensService from '../../services/sapiensService';
import orgaoJulgadorService from '../../services/orgaoJulgadorService';
import avaliadorService from '../../services/avaliadorService';
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
  { label: 'TIPO 1', value: 'TIPO_1' },
  { label: 'TIPO 2', value: 'TIPO_2' },
  { label: 'TIPO 3', value: 'TIPO_3' },
  { label: 'TIPO 4', value: 'TIPO_4' },
  { label: 'TIPO 5', value: 'TIPO_5' },
  { label: 'SEM TIPO', value: 'SEM_TIPO' },
  { label: 'SEM CONTESTAÇÃO', value: 'SEM_CONTESTACAO' },
];

const pautistaOptions = [
  { label: 'João Silva', value: 'joao' },
  { label: 'Maria Santos', value: 'maria' },
  { label: 'Pedro Oliveira', value: 'pedro' },
  { label: 'Ana Costa', value: 'ana' },
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
    setorResponsavel: null,
    dataInicio: '',
    dataFim: '',
    unidadesFederativas: [],
    orgaoJulgadores: [],
    tipoContestacao: [],
    pessoas: [],
  });

  // Pré-selecionar a unidade do usuário logado quando o user carregar
  useEffect(() => {
    if (user?.unidade && !formData.unidade) {
      const unidadePadrao = {
        id: user.unidade.id || user.unidade.unidadeId,
        nome: user.unidade.nome,
        sigla: user.unidade.sigla || '',
      };
      setFormData(prev => ({ ...prev, unidade: unidadePadrao }));
    }
  }, [user]);

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

  // Estados para busca de setor responsável
  const [setorOptions, setSetorOptions] = useState([]);
  const [setorSearchTerm, setSetorSearchTerm] = useState('');
  const [setorLoading, setSetorLoading] = useState(false);

  // Estados para busca de órgão julgador
  const [orgaoJulgadorOptions, setOrgaoJulgadorOptions] = useState([]);
  const [orgaoJulgadorSearchTerm, setOrgaoJulgadorSearchTerm] = useState('');
  const [orgaoJulgadorLoading, setOrgaoJulgadorLoading] = useState(false);

  // Estados para busca de avaliadores
  const [avaliadorOptions, setAvaliadorOptions] = useState([]);
  const [avaliadorSearchTerm, setAvaliadorSearchTerm] = useState('');
  const [avaliadorLoading, setAvaliadorLoading] = useState(false);

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

  // Buscar unidades com debounce
  useEffect(() => {
    const buscar = async () => {
      if (unidadeSearchTerm.length < 2) {
        setUnidadeOptions([]);
        return;
      }

      setUnidadeLoading(true);
      try {
        const results = await sapiensService.buscarUnidade(unidadeSearchTerm);
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

  // Buscar setor origem com debounce (depende da unidade selecionada)
  useEffect(() => {
    const buscar = async () => {
      if (setorOrigemSearchTerm.length < 2 || !formData.unidade?.id) {
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

  // Buscar setores responsáveis com debounce (depende da unidade selecionada)
  useEffect(() => {
    const buscar = async () => {
      if (setorSearchTerm.length < 2 || !formData.unidade?.id) {
        setSetorOptions([]);
        return;
      }

      setSetorLoading(true);
      try {
        const results = await sapiensService.buscarSetor(setorSearchTerm, formData.unidade.id);
        setSetorOptions(results);
      } catch (err) {
        console.error('Erro ao buscar setores:', err);
        setSetorOptions([]);
      } finally {
        setSetorLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [setorSearchTerm, formData.unidade]);

  // Limpar setores quando a unidade mudar
  useEffect(() => {
    setFormData(prev => ({ ...prev, setorOrigem: null, setorResponsavel: null }));
    setSetorOrigemOptions([]);
    setSetorOrigemSearchTerm('');
    setSetorOptions([]);
    setSetorSearchTerm('');
  }, [formData.unidade?.id]);

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

  // Estados para feedback do submit
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.especieTarefa) {
      setSnackbar({ open: true, message: 'Selecione uma Espécie Tarefa', severity: 'error' });
      return;
    }
    if (!formData.setorResponsavel) {
      setSnackbar({ open: true, message: 'Selecione um Setor Responsável', severity: 'error' });
      return;
    }
    if (!formData.dataInicio || !formData.dataFim) {
      setSnackbar({ open: true, message: 'Preencha as datas de início e fim', severity: 'error' });
      return;
    }
    if (formData.pessoas.length === 0) {
      setSnackbar({ open: true, message: `Selecione pelo menos um ${isPautista ? 'pautista' : 'avaliador'}`, severity: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      if (isPautista) {
        const response = await escalaService.escalarPautistas(formData);
        setSnackbar({ open: true, message: response?.message || 'Processo de escala de pautistas iniciado!', severity: 'success' });
      } else {
        const response = await escalaService.escalarAvaliadores(formData);
        setSnackbar({ open: true, message: response?.message || 'Processo de escala de avaliadores iniciado!', severity: 'success' });
      }
      
      // Limpar formulário após sucesso (opcional)
      // setFormData({ ... });
    } catch (error) {
      console.error('Erro ao escalar:', error);
      setSnackbar({ open: true, message: error.message || 'Erro ao processar escala', severity: 'error' });
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

          {/* Unidade - Autocomplete com busca na API do Sapiens */}
          <Autocomplete
            options={unidadeOptions}
            getOptionLabel={(option) => option.nome || ''}
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
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>{option.sigla}</span>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unidade"
                variant="outlined"
                fullWidth
                placeholder="Digite para buscar..."
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
            noOptionsText={!formData.unidade ? "Selecione uma unidade primeiro" : setorOrigemSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : "Nenhum setor encontrado"}
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
                placeholder="Digite para buscar..."
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

          {/* Setor Responsável - Autocomplete com busca na API do Sapiens */}
          <Autocomplete
            options={setorOptions}
            getOptionLabel={(option) => option.nome || ''}
            value={formData.setorResponsavel}
            loading={setorLoading}
            disabled={!formData.unidade}
            onChange={(event, newValue) => {
              setFormData({ ...formData, setorResponsavel: newValue });
            }}
            onInputChange={(event, newInputValue) => {
              setSetorSearchTerm(newInputValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={!formData.unidade ? "Selecione uma unidade primeiro" : setorSearchTerm.length < 2 ? "Digite pelo menos 2 caracteres" : "Nenhum setor encontrado"}
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
                label="Setor Responsável"
                variant="outlined"
                fullWidth
                placeholder="Digite para buscar..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {setorLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

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
              getOptionLabel={(option) => option.label}
              value={formData.pessoas}
              onChange={(e, newValue) =>
                setFormData({ ...formData, pessoas: newValue })
              }
              filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={pessoaLabel}
                  variant="outlined"
                  placeholder={`Selecione os ${pessoaLabel.toLowerCase()}`}
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

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default EscalaForm;
