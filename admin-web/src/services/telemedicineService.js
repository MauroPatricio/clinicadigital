import api from './api';

export const telemedicineService = {
    // Create video room
    async createRoom(appointmentId) {
        const response = await api.post('/telemedicine/room', { appointmentId });
        return response.data;
    },

    // Get Agora token
    async getToken(appointmentId) {
        const response = await api.get(`/telemedicine/token?appointmentId=${appointmentId}`);
        return response.data;
    },

    // Get active consultations
    async getActiveConsultations() {
        const response = await api.get('/telemedicine/active');
        return response.data;
    },

    // End consultation
    async endConsultation(appointmentId) {
        const response = await api.post(`/telemedicine/${appointmentId}/end`);
        return response.data;
    },

    // Toggle recording
    async toggleRecording(appointmentId, action, recordingUrl = null) {
        const response = await api.post(`/telemedicine/${appointmentId}/recording`, {
            action,
            recordingUrl
        });
        return response.data;
    }
};

export default telemedicineService;
