import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import DashboardCard from '../../../components/shared/DashboardCard';
import api from '../../../services/api';

const TotaisCards = () => {
    const [totais, setTotais] = useState({
        totalPautas: 0,
        totalAudiencias: 0,
        totalOrgaosJulgadores: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTotais = async () => {
            try {
                const response = await api.get('/dashboard/totais');
                if (response) {
                    setTotais({
                        totalPautas: response.totalPautas || 0,
                        totalAudiencias: response.totalAudiencias || 0,
                        totalOrgaosJulgadores: response.totalOrgaosJulgadores || 0,
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar totais:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTotais();
    }, []);

    if (loading) {
        return (
            <Stack spacing={3}>
                {[1, 2, 3].map((item) => (
                    <DashboardCard key={item}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={24} />
                        </Box>
                    </DashboardCard>
                ))}
            </Stack>
        );
    }

    return (
        <Stack spacing={3}>
            {/* Card Total Pautas */}
            <DashboardCard title="Total de Pautas">
                <Typography variant="h3" fontWeight={700}>
                    {totais.totalPautas.toLocaleString('pt-BR')}
                </Typography>
            </DashboardCard>

            {/* Card Total Audiências */}
            <DashboardCard title="Total de Audiências">
                <Typography variant="h3" fontWeight={700}>
                    {totais.totalAudiencias.toLocaleString('pt-BR')}
                </Typography>
            </DashboardCard>

            {/* Card Total Órgãos Julgadores */}
            <DashboardCard title="Órgãos Julgadores">
                <Typography variant="h3" fontWeight={700}>
                    {totais.totalOrgaosJulgadores.toLocaleString('pt-BR')}
                </Typography>
            </DashboardCard>
        </Stack>
    );
};

export default TotaisCards;
