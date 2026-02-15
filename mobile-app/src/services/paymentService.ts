import api from './api';

export const paymentService = {
    async getInvoices(params = {}) {
        try {
            const response = await api.get('/payments/invoices', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching invoices:', error);
            // Mock fallback
            return {
                data: [
                    { id: '1', description: 'Consulta de Cardiologia', amount: 2500, date: new Date().toISOString(), status: 'pending', clinic: 'Clínica Central' },
                    { id: '2', description: 'Hemograma Completo', amount: 850, date: new Date(Date.now() - 172800000).toISOString(), status: 'paid', clinic: 'Laboratório Maputo' },
                ]
            };
        }
    },

    async processMpesaPayment(invoiceId: string, phoneNumber: string) {
        // Simulation of M-Pesa push
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transactionId: 'MP' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    message: 'Solicitação de pagamento enviada para o telemóvel.'
                });
            }, 2000);
        });
    },

    async processEmolaPayment(invoiceId: string, phoneNumber: string) {
        // Simulation of e-Mola push
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    transactionId: 'EM' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    message: 'Solicitação de pagamento e-Mola enviada.'
                });
            }, 2000);
        });
    },

    async getPaymentHistory() {
        const response = await api.get('/payments/history');
        return response.data.data;
    }
};

export default paymentService;
