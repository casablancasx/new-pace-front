import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Autocomplete,
  Button,
  Stack,
  Chip,
  styled,
  CircularProgress,
  Tooltip,
  TableSortLabel,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
} from '@mui/material';
import { IconFilterOff, IconSearch, IconAlertCircle, IconCalendar, IconColumns, IconSettings, IconExternalLink } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import audienciaService from '../../services/audienciaService';
import orgaoJulgadorService from '../../services/orgaoJulgadorService';
import { getRespostaAnaliseColor, getRespostaAnaliseDescricao } from '../../constants/respostaAnaliseAvaliador';
import { AuthContext } from '../../context/AuthContext';
import controleEscalaService from '../../services/controleEscalaService';
import sapiensService from '../../services/sapiensService';

// Styled TableRow
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Cores para analise do avaliador
const getAnaliseColor = (analise) => {
  switch (analise) {
    case 'COMPARECIMENTO':
      return 'success';
    case 'NAO_COMPARECER':
      return 'error';
    case 'CANCELADA':
      return 'default';
    case 'ANALISE_PENDENTE':
    default:
      return 'warning';
  }
};

const formatAnalise = (analise) => {
  switch (analise) {
    case 'COMPARECIMENTO':
      return 'Comparecer';
    case 'NAO_COMPARECER':
      return 'Nao Comparecer';
    case 'CANCELADA':
      return 'Cancelada';
    case 'ANALISE_PENDENTE':
    default:
      return 'Pendente';
  }
};

// Cores para status de cadastro de tarefa
const getStatusTarefaColor = (status) => {
  switch (status) {
    case 'CADASTRADA':
      return 'success';
    case 'ERRO':
      return 'error';
    case 'PENDENTE':
    default:
      return 'warning';
  }
};

const formatStatusTarefa = (status) => {
  switch (status) {
    case 'CADASTRADA':
      return 'Cadastrada';
    case 'ERRO':
      return 'Erro';
    case 'PENDENTE':
    default:
      return 'Pendente';
  }
};

// Cores para tipo de contestacao
const getTipoContestacaoColor = (tipo) => {
  switch (tipo) {
    case 'TIPO1':
      return 'primary';
    case 'TIPO2':
      return 'secondary';
    case 'TIPO3':
      return 'info';
    case 'TIPO4':
      return 'warning';
    case 'TIPO5':
      return 'error';
    case 'SEM_TIPO':
    case 'SEM_CONTESTACAO':
    default:
      return 'default';
  }
};

