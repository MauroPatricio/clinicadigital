import Expense from '../models/Expense.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get all expenses with filters
// @route   GET /api/owner/finance/expenses
// @access  Private/Owner
export const getExpenses = async (req, res, next) => {
    try {
        const {
            startDate,
            endDate,
            category,
            status,
            clinic,
            vendor,
            page = 1,
            limit = 50
        } = req.query;

        const query = {};

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (category) query.category = category;
        if (status) query.status = status;
        if (clinic) query.clinic = clinic;
        if (vendor) query.vendor = new RegExp(vendor, 'i');

        const expenses = await Expense.find(query)
            .populate('clinic', 'name type')
            .populate('approvedBy', 'profile email')
            .sort('-date')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Expense.countDocuments(query);

        res.status(200).json({
            success: true,
            data: expenses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get expense statistics
// @route   GET /api/owner/finance/expenses/stats
// @access  Private/Owner
export const getExpenseStats = async (req, res, next) => {
    try {
        const { startDate, endDate, clinic } = req.query;

        const filters = {};
        if (clinic) filters.clinic = clinic;

        const totalExpenses = await Expense.getTotalExpenses(startDate, endDate, filters);
        const byCategory = await Expense.getByCategory(startDate, endDate, clinic);

        // Pending approval count
        const pendingCount = await Expense.countDocuments({ status: 'pending', ...filters });

        res.status(200).json({
            success: true,
            data: {
                total: totalExpenses.total,
                count: totalExpenses.count,
                pendingApproval: pendingCount,
                byCategory
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get expense trends
// @route   GET /api/owner/finance/expenses/trends
// @access  Private/Owner
export const getExpenseTrends = async (req, res, next) => {
    try {
        const { startDate, endDate, period = 'month', clinic } = req.query;

        const filters = {};
        if (clinic) filters.clinic = clinic;

        const trends = await Expense.getTrends(startDate, endDate, period, filters);

        res.status(200).json({
            success: true,
            data: trends
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single expense
// @route   GET /api/owner/finance/expenses/:id
// @access  Private/Owner
export const getExpenseById = async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id)
            .populate('clinic', 'name type address')
            .populate('approvedBy', 'profile email');

        if (!expense) {
            return next(new AppError('Expense not found', 404));
        }

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create expense
// @route   POST /api/owner/finance/expenses
// @access  Private/Owner
export const createExpense = async (req, res, next) => {
    try {
        const expense = await Expense.create(req.body);
        await expense.populate('clinic approvedBy');

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: expense
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update expense
// @route   PATCH /api/owner/finance/expenses/:id
// @access  Private/Owner
export const updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('clinic approvedBy');

        if (!expense) {
            return next(new AppError('Expense not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Expense updated successfully',
            data: expense
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve expense
// @route   PATCH /api/owner/finance/expenses/:id/approve
// @access  Private/Owner
export const approveExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return next(new AppError('Expense not found', 404));
        }

        await expense.approve(req.user._id);
        await expense.populate('clinic approvedBy');

        res.status(200).json({
            success: true,
            message: 'Expense approved successfully',
            data: expense
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete expense
// @route   DELETE /api/owner/finance/expenses/:id
// @access  Private/Owner
export const deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (!expense) {
            return next(new AppError('Expense not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Export expenses to CSV
// @route   GET /api/owner/finance/expenses/export
// @access  Private/Owner
export const exportExpenses = async (req, res, next) => {
    try {
        const { startDate, endDate, category, clinic, status } = req.query;

        const query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (category) query.category = category;
        if (clinic) query.clinic = clinic;
        if (status) query.status = status;

        const expenses = await Expense.find(query)
            .populate('clinic', 'name')
            .populate('approvedBy', 'profile.firstName profile.lastName')
            .sort('-date')
            .limit(10000);

        // Convert to CSV
        const csvHeaders = 'Date,Category,Subcategory,Amount,Vendor,Status,Clinic,Approved By,Description\n';
        const csvRows = expenses.map(e => {
            const approvedBy = e.approvedBy ? `${e.approvedBy.profile?.firstName || ''} ${e.approvedBy.profile?.lastName || ''}`.trim() : 'N/A';
            return [
                new Date(e.date).toISOString().split('T')[0],
                e.category,
                e.subcategory || 'N/A',
                e.amount.toFixed(2),
                e.vendor || 'N/A',
                e.status,
                e.clinic?.name || 'N/A',
                approvedBy,
                (e.description || '').replace(/,/g, ';')
            ].join(',');
        }).join('\n');

        const csv = csvHeaders + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=expenses-export.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};
