import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        unique: true,
        required: true
    },
    bill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bill',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['mpesa', 'card', 'esima', 'cash', 'insurance'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    // M-Pesa specific
    mpesaReference: String,
    mpesaPhone: String,

    // Card payment specific
    cardLast4: String,
    cardBrand: String,
    stripePaymentId: String,

    // e-SIMA specific
    esimaReference: String,

    metadata: {
        ipAddress: String,
        userAgent: String,
        location: String
    },
    processedAt: Date,
    failureReason: String,
    refund: {
        refunded: {
            type: Boolean,
            default: false
        },
        amount: Number,
        reason: String,
        refundedAt: Date,
        refundTransactionId: String
    }
}, {
    timestamps: true
});

// Generate unique transaction ID
paymentSchema.pre('save', async function (next) {
    if (!this.transactionId) {
        const count = await mongoose.model('Payment').countDocuments();
        const timestamp = Date.now().toString().slice(-8);
        this.transactionId = `TXN${timestamp}${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Index for efficient querying
paymentSchema.index({ bill: 1 });
paymentSchema.index({ patient: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

export default mongoose.model('Payment', paymentSchema);
