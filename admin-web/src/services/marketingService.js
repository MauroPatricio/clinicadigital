import api from './api';

/**
 * Marketing Service
 * Handles loyalty programs and customer feedback
 */

const marketingService = {
    /**
     * Get loyalty program configuration and stats
     * @param {string} clinicId
     */
    getLoyaltyProgram: async (clinicId) => {
        try {
            const response = await api.get(`/owner/marketing/loyalty/${clinicId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching loyalty program:', error);
            // Return mock data
            return {
                config: {
                    pointsPerVisit: 10,
                    pointsPerEuro: 1,
                    enabled: true,
                },
                tiers: [
                    { name: 'Bronze', minPoints: 0, discount: 5, color: '#CD7F32' },
                    { name: 'Prata', minPoints: 100, discount: 10, color: '#C0C0C0' },
                    { name: 'Ouro', minPoints: 500, discount: 15, color: '#FFD700' },
                    { name: 'Platinum', minPoints: 1000, discount: 20, color: '#E5E4E2' },
                ],
                stats: {
                    totalMembers: 856,
                    activeMembers: 623,
                    pointsIssued: 45230,
                    pointsRedeemed: 12890,
                    redemptionRate: 28.5,
                },
                topMembers: [
                    { name: 'Maria Silva', points: 1250, tier: 'Platinum' },
                    { name: 'João Costa', points: 890, tier: 'Ouro' },
                    { name: 'Ana Santos', points: 645, tier: 'Ouro' },
                ],
            };
        }
    },

    /**
     * Update loyalty program configuration
     * @param {string} clinicId
     * @param {Object} config
     */
    updateLoyaltyConfig: async (clinicId, config) => {
        try {
            const response = await api.put(`/owner/marketing/loyalty/${clinicId}`, config);
            return response.data;
        } catch (error) {
            console.error('Error updating loyalty config:', error);
            throw error;
        }
    },

    /**
     * Get customer feedback
     * @param {Object} filters - { clinicId, startDate, endDate, rating, status }
     */
    getFeedback: async (filters) => {
        try {
            const response = await api.get('/owner/marketing/feedback', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error fetching feedback:', error);
            // Return mock data
            return {
                feedback: [
                    {
                        id: 1,
                        patient: 'Maria Silva',
                        date: '2026-02-12',
                        rating: 5,
                        category: 'Atendimento',
                        comment: 'Excelente atendimento, equipa muito profissional',
                        status: 'responded',
                        response: 'Obrigado pelo feedback positivo!',
                    },
                    {
                        id: 2,
                        patient: 'João Costa',
                        date: '2026-02-11',
                        rating: 3,
                        category: 'Instalações',
                        comment: 'Sala de espera pequena, tempo de espera elevado',
                        status: 'pending',
                    },
                    {
                        id: 3,
                        patient: 'Ana Santos',
                        date: '2026-02-10',
                        rating: 4,
                        category: 'Médicos',
                        comment: 'Médico muito atencioso, mas consulta rápida demais',
                        status: 'responded',
                        response: 'Agradecemos o feedback. Vamos melhorar.',
                    },
                ],
                stats: {
                    totalFeedback: 234,
                    avgRating: 4.3,
                    nps: 67,
                    responseRate: 78,
                    byCategory: {
                        Atendimento: { count: 89, avg: 4.5 },
                        Médicos: { count: 78, avg: 4.6 },
                        Instalações: { count: 45, avg: 3.8 },
                        Serviços: { count: 22, avg: 4.2 },
                    },
                },
            };
        }
    },

    /**
     * Respond to feedback
     * @param {number} feedbackId
     * @param {string} response
     */
    respondToFeedback: async (feedbackId, response) => {
        try {
            const result = await api.post(`/owner/marketing/feedback/${feedbackId}/respond`, {
                response,
            });
            return result.data;
        } catch (error) {
            console.error('Error responding to feedback:', error);
            throw error;
        }
    },

    /**
     * Create loyalty campaign
     * @param {Object} campaign
     */
    createCampaign: async (campaign) => {
        try {
            const response = await api.post('/owner/marketing/campaigns', campaign);
            return response.data;
        } catch (error) {
            console.error('Error creating campaign:', error);
            throw error;
        }
    },
};

export default marketingService;
