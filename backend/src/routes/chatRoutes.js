import express from 'express';
import chatController from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/conversations')
    .get(chatController.getConversations)
    .post(chatController.createConversation);

router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/conversations/:id/messages', chatController.sendMessage);
router.put('/conversations/:id/read', chatController.markAsRead);

export default router;
