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
import { SUBNUCLEO_OPTIONS, TIPO_CONTESTACAO_OPTIONS, CLASSE_JUDICIAL_OPTIONS, VIEW_RELATORIO_OPTIONS, TIPO_ESCALA_OPTIONS } from '../../constants/respostaAnaliseAvaliador';

// Função helper para obter colunas dinâmicas baseado no tipo de view
const getColumnasRelatorio = (viewType) => {
  const colunas = {
    ESCALA: [
      { id: 'numeroProcesso', label: 'Processo', field: 'numeroProcesso' },
      { id: 'nome', label: 'Nome', field: 'nome' },
      { id: 'data', label: 'Data', field: 'data' },
      { id: 'horario', label: 'Horário', field: 'horario' },
      { id: 'turno', label: 'Turno', field: 'turno' },
      { id: 'sala', label: 'Sala', field: 'sala' },
      { id: 'orgaoJulgador', label: 'Órgão Julgador', field: 'orgaoJulgador' },
      { id: 'tipoContestacao', label: 'Tipo Contestação', field: 'tipoContestacao' },
      { id: 'subnucleo', label: 'Subnúcleo', field: 'subnucleo' },
      { id: 'classeJudicial', label: 'Classe Judicial', field: 'classeJudicial' },
      { id: 'analiseAvaliador', label: 'Análise', field: 'analiseAvaliador' },
      { id: 'observacao', label: 'Observação', field: 'observacao' },
    ],
    AUDIENCIA: [
      { id: 'numeroProcesso', label: 'Processo', field: 'numeroProcesso' },
      { id: 'data', label: 'Data', field: 'data' },
      { id: 'horario', label: 'Horário', field: 'horario' },
      { id: 'classeJudicial', label: 'Classe Judicial', field: 'classeJudicial' },
      { id: 'subnucleo', label: 'Subnúcleo', field: 'subnucleo' },
      { id: 'orgaoJulgador', label: 'Órgão Julgador', field: 'orgaoJulgador' },
      { id: 'tipoContestacao', label: 'Tipo Contestação', field: 'tipoContestacao' },
      { id: 'sala', label: 'Sala', field: 'sala' },
      { id: 'nomeParte', label: 'Nome Parte', field: 'nomeParte' },
      { id: 'analise', label: 'Análise', field: 'analise' },
      { id: 'observacao', label: 'Observação', field: 'observacao' },
    ],
    AUDIENCIA_NAO_ENCONTRADA: [
      { id: 'numeroProcesso', label: 'Processo', field: 'numeroProcesso' },
      { id: 'data', label: 'Data', field: 'data' },
      { id: 'horario', label: 'Horário', field: 'horario' },
      { id: 'classeJudicial', label: 'Classe Judicial', field: 'classeJudicial' },
      { id: 'orgaoJulgador', label: 'Órgão Julgador', field: 'orgaoJulgador' },
      { id: 'sala', label: 'Sala', field: 'sala' },
      { id: 'nomeParte', label: 'Nome Parte', field: 'nomeParte' },
    ],
  };

  return colunas[viewType] || colunas.ESCALA;
};

// Função helper para buscar dados baseado no tipo de view
const buscarDadosRelatorio = async (viewType, filtros) => {
  switch (viewType) {
    case 'AUDIENCIA':
      return await relatorioService.buscarAudiencia(filtros);
    case 'AUDIENCIA_NAO_ENCONTRADA':
      return await relatorioService.buscarAudienciaNaoEncontrada(filtros);
    case 'ESCALA':
    default:
      return await relatorioService.buscarEscala(filtros);
  }
};

// Mapeamento de cores para cada status de análise
const ANALISE_CORES = {
  'NAO_ESCALADA': { bg: '#FFEBEE', text: '#C62828', label: 'Não Escalada' },
  'ANALISE_PENDENTE': { bg: '#FFF3E0', text: '#E65100', label: 'Análise Pendente' },
  'COMPARECER': { bg: '#E8F5E9', text: '#2E7D32', label: 'Comparecer' },
  'NAO_COMPARECER': { bg: '#FFEBEE', text: '#C62828', label: 'Não Comparecer' },
  'CANCELADA': { bg: '#F3E5F5', text: '#6A1B9A', label: 'Cancelada' },
  'REDESIGNADA': { bg: '#FFF9C4', text: '#F57F17', label: 'Redesignada' },
};

