import logger from '../config/logger.js';

let ioInstance = null;

/**
 * Initialize Socket.io service with the IO instance
 * @param {object} io - Socket.io server instance
 */
export const initSocketService = (io) => {
    ioInstance = io;
    logger.info('SocketService initialized');
};

/**
 * Emit event to a specific user room
 * @param {string} userId - User ID to send event to
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
export const emitToUser = (userId, event, data) => {
    if (ioInstance) {
        ioInstance.to(`user-${userId}`).emit(event, data);
        logger.debug(`Socket event ${event} emitted to user-${userId}`);
    } else {
        logger.warn(`Could not emit event ${event} to user-${userId}: SocketService not initialized`);
    }
};

/**
 * Emit event to a specific clinic room
 * @param {string} clinicId - Clinic ID to send event to
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
export const emitToClinic = (clinicId, event, data) => {
    if (ioInstance) {
        ioInstance.to(`clinic-${clinicId}`).emit(event, data);
        logger.debug(`Socket event ${event} emitted to clinic-${clinicId}`);
    } else {
        logger.warn(`Could not emit event ${event} to clinic-${clinicId}: SocketService not initialized`);
    }
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
export const emitToAll = (event, data) => {
    if (ioInstance) {
        ioInstance.emit(event, data);
        logger.debug(`Socket event ${event} emitted to all`);
    }
};

export default {
    initSocketService,
    emitToUser,
    emitToClinic,
    emitToAll
};
