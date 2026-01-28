import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },
    number: {
        type: String,
        required: [true, 'Room number is required'],
        trim: true
    },
    name: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['consultation', 'procedure', 'emergency', 'examination', 'laboratory', 'radiology'],
        default: 'consultation'
    },
    floor: {
        type: String
    },
    building: {
        type: String
    },
    capacity: {
        type: Number,
        default: 1,
        min: 1
    },
    // Equipment and resources
    equipment: [{
        name: String,
        quantity: Number,
        status: {
            type: String,
            enum: ['operational', 'maintenance', 'out-of-service'],
            default: 'operational'
        }
    }],
    features: [{
        type: String,
        enum: ['wheelchair-accessible', 'private-bathroom', 'oxygen', 'monitoring-equipment', 'examination-table', 'sink']
    }],
    // Availability and status
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance', 'reserved', 'cleaning'],
        default: 'available'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Staff member assigned to this room
    },
    currentAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    // Scheduling
    schedule: [{
        dayOfWeek: {
            type: Number, // 0-6 (Sunday-Saturday)
            min: 0,
            max: 6
        },
        startTime: String, // HH:MM format
        endTime: String,
        available: {
            type: Boolean,
            default: true
        }
    }],
    // Maintenance and notes
    maintenanceSchedule: [{
        date: Date,
        type: {
            type: String,
            enum: ['routine', 'repair', 'deep-cleaning', 'inspection']
        },
        description: String,
        completedAt: Date
    }],
    notes: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for clinic and room number uniqueness
roomSchema.index({ clinic: 1, number: 1 }, { unique: true });

// Index for status queries
roomSchema.index({ clinic: 1, status: 1 });

// Method to check if room is available at a specific time
roomSchema.methods.isAvailableAt = function (datetime) {
    if (this.status !== 'available') {
        return false;
    }

    const dayOfWeek = datetime.getDay();
    const time = datetime.toTimeString().slice(0, 5); // HH:MM

    const daySchedule = this.schedule.find(s => s.dayOfWeek === dayOfWeek);
    if (!daySchedule || !daySchedule.available) {
        return false;
    }

    return time >= daySchedule.startTime && time <= daySchedule.endTime;
};

// Method to occupy the room
roomSchema.methods.occupy = async function (appointmentId, staffId) {
    this.status = 'occupied';
    this.currentAppointment = appointmentId;
    this.assignedTo = staffId;
    return await this.save();
};

// Method to free the room
roomSchema.methods.free = async function () {
    this.status = 'available';
    this.currentAppointment = null;
    // Keep assignedTo for historical purposes
    return await this.save();
};

// Virtual for full display name
roomSchema.virtual('displayName').get(function () {
    return this.name ? `${this.number} - ${this.name}` : this.number;
});

export default mongoose.model('Room', roomSchema);
