import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    patientNumber: {
        type: String,
        unique: true
    },
    medicalHistory: {
        allergies: [{
            name: String,
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe']
            },
            reaction: String
        }],
        chronicDiseases: [{
            name: String,
            diagnosedDate: Date,
            status: {
                type: String,
                enum: ['active', 'controlled', 'remission']
            }
        }],
        continuousMedications: [{
            medication: String,
            dosage: String,
            frequency: String,
            startDate: Date,
            prescribedBy: String
        }],
        surgeries: [{
            name: String,
            date: Date,
            hospital: String,
            notes: String
        }],
        familyHistory: [{
            condition: String,
            relation: String,
            notes: String
        }]
    },
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
        email: String,
        address: String
    },
    // Multi-clinic support
    clinics: [{
        clinic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clinic'
        },
        firstVisit: {
            type: Date,
            default: Date.now
        },
        lastVisit: Date,
        totalVisits: {
            type: Number,
            default: 0
        }
    }],
    // Documents (ID cards, insurance cards, etc.)
    documents: [{
        type: {
            type: String,
            enum: ['id_card', 'insurance_card', 'medical_report', 'lab_result', 'prescription', 'other']
        },
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    insurance: {
        provider: String,
        policyNumber: String,
        validUntil: Date
    },
    riskClassification: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    lastVisit: Date,
    nextAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }
}, {
    timestamps: true
});

// Generate unique patient number
patientSchema.pre('save', async function (next) {
    if (!this.patientNumber) {
        const count = await mongoose.model('Patient').countDocuments();
        this.patientNumber = `PAT${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

export default mongoose.model('Patient', patientSchema);
