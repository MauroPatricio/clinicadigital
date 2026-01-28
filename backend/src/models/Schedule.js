import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    shifts: [{
        date: {
            type: Date,
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
        },
        type: {
            type: String,
            enum: ['regular', 'on-call', 'overtime'],
            default: 'regular'
        },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled'],
            default: 'scheduled'
        },
        notes: String
    }],
    leaves: [{
        type: {
            type: String,
            enum: ['vacation', 'sick', 'personal', 'conference', 'other'],
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        reason: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: Date,
        rejectionReason: String
    }],
    hoursWorked: {
        thisWeek: {
            type: Number,
            default: 0
        },
        thisMonth: {
            type: Number,
            default: 0
        },
        thisYear: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for efficient querying
scheduleSchema.index({ doctor: 1, 'shifts.date': 1 });
scheduleSchema.index({ 'leaves.status': 1 });

export default mongoose.model('Schedule', scheduleSchema);
