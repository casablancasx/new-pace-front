import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  Button,
} from '@mui/material';
import {
  IconSearch,
  IconShieldCheck,
  IconUser,
  IconFilterOff,
} from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import usuarioService from '../../services/usuarioService';

const getRoleLabel = (role) => {
  const roles = {
    'ADMIN': 'Administrador',
    'USER': 'Usuário',
  };
  return roles[role] || role;
};

const ControleUsuarios = () => {
  // Estado da paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Estado dos dados
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Carregar usuários
  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usuarioService.listar(page, rowsPerPage, searchTerm);
      let filteredContent = response.content || [];
      
      // Filtrar por role (client-side)
      if (filterRole) {
        filteredContent = filteredContent.filter(u => u.role === filterRole);
      }
      
      // Filtrar por status (client-side)
      if (filterStatus !== '') {
        const isAtivo = filterStatus === 'ativo';
        filteredContent = filteredContent.filter(u => u.isContaAtiva === isAtivo);
      }
      
      setUsuarios(filteredContent);
      setTotalElements(response.page?.totalElements || response.totalElements || 0);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setUsuarios([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filterRole, filterStatus]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarUsuarios();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [carregarUsuarios]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRole('');
    setFilterStatus('');
    setPage(0);
  };

  return (
    <PageContainer title="Controle de Usuários" description="Gerenciamento de Usuários do Sistema">
      {/* Seção de Filtros */}
      <Box sx={{ mb: 3 }}>
        <DashboardCard title="Filtros">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {/* Campo de busca */}
              <TextField
                fullWidth
                placeholder="Buscar por nome..."
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Filtro por Role */}
              <FormControl fullWidth>
                <Select
                  value={filterRole}
                  onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
                  displayEmpty
                >
                  <MenuItem value="">Todos os Perfis</MenuItem>
                  <MenuItem value="ADMIN">Administrador</MenuItem>
                  <MenuItem value="USER">Usuário</MenuItem>
                </Select>
              </FormControl>
              
              {/* Filtro por Status */}
              <FormControl fullWidth>
                <Select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                  displayEmpty
                >
                  <MenuItem value="">Todos os Status</MenuItem>
                  <MenuItem value="ativo">Ativos</MenuItem>
                  <MenuItem value="inativo">Inativos</MenuItem>
                </Select>
              </FormControl>
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

      {/* Tabela de Usuários */}
      <DashboardCard title="Usuários">
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table
                aria-label="tabela de usuários"
                sx={{
                  mt: 2,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Nome
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        E-mail
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Setor
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Unidade
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Perfil
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
                  {usuarios.length > 0 ? (
                    usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                            {usuario.nome}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {usuario.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {usuario.setor || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250, wordWrap: 'break-word', whiteSpace: 'normal' }}>
                          <Typography color="textSecondary" variant="subtitle2" fontWeight={400}>
                            {usuario.unidade || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={usuario.role === 'ADMIN' ? <IconShieldCheck size={14} /> : <IconUser size={14} />}
                            label={getRoleLabel(usuario.role)}
                            size="small"
                            color={usuario.role === 'ADMIN' ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={usuario.isContaAtiva ? 'Ativo' : 'Inativo'}
                            size="small"
                            sx={{
                              backgroundColor: usuario.isContaAtiva ? 'success.main' : 'grey.400',
                              color: '#fff',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="textSecondary" sx={{ py: 3 }}>
                          {searchTerm ? 'Nenhum usuário encontrado com esse nome' : 'Nenhum usuário cadastrado'}
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
    </PageContainer>
  );
};

export default ControleUsuarios;
