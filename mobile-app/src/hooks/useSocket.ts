import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notificationService';
import { updateAppointmentStatus } from '../store/slices/appointmentSlice';

// Use same logic as api.ts to avoid hardcoded IP mismatch
const SOCKET_URL = __DEV__
    ? 'http://192.168.1.100:5000'
    : 'https://api.clinicadigitalantigravity.com';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [isConnected, setIsConnected] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        // Only initialize if authenticated and not already connected
        if (isAuthenticated && user && !socketRef.current) {
            const initSocket = async () => {
                const token = await AsyncStorage.getItem('accessToken');
                
                socketRef.current = io(SOCKET_URL, {
                    auth: { token },
                    transports: ['websocket'],
                });

                socketRef.current.on('connect', () => {
                    console.log('Socket connected (Mobile)');
                    setIsConnected(true);
                    
                    // Join user-specific room
                    socketRef.current?.emit('join-user', user._id);
                });

                socketRef.current.on('disconnect', () => {
                    console.log('Socket disconnected (Mobile)');
                    setIsConnected(false);
                });

                // Listen for Appointment Updates
                socketRef.current.on('appointment:update', (data) => {
                    console.log('Appointment update received:', data);
                    dispatch(updateAppointmentStatus(data));
                    
                    notificationService.scheduleLocalNotification(
                        'Actualização de Consulta',
                        `A sua consulta foi ${data.status === 'confirmed' ? 'confirmada' : 'actualizada'}.`
                    );
                });

                // Listen for Lab Results
                socketRef.current.on('lab:result_ready', (data) => {
                    console.log('Lab results ready:', data);
                    notificationService.scheduleLocalNotification(
                        'Resultados de Exames',
                        data.message || 'Os seus resultados de exames já estão disponíveis na app.'
                    );
                });

                // Listen for Payments
                socketRef.current.on('payment:confirmed', (data) => {
                    console.log('Payment confirmed:', data);
                    notificationService.scheduleLocalNotification(
                        'Pagamento Recebido',
                        'O seu pagamento via M-Pesa foi processado com sucesso.'
                    );
                });

                // Listen for Refunds
                socketRef.current.on('payment:refunded', (data) => {
                    console.log('Payment refunded:', data);
                    notificationService.scheduleLocalNotification(
                        'Pagamento Reembolsado',
                        `Um montante de ${data.amount} MZN foi reembolsado na sua conta.`
                    );
                });

                // Listen for Chat Messages
                socketRef.current.on('chat:new_message', (data) => {
                    console.log('New chat message:', data);
                    notificationService.scheduleLocalNotification(
                        'Nova Mensagem',
                        data.message?.content || 'Recebeu uma nova mensagem no chat.'
                    );
                });

                // Listen for Emergency Updates
                socketRef.current.on('emergency:status_update', (data) => {
                    console.log('Emergency status update:', data);
                    notificationService.scheduleLocalNotification(
                        'Emergência SOS',
                        `O estado da sua emergência foi alterado para: ${data.status}.`
                    );
                });
            };

            initSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, user]);

    return {
        socket: socketRef.current,
        isConnected
    };
};

export default useSocket;
