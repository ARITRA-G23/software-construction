import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    Pagination,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Avatar,
    Divider,
    Paper
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Add as AddIcon, 
    Person as PersonIcon
} from '@mui/icons-material';
import ProductForm from './ProductForm';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import { useSnackbar } from 'notistack';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [detailProduct, setDetailProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const fetchProducts = async (pageNum = page) => {
        try {
            setLoading(true);
            const response = await api.get('/api/products');
            console.log('Full API Response:', response);
            console.log('Response Data:', response.data);
            
            // Log detailed product information
            if (response.data && Array.isArray(response.data)) {
                console.log('First product full details:', response.data[0]);
                console.log('First product image data:', response.data[0]?.images);
            } else if (response.data && response.data.products) {
                console.log('First product full details:', response.data.products[0]);
                console.log('First product image data:', response.data.products[0]?.images);
            }
            
            // The API returns an object with products array, not just the array
            if (response.data && response.data.products) {
                setProducts(response.data.products);
                setTotalPages(response.data.totalPages || Math.ceil(response.data.totalProducts / 10));
            } else if (Array.isArray(response.data)) {
                // Fallback for direct array response
                setProducts(response.data);
                setTotalPages(Math.ceil(response.data.length / 10));
            } else {
                console.error('Unexpected API response format:', response.data);
                toast.error('Received unexpected data format from server');
                setProducts([]);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products: ' + (error.response?.data?.message || error.message));
            setProducts([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setOpenDialog(true);
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/api/products/${productId}`);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const handleDeleteAll = async () => {
        const confirmed = window.confirm('Are you sure you want to delete all products? This action cannot be undone.');
        if (!confirmed) return;

        setLoading(true);
        try {
            const response = await api.delete('/api/products/delete-all');
            const { deletedCount, deletedImages } = response.data;
            
            enqueueSnackbar(
                `Successfully deleted ${deletedCount} products and ${deletedImages} images`, 
                { variant: 'success' }
            );
            
            // Reset to first page and refresh product list
            setPage(1);
            await fetchProducts(1);
        } catch (error) {
            console.error('Failed to delete all products:', error);
            enqueueSnackbar(
                error.response?.data?.message || 'Failed to delete products. Please try again.',
                { variant: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProduct(null);
    };

    const handleSave = async () => {
        await fetchProducts();
        handleCloseDialog();
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setOpenDialog(true);
    };

    const handleViewDetails = (product) => {
        setDetailProduct(product);
        setOpenDetailsDialog(true);
    };

    const handleCloseDetails = () => {
        setOpenDetailsDialog(false);
        setDetailProduct(null);
    };

    // Function to get the full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) {
            return 'https://via.placeholder.com/300x200?text=No+Image';
        }

        try {
            // If it's an array, take the first element
            if (Array.isArray(imagePath)) {
                imagePath = imagePath[0];
            }

            // If it's already a full URL, return it
            if (imagePath.startsWith('http')) {
                return imagePath;
            }

            // Clean the path and ensure it starts from the root
            const cleanPath = imagePath.split(/[\/\\]/).pop();
            
            // If the original path includes 'images', use images directory
            if (imagePath.includes('images')) {
                return `http://localhost:5000/images/${cleanPath}`;
            }
            
            // Default to uploads directory
            return `http://localhost:5000/uploads/${cleanPath}`;
        } catch (error) {
            console.error('Error processing image path:', error);
            return 'https://via.placeholder.com/300x200?text=Error+Loading+Image';
        }
    };

    // Memoize products to prevent unnecessary re-renders
    const memoizedProducts = React.useMemo(() => products, [products]);

    return (
        <Container maxWidth="xl">
            <Box sx={{ my: 4 }}>
                {/* Header with Add Product and Delete All buttons */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button 
                        variant="contained" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteAll}
                    >
                        Delete All My Products
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        onClick={handleAddProduct}
                    >
                        Add Product
                    </Button>
                </Box>

                {/* Products Grid */}
                <Grid container spacing={3}>
                    {loading ? (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography>Loading products...</Typography>
                            </Box>
                        </Grid>
                    ) : memoizedProducts && memoizedProducts.length > 0 ? (
                        memoizedProducts.map((product) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={getImageUrl(product.images)}
                                        alt={product.name}
                                        sx={{ 
                                            objectFit: 'cover',
                                            backgroundColor: '#f5f5f5'
                                        }}
                                        onError={(e) => {
                                            console.error('Image failed to load:', e.target.src);
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h6" component="div" noWrap>
                                            {product.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {product.description}
                                        </Typography>
                                        <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                                            ${product.price}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Chip 
                                                label={`Stock: ${product.stock}`} 
                                                color={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error"}
                                                size="small"
                                            />
                                            <Box>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleEdit(product)}
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleDelete(product._id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                            <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                Added by: {product.storeOwner ? product.storeOwner.name : 'Unknown User'}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography>No products found. Add your first product!</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={handlePageChange} 
                            color="primary" 
                        />
                    </Box>
                )}
            </Box>

            {/* Product Form Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogContent>
                    <ProductForm 
                        product={selectedProduct} 
                        onSave={handleSave} 
                        onCancel={handleCloseDialog} 
                    />
                </DialogContent>
            </Dialog>

            {/* Product Details Dialog */}
            <Dialog
                open={openDetailsDialog}
                onClose={handleCloseDetails}
                maxWidth="sm"
                fullWidth
            >
                {detailProduct && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon />
                                <Typography variant="h6">{detailProduct.name}</Typography>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mb: 2 }}>
                                <img 
                                    src={getImageUrl(detailProduct.images && detailProduct.images[0])} 
                                    alt={detailProduct.name}
                                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                                />
                            </Box>
                            <Typography variant="body1" paragraph>
                                {detailProduct.description}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Price
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        ${detailProduct.price}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Stock
                                    </Typography>
                                    <Typography variant="h6">
                                        {detailProduct.stock} units
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Category
                                    </Typography>
                                    <Typography variant="body1">
                                        {detailProduct.category}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDetails}>Close</Button>
                            <Button 
                                onClick={() => {
                                    handleCloseDetails();
                                    handleEdit(detailProduct);
                                }}
                                color="primary"
                            >
                                Edit
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default ProductList; 