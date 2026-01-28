import mongoose from 'mongoose';

const medicationReminderSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    prescription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
    },
    medication: {
        name: {
            type: String,
            required: true
        },
        dosage: {
            type: String,
            required: true
        },
        instructions: String
    },
    schedule: [{
        time: {
            type: String, // Format: "09:00"
            required: true
        },
        enabled: {
            type: Boolean,
            default: true
        }
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    daysOfWeek: [{
        type: Number, // 0-6 (Sunday-Saturday)
        required: true
    }],
    adherenceLog: [{
        scheduledTime: Date,
        takenAt: Date,
        status: {
            type: String,
            enum: ['taken', 'skipped', 'late'],
            required: true
        },
        notes: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    notificationSettings: {
        push: {
            type: Boolean,
            default: true
        },
        sms: {
            type: Boolean,
            default: false
        },
        email: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Calculate adherence rate
medicationReminderSchema.virtual('adherenceRate').get(function () {
    if (this.adherenceLog.length === 0) return 100;

    const taken = this.adherenceLog.filter(log => log.status === 'taken').length;
    return Math.round((taken / this.adherenceLog.length) * 100);
});

// Index for efficient querying
medicationReminderSchema.index({ patient: 1, isActive: 1 });

export default mongoose.model('MedicationReminder', medicationReminderSchema);
