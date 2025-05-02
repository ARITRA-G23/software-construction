import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const BulkUpload = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = async (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const response = await api.post(
                `/api/bulk/${type}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            setResults(response.data.results || []);
            toast.success('Bulk upload completed');
        } catch (error) {
            console.error('Bulk upload error:', error);
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Bulk Upload Products
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Upload your products using CSV or Excel files. Make sure your file includes the following columns:
                    name, description, price, category, and stock.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadIcon />}
                        disabled={loading}
                    >
                        Upload CSV
                        <input
                            type="file"
                            hidden
                            accept=".csv"
                            onChange={(e) => handleFileUpload(e, 'csv')}
                        />
                    </Button>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadIcon />}
                        disabled={loading}
                    >
                        Upload Excel
                        <input
                            type="file"
                            hidden
                            accept=".xlsx,.xls"
                            onChange={(e) => handleFileUpload(e, 'excel')}
                        />
                    </Button>
                </Box>

                {results.length > 0 && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Product Name</TableCell>
                                    <TableCell>Message</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {result.success ? (
                                                <Alert severity="success">Success</Alert>
                                            ) : (
                                                <Alert severity="error">Error</Alert>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {result.product?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {result.error || 'Uploaded successfully'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
};

export default BulkUpload; 