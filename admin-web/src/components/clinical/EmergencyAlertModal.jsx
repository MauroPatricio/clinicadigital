import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MapPin, Phone, CheckCircle, XCircle, Siren, Navigation } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import AmbulanceTracker from './AmbulanceTracker';

const EmergencyAlertModal = () => {
    const { socket } = useSocket();
    const [emergency, setEmergency] = useState(null);
    const [showTracker, setShowTracker] = useState(false);
    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3')); // Emergency siren sound

    useEffect(() => {
        const siren = audioRef.current;
        siren.loop = true;

        if (!socket) return;

        socket.on('emergency-alert', (data) => {
            setEmergency(data);
            siren.play().catch(err => console.error('Audio play failed:', err));
            toast.error('ALERTA DE EMERGÊNCIA RECEBIDO!', { 
                duration: 15000,
                icon: '🚨',
                style: {
                    borderRadius: '16px',
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 'bold',
                }
            });
        });

        return () => {
            socket.off('emergency-alert');
            siren.pause();
        };
    }, [socket]);

    if (!emergency && !showTracker) return null;

    const handleDismiss = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setEmergency(null);
        setShowTracker(false);
    };

    const handleDispatch = () => {
        toast.success('Ambulância em rota! Iniciando Rastreamento...', { icon: '🚑' });
        audioRef.current.pause();
        setShowTracker(true);
    };

    if (showTracker) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fadeIn">
                <AmbulanceTracker 
                    emergency={emergency} 
                    onClose={handleDismiss} 
                />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.6)] border-8 border-red-500 animate-pulse-slow">
                {/* Header */}
                <div className="bg-gradient-to-b from-red-500 to-red-700 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl ring-4 ring-red-400/50 animate-bounce">
                            <Siren className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">Emergência Crítica</h2>
                        <div className="flex items-center justify-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                             <p className="text-red-100 font-bold text-sm tracking-widest uppercase opacity-90">Protocolo SOS Ativo</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="flex items-start gap-5 p-5 bg-red-50 rounded-3xl border-2 border-red-100 shadow-inner">
                        <div className="bg-red-600 p-3 rounded-2xl text-white shadow-lg shadow-red-500/30">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-1">Paciente em Risco</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">{emergency?.patientName}</p>
                        </div>
                    </div>

                    <div className="space-y-4 px-2">
                        <div className="flex items-center gap-4 text-gray-700 group cursor-pointer">
                            <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-red-100 transition-colors">
                                <MapPin className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Coordenadas / Endereço</p>
                                <p className="text-sm font-black">{emergency?.location?.address || 'GPS: Maputo, Moçambique'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-gray-700 group cursor-pointer">
                            <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-red-100 transition-colors">
                                <Phone className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contacto Directo</p>
                                <p className="text-sm font-black">+258 84 000 0000</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button 
                            onClick={handleDismiss}
                            className="flex flex-col items-center justify-center gap-1 py-4 bg-gray-100 text-gray-600 rounded-3xl font-black uppercase text-[10px] hover:bg-gray-200 transition-all border-b-4 border-gray-300 active:translate-y-1 active:border-b-0"
                        >
                            <XCircle className="w-5 h-5 mb-1" /> Ignorar
                        </button>
                        <button 
                            onClick={handleDispatch}
                            className="flex flex-col items-center justify-center gap-1 py-4 bg-red-600 text-white rounded-3xl font-black uppercase text-[10px] hover:bg-red-700 transition-all border-b-4 border-red-900 shadow-xl shadow-red-500/40 active:translate-y-1 active:border-b-0"
                        >
                            <Navigation className="w-5 h-5 mb-1 animate-pulse" /> Despachar
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <div className="flex items-center justify-center gap-3">
                        <span className="w-8 h-px bg-gray-200"></span>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                            Centro de Gestão de Crise
                        </p>
                        <span className="w-8 h-px bg-gray-200"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyAlertModal;
