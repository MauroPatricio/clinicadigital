import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    MessageSquare,
    FileText,
    MoreVertical,
    Share,
    Layout
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import telemedicineService from '../../services/telemedicineService';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const VideoConsultationPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { socket } = useSocket();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roomData, setRoomData] = useState(null);

    // Call States
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [duration, setDuration] = useState(0);

    // Mock refs for video elements
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        initializeCall();

        // Timer
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [appointmentId]);

    const initializeCall = async () => {
        try {
            setLoading(true);
            // 1. Create/Get Room
            const roomRes = await telemedicineService.createRoom(appointmentId);
            const { roomId } = roomRes.data;
            setRoomData(roomRes.data);

            // 2. Get Token (Simulated if Agora not configured)
            try {
                const tokenRes = await telemedicineService.getToken(appointmentId);
                console.log('Token received:', tokenRes);
                // Initialize Agora client here would go here
            } catch (err) {
                console.warn('Agora token not available, using mock video interface');
            }

            // 3. Join Socket Room
            if (socket) {
                socket.emit('join-video-room', roomId);
            }

            // 4. Request Media Permissions
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                toast.error(t('telemedicine.cameraError'));
            }

        } catch (err) {
            console.error(err);
            setError(t('telemedicine.startError'));
        } finally {
            setLoading(false);
        }
    };

    const handleEndCall = async () => {
        if (window.confirm(t('telemedicine.endConfirm'))) {
            try {
                await telemedicineService.endConsultation(appointmentId);

                // Stop local stream
                if (localVideoRef.current && localVideoRef.current.srcObject) {
                    localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
                }

                toast.success(t('telemedicine.endSuccess'));
                navigate('/appointments'); // Or consultation summary
            } catch (err) {
                toast.error(t('telemedicine.endError'));
            }
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center flex-col text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p>{t('telemedicine.connecting')}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PhoneOff className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{t('telemedicine.connectionError')}</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/appointments')}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        {t('telemedicine.backToAgenda')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] bg-gray-900 relative overflow-hidden flex">
            {/* Main Video Area */}
            <div className={`flex-1 relative transition-all duration-300 ${showChat ? 'mr-80' : ''}`}>

                {/* Remote Video (Mock/Real) */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <VideoOff className="w-12 h-12 text-gray-500" />
                        </div>
                        <p className="font-medium text-lg">{t('telemedicine.waitingPatient')}</p>
                        <p className="text-sm opacity-75 mt-2">{t('telemedicine.roomId')}: {roomData?.roomId?.substring(0, 8)}...</p>
                    </div>
                    <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover hidden" />
                </div>

                {/* Local Video (Floating) */}
                <div className="absolute top-6 right-6 w-48 h-36 bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-gray-800">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    {isVideoOff && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <VideoOff className="w-8 h-8 text-gray-500" />
                        </div>
                    )}
                </div>

                {/* Timer Badge */}
                <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-mono font-medium">{formatTime(duration)}</span>
                </div>

                {/* Controls Bar */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700/80 text-white hover:bg-gray-600/80 backdrop-blur-sm'}`}
                    >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <button
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700/80 text-white hover:bg-gray-600/80 backdrop-blur-sm'}`}
                    >
                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </button>
                    <button
                        onClick={handleEndCall}
                        className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg scale-110 mx-4"
                        title={t('telemedicine.endCall')}
                    >
                        <PhoneOff className="w-8 h-8" />
                    </button>
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`p-4 rounded-full transition-all ${showChat ? 'bg-blue-500 text-white' : 'bg-gray-700/80 text-white hover:bg-gray-600/80 backdrop-blur-sm'}`}
                    >
                        <MessageSquare className="w-6 h-6" />
                    </button>
                    <button
                        className="p-4 rounded-full bg-gray-700/80 text-white hover:bg-gray-600/80 backdrop-blur-sm"
                        title={t('telemedicine.shareScreen')}
                    >
                        <Share className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Side Panel (Chat/Notes) */}
            <div className={`fixed right-0 top-[64px] bottom-0 w-80 bg-white border-l border-gray-200 transform transition-transform duration-300 ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800">{t('telemedicine.chatNotes')}</h3>
                        <button onClick={() => setShowChat(false)} className="text-gray-500 hover:text-gray-700">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            <div className="text-center text-xs text-gray-400 my-4">{t('telemedicine.startedAt')} {new Date().toLocaleTimeString()}</div>
                            {/* Mock Chat Messages */}
                            <div className="bg-blue-50 p-3 rounded-lg rounded-tl-none max-w-[85%]">
                                <p className="text-sm text-gray-800">{t('telemedicine.mockMessage')}</p>
                                <span className="text-xs text-gray-400 mt-1 block">{t('telemedicine.you')} - 10:02</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder={t('telemedicine.typeMessage')}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <MessageSquare className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoConsultationPage;
