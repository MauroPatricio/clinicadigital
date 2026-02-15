import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, PieChart, BarChart3, Download } from 'lucide-react';
import api from '../../services/api';
import { Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const FinancialDashboard = () => {
    const [period, setPeriod] = useState('month');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        profitMargin: 0
    });
    const [revenueByCategory, setRevenueByCategory] = useState([]);
    const [expensesByCategory, setExpensesByCategory] = useState([]);
    const [cashFlowTrend, setCashFlowTrend] = useState([]);

    useEffect(() => {
        fetchFinancialData();
    }, [period]);

    const fetchFinancialData = async () => {
        try {
            setLoading(true);
            const { startDate, endDate } = getDateRange(period);

            // Fetch cash flow summary
            const cashFlowRes = await api.get('/owner/finance/cash-flow', {
                params: { startDate, endDate }
            });

            setStats({
                revenue: cashFlowRes.data.data.revenue,
                expenses: cashFlowRes.data.data.expenses,
                netProfit: cashFlowRes.data.data.netCashFlow,
                profitMargin: cashFlowRes.data.data.profitMargin
            });

            // Fetch revenue stats
            const revenueStatsRes = await api.get('/owner/finance/revenue/stats', {
                params: { startDate, endDate }
            });
            setRevenueByCategory(revenueStatsRes.data.data.byCategory || []);

            // Fetch expense stats
            const expenseStatsRes = await api.get('/owner/finance/expenses/stats', {
                params: { startDate, endDate }
            });
            setExpensesByCategory(expenseStatsRes.data.data.byCategory || []);

            // Fetch cash flow breakdown for trend
            const cashFlowBreakdownRes = await api.get('/owner/finance/cash-flow/breakdown', {
                params: { startDate, endDate }
            });
            setCashFlowTrend(cashFlowBreakdownRes.data.data || []);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching financial data:', error);
            setLoading(false);
        }
    };

    const getDateRange = (period) => {
        const now = new Date();
        let startDate, endDate;

        if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (period === 'quarter') {
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        } else {
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    };

    // Chart data
    const revenuePieData = {
        labels: revenueByCategory.map(c => c._id),
        datasets: [{
            data: revenueByCategory.map(c => c.total),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
        }]
    };

    const expensesPieData = {
        labels: expensesByCategory.map(c => c._id),
        datasets: [{
            data: expensesByCategory.map(c => c.total),
            backgroundColor: ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6'],
        }]
    };

    const cashFlowLineData = {
        labels: cashFlowTrend.map(t => t.period),
        datasets: [
            {
                label: 'Revenue',
                data: cashFlowTrend.map(t => t.revenue),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3
            },
            {
                label: 'Expenses',
                data: cashFlowTrend.map(t => t.expenses),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.3
            },
            {
                label: 'Net Cash Flow',
                data: cashFlowTrend.map(t => t.netCashFlow),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3
            }
        ]
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
                    <p className="text-gray-600 mt-1">Overview of revenue, expenses, and cash flow</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Total Revenue</p>
                            <h3 className="text-3xl font-bold mt-1">${stats.revenue.toLocaleString()}</h3>
                        </div>
                        <DollarSign className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm">Total Expenses</p>
                            <h3 className="text-3xl font-bold mt-1">${stats.expenses.toLocaleString()}</h3>
                        </div>
                        <CreditCard className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Net Profit</p>
                            <h3 className="text-3xl font-bold mt-1">${stats.netProfit.toLocaleString()}</h3>
                        </div>
                        {stats.netProfit >= 0 ? (
                            <TrendingUp className="w-12 h-12 opacity-80" />
                        ) : (
                            <TrendingDown className="w-12 h-12 opacity-80" />
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Profit Margin</p>
                            <h3 className="text-3xl font-bold mt-1">{stats.profitMargin}%</h3>
                        </div>
                        <PieChart className="w-12 h-12 opacity-80" />
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Category */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-600" />
                        Revenue by Category
                    </h3>
                    <div className="h-64">
                        <Pie data={revenuePieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Expenses by Category */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-red-600" />
                        Expenses by Category
                    </h3>
                    <div className="h-64">
                        <Pie data={expensesPieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* Cash Flow Trend */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Cash Flow Trend
                </h3>
                <div className="h-80">
                    <Line data={cashFlowLineData} options={{ maintainAspectRatio: false, responsive: true }} />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => window.location.href = '/owner/finance/revenue'}
                    className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 transition"
                >
                    <h4 className="font-semibold text-green-900">Manage Revenue</h4>
                    <p className="text-sm text-green-700 mt-1">Track and add revenue entries</p>
                </button>
                <button
                    onClick={() => window.location.href = '/owner/finance/expenses'}
                    className="p-4 bg-red-50 hover:bg-red-100 rounded-lg border-2 border-red-200 transition"
                >
                    <h4 className="font-semibold text-red-900">Manage Expenses</h4>
                    <p className="text-sm text-red-700 mt-1">Review and approve expenses</p>
                </button>
                <button
                    onClick={() => window.location.href = '/owner/finance/commissions'}
                    className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-purple-200 transition"
                >
                    <h4 className="font-semibold text-purple-900">Manage Commissions</h4>
                    <p className="text-sm text-purple-700 mt-1">Calculate and pay commissions</p>
                </button>
            </div>
        </div>
    );
};

export default FinancialDashboard;
