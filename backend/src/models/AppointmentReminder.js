import mongoose from 'mongoose';

const appointmentReminderSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        index: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    reminderType: {
        type: String,
        enum: ['sms', 'whatsapp', 'email', 'push'],
        required: true
    },
    scheduledFor: {
        type: Date,
        required: true,
        index: true
    },
    sent: {
        type: Boolean,
        default: false,
        index: true
    },
    sentAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'confirmed', 'cancelled'],
        default: 'pending',
        index: true
    },
    confirmationCode: {
        type: String,
        unique: true,
        sparse: true
    },
    confirmedAt: {
        type: Date
    },
    errorMessage: {
        type: String
    },
    retryCount: {
        type: Number,
        default: 0
    },
    maxRetries: {
        type: Number,
        default: 3
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for efficient reminder queries
appointmentReminderSchema.index({ scheduledFor: 1, sent: 1 });
appointmentReminderSchema.index({ appointment: 1, status: 1 });

// Generate confirmation code before save
appointmentReminderSchema.pre('save', function (next) {
    if (!this.confirmationCode && this.isNew) {
        this.confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

// Method to mark as sent
appointmentReminderSchema.methods.markAsSent = function () {
    this.sent = true;
    this.sentAt = new Date();
    this.status = 'sent';
    return this.save();
};

// Method to mark as confirmed
appointmentReminderSchema.methods.markAsConfirmed = function () {
    this.status = 'confirmed';
    this.confirmedAt = new Date();
    return this.save();
};

// Method to mark as failed
appointmentReminderSchema.methods.markAsFailed = function (errorMessage) {
    this.status = 'failed';
    this.errorMessage = errorMessage;
    this.retryCount += 1;
    return this.save();
};

export default mongoose.model('AppointmentReminder', appointmentReminderSchema);
