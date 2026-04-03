import { useState, useEffect, useRef } from 'react';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, FileText, Share, Settings,
    User, Send, Paperclip
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import agoraService from '../../services/agoraService';
import { telemedicineService } from '../../services/telemedicineService';

const VideoConsultationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [consultationTime, setConsultationTime] = useState('00:00');
    const [remoteUser, setRemoteUser] = useState(null);
    const [isJoined, setIsJoined] = useState(false);
    const [lowBandwidth, setLowBandwidth] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Agora Setup
    useEffect(() => {
        const initCall = async () => {
            try {
                // 1. Get Token from backend
                const response = await telemedicineService.getToken(id);
                const { token, appId, channelName } = response.data;

                // 2. Setup callbacks
                agoraService.setCallbacks(
                    (user) => {
                        setRemoteUser(user);
                        toast.success('Paciente entrou na sala');
                    },
                    (user) => {
                        setRemoteUser(null);
                        toast.error('Paciente saiu da sala');
                    }
                );

                // 3. Join channel
                const { localVideoTrack } = await agoraService.join(appId, channelName, token);
                
                // 4. Play local video
                if (localVideoRef.current) {
                    localVideoTrack.play(localVideoRef.current);
                }

                setIsJoined(true);
            } catch (error) {
                console.error('Agora Error:', error);
                toast.error('Erro ao iniciar a consulta de vídeo. Verifique suas permissões de câmera.');
            }
        };

        if (id) initCall();

        return () => {
            agoraService.leave();
        };
    }, [id]);

    // Handle Remote Video Rendering
    useEffect(() => {
        if (remoteUser && remoteUser.videoTrack && remoteVideoRef.current) {
            remoteUser.videoTrack.play(remoteVideoRef.current);
        }
    }, [remoteUser]);

    // Mock Timer

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setMessages([...messages, { id: Date.now(), text: newMessage, sender: 'me' }]);
        setNewMessage('');
    };

    const handleEndCall = async () => {
        if (window.confirm('Tem certeza que deseja encerrar a consulta?')) {
            try {
                await agoraService.leave();
                await telemedicineService.endConsultation(id);
                toast.success('Consulta encerrada com sucesso');
                navigate('/doctor/consultations');
            } catch (error) {
                toast.error('Erro ao encerrar consulta');
            }
        }
    };

    const toggleMic = async () => {
        const newState = !micOn;
        await agoraService.toggleAudio(newState);
        setMicOn(newState);
    };

    const toggleVideo = async () => {
        const newState = !videoOn;
        await agoraService.toggleVideo(newState);
        setVideoOn(newState);
    };

    const toggleLowBandwidth = async () => {
        const newState = !lowBandwidth;
        setLowBandwidth(newState);
        // In low bandwidth, we turn off video to save data
        await agoraService.toggleVideo(!newState);
        setVideoOn(!newState);
        toast(newState ? 'Modo baixo consumo ligado (Audio-only)' : 'Modo normal ligado', { icon: '️📶' });
    };

    return (
        <div className="flex h-screen bg-gray-900 overflow-hidden">
            {/* Main Video Area */}
            <div className={`flex-1 relative transition-all duration-300 ${showChat ? 'mr-80' : ''}`}>

                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-white font-bold text-lg">Dr. Mauro Patricio</h2>
                        <p className="text-gray-300 text-sm">Clínica Geral • Em andamento</p>
                    </div>
                    <div className="bg-red-500/80 text-white px-3 py-1 rounded-full text-sm font-mono animate-pulse">
                        REC • {consultationTime}
                    </div>
                </div>

                {/* Remote Video (Patient) */}
                <div className="w-full h-full bg-gray-800 flex items-center justify-center relative overflow-hidden">
                    <div ref={remoteVideoRef} className="w-full h-full"></div>
                    
                    {!remoteUser && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/50">
                            <div className="text-center">
                                <User className="w-32 h-32 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">Aguardando paciente entrar...</p>
                            </div>
                        </div>
                    )}

                    {/* Local Video (PiP) */}
                    <div className="absolute bottom-24 right-6 w-48 h-36 bg-black rounded-xl border-2 border-indigo-500/50 overflow-hidden shadow-2xl z-20">
                        <div ref={localVideoRef} className="w-full h-full"></div>
                        {!videoOn && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <VideoOff className="text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex justify-center items-center gap-4">
                    <button
                        onClick={toggleMic}
                        className={`p-4 rounded-full transition-colors ${micOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                        title={micOn ? 'Desativar Microfone' : 'Ativar Microfone'}
                    >
                        {micOn ? <Mic /> : <MicOff />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-colors ${videoOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                        title={videoOn ? 'Desativar Vídeo' : 'Ativar Vídeo'}
                    >
                        {videoOn ? <Video /> : <VideoOff />}
                    </button>

                    <button
                        onClick={toggleLowBandwidth}
                        className={`p-4 rounded-full transition-colors ${lowBandwidth ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        title="Modo Baixo Consumo de Dados"
                    >
                        <Settings className={lowBandwidth ? 'animate-spin-slow' : ''} />
                    </button>

                    <button
                        onClick={handleEndCall}
                        className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors px-8"
                    >
                        <PhoneOff />
                    </button>

                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`p-4 rounded-full transition-colors ${showChat ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    >
                        <MessageSquare />
                    </button>

                    <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                        <Share />
                    </button>

                    <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                        <FileText />
                    </button>
                </div>
            </div>

            {/* Side Panel (Chat/Notes) */}
            {showChat && (
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl flex flex-col z-20 animate-slideX">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800">Chat & Notas</h3>
                        <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-gray-700">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.length === 0 && (
                            <p className="text-center text-gray-400 text-sm py-4">Nenhuma mensagem ainda.</p>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-white">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <button type="button" className="text-gray-400 hover:text-gray-600">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                placeholder="Digite uma mensagem..."
                                className="flex-1 outline-none text-sm"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="text-indigo-600 hover:text-indigo-800">
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoConsultationPage;