// Mapeamento de cores para cada tipo de contestação
const TIPO_CONTESTACAO_CORES = {
  'TIPO1': { bg: '#E3F2FD', text: '#1565C0', label: 'TIPO 1' },
  'TIPO2': { bg: '#F3E5F5', text: '#6A1B9A', label: 'TIPO 2' },
  'TIPO3': { bg: '#E8F5E9', text: '#2E7D32', label: 'TIPO 3' },
  'TIPO4': { bg: '#FFF3E0', text: '#E65100', label: 'TIPO 4' },
  'TIPO5': { bg: '#FCE4EC', text: '#C2185B', label: 'TIPO 5' },
  'SEM_CONTESTACAO': { bg: '#F0F4C3', text: '#827717', label: 'SEM CONTESTAÇÃO' },
  'SEM_TIPO': { bg: '#ECEFF1', text: '#37474F', label: 'SEM TIPO' },
  'ERRO_SAPIENS': { bg: '#FFEBEE', text: '#C62828', label: 'ERRO SAPIENS' },
};

// Componente Badge para análise
const AnalysisChip = ({ value }) => {
  const analise = ANALISE_CORES[value] || ANALISE_CORES['ANALISE_PENDENTE'];
  
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '140px',
        height: '32px',
        backgroundColor: analise.bg,
        color: analise.text,
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: 600,
        textAlign: 'center',
        padding: '4px 8px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {analise.label}
    </Box>
  );
};

// Componente Badge para tipo contestação
const TipoContestacaoChip = ({ value }) => {
  const contestacao = TIPO_CONTESTACAO_CORES[value] || { bg: '#ECEFF1', text: '#37474F', label: value || '-' };
  
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '140px',
        height: '32px',
        backgroundColor: contestacao.bg,
        color: contestacao.text,
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: 600,
        textAlign: 'center',
        padding: '4px 8px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {contestacao.label}
    </Box>
  );
};

