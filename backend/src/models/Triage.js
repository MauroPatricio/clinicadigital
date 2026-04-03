import mongoose from 'mongoose';

const triageSchema = new mongoose.Schema({
    triageNumber: {
        type: String,
        unique: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        index: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        index: true
    },
    symptoms: [{
        name: String,
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'low'
        },
        duration: String // e.g., "2 days"
    }],
    vitalSigns: {
        bloodPressure: {
            systolic: Number,
            diastolic: Number
        },
        heartRate: Number,
        temperature: Number,
        respiratoryRate: Number,
        oxygenSaturation: Number,
        painLevel: {
            type: Number,
            min: 0,
            max: 10
        }
    },
    urgencyLevel: {
        type: String,
        enum: ['non-urgent', 'semi-urgent', 'urgent', 'emergency', 'immediate'],
        required: true,
        default: 'non-urgent'
    },
    colorCode: {
        type: String,
        enum: ['blue', 'green', 'yellow', 'orange', 'red'], // Manchester Triage System colors
        required: true,
        default: 'blue'
    },
    notes: String,
    triagedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Staff/Nurse who performed triage
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Auto-generate triage number
triageSchema.pre('save', async function (next) {
    if (!this.triageNumber) {
        const count = await mongoose.model('Triage').countDocuments();
        const date = new Date();
        const year = date.getFullYear();
        this.triageNumber = `TR${year}${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

export default mongoose.model('Triage', triageSchema);
