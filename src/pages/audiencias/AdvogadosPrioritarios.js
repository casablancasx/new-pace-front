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
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Snackbar,
  Alert,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { IconFilterOff, IconSearch, IconPlus, IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import advogadoService from '../../services/advogadoService';

// Transição animada para o Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Opções de UFs
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

const AdvogadosPrioritarios = () => {
  const [nome, setNome] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [advogados, setAdvogados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estado do popup de cadastro
  const [openDialog, setOpenDialog] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formUfs, setFormUfs] = useState([]);
  const [salvando, setSalvando] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estado do Dialog de Confirmação de Exclusão
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [advogadoParaDeletar, setAdvogadoParaDeletar] = useState(null);
  const [deletando, setDeletando] = useState(false);

  const buscar = useCallback(async () => {
    setLoading(true);
    try {
      const response = await advogadoService.listar(page, rowsPerPage, nome || '');
      setAdvogados(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error('Erro ao buscar advogados:', err);
      setAdvogados([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, nome]);

  useEffect(() => {
    buscar();
  }, [buscar]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClear = () => {
    setNome('');
    setPage(0);
  };

  const renderUfs = (ufs) => {
    if (!ufs) return '-';
    try {
      if (Array.isArray(ufs)) {
        return ufs
          .map((u) => u?.sigla || u?.nome || u?.uf || u)
          .filter(Boolean)
          .join(', ');
      }
      return String(ufs);
    } catch (e) {
      return '-';
    }
  };

  // Handlers do popup
  const handleOpenDialog = () => {
    setFormNome('');
    setFormUfs([]);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormNome('');
    setFormUfs([]);
  };

  const handleSalvar = async () => {
    if (!formNome.trim()) {
      setSnackbar({ open: true, message: 'Informe o nome do advogado', severity: 'warning' });
      return;
    }
    if (formUfs.length === 0) {
      setSnackbar({ open: true, message: 'Selecione pelo menos uma UF', severity: 'warning' });
      return;
    }

    setSalvando(true);
    try {
      const ufs = formUfs.map((uf) => uf.value);
      await advogadoService.cadastrar(formNome.trim(), ufs);
      setSnackbar({ open: true, message: 'Advogado cadastrado com sucesso!', severity: 'success' });
      handleCloseDialog();
      buscar();
    } catch (err) {
      console.error('Erro ao cadastrar advogado:', err);
      setSnackbar({ open: true, message: err.message || 'Erro ao cadastrar advogado', severity: 'error' });
    } finally {
      setSalvando(false);
    }
  };

  const handleOpenDeleteDialog = (advogado) => {
    setAdvogadoParaDeletar(advogado);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setAdvogadoParaDeletar(null);
  };

  const handleConfirmarDelete = async () => {
    if (!advogadoParaDeletar) return;

    setDeletando(true);
    try {
      await advogadoService.deletar(advogadoParaDeletar.advogadoId);
      setSnackbar({
        open: true,
        message: `Advogado ${advogadoParaDeletar.nome} excluído com sucesso!`,
        severity: 'success',
      });
      handleCloseDeleteDialog();
      buscar();
    } catch (err) {
      console.error('Erro ao excluir advogado:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Erro ao excluir advogado',
        severity: 'error',
      });
    } finally {
      setDeletando(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title="Advogados Prioritários" description="Lista de advogados prioritários">
      <Box sx={{ mb: 3 }}>
        <DashboardCard title="Filtros">
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Nome"
              variant="outlined"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') buscar();
              }}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<IconFilterOff size={18} />}
                onClick={handleClear}
              >
                Limpar
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconSearch size={18} />}
                onClick={() => { setPage(0); buscar(); }}
              >
                Buscar
              </Button>
            </Box>
          </Box>
        </DashboardCard>
      </Box>

      <DashboardCard
        title="Advogados"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus size={18} />}
            onClick={handleOpenDialog}
          >
            Cadastrar
          </Button>
        }
      >
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table aria-label="tabela de advogados" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>Nome</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>UFs</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>Prioritário</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" fontWeight={600}>Ações</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {advogados.length > 0 ? (
                    advogados.map((a) => (
                      <TableRow key={a.advogadoId}>
                        <TableCell>
                          <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>{a.nome || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {renderUfs(a.ufs)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={a.isPrioritario ? 'Sim' : 'Não'}
                            color={a.isPrioritario ? 'error' : 'primary'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleOpenDeleteDialog(a)}
                            title="Excluir advogado"
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="textSecondary" sx={{ py: 3 }}>Nenhum advogado encontrado</Typography>
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
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
              />
            </>
          )}
        </Box>
      </DashboardCard>

      {/* Dialog Popup Animado para Cadastro */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            Cadastrar Advogado Prioritário
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Nome"
              value={formNome}
              onChange={(e) => setFormNome(e.target.value)}
              variant="outlined"
              placeholder="Digite o nome do advogado"
            />

            <Autocomplete
              multiple
              options={unidadesFederativasOptions}
              getOptionLabel={(option) => option.label}
              value={formUfs}
              onChange={(e, newValue) => setFormUfs(newValue)}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Unidades Federativas de Atuação"
                  variant="outlined"
                  placeholder="Selecione as UFs"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            color="inherit"
            disabled={salvando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            color="primary"
            disabled={salvando}
          >
            {salvando ? <CircularProgress size={24} color="inherit" /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, textAlign: 'center' }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <IconAlertTriangle size={32} color="#d32f2f" />
          </Box>
          <Typography variant="h5" fontWeight={600}>
            Confirmar Exclusão
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body1" color="textSecondary">
            Deseja realmente remover o advogado
          </Typography>
          <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
            {advogadoParaDeletar?.nome}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            color="inherit"
            disabled={deletando}
            sx={{ minWidth: 100 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarDelete}
            variant="contained"
            color="error"
            disabled={deletando}
            sx={{ minWidth: 100 }}
          >
            {deletando ? <CircularProgress size={24} color="inherit" /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdvogadosPrioritarios;
