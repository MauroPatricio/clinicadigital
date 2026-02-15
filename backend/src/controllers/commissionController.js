import Commission from '../models/Commission.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Get all commissions with filters
// @route   GET /api/owner/finance/commissions
// @access  Private/Owner
export const getCommissions = async (req, res, next) => {
    try {
        const { month, year, status, clinic, staffId, page = 1, limit = 50 } = req.query;

        const query = {};
        if (month) query['period.month'] = parseInt(month);
        if (year) query['period.year'] = parseInt(year);
        if (status) query.status = status;
        if (clinic) query.clinic = clinic;
        if (staffId) query.staff = staffId;

        const commissions = await Commission.find(query)
            .populate('staff', 'profile email role')
            .populate('clinic', 'name')
            .populate('approvedBy', 'profile email')
            .sort('-period.year -period.month')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Commission.countDocuments(query);

        res.status(200).json({
            success: true,
            data: commissions,
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

// @desc    Calculate commissions for a period
// @route   POST /api/owner/finance/commissions/calculate
// @access  Private/Owner
export const calculateCommissions = async (req, res, next) => {
    try {
        const { month, year, clinic, staffIds } = req.body;

        if (!month || !year || !clinic) {
            return next(new AppError('Month, year, and clinic are required', 400));
        }

        const User = mongoose.model('User');

        // Get all staff if not specified
        let staffList = staffIds;
        if (!staffIds || staffIds.length === 0) {
            const allStaff = await User.find({
                role: { $in: ['manager', 'staff'] },
                isActive: true
            });
            staffList = allStaff.map(s => s._id.toString());
        }

        const calculated = [];

        for (const staffId of staffList) {
            // Check if already exists
            const existing = await Commission.findOne({
                staff: staffId,
                'period.month': month,
                'period.year': year,
                clinic
            });

            if (existing) {
                calculated.push({ staffId, status: 'already_exists', data: existing });
                continue;
            }

            // Calculate commission
            const calc = await Commission.calculateForStaff(staffId, month, year, clinic);

            // Create commission record
            const commission = await Commission.create({
                staff: staffId,
                period: { month, year },
                clinic,
                totalRevenue: calc.totalRevenue,
                commissionRate: calc.commissionRate,
                commissionAmount: calc.commissionAmount,
                status: 'calculated'
            });

            await commission.populate('staff clinic');
            calculated.push({ staffId, status: 'calculated', data: commission });
        }

        res.status(201).json({
            success: true,
            message: `Calculated commissions for ${calculated.length} staff members`,
            data: calculated
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get commission details
// @route   GET /api/owner/finance/commissions/:id
// @access  Private/Owner
export const getCommissionById = async (req, res, next) => {
    try {
        const commission = await Commission.findById(req.params.id)
            .populate('staff', 'profile email role')
            .populate('clinic', 'name address')
            .populate('approvedBy', 'profile email');

        if (!commission) {
            return next(new AppError('Commission not found', 404));
        }

        res.status(200).json({
            success: true,
            data: commission
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update commission (add bonuses/deductions)
// @route   PATCH /api/owner/finance/commissions/:id
// @access  Private/Owner
export const updateCommission = async (req, res, next) => {
    try {
        const { bonuses, deductions, notes } = req.body;

        const commission = await Commission.findById(req.params.id);

        if (!commission) {
            return next(new AppError('Commission not found', 404));
        }

        if (bonuses) commission.bonuses = bonuses;
        if (deductions) commission.deductions = deductions;
        if (notes) commission.notes = notes;

        await commission.save();
        await commission.populate('staff clinic approvedBy');

        res.status(200).json({
            success: true,
            message: 'Commission updated successfully',
            data: commission
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve commission
// @route   PATCH /api/owner/finance/commissions/:id/approve
// @access  Private/Owner
export const approveCommission = async (req, res, next) => {
    try {
        const commission = await Commission.findById(req.params.id);

        if (!commission) {
            return next(new AppError('Commission not found', 404));
        }

        await commission.approve(req.user._id);
        await commission.populate('staff clinic approvedBy');

        res.status(200).json({
            success: true,
            message: 'Commission approved successfully',
            data: commission
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark commission as paid
// @route   PATCH /api/owner/finance/commissions/:id/pay
// @access  Private/Owner
export const markCommissionAsPaid = async (req, res, next) => {
    try {
        const { paymentMethod } = req.body;

        const commission = await Commission.findById(req.params.id);

        if (!commission) {
            return next(new AppError('Commission not found', 404));
        }

        if (commission.status !== 'approved') {
            return next(new AppError('Commission must be approved before marking as paid', 400));
        }

        if (paymentMethod) commission.paymentMethod = paymentMethod;
        await commission.markAsPaid();
        await commission.populate('staff clinic approvedBy');

        res.status(200).json({
            success: true,
            message: 'Commission marked as paid',
            data: commission
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Export commissions to CSV
// @route   GET /api/owner/finance/commissions/export
// @access  Private/Owner
export const exportCommissions = async (req, res, next) => {
    try {
        const { month, year, clinic, status } = req.query;

        const query = {};
        if (month) query['period.month'] = parseInt(month);
        if (year) query['period.year'] = parseInt(year);
        if (clinic) query.clinic = clinic;
        if (status) query.status = status;

        const commissions = await Commission.find(query)
            .populate('staff', 'profile.firstName profile.lastName email')
            .populate('clinic', 'name')
            .sort('-period.year -period.month')
            .limit(10000);

        // Convert to CSV
        const csvHeaders = 'Period,Staff Name,Email,Total Revenue,Rate %,Commission,Bonuses,Deductions,Net Amount,Status\n';
        const csvRows = commissions.map(c => {
            const staffName = `${c.staff?.profile?.firstName || ''} ${c.staff?.profile?.lastName || ''}`.trim();
            const bonusTotal = c.bonuses.reduce((sum, b) => sum + b.amount, 0);
            const deductionTotal = c.deductions.reduce((sum, d) => sum + d.amount, 0);

            return [
                `${c.period.year}-${String(c.period.month).padStart(2, '0')}`,
                staffName,
                c.staff?.email || 'N/A',
                c.totalRevenue.toFixed(2),
                c.commissionRate,
                c.commissionAmount.toFixed(2),
                bonusTotal.toFixed(2),
                deductionTotal.toFixed(2),
                c.netAmount.toFixed(2),
                c.status
            ].join(',');
        }).join('\n');

        const csv = csvHeaders + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=commissions-export.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};
