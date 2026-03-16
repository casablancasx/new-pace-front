import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Card,
  CardContent,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import { IconSearch, IconFileSpreadsheet } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import relatorioService from '../../services/relatorioService';
import orgaoJulgadorService from '../../services/orgaoJulgadorService';
import {
  SUBNUCLEO_OPTIONS,
  TIPO_CONTESTACAO_OPTIONS,
  CLASSE_JUDICIAL_OPTIONS,
  TIPO_ESCALA_OPTIONS,
} from '../../constants/respostaAnaliseAvaliador';

// Usuários mock para seleção de usuariosIds (substituir por API futuramente)
const USUARIOS_MOCK = [
  { id: 2814, nome: 'PAULA SAMPAIO MALINVERNI' },
  { id: 2815, nome: 'LUIZ AFONSO BARATA PINHEIRO JÚNIOR' },
  { id: 2816, nome: 'ANA PAULA MENDES' },
  { id: 2817, nome: 'CARLOS DRUMMOND' },
  { id: 2818, nome: 'BEATRIZ SOUZA' },
];

// Tipo Relatório options
const TIPO_RELATORIO_OPTIONS = [
  { value: 'ESCALA', label: 'Escala' },
  { value: 'AUDIENCIA', label: 'Audiência' },
];

// Colunas da tabela para ESCALA
const COLUNAS_ESCALA = [
  { id: 'dataPauta', label: 'Data Pauta', field: 'dataPauta' },
  { id: 'hora', label: 'Hora', field: 'hora' },
  { id: 'turno', label: 'Turno', field: 'turno' },
  { id: 'numeroProcesso', label: 'Processo', field: 'numeroProcesso' },
  { id: 'classeJudicial', label: 'Classe Judicial', field: 'classeJudicial' },
  { id: 'orgaoJulgador', label: 'Órgão Julgador', field: 'orgaoJulgador' },
  { id: 'subnucleo', label: 'Subnúcleo', field: 'subnucleo' },
  { id: 'estado', label: 'Estado', field: 'estado' },
  { id: 'usuarioRecebeuTarefa', label: 'Usuário', field: 'usuarioRecebeuTarefa' },
  { id: 'analise', label: 'Análise', field: 'analise' },
  { id: 'dataHoraEscalacao', label: 'Data Escalação', field: 'dataHoraEscalacao' },
];

// Colunas da tabela para AUDIENCIA
const COLUNAS_AUDIENCIA = [
  { id: 'dataPauta', label: 'Data Pauta', field: 'dataPauta' },
  { id: 'horaAudiencia', label: 'Hora', field: 'horaAudiencia' },
  { id: 'turnoPauta', label: 'Turno', field: 'turnoPauta' },
  { id: 'sala', label: 'Sala', field: 'sala' },
  { id: 'orgaoJulgador', label: 'Órgão Julgador', field: 'orgaoJulgador' },
  { id: 'classeJudicial', label: 'Classe Judicial', field: 'classeJudicial' },
  { id: 'subnucleo', label: 'Subnúcleo', field: 'subnucleo' },
  { id: 'analise', label: 'Análise', field: 'analise' },
  { id: 'dataCadastro', label: 'Data Cadastro', field: 'dataCadastro' },
];

// Mapeamento de cores para status de analise
const ANALISE_CORES = {
  NAO_ESCALADA: { bg: '#FFEBEE', text: '#C62828', label: 'Não Escalada' },
  ANALISE_PENDENTE: { bg: '#FFF3E0', text: '#E65100', label: 'Análise Pendente' },
  COMPARECER: { bg: '#E8F5E9', text: '#2E7D32', label: 'Comparecer' },
  NAO_COMPARECER: { bg: '#FFEBEE', text: '#C62828', label: 'Não Comparecer' },
  CANCELADA: { bg: '#F3E5F5', text: '#6A1B9A', label: 'Cancelada' },
  REDESIGNADA: { bg: '#FFF9C4', text: '#F57F17', label: 'Redesignada' },
};

