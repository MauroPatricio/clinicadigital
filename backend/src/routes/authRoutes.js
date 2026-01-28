import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    setupBiometric,
    registerDevice
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/biometric-setup', protect, setupBiometric);
router.post('/register-device', protect, registerDevice);

export default router;
