import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const notificationService = {
    async registerForPushNotifications(): Promise<string | null> {
        if (!Device.isDevice) {
            console.log('Push notifications only work on physical devices');
            return null;
        }

        try {
            // Request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Permission for push notifications denied');
                return null;
            }

            // Get Expo push token
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Expo Push Token:', token);

            // Save token to backend
            await this.savePushToken(token);

            // Configure Android channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            return token;
        } catch (error) {
            console.error('Error registering for push notifications:', error);
            return null;
        }
    },

    async savePushToken(token: string): Promise<void> {
        try {
            await api.post('/auth/device/register', {
                deviceToken: token,
                platform: Platform.OS,
            });
            await AsyncStorage.setItem('pushToken', token);
        } catch (error) {
            console.error('Error saving push token:', error);
        }
    },

    async scheduleLocalNotification(title: string, body: string, data?: any): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: true,
            },
            trigger: null, // Show immediately
        });
    },

    addNotificationReceivedListener(callback: (notification: any) => void) {
        return Notifications.addNotificationReceivedListener(callback);
    },

    addNotificationResponseReceivedListener(callback: (response: any) => void) {
        return Notifications.addNotificationResponseReceivedListener(callback);
    },

    async cancelAllNotifications(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },

    async getBadgeCount(): Promise<number> {
        return await Notifications.getBadgeCountAsync();
    },

    async setBadgeCount(count: number): Promise<void> {
        await Notifications.setBadgeCountAsync(count);
    },
};

export default notificationService;
