import express from 'express';
import { aiService } from '../services/aiService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

/**
 * @desc Get AI chat response
 * @route POST /api/ai/chat
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;
        const response = await aiService.getChatResponse(message, context);
        res.json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @desc Analyze triage data
 * @route POST /api/ai/analyze-triage
 */
router.post('/analyze-triage', async (req, res) => {
    try {
        const { triageData } = req.body;
        const analysis = await aiService.analyzeTriage(triageData);
        res.json({ success: true, data: analysis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
