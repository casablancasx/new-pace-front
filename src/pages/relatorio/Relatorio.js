/**
 * Relatorio.jsx — Melhorado
 *
 * Adicione ao index.html:
 * <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
 *
 * Lógica, estado, serviços e filtros mantidos intactos.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, TextField, Autocomplete, Button, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
  TablePagination, TableSortLabel, Typography, MenuItem,
  Card, CardContent, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { useTheme, styled, alpha } from '@mui/material/styles';
import Chart from 'react-apexcharts';
import { IconSearch, IconFileSpreadsheet } from '@tabler/icons-react';
import PageContainer from 'src/components/container/PageContainer';
import relatorioService from '../../services/relatorioService';
import orgaoJulgadorService from '../../services/orgaoJulgadorService';
import avaliadorService from '../../services/avaliadorService';
import pautistaService from '../../services/pautistaService';
import apoioService from '../../services/apoioService';
import {
  SUBNUCLEO_OPTIONS, TIPO_CONTESTACAO_OPTIONS,
  CLASSE_JUDICIAL_OPTIONS, TIPO_ESCALA_OPTIONS,
} from '../../constants/respostaAnaliseAvaliador';

/* ─── CONSTANTES ─── */
const TIPO_RELATORIO_OPTIONS = [
  { value: 'ESCALA', label: 'Escala' },
  { value: 'AUDIENCIA', label: 'Audiência' },
];

const COLUNAS_ESCALA = [
  { id: 'dataPauta', label: 'Data pauta', field: 'dataPauta' },
  { id: 'hora', label: 'Hora', field: 'hora' },
  { id: 'turno', label: 'Turno', field: 'turno' },
  { id: 'numeroProcesso', label: 'Processo', field: 'numeroProcesso' },
  { id: 'classeJudicial', label: 'Classe', field: 'classeJudicial' },
  { id: 'orgaoJulgador', label: 'Órgão julgador', field: 'orgaoJulgador' },
  { id: 'subnucleo', label: 'Subnúcleo', field: 'subnucleo' },
  { id: 'estado', label: 'Estado', field: 'estado' },
  { id: 'usuarioRecebeuTarefa', label: 'Usuário', field: 'usuarioRecebeuTarefa' },
  { id: 'analise', label: 'Análise', field: 'analise' },
  { id: 'dataHoraEscalacao', label: 'Data escalação', field: 'dataHoraEscalacao' },
];

const COLUNAS_AUDIENCIA = [
  { id: 'dataPauta', label: 'Data pauta', field: 'dataPauta' },
  { id: 'horaAudiencia', label: 'Hora', field: 'horaAudiencia' },
  { id: 'turnoPauta', label: 'Turno', field: 'turnoPauta' },
  { id: 'sala', label: 'Sala', field: 'sala' },
  { id: 'orgaoJulgador', label: 'Órgão julgador', field: 'orgaoJulgador' },
  { id: 'classeJudicial', label: 'Classe', field: 'classeJudicial' },
  { id: 'subnucleo', label: 'Subnúcleo', field: 'subnucleo' },
  { id: 'analise', label: 'Análise', field: 'analise' },
  { id: 'dataCadastro', label: 'Data cadastro', field: 'dataCadastro' },
];

const FUNCAO_CORES = {
  AVALIADOR:   { bg: '#DBEAFE', text: '#1E40AF' },
  PAUTISTA:    { bg: '#D1FAE5', text: '#065F46' },
  AUDIENCISTA: { bg: '#D1FAE5', text: '#065F46' },
  APOIO:       { bg: '#FEF3C7', text: '#92400E' },
};

const ANALISE_CORES = {
  NAO_ESCALADA:    { bg: '#FEE2E2', text: '#991B1B', label: 'Não escalada' },
  ANALISE_PENDENTE:{ bg: '#FEF3C7', text: '#92400E', label: 'Análise pendente' },
  COMPARECER:      { bg: '#D1FAE5', text: '#065F46', label: 'Comparecer' },
  NAO_COMPARECER:  { bg: '#FEE2E2', text: '#991B1B', label: 'Não comparecer' },
  CANCELADA:       { bg: '#EDE9FE', text: '#4C1D95', label: 'Cancelada' },
  REDESIGNADA:     { bg: '#FEF9C3', text: '#713F12', label: 'Redesignada' },
};

const METRIC_ACCENTS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
const CHART_COLORS   = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#F97316'];

/* ─── HELPERS DE RENDER ─── */
const Pill = ({ bg, text, label }) => (
  <Box sx={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: 22, px: 1.25, borderRadius: '11px',
    bgcolor: bg, color: text,
    fontSize: 11, fontWeight: 600,
    fontFamily: '"Geist", sans-serif',
    whiteSpace: 'nowrap',
  }}>
    {label}
  </Box>
);

const AnalysisChip = ({ value }) => {
  const a = ANALISE_CORES[value] || { bg: '#F1F5F9', text: '#334155', label: value || '—' };
  return <Pill bg={a.bg} text={a.text} label={a.label} />;
};

const ClasseJudicialChip = ({ value }) => {
  const c = value === 'JEF' ? { bg: '#DBEAFE', text: '#1E40AF' }
    : value === 'COMUM' ? { bg: '#EDE9FE', text: '#4C1D95' }
    : { bg: '#F1F5F9', text: '#334155' };
  return <Pill bg={c.bg} text={c.text} label={value || '—'} />;
};

const FuncaoChip = ({ value }) => {
  const c = FUNCAO_CORES[value] || { bg: '#F1F5F9', text: '#334155' };
  return <Pill bg={c.bg} text={c.text} label={value || '—'} />;
};

