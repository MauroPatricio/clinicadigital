import api from './api';

export const labService = {
    async getLabExams(params = {}) {
        try {
            const response = await api.get('/lab/exams', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching lab exams:', error);
            // Mock fallback
            return {
                data: [
                    { id: '1', name: 'Hemograma Completo', date: new Date().toISOString(), status: 'pending', clinic: 'Clínica Central' },
                    { id: '2', name: 'Glicemia em Jejum', date: new Date(Date.now() - 86400000).toISOString(), status: 'completed', result: '95 mg/dL', normalRange: '70-99 mg/dL', clinic: 'Laboratório Maputo' },
                ]
            };
        }
    },

    async getExamResults(examId: string) {
        const response = await api.get(`/lab/exams/${examId}/results`);
        return response.data.data;
    },

    async downloadResultPDF(examId: string) {
        const response = await api.get(`/lab/exams/${examId}/pdf`, { responseType: 'blob' });
        return response.data;
    },

    async getComparativeData(testType: string) {
        // For charts
        return {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [
                {
                    data: [90, 105, 98, 110, 95, 102],
                    label: testType,
                }
            ]
        };
    }
};

export default labService;
