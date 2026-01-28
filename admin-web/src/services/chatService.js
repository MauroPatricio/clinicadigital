import api from './api';

export const chatService = {
    // Get all conversations for current user
    async getConversations() {
        const response = await api.get('/chat/conversations');
        return response.data;
    },

    // Get messages for a conversation
    async getMessages(conversationId, skip = 0, limit = 50) {
        const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
            params: { skip, limit }
        });
        return response.data;
    },

    // Send a message
    async sendMessage(conversationId, content, type = 'text', attachment = null) {
        const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
            content,
            type,
            attachment
        });
        return response.data;
    },

    // Create a new conversation
    async createConversation(participantIds, subject = null, type = 'staff') {
        const response = await api.post('/chat/conversations', {
            participantIds,
            subject,
            type
        });
        return response.data;
    },

    // Mark conversation as read
    async markAsRead(conversationId) {
        const response = await api.put(`/chat/conversations/${conversationId}/read`);
        return response.data;
    }
};

export default chatService;
