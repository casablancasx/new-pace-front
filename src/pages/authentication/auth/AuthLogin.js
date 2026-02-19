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
    CircularProgress,
    InputAdornment,
    IconButton,
    Link,
    Backdrop,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { IconMail, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';
import useAuth from '../../../hooks/useAuth';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';

const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#fff',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        '& fieldset': { borderColor: '#E5E7EB' },
        '&:hover fieldset': { borderColor: '#0A2463' },
        '&.Mui-focused fieldset': {
            borderColor: '#0A2463',
            borderWidth: '1.5px',
        },
        '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(10,36,99,0.08)',
        },
    },
    '& .MuiOutlinedInput-input::placeholder': {
        color: '#9CA3AF',
        opacity: 1,
    },
};

const AuthLogin = ({ title, subtitle, subtext }) => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            {/* Loading Backdrop */}
            <Backdrop
                sx={{
                    color: '#fff',
                    backgroundColor: 'rgba(10, 36, 99, 0.7)',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    borderRadius: '10px',
                }}
                open={loading}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CircularProgress color="inherit" size={50} />
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                        Autenticando...
                    </Typography>
                </Box>
            </Backdrop>

            {title ? (
                <Typography fontWeight="700" variant="h3" mb={2} color="#0A2463">
                    {title}
                </Typography>
            ) : null}

            {subtext}

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2.5,
                        borderRadius: '10px',
                        animation: 'fadeSlideDown .3s ease',
                        '@keyframes fadeSlideDown': {
                            from: { opacity: 0, transform: 'translateY(-8px)' },
                            to:   { opacity: 1, transform: 'translateY(0)' },
                        },
                    }}
                >
                    {error}
                </Alert>
            )}

            <Stack spacing={2.5}>
                {/* Email */}
                <Box>
                    <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        component="label"
                        htmlFor="email"
                        sx={{ color: '#1F2937', display: 'block', mb: '6px' }}
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
                        placeholder="seu.email@agu.gov.br"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconMail size={18} color="#9CA3AF" />
                                </InputAdornment>
                            ),
                        }}
                        sx={fieldSx}
                    />
                </Box>

                {/* Senha */}
                <Box>
                    <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        component="label"
                        htmlFor="password"
                        sx={{ color: '#1F2937', display: 'block', mb: '6px' }}
                    >
                        Senha
                    </Typography>
                    <CustomTextField
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        placeholder="••••••••"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <IconLock size={18} color="#9CA3AF" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        disabled={loading}
                                        sx={{ color: '#9CA3AF', '&:hover': { color: '#0A2463' } }}
                                    >
                                        {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={fieldSx}
                    />
                </Box>

                {/* Lembrar-me + Esqueceu a senha? */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={loading}
                                    sx={{
                                        color: '#D1D5DB',
                                        '&.Mui-checked': { color: '#0A2463' },
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                    Lembrar-me
                                </Typography>
                            }
                        />
                    </FormGroup>
                    <Link
                        href="https://passwordreset.microsoftonline.com/passwordreset#!/"
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none"
                        sx={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#0A2463',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        Esqueceu a senha?
                    </Link>
                </Box>
            </Stack>

            {/* Botão Entrar */}
            <Box sx={{ mt: 1 }}>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    type="submit"
                    disabled={loading}
                    sx={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        py: 1.4,
                        borderRadius: '10px',
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #0A2463 0%, #1F2937 100%)',
                        boxShadow: '0 4px 14px rgba(10,36,99,0.30)',
                        transition: 'all 0.25s ease',
                        '&:hover:not(:disabled)': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px rgba(10,36,99,0.38)',
                        },
                        '&:active:not(:disabled)': {
                            transform: 'translateY(0)',
                        },
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
                </Button>
            </Box>

            {subtitle}
        </form>
    );
};

export default AuthLogin;