const AnalysisChip = ({ value }) => {
  const analise = ANALISE_CORES[value] || { bg: '#ECEFF1', text: '#37474F', label: value || '-' };
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '140px',
        height: '32px',
        backgroundColor: analise.bg,
        color: analise.text,
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: 600,
        textAlign: 'center',
        padding: '4px 8px',
        whiteSpace: 'nowrap',
      }}
    >
      {analise.label}
    </Box>
  );
};

const ClasseJudicialChip = ({ value }) => {
  const colors = {
    JEF: { bg: '#E3F2FD', text: '#1565C0' },
    COMUM: { bg: '#F3E5F5', text: '#6A1B9A' },
  };
  const c = colors[value] || { bg: '#ECEFF1', text: '#37474F' };
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '60px',
        height: '28px',
        backgroundColor: c.bg,
        color: c.text,
        borderRadius: '14px',
        fontSize: '12px',
        fontWeight: 600,
        padding: '4px 10px',
      }}
    >
      {value || '-'}
    </Box>
  );
};

const renderCellContent = (fieldId, value) => {
  if (fieldId === 'analise') return <AnalysisChip value={value} />;
  if (fieldId === 'classeJudicial') return <ClasseJudicialChip value={value} />;
  if (fieldId === 'dataHoraEscalacao' || fieldId === 'dataCadastro') {
    if (!value) return <Typography color="textSecondary" variant="subtitle2">-</Typography>;
    return (
      <Typography color="textSecondary" variant="subtitle2">
        {String(value).substring(0, 16).replace('T', ' ')}
      </Typography>
    );
  }
  return <Typography color="textSecondary" variant="subtitle2">{value || '-'}</Typography>;
};

const StyledCard = styled(Card)(() => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
  },
}));

const ReportCard = ({ title, children, action }) => (
  <StyledCard sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2, height: '100%' }}>
      {title && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h5">{title}</Typography>
          {action}
        </Box>
      )}
      {children}
    </CardContent>
  </StyledCard>
);

