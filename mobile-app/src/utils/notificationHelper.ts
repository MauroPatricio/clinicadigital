import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const notificationHelper = {
    async registerForPushNotificationsAsync() {
        let token;
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return null;
        }
        token = (await Notifications.getDevicePushTokenAsync()).data;

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    },

    async sendLocalReminder(title: string, body: string, seconds: number = 5) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: { data: 'goes here' },
            },
            trigger: { seconds },
        });
    }
};
