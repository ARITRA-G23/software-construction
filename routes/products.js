const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parse } = require('csv-parse');
const xlsx = require('xlsx');
const axios = require('axios');
const { auth, isStoreOwner } = require('../middleware/auth');
const Product = require('../models/Product');

// Create images directory if it doesn't exist
const imagesDir = 'images';
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Multer config for images
const imageUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error(`File type not allowed: ${file.originalname}. Only jpeg, jpg, png, and gif files are allowed.`));
    }
});

// Multer config for CSV and Excel
const documentUpload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /csv|xlsx|xls/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        
        if (extname) {
            return cb(null, true);
        }
        cb(new Error(`File type not allowed: ${file.originalname}. Only CSV and Excel files are allowed.`));
    }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `File upload error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// Function to download and save image from URL
async function downloadAndSaveImage(imageUrl) {
    try {
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream'
        });

        const contentType = response.headers['content-type'];
        if (!contentType.startsWith('image/')) {
            throw new Error('URL does not point to an image');
        }

        const extension = contentType.split('/')[1];
        const filename = `${Date.now()}.${extension}`;
        const filepath = path.join(imagesDir, filename);
        
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(filepath));
            writer.on('error', reject);
        });
    } catch (error) {
        throw new Error(`Failed to download image: ${error.message}`);
    }
}

// Delete all products for the authenticated user - MUST BE BEFORE /:id routes
router.delete('/delete-all', auth, isStoreOwner, async (req, res) => {
    console.log('Delete all route matched');
    try {
        if (!req.user || !req.user._id) {
            console.error('Authentication error - no user or user ID');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        console.log('Starting delete operation for user:', req.user._id);

        // Find all products by the authenticated user
        const userProducts = await Product.find({ storeOwner: req.user._id });
        console.log(`Found ${userProducts.length} products to delete`);

        // Delete all images associated with the products
        let deletedImages = 0;
        for (const product of userProducts) {
            if (product.images && product.images.length > 0) {
                for (const imagePath of product.images) {
                    try {
                        const fullPath = path.resolve(imagePath);
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                            deletedImages++;
                            console.log('Successfully deleted image:', fullPath);
                        } else {
                            console.log('Image not found:', fullPath);
                        }
                    } catch (err) {
                        console.error(`Error deleting image ${imagePath}:`, err);
                        // Continue with deletion even if image deletion fails
                    }
                }
            }
        }

        // Delete all products for this user
        const result = await Product.deleteMany({ storeOwner: req.user._id });
        console.log('Delete operation completed:', {
            deletedCount: result.deletedCount,
            deletedImages: deletedImages
        });

        res.json({ 
            message: `Successfully deleted ${result.deletedCount} products and ${deletedImages} images`,
            deletedCount: result.deletedCount,
            deletedImages: deletedImages
        });
    } catch (error) {
        console.error('Delete all products error:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?._id
        });
        res.status(500).json({ 
            message: 'Failed to delete products',
            error: error.message
        });
    }
});

// Get all products with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .populate({
                path: 'storeOwner',
                select: 'name email'
            })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments();

        res.json({
            products,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'storeOwner',
                select: 'name email'
            });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new product
router.post('/', auth, isStoreOwner, imageUpload.array('images', 5), handleMulterError, async (req, res) => {
    try {
        console.log('Product creation route hit:', {
            method: req.method,
            path: req.path,
            body: req.body,
            files: req.files?.map(f => ({
                fieldname: f.fieldname,
                originalname: f.originalname,
                mimetype: f.mimetype,
                size: f.size,
                path: f.path
            })),
            user: req.user?._id,
            userRole: req.user?.role,
            headers: req.headers
        });

        if (!req.files || req.files.length === 0) {
            console.error('No images uploaded');
            return res.status(400).json({ message: 'At least one image is required' });
        }

        const { name, description, price, category, stock } = req.body;

        // Validate required fields
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!description) missingFields.push('description');
        if (!price) missingFields.push('price');
        if (!category) missingFields.push('category');
        if (!stock) missingFields.push('stock');

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({ 
                message: 'Missing required fields',
                fields: missingFields
            });
        }

        // Validate numeric fields
        const numericPrice = parseFloat(price);
        const numericStock = parseInt(stock);

        if (isNaN(numericPrice) || numericPrice < 0) {
            console.error('Invalid price:', price);
            return res.status(400).json({ message: 'Invalid price value' });
        }

        if (isNaN(numericStock) || numericStock < 0) {
            console.error('Invalid stock:', stock);
            return res.status(400).json({ message: 'Invalid stock value' });
        }

        // Create image paths array
        const imagePaths = req.files.map(file => file.path);
        console.log('Image paths:', imagePaths);

        // Create new product
        const product = new Product({
            name,
            description,
            price: numericPrice,
            category,
            stock: numericStock,
            images: imagePaths,
            storeOwner: req.user._id
        });

        console.log('Attempting to save product:', product);

        const savedProduct = await product.save();
        console.log('Product created successfully:', savedProduct);

        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Error creating product:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({ 
            message: 'Failed to create product',
            error: error.message 
        });
    }
});

// Update a product
router.put('/:id', auth, isStoreOwner, imageUpload.array('images', 5), handleMulterError, async (req, res) => {
    try {
        console.log('Product update route hit:', {
            method: req.method,
            path: req.path,
            body: req.body,
            files: req.files?.map(f => ({
                fieldname: f.fieldname,
                originalname: f.originalname,
                mimetype: f.mimetype,
                size: f.size,
                path: f.path
            })),
            existingImages: req.body.existingImages,
            user: req.user?._id,
            userRole: req.user?.role,
            headers: req.headers
        });

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the user owns this product
        if (product.storeOwner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        const { name, description, price, category, stock, existingImages } = req.body;

        // Validate required fields
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!description) missingFields.push('description');
        if (!price) missingFields.push('price');
        if (!category) missingFields.push('category');
        if (!stock) missingFields.push('stock');

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({ 
                message: 'Missing required fields',
                fields: missingFields
            });
        }

        // Validate numeric fields
        const numericPrice = parseFloat(price);
        const numericStock = parseInt(stock);

        if (isNaN(numericPrice) || numericPrice < 0) {
            console.error('Invalid price:', price);
            return res.status(400).json({ message: 'Invalid price value' });
        }

        if (isNaN(numericStock) || numericStock < 0) {
            console.error('Invalid stock:', stock);
            return res.status(400).json({ message: 'Invalid stock value' });
        }

        // Handle image updates
        let imagePaths = [];
        
        // Keep existing images if no new ones are uploaded
        if (!req.files || req.files.length === 0) {
            // Handle existingImages as array or single value
            if (Array.isArray(existingImages)) {
                imagePaths = existingImages;
            } else if (existingImages) {
                imagePaths = [existingImages];
            } else {
                imagePaths = product.images; // Keep current images if no new ones and no existing ones specified
            }
        } else {
            // If new images are uploaded, delete old ones
            for (const oldImage of product.images) {
                try {
                    const fullPath = path.resolve(oldImage);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                        console.log('Successfully deleted old image:', fullPath);
                    }
                } catch (err) {
                    console.error(`Error deleting old image ${oldImage}:`, err);
                }
            }
            // Use new images
            imagePaths = req.files.map(file => file.path);
        }

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                price: numericPrice,
                category,
                stock: numericStock,
                images: imagePaths
            },
            { new: true, runValidators: true }
        );

        console.log('Product updated successfully:', updatedProduct);
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({ 
            message: 'Failed to update product',
            error: error.message 
        });
    }
});

// Delete a product
router.delete('/:id', auth, isStoreOwner, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the user owns this product
        if (product.storeOwner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        // Delete associated images
        if (product.images && product.images.length > 0) {
            for (const imagePath of product.images) {
                try {
                    const fullPath = path.resolve(imagePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                        console.log('Successfully deleted image:', fullPath);
                    }
                } catch (err) {
                    console.error(`Error deleting image ${imagePath}:`, err);
                }
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
});

module.exports = router;