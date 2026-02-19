import React from 'react';
import { Grid, Box, Card, Typography, Button } from '@mui/material';

// components
import PageContainer from 'src/components/container/PageContainer';
import AuthLogin from './auth/AuthLogin';
import buildingBg from 'src/assets/images/backgrounds/predio-agu.jpg';

const Login2 = () => {
  
  return (
    <PageContainer title="Login" description="Sistema PACE - AGU">
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* ===== LADO ESQUERDO: IMAGEM + OVERLAY ===== */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: 1,
            position: 'relative',
            backgroundImage: `url(${buildingBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(10, 36, 99, 0.88) 0%, rgba(31, 41, 55, 0.80) 100%)',
            },
          }}
        >
          {/* Conteúdo sobre a imagem */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              px: { md: 6, lg: 10 },
              maxWidth: 560,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: '#fff',
                fontWeight: 800,
                lineHeight: 1.25,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
            Programa de Agendamento e Controle de Escalas
            </Typography>


    
          </Box>
        </Box>

        {/* ===== LADO DIREITO: FORMULÁRIO ===== */}
        <Box
          sx={{
            width: { xs: '100%', md: '480px', lg: '520px' },
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FAFBFC',
            px: { xs: 3, sm: 5 },
            py: 4,
            // Background para mobile (sem o painel esquerdo)
            backgroundImage: { xs: `url(${buildingBg})`, md: 'none' },
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              display: { xs: 'block', md: 'none' },
              position: 'absolute',
              inset: 0,
              background: 'rgba(250,251,252,0.93)',
            },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 2 }}>
            {/* Logo + Título */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Box sx={{ mb: 2 }}>
                <img
                  src="/src/assets/images/logos/logodopace.png"
                  alt="PACE Logo"
                  style={{ maxWidth: 200, height: 'auto' }}
                />
              </Box>

              
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                Acesse com suas credenciais da rede AGU
              </Typography>
            </Box>

            {/* Formulário */}
            <AuthLogin />

            
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

export default Login2;
