import logger from '../config/logger.js';

export const mpesaService = {
    /**
     * Initiate M-Pesa C2B Payment (Simulation)
     * @param {string} phone - Patient phone number
     * @param {number} amount - Amount in MZN
     * @param {string} reference - Internal transaction reference
     */
    async initiateC2B(phone, amount, reference) {
        try {
            logger.info(`Initiating M-Pesa payment for ${phone}: ${amount} MT (Ref: ${reference})`);
            
            // In a real scenario, we would call Vodafone MPesa API here
            // Mocking a successful push notification
            return {
                conversationId: 'MP_' + Math.random().toString(36).substr(2, 9),
                transactionId: 'TX_' + Date.now(),
                status: 'pending_user_input',
                message: 'Por favor, confirme o pagamento no seu telemóvel.'
            };
        } catch (error) {
            logger.error(`M-Pesa initiation failed: ${error.message}`);
            throw error;
        }
    },

    /**
     * Check transaction status
     */
    async checkStatus(transactionId) {
        // Mocking 80% success rate for demo
        const isSuccess = Math.random() > 0.2;
        return {
            status: isSuccess ? 'COMPLETED' : 'FAILED',
            reason: isSuccess ? 'Success' : 'User cancelled',
            code: isSuccess ? 'INS-0' : 'INS-10'
        };
    }
};

export default mpesaService;
