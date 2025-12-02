import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { IconFilterOff, IconSearch } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import audienciaService from '../../services/audienciaService';
import orgaoJulgadorService from '../../services/orgaoJulgadorService';

// Styled TableRow clicável
const ClickableTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'AGENDADA':
      return 'primary.main';
    case 'EM_ANDAMENTO':
    case 'EM ANDAMENTO':
      return 'warning.main';
    case 'CONCLUIDA':
    case 'CONCLUÍDA':
      return 'success.main';
    case 'CANCELADA':
      return 'error.main';
    default:
      return 'grey.500';
  }
};

const getPrioridadeColor = (isPrioritaria) => {
  return isPrioritaria ? 'error.main' : 'primary.main';
};

const formatStatus = (status) => {
  if (!status) return '-';
  return status.replace(/_/g, ' ');
};

const Audiencias = () => {
  const navigate = useNavigate();

  // Estado dos filtros
  const [filters, setFilters] = useState({
    numeroProcesso: '',
    orgaoJulgador: null,
  });

  // Estado da paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Estado dos dados
  const [audiencias, setAudiencias] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para busca de órgão julgador
  const [orgaoJulgadorOptions, setOrgaoJulgadorOptions] = useState([]);
  const [orgaoJulgadorSearchTerm, setOrgaoJulgadorSearchTerm] = useState('');
  const [orgaoJulgadorLoading, setOrgaoJulgadorLoading] = useState(false);

  // Carregar órgãos julgadores
  useEffect(() => {
    const buscar = async () => {
      setOrgaoJulgadorLoading(true);
      try {
        // Busca todos os órgãos julgadores (sem filtro de UF para a tela de audiências)
        const results = await orgaoJulgadorService.buscar(orgaoJulgadorSearchTerm || '');
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
  }, [orgaoJulgadorSearchTerm]);

  // Carregar órgãos na montagem
  useEffect(() => {
    const carregarOrgaos = async () => {
      setOrgaoJulgadorLoading(true);
      try {
        const results = await orgaoJulgadorService.buscar('');
        setOrgaoJulgadorOptions(results);
      } catch (err) {
        console.error('Erro ao carregar órgãos julgadores:', err);
      } finally {
        setOrgaoJulgadorLoading(false);
      }
    };
    carregarOrgaos();
  }, []);

  // Buscar audiências
  const buscarAudiencias = useCallback(async () => {
    setLoading(true);
    try {
      const response = await audienciaService.listar(
        page,
        rowsPerPage,
        filters.orgaoJulgador?.id || null,
        filters.numeroProcesso || null
      );
      setAudiencias(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error('Erro ao buscar audiências:', err);
      setAudiencias([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters.orgaoJulgador, filters.numeroProcesso]);

  // Buscar audiências quando os filtros ou paginação mudarem
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

  const handleRowClick = (audienciaId) => {
    // Navegar para detalhes da audiência se necessário
    // navigate(`/audiencias/${audienciaId}`);
  };

  return (
    <PageContainer title="Audiências" description="Listagem de Audiências">
      {/* Seção de Filtros */}
      <Box sx={{ mb: 3 }}>
        <DashboardCard title="Filtros">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* Número do Processo */}
              <TextField
                fullWidth
                label="Número do Processo"
                variant="outlined"
                value={filters.numeroProcesso}
                onChange={(e) =>
                  setFilters({ ...filters, numeroProcesso: e.target.value })
                }
                placeholder="Digite o número do processo"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />

              {/* Órgão Julgador - Autocomplete com busca na API */}
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
                noOptionsText="Nenhum órgão julgador encontrado"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Órgão Julgador"
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

      {/* Tabela de Audiências */}
      <DashboardCard title="Audiências">
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table
                aria-label="tabela de audiências"
                sx={{
                  whiteSpace: 'nowrap',
                  mt: 2,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Hora
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Processo
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Parte
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Advogados
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Assunto
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Tipo Contestação
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Prioridade
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Status
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {audiencias.length > 0 ? (
                    audiencias.map((audiencia) => (
                      <ClickableTableRow 
                        key={audiencia.audienciaId} 
                        onClick={() => handleRowClick(audiencia.audienciaId)}
                      >
                        <TableCell>
                          <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                            {audiencia.hora || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {audiencia.numeroProcesso || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {audiencia.nomeParte || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {audiencia.advogados?.join(', ') || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            color="textSecondary" 
                            variant="subtitle2" 
                            fontWeight={400}
                            sx={{ 
                              maxWidth: 200, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={audiencia.assunto}
                          >
                            {audiencia.assunto || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {audiencia.tipoContestacao || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            sx={{
                              px: '4px',
                              backgroundColor: getPrioridadeColor(audiencia.isPrioritaria),
                              color: '#fff',
                            }}
                            size="small"
                            label={audiencia.isPrioritaria ? 'Alta' : 'Normal'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            sx={{
                              px: '4px',
                              backgroundColor: getStatusColor(audiencia.statusComparecimento),
                              color: '#fff',
                            }}
                            size="small"
                            label={formatStatus(audiencia.statusComparecimento) || '-'}
                          />
                        </TableCell>
                      </ClickableTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="textSecondary" sx={{ py: 3 }}>
                          Nenhuma audiência encontrada
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
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Linhas por página:"
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
