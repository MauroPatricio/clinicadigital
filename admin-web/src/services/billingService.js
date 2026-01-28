import api from './api';

export const billingService = {
    // Get all invoices (bills)
    async getInvoices(params = {}) {
        const response = await api.get('/billing/invoices', { params });
        return response.data;
    },

    // Get single invoice
    async getInvoice(id) {
        const response = await api.get(`/billing/invoices/${id}`);
        return response.data;
    },

    // Create invoice
    async createInvoice(invoiceData) {
        const response = await api.post('/billing/invoices', invoiceData);
        return response.data;
    },

    // Update invoice
    async updateInvoice(id, updateData) {
        const response = await api.put(`/billing/invoices/${id}`, updateData);
        return response.data;
    },

    // Get financial stats/reports
    async getStats() {
        const response = await api.get('/billing/stats');
        return response.data;
    },

    async getReports(params = {}) {
        const response = await api.get('/billing/reports', { params });
        return response.data;
    }
};

export default billingService;