// Função para renderizar conteúdo da célula
const renderCellContent = (fieldId, value) => {
  if (fieldId === 'analiseAvaliador' || fieldId === 'analise') {
    return <AnalysisChip value={value} />;
  }
  if (fieldId === 'tipoContestacao') {
    return <TipoContestacaoChip value={value} />;
  }
  return <Typography color="textSecondary" variant="subtitle2">{value || '-'}</Typography>;
};


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

  const categories = contestacoes.map(item => item.descricao || '-');
  const data = contestacoes.map(item => item.total || 0);
  const chartHeight = Math.max(300, contestacoes.length * 60);

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
        barHeight: '60%',
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
      padding: {
        left: 20,
      },
    },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
    },
    yaxis: {
      labels: {
        show: true,
        style: { 
          fontSize: '13px',
          fontWeight: 500,
        },
        maxWidth: 200,
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

// Componente de gráfico de pizza para Setores
const SetoresChart = ({ setores }) => {
  const theme = useTheme();

  // Ordenar por total decrescente
  const sortedSetores = [...setores].sort((a, b) => b.total - a.total);
  const labels = sortedSetores.map(item => item.setor || '-');
  const data = sortedSetores.map(item => item.total || 0);
  const total = data.reduce((acc, val) => acc + val, 0);

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
  ];

  const chartOptions = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
    },
    colors: colors,
    labels: labels,
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
      style: {
        fontSize: '12px',
        fontWeight: 600,
      },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
            },
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
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      y: {
        formatter: (val) => val.toLocaleString('pt-BR'),
      },
    },
    stroke: {
      show: true,
      width: 3,
      colors: [theme.palette.background.paper],
    },
  };

  return (
    <Box>
      <Chart
        options={chartOptions}
        series={data}
        type="donut"
        height={280}
        width="100%"
      />
      {/* Legenda customizada com cores e totais */}
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {sortedSetores.map((item, index) => {
          const percentage = total > 0 ? ((item.total / total) * 100).toFixed(1) : 0;
          return (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
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
                  {item.setor || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {percentage}%
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 50, textAlign: 'right' }}>
                  {(item.total || 0).toLocaleString('pt-BR')}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// Componente de gráfico de pizza para Subnúcleos
const SubnucleosChart = ({ subnucleos }) => {
  const theme = useTheme();

  // Ordenar por total decrescente
  const sortedSubnucleos = [...subnucleos].sort((a, b) => b.total - a.total);
  const labels = sortedSubnucleos.map(item => item.subnucleo || '-');
  const data = sortedSubnucleos.map(item => item.total || 0);
  const total = data.reduce((acc, val) => acc + val, 0);

  const colors = [
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
    theme.palette.primary.main,
    theme.palette.secondary.main,
  ];

  const chartOptions = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: '#adb0bb',
    },
    colors: colors,
    labels: labels,
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
      style: {
        fontSize: '12px',
        fontWeight: 600,
      },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '55%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
            },
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
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      y: {
        formatter: (val) => val.toLocaleString('pt-BR'),
      },
    },
    stroke: {
      show: true,
      width: 3,
      colors: [theme.palette.background.paper],
    },
  };

  return (
    <Box>
      <Chart
        options={chartOptions}
        series={data}
        type="donut"
        height={280}
        width="100%"
      />
      {/* Legenda customizada com cores e totais */}
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {sortedSubnucleos.map((item, index) => {
          const percentage = total > 0 ? ((item.total / total) * 100).toFixed(1) : 0;
          return (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
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
                  {item.subnucleo || '-'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {percentage}%
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 50, textAlign: 'right' }}>
                  {(item.total || 0).toLocaleString('pt-BR')}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
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
    viewRelatorio: '',
    tipoEscala: '',
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

  // Estados para setores e subnúcleos
  const [setores, setSetores] = useState([]);
  const [subnucleos, setSubnucleos] = useState([]);

  // Buscar usuários com debounce
  useEffect(() => {
    const buscar = async () => {
      setUsuarioLoading(true);
      try {
        const response = await usuarioService.listar(0, 50, usuarioSearchTerm || '');
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

  // Função para carregar usuários ao clicar no campo
  const handleUsuarioFocus = async () => {
    if (usuarioOptions.length === 0) {
      setUsuarioLoading(true);
      try {
        const response = await usuarioService.listar(0, 50, '');
        setUsuarioOptions(response.content || []);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
      } finally {
        setUsuarioLoading(false);
      }
    }
  };

  // Buscar órgãos julgadores com debounce
  useEffect(() => {
    const buscar = async () => {
      setOrgaoJulgadorLoading(true);
      try {
        const results = await orgaoJulgadorService.buscar(orgaoJulgadorSearchTerm || '', [], 0, 50);
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

  // Função para carregar órgãos julgadores ao clicar no campo
  const handleOrgaoJulgadorFocus = async () => {
    if (orgaoJulgadorOptions.length === 0) {
      setOrgaoJulgadorLoading(true);
      try {
        const results = await orgaoJulgadorService.buscar('', [], 0, 50);
        setOrgaoJulgadorOptions(results);
      } catch (err) {
        console.error('Erro ao buscar órgãos julgadores:', err);
      } finally {
        setOrgaoJulgadorLoading(false);
      }
    }
  };

  // Atualizar tabela quando a view mudar
  useEffect(() => {
    if (buscaRealizada) {
      setPage(0);
      handleBuscarTabela(0);
    }
  }, [formData.viewRelatorio]);

  const handleBuscar = async (newPage = 0) => {
    if (!formData.dataInicio || !formData.dataFim || !formData.viewRelatorio) {
      return;
    }

    // Validação: tipoEscala é obrigatório quando viewRelatorio é ESCALA
    if (formData.viewRelatorio === 'ESCALA' && !formData.tipoEscala) {
      alert('Selecione um tipo de escala para continuar.');
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
        tipoEscala: formData.tipoEscala || null,
        view: formData.viewRelatorio,
      };

      const results = await Promise.allSettled([
        buscarDadosRelatorio(formData.viewRelatorio || 'ESCALA', filtros),
        relatorioService.buscarContestacao(filtros),
        relatorioService.buscarTotais(filtros),
        relatorioService.buscarSetores(filtros),
        relatorioService.buscarSubnucleos(filtros),
      ]);

      // Tabela (sempre deve aparecer, mesmo se outros falharem)
      const tabelaResult = results[0];
      if (tabelaResult.status === 'fulfilled') {
        setResultados(tabelaResult.value.content || []);
        setTotalElements(tabelaResult.value.totalElements || 0);
        setPage(newPage);
      } else {
        console.error('Erro ao buscar tabela:', tabelaResult.reason);
        setResultados([]);
        setTotalElements(0);
      }

      // Contestação
      const contestacaoResult = results[1];
      if (contestacaoResult.status === 'fulfilled') {
        setContestacoes(contestacaoResult.value || []);
      } else {
        console.error('Erro ao buscar contestações:', contestacaoResult.reason);
        setContestacoes([]);
      }

      // Totais
      const totaisResult = results[2];
      if (totaisResult.status === 'fulfilled') {
        setTotais(totaisResult.value || { totalAudiencias: 0, totalPautas: 0 });
      } else {
        console.error('Erro ao buscar totais:', totaisResult.reason);
        setTotais({ totalAudiencias: 0, totalPautas: 0 });
      }

      // Setores
      const setoresResult = results[3];
      if (setoresResult.status === 'fulfilled') {
        setSetores(setoresResult.value || []);
      } else {
        console.error('Erro ao buscar setores:', setoresResult.reason);
        setSetores([]);
      }

      // Subnúcleos
      const subnucleosResult = results[4];
      if (subnucleosResult.status === 'fulfilled') {
        setSubnucleos(subnucleosResult.value || []);
      } else {
        console.error('Erro ao buscar subnúcleos:', subnucleosResult.reason);
        setSubnucleos([]);
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      setResultados([]);
      setTotalElements(0);
      setContestacoes([]);
      setTotais({ totalAudiencias: 0, totalPautas: 0 });
      setSetores([]);
      setSubnucleos([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar apenas os dados da tabela (paginação)
  const [tabelaLoading, setTabelaLoading] = useState(false);
  
  const handleBuscarTabela = async (newPage, newRowsPerPage = rowsPerPage) => {
    if (!formData.dataInicio || !formData.dataFim) {
      return;
    }

    setTabelaLoading(true);
    try {
      const filtros = {
        page: newPage,
        size: newRowsPerPage,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        userId: formData.usuario?.id || null,
        orgaoJulgadorId: formData.orgaoJulgador?.id || null,
        tipoContestacao: formData.tipoContestacao || null,
        subnucleo: formData.subnucleo || null,
        classeJudicial: formData.classeJudicial || null,
        tipoEscala: formData.tipoEscala || null,
        view: formData.viewRelatorio,
      };

      const response = await buscarDadosRelatorio(formData.viewRelatorio, filtros);

      setResultados(response.content || []);
      setTotalElements(response.totalElements || 0);
      setPage(newPage);
    } catch (error) {
      console.error('Erro ao buscar tabela:', error);
    } finally {
      setTabelaLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    handleBuscarTabela(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    if (buscaRealizada) {
      handleBuscarTabela(0, newRowsPerPage);
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
      viewRelatorio: '',
      tipoEscala: '',
    });
    setResultados([]);
    setTotalElements(0);
    setPage(0);
    setBuscaRealizada(false);
    setContestacoes([]);
    setTotais({ totalAudiencias: 0, totalPautas: 0 });
    setSetores([]);
    setSubnucleos([]);
  };

  // Estado para controlar o carregamento de Excel
  const [excelLoading, setExcelLoading] = useState(false);

  const handleGerarExcel = async () => {
    if (!buscaRealizada) {
      return;
    }

    if (!formData.dataInicio || !formData.dataFim) {
      return;
    }

    setExcelLoading(true);
    try {
      const filtros = {
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        userId: formData.usuario?.id || null,
        orgaoJulgadorId: formData.orgaoJulgador?.id || null,
        tipoContestacao: formData.tipoContestacao || null,
        subnucleo: formData.subnucleo || null,
        classeJudicial: formData.classeJudicial || null,
        tipoEscala: formData.tipoEscala || null,
      };

      let blob;
      let nomeArquivo;

      const viewType = formData.viewRelatorio;
      
      if (viewType === 'AUDIENCIA') {
        blob = await relatorioService.gerarExcelAudiencia(filtros);
        nomeArquivo = `Audiencias_${formData.dataInicio}_${formData.dataFim}.xlsx`;
      } else if (viewType === 'AUDIENCIA_NAO_ENCONTRADA') {
        blob = await relatorioService.gerarExcelAudienciaNaoEncontrada(filtros);
        nomeArquivo = `Audiencias_nao_encontradas_${formData.dataInicio}_${formData.dataFim}.xlsx`;
      } else {
        blob = await relatorioService.gerarExcelEscala(filtros);
        nomeArquivo = `Escala_${formData.dataInicio}_${formData.dataFim}.xlsx`;
      }

      // Criar URL blob e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nomeArquivo);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar e baixar Excel:', error);
      alert('Erro ao gerar o arquivo Excel. Verifique o console para mais detalhes.');
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <PageContainer title="Relatório" description="Relatório de Escala">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* ==================== CAMADA 1: FILTROS ==================== */}
        <ReportCard title="Filtros">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Linha 1: Data Início, Data Fim, Tipo Relatório, Usuário */}
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
                  label="Selecionar Tipo Relatório *"
                  fullWidth
                  value={formData.viewRelatorio}
                  onChange={(e) => setFormData({ ...formData, viewRelatorio: e.target.value })}
                >
                  {VIEW_RELATORIO_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {formData.viewRelatorio === 'ESCALA' && (
                <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                  <TextField
                    select
                    label="Selecionar Tipo *"
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

              <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                <Autocomplete
                  options={usuarioOptions}
                  getOptionLabel={(option) => option.nome || ''}
                  value={formData.usuario}
                  loading={usuarioLoading}
                  onOpen={handleUsuarioFocus}
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
            </Box>

            {/* Linha 2: Órgão Julgador, Tipo Contestação, Subnúcleo, Classe Judicial */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 calc(25% - 12px)', minWidth: 180 }}>
                <Autocomplete
                  options={orgaoJulgadorOptions}
                  getOptionLabel={(option) => option.nome || ''}
                  value={formData.orgaoJulgador}
                  loading={orgaoJulgadorLoading}
                  onOpen={handleOrgaoJulgadorFocus}
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

            {/* Linha 3: Botões */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconSearch size={18} />}
                onClick={() => handleBuscar(0)}
                disabled={loading || !formData.dataInicio || !formData.dataFim || !formData.viewRelatorio || (formData.viewRelatorio === 'ESCALA' && !formData.tipoEscala)}
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
                onClick={handleGerarExcel}
                disabled={!buscaRealizada || excelLoading}
              >
                {excelLoading ? 'Gerando Excel...' : 'Gerar Excel'}
              </Button>
            </Box>
          </Box>
        </ReportCard>

        {/* ==================== CAMADA 2: TOTAIS + SUBNÚCLEO + CONTESTAÇÃO ==================== */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : buscaRealizada && (totais.totalAudiencias > 0 || totais.totalPautas > 0 || subnucleos.length > 0 || contestacoes.length > 0) && (
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'stretch' }}>
            {/* INÍCIO: Totais empilhados */}
            {(totais.totalAudiencias > 0 || totais.totalPautas > 0) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: 220, flexShrink: 0 }}>
                {totais.totalAudiencias > 0 && (
                  <ReportCard title="Total de Audiências">
                    <Typography variant="h3" fontWeight={700}>
                      {totais.totalAudiencias.toLocaleString('pt-BR')}
                    </Typography>
                  </ReportCard>
                )}
                {totais.totalPautas > 0 && (
                  <ReportCard title="Total de Pautas">
                    <Typography variant="h3" fontWeight={700}>
                      {totais.totalPautas.toLocaleString('pt-BR')}
                    </Typography>
                  </ReportCard>
                )}
              </Box>
            )}

            {/* MEIO: Subnúcleos */}
            {subnucleos.length > 0 && (
              <Box sx={{ flex: 1, minWidth: 280 }}>
                <ReportCard title="Distribuição por Subnúcleo">
                  <SubnucleosChart subnucleos={subnucleos} />
                </ReportCard>
              </Box>
            )}

            {/* FIM: Contestações - MAIOR CARD */}
            {contestacoes.length > 0 && (
              <Box sx={{ flex: 2, minWidth: 350 }}>
                <ReportCard title="Contestações por Tipo">
                  <ContestacaoChart contestacoes={contestacoes} />
                </ReportCard>
              </Box>
            )}
          </Box>
        )}

        {/* ==================== CAMADA 3: TABELA DE AUDIÊNCIAS ==================== */}
        {buscaRealizada && !loading && (
          <ReportCard title="Audiências">
            <Box sx={{ overflowX: 'auto', width: '100%', position: 'relative' }}>
              {/* Overlay de loading para paginação */}
              {tabelaLoading && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    bgcolor: 'rgba(255, 255, 255, 0.7)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              )}
              <Table aria-label="tabela de relatório">
                <TableHead>
                  <TableRow>
                    {getColumnasRelatorio(formData.viewRelatorio || 'ESCALA').map((coluna) => (
                      <TableCell key={coluna.id} align="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          {coluna.label}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultados.length > 0 ? (
                    resultados.map((item) => (
                      <TableRow key={item.id || item.audienciaId}>
                        {getColumnasRelatorio(formData.viewRelatorio || 'ESCALA').map((coluna) => (
                          <TableCell key={coluna.id} align="center">
                            {renderCellContent(coluna.id, item[coluna.field])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={getColumnasRelatorio(formData.viewRelatorio || 'ESCALA').length} align="center">
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
