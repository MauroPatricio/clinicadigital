import { useState, useEffect } from 'react';
import { DollarSign, Plus, Download, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const RevenueManagementPage = () => {
    const [revenue, setRevenue] = useState([]);
    const [stats, setStats] = useState({ total: 0, count: 0, averagePerDay: 0 });
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        category: '',
        status: ''
    });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchRevenue();
    }, [filters]);

    const fetchRevenue = async () => {
        try {
            setLoading(true);
            const [revenueRes, statsRes] = await Promise.all([
                api.get('/owner/finance/revenue', { params: filters }),
                api.get('/owner/finance/revenue/stats', { params: filters })
            ]);
            setRevenue(revenueRes.data.data);
            setStats(statsRes.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching revenue:', error);
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/owner/finance/revenue/export', {
                params: filters,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'revenue-export.csv');
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
                    <h1 className="text-3xl font-bold text-gray-900">Revenue Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage all revenue sources</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Revenue
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                    <p className="text-gray-600 text-sm">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">${stats.total?.toLocaleString() || 0}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                    <p className="text-gray-600 text-sm">Total Entries</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.count || 0}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                    <p className="text-gray-600 text-sm">Average/Day</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">${Math.round(stats.averagePerDay || 0).toLocaleString()}</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">All Categories</option>
                        <option value="consultation">Consultation</option>
                        <option value="exam">Exam</option>
                        <option value="procedure">Procedure</option>
                        <option value="medication">Medication</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Revenue Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {revenue.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {format(new Date(item.date), 'dd/MM/yyyy')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.source}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                    ${item.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.paymentMethod}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RevenueManagementPage;
