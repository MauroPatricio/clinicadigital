import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    appointmentNumber: {
        type: String,
        unique: true,
        required: true
    },
    // Multi-clinic support
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    // Room assignment
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient is required']
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor is required']
    },
    // Priority system for smart scheduling
    priority: {
        type: String,
        enum: ['normal', 'urgent', 'emergency'],
        default: 'normal'
    },
    type: {
        type: String,
        enum: ['presencial', 'online'],
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    dateTime: {
        type: Date,
        required: true,
        index: true
    },
    duration: {
        type: Number, // in minutes
        default: 30
    },
    status: {
        type: String,
        enum: [
            'scheduled',
            'confirmed',
            'in-waiting-room',
            'in-progress',
            'completed',
            'cancelled',
            'no-show'
        ],
        default: 'scheduled'
    },
    // Telemedicine details (when type is 'online')
    telemedicine: {
        roomId: String,
        agoraToken: String,
        zoomMeetingId: String,
        recordingUrl: String
    },
    reason: {
        type: String,
        required: [true, 'Please provide reason for appointment']
    },
    notes: String,
    cancelReason: String,
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancelledAt: Date,
    confirmationSent: {
        sms: {
            sent: { type: Boolean, default: false },
            sentAt: Date
        },
        email: {
            sent: { type: Boolean, default: false },
            sentAt: Date
        },
        push: {
            sent: { type: Boolean, default: false },
            sentAt: Date
        }
    },
    reminderSent: {
        sms: {
            sent: { type: Boolean, default: false },
            sentAt: Date
        },
        email: {
            sent: { type: Boolean, default: false },
            sentAt: Date
        },
        push: {
            sent: { type: Boolean, default: false },
            sentAt: Date
        }
    },
    // Timestamps for analytics
    checkedInAt: Date,
    startedAt: Date,
    completedAt: Date,
    confirmedAt: Date // For tracking confirmation time
}, {
    timestamps: true
});

// Generate unique appointment number
appointmentSchema.pre('save', async function (next) {
    if (!this.appointmentNumber) {
        const count = await mongoose.model('Appointment').countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        this.appointmentNumber = `APT${year}${month}${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Index for efficient querying
appointmentSchema.index({ doctor: 1, dateTime: 1 });
appointmentSchema.index({ patient: 1, dateTime: 1 });
appointmentSchema.index({ status: 1, dateTime: 1 });
appointmentSchema.index({ clinic: 1, dateTime: 1 }); // Multi-clinic support


export default mongoose.model('Appointment', appointmentSchema);