const MetricCard = ({ label, value, sub }) => (
  <StyledCard sx={{ height: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <CardContent sx={{ p: 2 }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h3" fontWeight={700} color="textPrimary">
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" color="textSecondary">
          {sub}
        </Typography>
      )}
    </CardContent>
  </StyledCard>
);

const BarChart = ({ items, labelField, valueField }) => {
  const theme = useTheme();
  if (!items || items.length === 0)
    return <Typography color="textSecondary">Sem dados</Typography>;

  const categories = items.map((item) => item[labelField] || '-');
  const data = items.map((item) => item[valueField] || 0);
  const chartHeight = Math.max(200, items.length * 50);

  return (
    <Chart
      options={{
        chart: {
          type: 'bar',
          toolbar: { show: false },
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          foreColor: '#adb0bb',
        },
        colors: [theme.palette.primary.main],
        plotOptions: {
          bar: { horizontal: true, barHeight: '60%', borderRadius: 6, borderRadiusApplication: 'end' },
        },
        dataLabels: { enabled: true, formatter: (val) => val.toLocaleString('pt-BR') },
        legend: { show: false },
        grid: {
          borderColor: 'rgba(0,0,0,0.1)',
          strokeDashArray: 3,
          xaxis: { lines: { show: true } },
          yaxis: { lines: { show: false } },
          padding: { left: 20 },
        },
        xaxis: { categories, axisBorder: { show: false } },
        yaxis: { labels: { show: true, style: { fontSize: '13px', fontWeight: 500 }, maxWidth: 200 } },
        tooltip: {
          theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
          y: { formatter: (val) => val.toLocaleString('pt-BR') },
        },
      }}
      series={[{ name: 'Total', data }]}
      type="bar"
      height={chartHeight}
      width="100%"
    />
  );
};

const DonutChart = ({ items, labelField, valueField }) => {
  const theme = useTheme();
  if (!items || items.length === 0)
    return <Typography color="textSecondary">Sem dados</Typography>;

  const labels = items.map((item) => item[labelField] || '-');
  const data = items.map((item) => item[valueField] || 0);
  const total = data.reduce((a, b) => a + b, 0);

  const colors = [
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
    theme.palette.primary.main,
    theme.palette.secondary.main,
  ];

  return (
    <Box>
      <Chart
        options={{
          chart: { type: 'donut', fontFamily: "'Plus Jakarta Sans', sans-serif", foreColor: '#adb0bb' },
          colors,
          labels,
          dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(0)}%`, dropShadow: { enabled: false } },
          plotOptions: {
            pie: {
              donut: {
                size: '55%',
                labels: {
                  show: true,
                  name: { show: true, fontSize: '14px', fontWeight: 600 },
                  value: {
                    show: true,
                    fontSize: '20px',
                    fontWeight: 700,
                    formatter: (val) => parseInt(val).toLocaleString('pt-BR'),
                  },
                  total: {
                    show: true,
                    label: 'Total',
                    fontSize: '14px',
                    fontWeight: 600,
                    formatter: () => total.toLocaleString('pt-BR'),
                  },
                },
              },
            },
          },
          legend: { show: false },
          stroke: { show: true, width: 3, colors: [theme.palette.background.paper] },
          tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            y: { formatter: (val) => val.toLocaleString('pt-BR') },
          },
        }}
        series={data}
        type="donut"
        height={280}
        width="100%"
      />
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: colors[index % colors.length],
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" fontWeight={500}>
                {item[labelField] || '-'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {(item.percentual || item.percentualDoTotal || 0).toFixed(1)}%
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 50, textAlign: 'right' }}>
                {(item[valueField] || 0).toLocaleString('pt-BR')}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const DataTable = ({ columns, rows, emptyMessage = 'Sem dados' }) => {
  const theme = useTheme();
  if (!rows || rows.length === 0)
    return (
      <Typography color="textSecondary" sx={{ py: 2 }}>
        {emptyMessage}
      </Typography>
    );

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align || 'left'}
                sx={{ fontWeight: 700, borderBottom: `2px solid ${theme.palette.divider}` }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} hover>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'}>
                  {col.render ? (
                    col.render(row[col.field], row)
                  ) : (
                    <Typography variant="body2">{row[col.field] ?? '-'}</Typography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

const Relatorio = () => {
  const [formData, setFormData] = useState({
    dataInicio: '',
    dataFim: '',
    dataEscala: '',
    tipoRelatorio: '',
    tipoEscala: '',
    orgaoJulgador: null,
    tipoContestacao: '',
    subnucleo: '',
    classeJudicial: '',
    usuariosIds: [],
  });

  const [orgaoJulgadorOptions, setOrgaoJulgadorOptions] = useState([]);
  const [orgaoJulgadorSearchTerm, setOrgaoJulgadorSearchTerm] = useState('');
  const [orgaoJulgadorLoading, setOrgaoJulgadorLoading] = useState(false);

  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabelaLoading, setTabelaLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const [metricsData, setMetricsData] = useState(null);
  const [contestacaoTab, setContestacaoTab] = useState('JEF');
  const [errorMessage, setErrorMessage] = useState('');
  const [excelLoadingAudiencia, setExcelLoadingAudiencia] = useState(false);
  const [excelLoadingPauta, setExcelLoadingPauta] = useState(false);

  useEffect(() => {
    const buscar = async () => {
      setOrgaoJulgadorLoading(true);
      try {
        const results = await orgaoJulgadorService.buscar(orgaoJulgadorSearchTerm || '', [], 0, 50);
        setOrgaoJulgadorOptions(results);
      } catch (err) {
        console.error('Erro ao buscar orgaos julgadores:', err);
        setOrgaoJulgadorOptions([]);
      } finally {
        setOrgaoJulgadorLoading(false);
      }
    };
    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [orgaoJulgadorSearchTerm]);

  const handleOrgaoJulgadorFocus = async () => {
    if (orgaoJulgadorOptions.length === 0) {
      setOrgaoJulgadorLoading(true);
      try {
        const results = await orgaoJulgadorService.buscar('', [], 0, 50);
        setOrgaoJulgadorOptions(results);
      } catch (err) {
        console.error('Erro ao buscar orgaos julgadores:', err);
      } finally {
        setOrgaoJulgadorLoading(false);
      }
    }
  };

  const buildFiltros = (pageNum, pageSizeOverride) => ({
    page: pageNum,
    size: pageSizeOverride !== undefined ? pageSizeOverride : rowsPerPage,
    dataInicio: formData.dataInicio,
    dataFim: formData.dataFim,
    dataEscala: formData.dataEscala || null,
    tipoRelatorio: formData.tipoRelatorio,
    tipoEscala: formData.tipoEscala || null,
    orgaoJulgador: formData.orgaoJulgador ? formData.orgaoJulgador.id : null,
    tipoContestacao: formData.tipoContestacao || null,
    subnucleo: formData.subnucleo || null,
    classeJudicial: formData.classeJudicial || null,
    usuariosIds: formData.usuariosIds,
  });

  const handleBuscar = async () => {
    if (!formData.dataInicio || !formData.dataFim || !formData.tipoRelatorio) return;
    if (formData.tipoRelatorio === 'ESCALA' && !formData.tipoEscala) {
      alert('Selecione um tipo de escala para continuar.');
      return;
    }

    setLoading(true);
    setBuscaRealizada(true);
    setPage(0);
    setErrorMessage('');

    try {
      const filtros = buildFiltros(0);
      let metrics;
      let audiencias;

      if (formData.tipoRelatorio === 'ESCALA') {
        [metrics, audiencias] = await Promise.all([
          relatorioService.buscarEscalaMetrics(filtros),
          relatorioService.buscarEscalaAudiencias(filtros),
        ]);
      } else {
        [metrics, audiencias] = await Promise.all([
          relatorioService.buscarAudienciaMetrics(filtros),
          relatorioService.buscarAudienciasListar(filtros),
        ]);
      }

      setMetricsData(metrics);
      setResultados(audiencias.content);
      setTotalElements(audiencias.totalElements);
    } catch (error) {
      console.error('Erro ao buscar relatorio:', error);
      setErrorMessage(error.message || 'Erro ao buscar relatorio. Tente novamente.');
      setMetricsData(null);
      setResultados([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarTabela = async (newPage, newRowsPerPage) => {
    if (!formData.dataInicio || !formData.dataFim) return;
    setTabelaLoading(true);
    try {
      const filtros = buildFiltros(newPage, newRowsPerPage);
      let response;
      if (formData.tipoRelatorio === 'ESCALA') {
        response = await relatorioService.buscarEscalaAudiencias(filtros);
      } else {
        response = await relatorioService.buscarAudienciasListar(filtros);
      }
      setResultados(response.content);
      setTotalElements(response.totalElements);
      setPage(newPage);
    } catch (error) {
      console.error('Erro ao buscar tabela:', error);
    } finally {
      setTabelaLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => handleBuscarTabela(newPage);

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    if (buscaRealizada) handleBuscarTabela(0, newRowsPerPage);
  };

  const handleLimpar = () => {
    setFormData({
      dataInicio: '',
      dataFim: '',
      dataEscala: '',
      tipoRelatorio: '',
      tipoEscala: '',
      orgaoJulgador: null,
      tipoContestacao: '',
      subnucleo: '',
      classeJudicial: '',
      usuariosIds: [],
    });
    setResultados([]);
    setTotalElements(0);
    setPage(0);
    setBuscaRealizada(false);
    setMetricsData(null);
    setErrorMessage('');
  };

  const handleToggleUsuario = (userId) => {
    setFormData((prev) => ({
      ...prev,
      usuariosIds: prev.usuariosIds.includes(userId)
        ? prev.usuariosIds.filter((id) => id !== userId)
        : [...prev.usuariosIds, userId],
    }));
  };

  const handleGerarExcelAudiencia = async () => {
    if (!buscaRealizada || !formData.dataInicio || !formData.dataFim) return;
    setExcelLoadingAudiencia(true);
    try {
      const filtros = {
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        orgaoJulgadorId: formData.orgaoJulgador ? formData.orgaoJulgador.id : null,
        tipoContestacao: formData.tipoContestacao || null,
        subnucleo: formData.subnucleo || null,
        classeJudicial: formData.classeJudicial || null,
        tipoEscala: formData.tipoEscala || null,
      };
      const blob =
        formData.tipoRelatorio === 'AUDIENCIA'
          ? await relatorioService.gerarExcelAudiencia(filtros)
          : await relatorioService.gerarExcelEscala(filtros);
      const nomeArquivo =
        formData.tipoRelatorio === 'AUDIENCIA'
          ? `Audiencias_${formData.dataInicio}_${formData.dataFim}.xlsx`
          : `Escala_${formData.dataInicio}_${formData.dataFim}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nomeArquivo);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      alert('Erro ao gerar o arquivo Excel. Verifique o console para mais detalhes.');
    } finally {
      setExcelLoadingAudiencia(false);
    }
  };

  const handleGerarExcelPauta = async () => {
    if (!buscaRealizada || !formData.dataInicio || !formData.dataFim) return;
    setExcelLoadingPauta(true);
    try {
      const filtros = {
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        orgaoJulgadorId: formData.orgaoJulgador ? formData.orgaoJulgador.id : null,
        tipoContestacao: formData.tipoContestacao || null,
        subnucleo: formData.subnucleo || null,
        classeJudicial: formData.classeJudicial || null,
      };
      const blob = await relatorioService.gerarExcelPauta(filtros);
      const nomeArquivo = `Pautas_${formData.dataInicio}_${formData.dataFim}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nomeArquivo);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar Excel de Pautas:', error);
      alert('Erro ao gerar o arquivo Excel de Pautas.');
    } finally {
      setExcelLoadingPauta(false);
    }
  };

  const getContestacaoItems = useCallback(() => {
    if (!metricsData || !metricsData.tiposContestacao) return [];
    const grupo = metricsData.tiposContestacao[contestacaoTab];
    return (grupo && grupo.itens) ? grupo.itens : [];
  }, [metricsData, contestacaoTab]);

  const colunas = useMemo(
    () => (formData.tipoRelatorio === 'AUDIENCIA' ? COLUNAS_AUDIENCIA : COLUNAS_ESCALA),
    [formData.tipoRelatorio],
  );

  const renderNum = (v) => (
    <Typography variant="body2" fontWeight={600}>
      {(v || 0).toLocaleString('pt-BR')}
    </Typography>
  );
  const renderPct = (v) => (
    <Typography variant="body2">{(v || 0).toFixed(1)}%</Typography>
  );

  return (
    <PageContainer title="Relatório" description="Relatório de Escala">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* FILTROS */}
        <ReportCard title="Filtros">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                <TextField
                  label="Data Início *"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                />
              </Box>
              <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                <TextField
                  label="Data Fim *"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                />
              </Box>
              <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                <TextField
                  select
                  label="Tipo Relatório *"
                  fullWidth
                  value={formData.tipoRelatorio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipoRelatorio: e.target.value,
                      tipoEscala: '',
                      dataEscala: '',
                      usuariosIds: [],
                    })
                  }
                >
                  {TIPO_RELATORIO_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {formData.tipoRelatorio === 'ESCALA' && (
                <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                  <TextField
                    select
                    label="Tipo Escala *"
                    fullWidth
                    value={formData.tipoEscala}
                    onChange={(e) => setFormData({ ...formData, tipoEscala: e.target.value })}
                  >
                    {TIPO_ESCALA_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                <Autocomplete
                  options={orgaoJulgadorOptions}
                  getOptionLabel={(option) => option.nome || ''}
                  value={formData.orgaoJulgador}
                  loading={orgaoJulgadorLoading}
                  onOpen={handleOrgaoJulgadorFocus}
                  onChange={(event, newValue) =>
                    setFormData({ ...formData, orgaoJulgador: newValue })
                  }
                  onInputChange={(event, newInputValue) =>
                    setOrgaoJulgadorSearchTerm(newInputValue)
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Órgão Julgador"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {orgaoJulgadorLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
              <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
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
              {formData.tipoRelatorio === 'ESCALA' && (
                <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
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
              )}
              <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
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

            {formData.tipoRelatorio === 'ESCALA' && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                  <TextField
                    label="Data Escala"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={formData.dataEscala}
                    onChange={(e) => setFormData({ ...formData, dataEscala: e.target.value })}
                  />
                </Box>
                <Box sx={{ flex: '3 1 calc(75% - 12px)', minWidth: 300 }}>
                  <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 0.5 }}>
                    {formData.usuariosIds.length === 0
                      ? 'Usuários (todos)'
                      : `Usuários (${formData.usuariosIds.length} selecionado${formData.usuariosIds.length > 1 ? 's' : ''})`}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {USUARIOS_MOCK.map((usuario) => (
                      <Chip
                        key={usuario.id}
                        label={usuario.nome}
                        onClick={() => handleToggleUsuario(usuario.id)}
                        color={formData.usuariosIds.includes(usuario.id) ? 'primary' : 'default'}
                        variant={formData.usuariosIds.includes(usuario.id) ? 'filled' : 'outlined'}
                        size="small"
                        clickable
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconSearch size={18} />}
                onClick={handleBuscar}
                disabled={
                  loading ||
                  !formData.dataInicio ||
                  !formData.dataFim ||
                  !formData.tipoRelatorio ||
                  (formData.tipoRelatorio === 'ESCALA' && !formData.tipoEscala)
                }
              >
                Gerar Relatório
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleLimpar} disabled={loading}>
                Limpar
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<IconFileSpreadsheet size={18} />}
                onClick={handleGerarExcelAudiencia}
                disabled={!buscaRealizada || excelLoadingAudiencia}
              >
                {excelLoadingAudiencia ? 'Gerando...' : 'Gerar Excel'}
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<IconFileSpreadsheet size={18} />}
                onClick={handleGerarExcelPauta}
                disabled={!buscaRealizada || excelLoadingPauta}
              >
                {excelLoadingPauta ? 'Gerando...' : 'Gerar Excel de Pautas'}
              </Button>
            </Box>
          </Box>
        </ReportCard>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && buscaRealizada && errorMessage && (
          <ReportCard>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="error">{errorMessage}</Typography>
            </Box>
          </ReportCard>
        )}

        {!loading && buscaRealizada && !errorMessage && metricsData && (
          <>
            {formData.tipoRelatorio === 'ESCALA' ? (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                  <MetricCard
                    label="Total Audiências"
                    value={(metricsData.resumo ? metricsData.resumo.totalAudiencias || 0 : 0).toLocaleString('pt-BR')}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                  <MetricCard
                    label="Total Pautas"
                    value={(metricsData.resumo ? metricsData.resumo.totalPautas || 0 : 0).toLocaleString('pt-BR')}
                    sub={`Média: ${(metricsData.resumo ? metricsData.resumo.mediaAudienciasPorPauta || 0 : 0).toFixed(1)} audiências/pauta`}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                  <MetricCard
                    label="Colaboradores Escalados"
                    value={(metricsData.resumo ? metricsData.resumo.totalColaboradoresEscalados || 0 : 0).toLocaleString('pt-BR')}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                  <MetricCard
                    label="Taxa de Comparecimento"
                    value={`${((metricsData.resumo ? metricsData.resumo.taxaComparecimento || 0 : 0) * 100).toFixed(1)}%`}
                    sub={`${metricsData.resumo ? metricsData.resumo.audienciasComparecimento || 0 : 0} compareceram`}
                  />
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 calc(33% - 12px)', minWidth: 180 }}>
                  <MetricCard
                    label="Total Audiências"
                    value={(metricsData.resumo ? metricsData.resumo.totalAudiencias || 0 : 0).toLocaleString('pt-BR')}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(33% - 12px)', minWidth: 180 }}>
                  <MetricCard
                    label="Total Pautas"
                    value={(metricsData.resumo ? metricsData.resumo.totalPautas || 0 : 0).toLocaleString('pt-BR')}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(33% - 12px)', minWidth: 180 }}>
                  <MetricCard
                    label="Média Audiências/Pauta"
                    value={(metricsData.resumo ? metricsData.resumo.mediaAudienciasPorPauta || 0 : 0).toFixed(1)}
                  />
                </Box>
              </Box>
            )}

            {formData.tipoRelatorio === 'ESCALA' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {metricsData.distribuicaoCarga && metricsData.distribuicaoCarga.length > 0 && (
                  <StyledCard>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h5" sx={{ mb: 1.5 }}>Distribuição de Carga</Typography>
                      <DataTable
                        columns={[
                          { id: 'nome', label: 'Nome', field: 'nome' },
                          { id: 'funcao', label: 'Função', field: 'funcao' },
                          { id: 'cargo', label: 'Cargo', field: 'cargo' },
                          { id: 'totalAudiencias', label: 'Audiências', field: 'totalAudiencias', align: 'right', render: renderNum },
                          { id: 'percentualCarga', label: '%', field: 'percentualCarga', align: 'right', render: renderPct },
                        ]}
                        rows={metricsData.distribuicaoCarga}
                      />
                    </CardContent>
                  </StyledCard>
                )}

                {metricsData.tiposContestacao && (
                  <StyledCard>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="h5">Tipo de Contestação</Typography>
                        <ToggleButtonGroup
                          value={contestacaoTab}
                          exclusive
                          onChange={(_, val) => val && setContestacaoTab(val)}
                          size="small"
                        >
                          <ToggleButton value="JEF">JEF</ToggleButton>
                          <ToggleButton value="COMUM">Comum</ToggleButton>
                          <ToggleButton value="CONSOLIDADO">JEF+Comum</ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                      {getContestacaoItems().length > 0 ? (
                        <BarChart items={getContestacaoItems()} labelField="descricao" valueField="totalAudiencias" />
                      ) : (
                        <Typography color="textSecondary" sx={{ py: 2 }}>Sem dados para este filtro</Typography>
                      )}
                    </CardContent>
                  </StyledCard>
                )}

                {((metricsData.subnucleos && metricsData.subnucleos.length > 0) ||
                  (metricsData.setores && metricsData.setores.length > 0)) && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {metricsData.subnucleos && metricsData.subnucleos.length > 0 && (
                      <StyledCard sx={{ flex: 1, minWidth: 280 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h5" sx={{ mb: 1.5 }}>Subnúcleo</Typography>
                          <DonutChart items={metricsData.subnucleos} labelField="descricao" valueField="totalAudiencias" />
                        </CardContent>
                      </StyledCard>
                    )}
                    {metricsData.setores && metricsData.setores.length > 0 && (
                      <StyledCard sx={{ flex: 1, minWidth: 280 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h5" sx={{ mb: 1.5 }}>Setores</Typography>
                          <DataTable
                            columns={[
                              { id: 'nome', label: 'Setor', field: 'nome' },
                              { id: 'totalAudiencias', label: 'Audiências', field: 'totalAudiencias', align: 'right', render: renderNum },
                              { id: 'percentual', label: '%', field: 'percentual', align: 'right', render: renderPct },
                            ]}
                            rows={metricsData.setores}
                          />
                        </CardContent>
                      </StyledCard>
                    )}
                  </Box>
                )}

                {metricsData.tiposAnalise && metricsData.tiposAnalise.length > 0 && (
                  <StyledCard>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h5" sx={{ mb: 1.5 }}>Tipo de Análise</Typography>
                      <DataTable
                        columns={[
                          { id: 'descricao', label: 'Análise', field: 'descricao' },
                          { id: 'totalAudiencias', label: 'Audiências', field: 'totalAudiencias', align: 'right', render: renderNum },
                          { id: 'percentual', label: '%', field: 'percentual', align: 'right', render: renderPct },
                        ]}
                        rows={metricsData.tiposAnalise}
                      />
                    </CardContent>
                  </StyledCard>
                )}
              </Box>
            )}

            {formData.tipoRelatorio === 'AUDIENCIA' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {metricsData.porClasseProcessual && (
                  <StyledCard>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h5" sx={{ mb: 1.5 }}>Classe Processual</Typography>
                      <DataTable
                        columns={[
                          { id: 'classe', label: 'Classe', field: 'classe' },
                          { id: 'totalAudiencias', label: 'Audiências', field: 'totalAudiencias', align: 'right', render: renderNum },
                          { id: 'percentual', label: '%', field: 'percentual', align: 'right', render: renderPct },
                        ]}
                        rows={Object.entries(metricsData.porClasseProcessual).map(([classe, data]) => ({ classe, ...data }))}
                      />
                    </CardContent>
                  </StyledCard>
                )}

                {metricsData.tiposContestacao && (
                  <StyledCard>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="h5">Tipo de Contestação</Typography>
                        <ToggleButtonGroup
                          value={contestacaoTab}
                          exclusive
                          onChange={(_, val) => val && setContestacaoTab(val)}
                          size="small"
                        >
                          <ToggleButton value="JEF">JEF</ToggleButton>
                          <ToggleButton value="COMUM">Comum</ToggleButton>
                          <ToggleButton value="CONSOLIDADO">JEF+Comum</ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                      {getContestacaoItems().length > 0 ? (
                        <BarChart items={getContestacaoItems()} labelField="descricao" valueField="totalAudiencias" />
                      ) : (
                        <Typography color="textSecondary" sx={{ py: 2 }}>Sem dados para este filtro</Typography>
                      )}
                    </CardContent>
                  </StyledCard>
                )}

                {((metricsData.orgaosJulgadores && metricsData.orgaosJulgadores.length > 0) ||
                  (metricsData.subnucleos && metricsData.subnucleos.length > 0)) && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {metricsData.orgaosJulgadores && metricsData.orgaosJulgadores.length > 0 && (
                      <StyledCard sx={{ flex: 1, minWidth: 280 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h5" sx={{ mb: 1.5 }}>Órgãos Julgadores</Typography>
                          <DataTable
                            columns={[
                              { id: 'nome', label: 'Nome', field: 'nome' },
                              { id: 'uf', label: 'UF', field: 'uf', align: 'center' },
                              { id: 'totalAudiencias', label: 'Total', field: 'totalAudiencias', align: 'right', render: renderNum },
                              { id: 'percentual', label: '%', field: 'percentual', align: 'right', render: renderPct },
                            ]}
                            rows={metricsData.orgaosJulgadores}
                          />
                        </CardContent>
                      </StyledCard>
                    )}
                    {metricsData.subnucleos && metricsData.subnucleos.length > 0 && (
                      <StyledCard sx={{ flex: 1, minWidth: 280 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h5" sx={{ mb: 1.5 }}>Subnúcleo</Typography>
                          <DonutChart items={metricsData.subnucleos} labelField="descricao" valueField="totalAudiencias" />
                        </CardContent>
                      </StyledCard>
                    )}
                  </Box>
                )}
              </Box>
            )}

            <ReportCard title={formData.tipoRelatorio === 'ESCALA' ? 'Audiências de Escala' : 'Audiências'}>
              <Box sx={{ overflowX: 'auto', width: '100%', position: 'relative' }}>
                {tabelaLoading && (
                  <Box
                    sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      bgcolor: 'rgba(255, 255, 255, 0.7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                    }}
                  >
                    <CircularProgress size={40} />
                  </Box>
                )}
                <Table aria-label="tabela de relatorio">
                  <TableHead>
                    <TableRow>
                      {colunas.map((col) => (
                        <TableCell key={col.id} align="center">
                          <Typography variant="subtitle2" fontWeight={600}>{col.label}</Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultados.length > 0 ? (
                      resultados.map((item, index) => (
                        <TableRow key={item.id || item.idAudiencia || index}>
                          {colunas.map((col) => (
                            <TableCell key={col.id} align="center">
                              {renderCellContent(col.id, item[col.field])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={colunas.length} align="center">
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
          </>
        )}

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
