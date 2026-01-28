import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    recordNumber: {
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
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    date: {
        type: Date,
        default: Date.now
    },
    chiefComplaint: {
        type: String,
        required: [true, 'Please provide chief complaint']
    },
    presentIllnessHistory: String,
    vitalSigns: {
        bloodPressure: {
            systolic: Number,
            diastolic: Number
        },
        heartRate: Number, // bpm
        temperature: Number, // celsius
        respiratoryRate: Number, // breaths per minute
        oxygenSaturation: Number, // percentage
        weight: Number, // kg
        height: Number, // cm
        bmi: Number
    },
    physicalExamination: String,
    diagnosis: [{
        code: String, // ICD-10 code
        description: String,
        type: {
            type: String,
            enum: ['primary', 'secondary', 'differential']
        }
    }],
    treatment: String,
    notes: {
        type: String,
        select: false // Private notes, only visible to doctor
    },
    prescriptions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
    }],
    labOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabOrder'
    }],
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'pdf', 'audio', 'video', 'other']
        },
        url: String,
        filename: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        description: String
    }],
    followUp: {
        required: Boolean,
        date: Date,
        notes: String
    },
    isEncrypted: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Generate unique record number
medicalRecordSchema.pre('save', async function (next) {
    if (!this.recordNumber) {
        const count = await mongoose.model('MedicalRecord').countDocuments();
        const year = new Date().getFullYear();
        this.recordNumber = `MR${year}${String(count + 1).padStart(6, '0')}`;
    }

    // Calculate BMI if height and weight available
    if (this.vitalSigns.weight && this.vitalSigns.height) {
        const heightInMeters = this.vitalSigns.height / 100;
        this.vitalSigns.bmi = this.vitalSigns.weight / (heightInMeters * heightInMeters);
    }

    next();
});

// Index for efficient querying
medicalRecordSchema.index({ patient: 1, date: -1 });
medicalRecordSchema.index({ doctor: 1, date: -1 });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
