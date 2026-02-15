import Revenue from '../models/Revenue.js';
import Expense from '../models/Expense.js';

// @desc    Get cash flow analysis
// @route   GET /api/owner/finance/cash-flow
// @access  Private/Owner
export const getCashFlow = async (req, res, next) => {
    try {
        const { startDate, endDate, clinic } = req.query;

        const filters = {};
        if (clinic) filters.clinic = clinic;

        // Get total revenue and expenses
        const totalRevenue = await Revenue.getTotalRevenue(startDate, endDate, filters);
        const totalExpenses = await Expense.getTotalExpenses(startDate, endDate, filters);

        const netCashFlow = totalRevenue.total - totalExpenses.total;
        const profitMargin = totalRevenue.total > 0
            ? ((netCashFlow / totalRevenue.total) * 100).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                revenue: totalRevenue.total,
                expenses: totalExpenses.total,
                netCashFlow,
                profitMargin: parseFloat(profitMargin)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get cash flow projection
// @route   GET /api/owner/finance/cash-flow/projection
// @access  Private/Owner
export const getCashFlowProjection = async (req, res, next) => {
    try {
        const { months = 3, clinic } = req.query;

        // Get last 6 months average for projection
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const today = new Date();

        const filters = {};
        if (clinic) filters.clinic = clinic;

        const avgRevenue = await Revenue.getTotalRevenue(sixMonthsAgo, today, filters);
        const avgExpenses = await Expense.getTotalExpenses(sixMonthsAgo, today, filters);

        const monthlyAvgRevenue = avgRevenue.total / 6;
        const monthlyAvgExpenses = avgExpenses.total / 6;
        const monthlyAvgCashFlow = monthlyAvgRevenue - monthlyAvgExpenses;

        // Project future months
        const projection = [];
        for (let i = 1; i <= parseInt(months); i++) {
            const projectedDate = new Date();
            projectedDate.setMonth(projectedDate.getMonth() + i);

            projection.push({
                month: projectedDate.toISOString().slice(0, 7),
                projectedRevenue: Math.round(monthlyAvgRevenue),
                projectedExpenses: Math.round(monthlyAvgExpenses),
                projectedCashFlow: Math.round(monthlyAvgCashFlow)
            });
        }

        res.status(200).json({
            success: true,
            data: {
                averages: {
                    monthlyRevenue: Math.round(monthlyAvgRevenue),
                    monthlyExpenses: Math.round(monthlyAvgExpenses),
                    monthlyCashFlow: Math.round(monthlyAvgCashFlow)
                },
                projection
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get cash flow summary by period
// @route   GET /api/owner/finance/cash-flow/summary
// @access  Private/Owner
export const getCashFlowSummary = async (req, res, next) => {
    try {
        const { period = 'month', clinic } = req.query;

        // Calculate date ranges
        const now = new Date();
        let startDate, endDate;

        if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (period === 'quarter') {
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        } else { // year
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
        }

        const filters = {};
        if (clinic) filters.clinic = clinic;

        const revenue = await Revenue.getTotalRevenue(startDate, endDate, filters);
        const expenses = await Expense.getTotalExpenses(startDate, endDate, filters);

        const revenueByCategory = await Revenue.getByCategory(startDate, endDate, clinic);
        const expensesByCategory = await Expense.getByCategory(startDate, endDate, clinic);

        res.status(200).json({
            success: true,
            data: {
                period,
                dateRange: {
                    start: startDate,
                    end: endDate
                },
                summary: {
                    totalRevenue: revenue.total,
                    totalExpenses: expenses.total,
                    netCashFlow: revenue.total - expenses.total,
                    profitMargin: revenue.total > 0
                        ? ((revenue.total - expenses.total) / revenue.total * 100).toFixed(2)
                        : 0
                },
                breakdown: {
                    revenueByCategory,
                    expensesByCategory
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get detailed cash flow breakdown
// @route   GET /api/owner/finance/cash-flow/breakdown
// @access  Private/Owner
export const getCashFlowBreakdown = async (req, res, next) => {
    try {
        const { startDate, endDate, clinic } = req.query;

        const filters = {};
        if (clinic) filters.clinic = clinic;

        const revenueTrends = await Revenue.getTrends(startDate, endDate, 'month', filters);
        const expenseTrends = await Expense.getTrends(startDate, endDate, 'month', filters);

        // Combine trends
        const breakdown = revenueTrends.map(r => {
            const expense = expenseTrends.find(e =>
                e._id.year === r._id.year && e._id.month === r._id.month
            );

            return {
                period: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
                revenue: r.total,
                expenses: expense?.total || 0,
                netCashFlow: r.total - (expense?.total || 0)
            };
        });

        res.status(200).json({
            success: true,
            data: breakdown
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Export cash flow report
// @route   GET /api/owner/finance/cash-flow/export
// @access  Private/Owner
export const exportCashFlow = async (req, res, next) => {
    try {
        const { startDate, endDate, clinic } = req.query;

        const filters = {};
        if (clinic) filters.clinic = clinic;

        const revenueTrends = await Revenue.getTrends(startDate, endDate, 'month', filters);
        const expenseTrends = await Expense.getTrends(startDate, endDate, 'month', filters);

        const breakdown = revenueTrends.map(r => {
            const expense = expenseTrends.find(e =>
                e._id.year === r._id.year && e._id.month === r._id.month
            );

            return {
                period: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
                revenue: r.total,
                expenses: expense?.total || 0,
                netCashFlow: r.total - (expense?.total || 0)
            };
        });

        const csvHeaders = 'Period,Revenue,Expenses,Net Cash Flow\n';
        const csvRows = breakdown.map(b =>
            `${b.period},${b.revenue.toFixed(2)},${b.expenses.toFixed(2)},${b.netCashFlow.toFixed(2)}`
        ).join('\n');

        const csv = csvHeaders + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=cash-flow-export.csv');
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};
