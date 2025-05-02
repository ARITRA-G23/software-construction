import React, { useState } from 'react';
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
    Link,
    Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    name: Yup.string()
        .required('Name is required'),
    email: Yup.string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password should be of minimum 6 characters length')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
});

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [error, setError] = useState('');
    const [role, setRole] = useState('customer');
    const [adminSecret, setAdminSecret] = useState('');

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                setError('');
                await register(values.name, values.email, values.password, role, adminSecret);
                toast.success('Registration successful!');
                navigate('/products');
            } catch (error) {
                console.error('Registration error:', error);
                setError(error.message || 'Registration failed');
                toast.error(error.message || 'Registration failed');
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
                        Register
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            fullWidth
                            id="name"
                            name="name"
                            label="Name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            margin="normal"
                            InputLabelProps={{ style: { color: '#1976d2' } }}
                            inputProps={{ style: { color: '#000000' } }}
                            sx={{ backgroundColor: '#f0f0f0', borderRadius: 1 }}
                        />
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
                        <TextField
                            fullWidth
                            id="confirmPassword"
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            margin="normal"
                            InputLabelProps={{ style: { color: '#1976d2' } }}
                            inputProps={{ style: { color: '#000000' } }}
                            sx={{ backgroundColor: '#f0f0f0', borderRadius: 1 }}
                        />
                        <TextField
                            select
                            fullWidth
                            id="role"
                            name="role"
                            label="Role"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            margin="normal"
                            SelectProps={{ native: true }}
                            InputLabelProps={{ style: { color: '#1976d2' } }}
                            sx={{ backgroundColor: '#f0f0f0', borderRadius: 1 }}
                        >
                            <option value="customer">Customer</option>
                            <option value="admin">Administrator</option>
                        </TextField>
                        {role === 'admin' && (
                            <TextField
                                fullWidth
                                id="adminSecret"
                                name="adminSecret"
                                label="Admin Secret Password"
                                type="password"
                                value={adminSecret}
                                onChange={e => setAdminSecret(e.target.value)}
                                margin="normal"
                                InputLabelProps={{ style: { color: '#1976d2' } }}
                                inputProps={{ style: { color: '#000000' } }}
                                sx={{ backgroundColor: '#f0f0f0', borderRadius: 1 }}
                            />
                        )}
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
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? 'Signing Up...' : 'Sign Up'}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link component={RouterLink} to="/login" variant="body2" sx={{ color: '#1976d2' }}>
                                {"Already have an account? Sign In"}
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;