const MonoText = ({ children, muted }) => (
  <Typography sx={{
    fontFamily: '"Geist Mono", monospace', fontSize: 12,
    fontWeight: muted ? 400 : 500,
    color: muted ? 'text.secondary' : 'text.primary',
  }}>
    {children}
  </Typography>
);

const formatDateBr = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

const formatDateTimeBr = (dateTimeStr) => {
  if (!dateTimeStr) return '—';
  try {
    const date = new Date(dateTimeStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateTimeStr;
  }
};

const renderCellContent = (fieldId, value) => {
  if (fieldId === 'analise') return <AnalysisChip value={value} />;
  if (fieldId === 'classeJudicial') return <ClasseJudicialChip value={value} />;
  if (fieldId === 'dataHoraEscalacao' || fieldId === 'dataCadastro') {
    if (!value) return <MonoText muted>—</MonoText>;
    return <MonoText muted>{formatDateTimeBr(value)}</MonoText>;
  }
  if (fieldId === 'dataPauta')
    return <MonoText>{formatDateBr(value) || '—'}</MonoText>;
  if (['hora', 'horaAudiencia'].includes(fieldId))
    return <MonoText>{value || '—'}</MonoText>;
  return (
    <Typography sx={{ fontSize: 12, fontFamily: '"Geist", sans-serif', color: 'text.primary' }}>
      {value || '—'}
    </Typography>
  );
};

const renderNum = (v) => (
  <Typography sx={{ fontFamily: '"Geist Mono", monospace', fontSize: 12, fontWeight: 500, textAlign: 'right' }}>
    {(v || 0).toLocaleString('pt-BR')}
  </Typography>
);
const renderPct = (v) => (
  <Typography sx={{ fontFamily: '"Geist Mono", monospace', fontSize: 12, color: 'text.secondary', textAlign: 'right' }}>
    {(v || 0).toFixed(1)}%
  </Typography>
);

/* ─── COMPONENTES ESTRUTURAIS ─── */
const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `0.5px solid ${alpha(theme.palette.divider, 0.8)}`,
  boxShadow: 'none',
  transition: 'border-color 0.18s',
  '&:hover': { borderColor: theme.palette.divider },
}));

const SectionHead = ({ title, count, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontFamily: '"Geist", sans-serif', fontWeight: 500, fontSize: 13, color: 'text.primary' }}>
        {title}
      </Typography>
      {count != null && (
        <Box sx={{
          height: 18, px: 0.9, borderRadius: '9px',
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          color: 'primary.main', fontSize: 10, fontWeight: 600,
          fontFamily: '"Geist Mono", monospace',
          display: 'flex', alignItems: 'center',
        }}>
          {count}
        </Box>
      )}
    </Box>
    {children && <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>{children}</Box>}
  </Box>
);

const ViewToggle = ({ value, onChange }) => (
  <ToggleButtonGroup value={value} exclusive onChange={(_, v) => v && onChange(v)} size="small"
    sx={{ '& .MuiToggleButton-root': { fontFamily: '"Geist", sans-serif', fontSize: 11, py: 0.35, px: 1.25 } }}>
    <ToggleButton value="tabela">Tabela</ToggleButton>
    <ToggleButton value="grafico">Gráfico</ToggleButton>
  </ToggleButtonGroup>
);

const MetricCard = ({ label, value, sub, accentColor }) => (
  <SectionCard sx={{ position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, bgcolor: accentColor || 'primary.main' }} />
    <CardContent sx={{ p: 2, pb: '16px !important' }}>
      <Typography sx={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.primary', fontFamily: '"Geist", sans-serif', mb: 1, opacity: 0.6 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 500, lineHeight: 1, mb: 0.5, fontFamily: '"Geist Mono", monospace', color: 'text.primary' }}>
        {value}
      </Typography>
      {sub && <Typography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: '"Geist", sans-serif' }}>{sub}</Typography>}
    </CardContent>
  </SectionCard>
);

const ProgressBar = ({ pct }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 110 }}>
    <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: (t) => alpha(t.palette.divider, 0.5), overflow: 'hidden' }}>
      <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 2, bgcolor: 'primary.main' }} />
    </Box>
    <Typography sx={{ fontSize: 10, fontFamily: '"Geist Mono", monospace', color: 'text.secondary', minWidth: 26, textAlign: 'right' }}>
      {pct}%
    </Typography>
  </Box>
);

const DataTable = ({ columns, rows, emptyMessage = 'Sem dados' }) => {
  const theme = useTheme();
  if (!rows || rows.length === 0)
    return <Typography sx={{ py: 2, fontSize: 13, color: 'text.secondary', fontFamily: '"Geist", sans-serif' }}>{emptyMessage}</Typography>;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align || 'left'}
                sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', borderBottom: `1.5px solid ${theme.palette.divider}`, fontFamily: '"Geist", sans-serif', pb: 1, whiteSpace: 'nowrap' }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} hover sx={{ '&:last-child td': { border: 0 } }}>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'} sx={{ py: 1.25 }}>
                  {col.render ? col.render(row[col.field], row) : <Typography sx={{ fontSize: 12, fontFamily: '"Geist", sans-serif' }}>{row[col.field] ?? '—'}</Typography>}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

