import mongoose from 'mongoose';

const appointmentQueueSchema = new mongoose.Schema({
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    specialty: {
        type: String,
        trim: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    queue: [{
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: true
        },
        position: {
            type: Number,
            required: true
        },
        estimatedTime: {
            type: Date
        },
        status: {
            type: String,
            enum: ['waiting', 'called', 'in-progress', 'completed', 'no-show'],
            default: 'waiting'
        },
        calledAt: {
            type: Date
        },
        startedAt: {
            type: Date
        },
        completedAt: {
            type: Date
        }
    }],
    averageWaitTime: {
        type: Number,
        default: 20
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queue queries
appointmentQueueSchema.index({ clinic: 1, date: 1, doctor: 1 });
appointmentQueueSchema.index({ clinic: 1, date: 1, specialty: 1 });

// Method to get current waiting count
appointmentQueueSchema.methods.getWaitingCount = function () {
    return this.queue.filter(q => q.status === 'waiting').length;
};

// Method to get next patient
appointmentQueueSchema.methods.getNextPatient = function () {
    const waiting = this.queue.filter(q => q.status === 'waiting');
    return waiting.sort((a, b) => a.position - b.position)[0];
};

// Update last updated timestamp on save
appointmentQueueSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});

export default mongoose.model('AppointmentQueue', appointmentQueueSchema);
