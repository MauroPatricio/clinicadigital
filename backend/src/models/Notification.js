import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'appointment-confirmation',
            'appointment-reminder',
            'appointment-cancelled',
            'medication-reminder',
            'lab-results-ready',
            'payment-received',
            'payment-due',
            'message-received',
            'prescription-ready',
            'general'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },
    channels: [{
        type: String,
        enum: ['push', 'sms', 'email']
    }],
    status: {
        push: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            error: String
        },
        sms: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            error: String
        },
        email: {
            sent: { type: Boolean, default: false },
            sentAt: Date,
            error: String
        }
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    expiresAt: Date
}, {
    timestamps: true
});

// Auto-delete old notifications after expiry
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient querying
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });

export default mongoose.model('Notification', notificationSchema);
