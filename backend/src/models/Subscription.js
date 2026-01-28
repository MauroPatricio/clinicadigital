import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    plan: {
        type: String,
        enum: ['basic', 'pro', 'enterprise'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'suspended', 'trial', 'cancelled', 'pending'],
        default: 'pending'
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'annual'],
        default: 'monthly'
    },
    // Pricing
    basePrice: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'MZN'
    },
    discount: {
        percentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        reason: String,
        validUntil: Date
    },
    // Billing dates
    startDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true
    },
    nextBillingDate: Date,
    lastBillingDate: Date,
    // Payment tracking
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'mpesa', 'bank_transfer', 'invoice'],
        default: 'mpesa'
    },
    paymentHistory: [{
        date: {
            type: Date,
            default: Date.now
        },
        amount: Number,
        status: {
            type: String,
            enum: ['success', 'failed', 'pending', 'refunded']
        },
        transactionId: String,
        method: String,
        notes: String
    }],
    // Usage limits based on plan
    limits: {
        maxClinics: Number,
        maxStaff: Number,
        maxAppointmentsPerMonth: Number,
        maxStorageGB: Number
    },
    // Feature flags
    features: {
        multiClinic: {
            type: Boolean,
            default: false
        },
        analytics: {
            type: Boolean,
            default: false
        },
        internalChat: {
            type: Boolean,
            default: false
        },
        telemedicine: {
            type: Boolean,
            default: false
        },
        advancedReports: {
            type: Boolean,
            default: false
        },
        customBranding: {
            type: Boolean,
            default: false
        },
        apiAccess: {
            type: Boolean,
            default: false
        },
        prioritySupport: {
            type: Boolean,
            default: false
        }
    },
    // Trial information
    trial: {
        isActive: {
            type: Boolean,
            default: false
        },
        startDate: Date,
        endDate: Date,
        daysRemaining: Number
    },
    // Auto-renewal
    autoRenew: {
        type: Boolean,
        default: true
    },
    // Cancellation
    cancellation: {
        requestedAt: Date,
        effectiveAt: Date,
        reason: String,
        feedback: String
    },
    notes: String
}, {
    timestamps: true
});

// Index for organization lookups
subscriptionSchema.index({ organization: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ expiryDate: 1 });

// Virtual for calculated total price (after discount)
subscriptionSchema.virtual('totalPrice').get(function () {
    if (this.discount.percentage > 0) {
        return this.basePrice * (1 - this.discount.percentage / 100);
    }
    return this.basePrice;
});

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function () {
    return this.status === 'active' && new Date() < this.expiryDate;
};

// Method to check if feature is available
subscriptionSchema.methods.hasFeature = function (featureName) {
    return this.features[featureName] === true;
};

// Method to calculate days remaining
subscriptionSchema.methods.getDaysRemaining = function () {
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

// Method to renew subscription
subscriptionSchema.methods.renew = async function () {
    const cycleMonths = this.billingCycle === 'annual' ? 12 : 1;
    const newExpiry = new Date(this.expiryDate);
    newExpiry.setMonth(newExpiry.getMonth() + cycleMonths);

    this.expiryDate = newExpiry;
    this.nextBillingDate = newExpiry;
    this.lastBillingDate = new Date();
    this.status = 'active';

    return await this.save();
};

// Pre-save middleware to update trial days remaining
subscriptionSchema.pre('save', function (next) {
    if (this.trial.isActive && this.trial.endDate) {
        const now = new Date();
        const end = new Date(this.trial.endDate);
        const diffTime = end - now;
        this.trial.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (this.trial.daysRemaining <= 0) {
            this.trial.isActive = false;
        }
    }
    next();
});

export default mongoose.model('Subscription', subscriptionSchema);
