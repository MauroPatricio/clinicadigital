import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export interface User {
    _id: string;
    email: string;
    role: string;
    profile: {
        firstName: string;
        lastName: string;
        phone?: string;
    };
}

export const authService = {
    async login(email: string, password: string): Promise<User> {
        const response = await api.post('/auth/login', { email, password });
        const { user, accessToken, refreshToken } = response.data.data;

        await AsyncStorage.multiSet([
            ['accessToken', accessToken],
            ['refreshToken', refreshToken],
            ['user', JSON.stringify(user)],
        ]);

        return user;
    },

    async register(data: any): Promise<User> {
        const response = await api.post('/auth/register', data);
        const { user, accessToken, refreshToken } = response.data.data;

        await AsyncStorage.multiSet([
            ['accessToken', accessToken],
            ['refreshToken', refreshToken],
            ['user', JSON.stringify(user)],
        ]);

        return user;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user', 'biometricEnabled']);
    },

    async getCurrentUser(): Promise<User | null> {
        const userStr = await AsyncStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    async isAuthenticated(): Promise<boolean> {
        const token = await AsyncStorage.getItem('accessToken');
        return !!token;
    },

    async enableBiometric(): Promise<void> {
        await AsyncStorage.setItem('biometricEnabled', 'true');
    },

    async isBiometricEnabled(): Promise<boolean> {
        const enabled = await AsyncStorage.getItem('biometricEnabled');
        return enabled === 'true';
    },

    async authenticateWithBiometric(): Promise<boolean> {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
            return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to access Clínica Digital',
        });

        return result.success;
    },
};

export default authService;
