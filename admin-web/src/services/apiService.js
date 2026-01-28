import api from './api';

export const dashboardService = {
    async getStats() {
        const response = await api.get('/billing/stats');
        return response.data.data;
    },

    async getRecentAppointments() {
        const response = await api.get('/appointments?limit=5');
        return response.data.data;
    },

    async getRecentPatients() {
        const response = await api.get('/patients?limit=5');
        return response.data.data;
    },
};

export const appointmentService = {
    async getAll(params = {}) {
        const response = await api.get('/appointments', { params });
        return response.data;
    },

    async getById(id) {
        const response = await api.get(`/appointments/${id}`);
        return response.data.data;
    },

    async create(data) {
        const response = await api.post('/appointments', data);
        return response.data.data;
    },

    async update(id, data) {
        const response = await api.put(`/appointments/${id}`, data);
        return response.data.data;
    },

    async cancel(id, reason) {
        const response = await api.delete(`/appointments/${id}`, { data: { reason } });
        return response.data.data;
    },

    async confirm(id) {
        const response = await api.post(`/appointments/${id}/confirm`);
        return response.data.data;
    },
};

export const patientService = {
    async getAll(params = {}) {
        const response = await api.get('/patients', { params });
        return response.data;
    },

    async create(data) {
        const response = await api.post('/patients', data);
        return response.data.data;
    },

    async getById(id) {
        const response = await api.get(`/patients/${id}`);
        return response.data.data;
    },

    async update(id, data) {
        const response = await api.put(`/patients/${id}`, data);
        return response.data.data;
    },
};

export const doctorService = {
    async create(data) {
        const response = await api.post('/doctors', data);
        return response.data.data;
    },

    async getAll(params = {}) {
        const response = await api.get('/doctors', { params });
        return response.data;
    },

    async getById(id) {
        const response = await api.get(`/doctors/${id}`);
        return response.data.data;
    },

    async update(id, data) {
        const response = await api.put(`/doctors/${id}`, data);
        return response.data.data;
    },

    async getStats(id) {
        const response = await api.get(`/doctors/${id}/stats`);
        return response.data.data;
    },
};

export default {
    dashboard: dashboardService,
    appointments: appointmentService,
    patients: patientService,
    doctors: doctorService,
};
