import React, { useState, useEffect } from 'react';
import { Select, MenuItem, Box, FormControl, Typography, Stack, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '../../../components/shared/DashboardCard';
import Chart from 'react-apexcharts';
import api from '../../../services/api';
import { IconRefresh } from '@tabler/icons-react';

const SubnucleoOverview = () => {
    const theme = useTheme();

    // Generate years array dynamically (from 2025 to current year)
    const currentYear = new Date().getFullYear();
    const startYear = 2025;
    const years = Array.from(
        { length: currentYear - startYear + 1 },
        (_, i) => startYear + i
    );

    // states
    const [viewMode, setViewMode] = useState('year');
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
    const [year, setYear] = useState(currentYear.toString());
    const [itens, setItens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // fetch data
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('view', viewMode);
            params.append('year', year);
            if (viewMode === 'month') {
                params.append('month', month);
            }
            const response = await api.get(`/dashboard/subnucleo-overview?${params.toString()}`);
            if (response && response.itens) {
                setItens(response.itens);
            } else {
                setItens([]);
            }
        } catch (err) {
            console.error('Erro ao buscar dados de subnúcleo:', err);
            setError(err.message || 'Erro ao carregar dados.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [viewMode, month, year]);

    // Colors palette for pie chart — varied hues
    const chartColors = [
        '#6C5CE7',  // roxo
        '#00B894',  // verde esmeralda
        '#FDCB6E',  // amarelo
        '#E17055',  // coral
        '#0984E3',  // azul
        '#E84393',  // rosa
        '#00CEC9',  // turquesa
        '#F39C12',  // laranja
        '#8E44AD',  // púrpura
        '#2ECC71',  // verde
    ];

    // Chart config
    const labels = itens.map((item) => item.descricao);
    const series = itens.map((item) => item.total);
    const totalGeral = series.reduce((acc, val) => acc + val, 0);

    const optionspiechart = {
        chart: {
            type: 'donut',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: { show: false },
        },
        colors: chartColors.slice(0, itens.length),
        labels: labels,
        plotOptions: {
            pie: {
                startAngle: 0,
                endAngle: 360,
                donut: {
                    size: '70%',
                    background: 'transparent',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '14px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            color: '#adb0bb',
                            offsetY: -10,
                            formatter: () => 'Total',
                        },
                        value: {
                            show: true,
                            fontSize: '28px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700,
                            color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                            offsetY: 5,
                            formatter: () => totalGeral.toLocaleString('pt-BR'),
                        },
                        total: {
                            show: true,
                            showAlways: true,
                            label: 'Total',
                            fontSize: '14px',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            color: '#adb0bb',
                            formatter: () => totalGeral.toLocaleString('pt-BR'),
                        },
                    },
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: true,
            position: 'bottom',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            fillSeriesColor: false,
            y: {
                formatter: function (val) {
                    return val.toLocaleString('pt-BR');
                },
            },
        },
        stroke: {
            show: false,
        },
        responsive: [
            {
                breakpoint: 991,
                options: {
                    chart: { width: '100%' },
                    legend: { position: 'bottom' },
                },
            },
        ],
    };

    // Render content based on state
    const renderContent = () => {
        if (loading) {
            return (
                <Box>
                    <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto', mb: 2 }} />
                    <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                    <Skeleton variant="text" width="40%" sx={{ mx: 'auto' }} />
                </Box>
            );
        }

        if (error) {
            return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="subtitle1" color="error" gutterBottom>
                        {error}
                    </Typography>
                    <Box
                        component="button"
                        onClick={fetchData}
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: theme.palette.primary.main,
                            borderRadius: '8px',
                            px: 2,
                            py: 1,
                            backgroundColor: 'transparent',
                            color: theme.palette.primary.main,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: '0.875rem',
                            '&:hover': {
                                backgroundColor: theme.palette.primary.light,
                            },
                        }}
                    >
                        <IconRefresh size={18} />
                        Tentar novamente
                    </Box>
                </Box>
            );
        }

        if (itens.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="subtitle1" color="textSecondary">
                        Nenhum dado disponível para o período selecionado.
                    </Typography>
                </Box>
            );
        }

        return (
            <Chart
                options={optionspiechart}
                series={series}
                type="donut"
                height="370px"
            />
        );
    };

    return (
        <DashboardCard
            title="Subnúcleo"
            action={
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small">
                        <Select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            displayEmpty
                            inputProps={{ 'aria-label': 'View Mode' }}
                        >
                            <MenuItem value="month">Por Mês</MenuItem>
                            <MenuItem value="year">Por Ano</MenuItem>
                        </Select>
                    </FormControl>

                    {viewMode === 'month' && (
                        <FormControl size="small">
                            <Select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Month' }}
                            >
                                <MenuItem value="1">Janeiro</MenuItem>
                                <MenuItem value="2">Fevereiro</MenuItem>
                                <MenuItem value="3">Março</MenuItem>
                                <MenuItem value="4">Abril</MenuItem>
                                <MenuItem value="5">Maio</MenuItem>
                                <MenuItem value="6">Junho</MenuItem>
                                <MenuItem value="7">Julho</MenuItem>
                                <MenuItem value="8">Agosto</MenuItem>
                                <MenuItem value="9">Setembro</MenuItem>
                                <MenuItem value="10">Outubro</MenuItem>
                                <MenuItem value="11">Novembro</MenuItem>
                                <MenuItem value="12">Dezembro</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    <FormControl size="small">
                        <Select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Year' }}
                        >
                            {years.map((y) => (
                                <MenuItem key={y} value={y.toString()}>
                                    {y}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            }
        >
            {renderContent()}
        </DashboardCard>
    );
};

export default SubnucleoOverview;
