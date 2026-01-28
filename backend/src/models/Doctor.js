import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    doctorNumber: {
        type: String,
        unique: true
    },
    specialization: {
        type: String,
        required: [true, 'Please specify specialization'],
        enum: [
            'cardiologia',
            'pediatria',
            'clinica-geral',
            'ginecologia',
            'ortopedia',
            'dermatologia',
            'oftalmologia',
            'psiquiatria',
            'neurologia',
            'urologia',
            'otorrinolaringologia',
            'endocrinologia',
            'gastroenterologia',
            'outras'
        ]
    },
    subSpecialties: [String],
    licenseNumber: {
        type: String,
        required: [true, 'Please provide medical license number'],
        unique: true
    },
    education: [{
        degree: String,
        institution: String,
        year: Number
    }],
    certifications: [{
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date
    }],
    consultationTypes: [{
        type: String,
        enum: ['presencial', 'online', 'both'],
        default: 'both'
    }],
    availability: [{
        dayOfWeek: {
            type: Number, // 0 = Sunday, 6 = Saturday
            required: true
        },
        startTime: {
            type: String, // Format: "09:00"
            required: true
        },
        endTime: {
            type: String, // Format: "17:00"
            required: true
        },
        clinic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clinic'
        }
    }],
    consultationDuration: {
        type: Number, // in minutes
        default: 30
    },
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
    },
    stats: {
        totalConsultations: {
            type: Number,
            default: 0
        },
        totalPatients: {
            type: Number,
            default: 0
        },
        completionRate: {
            type: Number,
            default: 100
        }
    },
    isAcceptingPatients: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Generate unique doctor number
doctorSchema.pre('save', async function (next) {
    if (!this.doctorNumber) {
        const count = await mongoose.model('Doctor').countDocuments();
        this.doctorNumber = `DR${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

export default mongoose.model('Doctor', doctorSchema);
