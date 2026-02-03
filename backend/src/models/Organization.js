import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide organization name'],
        trim: true
    },
    code: {
        type: String,
        unique: true,
        uppercase: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Subscription management
    subscription: {
        plan: {
            type: String,
            enum: ['basic', 'pro', 'enterprise'],
            default: 'basic'
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'suspended', 'trial'],
            default: 'trial'
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        expiryDate: {
            type: Date,
            required: true
        },
        billingCycle: {
            type: String,
            enum: ['monthly', 'annual'],
            default: 'monthly'
        },
        price: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'MZN'
        }
    },
    // Usage limits based on plan
    limits: {
        maxClinics: {
            type: Number,
            default: 10
        },
        maxStaff: {
            type: Number,
            default: 5
        },
        maxAppointmentsPerMonth: {
            type: Number,
            default: 100
        },
        features: {
            analytics: { type: Boolean, default: false },
            internalChat: { type: Boolean, default: false },
            telemedicine: { type: Boolean, default: false },
            multiClinic: { type: Boolean, default: false }
        }
    },
    // Contact information
    contact: {
        email: {
            type: String,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email'
            ]
        },
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            country: {
                type: String,
                default: 'Mozambique'
            },
            postalCode: String
        }
    },
    // Business details
    businessInfo: {
        taxId: String,
        registrationNumber: String,
        website: String
    },
    // Branding
    branding: {
        logo: String,
        primaryColor: {
            type: String,
            default: '#0066CC'
        },
        secondaryColor: {
            type: String,
            default: '#00CC99'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Statistics (cached for performance)
    stats: {
        totalClinics: {
            type: Number,
            default: 0
        },
        totalStaff: {
            type: Number,
            default: 0
        },
        totalPatients: {
            type: Number,
            default: 0
        },
        lastUpdated: Date
    }
}, {
    timestamps: true
});

// Generate unique organization code
organizationSchema.pre('save', async function (next) {
    if (!this.code) {
        const count = await mongoose.model('Organization').countDocuments();
        this.code = `ORG${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Set default expiry date (30 days trial)
organizationSchema.pre('save', function (next) {
    if (this.isNew && !this.subscription.expiryDate) {
        const trialDays = 15;
        this.subscription.expiryDate = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);
    }
    next();
});

// Virtual for clinics
organizationSchema.virtual('clinics', {
    ref: 'Clinic',
    localField: '_id',
    foreignField: 'organization'
});

// Method to check if subscription is active
organizationSchema.methods.isSubscriptionActive = function () {
    return (this.subscription.status === 'active' || this.subscription.status === 'trial') &&
        new Date() < this.subscription.expiryDate;
};

// Method to check if feature is available
organizationSchema.methods.hasFeature = function (featureName) {
    return this.limits.features[featureName] === true;
};

// Method to check if within limits
organizationSchema.methods.canAddClinic = function () {
    return this.stats.totalClinics < this.limits.maxClinics;
};

organizationSchema.methods.canAddStaff = function () {
    return this.stats.totalStaff < this.limits.maxStaff;
};

export default mongoose.model('Organization', organizationSchema);
