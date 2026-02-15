import mongoose from 'mongoose';

const stockItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        uppercase: true
    },
    category: {
        type: String,
        enum: ['medication', 'consumable', 'equipment', 'other'],
        default: 'medication'
    },
    description: String,
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        default: 'units' // e.g., pills, boxes, ml
    },
    minStockLevel: {
        type: Number,
        default: 10
    },
    batchNumber: String,
    expiryDate: Date,
    location: String, // Cabinet A, Shelf 3
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    },
    costPrice: Number,
    sellingPrice: Number,
    isPrescriptionRequired: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'discontinued', 'out_of_stock'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Virtual for stock status
stockItemSchema.virtual('stockStatus').get(function () {
    if (this.quantity === 0) return 'out_of_stock';
    if (this.quantity <= this.minStockLevel) return 'low_stock';
    return 'in_stock';
});

export default mongoose.model('StockItem', stockItemSchema);
