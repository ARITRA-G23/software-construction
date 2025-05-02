import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Link
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password should be of minimum 6 characters length')
        .required('Password is required'),
});

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                await login(values.email, values.password);
                toast.success('Login successful!');
                navigate('/products');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Login failed');
            }
        },
    });

    return (
        <Container component="main" maxWidth="xs" sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    marginTop: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    padding: 4,
                }}
            >
                <Typography component="h1" variant="h3" align="center" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 4, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
                    E-commerce Product Manager
                </Typography>
                <Paper elevation={8} sx={{ p: 5, width: '100%', backgroundColor: '#ffffff', borderRadius: 3 }}>
                    <Typography component="h2" variant="h5" align="center" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                        Login
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            id="email"
                            name="email"
                            label="Email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            margin="normal"
                            InputLabelProps={{ style: { color: '#1976d2' } }}
                            inputProps={{ style: { color: '#000000' } }}
                            sx={{ backgroundColor: '#f0f0f0', borderRadius: 1 }}
                        />
                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            margin="normal"
                            InputLabelProps={{ style: { color: '#1976d2' } }}
                            inputProps={{ style: { color: '#000000' } }}
                            sx={{ backgroundColor: '#f0f0f0', borderRadius: 1 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                mb: 2,
                                backgroundColor: '#1976d2',
                                color: '#ffffff',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: '#1565c0',
                                },
                            }}
                        >
                            Sign In
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link component={RouterLink} to="/register" variant="body2" sx={{ color: '#1976d2' }}>
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;