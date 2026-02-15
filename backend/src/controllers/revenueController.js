import Revenue from '../models/Revenue.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get all revenue with filters
// @route   GET /api/owner/finance/revenue
// @access  Private/Owner
export const getRevenue = async (req, res, next) => {
    try {
        const {
            startDate,
            endDate,
            category,
            source,
            clinic,
            status,
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
        if (source) query.source = source;
        if (clinic) query.clinic = clinic;
        if (status) query.status = status;

        const revenue = await Revenue.find(query)
            .populate('clinic', 'name type')
            .populate('patient', 'patientNumber user')
            .populate('appointment')
            .sort('-date')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Revenue.countDocuments(query);

        res.status(200).json({
            success: true,
            data: revenue,
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

// @desc    Get revenue statistics
// @route   GET /api/owner/finance/revenue/stats
// @access  Private/Owner
export const getRevenueStats = async (req, res, next) => {
    try {
        const { startDate, endDate, clinic } = req.query;

        const filters = {};
        if (clinic) filters.clinic = clinic;

        const totalRevenue = await Revenue.getTotalRevenue(startDate, endDate, filters);
        const byCategory = await Revenue.getByCategory(startDate, endDate, clinic);

        // Average per day
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const averagePerDay = totalRevenue.total / (days || 1);

        res.status(200).json({
            success: true,
            data: {
                total: totalRevenue.total,
                count: totalRevenue.count,
                averagePerDay: Math.round(averagePerDay * 100) / 100,
                byCategory
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get revenue trends
// @route   GET /api/owner/finance/revenue/trends
// @access  Private/Owner
export const getRevenueTrends = async (req, res, next) => {
    try {
        const { startDate, endDate, period = 'month', clinic } = req.query;

        const filters = {};
        if (clinic) filters.clinic = clinic;

        const trends = await Revenue.getTrends(startDate, endDate, period, filters);

        res.status(200).json({
            success: true,
            data: trends
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single revenue entry
// @route   GET /api/owner/finance/revenue/:id
// @access  Private/Owner
export const getRevenueById = async (req, res, next) => {
    try {
        const revenue = await Revenue.findById(req.params.id)
            .populate('clinic', 'name type address')
            .populate('patient', 'patientNumber user')
            .populate('appointment')
            .populate('bill');

        if (!revenue) {
            return next(new AppError('Revenue entry not found', 404));
        }

        res.status(200).json({
            success: true,
            data: revenue
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create manual revenue entry
// @route   POST /api/owner/finance/revenue
// @access  Private/Owner
export const createRevenue = async (req, res, next) => {
    try {
        const {
            source,
            category,
            amount,
            date,
            clinic,
            patient,
            appointment,
            paymentMethod,
            notes
        } = req.body;

        const revenue = await Revenue.create({
            source,
            category,
            amount,
            date,
            clinic,
            patient,
            appointment,
            paymentMethod,
            status: 'confirmed',
            notes
        });

        await revenue.populate('clinic patient appointment');

        res.status(201).json({
            success: true,
            message: 'Revenue entry created successfully',
            data: revenue
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update revenue entry
// @route   PATCH /api/owner/finance/revenue/:id
// @access  Private/Owner
export const updateRevenue = async (req, res, next) => {
    try {
        const revenue = await Revenue.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('clinic patient appointment');

        if (!revenue) {
            return next(new AppError('Revenue entry not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Revenue entry updated successfully',
            data: revenue
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete revenue entry
// @route   DELETE /api/owner/finance/revenue/:id
// @access  Private/Owner
export const deleteRevenue = async (req, res, next) => {
    try {
        const revenue = await Revenue.findByIdAndDelete(req.params.id);

        if (!revenue) {
            return next(new AppError('Revenue entry not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Revenue entry deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Export revenue to CSV
// @route   GET /api/owner/finance/revenue/export
// @access  Private/Owner
export const exportRevenue = async (req, res, next) => {
    try {
        const { startDate, endDate, category, clinic } = req.query;

        const query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (category) query.category = category;
        if (clinic) query.clinic = clinic;
        query.status = 'confirmed';

        const revenue = await Revenue.find(query)
            .populate('clinic', 'name')
            .populate('patient', 'patientNumber')
            .sort('-date')
            .limit(10000);

        // Convert to CSV
        const csvHeaders = 'Date,Source,Category,Amount,Payment Method,Clinic,Patient,Notes\n';
        const csvRows = revenue.map(r => {
            return [
                new Date(r.date).toISOString().split('T')[0],
                r.source,
                r.category,
                r.amount.toFixed(2),
                r.paymentMethod,
                r.clinic?.name || 'N/A',
                r.patient?.patientNumber || 'N/A',
                (r.notes || '').replace(/,/g, ';')
            ].join(',');
        }).join('\n');

        const csv = csvHeaders + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=revenue-export.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};
