import api from './api';

// Get operational report
export const getOperationalReport = async (params = {}) => {
    const response = await api.get('/reports/operational', { params });
    return response.data;
};

// Get clinical/laboratory report
export const getClinicalReport = async (params = {}) => {
    const response = await api.get('/reports/clinical', { params });
    return response.data;
};

// Get financial report
export const getFinancialReport = async (params = {}) => {
    const response = await api.get('/reports/financial', { params });
    return response.data;
};

export default {
    getOperationalReport,
    getClinicalReport,
    getFinancialReport
};
