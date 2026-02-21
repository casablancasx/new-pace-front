import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Slide,
  Alert,
  Snackbar,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  IconTrash,
  IconUserPlus,
  IconAlertTriangle,
  IconSearch,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import sapiensService from '../../services/sapiensService';
import apoioService from '../../services/apoioService';
import usuarioService from '../../services/usuarioService';

// Transição animada para o Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Função para formatar telefone: (XX) XXXXX-XXXX
const formatarTelefone = (valor) => {
  if (!valor) return '';
  const apenas_numeros = valor.replace(/\D/g, '');
  const limitado = apenas_numeros.slice(0, 11);
  if (limitado.length <= 2) {
    return `(${limitado}`;
  } else if (limitado.length <= 7) {
    return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
  } else {
    return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7)}`;
  }
};

const Apoio = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [apoios, setApoios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterNome, setFilterNome] = useState('');

  // Estado do Dialog de Cadastro
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState('');
  const [lotacoesDisponiveis, setLotacoesDisponiveis] = useState([]);
  const [setoresSelecionados, setSetoresSelecionados] = useState([]);
  const [loadingLotacoes, setLoadingLotacoes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estado do Dialog de Confirmação de Exclusão
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [apoioParaDeletar, setApoioParaDeletar] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Estado do Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Carregar usuários de apoio
  const carregarApoios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apoioService.listar(page, rowsPerPage, filterNome);
      setApoios(response.content || []);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error('Erro ao carregar usuários de apoio:', err);
      setApoios([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterNome]);

  useEffect(() => {
    carregarApoios();
  }, [carregarApoios]);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUser(null);
    setNome('');
    setEmail('');
    setTelefone('');
    setCargo('');
    setLotacoesDisponiveis([]);
    setSetoresSelecionados([]);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setSearchTerm('');
    setSearchResults([]);
    setNome('');
    setEmail('');
    setTelefone('');
    setCargo('');
    setLotacoesDisponiveis([]);
    setSetoresSelecionados([]);
    setError('');
    setSuccess('');
  };

  // Buscar lotações quando um usuário é selecionado
  const handleUserSelect = async (newValue) => {
    setSelectedUser(newValue);
    setSetoresSelecionados([]);

    if (newValue) {
      setNome(newValue.nome || '');
      setEmail(newValue.email || '');

      const colaboradorId = newValue.lotacaoOriginal?.colaborador?.id;
      if (colaboradorId) {
        setLoadingLotacoes(true);
        try {
          const lotacoes = await sapiensService.buscarLotacoesColaborador(colaboradorId);
          setLotacoesDisponiveis(lotacoes);
        } catch (err) {
          console.error('Erro ao buscar lotações:', err);
          setLotacoesDisponiveis([]);
        } finally {
          setLoadingLotacoes(false);
        }
      }
    } else {
      setNome('');
      setEmail('');
      setLotacoesDisponiveis([]);
    }
  };

  const handleToggleSetor = (setor) => {
    const isSelected = setoresSelecionados.find(s => s.id === setor.id);
    if (isSelected) {
      setSetoresSelecionados(setoresSelecionados.filter(s => s.id !== setor.id));
    } else {
      setSetoresSelecionados([...setoresSelecionados, setor]);
    }
  };

  const handleSalvar = async () => {
    if (!selectedUser) return;

    if (setoresSelecionados.length === 0) {
      setError('Selecione pelo menos um setor');
      return;
    }

    if (!cargo) {
      setError('Selecione um cargo');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        sapiensId: selectedUser.id,
        nome: nome,
        email: email,
        telefone: telefone,
        cargo: cargo,
        tipo: 'APOIO',
        setores: setoresSelecionados.map(setor => ({
          id: setor.id,
          nome: setor.nome,
          unidade: {
            id: setor.unidade?.id,
            nome: setor.unidade?.nome,
            sigla: setor.unidade?.sigla,
          }
        })),
      };

      await usuarioService.cadastrar(payload);
      setSuccess('Usuário de apoio cadastrado com sucesso!');
      carregarApoios();
      handleCloseDialog();
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar usuário de apoio');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoverApoio = (apoio) => {
    setApoioParaDeletar(apoio);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setApoioParaDeletar(null);
  };

  const handleConfirmarDelete = async () => {
    if (!apoioParaDeletar) return;

    setDeleting(true);
    try {
      await usuarioService.deletar(apoioParaDeletar.id);
      setSnackbar({
        open: true,
        message: `Usuário de apoio ${apoioParaDeletar.nome} removido com sucesso!`,
        severity: 'success',
      });
      setTimeout(() => {
        carregarApoios();
        handleCloseDeleteDialog();
      }, 500);
    } catch (err) {
      console.error('Erro ao remover usuário de apoio:', err);
      const mensagemErro = err.message || 'Erro ao remover usuário de apoio. Tente novamente.';
      setSnackbar({
        open: true,
        message: mensagemErro,
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
    <PageContainer title="Apoio" description="Listagem de Usuários de Apoio">
      {/* Header com título e botão */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Apoio</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<IconUserPlus size={18} />}
          onClick={handleOpenDialog}
        >
          Cadastrar Usuário de Apoio
        </Button>
      </Box>

      {/* Campo de busca por nome */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome..."
          variant="outlined"
          size="small"
          value={filterNome}
          onChange={(e) => setFilterNome(e.target.value)}
          InputProps={{
            startAdornment: (
              <Box sx={{ pr: 1, display: 'flex', alignItems: 'center' }}>
                <IconSearch size={18} color="#999" />
              </Box>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : apoios.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Nome
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Email
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Telefone
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Cargo
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Setores
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Ações
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apoios.map((apoio) => (
                <TableRow key={apoio.id} hover>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={500}>
                      {apoio.nome}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                      {apoio.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                      {apoio.telefone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                      {apoio.cargo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                      {apoio.setores?.map(s => s.nome).join(', ') || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Remover">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoverApoio(apoio)}
                      >
                        <IconTrash size={20} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalElements}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="textSecondary">Nenhum usuário de apoio cadastrado</Typography>
        </Box>
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
            Cadastrar Usuário de Apoio
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Busque um usuário no Sapiens para cadastrar como usuário de apoio
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
              filterOptions={(options) => {
                const seen = new Set();
                return options.filter(option => {
                  if (seen.has(option.id)) return false;
                  seen.add(option.id);
                  return true;
                });
              }}
              loading={searchLoading}
              value={selectedUser}
              onChange={(event, newValue) => {
                handleUserSelect(newValue);
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
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {option.nome}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {option.unidade?.nome}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
            />

            {/* Campos de Nome, Email e Telefone */}
            {selectedUser && (
              <>
                <TextField
                  fullWidth
                  label="Nome"
                  variant="outlined"
                  value={nome}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled
                />

                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={email}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled
                />

                <TextField
                  fullWidth
                  label="Telefone"
                  variant="outlined"
                  placeholder="(XX) XXXXX-XXXX"
                  value={telefone}
                  onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                  helperText="Digite o telefone do usuário de apoio"
                />
              </>
            )}

            {/* Campo de Cargo */}
            {selectedUser && (
              <FormControl fullWidth>
                <InputLabel id="cargo-label">Cargo *</InputLabel>
                <Select
                  labelId="cargo-label"
                  id="cargo"
                  value={cargo}
                  label="Cargo *"
                  onChange={(e) => setCargo(e.target.value)}
                >
                  <MenuItem value="">Selecione um cargo</MenuItem>
                  <MenuItem value="PROCURADOR">Procurador</MenuItem>
                  <MenuItem value="PREPOSTO">Preposto</MenuItem>
                  <MenuItem value="OUTROS">Outros</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Seção de Setores/Lotações */}
            {selectedUser && (
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Selecione os Setores *
                </Typography>

                {loadingLotacoes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : lotacoesDisponiveis.length > 0 ? (
                  <FormGroup>
                    {lotacoesDisponiveis.map((lotacao) => {
                      const isSelected = setoresSelecionados.find(s => s.id === lotacao.id);
                      return (
                        <FormControlLabel
                          key={lotacao.id}
                          control={
                            <Checkbox
                              checked={!!isSelected}
                              onChange={() => handleToggleSetor(lotacao)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">
                                {lotacao.nome}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {lotacao.unidade?.nome}
                              </Typography>
                            </Box>
                          }
                        />
                      );
                    })}
                  </FormGroup>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Nenhuma lotação encontrada
                  </Typography>
                )}
              </Box>
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
            disabled={!selectedUser || setoresSelecionados.length === 0 || !cargo || saving}
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
            Deseja realmente remover o usuário de apoio
          </Typography>
          <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
            {apoioParaDeletar?.nome}
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

export default Apoio;
