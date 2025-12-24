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
    uf: null,
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

  const [ufInputValue, setUfInputValue] = useState('');

  // Buscar pautas do backend
  const fetchPautas = useCallback(async () => {
    setLoading(true);
    try {
      const filtros = {};
      if (filters.orgaoJulgador) {
        filtros.orgaoJulgadorId = filters.orgaoJulgador.id;
      }
      if (filters.uf) {
        filtros.uf = filters.uf.value;
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
      uf: null,
    });
    setOrgaoJulgadorInputValue('');
    setUfInputValue('');
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

              {/* UF */}
              <Autocomplete
                fullWidth
                options={unidadesFederativasOptions}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                value={filters.uf}
                onChange={(e, newValue) => {
                  setFilters({ ...filters, uf: newValue });
                  setPage(0);
                }}
                inputValue={ufInputValue}
                onInputChange={(e, newInputValue) => setUfInputValue(newInputValue)}
                noOptionsText={ufInputValue ? 'Nenhuma UF encontrada' : 'Selecione uma UF'}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="UF"
                    variant="outlined"
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
                    <TableCell sx={{ minWidth: 200 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Órgão Julgador
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        UF
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
                        Criado Em
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pautas.length > 0 ? (
                    pautas.map((pauta) => (
                      <ClickableTableRow
                        key={pauta.pautaId}
                        onClick={() => handleRowClick(pauta.pautaId)}
                        sx={
                          pauta.possuiNovaAudiencia
                            ? {
                                backgroundColor: '#e8f5e9',
                                '&:hover': { backgroundColor: '#d0ebd4' },
                              }
                            : {}
                        }
                      >
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
                        <TableCell sx={{ maxWidth: 250, wordWrap: 'break-word', whiteSpace: 'normal' }}>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.orgaoJulgador?.nome || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.orgaoJulgador?.uf?.sigla || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.turno}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.sala?.nome || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {pauta.criadoEm ? new Date(pauta.criadoEm).toLocaleString('pt-BR') : '-'}
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
