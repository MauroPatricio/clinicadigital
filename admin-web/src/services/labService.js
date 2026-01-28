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
};

export default labService;
