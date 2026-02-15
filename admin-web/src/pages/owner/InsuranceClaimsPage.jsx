import { useState, useEffect } from 'react';
import {
    FileText, Search, CreditCard, CheckCircle,
    Clock, AlertCircle, TrendingUp, Filter
} from 'lucide-react';

const InsuranceClaimsPage = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        amount_pending: 0
    });

    useEffect(() => {
        // Mock data fetch
        setTimeout(() => {
            const data = [
                { id: 'CLM-001', invoice: 'INV-2024-001', patient: 'Maria Silva', provider: 'MediPlus', amount: 2500, date: '2024-01-15', status: 'pending' },
                { id: 'CLM-002', invoice: 'INV-2024-003', patient: 'João Paulo', provider: 'Global Health', amount: 5000, date: '2024-01-20', status: 'submitted' },
                { id: 'CLM-003', invoice: 'INV-2024-004', patient: 'Ana Beatriz', provider: 'MediPlus', amount: 1500, date: '2024-01-22', status: 'rejected' },
                { id: 'CLM-004', invoice: 'INV-2024-006', patient: 'Antonio Dias', provider: 'Seguradora Unida', amount: 3200, date: '2024-01-25', status: 'approved' },
            ];
            setClaims(data);
            setStats({
                pending: 2,
                approved: 1,
                amount_pending: 7500
            });
            setLoading(false);
        }, 800);
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Faturas Pendentes (Seguros)</h1>
                    <p className="text-gray-600">Gerencie submissões e reembolsos de seguradoras.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filtros
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Nova Submissão
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Reclamações Pendentes</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.pending}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Aprovadas (Mês)</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.approved}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Valor em Processamento</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(stats.amount_pending)}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Reclamação</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seguradora</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                        Carregando...
                                    </td>
                                </tr>
                            ) : claims.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        Nenhuma reclamação encontrada.
                                    </td>
                                </tr>
                            ) : (
                                claims.map((claim) => (
                                    <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {claim.id}
                                            <span className="block text-xs text-gray-500 font-normal">{claim.invoice}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {claim.patient}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {claim.provider}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(claim.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(claim.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(claim.status)} capitalize`}>
                                                {claim.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                                                {claim.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm">Gerenciar</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InsuranceClaimsPage;
