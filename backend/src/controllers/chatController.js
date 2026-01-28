import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// @desc    Get user's conversations
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
    try {
        const conversations = await Chat.find({
            'participants.user': req.user._id,
            isActive: true
        })
            .populate('participants.user', 'profile email role')
            .populate('lastMessage.sender', 'profile')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: conversations.length,
            data: conversations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new conversation
// @route   POST /api/chat/conversations
// @access  Private
export const createConversation = async (req, res, next) => {
    try {
        const { participantIds, type, subject } = req.body;

        // Add current user to participants
        const participants = [
            { user: req.user._id, role: req.user.role }
        ];

        // Add other participants
        for (const userId of participantIds) {
            const user = await User.findById(userId);
            if (user) {
                participants.push({ user: userId, role: user.role });
            }
        }

        const conversation = await Chat.create({
            participants,
            type: type || 'patient-support',
            metadata: {
                subject
            }
        });

        await conversation.populate('participants.user', 'profile email role');

        logger.info(`New conversation created by ${req.user.email}`);

        res.status(201).json({
            success: true,
            data: conversation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get messages from conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getMessages = async (req, res, next) => {
    try {
        const { limit = 50, skip = 0 } = req.query;

        const conversation = await Chat.findById(req.params.id)
            .populate('participants.user', 'profile email role')
            .populate('messages.sender', 'profile');

        if (!conversation) {
            return next(new AppError('Conversation not found', 404));
        }

        // Check if user is participant
        const isParticipant = conversation.participants.some(
            p => p.user._id.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return next(new AppError('Not authorized to access this conversation', 403));
        }

        // Get paginated messages
        const messages = conversation.messages
            .slice(parseInt(skip), parseInt(skip) + parseInt(limit))
            .reverse();

        res.status(200).json({
            success: true,
            count: messages.length,
            total: conversation.messages.length,
            data: {
                conversation,
                messages
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send message
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
    try {
        const { content, type, attachment } = req.body;

        const conversation = await Chat.findById(req.params.id);

        if (!conversation) {
            return next(new AppError('Conversation not found', 404));
        }

        // Check if user is participant
        const isParticipant = conversation.participants.some(
            p => p.user.toString() === req.user._id.toString()
        );

        if (!isParticipant) {
            return next(new AppError('Not authorized to send messages in this conversation', 403));
        }

        // Create message
        const message = {
            sender: req.user._id,
            content,
            type: type || 'text',
            attachment,
            createdAt: Date.now()
        };

        conversation.messages.push(message);

        // Update last message
        conversation.lastMessage = {
            content,
            sender: req.user._id,
            createdAt: message.createdAt
        };

        // Update unread counts for other participants
        conversation.participants.forEach(participant => {
            const userId = participant.user.toString();
            if (userId !== req.user._id.toString()) {
                const currentCount = conversation.unreadCount.get(userId) || 0;
                conversation.unreadCount.set(userId, currentCount + 1);
            }
        });

        await conversation.save();

        // Emit via Socket.IO to all participants
        const io = req.app.get('io');
        if (io) {
            conversation.participants.forEach(participant => {
                const userId = participant.user.toString();
                if (userId !== req.user._id.toString()) {
                    io.to(`user-${userId}`).emit('new-message', {
                        conversationId: conversation._id,
                        message
                    });
                }
            });
        }

        logger.info(`Message sent in conversation ${conversation._id}`);

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/conversations/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
    try {
        const conversation = await Chat.findById(req.params.id);

        if (!conversation) {
            return next(new AppError('Conversation not found', 404));
        }

        // Reset unread count for current user
        conversation.unreadCount.set(req.user._id.toString(), 0);

        // Mark messages as read by current user
        conversation.messages.forEach(message => {
            if (!message.readBy) {
                message.readBy = [];
            }
            const alreadyRead = message.readBy.some(
                r => r.user.toString() === req.user._id.toString()
            );
            if (!alreadyRead) {
                message.readBy.push({
                    user: req.user._id,
                    readAt: Date.now()
                });
            }
        });

        await conversation.save();

        res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getConversations,
    createConversation,
    getMessages,
    sendMessage,
    markAsRead
};
