import { useState, useEffect, useRef } from 'react';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    MessageSquare, FileText, Share, Settings,
    User, Send, Paperclip
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const VideoConsultationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [consultationTime, setConsultationTime] = useState('00:00');

    // Mock Timer
    useEffect(() => {
        let seconds = 0;
        const interval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            setConsultationTime(`${mins}:${secs}`);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setMessages([...messages, { id: Date.now(), text: newMessage, sender: 'me' }]);
        setNewMessage('');
    };

    const handleEndCall = () => {
        if (window.confirm('Tem certeza que deseja encerrar a consulta?')) {
            toast.success('Consulta encerrada com sucesso');
            navigate('/doctor/consultations');
        }
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
                <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                    {/* Placeholder for Remote Stream */}
                    <div className="text-center">
                        <User className="w-32 h-32 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Aguardando paciente entrar...</p>
                    </div>

                    {/* Local Video (PiP) */}
                    <div className="absolute bottom-24 right-6 w-48 h-36 bg-black rounded-xl border-2 border-gray-700 overflow-hidden shadow-2xl">
                        {videoOn ? (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <span className="text-xs text-gray-400">Você</span>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                <VideoOff className="text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent flex justify-center items-center gap-4">
                    <button
                        onClick={() => setMicOn(!micOn)}
                        className={`p-4 rounded-full transition-colors ${micOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                        {micOn ? <Mic /> : <MicOff />}
                    </button>

                    <button
                        onClick={() => setVideoOn(!videoOn)}
                        className={`p-4 rounded-full transition-colors ${videoOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                        {videoOn ? <Video /> : <VideoOff />}
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
