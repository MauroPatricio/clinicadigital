import { useState, useEffect } from 'react';
import { 
    Navigation, 
    MapPin, 
    Clock, 
    Zap, 
    ShieldCheck, 
    X,
    ChevronRight,
    Search
} from 'lucide-react';

const AmbulanceTracker = ({ emergency, onClose }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('Em Trânsito');

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setStatus('Chegada ao Local');
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 300);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#0f172a] w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-slate-800 flex flex-col md:flex-row h-[600px] animate-scaleIn">
            {/* Map Area */}
            <div className="flex-1 relative bg-slate-900 overflow-hidden">
                {/* Mock Grid Map */}
                <div className="absolute inset-0 opacity-20" 
                     style={{ 
                         backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', 
                         backgroundSize: '30px 30px' 
                     }}>
                </div>
                
                {/* Stylized Routes */}
                <svg className="absolute inset-0 w-full h-full">
                    <path 
                        d="M 50 100 L 200 150 L 300 100 L 450 300 L 550 250" 
                        fill="none" 
                        stroke="#1e293b" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                    />
                    <path 
                        d="M 50 100 L 200 150 L 300 100 L 450 300 L 550 250" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray="1000"
                        strokeDashoffset={1000 - (progress * 10)}
                        className="transition-all duration-300 ease-linear"
                    />
                </svg>

                {/* Patient Pin */}
                <div className="absolute top-[250px] left-[550px] -translate-x-1/2 -translate-y-1/2 text-center group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-red-600 p-3 rounded-full shadow-2xl border-4 border-[#0f172a] z-10 transition-transform group-hover:scale-110">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="mt-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 whitespace-nowrap">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{emergency?.patientName || 'Paciente'}</p>
                    </div>
                </div>

                {/* Ambulance Icon (Animated) */}
                <div 
                    className="absolute z-20 transition-all duration-300 ease-linear"
                    style={{
                        left: `${50 + (progress * 5)}px`,
                        top: `${100 + (progress * 1.5)}px`,
                    }}
                >
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.6)] border-2 border-blue-400 flex flex-col items-center">
                        <Navigation className="w-5 h-5 text-white animate-pulse" />
                        <div className="absolute -top-1 -right-1 flex gap-1">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                        </div>
                    </div>
                </div>

                {/* Map Controls UI Overlay */}
                <div className="absolute top-6 left-6 flex flex-col gap-3">
                    <div className="bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700 flex items-center gap-3 shadow-2xl">
                        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                            <Search className="w-4 h-4" />
                        </div>
                        <input 
                            type="text" 
                            disabled 
                            value="Maputo, Moçambique" 
                            className="bg-transparent text-xs font-bold text-slate-300 outline-none w-40"
                        />
                    </div>
                </div>

                <div className="absolute bottom-6 right-6">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                        <Zap className="w-3 h-3 fill-current" /> GPS Live Feed
                    </div>
                </div>
            </div>

            {/* Sidebar Info */}
            <div className="w-full md:w-[340px] bg-slate-900 border-l border-slate-800 p-8 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Status SOS</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Live Status */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estado Actual</p>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                                <span className="text-xl font-black text-white">{status}</span>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-3xl border border-slate-700/50">
                                <Clock className="w-5 h-5 text-blue-400 mb-2" />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">ETA</p>
                                <p className="text-lg font-black text-white">{Math.max(0, 10 - Math.floor(progress/10))} Min</p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-3xl border border-slate-700/50">
                                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Confiança</p>
                                <p className="text-lg font-black text-white">99%</p>
                            </div>
                        </div>

                        <div className="h-px bg-slate-800 w-full my-4"></div>

                        {/* Patient Profile Brief */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                                    {emergency?.patientName?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white">{emergency?.patientName}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paciente Crítico</p>
                                </div>
                            </div>
                            <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Nota da Triagem</p>
                                <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                                    "Paciente reporta dores no peito fortes e dificuldades respiratórias. Protocolo de emergência cardiovascular activado."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all mt-8 group flex items-center justify-center gap-2"
                >
                    Fechar Painel <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default AmbulanceTracker;
