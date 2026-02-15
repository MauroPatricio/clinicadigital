import { useState, useEffect } from 'react';
import { Building2, DollarSign, Users, TrendingUp, TrendingDown, Calendar, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import SkeletonLoader from '../../components/premium/SkeletonLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CompareClinic = () => {
    const [comparison, setComparison] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadComparison();
    }, [dateRange]);

    const loadComparison = async () => {
        try {
            setLoading(true);
            const response = await api.get('/owner/multi-clinic/compare', {
                params: dateRange
            });
            setComparison(response.data.data);
        } catch (error) {
            console.error('Error loading comparison:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Comparar Clínicas</h1>
                <SkeletonLoader variant="chart" count={2} />
            </div>
        );
    }

    // Prepare chart data
    const revenueData = comparison.map(c => ({
        name: c.clinicName,
        'Receita Total': c.totalRevenue,
        'Receita Paga': c.paidRevenue
    }));

    const appointmentsData = comparison.map(c => ({
        name: c.clinicName,
        'Total': c.totalAppointments,
        'Concluídas': c.completedAppointments
    }));

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Comparar Clínicas</h1>
                    <p className="text-gray-600 mt-1">Análise comparativa de desempenho</p>
                </div>

                {/* Date Range Filter */}
                <div className="flex gap-3 items-center">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Data Inicial</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Data Final</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ranking por Receita</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Posição</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Clínica</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Receita Total</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Receita Paga</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Consultas</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Taxa Conclusão</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Funcionários</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Receita/Staff</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparison.map((clinic, idx) => (
                                <tr key={clinic.clinicId} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                                            idx === 1 ? 'bg-gray-100 text-gray-800' :
                                                idx === 2 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-50 text-blue-700'
                                            }`}>
                                            {idx + 1}º
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-5 h-5 text-gray-400" />
                                            <span className="font-medium text-gray-900">{clinic.clinicName}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(clinic.totalRevenue)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="text-green-700 font-medium">
                                            {formatCurrency(clinic.paidRevenue)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="space-y-1">
                                            <div className="font-medium text-gray-900">
                                                {clinic.totalAppointments}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {clinic.completedAppointments} concluídas
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${parseFloat(clinic.completionRate) >= 80
                                            ? 'bg-green-100 text-green-800'
                                            : parseFloat(clinic.completionRate) >= 60
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {parseFloat(clinic.completionRate) >= 80 ? (
                                                <TrendingUp className="w-3 h-3" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3" />
                                            )}
                                            {clinic.completionRate}%
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">{clinic.staffCount}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <span className="text-purple-700 font-medium">
                                            {formatCurrency(parseFloat(clinic.revenuePerStaff))}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Comparison */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-900">Comparação de Receita</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="Receita Total" fill="#0066CC" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Receita Paga" fill="#00CC99" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Appointments Comparison */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">Comparação de Consultas</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={appointmentsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Total" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Concluídas" fill="#10B981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Insights */}
            {comparison.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Insights</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    <span>
                                        <strong>{comparison[0]?.clinicName}</strong> lidera com receita de{' '}
                                        <strong>{formatCurrency(comparison[0]?.totalRevenue)}</strong>
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    <span>
                                        Maior taxa de conclusão:{' '}
                                        <strong>
                                            {Math.max(...comparison.map(c => parseFloat(c.completionRate)))}%
                                        </strong>
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    <span>
                                        Total de consultas no período:{' '}
                                        <strong>
                                            {comparison.reduce((sum, c) => sum + c.totalAppointments, 0)}
                                        </strong>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompareClinic;
