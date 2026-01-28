import mongoose from 'mongoose';

const insuranceProviderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Provider name is required'],
        trim: true
    },
    code: {
        type: String,
        unique: true,
        uppercase: true
    },
    type: {
        type: String,
        enum: ['public', 'private', 'corporate'],
        default: 'private'
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
        fax: String,
        website: String,
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
    // Coverage details
    coverage: {
        procedures: [{
            name: String,
            code: String,
            coveragePercentage: {
                type: Number,
                min: 0,
                max: 100
            },
            maxAmount: Number,
            requiresPreAuthorization: {
                type: Boolean,
                default: false
            }
        }],
        medications: {
            covered: {
                type: Boolean,
                default: true
            },
            coveragePercentage: {
                type: Number,
                min: 0,
                max: 100,
                default: 80
            },
            maxAmountPerPrescription: Number
        },
        consultations: {
            covered: {
                type: Boolean,
                default: true
            },
            coveragePercentage: {
                type: Number,
                min: 0,
                max: 100,
                default: 100
            },
            maxPerMonth: Number,
            copay: Number
        },
        labTests: {
            covered: {
                type: Boolean,
                default: true
            },
            coveragePercentage: {
                type: Number,
                min: 0,
                max: 100,
                default: 90
            }
        },
        emergencies: {
            covered: {
                type: Boolean,
                default: true
            },
            coveragePercentage: {
                type: Number,
                min: 0,
                max: 100,
                default: 100
            }
        }
    },
    // Payment terms
    paymentTerms: {
        billingCycle: {
            type: String,
            enum: ['immediate', 'weekly', 'monthly', 'quarterly'],
            default: 'monthly'
        },
        paymentMethod: {
            type: String,
            enum: ['bank_transfer', 'check', 'online', 'direct_deposit'],
            default: 'bank_transfer'
        },
        paymentDays: {
            type: Number,
            default: 30 // days to pay
        },
        requiresInvoice: {
            type: Boolean,
            default: true
        }
    },
    // Clinics that accept this provider
    acceptedByClinics: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic'
    }],
    // Network information
    network: {
        type: String,
        enum: ['in-network', 'out-of-network', 'preferred'],
        default: 'in-network'
    },
    // Authorization requirements
    authorization: {
        requiresReferral: {
            type: Boolean,
            default: false
        },
        preAuthorizationRequired: [{
            procedureType: String,
            minimumCost: Number
        }],
        documentationRequired: [String]
    },
    // Statistics
    stats: {
        totalPatients: {
            type: Number,
            default: 0
        },
        totalClaims: {
            type: Number,
            default: 0
        },
        totalAmountClaimed: {
            type: Number,
            default: 0
        },
        totalAmountPaid: {
            type: Number,
            default: 0
        },
        averageProcessingDays: {
            type: Number,
            default: 0
        },
        approvalRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    // Contract details
    contract: {
        startDate: Date,
        endDate: Date,
        renewalDate: Date,
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending', 'expired'],
            default: 'active'
        },
        notes: String,
        documents: [{
            name: String,
            url: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    notes: String
}, {
    timestamps: true
});

// Generate unique provider code
insuranceProviderSchema.pre('save', async function (next) {
    if (!this.code) {
        const count = await mongoose.model('InsuranceProvider').countDocuments();
        this.code = `INS${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Index for name and code lookups
insuranceProviderSchema.index({ name: 1 });
insuranceProviderSchema.index({ code: 1 });
insuranceProviderSchema.index({ 'contract.status': 1 });

// Method to check if contract is active
insuranceProviderSchema.methods.isContractActive = function () {
    if (this.contract.status !== 'active') return false;

    const now = new Date();
    if (this.contract.endDate && now > this.contract.endDate) return false;

    return true;
};

// Method to calculate claim approval rate
insuranceProviderSchema.methods.calculateApprovalRate = function (approvedClaims, totalClaims) {
    if (totalClaims === 0) return 0;
    this.stats.approvalRate = Math.round((approvedClaims / totalClaims) * 100);
    return this.stats.approvalRate;
};

export default mongoose.model('InsuranceProvider', insuranceProviderSchema);