const formatTipoContestacao = (tipo) => {
  if (!tipo) return '-';
  return tipo.replace(/_/g, ' ');
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const TIPO_ESCALA_OPTS = [
  { value: 'PAUTISTA', label: 'Pautista' },
  { value: 'AVALIADOR', label: 'Avaliador' },
  { value: 'APOIO', label: 'Apoio' },
];

const INITIAL_ESCALA_FORM = {
  tipoEscala: '',
  usuario: null,
  setorOrigem: null,
  setorDestino: null,
  especieTarefa: null,
};

const Audiencias = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  // Definição de colunas disponíveis
  const ALL_COLUMNS = [
    { id: 'id', label: 'ID' },
    { id: 'horario', label: 'Horario' },
    { id: 'data', label: 'Data' },
    { id: 'processo', label: 'Processo' },
    { id: 'parte', label: 'Parte' },
    { id: 'assunto', label: 'Assunto' },
    { id: 'advogados', label: 'Advogados' },
    { id: 'tipoContestacao', label: 'Tipo Contest.' },
    { id: 'analise', label: 'Analise' },
    { id: 'subnucleo', label: 'Subnúcleo' },
    { id: 'classeJudicial', label: 'Classe Judicial' },
    { id: 'pautista', label: 'Pautista' },
    { id: 'avaliador', label: 'Avaliador' },
    { id: 'observacao', label: 'Observação' },
  ];

  const defaultVisible = ALL_COLUMNS.reduce((acc, col) => {
    acc[col.id] = true;
    return acc;
  }, {});

  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);

  // Carregar preferências de colunas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('audiencias.visibleColumns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validar chaves conhecidas
        const merged = { ...defaultVisible };
        Object.keys(merged).forEach((key) => {
          if (key in parsed) merged[key] = !!parsed[key];
        });
        setVisibleColumns(merged);
      } catch {}
    }
  }, []);

  const toggleColumn = (id) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('audiencias.visibleColumns', JSON.stringify(next));
      return next;
    });
  };

  const openColumnsMenu = (event) => setColumnsMenuAnchor(event.currentTarget);
  const closeColumnsMenu = () => setColumnsMenuAnchor(null);

  // Estado dos filtros
  const [filters, setFilters] = useState({
    numeroProcesso: '',
    orgaoJulgador: null,
  });

  // Estado da paginacao e ordenacao
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [orderBy, setOrderBy] = useState('id');
  const [sort, setSort] = useState('DESC');

  // Estado dos dados
  const [audiencias, setAudiencias] = useState([]);
  const [loading, setLoading] = useState(false);

  // ─── Modal Escala Manual ──────────────────────────────────────────────────
  const [escalaModalOpen, setEscalaModalOpen] = useState(false);
  const [selectedAudiencia, setSelectedAudiencia] = useState(null);
  const [escalaForm, setEscalaForm] = useState(INITIAL_ESCALA_FORM);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [setorOrigemOptions, setSetorOrigemOptions] = useState([]);
  const [setorOrigemLoading, setSetorOrigemLoading] = useState(false);
  const [setorOrigemInput, setSetorOrigemInput] = useState('');
  const [setorDestinoOptions, setSetorDestinoOptions] = useState([]);
  const [setorDestinoLoading, setSetorDestinoLoading] = useState(false);
  const [setorDestinoInput, setSetorDestinoInput] = useState('');
  const [especieTarefaOptions, setEspecieTarefaOptions] = useState([]);
  const [especieTarefaLoading, setEspecieTarefaLoading] = useState(false);
  const [especieTarefaInput, setEspecieTarefaInput] = useState('');
  const [modalFeedback, setModalFeedback] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const setorOrigemDebounceRef = useRef(null);
  const setorDestinoDebounceRef = useRef(null);
  const especieTarefaDebounceRef = useRef(null);

  // Estados para busca de orgao julgador
  const [orgaoJulgadorOptions, setOrgaoJulgadorOptions] = useState([]);
  const [orgaoJulgadorSearchTerm, setOrgaoJulgadorSearchTerm] = useState('');
  const [orgaoJulgadorLoading, setOrgaoJulgadorLoading] = useState(false);

  // Carregar orgaos julgadores
  useEffect(() => {
    const buscar = async () => {
      setOrgaoJulgadorLoading(true);
      try {
        const results = await orgaoJulgadorService.buscar(orgaoJulgadorSearchTerm || '');
        setOrgaoJulgadorOptions(results);
      } catch (err) {
        console.error('Erro ao buscar orgaos julgadores:', err);
        setOrgaoJulgadorOptions([]);
      } finally {
        setOrgaoJulgadorLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 300);
    return () => clearTimeout(timeoutId);
  }, [orgaoJulgadorSearchTerm]);

  // Carregar orgaos na montagem
  useEffect(() => {
    const carregarOrgaos = async () => {
      setOrgaoJulgadorLoading(true);
      try {
        const results = await orgaoJulgadorService.buscar('');
        setOrgaoJulgadorOptions(results);
      } catch (err) {
        console.error('Erro ao carregar orgaos julgadores:', err);
      } finally {
        setOrgaoJulgadorLoading(false);
      }
    };
    carregarOrgaos();
  }, []);

  // ─── Efeitos de busca no Sapiens (modal) ─────────────────────────────────────────────
  useEffect(() => {
    if (setorOrigemDebounceRef.current) clearTimeout(setorOrigemDebounceRef.current);
    if (setorOrigemInput.length < 2) { setSetorOrigemOptions([]); return; }
    setorOrigemDebounceRef.current = setTimeout(async () => {
      setSetorOrigemLoading(true);
      try {
        const results = await sapiensService.buscarSetorLivre(setorOrigemInput);
        setSetorOrigemOptions(results);
      } catch (err) {
        console.error('Erro ao buscar setor origem:', err);
        setSetorOrigemOptions([]);
      } finally {
        setSetorOrigemLoading(false);
      }
    }, 400);
    return () => { if (setorOrigemDebounceRef.current) clearTimeout(setorOrigemDebounceRef.current); };
  }, [setorOrigemInput]);

  useEffect(() => {
    if (setorDestinoDebounceRef.current) clearTimeout(setorDestinoDebounceRef.current);
    if (setorDestinoInput.length < 2) { setSetorDestinoOptions([]); return; }
    setorDestinoDebounceRef.current = setTimeout(async () => {
      setSetorDestinoLoading(true);
      try {
        const results = await sapiensService.buscarSetorLivre(setorDestinoInput);
        setSetorDestinoOptions(results);
      } catch (err) {
        console.error('Erro ao buscar setor destino:', err);
        setSetorDestinoOptions([]);
      } finally {
        setSetorDestinoLoading(false);
      }
    }, 400);
    return () => { if (setorDestinoDebounceRef.current) clearTimeout(setorDestinoDebounceRef.current); };
  }, [setorDestinoInput]);

  useEffect(() => {
    if (especieTarefaDebounceRef.current) clearTimeout(especieTarefaDebounceRef.current);
    if (especieTarefaInput.length < 2) { setEspecieTarefaOptions([]); return; }
    especieTarefaDebounceRef.current = setTimeout(async () => {
      setEspecieTarefaLoading(true);
      try {
        const results = await sapiensService.buscarEspecieTarefa(especieTarefaInput);
        setEspecieTarefaOptions(results);
      } catch (err) {
        console.error('Erro ao buscar espécie de tarefa:', err);
        setEspecieTarefaOptions([]);
      } finally {
        setEspecieTarefaLoading(false);
      }
    }, 400);
    return () => { if (especieTarefaDebounceRef.current) clearTimeout(especieTarefaDebounceRef.current); };
  }, [especieTarefaInput]);

  // Buscar audiencias
  const buscarAudiencias = useCallback(async () => {
    setLoading(true);
    try {
      const response = await audienciaService.listar(
        page,
        rowsPerPage,
        filters.orgaoJulgador?.id || null,
        filters.numeroProcesso || null,
        orderBy,
        sort
      );
      const content = response?.content || response?.items || response?.data?.content || response?.data?.items || [];
      const total = response?.page?.totalElements ?? response?.totalElements ?? response?.total ?? response?.data?.totalElements ?? response?.data?.total ?? 0;
      setAudiencias(content);
      setTotalElements(total);
    } catch (err) {
      console.error('Erro ao buscar audiencias:', err);
      setAudiencias([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters.orgaoJulgador, filters.numeroProcesso, orderBy, sort]);

  // Buscar audiencias quando os filtros ou paginacao mudarem
  useEffect(() => {
    buscarAudiencias();
  }, [buscarAudiencias]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      numeroProcesso: '',
      orgaoJulgador: null,
    });
    setPage(0);
  };

  const handleSearch = () => {
    setPage(0);
    buscarAudiencias();
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && sort === 'ASC';
    setSort(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    setPage(0);
  };

  const handleVerProcesso = (e, audiencia) => {
    e.stopPropagation();
    if (audiencia?.processoUrl) {
      window.open(audiencia.processoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAbrirEscalaManual = (e, audiencia) => {
    e.stopPropagation();
    setSelectedAudiencia(audiencia);
    setEscalaForm(INITIAL_ESCALA_FORM);
    setUsuariosDisponiveis([]);
    setSetorOrigemOptions([]);
    setSetorOrigemInput('');
    setSetorDestinoOptions([]);
    setSetorDestinoInput('');
    setEspecieTarefaOptions([]);
    setEspecieTarefaInput('');
    setModalFeedback({ type: '', message: '' });
    setEscalaModalOpen(true);
  };

  const handleFecharModal = () => {
    setEscalaModalOpen(false);
    setSelectedAudiencia(null);
    setEscalaForm(INITIAL_ESCALA_FORM);
    setModalFeedback({ type: '', message: '' });
  };

  const handleTipoEscalaChange = async (value) => {
    setEscalaForm((prev) => ({ ...prev, tipoEscala: value, usuario: null }));
    setUsuariosDisponiveis([]);
    if (!value) return;
    setLoadingUsuarios(true);
    try {
      const lista = await controleEscalaService.listarUsuariosPorTipo(value);
      setUsuariosDisponiveis(lista.filter((u) => u.contaAtiva));
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleSubmitEscalaManual = async () => {
    const { tipoEscala, usuario, setorOrigem, setorDestino, especieTarefa } = escalaForm;
    if (!tipoEscala || !usuario || !setorOrigem || !setorDestino || !especieTarefa) {
      setModalFeedback({ type: 'error', message: 'Preencha todos os campos obrigatórios.' });
      return;
    }
    setSubmitting(true);
    setModalFeedback({ type: '', message: '' });
    try {
      await controleEscalaService.escalarManual({
        audienciaId: selectedAudiencia.audienciaId,
        usuarioId: usuario.sapiensId,
        tipoEscala,
        setorOrigemId: setorOrigem.id,
        setorDestinoId: setorDestino.id,
        especieTarefa: { id: especieTarefa.id, descricao: especieTarefa.nome },
      });
      setModalFeedback({ type: 'success', message: 'Escala manual realizada com sucesso!' });
      setTimeout(() => {
        handleFecharModal();
        buscarAudiencias();
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erro ao realizar escala manual.';
      setModalFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <PageContainer title="Consulta de Audiencias" description="Consulta de Audiencias">
      {/* Secao de Filtros */}
      <Box sx={{ mb: 3 }}>
        <DashboardCard title="Filtros">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* Numero do Processo */}
              <TextField
                fullWidth
                label="Numero do Processo"
                variant="outlined"
                value={filters.numeroProcesso}
                onChange={(e) =>
                  setFilters({ ...filters, numeroProcesso: e.target.value })
                }
                placeholder="Digite o numero do processo"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />

              {/* Orgao Julgador - Autocomplete com busca na API */}
              <Autocomplete
                fullWidth
                options={orgaoJulgadorOptions}
                getOptionLabel={(option) => option.nome || ''}
                value={filters.orgaoJulgador}
                loading={orgaoJulgadorLoading}
                onChange={(event, newValue) => {
                  setFilters({ ...filters, orgaoJulgador: newValue });
                }}
                onInputChange={(event, newInputValue) => {
                  setOrgaoJulgadorSearchTerm(newInputValue);
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="Nenhum orgao julgador encontrado"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Orgao Julgador"
                    variant="outlined"
                    placeholder="Selecione ou digite para filtrar..."
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
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<IconFilterOff size={18} />}
                onClick={handleClearFilters}
              >
                Limpar Filtros
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconSearch size={18} />}
                onClick={handleSearch}
              >
                Buscar
              </Button>
            </Box>
          </Box>
        </DashboardCard>
      </Box>

      

      {/* Tabela de Audiencias */}
      <DashboardCard title="Consulta de Audiencias">
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Colunas">
              <IconButton size="small" onClick={openColumnsMenu} aria-label="Selecionar colunas">
                <IconColumns size={18} />
              </IconButton>
            </Tooltip>
          </Box>
          <Menu anchorEl={columnsMenuAnchor} open={Boolean(columnsMenuAnchor)} onClose={closeColumnsMenu}>
            {ALL_COLUMNS.map((col) => (
              <MenuItem key={col.id} onClick={() => toggleColumn(col.id)} dense>
                <Checkbox checked={visibleColumns[col.id]} size="small" />
                <ListItemText primary={col.label} />
              </MenuItem>
            ))}
          </Menu>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table
                aria-label="tabela de audiencias"
                sx={{
                  mt: 2,
                  '& .MuiTableCell-root': {
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                  },
                  '& .MuiTypography-root': {
                    fontSize: 'inherit',
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    {visibleColumns.id && (
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'id'}
                          direction={orderBy === 'id' ? sort.toLowerCase() : 'desc'}
                          onClick={() => handleSort('id')}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            ID
                          </Typography>
                        </TableSortLabel>
                      </TableCell>
                    )}
                    {visibleColumns.horario && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Horario
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.data && (
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'data'}
                          direction={orderBy === 'data' ? sort.toLowerCase() : 'desc'}
                          onClick={() => handleSort('data')}
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            Data
                          </Typography>
                        </TableSortLabel>
                      </TableCell>
                    )}
                    {visibleColumns.processo && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Processo
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.parte && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Parte
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.assunto && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Assunto
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.advogados && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Advogados
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.tipoContestacao && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Tipo Contest.
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.analise && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Analise
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.subnucleo && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Subnúcleo
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.classeJudicial && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Classe Judicial
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.pautista && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Pautista
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.avaliador && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Avaliador
                        </Typography>
                      </TableCell>
                    )}
                    {visibleColumns.observacao && (
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Observação
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell
                      sx={{
                        position: 'sticky',
                        right: 0,
                        backgroundColor: 'background.paper',
                        zIndex: 1,
                        minWidth: 96,
                        textAlign: 'center',
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        Ações
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {audiencias.length > 0 ? (
                    audiencias.map((audiencia) => (
                      <StyledTableRow 
                        key={audiencia.audienciaId}
                      >
                        {visibleColumns.id && (
                          <TableCell>
                            <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                              {audiencia.audienciaId}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.horario && (
                          <TableCell>
                            <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                              {audiencia.horario || '-'}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.data && (
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={500}>
                              {formatDate(audiencia.data)}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.processo && (
                          <TableCell>
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {audiencia.numeroProcesso || '-'}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.parte && (
                          <TableCell>
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {audiencia.nomeParte || '-'}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.assunto && (
                          <TableCell>
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {audiencia.assunto || '-'}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.advogados && (
                          <TableCell>
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {audiencia.advogados?.length > 0 ? audiencia.advogados.join(', ') : '-'}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.tipoContestacao && (
                          <TableCell>
                            <Chip
                              size="small"
                              color={getTipoContestacaoColor(audiencia.tipoContestacao)}
                              label={formatTipoContestacao(audiencia.tipoContestacao)}
                            />
                          </TableCell>
                        )}
                        {visibleColumns.analise && (
                          <TableCell>
                            <Chip
                              size="small"
                              color={getRespostaAnaliseColor(audiencia.analiseAvaliador)}
                              label={audiencia.analiseAvaliador || 'Pendente'}
                            />
                          </TableCell>
                        )}
                        {visibleColumns.subnucleo && (
                          <TableCell>
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {audiencia.subnucleo || '-'}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.classeJudicial && (
                          <TableCell>
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {audiencia.classeJudicial || '-'}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.pautista && (
                          <TableCell>
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {audiencia.pautista || '-'}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.avaliador && (
                          <TableCell>
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {audiencia.avaliador || '-'}
                            </Typography>
                          </TableCell>
                        )}
                        {visibleColumns.observacao && (
                          <TableCell>
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {audiencia.observacao || '-'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            position: 'sticky',
                            right: 0,
                            backgroundColor: 'background.paper',
                            zIndex: 1,
                            borderLeft: '1px solid',
                            borderColor: 'divider',
                            textAlign: 'center',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                            <Tooltip title="Ver processo" placement="top">
                              <span>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={(e) => handleVerProcesso(e, audiencia)}
                                  disabled={!audiencia?.processoUrl}
                                >
                                  <IconExternalLink size={16} />
                                </IconButton>
                              </span>
                            </Tooltip>
                            {isAdmin && (
                              <Tooltip title="Escalar manualmente" placement="top">
                                <IconButton
                                  size="small"
                                  color="secondary"
                                  onClick={(e) => handleAbrirEscalaManual(e, audiencia)}
                                >
                                  <IconSettings size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={(ALL_COLUMNS.filter(c => visibleColumns[c.id]).length || 1) + 1} align="center">
                        <Typography color="textSecondary" sx={{ py: 3 }}>
                          Nenhuma audiencia encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={totalElements}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                labelRowsPerPage="Linhas por pagina:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
              />
            </>
          )}
        </Box>
      </DashboardCard>
    </PageContainer>

    {/* ─── Modal Escala Manual ─────────────────────────────────────── */}
    <Dialog open={escalaModalOpen} onClose={handleFecharModal} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Escala Manual de Audiência</DialogTitle>
      <DialogContent dividers>
        {selectedAudiencia && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Dados da Audiência
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Stack spacing={0.5}>
              <Typography variant="body2" color="textSecondary">
                <strong>Processo:</strong> {selectedAudiencia.numeroProcesso || '-'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Data:</strong> {formatDate(selectedAudiencia.data)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Horário:</strong> {selectedAudiencia.horario || '-'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Parte:</strong> {selectedAudiencia.nomeParte || '-'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Tipo Contestação:</strong> {selectedAudiencia.tipoContestacao || '-'}
              </Typography>
            </Stack>
          </Box>
        )}

        <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
          Configuração da Escala
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          {/* Tipo de Escala */}
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de Escala *</InputLabel>
            <Select
              label="Tipo de Escala *"
              value={escalaForm.tipoEscala}
              onChange={(e) => handleTipoEscalaChange(e.target.value)}
            >
              <MenuItem value=""><em>Selecione</em></MenuItem>
              {TIPO_ESCALA_OPTS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Usuário Destino */}
          <FormControl fullWidth size="small">
            <InputLabel>Usuário Destino *</InputLabel>
            <Select
              label="Usuário Destino *"
              value={escalaForm.usuario?.sapiensId || ''}
              onChange={(e) => {
                const u = usuariosDisponiveis.find((x) => x.sapiensId === e.target.value);
                setEscalaForm((prev) => ({ ...prev, usuario: u || null }));
              }}
              disabled={!escalaForm.tipoEscala || loadingUsuarios}
            >
              <MenuItem value=""><em>{loadingUsuarios ? 'Carregando...' : 'Selecione'}</em></MenuItem>
              {usuariosDisponiveis.map((u) => (
                <MenuItem key={u.sapiensId} value={u.sapiensId}>
                  {u.nome} ({u.sapiensId})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Setor Origem */}
          <Autocomplete
            options={setorOrigemOptions}
            getOptionLabel={(opt) => opt.nome ? `${opt.nome}${opt.unidadeNome ? ' - ' + opt.unidadeNome : ''}` : ''}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={escalaForm.setorOrigem}
            loading={setorOrigemLoading}
            onInputChange={(_, v) => setSetorOrigemInput(v)}
            onChange={(_, v) => setEscalaForm((prev) => ({ ...prev, setorOrigem: v }))}
            noOptionsText={setorOrigemInput.length < 2 ? 'Digite ao menos 2 caracteres' : 'Nenhum setor encontrado'}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Setor Origem *"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>{setorOrigemLoading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>
                  ),
                }}
              />
            )}
          />

          {/* Setor Destino */}
          <Autocomplete
            options={setorDestinoOptions}
            getOptionLabel={(opt) => opt.nome ? `${opt.nome}${opt.unidadeNome ? ' - ' + opt.unidadeNome : ''}` : ''}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={escalaForm.setorDestino}
            loading={setorDestinoLoading}
            onInputChange={(_, v) => setSetorDestinoInput(v)}
            onChange={(_, v) => setEscalaForm((prev) => ({ ...prev, setorDestino: v }))}
            noOptionsText={setorDestinoInput.length < 2 ? 'Digite ao menos 2 caracteres' : 'Nenhum setor encontrado'}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Setor Destino *"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>{setorDestinoLoading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>
                  ),
                }}
              />
            )}
          />

          {/* Espécie de Tarefa */}
          <Autocomplete
            options={especieTarefaOptions}
            getOptionLabel={(opt) => opt.nome ? `${opt.nome} (${opt.id})` : ''}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={escalaForm.especieTarefa}
            loading={especieTarefaLoading}
            onInputChange={(_, v) => setEspecieTarefaInput(v)}
            onChange={(_, v) => setEscalaForm((prev) => ({ ...prev, especieTarefa: v }))}
            noOptionsText={especieTarefaInput.length < 2 ? 'Digite ao menos 2 caracteres' : 'Nenhuma espécie encontrada'}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Espécie de Tarefa *"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>{especieTarefaLoading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>
                  ),
                }}
              />
            )}
          />
        </Stack>

        {modalFeedback.message && (
          <Alert severity={modalFeedback.type || 'info'} sx={{ mt: 2 }}>
            {modalFeedback.message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleFecharModal} variant="outlined" color="secondary" disabled={submitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmitEscalaManual}
          variant="contained"
          color="primary"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : <IconSettings size={16} />}
        >
          {submitting ? 'Escalando...' : 'Escalar Audiência'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default Audiencias;
