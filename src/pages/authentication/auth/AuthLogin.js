import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    FormGroup,
    FormControlLabel,
    Button,
    Stack,
    Checkbox,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router';
import useAuth from '../../../hooks/useAuth';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';

const AuthLogin = ({ title, subtitle, subtext }) => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loginSuccess, setLoginSuccess] = useState(false);

    // Navegar quando isAuthenticated mudar para true após login bem-sucedido
    useEffect(() => {
        if (loginSuccess && isAuthenticated) {
            navigate('/dashboard');
        }
    }, [loginSuccess, isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!email || !password) {
            setError('Preencha todos os campos');
            return;
        }

        setLoading(true);
        
        try {
            await login(email, password);
            setLoginSuccess(true);
        } catch (err) {
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {title ? (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            ) : null}

            {subtext}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Stack>
                <Box>
                    <Typography 
                        variant="subtitle1"
                        fontWeight={600} 
                        component="label" 
                        htmlFor='email' 
                        mb="5px"
                    >
                        Email
                    </Typography>
                    <CustomTextField 
                        id="email" 
                        type="email"
                        variant="outlined" 
                        fullWidth 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </Box>
                <Box mt="25px">
                    <Typography 
                        variant="subtitle1"
                        fontWeight={600} 
                        component="label" 
                        htmlFor='password' 
                        mb="5px"
                    >
                        Senha
                    </Typography>
                    <CustomTextField 
                        id="password" 
                        type="password" 
                        variant="outlined" 
                        fullWidth 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </Box>
                <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox 
                                    checked={rememberMe} 
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={loading}
                                />
                            }
                            label="Lembrar-me"
                        />
                    </FormGroup>
                </Stack>
            </Stack>
            <Box>
                <Button
                    color="primary"
                    variant="contained"
                    size="large"
                    fullWidth
                    type="submit"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
                </Button>
            </Box>
            {subtitle}
        </form>
    );
};

export default AuthLogin;