/* ─── GRÁFICOS ─── */
const BarChart = ({ items, labelField, valueField }) => {
  const theme = useTheme();
  if (!items?.length) return <Typography sx={{ py: 2, fontSize: 13, color: 'text.secondary' }}>Sem dados</Typography>;
  return (
    <Chart
      options={{
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: '"Geist", sans-serif', foreColor: theme.palette.text.secondary },
        colors: [theme.palette.primary.main],
        plotOptions: { bar: { horizontal: true, barHeight: '52%', borderRadius: 5, borderRadiusApplication: 'end' } },
        dataLabels: { enabled: true, formatter: (v) => v.toLocaleString('pt-BR'), style: { fontSize: '11px', fontWeight: 400 } },
        legend: { show: false },
        grid: { borderColor: alpha(theme.palette.divider, 0.4), strokeDashArray: 3, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
        xaxis: { categories: items.map((d) => d[labelField] || '—'), axisBorder: { show: false }, labels: { style: { fontSize: '11px', fontFamily: '"Geist", sans-serif' } } },
        yaxis: { labels: { style: { fontSize: '11px', fontWeight: 500, fontFamily: '"Geist", sans-serif' }, maxWidth: 220 } },
        tooltip: { theme: theme.palette.mode, y: { formatter: (v) => v.toLocaleString('pt-BR') } },
      }}
      series={[{ name: 'Total', data: items.map((d) => d[valueField] || 0) }]}
      type="bar" height={Math.max(180, items.length * 46)} width="100%"
    />
  );
};

const DonutChart = ({ items, labelField, valueField }) => {
  const theme = useTheme();
  if (!items?.length) return <Typography sx={{ py: 2, fontSize: 13, color: 'text.secondary' }}>Sem dados</Typography>;
  const total = items.reduce((a, d) => a + (d[valueField] || 0), 0);
  return (
    <Box>
      <Chart
        options={{
          chart: { type: 'donut', fontFamily: '"Geist", sans-serif', foreColor: theme.palette.text.secondary },
          colors: CHART_COLORS,
          labels: items.map((d) => d[labelField] || '—'),
          dataLabels: { enabled: true, formatter: (v) => `${v.toFixed(0)}%`, dropShadow: { enabled: false }, style: { fontSize: '11px', fontWeight: 400 } },
          plotOptions: { pie: { donut: { size: '60%', labels: { show: true, name: { fontSize: '12px', fontWeight: 500 }, value: { fontSize: '20px', fontWeight: 500, fontFamily: '"Geist Mono", monospace', formatter: (v) => parseInt(v).toLocaleString('pt-BR') }, total: { show: true, label: 'Total', fontSize: '11px', fontWeight: 500, formatter: () => total.toLocaleString('pt-BR') } } } } },
          legend: { show: false },
          stroke: { show: true, width: 2, colors: [theme.palette.background.paper] },
          tooltip: { theme: theme.palette.mode, y: { formatter: (v) => v.toLocaleString('pt-BR') } },
        }}
        series={items.map((d) => d[valueField] || 0)}
        type="donut" height={240} width="100%"
      />
      <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        {items.map((item, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, fontFamily: '"Geist", sans-serif' }}>{item[labelField] || '—'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Typography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: '"Geist Mono", monospace' }}>
                {total > 0 ? ((item[valueField] / total) * 100).toFixed(1) : 0}%
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 500, fontFamily: '"Geist Mono", monospace', minWidth: 36, textAlign: 'right' }}>
                {(item[valueField] || 0).toLocaleString('pt-BR')}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

