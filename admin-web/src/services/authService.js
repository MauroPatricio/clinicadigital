import api from './api';

export const authService = {
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });

        if (response.data.success) {
            const { data, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data));

            return response.data;
        }

        throw new Error(response.data.message || 'Login failed');
    },

    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data.data;
    },

    getStoredUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },
};

export default authService;
