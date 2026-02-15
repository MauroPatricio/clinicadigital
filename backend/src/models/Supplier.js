import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        unique: true
    },
    contactPerson: String,
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: String,
    address: {
        street: String,
        city: String,
        province: String,
        postalCode: String
    },
    taxId: String, // NUIT
    paymentTerms: String, // e.g., Net 30
    productsSupplied: [{
        type: String
    }],
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    notes: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'blacklisted'],
        default: 'active'
    }
}, {
    timestamps: true
});

export default mongoose.model('Supplier', supplierSchema);
