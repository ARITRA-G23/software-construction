const express = require('express');
const router = express.Router();
const { auth, isStoreOwner } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Get dashboard statistics (protected route)
router.get('/stats', auth, async (req, res) => {
    try {
        const [
            totalProducts,
            productsByCategory,
            lowStockProducts,
            outOfStockProducts
        ] = await Promise.all([
            Product.countDocuments(),
            Product.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        products: { $push: '$$ROOT' }
                    }
                },
                {
                    $project: {
                        category: '$_id',
                        count: 1,
                        products: 1,
                        _id: 0
                    }
                }
            ]),
            Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
            Product.countDocuments({ stock: { $lte: 0 } })
        ]);

        res.json({
            totalProducts,
            productsByCategory,
            lowStockProducts,
            outOfStockProducts
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});

// Get filtered products (protected route)
router.get('/products', auth, async (req, res) => {
    try {
        const { 
            category, 
            search, 
            sortBy, 
            sortOrder,
            priceRange,
            stockStatus 
        } = req.query;
        
        let query = {};
        
        // Apply category filter
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Apply search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Apply price range filter
        if (priceRange && priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            if (max) {
                query.price = { $gte: min, $lte: max };
            } else {
                query.price = { $gte: min };
            }
        }

        // Apply stock status filter
        if (stockStatus && stockStatus !== 'all') {
            switch (stockStatus) {
                case 'inStock':
                    query.stock = { $gt: 10 };
                    break;
                case 'lowStock':
                    query.stock = { $gt: 0, $lte: 10 };
                    break;
                case 'outOfStock':
                    query.stock = { $lte: 0 };
                    break;
            }
        }
        
        // Build sort object
        let sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort = { createdAt: -1 }; // Default sort
        }
        
        const products = await Product.find(query)
            .sort(sort)
            .populate('storeOwner', 'name email');
            
        res.json(products);
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// Get all categories (protected route)
router.get('/categories', auth, async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Get recent orders (protected route)
router.get('/recent-orders', auth, async (req, res) => {
    try {
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('_id customerName totalAmount status createdAt');

        res.json(recentOrders);
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        res.status(500).json({ message: 'Error fetching recent orders' });
    }
});

module.exports = router; 