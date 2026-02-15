import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ConnectivityContext = createContext();

export const useConnectivity = () => {
    const context = useContext(ConnectivityContext);
    if (!context) {
        throw new Error('useConnectivity must be used within ConnectivityProvider');
    }
    return context;
};

export const ConnectivityProvider = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                toast.success('Conexão restaurada', {
                    icon: '🌐',
                    duration: 3000,
                });
                setWasOffline(false);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            toast.error('Sem conexão à internet', {
                icon: '📡',
                duration: 5000,
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    return (
        <ConnectivityContext.Provider
            value={{
                isOnline,
            }}
        >
            {children}
        </ConnectivityContext.Provider>
    );
};
