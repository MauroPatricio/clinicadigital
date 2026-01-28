import { useState, useEffect } from 'react';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import chatService from '../../services/chatService';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ChatPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load
    useEffect(() => {
        loadConversations();
    }, []);

    // Listen for socket events
    useEffect(() => {
        if (!socket) return;

        socket.on('new-message', ({ conversationId, message }) => {
            // Update messages if conversation is active
            if (activeConversation?._id === conversationId) {
                setMessages(prev => [...prev, message]);

                // Mark as read immediately if active
                chatService.markAsRead(conversationId);
            }

            // Update conversations list (move to top, update preview)
            setConversations(prev => {
                const index = prev.findIndex(c => c._id === conversationId);
                if (index === -1) return prev; // Should reload conversations if new one

                const updated = { ...prev[index] };
                updated.lastMessage = message;
                updated.updatedAt = message.createdAt;

                if (activeConversation?._id !== conversationId) {
                    updated.unreadCount = {
                        ...updated.unreadCount,
                        [user._id]: (updated.unreadCount?.[user._id] || 0) + 1
                    };
                }

                const newConversations = [...prev];
                newConversations.splice(index, 1);
                return [updated, ...newConversations];
            });
        });

        return () => {
            socket.off('new-message');
        };
    }, [socket, activeConversation, user._id]);

    const loadConversations = async () => {
        try {
            const response = await chatService.getConversations();
            setConversations(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error loading conversations:', error);
            setLoading(false);
        }
    };

    const handleSelectConversation = async (conversation) => {
        setActiveConversation(conversation);

        // Reset unread count locally
        setConversations(prev => prev.map(c => {
            if (c._id === conversation._id) {
                const updated = { ...c };
                if (updated.unreadCount) {
                    updated.unreadCount[user._id] = 0;
                }
                return updated;
            }
            return c;
        }));

        try {
            // Join conversation room
            socket?.emit('join-conversation', conversation._id);

            // Mark read
            chatService.markAsRead(conversation._id);

            const response = await chatService.getMessages(conversation._id);
            setMessages(response.data?.messages || []);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async (content) => {
        if (!activeConversation) return;

        try {
            // Optimistic update
            const tempMessage = {
                _id: Date.now().toString(),
                content,
                sender: user,
                createdAt: new Date().toISOString(),
                status: 'sending'
            };

            setMessages(prev => [...prev, tempMessage]);

            const response = await chatService.sendMessage(activeConversation._id, content);

            // Replace temp message with real one
            setMessages(prev => prev.map(m =>
                m._id === tempMessage._id ? response.data : m
            ));

            // Update conversations list
            setConversations(prev => {
                const index = prev.findIndex(c => c._id === activeConversation._id);
                if (index === -1) return prev;

                const updated = { ...prev[index] };
                updated.lastMessage = response.data;
                updated.updatedAt = response.data.createdAt;

                const newConversations = [...prev];
                newConversations.splice(index, 1);
                return [updated, ...newConversations];
            });

        } catch (error) {
            console.error('Error sending message:', error);
            // Could show error state on message
        }
    };

    const handleCreateNew = () => {
        // Implement modal or redirect to user selection
        alert(t('messages.comingSoon'));
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <ConversationList
                conversations={conversations}
                activeConversation={activeConversation}
                onSelectConversation={handleSelectConversation}
                onCreateNew={handleCreateNew}
            />
            <ChatWindow
                conversation={activeConversation}
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={loading}
            />
        </div>
    );
};

export default ChatPage;
