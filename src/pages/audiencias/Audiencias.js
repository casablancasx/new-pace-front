import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { IconFilterOff, IconSearch, IconAlertCircle, IconCalendar, IconColumns } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import audienciaService from '../../services/audienciaService';
import orgaoJulgadorService from '../../services/orgaoJulgadorService';
import { getRespostaAnaliseColor, getRespostaAnaliseDescricao } from '../../constants/respostaAnaliseAvaliador';

// Styled TableRow com destaque para nova audiencia
const StyledTableRow = styled(TableRow)(({ theme, isNovaAudiencia }) => ({
  cursor: 'pointer',
  backgroundColor: isNovaAudiencia ? 'rgba(46, 125, 50, 0.08)' : 'inherit',
  '&:hover': {
    backgroundColor: isNovaAudiencia 
      ? 'rgba(46, 125, 50, 0.15)' 
      : theme.palette.action.hover,
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

const Audiencias = () => {
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

  const handleRowClick = (audiencia) => {
    if (audiencia?.processoUrl) {
      window.open(audiencia.processoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {audiencias.length > 0 ? (
                    audiencias.map((audiencia) => (
                      <StyledTableRow 
                        key={audiencia.audienciaId} 
                        isNovaAudiencia={audiencia.novaAudiencia}
                        onClick={() => handleRowClick(audiencia)}
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
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={ALL_COLUMNS.filter(c => visibleColumns[c.id]).length || 1} align="center">
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
  );
};

export default Audiencias;
