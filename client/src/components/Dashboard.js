import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import axios from 'axios';

const fetchProductStock = async () => {
  const { data } = await axios.get('/api/products');
  // Assuming API returns an array of products with { id, name, stock }
  return data;
};

const Dashboard = () => {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['productsStock'],
    queryFn: fetchProductStock,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  return (
    <Container maxWidth="xl" sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', p: 3, color: 'black' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        Stock Analysis Dashboard
      </Typography>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#1976d2' }} />
        </Box>
      )}

      {isError && (
        <Typography color="error" sx={{ mt: 4 }}>
          Error fetching product stock data: {error.message}
        </Typography>
      )}

      {data && data.length > 0 && (
        <Box sx={{ mt: 6, height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Products with Stock Levels
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid stroke="#ddd" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: '#1976d2' }} />
              <YAxis tick={{ fill: '#1976d2' }} />
              <Tooltip contentStyle={{ backgroundColor: '#f0f0f0', borderRadius: 8 }} />
              <Legend wrapperStyle={{ color: '#1976d2' }} />
              <Bar dataKey="stock" fill="#1976d2" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      {!isLoading && data && data.length === 0 && (
        <Typography sx={{ mt: 4 }}>
          No product stock data available.
        </Typography>
      )}
    </Container>
  );
};

export default Dashboard;