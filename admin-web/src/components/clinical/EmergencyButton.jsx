import { useState } from 'react';
import { Siren, MapPin, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EmergencyButton = () => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleEmergency = async () => {
        if (!window.confirm('🚨 TEM UMA EMERGÊNCIA REAL? 🚨\n\nIsso irá alertar a equipa médica e despachar assistência imediatamente.')) return;

        setLoading(true);
        try {
            // Get current location
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                // Send request to backend
                await axios.post(`${import.meta.env.VITE_API_URL}/emergency`, {
                    type: 'ambulance',
                    location: {
                        latitude,
                        longitude,
                        address: 'Localização atual (GPS)'
                    },
                    description: 'Paciente solicitou ajuda via botão SOS'
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                setSubmitted(true);
                toast.error('EMERGÊNCIA REGISTADA! EQUIPA A CAMINHO.', { position: 'top-center', duration: 10000 });
                
                // Reset after 30 seconds
                setTimeout(() => setSubmitted(false), 30000);
            }, (error) => {
                toast.error('Erro ao obter localização. A ajuda foi solicitada mesmo assim!');
                // Fallback request without GPS if needed
            });

        } catch (error) {
            toast.error('Erro ao conectar com o serviço de emergência. Tente ligar diretamente.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-xl animate-pulse font-bold text-xs uppercase tracking-tighter shadow-lg">
                <CheckCircle className="w-4 h-4" /> Socorro a Caminho
            </div>
        );
    }

    return (
        <button 
            onClick={handleEmergency}
            disabled={loading}
            className="group relative flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 border-b-4 border-red-900 disabled:opacity-50"
        >
            <div className={`p-1.5 bg-white/20 rounded-lg ${loading ? 'animate-spin' : 'group-hover:animate-pulse'}`}>
                {loading ? <Loader2 className="w-5 h-5" /> : <Siren className="w-5 h-5" />}
            </div>
            <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">Canal SOS</p>
                <p className="text-sm font-black uppercase tracking-tighter">Emergência</p>
            </div>
            
            {/* Pulsing indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
        </button>
    );
};

export default EmergencyButton;
