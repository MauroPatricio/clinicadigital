import { useState, useEffect } from 'react';
import { DollarSign, Calculator, Download, CheckCircle } from 'lucide-react';
import api from '../../services/api';

import { useClinic } from '../../context/ClinicContext';

const CommissionsPage = () => {
    const { currentClinic } = useClinic();
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    useEffect(() => {
        if (currentClinic) {
            fetchCommissions();
        }
    }, [selectedPeriod, currentClinic]);

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/owner/finance/commissions', {
                params: {
                    ...selectedPeriod,
                    clinic: currentClinic?._id
                }
            });
            setCommissions(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching commissions:', error);
            setLoading(false);
        }
    };

    const handleCalculate = async () => {
        if (!currentClinic) {
            alert('Por favor, selecione uma clínica.');
            return;
        }
        try {
            await api.post('/owner/finance/commissions/calculate', {
                ...selectedPeriod,
                clinic: currentClinic._id
            });
            fetchCommissions();
        } catch (error) {
            console.error('Error calculating commissions:', error);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/owner/finance/commissions/${id}/approve`);
            fetchCommissions();
        } catch (error) {
            console.error('Error approving commission:', error);
        }
    };

    const handleMarkAsPaid = async (id) => {
        try {
            await api.patch(`/owner/finance/commissions/${id}/pay`, {
                paymentMethod: 'transfer'
            });
            fetchCommissions();
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    const getTotalCommissions = () => {
        return commissions.reduce((sum, c) => sum + c.netAmount, 0);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Commission Management</h1>
                    <p className="text-gray-600 mt-1">Calculate and manage staff commissions</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCalculate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Calculator className="w-4 h-4" /> Calculate Commissions
                    </button>
                </div>
            </div>

            {/* Period Selector */}
            <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="flex items-center gap-4">
                    <label className="font-medium text-gray-700">Period:</label>
                    <select
                        value={selectedPeriod.month}
                        onChange={(e) => setSelectedPeriod({ ...selectedPeriod, month: parseInt(e.target.value) })}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedPeriod.year}
                        onChange={(e) => setSelectedPeriod({ ...selectedPeriod, year: parseInt(e.target.value) })}
                        className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-purple-100 text-sm">Total Commissions (This Period)</p>
                        <h3 className="text-4xl font-bold mt-1">${getTotalCommissions().toLocaleString()}</h3>
                        <p className="text-purple-100 text-sm mt-2">{commissions.length} staff members</p>
                    </div>
                    <DollarSign className="w-16 h-16 opacity-80" />
                </div>
            </div>

            {/* Commissions Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate %</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bonuses</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {commissions.map((commission) => {
                            const bonusTotal = commission.bonuses?.reduce((sum, b) => sum + b.amount, 0) || 0;
                            const deductionTotal = commission.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0;

                            return (
                                <tr key={commission._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {commission.staff?.profile?.firstName} {commission.staff?.profile?.lastName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        ${commission.totalRevenue.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {commission.commissionRate}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-600">
                                        ${commission.commissionAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                        ${bonusTotal.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                        ${deductionTotal.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        ${commission.netAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs ${commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            commission.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {commission.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        {commission.status === 'calculated' && (
                                            <button
                                                onClick={() => handleApprove(commission._id)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {commission.status === 'approved' && (
                                            <button
                                                onClick={() => handleMarkAsPaid(commission._id)}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                Mark as Paid
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CommissionsPage;
