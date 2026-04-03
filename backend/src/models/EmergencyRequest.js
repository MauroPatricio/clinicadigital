import mongoose from 'mongoose';

const emergencyRequestSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
        index: true
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        index: true
    },
    type: {
        type: String,
        enum: ['ambulance', 'immediate_help', 'paramedic_chat'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'dispatched', 'on_site', 'completed', 'cancelled'],
        default: 'pending',
        index: true
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    vitalSignsAtRequest: {
        heartRate: Number,
        oxygenSaturation: Number
    },
    description: String,
    assignedAmbulance: {
        id: String,
        driverName: String,
        plateNumber: String
    },
    dispatchedAt: Date,
    completedAt: Date
}, {
    timestamps: true
});

export default mongoose.model('EmergencyRequest', emergencyRequestSchema);
