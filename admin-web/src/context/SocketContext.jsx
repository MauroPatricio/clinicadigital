import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
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
                newSocket.emit('join-user', user._id);
                
                // Join clinic-specific room
                if (user.currentClinic) {
                    newSocket.emit('join-clinic', user.currentClinic);
                }
            });

            // Generic event listeners for synchronization
            newSocket.on('appointment:created', (data) => {
                console.log('New appointment received:', data);
                toast.success(`Novo agendamento: ${data.patient?.user?.profile?.name || 'Paciente'}`, {
                    icon: '📅',
                    duration: 5000,
                });
            });

            newSocket.on('payment:received', (data) => {
                console.log('New payment received:', data);
                toast.success(`Pagamento recebido: ${data.payment?.amount} MZN`, {
                    icon: '💰',
                    duration: 5000,
                });
            });

            newSocket.on('lab:order_created', (data) => {
                console.log('New lab order created:', data);
                toast.success(`Nova requisição de exames: ${data.orderNumber}`, {
                    icon: '🔬',
                    duration: 5000,
                });
            });

            newSocket.on('chat:new_message', (data) => {
                console.log('New chat message received:', data);
                toast.success('Nova mensagem recebida no chat', {
                    icon: '💬',
                    duration: 4000,
                });
            });

            newSocket.on('emergency:alert', (data) => {
                console.log('🚨 EMERGENCY SOS ALERT:', data);
                toast.error(`🚨 ALERTA SOS: ${data.patientName} em ${data.location}`, {
                    duration: 10000,
                    style: {
                        background: '#ff4b2b',
                        color: '#fff',
                        fontWeight: 'bold',
                    },
                });
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

        // Cleanup on unmount or dependency change
        return () => {
            if (socketRef.current) {
                console.log('Cleaning up socket connection');
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
