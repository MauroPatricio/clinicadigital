import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
    try {
        const { unreadOnly } = req.query;
        let query = { user: req.user._id };

        if (unreadOnly === 'true') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            read: false
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return next(new AppError('Notification not found', 404));
        }

        if (notification.user.toString() !== req.user._id.toString()) {
            return next(new AppError('Not authorized', 403));
        }

        notification.read = true;
        notification.readAt = Date.now();
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create notification (Internal use)
// @route   POST /api/notifications
// @access  Private (Admin, System)
export const createNotification = async (req, res, next) => {
    try {
        const { userId, type, title, body, data, channels, priority } = req.body;

        const notification = await Notification.create({
            user: userId,
            type,
            title,
            body,
            data,
            channels: channels || ['push'],
            priority: priority || 'normal'
        });

        // TODO: Send actual notifications via FCM, SMS, Email
        // This would be handled by a notification service

        logger.info(`Notification created for user ${userId}: ${type}`);

        // Emit via Socket.IO for real-time
        const io = req.app.get('io');
        if (io) {
            io.to(`user-${userId}`).emit('notification', notification);
        }

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getNotifications,
    markAsRead,
    createNotification
};
