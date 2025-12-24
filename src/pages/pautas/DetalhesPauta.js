import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Slide,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import pautaService from '../../services/pautaService';
import audienciaService from '../../services/audienciaService';
import { RESPOSTA_ANALISE_OPTIONS, getRespostaAnaliseColor, getRespostaAnaliseDescricao } from '../../constants/respostaAnaliseAvaliador';

// Transição animada para o Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DetalhesPauta = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado dos dados
  const [pauta, setPauta] = useState(null);
  const [audiencias, setAudiencias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado da paginação (client-side já que audiencias vem junto com pauta)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Estado do popup
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAudiencia, setSelectedAudiencia] = useState(null);
  const [respostaAnalise, setRespostaAnalise] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Estado de feedback
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // Buscar dados da pauta do backend
  useEffect(() => {
    const fetchPauta = async () => {
      setLoading(true);
      try {
        const response = await pautaService.buscarPorId(id);
        setPauta(response);
        setAudiencias(response.audiencias || []);
      } catch (error) {
        console.error('Erro ao buscar pauta:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar detalhes da pauta.',
          severity: 'error',
        });
        setPauta(null);
        setAudiencias([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPauta();
    }
  }, [id]);

  // Dados paginados (client-side)
  const paginatedAudiencias = audiencias.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleVoltar = () => {
    navigate('/pautas');
  };

  // Handlers do popup
  const handleRowClick = (audiencia) => {
    setSelectedAudiencia(audiencia);
    setRespostaAnalise(audiencia.analiseAvaliador || '');
    setObservacao(audiencia.observacao || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAudiencia(null);
    setRespostaAnalise('');
    setObservacao('');
  };

  const handleSalvar = async () => {
    if (!selectedAudiencia || !respostaAnalise) return;

    setSalvando(true);
    try {
      const audienciaAtualizada = await audienciaService.analisarAudiencia(
        selectedAudiencia.audienciaId,
        respostaAnalise,
        observacao
      );

      // Atualizar a audiência na lista local
      setAudiencias((prev) =>
        prev.map((a) =>
          a.audienciaId === selectedAudiencia.audienciaId
            ? { ...a, analiseAvaliador: audienciaAtualizada.analiseAvaliador, observacao: audienciaAtualizada.observacao }
            : a
        )
      );

      setSnackbar({
        open: true,
        message: 'Análise salva com sucesso!',
        severity: 'success',
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar análise. Tente novamente.',
        severity: 'error',
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Loading state
  if (loading) {
    return (
      <PageContainer title="Carregando..." description="Carregando detalhes da pauta">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  // Pauta não encontrada
  if (!pauta) {
    return (
      <PageContainer title="Pauta não encontrada" description="Pauta não encontrada">
        <DashboardCard title="Erro">
          <Typography>Pauta não encontrada.</Typography>
          <Button
            variant="contained"
            startIcon={<IconArrowLeft size={18} />}
            onClick={handleVoltar}
            sx={{ mt: 2 }}
          >
            Voltar para Pautas
          </Button>
        </DashboardCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Detalhes da Pauta" description="Detalhes da Pauta">
      {/* Botão Voltar */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft size={18} />}
          onClick={handleVoltar}
        >
          Voltar para Pautas
        </Button>
      </Box>

      {/* Informações da Pauta */}
      <Box sx={{ mb: 3 }}>
        <DashboardCard title={`Pauta #${pauta.pautaId}`}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Data
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {pauta.data}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Turno
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {pauta.turno}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Sala
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {pauta.sala}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">
                Órgão Julgador
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {pauta.orgaoJulgador}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">
                UF
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {pauta.uf || '-'}
              </Typography>
            </Grid>
          </Grid>
        </DashboardCard>
      </Box>

      {/* Tabela de Audiências */}
      <DashboardCard title="Audiências">
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <Table
            aria-label="tabela de audiências"
            sx={{
              mt: 2,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Horário
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Processo
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Nome da Parte
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Advogados
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 200 }}>
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
                    Análise
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Observação
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
              {paginatedAudiencias.length > 0 ? (
                paginatedAudiencias.map((audiencia) => (
                  <TableRow
                    key={audiencia.audienciaId}
                    onClick={() => handleRowClick(audiencia)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: audiencia.novaAudiencia ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
                      borderLeft: audiencia.novaAudiencia ? '4px solid #1976d2' : 'none',
                      '&:hover': {
                        backgroundColor: audiencia.novaAudiencia ? 'rgba(25, 118, 210, 0.15)' : 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                        {audiencia.horario}
                        {audiencia.novaAudiencia && (
                          <Chip
                            size="small"
                            label="Nova"
                            color="info"
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                        {audiencia.numeroProcesso}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, wordWrap: 'break-word', whiteSpace: 'normal' }}>
                      <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                        {audiencia.nomeParte?.trim() || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, wordWrap: 'break-word', whiteSpace: 'normal' }}>
                      <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                        {audiencia.advogados?.join(', ') || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250, wordWrap: 'break-word', whiteSpace: 'normal' }}>
                      <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                        {audiencia.assunto}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                        {audiencia.tipoContestacao || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={getRespostaAnaliseDescricao(audiencia.analiseAvaliador) || 'Pendente'}
                        color={getRespostaAnaliseColor(audiencia.analiseAvaliador)}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, wordWrap: 'break-word', whiteSpace: 'normal' }}>
                      <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                        {audiencia.observacao || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                        {audiencia.pautista || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                        {audiencia.avaliador || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
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
            count={audiencias.length}
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
        </Box>
      </DashboardCard>

      {/* Dialog Popup Animado */}
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
            Análise da Audiência
          </Typography>
          {selectedAudiencia && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              Processo: {selectedAudiencia.numeroProcesso}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              select
              fullWidth
              label="Resposta Análise"
              value={respostaAnalise}
              onChange={(e) => setRespostaAnalise(e.target.value)}
              variant="outlined"
            >
              {RESPOSTA_ANALISE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Observação"
              multiline
              rows={4}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              variant="outlined"
              placeholder="Digite uma observação..."
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
            disabled={!respostaAnalise || salvando}
          >
            {salvando ? <CircularProgress size={24} color="inherit" /> : 'Salvar'}
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

export default DetalhesPauta;
