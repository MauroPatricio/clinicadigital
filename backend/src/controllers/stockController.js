import StockItem from '../models/StockItem.js';
import StockTransaction from '../models/StockTransaction.js';
import logger from '../config/logger.js';

// Get all stock items with filtering
export const getStock = async (req, res) => {
    try {
        const { category, status, lowStock } = req.query;
        let query = {};

        if (category) query.category = category;
        if (status) query.status = status;

        // If searching for low stock, logic is a bit more complex (quantity <= minStockLevel)
        if (lowStock === 'true') {
            query.$expr = { $lte: ["$quantity", "$minStockLevel"] };
        }

        const items = await StockItem.find(query).populate('supplier', 'name');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single stock item
export const getStockItem = async (req, res) => {
    try {
        const item = await StockItem.findById(req.params.id).populate('supplier');
        if (!item) return res.status(404).json({ message: 'Stock item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new stock item
export const createStockItem = async (req, res) => {
    try {
        const newItem = new StockItem(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update stock item
export const updateStockItem = async (req, res) => {
    try {
        const updatedItem = await StockItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedItem) return res.status(404).json({ message: 'Stock item not found' });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Adjust stock quantity (Quick Action)
export const adjustStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { adjustment, reason } = req.body; // adjustment can be positive (restock) or negative (usage)

        const previousQuantity = item.quantity;
        const newQuantity = previousQuantity + adjustment;
        if (newQuantity < 0) return res.status(400).json({ message: 'Insufficient stock' });

        item.quantity = newQuantity;
        await item.save();

        // Create transaction log
        await StockTransaction.create({
            item: id,
            user: req.user._id,
            type: adjustment > 0 ? 'entry' : 'exit',
            quantity: Math.abs(adjustment),
            previousQuantity,
            newQuantity,
            reason: reason || 'Manual adjustment',
            clinic: req.user.currentClinic || item.clinic
        });

        // Real-time alert if low stock
        const io = req.app.get('io');
        if (newQuantity <= item.minStockLevel) {
            io.emit('low-stock-alert', {
                itemId: item._id,
                name: item.name,
                quantity: newQuantity,
                minStockLevel: item.minStockLevel
            });
            logger.warn(`Low stock alert for ${item.name}: ${newQuantity} left.`);
        }

        // Notify all clients of stock change
        io.emit('stock-update', {
            itemId: item._id,
            newQuantity
        });

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete stock item
export const deleteStockItem = async (req, res) => {
    try {
        const deletedItem = await StockItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Stock item not found' });
        res.json({ message: 'Stock item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
