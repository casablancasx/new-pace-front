import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import { IconSearch, IconFileSpreadsheet } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import relatorioService from '../../services/relatorioService';
import usuarioService from '../../services/usuarioService';
import orgaoJulgadorService from '../../services/orgaoJulgadorService';
import { SUBNUCLEO_OPTIONS, TIPO_CONTESTACAO_OPTIONS, CLASSE_JUDICIAL_OPTIONS } from '../../constants/respostaAnaliseAvaliador';

// Card customizado com mais sombra e bordas arredondadas
const StyledCard = styled(Card)(() => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}));

// Componente de Card customizado para o relatório
const ReportCard = ({ title, children, action }) => (
  <StyledCard sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3, height: '100%' }}>
      {title && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">{title}</Typography>
          {action}
        </Box>
      )}
      {children}
    </CardContent>
  </StyledCard>
);

// Componente de gráfico de contestação
const ContestacaoChart = ({ contestacoes }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const categories = contestacoes.map(item => item.tipo || '-');
  const data = contestacoes.map(item => item.total || 0);
  const chartHeight = Math.max(300, contestacoes.length * 50);

  const chartOptions = {
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
      toolbar: { show: true },
    },
    colors: [primary],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        borderRadius: 6,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { 
      enabled: true,
      formatter: (val) => val.toLocaleString('pt-BR'),
    },
    legend: { show: false },
    grid: {
      borderColor: 'rgba(0,0,0,0.1)',
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '13px' },
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      y: {
        formatter: (val) => val.toLocaleString('pt-BR'),
      },
    },
  };

  const series = [{ name: 'Total', data: data }];

  return (
    <Chart
      options={chartOptions}
      series={series}
      type="bar"
      height={chartHeight}
      width="100%"
    />
  );
};

