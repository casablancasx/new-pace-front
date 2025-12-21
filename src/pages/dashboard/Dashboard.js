import React from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

// components
import PautaOverview from './components/PautaOverview';
import TotaisCards from './components/TotaisCards';
import ContestacaoOverview from './components/ContestacaoOverview';
import BrazilMapOverview from './components/BrazilMapOverview';


const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              lg: 12
            }}>
            <PautaOverview />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <TotaisCards />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <ContestacaoOverview />
          </Grid>
          <Grid size={12}>
            <BrazilMapOverview />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
