import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
    prescriptionNumber: {
        type: String,
        unique: true,
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    medicalRecord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord'
    },
    medications: [{
        name: {
            type: String,
            required: true
        },
        activeIngredient: String,
        dosage: {
            type: String,
            required: true
        },
        frequency: {
            type: String,
            required: true
        },
        duration: {
            value: Number,
            unit: {
                type: String,
                enum: ['days', 'weeks', 'months']
            }
        },
        instructions: String,
        quantity: Number
    }],
    notes: String,
    validUntil: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'dispensed', 'expired', 'cancelled'],
        default: 'active'
    },
    pharmacyStatus: {
        sent: {
            type: Boolean,
            default: false
        },
        sentTo: String, // Pharmacy name or ID
        sentAt: Date,
        dispensedAt: Date
    },
    digitalSignature: {
        signed: Boolean,
        signedAt: Date,
        signatureData: String
    },
    interactionsChecked: {
        type: Boolean,
        default: false
    },
    interactions: [{
        medication1: String,
        medication2: String,
        severity: {
            type: String,
            enum: ['minor', 'moderate', 'major', 'contraindicated']
        },
        description: String
    }],
    qrCode: String // For verification at pharmacy
}, {
    timestamps: true
});

// Generate unique prescription number
prescriptionSchema.pre('save', async function (next) {
    if (!this.prescriptionNumber) {
        const count = await mongoose.model('Prescription').countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        this.prescriptionNumber = `RX${year}${month}${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Auto-expire check
prescriptionSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Prescription', prescriptionSchema);
