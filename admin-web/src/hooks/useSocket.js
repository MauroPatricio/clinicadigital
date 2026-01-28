import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const useSocket = (userId) => {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        // Initialize socket connection
        socket = io(SOCKET_URL, {
            auth: {
                token: localStorage.getItem('accessToken')
            }
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            setConnected(true);

            // Join user's personal room
            socket.emit('join-user-room', userId);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [userId]);

    return { socket, connected };
};

export const subscribeToNotifications = (callback) => {
    if (!socket) return;

    socket.on('notification', callback);

    return () => {
        socket.off('notification', callback);
    };
};

export const subscribeToNewMessage = (callback) => {
    if (!socket) return;

    socket.on('new-message', callback);

    return () => {
        socket.off('new-message', callback);
    };
};

export const subscribeToLabResults = (callback) => {
    if (!socket) return;

    socket.on('lab-results-ready', callback);

    return () => {
        socket.off('lab-results-ready', callback);
    };
};

export default {
    useSocket,
    subscribeToNotifications,
    subscribeToNewMessage,
    subscribeToLabResults
};
