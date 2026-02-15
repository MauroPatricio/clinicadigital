import mongoose from 'mongoose';

const patientAlertSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true,
        index: true
    },
    alertType: {
        type: String,
        enum: ['followup', 'medication', 'checkup', 'exam', 'vaccination', 'appointment', 'test-result', 'custom'],
        required: true
    },
    dueDate: {
        type: Date,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'dismissed', 'overdue'],
        default: 'pending',
        index: true
    },
    completedDate: {
        type: Date
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    notificationDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
patientAlertSchema.index({ patient: 1, status: 1, dueDate: 1 });
patientAlertSchema.index({ clinic: 1, status: 1, dueDate: 1 });
patientAlertSchema.index({ dueDate: 1, status: 1 });

// Virtual for checking if alert is overdue
patientAlertSchema.virtual('isOverdue').get(function () {
    return this.status === 'pending' && this.dueDate < new Date();
});

// Middleware to update status to overdue
patientAlertSchema.pre('find', function () {
    this.updateMany(
        {
            status: 'pending',
            dueDate: { $lt: new Date() }
        },
        {
            $set: { status: 'overdue' }
        }
    );
});

export default mongoose.model('PatientAlert', patientAlertSchema);
