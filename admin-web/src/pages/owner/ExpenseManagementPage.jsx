import { useState, useEffect } from 'react';
import { CreditCard, Plus, Download, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const ExpenseManagementPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState({ total: 0, count: 0, pendingApproval: 0 });
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        category: '',
        status: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, [filters]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const [expensesRes, statsRes] = await Promise.all([
                api.get('/owner/finance/expenses', { params: filters }),
                api.get('/owner/finance/expenses/stats', { params: filters })
            ]);
            setExpenses(expensesRes.data.data);
            setStats(statsRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/owner/finance/expenses/${id}/approve`);
            fetchExpenses();
        } catch (error) {
            console.error('Error approving expense:', error);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/owner/finance/expenses/export', {
                params: filters,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'expenses-export.csv');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
                    <p className="text-gray-600 mt-1">Track and approve business expenses</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExport} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Expense
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                    <p className="text-gray-600 text-sm">Total Expenses</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">${stats.total?.toLocaleString() || 0}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                    <p className="text-gray-600 text-sm">Pending Approval</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingApproval || 0}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                    <p className="text-gray-600 text-sm">Total Entries</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.count || 0}</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" />
                    <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" />
                    <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="">All Categories</option>
                        <option value="salary">Salary</option>
                        <option value="supplies">Supplies</option>
                        <option value="equipment">Equipment</option>
                        <option value="utilities">Utilities</option>
                        <option value="rent">Rent</option>
                    </select>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {expenses.map((expense) => (
                            <tr key={expense._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(expense.date), 'dd/MM/yyyy')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expense.vendor || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">${expense.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs ${expense.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            expense.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                                expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}>
                                        {expense.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {expense.status === 'pending' && (
                                        <button
                                            onClick={() => handleApprove(expense._id)}
                                            className="text-green-600 hover:text-green-800 flex items-center gap-1"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExpenseManagementPage;
