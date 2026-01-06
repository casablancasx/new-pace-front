import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import DashboardCard from '../../../components/shared/DashboardCard';
import { ReactComponent as BrazilMap } from '../../../assets/images/svgs/brazil.svg';
import { useTheme } from '@mui/material/styles';
import api from '../../../services/api';

const BrazilMapOverview = () => {
    const theme = useTheme();
    
    // Generate years array dynamically (from 2023 to current year)
    const currentYear = new Date().getFullYear();
    const startYear = 2025
    const years = Array.from(
        { length: currentYear - startYear + 1 },
        (_, i) => startYear + i
    );

    const [year, setYear] = useState(currentYear.toString());
    const [month, setMonth] = useState('8');
    const [viewMode, setViewMode] = useState('year'); // 'month' | 'year'
    const [metricMode, setMetricMode] = useState('general'); // 'general' | 'priority'
    const [mapData, setMapData] = useState({});
    const [hoveredState, setHoveredState] = useState(null);
    const [selectedState, setSelectedState] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Lista ordenada de UFs
    const stateOrder = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

    const getSortedStatesData = () => {
        return stateOrder
            .map(uf => ({ uf, stateId: `BR-${uf}`, ...mapData[`BR-${uf}`] }))
            .filter(state => state.pautas !== undefined || state.audiencias !== undefined);
    };

    // Mock data function (replace with API call)
    const fetchMapData = async () => {
        try {
            const params = new URLSearchParams({
                view: viewMode,
                year: year
            });
            
            if (viewMode === 'month') {
                params.append('month', month);
            }

            const response = await api.get(`/dashboard/map-overview?${params.toString()}`);
            const rawData = response.data || response;

            // Transform array to object map: 'BR-UF' -> data
            const transformedData = {};
            if (Array.isArray(rawData)) {
                rawData.forEach(item => {
                    transformedData[`BR-${item.uf}`] = item;
                });
            }
            
            setMapData(transformedData);
        } catch (error) {
            console.error("Error fetching map data:", error);
        }
    };

    useEffect(() => {
        fetchMapData();
    }, [year, month, viewMode, metricMode]);

    const getColor = (stateId) => {
        const data = mapData[stateId];
        if (!data) return '#e0e0e0'; // Default gray

        const isPriority = metricMode === 'priority';
        
        if (isPriority) {
            // Priority mode - based on audiencias count
            const value = data.audiencias;
            
            if (value >= 40) return '#b71c1c'; // Critical (Dark Red)
            if (value >= 20) return '#f44336'; // High (Red)
            if (value >= 10) return '#e57373'; // Medium (Light Red)
            if (value >= 1) return '#ffcdd2'; // Low (Very Light Red)
            return '#e0e0e0';
        } else {
            // General mode - based on pautas + audiencias
            const value = data.pautas + data.audiencias;
            if (value >= 40) return theme.palette.primary.dark;
            if (value >= 20) return theme.palette.primary.main;
            if (value >= 5) return theme.palette.primary.light;
            if (value >= 1) return '#bbdefb'; // Very light blue
            return '#e0e0e0';
        }
    };

    const handleMouseMove = (event) => {
        // Update tooltip position
        setTooltipPos({ x: event.clientX + 15, y: event.clientY + 15 });

        const stateId = event.target.id;
        if (stateId && stateId.startsWith('BR-')) {
            setHoveredState(stateId);
        } else {
            setHoveredState(null);
        }
    };

    const handleMouseLeave = () => {
        setHoveredState(null);
    };

    const handleStateClick = (stateId) => {
        setSelectedState(selectedState === stateId ? null : stateId);
    };

    return (
        <DashboardCard 
            title="Distribuição Regional"
            action={
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small">
                        <Select
                            value={metricMode}
                            onChange={(e) => setMetricMode(e.target.value)}
                        >
                            <MenuItem value="general">Visão Geral</MenuItem>
                            <MenuItem value="priority">Prioritárias</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small">
                        <Select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
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
                            >
                                <MenuItem value="1">Jan</MenuItem>
                                <MenuItem value="2">Fev</MenuItem>
                                <MenuItem value="3">Mar</MenuItem>
                                <MenuItem value="4">Abr</MenuItem>
                                <MenuItem value="5">Mai</MenuItem>
                                <MenuItem value="6">Jun</MenuItem>
                                <MenuItem value="7">Jul</MenuItem>
                                <MenuItem value="8">Ago</MenuItem>
                                <MenuItem value="9">Set</MenuItem>
                                <MenuItem value="10">Out</MenuItem>
                                <MenuItem value="11">Nov</MenuItem>
                                <MenuItem value="12">Dez</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    <FormControl size="small">
                        <Select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
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
            <Box sx={{ display: 'flex', gap: 2, height: '500px' }}>
                {/* Mapa */}
                <Box 
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    sx={{ 
                        flex: 1,
                        display: 'flex', 
                        justifyContent: 'center', 
                        position: 'relative',
                        '& svg': {
                            height: '100%',
                            width: 'auto',
                            '& path': {
                                transition: 'fill 0.3s',
                                cursor: 'pointer',
                                stroke: '#fff',
                                strokeWidth: 1
                            },
                            '& path:hover': {
                                opacity: 0.8,
                                stroke: '#333'
                            }
                        }
                    }}
                >
                    <style>
                        {Object.keys(mapData).map(stateId => `
                            #${stateId} {
                                fill: ${getColor(stateId)} !important;
                                ${selectedState === stateId ? 'stroke: #333 !important; stroke-width: 2 !important;' : ''}
                            }
                        `).join('\n')}
                    </style>
                    <BrazilMap />
                    
                    {hoveredState && mapData[hoveredState] && (
                        <Box
                            sx={{
                                position: 'fixed',
                                top: tooltipPos.y,
                                left: tooltipPos.x,
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                color: '#fff',
                                padding: '12px',
                                borderRadius: '8px',
                                pointerEvents: 'none',
                                zIndex: 9999,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                minWidth: '150px'
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, borderBottom: '1px solid rgba(255,255,255,0.2)', pb: 0.5 }}>
                                {hoveredState.replace('BR-', '')}
                            </Typography>
                            
                            {metricMode === 'priority' ? (
                                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    Audiências: <strong>{mapData[hoveredState].audiencias}</strong>
                                </Typography>
                            ) : (
                                <>
                                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        Pautas: <strong>{mapData[hoveredState].pautas}</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        Audiências: <strong>{mapData[hoveredState].audiencias}</strong>
                                    </Typography>
                                </>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Tabela de estados */}
                <TableContainer component={Paper} sx={{ width: 280, maxHeight: '100%', overflowY: 'auto' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.primary.main, color: '#fff' }}>UF</TableCell>
                                {metricMode === 'priority' ? (
                                    <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.primary.main, color: '#fff' }}>Audiências</TableCell>
                                ) : (
                                    <>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.primary.main, color: '#fff' }}>Pautas</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: theme.palette.primary.main, color: '#fff' }}>Aud.</TableCell>
                                    </>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {getSortedStatesData().map((state) => (
                                <TableRow
                                    key={state.stateId}
                                    onClick={() => handleStateClick(state.stateId)}
                                    onMouseEnter={() => setHoveredState(state.stateId)}
                                    onMouseLeave={() => setHoveredState(null)}
                                    sx={{
                                        cursor: 'pointer',
                                        backgroundColor: selectedState === state.stateId ? 'rgba(25, 103, 210, 0.15)' : hoveredState === state.stateId ? 'rgba(25, 103, 210, 0.05)' : 'transparent',
                                        '&:hover': { backgroundColor: 'rgba(25, 103, 210, 0.08)' },
                                        borderLeft: selectedState === state.stateId ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent'
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: selectedState === state.stateId ? 'bold' : 'normal' }}>
                                        {state.uf}
                                    </TableCell>
                                    {metricMode === 'priority' ? (
                                        <TableCell align="right">{state.audiencias || 0}</TableCell>
                                    ) : (
                                        <>
                                            <TableCell align="right">{state.pautas || 0}</TableCell>
                                            <TableCell align="right">{state.audiencias || 0}</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </DashboardCard>
    );
};

export default BrazilMapOverview;
