const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { parse } = require('csv-parse');
const xlsx = require('xlsx');
const { auth, isStoreOwner } = require('../middleware/auth');
const Product = require('../models/Product');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Multer config for CSV and Excel
const upload = multer({
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

// Bulk upload from CSV
router.post('/csv', auth, isStoreOwner, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const results = [];
        const errors = [];

        // Parse CSV file
        const parser = fs.createReadStream(req.file.path).pipe(
            parse({
                columns: true,
                skip_empty_lines: true
            })
        );

        for await (const record of parser) {
            try {
                const product = new Product({
                    name: record.name,
                    description: record.description,
                    price: parseFloat(record.price),
                    category: record.category,
                    stock: parseInt(record.stock),
                    storeOwner: req.user._id,
                    images: record.imageUrls ? record.imageUrls.split(',').map(url => url.trim()) : []
                });

                await product.save();
                results.push({
                    success: true,
                    product: product.name
                });
            } catch (error) {
                errors.push({
                    row: record,
                    error: error.message
                });
            }
        }

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'Bulk upload completed',
            results,
            errors
        });
    } catch (error) {
        console.error('CSV upload error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Failed to process CSV file' });
    }
});

// Bulk upload from Excel
router.post('/excel', auth, isStoreOwner, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const results = [];
        const errors = [];

        // Read Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        for (const record of data) {
            try {
                const product = new Product({
                    name: record.name,
                    description: record.description,
                    price: parseFloat(record.price),
                    category: record.category,
                    stock: parseInt(record.stock),
                    storeOwner: req.user._id,
                    images: record.imageUrls ? record.imageUrls.split(',').map(url => url.trim()) : []
                });

                await product.save();
                results.push({
                    success: true,
                    product: product.name
                });
            } catch (error) {
                errors.push({
                    row: record,
                    error: error.message
                });
            }
        }

        // Delete the uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            message: 'Bulk upload completed',
            results,
            errors
        });
    } catch (error) {
        console.error('Excel upload error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Failed to process Excel file' });
    }
});

// Delete all products for logged in user
router.delete('/delete-all', auth, isStoreOwner, async (req, res) => {
    try {
        // Find all products by the user to get their image paths
        const userProducts = await Product.find({ storeOwner: req.user._id });
        
        // Delete all images associated with the products
        for (const product of userProducts) {
            if (product.images && product.images.length > 0) {
                for (const imagePath of product.images) {
                    try {
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                        }
                    } catch (err) {
                        console.error(`Error deleting image ${imagePath}:`, err);
                    }
                }
            }
        }

        // Delete all products for this user
        const result = await Product.deleteMany({ storeOwner: req.user._id });
        
        res.json({ 
            message: `Successfully deleted ${result.deletedCount} products`,
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        console.error('Delete all products error:', error);
        res.status(500).json({ message: 'Failed to delete products' });
    }
});

module.exports = router; 