const Relatorio = () => {
  // Estado do formulário
  const [formData, setFormData] = useState({
    dataInicio: '',
    dataFim: '',
    usuario: null,
    orgaoJulgador: null,
    tipoContestacao: '',
    subnucleo: '',
    classeJudicial: '',
  });

  // Estados para busca de usuário
  const [usuarioOptions, setUsuarioOptions] = useState([]);
  const [usuarioSearchTerm, setUsuarioSearchTerm] = useState('');
  const [usuarioLoading, setUsuarioLoading] = useState(false);

  // Estados para busca de órgão julgador
  const [orgaoJulgadorOptions, setOrgaoJulgadorOptions] = useState([]);
  const [orgaoJulgadorSearchTerm, setOrgaoJulgadorSearchTerm] = useState('');
  const [orgaoJulgadorLoading, setOrgaoJulgadorLoading] = useState(false);

  // Estado dos resultados
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  // Estados para contestação e totais
  const [contestacoes, setContestacoes] = useState([]);
  const [totais, setTotais] = useState({ totalAudiencias: 0, totalPautas: 0 });

  // Buscar usuários com debounce
  useEffect(() => {
    const buscar = async () => {
      if (usuarioSearchTerm.length < 2) {
        setUsuarioOptions([]);
        return;
      }

      setUsuarioLoading(true);
      try {
        const response = await usuarioService.listar(0, 50, usuarioSearchTerm);
        setUsuarioOptions(response.content || []);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setUsuarioOptions([]);
      } finally {
        setUsuarioLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [usuarioSearchTerm]);

  // Buscar órgãos julgadores com debounce
  useEffect(() => {
    const buscar = async () => {
      if (orgaoJulgadorSearchTerm.length < 2) {
        setOrgaoJulgadorOptions([]);
        return;
      }

      setOrgaoJulgadorLoading(true);
      try {
        const results = await orgaoJulgadorService.buscar(orgaoJulgadorSearchTerm, [], 0, 50);
        setOrgaoJulgadorOptions(results);
      } catch (err) {
        console.error('Erro ao buscar órgãos julgadores:', err);
        setOrgaoJulgadorOptions([]);
      } finally {
        setOrgaoJulgadorLoading(false);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [orgaoJulgadorSearchTerm]);

  const handleBuscar = async (newPage = 0) => {
    if (!formData.dataInicio || !formData.dataFim) {
      return;
    }

    setLoading(true);
    setBuscaRealizada(true);
    try {
      const filtros = {
        page: newPage,
        size: rowsPerPage,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        userId: formData.usuario?.id || null,
        orgaoJulgadorId: formData.orgaoJulgador?.id || null,
        tipoContestacao: formData.tipoContestacao || null,
        subnucleo: formData.subnucleo || null,
        classeJudicial: formData.classeJudicial || null,
      };

      const [escalaResponse, contestacaoResponse, totaisResponse] = await Promise.all([
        relatorioService.buscarEscala(filtros),
        relatorioService.buscarContestacao(filtros),
        relatorioService.buscarTotais(filtros),
      ]);

      setResultados(escalaResponse.content || []);
      setTotalElements(escalaResponse.totalElements || 0);
      setPage(newPage);
      setContestacoes(contestacaoResponse || []);
      setTotais(totaisResponse || { totalAudiencias: 0, totalPautas: 0 });
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      setResultados([]);
      setTotalElements(0);
      setContestacoes([]);
      setTotais({ totalAudiencias: 0, totalPautas: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    handleBuscar(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    if (buscaRealizada) {
      handleBuscar(0);
    }
  };

  const handleLimpar = () => {
    setFormData({
      dataInicio: '',
      dataFim: '',
      usuario: null,
      orgaoJulgador: null,
      tipoContestacao: '',
      subnucleo: '',
      classeJudicial: '',
    });
    setResultados([]);
    setTotalElements(0);
    setPage(0);
    setBuscaRealizada(false);
    setContestacoes([]);
    setTotais({ totalAudiencias: 0, totalPautas: 0 });
  };

  return (
    <PageContainer title="Relatório" description="Relatório de Escala">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* ==================== CAMADA 1: FILTROS ==================== */}
        <ReportCard title="Filtros">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Linha 1: Inputs */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 calc(14.28% - 16px)', minWidth: 150 }}>
                <TextField
                  label="Data Início *"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                />
              </Box>

              <Box sx={{ flex: '1 1 calc(14.28% - 16px)', minWidth: 150 }}>
                <TextField
                  label="Data Fim *"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                />
              </Box>

              <Box sx={{ flex: '1 1 calc(14.28% - 16px)', minWidth: 150 }}>
                <Autocomplete
                  options={usuarioOptions}
                  getOptionLabel={(option) => option.nome || ''}
                  value={formData.usuario}
                  loading={usuarioLoading}
                  onChange={(event, newValue) => setFormData({ ...formData, usuario: newValue })}
                  onInputChange={(event, newInputValue) => setUsuarioSearchTerm(newInputValue)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Usuário"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {usuarioLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flex: '1 1 calc(14.28% - 16px)', minWidth: 150 }}>
                <Autocomplete
                  options={orgaoJulgadorOptions}
                  getOptionLabel={(option) => option.nome || ''}
                  value={formData.orgaoJulgador}
                  loading={orgaoJulgadorLoading}
                  onChange={(event, newValue) => setFormData({ ...formData, orgaoJulgador: newValue })}
                  onInputChange={(event, newInputValue) => setOrgaoJulgadorSearchTerm(newInputValue)}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Órgão Julgador"
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
              </Box>

              <Box sx={{ flex: '1 1 calc(14.28% - 16px)', minWidth: 150 }}>
                <TextField
                  select
                  label="Tipo Contestação"
                  fullWidth
                  value={formData.tipoContestacao}
                  onChange={(e) => setFormData({ ...formData, tipoContestacao: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {TIPO_CONTESTACAO_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ flex: '1 1 calc(14.28% - 16px)', minWidth: 150 }}>
                <TextField
                  select
                  label="Subnúcleo"
                  fullWidth
                  value={formData.subnucleo}
                  onChange={(e) => setFormData({ ...formData, subnucleo: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {SUBNUCLEO_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ flex: '1 1 calc(14.28% - 16px)', minWidth: 150 }}>
                <TextField
                  select
                  label="Classe Judicial"
                  fullWidth
                  value={formData.classeJudicial}
                  onChange={(e) => setFormData({ ...formData, classeJudicial: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {CLASSE_JUDICIAL_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {/* Linha 2: Botões */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconSearch size={18} />}
                onClick={() => handleBuscar(0)}
                disabled={loading || !formData.dataInicio || !formData.dataFim}
              >
                Gerar Relatório
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleLimpar}
                disabled={loading}
              >
                Limpar
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<IconFileSpreadsheet size={18} />}
                disabled={true}
              >
                Gerar Excel
              </Button>
            </Box>
          </Box>
        </ReportCard>

        {/* ==================== CAMADA 2: TOTAIS + GRÁFICO ==================== */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : buscaRealizada && (
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Coluna esquerda: Totais empilhados */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: 220, flexShrink: 0 }}>
              <ReportCard title="Total de Audiências">
                <Typography variant="h3" fontWeight={700}>
                  {(totais.totalAudiencias || 0).toLocaleString('pt-BR')}
                </Typography>
              </ReportCard>

              <ReportCard title="Total de Pautas">
                <Typography variant="h3" fontWeight={700}>
                  {(totais.totalPautas || 0).toLocaleString('pt-BR')}
                </Typography>
              </ReportCard>
            </Box>

            {/* Coluna direita: Gráfico de Contestação ocupando todo o espaço restante */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <ReportCard title="Contestações por Tipo">
                {contestacoes.length > 0 ? (
                  <ContestacaoChart contestacoes={contestacoes} />
                ) : (
                  <Typography color="textSecondary" sx={{ py: 4, textAlign: 'center' }}>
                    Nenhuma contestação encontrada
                  </Typography>
                )}
              </ReportCard>
            </Box>
          </Box>
        )}

        {/* ==================== CAMADA 3: TABELA DE AUDIÊNCIAS ==================== */}
        {buscaRealizada && !loading && (
          <ReportCard title="Audiências">
            <Box sx={{ overflowX: 'auto', width: '100%' }}>
              <Table aria-label="tabela de relatório">
                <TableHead>
                  <TableRow>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Processo</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Nome</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Data</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Horário</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Turno</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Sala</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Órgão Julgador</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Tipo Contestação</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Subnúcleo</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Classe Judicial</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Análise</Typography></TableCell>
                    <TableCell><Typography variant="subtitle2" fontWeight={600}>Observação</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultados.length > 0 ? (
                    resultados.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell><Typography variant="subtitle2">{item.numeroProcesso || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.nome || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.data || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.horario || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.turno || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.sala || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.orgaoJulgador || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.tipoContestacao || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.subnucleo || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.classeJudicial || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.analiseAvaliador || '-'}</Typography></TableCell>
                        <TableCell><Typography color="textSecondary" variant="subtitle2">{item.observacao || '-'}</Typography></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} align="center">
                        <Typography color="textSecondary" sx={{ py: 3 }}>
                          Nenhum resultado encontrado
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
            </Box>
          </ReportCard>
        )}

        {/* Mensagem inicial */}
        {!buscaRealizada && !loading && (
          <ReportCard>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                Preencha os filtros e clique em Gerar Relatório para visualizar os dados
              </Typography>
            </Box>
          </ReportCard>
        )}
      </Box>
    </PageContainer>
  );
};

export default Relatorio;
