import express from 'express';
import {
    getStock,
    getStockItem,
    createStockItem,
    updateStockItem,
    deleteStockItem,
    adjustStock
} from '../controllers/stockController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/')
    .get(authorize('admin', 'manager', 'pharmacy'), getStock)
    .post(authorize('admin', 'pharmacy'), createStockItem);

router.route('/:id')
    .get(authorize('admin', 'manager', 'pharmacy', 'doctor'), getStockItem)
    .put(authorize('admin', 'pharmacy'), updateStockItem)
    .delete(authorize('admin'), deleteStockItem);

router.route('/:id/adjust')
    .patch(authorize('admin', 'pharmacy'), adjustStock);

export default router;
