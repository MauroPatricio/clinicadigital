import api from './api';

export const authService = {
    async register(userData) {
        const response = await api.post('/auth/register', userData);

        if (response.data.success) {
            const { user, accessToken, refreshToken } = response.data.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true, data: user, token: accessToken };
        }

        throw new Error(response.data.message || 'Registration failed');
    },

    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });

        if (response.data.success) {
            const { user, accessToken, refreshToken } = response.data.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            return { success: true, data: user, token: accessToken };
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
            localStorage.removeItem('refreshToken');
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
