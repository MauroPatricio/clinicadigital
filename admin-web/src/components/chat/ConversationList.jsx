import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale'; // Add enUS
import { Search, MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next'; // Import hook

const ConversationList = ({ conversations, activeConversation, onSelectConversation, onCreateNew }) => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();

    const getDateLocale = () => {
        return i18n.language === 'pt' ? ptBR : enUS;
    };

    const getOtherParticipant = (conversation) => {
        return conversation.participants.find(p => p.user._id !== user._id)?.user;
    };

    const formatTime = (date) => {
        if (!date) return '';
        return format(new Date(date), 'HH:mm', { locale: getDateLocale() });
    };

    const getUnreadCount = (conversation) => {
        // In a real app, this would be per-user unread count from a map or similar
        // For now, assuming if last message wasn't from me and not read, it's unread
        // But backend sends unreadCount map. 
        // Let's use if provided, else 0
        return conversation.unreadCount?.[user._id] || 0;
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 md:w-96">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{t('messages.title')}</h2>
                    <button
                        onClick={onCreateNew}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title={t('messages.newConversation')}
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('messages.searchPlaceholder')}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>{t('messages.noConversations')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {conversations.map((conversation) => {
                            const otherUser = getOtherParticipant(conversation);
                            const isActive = activeConversation?._id === conversation._id;
                            const unreadCount = getUnreadCount(conversation);

                            return (
                                <div
                                    key={conversation._id}
                                    onClick={() => onSelectConversation(conversation)}
                                    className={`
                                        p-4 cursor-pointer transition-colors hover:bg-gray-50
                                        ${isActive ? 'bg-blue-50 hover:bg-blue-50' : ''}
                                    `}
                                >
                                    <div className="flex gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                                                {otherUser?.profile?.firstName?.charAt(0) || '?'}
                                            </div>
                                            {/* Online Status Indicator (mocked for now) */}
                                            {/* <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div> */}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {otherUser?.profile?.firstName} {otherUser?.profile?.lastName}
                                                </h3>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                                    {conversation.lastMessage?.content || t('messages.startConversation')}
                                                </p>
                                                {unreadCount > 0 && (
                                                    <span className="ml-2 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
