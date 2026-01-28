import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/services/notificationService';

export default function App() {
    useEffect(() => {
        // Register for push notifications
        notificationService.registerForPushNotifications();

        // Listen for notifications
        const subscription = notificationService.addNotificationReceivedListener((notification) => {
            console.log('Notification received:', notification);
        });

        const responseSubscription = notificationService.addNotificationResponseReceivedListener((response) => {
            console.log('Notification response:', response);
            // Handle notification tap
        });

        return () => {
            subscription.remove();
            responseSubscription.remove();
        };
    }, []);

    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <PaperProvider>
                    <StatusBar style="auto" />
                    <AppNavigator />
                </PaperProvider>
            </SafeAreaProvider>
        </Provider>
    );
}
