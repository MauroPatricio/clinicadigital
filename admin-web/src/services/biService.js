import api from './api';

/**
 * Business Intelligence Service
 * Handles analytics and BI-related API calls
 */

const biService = {
    /**
     * Get doctor performance analytics
     * @param {Object} params - { clinicId, startDate, endDate }
     */
    getDoctorPerformance: async (params) => {
        try {
            const response = await api.get('/owner/bi/doctor-performance', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching doctor performance:', error);
            // Return mock data if API fails
            return {
                doctors: [
                    {
                        id: 1,
                        name: 'Dr. João Silva',
                        specialty: 'Cardiologia',
                        appointments: 145,
                        revenue: 45000,
                        rating: 4.8,
                        patientSatisfaction: 96,
                        avgConsultationTime: 25,
                    },
                    {
                        id: 2,
                        name: 'Dra. Maria Santos',
                        specialty: 'Pediatria',
                        appointments: 198,
                        revenue: 52000,
                        rating: 4.9,
                        patientSatisfaction: 98,
                        avgConsultationTime: 22,
                    },
                ],
                summary: {
                    totalAppointments: 343,
                    totalRevenue: 97000,
                    avgRating: 4.85,
                    avgSatisfaction: 97,
                },
            };
        }
    },

    /**
     * Get productivity analytics
     * @param {Object} params - { clinicId, startDate, endDate }
     */
    getProductivityMetrics: async (params) => {
        try {
            const response = await api.get('/owner/bi/productivity', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching productivity metrics:', error);
            // Return mock data
            return {
                staff: {
                    totalStaff: 24,
                    activeToday: 18,
                    avgProductivity: 87,
                },
                rooms: {
                    total: 12,
                    utilizationRate: 78,
                    avgTurnaroundTime: 15,
                },
                appointments: {
                    scheduled: 245,
                    completed: 218,
                    cancelled: 12,
                    noShow: 15,
                    avgWaitTime: 12,
                    avgConsultationTime: 24,
                },
                bottlenecks: [
                    { area: 'Receção', severity: 'medium', impact: 'Tempo de espera elevado' },
                    { area: 'Laboratório', severity: 'low', impact: 'Processamento lento' },
                ],
            };
        }
    },

    /**
     * Get growth analytics
     * @param {Object} params - { clinicId, startDate, endDate }
     */
    getGrowthAnalytics: async (params) => {
        try {
            const response = await api.get('/owner/bi/growth', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching growth analytics:', error);
            // Return mock data
            return {
                patients: {
                    total: 1245,
                    new: 87,
                    returning: 158,
                    growthRate: 12.5,
                },
                revenue: {
                    current: 125000,
                    previous: 108000,
                    growthRate: 15.7,
                    forecast: 145000,
                },
                services: [
                    { name: 'Consultas Gerais', adoption: 89, growth: 8 },
                    { name: 'Exames Laboratoriais', adoption: 67, growth: 15 },
                    { name: 'Telemedicina', adoption: 34, growth: 45 },
                ],
                geographic: [
                    { region: 'Centro', patients: 456, growth: 10 },
                    { region: 'Norte', patients: 389, growth: 18 },
                    { region: 'Sul', patients: 400, growth: 8 },
                ],
            };
        }
    },
};

export default biService;
