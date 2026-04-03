import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/services/notificationService';
import SocketHandler from './src/components/SocketHandler';
import './src/i18n';

export default function App() {
    // ... (existing useEffect)

    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <PaperProvider>
                    <StatusBar style="auto" />
                    <SocketHandler />
                    <AppNavigator />
                </PaperProvider>
            </SafeAreaProvider>
        </Provider>
    );
}
