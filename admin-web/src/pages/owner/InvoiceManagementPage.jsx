import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Plus, Search, Filter, Download, FileText, CheckCircle,
    Clock, AlertCircle, ChevronRight, DollarSign, MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const InvoiceManagementPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({ totalAmount: 0, totalPaid: 0, count: 0 });
    const [filters, setFilters] = useState({
        status: '',
        startDate: '',
        endDate: '',
        search: ''
    });

    useEffect(() => {
        loadInvoices();
    }, [filters]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            // Build query string
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const res = await api.get(`/owner/finance/premium/invoices?${params.toString()}`);
            setInvoices(res.data.data);
            setStats(res.data.stats);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar faturas');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-200';
            case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'viewed': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
            case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            paid: 'Pago',
            sent: 'Enviado',
            viewed: 'Visualizado',
            overdue: 'Vencido',
            draft: 'Rascunho',
            pending: 'Pendente'
        };
        return labels[status] || status;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Faturas</h1>
                    <p className="text-gray-500">Gerencie faturas, pagamentos e cobranças</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white transition-colors">
                        <Download className="w-4 h-4" />
                        Exportar
                    </button>
                    <button
                        onClick={() => navigate('/owner/finance/invoices/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Fatura
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500">Total Faturado</p>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.totalAmount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500">Recebido</p>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.totalPaid.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500">Pendente</p>
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {(stats.totalAmount - stats.totalPaid).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-500">Total Emitido</p>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nº fatura, paciente..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="">Todos Status</option>
                        <option value="draft">Rascunho</option>
                        <option value="sent">Enviado</option>
                        <option value="paid">Pago</option>
                        <option value="overdue">Vencido</option>
                    </select>
                    <input
                        type="date"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={filters.startDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fatura</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Paciente</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Data Emissão</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Vencimento</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        Nenhuma fatura encontrada
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr
                                        key={invoice._id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/owner/finance/invoices/${invoice._id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                                            {invoice.isAutoGenerated && (
                                                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Auto</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {invoice.patient?.profile?.firstName} {invoice.patient?.profile?.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">{invoice.patient?.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(invoice.issueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(invoice.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {invoice.totalAmount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                                                {getStatusLabel(invoice.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
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

export default InvoiceManagementPage;
