import api from './api';

export const medicalRecordService = {
    // Get medical records for a patient
    async getPatientHistory(patientId) {
        const response = await api.get(`/patients/${patientId}/medical-records`);
        return response.data;
    },

    // Get single record
    async getRecord(recordId) {
        const response = await api.get(`/medical-records/${recordId}`);
        return response.data;
    },

    // Create a new medical record (Consultation)
    async createRecord(recordData) {
        const response = await api.post('/medical-records', recordData);
        return response.data;
    },

    // Update specific sections of a record
    async updateRecord(recordId, updateData) {
        const response = await api.patch(`/medical-records/${recordId}`, updateData);
        return response.data;
    },

    // Get prescriptions for a patient
    async getPatientPrescriptions(patientId) {
        const response = await api.get(`/patients/${patientId}/prescriptions`);
        return response.data;
    },

    // Create prescription
    async createPrescription(prescriptionData) {
        const response = await api.post('/prescriptions', prescriptionData);
        return response.data;
    },

    // Create lab order
    async createLabOrder(orderData) {
        const response = await api.post('/lab/orders', orderData);
        return response.data;
    },

    // Get lab orders for a patient
    async getPatientLabOrders(patientId) {
        const response = await api.get(`/patients/${patientId}/lab-orders`);
        return response.data;
    }
};

export default medicalRecordService;
