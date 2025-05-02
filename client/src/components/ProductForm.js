import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    TextField,
    Button,
    Box,
    Grid,
    Typography,
    IconButton,
    Alert
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number()
        .required('Price is required')
        .min(0, 'Price must be positive'),
    category: Yup.string().required('Category is required'),
    stock: Yup.number()
        .required('Stock is required')
        .min(0, 'Stock must be positive'),
});

const ProductForm = ({ product, onSave, onCancel }) => {
    const [images, setImages] = useState(product?.images || []);
    const [imageFiles, setImageFiles] = useState([]);
    const [uploadError, setUploadError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingImages] = useState(product?.images || []);

    const formik = useFormik({
        initialValues: {
            name: product?.name || '',
            description: product?.description || '',
            price: product?.price || '',
            category: product?.category || '',
            stock: product?.stock || '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                setIsSubmitting(true);
                setUploadError('');
                
                const formData = new FormData();
                Object.keys(values).forEach(key => {
                    formData.append(key, values[key]);
                });

                // For new products, require at least one image
                if (imageFiles.length === 0 && !product) {
                    setUploadError('At least one image is required');
                    setIsSubmitting(false);
                    return;
                }

                // Add new images if any
                imageFiles.forEach(file => {
                    formData.append('images', file);
                });

                // For updates, if no new images are added, keep the existing ones
                if (product && imageFiles.length === 0) {
                    existingImages.forEach(imagePath => {
                        formData.append('existingImages', imagePath);
                    });
                }

                console.log('Submitting form data:', {
                    values,
                    imageCount: imageFiles.length,
                    imageTypes: imageFiles.map(f => f.type),
                    existingImages: product ? existingImages : []
                });

                if (product) {
                    const response = await api.put(`/api/products/${product._id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    console.log('Update response:', response.data);
                    toast.success('Product updated successfully');
                } else {
                    const response = await api.post('/api/products', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    console.log('Create response:', response.data);
                    toast.success('Product created successfully');
                }
                onSave();
            } catch (error) {
                console.error('Error submitting product:', {
                    error,
                    response: error.response?.data,
                    status: error.response?.status,
                    message: error.message
                });
                const errorMessage = error.response?.data?.message || error.message || 'Operation failed';
                setUploadError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files);
        
        // Validate file types
        const invalidFiles = files.filter(file => {
            const fileType = file.type.split('/')[0];
            return fileType !== 'image';
        });
        
        if (invalidFiles.length > 0) {
            toast.error(`Invalid file type. Only image files are allowed.`);
            return;
        }
        
        setImageFiles(prev => [...prev, ...files]);
        
        // Create preview URLs
        const newImages = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            {uploadError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {uploadError}
                </Alert>
            )}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="name"
                        name="name"
                        label="Product Name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="description"
                        name="description"
                        label="Description"
                        multiline
                        rows={4}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="price"
                        name="price"
                        label="Price"
                        type="number"
                        value={formik.values.price}
                        onChange={formik.handleChange}
                        error={formik.touched.price && Boolean(formik.errors.price)}
                        helperText={formik.touched.price && formik.errors.price}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        id="stock"
                        name="stock"
                        label="Stock"
                        type="number"
                        value={formik.values.stock}
                        onChange={formik.handleChange}
                        error={formik.touched.stock && Boolean(formik.errors.stock)}
                        helperText={formik.touched.stock && formik.errors.stock}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        id="category"
                        name="category"
                        label="Category"
                        value={formik.values.category}
                        onChange={formik.handleChange}
                        error={formik.touched.category && Boolean(formik.errors.category)}
                        helperText={formik.touched.category && formik.errors.category}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Product Images
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        {images.map((image, index) => (
                            <Box key={index} sx={{ position: 'relative' }}>
                                <img
                                    src={image}
                                    alt={`Product ${index + 1}`}
                                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                                />
                                <IconButton
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)'
                                    }}
                                    onClick={() => handleRemoveImage(index)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                    <Button
                        variant="outlined"
                        component="label"
                    >
                        Upload Images
                        <input
                            type="file"
                            hidden
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </Button>
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        Only jpeg, jpg, png, and gif files are allowed
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!formik.isValid || isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (product ? 'Update' : 'Create')}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </form>
    );
};

export default ProductForm; 