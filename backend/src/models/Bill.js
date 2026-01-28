import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
    billNumber: {
        type: String,
        unique: true,
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    services: [{
        description: {
            type: String,
            required: true
        },
        code: String, // Service code
        quantity: {
            type: Number,
            default: 1
        },
        unitPrice: {
            type: Number,
            required: true
        },
        total: Number
    }],
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        amount: {
            type: Number,
            default: 0
        },
        reason: String
    },
    tax: {
        rate: {
            type: Number,
            default: 0
        },
        amount: Number
    },
    total: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['mpesa', 'card', 'esima', 'cash', 'insurance', 'multiple']
    },
    payments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],
    amountPaid: {
        type: Number,
        default: 0
    },
    balanceDue: Number,
    dueDate: Date,
    paidAt: Date,
    receipt: {
        number: String,
        url: String,
        generatedAt: Date
    },
    notes: String
}, {
    timestamps: true
});

// Generate unique bill number
billSchema.pre('save', async function (next) {
    if (!this.billNumber) {
        const count = await mongoose.model('Bill').countDocuments();
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        this.billNumber = `INV${year}${month}${String(count + 1).padStart(5, '0')}`;
    }

    // Calculate service totals
    this.services.forEach(service => {
        service.total = service.quantity * service.unitPrice;
    });

    // Calculate tax
    if (this.tax.rate > 0) {
        this.tax.amount = (this.subtotal - this.discount.amount) * (this.tax.rate / 100);
    }

    // Calculate balance due
    this.balanceDue = this.total - this.amountPaid;

    next();
});

// Index for efficient querying
billSchema.index({ patient: 1, createdAt: -1 });
billSchema.index({ paymentStatus: 1, dueDate: 1 });

export default mongoose.model('Bill', billSchema);
