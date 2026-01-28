import { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    FileText,
    Download,
    Plus,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { useTranslation } from 'react-i18next';
import billingService from '../services/billingService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const BillingPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingPayments: { total: 0, count: 0 },
        monthlyRevenue: []
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const { t } = useTranslation();

    useEffect(() => {
        loadData();
    }, [filter]);

    // ... (keep loadData same)

    if (loading && !invoices.length) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('billing.title')}</h1>
                    <p className="text-gray-600">{t('billing.subtitle')}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium">
                    <Plus className="w-5 h-5" />
                    {t('billing.newInvoice')}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                            <DollarSign className="w-5 h-5" />
                            <span className="font-semibold text-sm uppercase tracking-wide">{t('billing.totalRevenue')}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue)}
                        </h3>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+12.5% vs mês anterior</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-yellow-600 mb-2">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-semibold text-sm uppercase tracking-wide">{t('billing.pending')}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.pendingPayments.total)}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">{stats.pendingPayments.count} {t('billing.invoices')} em aberto</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <CreditCard className="w-5 h-5" />
                            <span className="font-semibold text-sm uppercase tracking-wide">{t('billing.averageTicket')}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue > 0 ? stats.totalRevenue / (invoices.length || 1) : 0)}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">{t('billing.perVisit')}</p>
                    </div>
                </div>
            </div>

            {/* Charts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-500" />
                        {t('billing.revenueEvolution')}
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                                />
                                <Area type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Filters/Summary */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-4">Filtrar Faturas</h3>
                    <div className="space-y-2">
                        {['all', 'paid', 'pending', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${filter === status ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <span className="capitalize">{status === 'all' ? 'Todas' : status === 'paid' ? 'Pagas' : status === 'pending' ? 'Pendentes' : 'Canceladas'}</span>
                                {status === filter && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Faturas Recentes</h3>
                    <button className="text-sm text-emerald-600 font-medium hover:underline">Ver todas</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fatura #</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.map((invoice, idx) => (
                                <tr key={invoice._id || idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {invoice.billNumber || `#${String(idx + 1).padStart(4, '0')}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {invoice.patient?.user?.profile?.firstName} {invoice.patient?.user?.profile?.lastName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(invoice.createdAt || Date.now()), 'dd/MM/yyyy')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(invoice.total)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.paymentStatus)}`}>
                                            {invoice.paymentStatus === 'paid' ? 'Pago' : invoice.paymentStatus === 'pending' ? 'Pendente' : 'Cancelado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-gray-400 hover:text-emerald-600 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-500">
                                        Nenhuma fatura encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
