import React from 'react';
import { Box, Avatar, Typography, IconButton, Divider } from '@mui/material';
import { IconLogout } from '@tabler/icons-react';
import useAuth from '../../../hooks/useAuth';

const Upgrade = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <Box sx={{ p: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'rgba(93, 135, 255, 0.08)',
                }}
            >
                <Avatar
                    sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        fontSize: '1rem',
                        fontWeight: 600,
                    }}
                >
                    {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        noWrap
                        sx={{ color: 'text.primary' }}
                    >
                        {user?.nome || 'Usuário'}
                    </Typography>
                    <Typography
                        variant="caption"
                        noWrap
                        sx={{ color: 'text.secondary', display: 'block' }}
                    >
                        {user?.email || ''}
                    </Typography>
                </Box>
                <IconButton
                    size="small"
                    onClick={handleLogout}
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            color: 'error.main',
                            backgroundColor: 'rgba(255, 77, 79, 0.08)',
                        },
                    }}
                    title="Sair"
                >
                    <IconLogout size={20} />
                </IconButton>
            </Box>
        </Box>
    );
};

export default Upgrade;