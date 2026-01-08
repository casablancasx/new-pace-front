import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  IconButton,
  Pagination,
  Stack,
  Tooltip,
  Button,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  CircularProgress,
  Slide,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  IconTrash,
  IconUserPlus,
  IconAlertTriangle,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import sapiensService from '../../services/sapiensService';
import pautistaService from '../../services/pautistaService';

// Transição animada para o Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  minHeight: 300,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}));

const AvatarWrapper = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: '1.2rem',
}));

const StatBox = styled(Box)({
  textAlign: 'center',
  flex: 1,
});

const getInitials = (nome) => {
  const names = nome.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return names[0][0];
};

const PautistaCard = ({ pautista, onRemover }) => {
  const handleRemover = () => {
    onRemover(pautista);
  };

  return (
    <StyledCard elevation={9}>
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header com Avatar, Nome e Status */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <AvatarWrapper>
            {getInitials(pautista.nome)}
          </AvatarWrapper>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {pautista.nome}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {pautista.setor?.nome || ''}
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {pautista.email}
            </Typography>
          </Box>
          <Chip
            label={pautista.disponivel ? 'Disponível' : 'Indisponível'}
            size="small"
            sx={{
              backgroundColor: pautista.disponivel ? 'success.main' : 'grey.400',
              color: '#fff',
              fontWeight: 500,
              alignSelf: 'flex-start',
            }}
          />
        </Box>

        {/* Estatísticas */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            py: 2,
            borderTop: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <StatBox>
            <Typography variant="h5" fontWeight={600}>
              {pautista.quantidadeAudiencias || 0}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Audiências
            </Typography>
          </StatBox>
          <StatBox>
            <Typography variant="h5" fontWeight={600}>
              {pautista.quantidadePautas || 0}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Pautas
            </Typography>
          </StatBox>
        </Box>

        {/* Ações */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1,
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Tooltip title="Remover">
            <IconButton size="small" color="error" onClick={handleRemover}>
              <IconTrash size={20} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Typography variant="caption" color="textSecondary" display="block">
            Unidade: {pautista.unidade?.nome || ''}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

const Pautistas = () => {
  const [page, setPage] = useState(1);
  const [pautistas, setPautistas] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Estado do Dialog de Cadastro
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [telefone, setTelefone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado do Dialog de Confirmação de Exclusão
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [pautistaParaDeletar, setPautistaParaDeletar] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Estado do Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Carregar pautistas
  const carregarPautistas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await pautistaService.listar(page - 1, 6);
      setPautistas(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Erro ao carregar pautistas:', err);
      setPautistas([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    carregarPautistas();
  }, [carregarPautistas]);

  // Buscar usuários no Sapiens (com debounce)
  useEffect(() => {
    const buscar = async () => {
      if (searchTerm.length < 3) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await sapiensService.buscarUsuarios(searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUser(null);
    setTelefone('');
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setSearchTerm('');
    setSearchResults([]);
    setTelefone('');
    setError('');
    setSuccess('');
  };

  const handleSalvar = async () => {
    if (!selectedUser) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = sapiensService.transformarParaCadastro(selectedUser.lotacaoOriginal);
      // Adicionar telefone ao payload
      payload.telefone = telefone;
      await pautistaService.cadastrar(payload);
      setSuccess('Pautista cadastrado com sucesso!');
      carregarPautistas();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar pautista');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoverPautista = (pautista) => {
    setPautistaParaDeletar(pautista);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setPautistaParaDeletar(null);
  };

  const handleConfirmarDelete = async () => {
    if (!pautistaParaDeletar) return;

    setDeleting(true);
    try {
      await pautistaService.remover(pautistaParaDeletar.sapiensId);
      setSnackbar({
        open: true,
        message: `Pautista ${pautistaParaDeletar.nome} removido com sucesso!`,
        severity: 'success',
      });
      carregarPautistas();
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Erro ao remover pautista:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao remover pautista. Tente novamente.',
        severity: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer title="Pautistas" description="Listagem de Pautistas">
      {/* Header com título e botão */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Pautistas</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<IconUserPlus size={18} />}
          onClick={handleOpenDialog}
        >
          Cadastrar Pautista
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : pautistas.length > 0 ? (
        <Grid container spacing={3} alignItems="stretch">
          {pautistas.map((pautista) => (
            <Grid size={{ xs: 12, sm: 6 }} key={pautista.sapiensId}>
              <PautistaCard pautista={pautista} onRemover={handleRemoverPautista} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="textSecondary">Nenhum pautista cadastrado</Typography>
        </Box>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Stack>
      )}

      {/* Dialog de Cadastro */}
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
            Cadastrar Pautista
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Busque um usuário no Sapiens para cadastrar como pautista
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Autocomplete
              fullWidth
              options={searchResults.map(r => sapiensService.transformarParaExibicao(r))}
              getOptionLabel={(option) => option.nome || ''}
              loading={searchLoading}
              value={selectedUser}
              onChange={(event, newValue) => {
                setSelectedUser(newValue);
              }}
              onInputChange={(event, newInputValue) => {
                setSearchTerm(newInputValue);
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={searchTerm.length < 3 ? "Digite pelo menos 3 caracteres" : "Nenhum usuário encontrado"}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar usuário Sapiens"
                  variant="outlined"
                  placeholder="Digite o nome do usuário..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
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
                    <Typography variant="caption" color="textSecondary">
                      {option.unidade?.nome}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {option.setor?.nome}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {option.nome}
                    </Typography>
                  </Box>
                );
              }}
            />

            {/* Exibir dados do usuário selecionado */}
            {selectedUser && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Usuário Selecionado
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {selectedUser.nome}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedUser.email}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  <strong>Setor:</strong> {selectedUser.setor?.nome}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Unidade:</strong> {selectedUser.unidade?.nome}
                </Typography>
              </Box>
            )}

            {/* Campo de telefone (preenchimento manual) */}
            {selectedUser && (
              <TextField
                fullWidth
                label="Telefone"
                variant="outlined"
                placeholder="(XX) XXXXX-XXXX"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                helperText="Digite o telefone do pautista"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            color="inherit"
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            variant="contained"
            color="primary"
            disabled={!selectedUser || saving}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Salvar'}
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
            Deseja realmente remover o pautista
          </Typography>
          <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
            {pautistaParaDeletar?.nome}
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
            disabled={deleting}
            sx={{ minWidth: 100 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{ minWidth: 100 }}
          >
            {deleting ? <CircularProgress size={24} color="inherit" /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
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

export default Pautistas;
