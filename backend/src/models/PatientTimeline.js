import mongoose from 'mongoose';

const patientTimelineSchema = new mongoose.Schema({
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
    eventType: {
        type: String,
        enum: ['appointment', 'exam', 'prescription', 'admission', 'discharge', 'procedure', 'vaccination', 'note', 'alert'],
        required: true
    },
    eventDate: {
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
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'pdf', 'document', 'lab-result', 'prescription', 'other']
        },
        url: String,
        name: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    relatedDoctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    relatedAppointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient timeline queries
patientTimelineSchema.index({ patient: 1, eventDate: -1 });
patientTimelineSchema.index({ clinic: 1, eventDate: -1 });
patientTimelineSchema.index({ patient: 1, eventType: 1 });

export default mongoose.model('PatientTimeline', patientTimelineSchema);
