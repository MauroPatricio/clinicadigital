import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // Use a ref to keep track of the socket instance across renders
    const socketRef = useRef(null);

    useEffect(() => {
        if (user && !socketRef.current) {
            // Initialize socket connection
            const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
                auth: {
                    token: localStorage.getItem('token')
                },
                transports: ['websocket'],
                reconnection: true,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);

                // Join user-specific room
                newSocket.emit('join-user-room', user._id);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('error', (err) => {
                console.error('Socket error:', err);
            });

            socketRef.current = newSocket;
            setSocket(newSocket);
        }

        // Cleanup on unmount or user change
        return () => {
            if (!user && socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
        };
    }, [user]);

    const value = {
        socket,
        isConnected,
        onlineUsers
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
