import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  styled,
  Autocomplete,
} from '@mui/material';
import { IconFilterOff, IconSearch, IconArrowsExchange } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import controleEscalaService from '../../services/controleEscalaService';
import { AuthContext } from '../../context/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPO_ESCALA_OPTIONS = [
  { label: 'Pautista', value: 'PAUTISTA' },
  { label: 'Avaliador', value: 'AVALIADOR' },
  { label: 'Apoio', value: 'APOIO' },
];

const TIPO_ESCALA_COLORS = {
  PAUTISTA: 'primary',
  AVALIADOR: 'success',
  APOIO: 'warning',
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const INITIAL_FILTERS = {
  tipoEscala: '',
  numeroProcesso: '',
  dataInicio: '',
  dataFim: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const truncate = (str, max = 30) =>
  str && str.length > max ? `${str.slice(0, max)}…` : str || '-';

// ─── Main Component ───────────────────────────────────────────────────────────

const ControleEscala = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  // Table state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Filters (applied)
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  // Filters (draft – while user is typing)
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [filterError, setFilterError] = useState('');

  // Debounce ref for numeroProcesso
  const debounceRef = useRef(null);

  // ─── Modal state ──────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEscala, setSelectedEscala] = useState(null);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState(null);
  const [trocando, setTrocando] = useState(false);
  const [modalFeedback, setModalFeedback] = useState({ type: '', message: '' });

  // ─── Fetch data ───────────────────────────────────────────────────────────

  const fetchEscalas = useCallback(async (currentPage, currentSize, filters) => {
    setLoading(true);
    try {
      const response = await controleEscalaService.listar({
        page: currentPage,
        size: currentSize,
        tipoEscala: filters.tipoEscala || undefined,
        numeroProcesso: filters.numeroProcesso || undefined,
        dataInicio: filters.dataInicio || undefined,
        dataFim: filters.dataFim || undefined,
      });

      // Support both Spring Page formats
      const pageInfo = response.page || {};
      setRows(response.content || []);
      setTotalElements(
        pageInfo.totalElements ?? response.totalElements ?? 0
      );
    } catch (err) {
      console.error('Erro ao carregar escalas:', err);
      setRows([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEscalas(page, rowsPerPage, appliedFilters);
  }, [fetchEscalas, page, rowsPerPage, appliedFilters]);

  // ─── Filter handlers ──────────────────────────────────────────────────────

  const handleDraftChange = (field, value) => {
    const updated = { ...draftFilters, [field]: value };
    setDraftFilters(updated);

    // Debounce numeroProcesso auto-search
    if (field === 'numeroProcesso') {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (!validateDatesFromDraft(updated)) return;
        setAppliedFilters(updated);
        setPage(0);
      }, 300);
    }
  };

  const validateDatesFromDraft = (filters) => {
    if (filters.dataInicio && filters.dataFim && filters.dataInicio > filters.dataFim) {
      setFilterError('Data início não pode ser maior que data fim');
      return false;
    }
    setFilterError('');
    return true;
  };

  const handleSearch = () => {
    if (!validateDatesFromDraft(draftFilters)) return;
    setAppliedFilters({ ...draftFilters });
    setPage(0);
  };

  const handleClearFilters = () => {
    setDraftFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setFilterError('');
    setPage(0);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // ─── Modal handlers ───────────────────────────────────────────────────────

  const handleOpenModal = async (escala) => {
    setSelectedEscala(escala);
    setNovoUsuario(null);
    setModalFeedback({ type: '', message: '' });
    setModalOpen(true);

    setLoadingUsuarios(true);
    try {
      const lista = await controleEscalaService.listarUsuariosPorTipo(escala.tipoEscala);
      // Exclude current user and inactive
      const filtrados = lista.filter(
        (u) => u.contaAtiva && u.sapiensId !== escala.usuario?.sapiensId
      );
      setUsuariosDisponiveis(filtrados);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setUsuariosDisponiveis([]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleCloseModal = () => {
    if (trocando) return;
    setModalOpen(false);
    setSelectedEscala(null);
    setNovoUsuario(null);
    setUsuariosDisponiveis([]);
    setModalFeedback({ type: '', message: '' });
  };

  const handleConfirmarTroca = async () => {
    if (!novoUsuario || !selectedEscala) return;

    setTrocando(true);
    setModalFeedback({ type: '', message: '' });
    try {
      await controleEscalaService.trocar({
        escalaId: selectedEscala.escalaId,
        antigoUsuarioId: selectedEscala.usuario?.sapiensId,
        novoUsuarioId: novoUsuario.sapiensId,
        tipoEscala: selectedEscala.tipoEscala,
      });
      setModalFeedback({ type: 'success', message: 'Troca realizada com sucesso!' });
      fetchEscalas(page, rowsPerPage, appliedFilters);
      setTimeout(() => handleCloseModal(), 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || 'Erro ao realizar a troca';
      setModalFeedback({ type: 'error', message: msg });
    } finally {
      setTrocando(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PageContainer title="Controle de Escala" description="Gerenciamento de escalas">

      {/* ── Filtros ── */}
      <Box sx={{ mb: 3 }}>
        <DashboardCard title="Filtros">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* Tipo de Escala */}
              <FormControl fullWidth>
                <InputLabel>Tipo de Escala</InputLabel>
                <Select
                  value={draftFilters.tipoEscala}
                  label="Tipo de Escala"
                  onChange={(e) => handleDraftChange('tipoEscala', e.target.value)}
                >
                  <MenuItem value="">Todos os tipos</MenuItem>
                  {TIPO_ESCALA_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Número do Processo */}
              <TextField
                fullWidth
                label="Número do Processo"
                variant="outlined"
                value={draftFilters.numeroProcesso}
                onChange={(e) => handleDraftChange('numeroProcesso', e.target.value)}
                placeholder="Digite o número do processo"
                onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />

              {/* Data Início */}
              <TextField
                fullWidth
                label="Criado a partir de"
                type="date"
                variant="outlined"
                value={draftFilters.dataInicio}
                onChange={(e) => handleDraftChange('dataInicio', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!filterError}
              />

              {/* Data Fim */}
              <TextField
                fullWidth
                label="Criado até"
                type="date"
                variant="outlined"
                value={draftFilters.dataFim}
                onChange={(e) => handleDraftChange('dataFim', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!filterError}
                helperText={filterError}
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

      {/* ── Tabela ── */}
      <DashboardCard title="Controle de Escala">
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table
                aria-label="tabela de escalas"
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
                    {[
                      'ID',
                      'Data',
                      'Horário',
                      'Turno',
                      'Processo',
                      'Parte',
                      'Órgão Julgador',
                      'Sala',
                      'Classe',
                      'Subnúcleo',
                      'Tipo Contst.',
                      'Tipo Escala',
                      'Usuário Escalado',
                      'Escalado Por',
                      'Espécie Tarefa',
                      'Setor',
                    ].map((h) => (
                      <TableCell key={h}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {h}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length > 0 ? (
                    rows.map((row) => (
                      <StyledTableRow key={row.escalaId} onClick={() => isAdmin && handleOpenModal(row)}>
                        <TableCell>
                          <Typography sx={{ fontSize: '14px', fontWeight: '600' }}>
                            {row.escalaId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={500}>
                            {formatDate(row.data)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {row.horario || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {row.turno || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={row.numeroProcesso || ''} placement="top">
                            <Typography variant="subtitle2" fontWeight={500}>
                              {truncate(row.numeroProcesso, 25)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={row.parte || ''} placement="top">
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {truncate(row.parte, 22)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={row.orgaoJulgador || ''} placement="top">
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {truncate(row.orgaoJulgador, 22)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {row.sala || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {row.classeJudicial || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {row.subnucleo || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {row.tipoContestacao || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={TIPO_ESCALA_COLORS[row.tipoEscala] || 'default'}
                            label={row.tipoEscala || '-'}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={row.usuario?.email || ''} placement="top">
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {truncate(row.usuario?.nome, 22)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={row.escaladoPor || ''} placement="top">
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {truncate(row.escaladoPor, 20)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={row.especieTarefa || ''} placement="top">
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {truncate(row.especieTarefa, 20)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={row.setor || ''} placement="top">
                            <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                              {truncate(row.setor, 20)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={16} align="center">
                        <Typography color="textSecondary" sx={{ py: 3 }}>
                          Nenhuma escala encontrada
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
                rowsPerPageOptions={PAGE_SIZE_OPTIONS}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
              />
            </>
          )}
        </Box>
      </DashboardCard>

      {/* ── Trocar Usuário Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Trocar Usuário da Escala</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {selectedEscala && (
            <>
              {/* Readonly info */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
                <Stack spacing={1}>
                  <Box display="flex" gap={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
                      Processo:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedEscala.numeroProcesso || '-'}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
                      Tipo:
                    </Typography>
                    <Chip
                      size="small"
                      color={TIPO_ESCALA_COLORS[selectedEscala.tipoEscala] || 'default'}
                      label={selectedEscala.tipoEscala || '-'}
                    />
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
                      Usuário Atual:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedEscala.usuario?.nome || '-'}
                      {selectedEscala.usuario?.sapiensId
                        ? ` (ID: ${selectedEscala.usuario.sapiensId})`
                        : ''}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Novo Usuário dropdown */}
              <Autocomplete
                options={usuariosDisponiveis}
                loading={loadingUsuarios}
                value={novoUsuario}
                onChange={(_, val) => setNovoUsuario(val)}
                getOptionLabel={(opt) =>
                  opt ? `${opt.nome}${opt.sapiensId ? ` (ID: ${opt.sapiensId})` : ''}` : ''
                }
                isOptionEqualToValue={(opt, val) => opt.sapiensId === val.sapiensId}
                noOptionsText={
                  loadingUsuarios ? 'Carregando...' : 'Nenhum usuário disponível'
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Novo Usuário *"
                    variant="outlined"
                    placeholder="Selecione o novo usuário"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingUsuarios ? (
                            <CircularProgress color="inherit" size={16} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              {/* Feedback */}
              {modalFeedback.message && (
                <Box
                  mt={2}
                  p={1.5}
                  borderRadius={1}
                  bgcolor={
                    modalFeedback.type === 'success' ? 'success.light' : 'error.light'
                  }
                >
                  <Typography
                    variant="body2"
                    color={
                      modalFeedback.type === 'success' ? 'success.dark' : 'error.dark'
                    }
                    fontWeight={600}
                  >
                    {modalFeedback.message}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseModal} disabled={trocando} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarTroca}
            disabled={!novoUsuario || trocando}
            variant="contained"
            color="primary"
            startIcon={
              trocando ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            {trocando ? 'Trocando...' : 'Confirmar Troca'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ControleEscala;
