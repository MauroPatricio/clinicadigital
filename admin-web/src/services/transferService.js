import api from './api';

/**
 * Transfer Service
 * Handles patient and resource transfers between clinics
 */

const transferService = {
    /**
     * Get transfer requests
     * @param {Object} params - { clinicId, status }
     */
    getTransferRequests: async (params) => {
        try {
            const response = await api.get('/owner/transfers', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching transfer requests:', error);
            // Return mock data
            return [
                {
                    id: 1,
                    type: 'patient',
                    patient: { name: 'João Pedro', id: 'P12345' },
                    fromClinic: 'Clínica Central',
                    toClinic: 'Clínica Norte',
                    status: 'pending',
                    requestDate: '2026-02-10',
                    requestedBy: 'Dra. Maria Santos',
                    reason: 'Transferência para especialidade de Cardiologia',
                },
                {
                    id: 2,
                    type: 'resource',
                    resource: { name: 'Equipamento de Raio-X Portátil', id: 'EQ789' },
                    fromClinic: 'Clínica Sul',
                    toClinic: 'Clínica Central',
                    status: 'approved',
                    requestDate: '2026-02-08',
                    approvalDate: '2026-02-09',
                    requestedBy: 'Dr. António Costa',
                },
            ];
        }
    },

    /**
     * Create new transfer request
     * @param {Object} data - Transfer request data
     */
    createTransferRequest: async (data) => {
        try {
            const response = await api.post('/owner/transfers', data);
            return response.data;
        } catch (error) {
            console.error('Error creating transfer request:', error);
            throw error;
        }
    },

    /**
     * Approve transfer request
     * @param {number} transferId
     */
    approveTransfer: async (transferId) => {
        try {
            const response = await api.patch(`/owner/transfers/${transferId}/approve`);
            return response.data;
        } catch (error) {
            console.error('Error approving transfer:', error);
            throw error;
        }
    },

    /**
     * Reject transfer request
     * @param {number} transferId
     * @param {string} reason
     */
    rejectTransfer: async (transferId, reason) => {
        try {
            const response = await api.patch(`/owner/transfers/${transferId}/reject`, { reason });
            return response.data;
        } catch (error) {
            console.error('Error rejecting transfer:', error);
            throw error;
        }
    },

    /**
     * Get transfer history
     * @param {Object} params - { clinicId }
     */
    getTransferHistory: async (params) => {
        try {
            const response = await api.get('/owner/transfers/history', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching transfer history:', error);
            return [];
        }
    },
};

export default transferService;
