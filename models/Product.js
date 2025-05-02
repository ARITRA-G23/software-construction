const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    images: [{
        type: String,
        required: [true, 'At least one image is required']
    }],
    storeOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        trim: true
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', category: 'text' });

// Method to check if image is already used by another product
productSchema.statics.isImageUnique = async function(imagePath, productId = null) {
    const query = { images: imagePath };
    if (productId) {
        query._id = { $ne: productId };
    }
    const existingProduct = await this.findOne(query);
    return !existingProduct;
};

const Product = mongoose.model('Product', productSchema);
module.exports = Product; 