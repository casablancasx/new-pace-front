import React, { useState, useEffect } from 'react';
import { Select, MenuItem, Box, FormControl } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardCard from '../../../components/shared/DashboardCard';
import Chart from 'react-apexcharts';
import api from '../../../services/api';

const SalesOverview = () => {
    // theme
    const theme = useTheme();
    const primary = theme.palette.primary.main;
    const secondary = theme.palette.secondary.main;

    // states
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'year'
    const [month, setMonth] = useState('8'); // Default to August
    const [year, setYear] = useState('2025');
    const [chartData, setChartData] = useState({
        categories: [],
        series: []
    });

    // fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams();
                params.append('view', viewMode);
                params.append('year', year);
                if (viewMode === 'month') {
                    params.append('month', month);
                }

                const response = await api.get(`/dashboard/overview?${params.toString()}`);
                if (response) {
                    setChartData({
                        categories: response.categories || [],
                        series: response.series || []
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar dados do gráfico:', error);
            }
        };

        fetchData();
    }, [viewMode, month, year]);

    // chart options
    const optionscolumnchart = {
        chart: {
            type: 'bar',
            fontFamily: "'Plus Jakarta Sans', sans-serif;",
            foreColor: '#adb0bb',
            toolbar: { show: true },
            height: 370,
        },
        colors: [primary, secondary],
        plotOptions: {
            bar: {
                horizontal: false,
                barHeight: '60%',
                columnWidth: '42%',
                borderRadius: [6],
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'all',
            },
        },
        stroke: {
            show: true,
            width: 5,
            lineCap: "butt",
            colors: ["transparent"],
        },
        dataLabels: { enabled: false },
        legend: { show: true },
        grid: {
            borderColor: 'rgba(0,0,0,0.1)',
            strokeDashArray: 3,
            xaxis: { lines: { show: false } },
        },
        yaxis: { tickAmount: 4 },
        xaxis: {
            categories: chartData.categories,
            axisBorder: { show: false },
        },
        tooltip: {
            theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
            fillSeriesColor: false,
        },
    };

    return (
        <DashboardCard 
            title="Pautas Overview" 
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
                            <MenuItem value="2023">2023</MenuItem>
                            <MenuItem value="2024">2024</MenuItem>
                            <MenuItem value="2025">2025</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            }
        >
            <Chart
                options={optionscolumnchart}
                series={chartData.series}
                type="bar"
                height="370px"
            />
        </DashboardCard>
    );
};

export default SalesOverview;
