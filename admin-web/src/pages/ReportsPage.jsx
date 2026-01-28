import { useState, useEffect } from 'react';
import {
    TrendingUp, Download, Calendar, Filter,
    DollarSign, CreditCard, Users, Activity
} from 'lucide-react';
import { billingService } from '../services/billingService';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';

const ReportsPage = () => {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('thisMonth');

    useEffect(() => {
        loadReports();
    }, [dateRange]);

    const loadReports = async () => {
        try {
            const params = getDateRangeParams();
            const data = await billingService.getReports(params);
            setReports(data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const getDateRangeParams = () => {
        const now = new Date();
        switch (dateRange) {
            case 'thisMonth':
                return {
                    startDate: startOfMonth(now).toISOString(),
                    endDate: endOfMonth(now).toISOString()
                };
            case 'lastMonth':
                const lastMonth = subMonths(now, 1);
                return {
                    startDate: startOfMonth(lastMonth).toISOString(),
                    endDate: endOfMonth(lastMonth).toISOString()
                };
            case 'last3Months':
                return {
                    startDate: subMonths(now, 3).toISOString(),
                    endDate: now.toISOString()
                };
            case 'last6Months':
                return {
                    startDate: subMonths(now, 6).toISOString(),
                    endDate: now.toISOString()
                };
            default:
                return {};
        }
    };

    const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const revenueByMethod = reports?.revenueByMethod || [];
    const monthlyRevenue = reports?.monthlyRevenue || [];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                <div className="flex items-center space-x-4">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="input"
                    >
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="last3Months">Last 3 Months</option>
                        <option value="last6Months">Last 6 Months</option>
                    </select>
                    <button className="btn-primary flex items-center space-x-2">
                        <Download className="w-5 h-5" />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(reports?.totalRevenue || 0).toLocaleString()} MT
                            </p>
                            <p className="text-sm text-green-600 mt-1">+12.5% vs last period</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Pending Payments</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(reports?.pendingPayments?.total || 0).toLocaleString()} MT
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {reports?.pendingPayments?.count || 0} invoices
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <Activity className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Avg. Transaction</p>
                            <p className="text-2xl font-bold text-gray-900">2,450 MT</p>
                            <p className="text-sm text-blue-600 mt-1">+5.2% vs last period</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
                            <p className="text-2xl font-bold text-gray-900">1,234</p>
                            <p className="text-sm text-green-600 mt-1">+8.3% vs last period</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Revenue Trend */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="_id.month"
                                tickFormatter={(month) => new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                name="Revenue (MT)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue by Payment Method */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Payment Method</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={revenueByMethod}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="total"
                            >
                                {revenueByMethod.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value.toLocaleString()} MT`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods Breakdown */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
                    <div className="space-y-4">
                        {revenueByMethod.map((method, index) => (
                            <div key={method._id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                        {method._id}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    {method.total.toLocaleString()} MT
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Services */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Services</h2>
                    <div className="space-y-4">
                        {[
                            { service: 'General Consultation', revenue: 45000, count: 234 },
                            { service: 'Laboratory Tests', revenue: 32000, count: 156 },
                            { service: 'Prescriptions', revenue: 28000, count: 189 },
                            { service: 'Telemedicine', revenue: 15000, count: 78 },
                        ].map((item) => (
                            <div key={item.service}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">{item.service}</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {item.revenue.toLocaleString()} MT
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">{item.count} transactions</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
