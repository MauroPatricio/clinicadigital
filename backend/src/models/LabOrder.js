import mongoose from 'mongoose';

const labOrderSchema = new mongoose.Schema({
    orderNumber: {
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
    exams: [{
        name: {
            type: String,
            required: true
        },
        code: String,
        category: {
            type: String,
            enum: ['blood', 'urine', 'imaging', 'biopsy', 'other']
        },
        instructions: String,
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'cancelled'],
            default: 'pending'
        },
        results: {
            values: [{
                parameter: String,
                value: String,
                unit: String,
                referenceRange: String,
                flag: {
                    type: String,
                    enum: ['normal', 'low', 'high', 'critical']
                }
            }],
            interpretation: String,
            attachments: [{
                url: String,
                type: String,
                filename: String
            }],
            completedAt: Date,
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Doctor'
            }
        }
    }],
    priority: {
        type: String,
        enum: ['routine', 'urgent', 'stat'],
        default: 'routine'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    laboratory: {
        name: String,
        externalId: String
    },
    notes: String,
    resultsAvailableAt: Date,
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Generate unique order number
labOrderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('LabOrder').countDocuments();
        const year = new Date().getFullYear().toString().slice(-2);
        this.orderNumber = `LAB${year}${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Index for efficient querying
labOrderSchema.index({ patient: 1, createdAt: -1 });
labOrderSchema.index({ status: 1, priority: 1 });

export default mongoose.model('LabOrder', labOrderSchema);
