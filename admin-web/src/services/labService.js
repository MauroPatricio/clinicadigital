import api from './api';

export const labService = {
    async getOrders(params = {}) {
        const response = await api.get('/lab/orders', { params });
        return response.data;
    },

    async getOrder(id) {
        const response = await api.get(`/lab/orders/${id}`);
        return response.data.data;
    },

    async createOrder(data) {
        const response = await api.post('/lab/orders', data);
        return response.data.data;
    },

    async uploadResults(id, examIndex, results) {
        const response = await api.post(`/lab/orders/${id}/results`, {
            examIndex,
            results
        });
        return response.data.data;
    },

    async notifyPatient(id) {
        const response = await api.post(`/lab/orders/${id}/notify`);
        return response.data;
    },

    // Owner-specific methods
    async getOwnerRequests(params = {}) {
        const response = await api.get('/owner/laboratory/requests', { params });
        return response.data;
    },

    async getOwnerResults(params = {}) {
        const response = await api.get('/owner/laboratory/results', { params });
        return response.data;
    },

    async getOwnerHistory(params = {}) {
        const response = await api.get('/owner/laboratory/history', { params });
        return response.data;
    },
};

export default labService;
