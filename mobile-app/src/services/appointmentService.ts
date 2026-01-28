import api from './api';

export const appointmentService = {
    async getAppointments(params = {}) {
        const response = await api.get('/appointments', { params });
        return response.data;
    },

    async getAppointment(id: string) {
        const response = await api.get(`/appointments/${id}`);
        return response.data.data;
    },

    async createAppointment(data: any) {
        const response = await api.post('/appointments', data);
        return response.data.data;
    },

    async cancelAppointment(id: string, reason: string) {
        const response = await api.delete(`/appointments/${id}`, { data: { reason } });
        return response.data.data;
    },

    async getDoctors(specialty?: string) {
        const params = specialty ? { specialization: specialty } : {};
        const response = await api.get('/doctors', { params });
        return response.data;
    },

    async getDoctorAvailability(doctorId: string, date: string) {
        const response = await api.get(`/appointments/doctor/${doctorId}/availability`, {
            params: { date }
        });
        return response.data.data;
    },
};

export const medicalRecordService = {
    async getRecords() {
        const response = await api.get('/medical-records');
        return response.data;
    },

    async getRecord(id: string) {
        const response = await api.get(`/medical-records/${id}`);
        return response.data.data;
    },
};

export default {
    appointments: appointmentService,
    medicalRecords: medicalRecordService,
};
