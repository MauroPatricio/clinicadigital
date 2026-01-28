import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);

router.post('/',
    authorize('admin'),
    notificationController.createNotification
);

export default router;
