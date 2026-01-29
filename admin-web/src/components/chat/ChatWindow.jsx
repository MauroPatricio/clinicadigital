import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const ChatWindow = ({ conversation, messages, onSendMessage, loading }) => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                    <p className="text-lg font-medium">{t('messages.selectConversation')}</p>
                    <p className="text-sm">{t('messages.chooseContact')}</p>
                </div>
            </div>
        );
    }

    const getOtherParticipant = () => {
        return conversation.participants.find(p => p.user._id !== user._id)?.user;
    };

    const otherUser = getOtherParticipant();

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {otherUser?.profile?.firstName?.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">
                            {otherUser?.profile?.firstName} {otherUser?.profile?.lastName}
                        </h3>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {t('messages.online')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, idx) => {
                    const isMe = message.sender?._id === user._id || message.sender === user._id;
                    const showTime = idx === 0 ||
                        new Date(message.createdAt).getTime() - new Date(messages[idx - 1].createdAt).getTime() > 300000; // 5 mins

                    return (
                        <div key={message._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {showTime && (
                                <div className="w-full text-center my-4">
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                        {format(new Date(message.createdAt), "d 'de' MMMM, HH:mm", { locale: i18n.language === 'pt' ? ptBR : enUS })}
                                    </span>
                                </div>
                            )}
                            <div className={`
                                max-w-[70%] p-3 rounded-2xl shadow-sm text-sm
                                ${isMe
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                                }
                            `}>
                                <p>{message.content}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                {format(new Date(message.createdAt), 'HH:mm')}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <button
                        type="button"
                        className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder={t('messages.typeMessage')}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none max-h-32 min-h-[48px]"
                            rows={1}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`
                            p-3 rounded-xl transition-all shadow-md
                            ${newMessage.trim()
                                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }
                        `}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
