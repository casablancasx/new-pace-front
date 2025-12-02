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
  styled,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { IconFilterOff } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import pautaService from '../../services/pautaService';
import orgaoJulgadorService from '../../services/orgaoJulgadorService';
import avaliadorService from '../../services/avaliadorService';

// Styled TableRow clicável
const ClickableTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Pautas = () => {
  const navigate = useNavigate();

  // Estado dos filtros
  const [filters, setFilters] = useState({
    orgaoJulgador: null,
    avaliador: null,
  });

  // Estado da paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Estado dos dados
  const [pautas, setPautas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado de erro/feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // Estado dos autocompletes
  const [orgaoJulgadorOptions, setOrgaoJulgadorOptions] = useState([]);
  const [orgaoJulgadorLoading, setOrgaoJulgadorLoading] = useState(false);
  const [orgaoJulgadorInputValue, setOrgaoJulgadorInputValue] = useState('');

  const [avaliadorOptions, setAvaliadorOptions] = useState([]);
  const [avaliadorLoading, setAvaliadorLoading] = useState(false);
  const [avaliadorInputValue, setAvaliadorInputValue] = useState('');

  // Buscar pautas do backend
  const fetchPautas = useCallback(async () => {
    setLoading(true);
    try {
      const filtros = {};
      if (filters.orgaoJulgador) {
        filtros.orgaoJulgadorId = filters.orgaoJulgador.id;
      }
      if (filters.avaliador) {
        filtros.avaliadorId = filters.avaliador.id;
      }

      const response = await pautaService.listar(page, rowsPerPage, filtros);
      setPautas(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('Erro ao buscar pautas:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar pautas. Tente novamente.',
        severity: 'error',
      });
      setPautas([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  // Buscar pautas quando página, filtros ou rowsPerPage mudam
  useEffect(() => {
    fetchPautas();
  }, [fetchPautas]);

  // Buscar órgãos julgadores (autocomplete)
  useEffect(() => {
    const buscarOrgaosJulgadores = async () => {
      if (orgaoJulgadorInputValue.length < 2) {
        setOrgaoJulgadorOptions([]);
        return;
      }

      setOrgaoJulgadorLoading(true);
      try {
        // Busca sem filtro de UF para listar todos
        const resultados = await orgaoJulgadorService.buscar(orgaoJulgadorInputValue, []);
        setOrgaoJulgadorOptions(resultados);
      } catch (error) {
        console.error('Erro ao buscar órgãos julgadores:', error);
        setOrgaoJulgadorOptions([]);
      } finally {
        setOrgaoJulgadorLoading(false);
      }
    };

    const timeoutId = setTimeout(buscarOrgaosJulgadores, 300);
    return () => clearTimeout(timeoutId);
  }, [orgaoJulgadorInputValue]);

  // Buscar avaliadores (autocomplete)
  useEffect(() => {
    const buscarAvaliadores = async () => {
      if (avaliadorInputValue.length < 2) {
        setAvaliadorOptions([]);
        return;
      }

      setAvaliadorLoading(true);
      try {
        const resultados = await avaliadorService.buscar(avaliadorInputValue);
        setAvaliadorOptions(resultados);
      } catch (error) {
        console.error('Erro ao buscar avaliadores:', error);
        setAvaliadorOptions([]);
      } finally {
        setAvaliadorLoading(false);
      }
    };

    const timeoutId = setTimeout(buscarAvaliadores, 300);
    return () => clearTimeout(timeoutId);
  }, [avaliadorInputValue]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      orgaoJulgador: null,
      avaliador: null,
    });
    setOrgaoJulgadorInputValue('');
    setAvaliadorInputValue('');
    setPage(0);
  };

  const handleRowClick = (pautaId) => {
    navigate(`/pautas/${pautaId}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title="Pautas" description="Listagem de Pautas">
      {/* Seção de Filtros */}
      <Box sx={{ mb: 3 }}>
        <DashboardCard title="Filtros">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* Órgão Julgador */}
              <Autocomplete
                fullWidth
                options={orgaoJulgadorOptions}
                getOptionLabel={(option) => option.nome || ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={filters.orgaoJulgador}
                onChange={(e, newValue) => {
                  setFilters({ ...filters, orgaoJulgador: newValue });
                  setPage(0);
                }}
                inputValue={orgaoJulgadorInputValue}
                onInputChange={(e, newInputValue) => setOrgaoJulgadorInputValue(newInputValue)}
                loading={orgaoJulgadorLoading}
                noOptionsText={
                  orgaoJulgadorInputValue.length < 2
                    ? 'Digite ao menos 2 caracteres'
                    : 'Nenhum órgão julgador encontrado'
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Órgão Julgador"
                    variant="outlined"
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

              {/* Avaliador */}
              <Autocomplete
                fullWidth
                options={avaliadorOptions}
                getOptionLabel={(option) => option.nome || ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={filters.avaliador}
                onChange={(e, newValue) => {
                  setFilters({ ...filters, avaliador: newValue });
                  setPage(0);
                }}
                inputValue={avaliadorInputValue}
                onInputChange={(e, newInputValue) => setAvaliadorInputValue(newInputValue)}
                loading={avaliadorLoading}
                noOptionsText={
                  avaliadorInputValue.length < 2
                    ? 'Digite ao menos 2 caracteres'
                    : 'Nenhum avaliador encontrado'
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Avaliador"
                    variant="outlined"
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
            </Box>
          </Box>
        </DashboardCard>
      </Box>

      {/* Tabela de Pautas */}
      <DashboardCard title="Pautas">
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table
                aria-label="tabela de pautas"
                sx={{
                  whiteSpace: 'nowrap',
                  mt: 2,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        ID
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Data
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Órgão Julgador
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Turno
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Sala
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Pautista
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Avaliador
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pautas.length > 0 ? (
                    pautas.map((pauta) => (
                      <ClickableTableRow key={pauta.pautaId} onClick={() => handleRowClick(pauta.pautaId)}>
                        <TableCell>
                          <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                            {pauta.pautaId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.data}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.orgaoJulgador}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.turno}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.sala}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.pautista || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.avaliador || '-'}
                          </Typography>
                        </TableCell>
                      </ClickableTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="textSecondary" sx={{ py: 3 }}>
                          Nenhuma pauta encontrada
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
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
              />
            </>
          )}
        </Box>
      </DashboardCard>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default Pautas;
