import React from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

// components
import PautaOverview from './components/PautaOverview';
import TotaisCards from './components/TotaisCards';
import ContestacaoOverview from './components/ContestacaoOverview';
import BrazilMapOverview from './components/BrazilMapOverview';
import SubnucleoOverview from './components/SubnucleoOverview';


const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          {/* Row 1: Subnúcleo + Contestação */}
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <SubnucleoOverview />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <ContestacaoOverview />
          </Grid>
          {/* Row 2: Totais Cards */}
          <Grid size={12}>
            <TotaisCards />
          </Grid>
          {/* Row 3: Pautas + Mapa */}
          <Grid
            size={{
              xs: 12,
              lg: 6
            }}>
            <PautaOverview />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 6
            }}>
            <BrazilMapOverview />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
