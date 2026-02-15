import Invoice from '../models/Invoice.js';
import RecurringPayment from '../models/RecurringPayment.js';
import Expense from '../models/Expense.js';
import asyncHandler from 'express-async-handler';

// @desc    Get Financial Projections (Revenue & Cash Flow)
// @route   GET /api/owner/projections
// @access  Private/Owner
export const getFinancialProjections = asyncHandler(async (req, res) => {
    const { months = 6, clinicId } = req.query;
    const filter = clinicId ? { clinic: clinicId } : {};

    const numberOfMonths = parseInt(months);
    const currentDate = new Date();

    // 1. Calculate Guaranteed/Recurring Revenue
    // Get active recurring payments
    const activeRecurring = await RecurringPayment.find({
        status: 'active',
        ...filter
    });

    const recurringProjection = [];
    for (let i = 0; i < numberOfMonths; i++) {
        const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
        const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

        let monthlyTotal = 0;

        // Simple projection: assume all active plans continue
        // In reality, this would filter by end_date of plan
        activeRecurring.forEach(plan => {
            if (!plan.endDate || plan.endDate >= monthDate) {
                // Approximate monthly value based on frequency
                let multiplier = 0;
                if (plan.frequency === 'monthly') multiplier = 1;
                if (plan.frequency === 'weekly') multiplier = 4; // Approx
                if (plan.frequency === 'bi-weekly') multiplier = 2;
                if (plan.frequency === 'quarterly') multiplier = 0.33;
                if (plan.frequency === 'yearly') multiplier = 0.083;

                monthlyTotal += (plan.amount * multiplier);
            }
        });

        recurringProjection.push({
            month: monthKey,
            amount: Math.round(monthlyTotal)
        });
    }

    // 2. Calculate Pending Invoices Cash Flow (Likely to receive)
    const pendingInvoices = await Invoice.find({
        paymentStatus: { $in: ['pending', 'partial'] },
        ...filter
    });

    // Bucket by due date
    const pendingCollection = {};
    pendingInvoices.forEach(inv => {
        const d = new Date(inv.dueDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const remaining = inv.totalAmount - inv.paidAmount;
        pendingCollection[key] = (pendingCollection[key] || 0) + remaining;
    });

    // 3. Estimate Expenses
    // Look at last 3 months average expenses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const pastExpenses = await Expense.aggregate([
        {
            $match: {
                date: { $gte: threeMonthsAgo },
                ...filter
            }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const avgMonthlyExpense = pastExpenses.length > 0 ? (pastExpenses[0].total / 3) : 0;

    // Combine into Projection Data
    const projectionData = recurringProjection.map(item => {
        const expectedCollection = pendingCollection[item.month] || 0;
        const totalRevenue = item.amount + expectedCollection; // Recurring + Pending Collections
        const estimatedExpense = avgMonthlyExpense; // Flat estimate
        const netCashFlow = totalRevenue - estimatedExpense;

        return {
            month: item.month,
            recurringRevenue: item.amount,
            expectedCollections: expectedCollection,
            totalRevenue,
            estimatedExpenses: Math.round(estimatedExpense),
            netCashFlow: Math.round(netCashFlow)
        };
    });

    res.status(200).json({
        success: true,
        data: projectionData,
        summary: {
            avgExpenseBase: Math.round(avgMonthlyExpense),
            activeRecurringPlans: activeRecurring.length
        }
    });
});
