import logger from '../config/logger.js';

// Socket.IO connection handler
export const handleSocketConnection = (io) => {
    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        // User joins their personal room
        socket.on('join-user-room', (userId) => {
            socket.join(`user-${userId}`);
            logger.info(`Socket ${socket.id} joined user room: user-${userId}`);
        });

        // Join a conversation room
        socket.on('join-conversation', (conversationId) => {
            socket.join(`conversation-${conversationId}`);
            logger.info(`Socket ${socket.id} joined conversation: ${conversationId}`);
        });

        // Leave a conversation room
        socket.on('leave-conversation', (conversationId) => {
            socket.leave(`conversation-${conversationId}`);
            logger.info(`Socket ${socket.id} left conversation: ${conversationId}`);
        });

        // Typing indicator
        socket.on('typing-start', ({ conversationId, userId }) => {
            socket.to(`conversation-${conversationId}`).emit('user-typing', { userId });
        });

        socket.on('typing-stop', ({ conversationId, userId }) => {
            socket.to(`conversation-${conversationId}`).emit('user-stopped-typing', { userId });
        });

        // Video call signaling
        socket.on('join-video-room', (roomId) => {
            socket.join(`video-${roomId}`);
            socket.to(`video-${roomId}`).emit('user-joined', socket.id);
            logger.info(`Socket ${socket.id} joined video room: ${roomId}`);
        });

        socket.on('leave-video-room', (roomId) => {
            socket.leave(`video-${roomId}`);
            socket.to(`video-${roomId}`).emit('user-left', socket.id);
            logger.info(`Socket ${socket.id} left video room: ${roomId}`);
        });

        // Disconnect
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });
};

export default handleSocketConnection;