/* ─── COMPONENTE PRINCIPAL ─── */
const Relatorio = () => {
  const [formData, setFormData] = useState({ dataInicio: '', dataFim: '', dataEscala: '', tipoRelatorio: '', tipoEscala: '', orgaoJulgador: null, tipoContestacao: '', subnucleo: '', classeJudicial: '', usuariosIds: [] });
  const [orgaoJulgadorOptions, setOrgaoJulgadorOptions] = useState([]);
  const [orgaoJulgadorSearchTerm, setOrgaoJulgadorSearchTerm] = useState('');
  const [orgaoJulgadorLoading, setOrgaoJulgadorLoading] = useState(false);
  const [usuarioOptions, setUsuarioOptions] = useState([]);
  const [usuarioSearchTerm, setUsuarioSearchTerm] = useState('');
  const [usuarioLoading, setUsuarioLoading] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabelaLoading, setTabelaLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [metricsData, setMetricsData] = useState(null);
  const [contestacaoTab, setContestacaoTab] = useState('JEF');
  const [viewContestation, setViewContestation] = useState('tabela');
  const [viewSubnucleo, setViewSubnucleo] = useState('tabela');
  const [viewSetores, setViewSetores] = useState('tabela');
  const [viewTiposAnalise, setViewTiposAnalise] = useState('tabela');
  const [viewClasseProcessual, setViewClasseProcessual] = useState('tabela');
  const [viewOrgaosJulgadores, setViewOrgaosJulgadores] = useState('tabela');
  const [pageOrgaos, setPageOrgaos] = useState(0);
  const [sortBy, setSortBy] = useState('dataPauta');
  const [sortDir, setSortDir] = useState('desc');
  const [buscaCarga, setBuscaCarga] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [excelLoadingAudiencia, setExcelLoadingAudiencia] = useState(false);
  const [excelLoadingPauta, setExcelLoadingPauta] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setOrgaoJulgadorLoading(true);
      try { const r = await orgaoJulgadorService.buscar(orgaoJulgadorSearchTerm || '', [], 0, 50); setOrgaoJulgadorOptions(r); }
      catch { setOrgaoJulgadorOptions([]); } finally { setOrgaoJulgadorLoading(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [orgaoJulgadorSearchTerm]);

  const handleOrgaoJulgadorFocus = async () => {
    if (!orgaoJulgadorOptions.length) {
      setOrgaoJulgadorLoading(true);
      try { const r = await orgaoJulgadorService.buscar('', [], 0, 50); setOrgaoJulgadorOptions(r); }
      catch { } finally { setOrgaoJulgadorLoading(false); }
    }
  };

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!formData.tipoEscala) { setUsuarioOptions([]); return; }
      setUsuarioLoading(true);
      try {
        let r;
        if (formData.tipoEscala === 'AVALIADOR') r = await avaliadorService.buscar(usuarioSearchTerm);
        else if (formData.tipoEscala === 'PAUTISTA') r = await pautistaService.buscar(usuarioSearchTerm);
        else r = await apoioService.buscar(usuarioSearchTerm);
        setUsuarioOptions(r);
      } catch { setUsuarioOptions([]); } finally { setUsuarioLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [usuarioSearchTerm, formData.tipoEscala]);

  const buildFiltros = (pageNum, pageSizeOverride, sortByOverride, sortDirOverride) => ({
    page: pageNum, size: pageSizeOverride !== undefined ? pageSizeOverride : rowsPerPage,
    dataInicio: formData.dataInicio, dataFim: formData.dataFim, dataEscala: formData.dataEscala || null,
    tipoRelatorio: formData.tipoRelatorio, tipoEscala: formData.tipoEscala || null,
    orgaoJulgador: formData.orgaoJulgador ? formData.orgaoJulgador.id : null,
    tipoContestacao: formData.tipoContestacao || null, subnucleo: formData.subnucleo || null,
    classeJudicial: formData.classeJudicial || null,
    usuariosIds: formData.usuariosIds.map((u) => u.id),
    sortBy: sortByOverride ?? sortBy, sortDir: sortDirOverride ?? sortDir,
  });

  const handleBuscar = async () => {
    if (!formData.dataInicio || !formData.dataFim || !formData.tipoRelatorio) return;
    if (formData.tipoRelatorio === 'ESCALA' && !formData.tipoEscala) { alert('Selecione um tipo de escala para continuar.'); return; }
    setLoading(true); setBuscaRealizada(true); setPage(0); setPageOrgaos(0); setErrorMessage('');
    try {
      const filtros = buildFiltros(0);
      let metrics, audiencias;
      if (formData.tipoRelatorio === 'ESCALA') {
        [metrics, audiencias] = await Promise.all([relatorioService.buscarEscalaMetrics(filtros), relatorioService.buscarEscalaAudiencias(filtros)]);
      } else {
        [metrics, audiencias] = await Promise.all([relatorioService.buscarAudienciaMetrics(filtros), relatorioService.buscarAudienciasListar(filtros)]);
      }
      setMetricsData(metrics); setResultados(audiencias.content); setTotalElements(audiencias.totalElements);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Erro ao buscar relatório. Tente novamente.');
      setMetricsData(null); setResultados([]); setTotalElements(0);
    } finally { setLoading(false); }
  };

  const handleBuscarTabela = async (newPage, newRowsPerPage, newSortBy, newSortDir) => {
    if (!formData.dataInicio || !formData.dataFim) return;
    setTabelaLoading(true);
    try {
      const filtros = buildFiltros(newPage, newRowsPerPage, newSortBy, newSortDir);
      const response = formData.tipoRelatorio === 'ESCALA'
        ? await relatorioService.buscarEscalaAudiencias(filtros)
        : await relatorioService.buscarAudienciasListar(filtros);
      setResultados(response.content); setTotalElements(response.totalElements); setPage(newPage);
    } catch (e) { console.error(e); } finally { setTabelaLoading(false); }
  };

  const handleSort = (field) => {
    const newDir = sortBy === field ? (sortDir === 'asc' ? 'desc' : 'asc') : 'desc';
    setSortBy(field); setSortDir(newDir); setPage(0);
    if (buscaRealizada) handleBuscarTabela(0, rowsPerPage, field, newDir);
  };

  const handleChangePage = (_, newPage) => handleBuscarTabela(newPage);
  const handleChangeRowsPerPage = (e) => {
    const s = parseInt(e.target.value, 10); setRowsPerPage(s); setPage(0);
    if (buscaRealizada) handleBuscarTabela(0, s);
  };

  const handleLimpar = () => {
    setFormData({ dataInicio: '', dataFim: '', dataEscala: '', tipoRelatorio: '', tipoEscala: '', orgaoJulgador: null, tipoContestacao: '', subnucleo: '', classeJudicial: '', usuariosIds: [] });
    setResultados([]); setTotalElements(0); setPage(0); setBuscaRealizada(false); setMetricsData(null); setErrorMessage('');
  };

  const downloadBlob = (blob, nome) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.setAttribute('download', nome);
    document.body.appendChild(a); a.click(); a.parentNode.removeChild(a); window.URL.revokeObjectURL(url);
  };

  const handleGerarExcelAudiencia = async () => {
    if (!buscaRealizada || !formData.dataInicio || !formData.dataFim) return;
    setExcelLoadingAudiencia(true);
    try {
      const filtros = { dataInicio: formData.dataInicio, dataFim: formData.dataFim, orgaoJulgadorId: formData.orgaoJulgador?.id || null, tipoContestacao: formData.tipoContestacao || null, subnucleo: formData.subnucleo || null, classeJudicial: formData.classeJudicial || null, tipoEscala: formData.tipoEscala || null };
      const blob = formData.tipoRelatorio === 'AUDIENCIA' ? await relatorioService.gerarExcelAudiencia(filtros) : await relatorioService.gerarExcelEscala(filtros);
      downloadBlob(blob, formData.tipoRelatorio === 'AUDIENCIA' ? `Audiencias_${formData.dataInicio}_${formData.dataFim}.xlsx` : `Escala_${formData.dataInicio}_${formData.dataFim}.xlsx`);
    } catch (e) { console.error(e); alert('Erro ao gerar Excel.'); } finally { setExcelLoadingAudiencia(false); }
  };

  const handleGerarExcelPauta = async () => {
    if (!buscaRealizada || !formData.dataInicio || !formData.dataFim) return;
    setExcelLoadingPauta(true);
    try {
      const filtros = { dataInicio: formData.dataInicio, dataFim: formData.dataFim, orgaoJulgadorId: formData.orgaoJulgador?.id || null, tipoContestacao: formData.tipoContestacao || null, subnucleo: formData.subnucleo || null, classeJudicial: formData.classeJudicial || null };
      const blob = await relatorioService.gerarExcelPauta(filtros);
      downloadBlob(blob, `Pautas_${formData.dataInicio}_${formData.dataFim}.xlsx`);
    } catch (e) { console.error(e); alert('Erro ao gerar Excel de Pautas.'); } finally { setExcelLoadingPauta(false); }
  };

  const getContestacaoItems = useCallback(() => {
    if (!metricsData?.tiposContestacao) return [];
    return metricsData.tiposContestacao[contestacaoTab]?.itens || [];
  }, [metricsData, contestacaoTab]);

  const colunas = useMemo(() => formData.tipoRelatorio === 'AUDIENCIA' ? COLUNAS_AUDIENCIA : COLUNAS_ESCALA, [formData.tipoRelatorio]);

  const maxCarga = useMemo(() =>
    metricsData?.distribuicaoCarga?.length ? Math.max(...metricsData.distribuicaoCarga.map((d) => d.totalAudiencias)) : 0,
    [metricsData]);

  const cargaFiltrada = useMemo(() =>
    (metricsData?.distribuicaoCarga || []).filter((d) => !buscaCarga || d.nome?.toLowerCase().includes(buscaCarga.toLowerCase())),
    [metricsData, buscaCarga]);

  const r = metricsData?.resumo || {};

  const btnSx = { fontFamily: '"Geist", sans-serif', fontWeight: 500, textTransform: 'none', borderRadius: '8px', fontSize: 13 };
  const togSx = { '& .MuiToggleButton-root': { fontFamily: '"Geist", sans-serif', fontSize: 11, py: 0.35, px: 1.25 } };

  /* Reuse colunas para contestação e subnúcleo */
  const colsContest = [
    { id: 'descricao', label: 'Tipo', field: 'descricao' },
    { id: 'totalAudiencias', label: 'Total', field: 'totalAudiencias', align: 'right', render: renderNum },
    { id: 'percentual', label: '%', field: 'percentual', align: 'right', render: renderPct },
  ];
  const colsSub = [
    { id: 'descricao', label: 'Subnúcleo', field: 'descricao' },
    { id: 'totalAudiencias', label: 'Total', field: 'totalAudiencias', align: 'right', render: renderNum },
    { id: 'percentual', label: '%', field: 'percentual', align: 'right', render: renderPct },
  ];
  const colsOrgaos = [
    { id: 'nome', label: 'Nome', field: 'nome' },
    { id: 'totalAudiencias', label: 'Total', field: 'totalAudiencias', align: 'right', render: renderNum },
    { id: 'percentual', label: '%', field: 'percentual', align: 'right', render: renderPct },
  ];

  return (
    <PageContainer title="Relatório" description="Relatório de Escala">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* FILTROS */}
        <SectionCard>
          <CardContent sx={{ p: 2.5, pb: '20px !important' }}>
            <SectionHead title="Parâmetros do relatório" />

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 1.5, mb: 1.5 }}>
              <TextField label="Data início *" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={formData.dataInicio} onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })} />
              <TextField label="Data fim *" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={formData.dataFim} onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })} />
              <TextField select label="Tipo de relatório *" fullWidth size="small" value={formData.tipoRelatorio} onChange={(e) => setFormData({ ...formData, tipoRelatorio: e.target.value, tipoEscala: '', dataEscala: '', usuariosIds: [] })}>
                {TIPO_RELATORIO_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
              {formData.tipoRelatorio === 'ESCALA' && (
                <TextField select label="Tipo de escala *" fullWidth size="small" value={formData.tipoEscala} onChange={(e) => setFormData({ ...formData, tipoEscala: e.target.value, usuariosIds: [] })}>
                  {TIPO_ESCALA_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
              )}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 1.5, mb: 1.5 }}>
              <Autocomplete size="small" options={orgaoJulgadorOptions} getOptionLabel={(o) => o.nome || ''} value={formData.orgaoJulgador} loading={orgaoJulgadorLoading} onOpen={handleOrgaoJulgadorFocus} onChange={(_, v) => setFormData({ ...formData, orgaoJulgador: v })} onInputChange={(_, v) => setOrgaoJulgadorSearchTerm(v)} isOptionEqualToValue={(o, v) => o.id === v.id}
                renderInput={(p) => <TextField {...p} label="Órgão julgador" InputProps={{ ...p.InputProps, endAdornment: <>{orgaoJulgadorLoading && <CircularProgress size={16} />}{p.InputProps.endAdornment}</> }} />} />
              <TextField select label="Tipo contestação" fullWidth size="small" value={formData.tipoContestacao} onChange={(e) => setFormData({ ...formData, tipoContestacao: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                {TIPO_CONTESTACAO_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
              {formData.tipoRelatorio === 'ESCALA' && (
                <TextField select label="Subnúcleo" fullWidth size="small" value={formData.subnucleo} onChange={(e) => setFormData({ ...formData, subnucleo: e.target.value })}>
                  <MenuItem value="">Todos</MenuItem>
                  {SUBNUCLEO_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                </TextField>
              )}
              <TextField select label="Classe judicial" fullWidth size="small" value={formData.classeJudicial} onChange={(e) => setFormData({ ...formData, classeJudicial: e.target.value })}>
                <MenuItem value="">Todas</MenuItem>
                {CLASSE_JUDICIAL_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Box>

            {formData.tipoRelatorio === 'ESCALA' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: 1.5, mb: 1.5 }}>
                <TextField label="Data escala" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={formData.dataEscala} onChange={(e) => setFormData({ ...formData, dataEscala: e.target.value })} />
                <Autocomplete multiple size="small" options={usuarioOptions} getOptionLabel={(o) => o.nome || ''} value={formData.usuariosIds} loading={usuarioLoading} filterSelectedOptions disabled={!formData.tipoEscala} onChange={(_, v) => setFormData({ ...formData, usuariosIds: v })} onInputChange={(_, v) => setUsuarioSearchTerm(v)} isOptionEqualToValue={(o, v) => o.id === v.id}
                  renderInput={(p) => <TextField {...p} label={formData.tipoEscala ? 'Usuários' : 'Usuários (selecione o tipo de escala)'} InputProps={{ ...p.InputProps, endAdornment: <>{usuarioLoading && <CircularProgress size={16} />}{p.InputProps.endAdornment}</> }} />} />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" size="small" startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <IconSearch size={15} />}
                onClick={handleBuscar} disabled={loading || !formData.dataInicio || !formData.dataFim || !formData.tipoRelatorio || (formData.tipoRelatorio === 'ESCALA' && !formData.tipoEscala)} sx={btnSx}>
                Gerar relatório
              </Button>
              <Button variant="outlined" color="secondary" size="small" onClick={handleLimpar} disabled={loading} sx={btnSx}>Limpar</Button>
              <Button variant="outlined" color="success" size="small" startIcon={excelLoadingAudiencia ? <CircularProgress size={14} /> : <IconFileSpreadsheet size={15} />} onClick={handleGerarExcelAudiencia} disabled={!buscaRealizada || excelLoadingAudiencia} sx={btnSx}>
                {excelLoadingAudiencia ? 'Gerando...' : 'Gerar Excel'}
              </Button>
              <Button variant="outlined" color="success" size="small" startIcon={excelLoadingPauta ? <CircularProgress size={14} /> : <IconFileSpreadsheet size={15} />} onClick={handleGerarExcelPauta} disabled={!buscaRealizada || excelLoadingPauta} sx={btnSx}>
                {excelLoadingPauta ? 'Gerando...' : 'Gerar Excel de Pautas'}
              </Button>
            </Box>
          </CardContent>
        </SectionCard>

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

        {!loading && buscaRealizada && errorMessage && (
          <SectionCard><CardContent sx={{ py: 5, textAlign: 'center' }}>
            <Typography color="error" sx={{ fontFamily: '"Geist", sans-serif', fontSize: 13 }}>{errorMessage}</Typography>
          </CardContent></SectionCard>
        )}

        {!loading && buscaRealizada && !errorMessage && metricsData && (
          <>
            {/* MÉTRICAS */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 1.5 }}>
              <MetricCard label="Total de audiências" value={(r.totalAudiencias || 0).toLocaleString('pt-BR')} accentColor={METRIC_ACCENTS[0]} />
              <MetricCard label="Total de pautas" value={(r.totalPautas || 0).toLocaleString('pt-BR')} sub={`Média ${(r.mediaAudienciasPorPauta || 0).toFixed(1)} aud./pauta`} accentColor={METRIC_ACCENTS[1]} />
              {formData.tipoRelatorio === 'ESCALA' && <>
                <MetricCard label="Colaboradores escalados" value={(r.totalColaboradoresEscalados || 0).toLocaleString('pt-BR')} accentColor={METRIC_ACCENTS[2]} />
                <MetricCard label="Taxa de comparecimento" value={`${((r.taxaComparecimento || 0) * 100).toFixed(1)}%`} sub={`${r.audienciasComparecimento || 0} compareceram`} accentColor={METRIC_ACCENTS[3]} />
              </>}
            </Box>

            {/* ══ BLOCOS ESCALA ══ */}
            {formData.tipoRelatorio === 'ESCALA' && (
              <>
                {metricsData.distribuicaoCarga?.length > 0 && (
                  <SectionCard>
                    <CardContent sx={{ p: 2 }}>
                      <SectionHead title="Distribuição de carga" count={cargaFiltrada.length}>
                        <TextField size="small" placeholder="Buscar por nome..." value={buscaCarga} onChange={(e) => setBuscaCarga(e.target.value)} sx={{ minWidth: 200 }} InputProps={{ sx: { fontSize: 12, fontFamily: '"Geist", sans-serif' } }} />
                      </SectionHead>
                      <DataTable
                        columns={[
                          { id: 'nome', label: 'Colaborador', field: 'nome', render: (v) => <Typography sx={{ fontSize: 12, fontWeight: 500, fontFamily: '"Geist", sans-serif' }}>{v || '—'}</Typography> },
                          { id: 'funcao', label: 'Função', field: 'funcao', render: (v) => <FuncaoChip value={v} /> },
                          { id: 'cargo', label: 'Cargo', field: 'cargo', render: (v) => <Typography sx={{ fontSize: 12, color: 'text.primary', fontFamily: '"Geist", sans-serif' }}>{v || '—'}</Typography> },
                          { id: 'totalAudiencias', label: 'Total', field: 'totalAudiencias', align: 'right', render: renderNum },
                          { id: 'dist', label: 'Distribuição', field: 'totalAudiencias', render: (v) => <ProgressBar pct={maxCarga > 0 ? Math.round((v / maxCarga) * 100) : 0} /> },
                        ]}
                        rows={cargaFiltrada}
                      />
                    </CardContent>
                  </SectionCard>
                )}

                {(metricsData.tiposContestacao || metricsData.subnucleos?.length > 0) && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {metricsData.tiposContestacao && (
                      <SectionCard><CardContent sx={{ p: 2 }}>
                        <SectionHead title="Tipo de contestação">
                          <ToggleButtonGroup value={contestacaoTab} exclusive onChange={(_, v) => v && setContestacaoTab(v)} size="small" sx={togSx}>
                            <ToggleButton value="JEF">JEF</ToggleButton>
                            <ToggleButton value="COMUM">Comum</ToggleButton>
                            <ToggleButton value="CONSOLIDADO">Todos</ToggleButton>
                          </ToggleButtonGroup>
                          <ViewToggle value={viewContestation} onChange={setViewContestation} />
                        </SectionHead>
                        {getContestacaoItems().length > 0
                          ? viewContestation === 'tabela' ? <DataTable columns={colsContest} rows={getContestacaoItems()} /> : <BarChart items={getContestacaoItems()} labelField="descricao" valueField="totalAudiencias" />
                          : <Typography sx={{ py: 2, fontSize: 13, color: 'text.secondary', fontFamily: '"Geist", sans-serif' }}>Sem dados para este filtro</Typography>}
                      </CardContent></SectionCard>
                    )}
                    {metricsData.subnucleos?.length > 0 && (
                      <SectionCard><CardContent sx={{ p: 2 }}>
                        <SectionHead title="Subnúcleo"><ViewToggle value={viewSubnucleo} onChange={setViewSubnucleo} /></SectionHead>
                        {viewSubnucleo === 'tabela' ? <DataTable columns={colsSub} rows={metricsData.subnucleos} /> : <DonutChart items={metricsData.subnucleos} labelField="descricao" valueField="totalAudiencias" />}
                      </CardContent></SectionCard>
                    )}
                  </Box>
                )}

                {(metricsData.setores?.length > 0 || metricsData.tiposAnalise?.length > 0) && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {metricsData.setores?.length > 0 && (
                      <SectionCard><CardContent sx={{ p: 2 }}>
                        <SectionHead title="Setores"><ViewToggle value={viewSetores} onChange={setViewSetores} /></SectionHead>
                        {viewSetores === 'tabela'
                          ? <DataTable columns={[{ id: 'nome', label: 'Setor', field: 'nome' }, { id: 'totalAudiencias', label: 'Total', field: 'totalAudiencias', align: 'right', render: renderNum }, { id: 'percentual', label: '%', field: 'percentual', align: 'right', render: renderPct }]} rows={metricsData.setores} />
                          : <BarChart items={metricsData.setores} labelField="nome" valueField="totalAudiencias" />}
                      </CardContent></SectionCard>
                    )}
                    {metricsData.tiposAnalise?.length > 0 && (
                      <SectionCard><CardContent sx={{ p: 2 }}>
                        <SectionHead title="Tipo de análise"><ViewToggle value={viewTiposAnalise} onChange={setViewTiposAnalise} /></SectionHead>
                        {viewTiposAnalise === 'tabela'
                          ? <DataTable columns={[{ id: 'descricao', label: 'Análise', field: 'descricao', render: (v) => <AnalysisChip value={v} /> }, { id: 'totalAudiencias', label: 'Total', field: 'totalAudiencias', align: 'right', render: renderNum }, { id: 'percentual', label: '%', field: 'percentual', align: 'right', render: renderPct }]} rows={metricsData.tiposAnalise} />
                          : <BarChart items={metricsData.tiposAnalise} labelField="descricao" valueField="totalAudiencias" />}
                      </CardContent></SectionCard>
                    )}
                  </Box>
                )}
              </>
            )}

            {/* ══ BLOCOS AUDIÊNCIA ══ */}
            {formData.tipoRelatorio === 'AUDIENCIA' && (
              <>
                {(metricsData.porClasseProcessual || metricsData.tiposContestacao) && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {metricsData.porClasseProcessual && (
                      <SectionCard><CardContent sx={{ p: 2 }}>
                        <SectionHead title="Classe processual"><ViewToggle value={viewClasseProcessual} onChange={setViewClasseProcessual} /></SectionHead>
                        {viewClasseProcessual === 'tabela'
                          ? <DataTable columns={[{ id: 'classe', label: 'Classe', field: 'classe', render: (v) => <ClasseJudicialChip value={v} /> }, { id: 'totalAudiencias', label: 'Total', field: 'totalAudiencias', align: 'right', render: renderNum }, { id: 'percentual', label: '%', field: 'percentual', align: 'right', render: renderPct }]} rows={Object.entries(metricsData.porClasseProcessual).map(([classe, data]) => ({ classe, ...data }))} />
                          : <DonutChart items={Object.entries(metricsData.porClasseProcessual).map(([classe, data]) => ({ classe, ...data }))} labelField="classe" valueField="totalAudiencias" />}
                      </CardContent></SectionCard>
                    )}
                    {metricsData.tiposContestacao && (
                      <SectionCard><CardContent sx={{ p: 2 }}>
                        <SectionHead title="Tipo de contestação">
                          <ToggleButtonGroup value={contestacaoTab} exclusive onChange={(_, v) => v && setContestacaoTab(v)} size="small" sx={togSx}>
                            <ToggleButton value="JEF">JEF</ToggleButton>
                            <ToggleButton value="COMUM">Comum</ToggleButton>
                            <ToggleButton value="CONSOLIDADO">Todos</ToggleButton>
                          </ToggleButtonGroup>
                          <ViewToggle value={viewContestation} onChange={setViewContestation} />
                        </SectionHead>
                        {getContestacaoItems().length > 0
                          ? viewContestation === 'tabela' ? <DataTable columns={colsContest} rows={getContestacaoItems()} /> : <BarChart items={getContestacaoItems()} labelField="descricao" valueField="totalAudiencias" />
                          : <Typography sx={{ py: 2, fontSize: 13, color: 'text.secondary', fontFamily: '"Geist", sans-serif' }}>Sem dados para este filtro</Typography>}
                      </CardContent></SectionCard>
                    )}
                  </Box>
                )}

                {(metricsData.orgaosJulgadores?.length > 0 || metricsData.subnucleos?.length > 0) && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {metricsData.orgaosJulgadores?.length > 0 && (
                      <SectionCard><CardContent sx={{ p: 2 }}>
                        <SectionHead title="Órgãos julgadores" count={metricsData.orgaosJulgadores.length}>
                          <ViewToggle value={viewOrgaosJulgadores} onChange={setViewOrgaosJulgadores} />
                        </SectionHead>
                        {viewOrgaosJulgadores === 'tabela' ? (
                          <>
                            <DataTable columns={colsOrgaos} rows={metricsData.orgaosJulgadores.slice(pageOrgaos * 10, pageOrgaos * 10 + 10)} />
                            <TablePagination component="div" count={metricsData.orgaosJulgadores.length} page={pageOrgaos} onPageChange={(_, p) => setPageOrgaos(p)} rowsPerPage={10} rowsPerPageOptions={[10]} labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`} sx={{ fontFamily: '"Geist", sans-serif', fontSize: 12 }} />
                          </>
                        ) : (
                          <BarChart items={metricsData.orgaosJulgadores.slice(pageOrgaos * 10, pageOrgaos * 10 + 10)} labelField="nome" valueField="totalAudiencias" />
                        )}
                      </CardContent></SectionCard>
                    )}
                    {metricsData.subnucleos?.length > 0 && (
                      <SectionCard><CardContent sx={{ p: 2 }}>
                        <SectionHead title="Subnúcleo"><ViewToggle value={viewSubnucleo} onChange={setViewSubnucleo} /></SectionHead>
                        {viewSubnucleo === 'tabela' ? <DataTable columns={colsSub} rows={metricsData.subnucleos} /> : <DonutChart items={metricsData.subnucleos} labelField="descricao" valueField="totalAudiencias" />}
                      </CardContent></SectionCard>
                    )}
                  </Box>
                )}
              </>
            )}

            {/* TABELA PAGINADA */}
            <SectionCard>
              <CardContent sx={{ p: 2 }}>
                <SectionHead title={formData.tipoRelatorio === 'ESCALA' ? 'Audiências de escala' : 'Audiências'} count={totalElements > 0 ? totalElements.toLocaleString('pt-BR') : undefined} />
                <Box sx={{ overflowX: 'auto', position: 'relative' }}>
                  {tabelaLoading && (
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <CircularProgress size={36} />
                    </Box>
                  )}
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {colunas.map((col) => (
                          <TableCell key={col.id} sx={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', borderBottom: (t) => `1.5px solid ${t.palette.divider}`, fontFamily: '"Geist", sans-serif', pb: 1, whiteSpace: 'nowrap' }}>
                            <TableSortLabel active={sortBy === col.field} direction={sortBy === col.field ? sortDir : 'desc'} onClick={() => handleSort(col.field)}>
                              {col.label}
                            </TableSortLabel>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultados.length > 0 ? resultados.map((item, idx) => (
                        <TableRow key={item.id || item.idAudiencia || idx} hover sx={{ '&:last-child td': { border: 0 } }}>
                          {colunas.map((col) => (
                            <TableCell key={col.id} sx={{ py: 1.1 }}>{renderCellContent(col.id, item[col.field])}</TableCell>
                          ))}
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={colunas.length} align="center" sx={{ py: 5 }}>
                            <Typography sx={{ fontSize: 13, color: 'text.secondary', fontFamily: '"Geist", sans-serif' }}>Nenhum resultado encontrado</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination component="div" count={totalElements} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10, 25, 50]} labelRowsPerPage="Por página:" labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`} sx={{ fontFamily: '"Geist", sans-serif', fontSize: 12 }} />
                </Box>
              </CardContent>
            </SectionCard>
          </>
        )}

        {!buscaRealizada && !loading && (
          <SectionCard>
            <CardContent sx={{ py: 6, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', fontFamily: '"Geist", sans-serif' }}>
                Preencha os filtros e clique em Gerar relatório para visualizar os dados
              </Typography>
            </CardContent>
          </SectionCard>
        )}

      </Box>
    </PageContainer>
  );
};

export default Relatorio;