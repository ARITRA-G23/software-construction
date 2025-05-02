import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ProductList from './components/ProductList';
import BulkUpload from './components/BulkUpload';
import Dashboard from './components/Dashboard';

const queryClient = new QueryClient();

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <div>
                        <Routes>
                            {/* Public Routes */}
                            <Route 
                                path="/login" 
                                element={<Login />} 
                            />
                            <Route 
                                path="/register" 
                                element={<Register />} 
                            />
                            {/* Protected Routes */}
                            <Route
                                path="/dashboard"
                                element={
                                    <PrivateRoute>
                                        <Layout>
                                            <Dashboard />
                                        </Layout>
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/products"
                                element={
                                    <PrivateRoute>
                                        <Layout>
                                            <ProductList />
                                        </Layout>
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/bulk-upload"
                                element={
                                    <PrivateRoute>
                                        <Layout>
                                            <BulkUpload />
                                        </Layout>
                                    </PrivateRoute>
                                }
                            />
                            {/* Default Route */}
                            <Route 
                                path="/" 
                                element={<Navigate to="/login" replace />} 
                            />
                        </Routes>
                        <ToastContainer />
                    </div>
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default App;
