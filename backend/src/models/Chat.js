import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    participants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: String,
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    type: {
        type: String,
        enum: ['patient-support', 'patient-doctor', 'group'],
        required: true
    },
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['text', 'image', 'document', 'video', 'audio'],
            default: 'text'
        },
        attachment: {
            url: String,
            filename: String,
            size: Number,
            mimeType: String
        },
        readBy: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            readAt: Date
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastMessage: {
        content: String,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: Date
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        subject: String,
        relatedAppointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment'
        }
    }
}, {
    timestamps: true
});

// Update last message on new message
chatSchema.pre('save', function (next) {
    if (this.messages && this.messages.length > 0) {
        const lastMsg = this.messages[this.messages.length - 1];
        this.lastMessage = {
            content: lastMsg.content,
            sender: lastMsg.sender,
            createdAt: lastMsg.createdAt
        };
    }
    next();
});

// Index for efficient querying
chatSchema.index({ 'participants.user': 1, isActive: 1 });
chatSchema.index({ updatedAt: -1 });

export default mongoose.model('Chat', chatSchema);
