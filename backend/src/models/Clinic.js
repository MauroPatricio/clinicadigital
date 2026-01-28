import mongoose from 'mongoose';

const clinicSchema = new mongoose.Schema({
    // Multi-clinic references
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: String,
        country: {
            type: String,
            default: 'Mozambique'
        },
        postalCode: String
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    contact: {
        phone: {
            type: String,
            required: true
        },
        email: String,
        fax: String
    },
    operatingHours: [{
        dayOfWeek: {
            type: Number, // 0-6
            required: true
        },
        openTime: {
            type: String,
            required: true
        },
        closeTime: {
            type: String,
            required: true
        },
        closed: {
            type: Boolean,
            default: false
        }
    }],
    specialties: [{
        type: String
    }],
    facilities: [{
        type: String,
        enum: ['emergency', 'laboratory', 'pharmacy', 'radiology', 'surgery', 'icu', 'maternity', 'pediatric']
    }],
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }],
    // Clinic-specific branding
    branding: {
        logo: String,
        primaryColor: String,
        secondaryColor: String,
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'light'
        }
    },
    // Independent clinic settings
    settings: {
        language: {
            type: String,
            default: 'pt'
        },
        timezone: {
            type: String,
            default: 'Africa/Maputo'
        },
        appointmentDuration: {
            type: Number,
            default: 30 // minutes
        },
        minIntervalBetweenAppointments: {
            type: Number,
            default: 15 // minutes
        },
        maxAppointmentsPerDay: {
            type: Number,
            default: 20
        },
        allowOnlineBooking: {
            type: Boolean,
            default: true
        },
        requireAppointmentConfirmation: {
            type: Boolean,
            default: true
        }
    },
    // Consultation rooms
    rooms: [{
        number: {
            type: String,
            required: true
        },
        name: String,
        type: {
            type: String,
            enum: ['consultation', 'procedure', 'emergency', 'examination'],
            default: 'consultation'
        },
        floor: String,
        capacity: {
            type: Number,
            default: 1
        },
        equipment: [String],
        status: {
            type: String,
            enum: ['available', 'occupied', 'maintenance', 'reserved'],
            default: 'available'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    images: [{
        url: String,
        description: String
    }],
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Generate unique clinic code
clinicSchema.pre('save', async function (next) {
    if (!this.code) {
        const count = await mongoose.model('Clinic').countDocuments();
        this.code = `CLN${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Geospatial index for nearby clinics
clinicSchema.index({ coordinates: '2dsphere' });

export default mongoose.model('Clinic', clinicSchema);
