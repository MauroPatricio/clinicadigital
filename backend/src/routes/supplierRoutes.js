import express from 'express';
import {
    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier
} from '../controllers/supplierController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(authorize('admin', 'manager', 'pharmacy'), getSuppliers)
    .post(authorize('admin', 'pharmacy'), createSupplier);

router.route('/:id')
    .get(authorize('admin', 'manager', 'pharmacy'), getSupplier)
    .put(authorize('admin', 'pharmacy'), updateSupplier)
    .delete(authorize('admin'), deleteSupplier);

export default router;
