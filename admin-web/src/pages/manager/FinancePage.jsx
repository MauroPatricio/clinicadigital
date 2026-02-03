import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Calendar, Filter, Download, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { billingService } from '../../services/billingService';
import toast from 'react-hot-toast';

const FinancePage = () => {
    const { currentClinic } = useClinic();
    const [transactions, setTransactions] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('month');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingRevenue: 0,
        transactionsCount: 0,
        avgTransaction: 0
    });

    useEffect(() => {
        fetchBillingData();
    }, [currentClinic, dateFilter]);

    const fetchBillingData = async () => {
        try {
            setLoading(true);

            // Fetch bills/invoices
            const billsResponse = await billingService.getInvoices({
                dateFilter
            });

            // Fetch billing stats
            const statsResponse = await billingService.getStats();

            if (billsResponse.success) {
                const billsData = billsResponse.data || [];
                setBills(billsData);

                // Transform bills to transactions format for the UI
                const transformedTransactions = billsData.map(bill => ({
                    _id: bill._id,
                    type: bill.items?.[0]?.description?.toLowerCase().includes('consulta') ? 'consultation' : 'exam',
                    description: bill.items?.[0]?.description || 'Serviço',
                    patientName: bill.patient?.user?.profile?.fullName || 'N/A',
                    amount: bill.total || 0,
                    status: bill.paymentStatus || 'pending',
                    paymentMethod: bill.paymentMethod,
                    date: new Date(bill.createdAt),
                    invoiceId: bill.invoiceNumber || bill._id
                }));

                setTransactions(transformedTransactions);
            }

            // Calculate stats from the received data
            if (statsResponse.success && statsResponse.data) {
                const thisMonthData = statsResponse.data.thisMonth || [];

                const paidStats = thisMonthData.find(s => s._id === 'paid') || { total: 0, count: 0 };
                const pendingStats = thisMonthData.find(s => s._id === 'pending') || { total: 0, count: 0 };

                setStats({
                    totalRevenue: paidStats.total || 0,
                    pendingRevenue: pendingStats.total || 0,
                    transactionsCount: paidStats.count || 0,
                    avgTransaction: paidStats.count > 0 ? (paidStats.total / paidStats.count) : 0
                });
            }

        } catch (error) {
            console.error('Error fetching billing data:', error);
            toast.error('Erro ao carregar dados financeiros');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            paid: {
                label: 'Pago',
                className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                icon: CheckCircle
            },
            pending: {
                label: 'Pendente',
                className: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: Clock
            },
            cancelled: {
                label: 'Cancelado',
                className: 'bg-slate-100 text-slate-600 border-slate-200',
                icon: XCircle
            }
        };

        const { label, className, icon: Icon } = config[status];

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${className}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN'
        }).format(amount);
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesStatus;
    });

    // Revenue by payment method
    const revenueByMethod = transactions
        .filter(t => t.status === 'paid' && t.paymentMethod)
        .reduce((acc, t) => {
            acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
            return acc;
        }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display text-slate-900">Gestão Financeira</h1>
                    <p className="text-slate-600 mt-1">Receitas, pagamentos e análise financeira</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary">
                        <Download className="w-5 h-5" />
                        Exportar
                    </button>
                    <button className="btn-primary">
                        <Plus className="w-5 h-5" />
                        Novo Pagamento
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card-gradient">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm font-medium">Receita do Mês</p>
                            <p className="text-3xl font-black text-white mt-2">{formatCurrency(stats.totalRevenue)}</p>
                            <div className="flex items-center gap-1 mt-2 text-emerald-300 text-sm">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-bold">+12.5%</span>
                            </div>
                        </div>
                        <DollarSign className="w-12 h-12 text-white/20" />
                    </div>
                </div>

                <div className="card bg-amber-50 border-amber-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-700 text-sm font-medium">Valores Pendentes</p>
                            <p className="text-3xl font-black text-amber-900 mt-2">{formatCurrency(stats.pendingRevenue)}</p>
                        </div>
                        <Clock className="w-10 h-10 text-amber-600 opacity-20" />
                    </div>
                </div>

                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-600 text-sm font-medium">Total de Transações</p>
                            <p className="text-3xl font-black text-slate-900 mt-2">{stats.transactionsCount}</p>
                        </div>
                        <CreditCard className="w-10 h-10 text-primary-600 opacity-20" />
                    </div>
                </div>

                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-600 text-sm font-medium">Ticket Médio</p>
                            <p className="text-3xl font-black text-slate-900 mt-2">{formatCurrency(stats.avgTransaction)}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-primary-600 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Receita por Método de Pagamento</h3>
                    <div className="space-y-3">
                        {Object.entries(revenueByMethod).map(([method, amount]) => {
                            const percentage = (amount / stats.totalRevenue) * 100;
                            return (
                                <div key={method}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-slate-700">{method}</span>
                                        <span className="text-sm font-bold text-slate-900">{formatCurrency(amount)}</span>
                                    </div>
                                    <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Resumo por Tipo de Serviço</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Consultas</p>
                                <p className="text-xl font-black text-slate-900">
                                    {formatCurrency(transactions.filter(t => t.type === 'consultation' && t.status === 'paid').reduce((s, t) => s + t.amount, 0))}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-600">
                                    {transactions.filter(t => t.type === 'consultation' && t.status === 'paid').length} transações
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Exames</p>
                                <p className="text-xl font-black text-slate-900">
                                    {formatCurrency(transactions.filter(t => t.type === 'exam' && t.status === 'paid').reduce((s, t) => s + t.amount, 0))}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-600">
                                    {transactions.filter(t => t.type === 'exam' && t.status === 'paid').length} transações
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="input md:w-48"
                    >
                        <option value="today">Hoje</option>
                        <option value="week">Última Semana</option>
                        <option value="month">Este Mês</option>
                        <option value="year">Este Ano</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input md:w-48"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="paid">Pagos</option>
                        <option value="pending">Pendentes</option>
                        <option value="cancelled">Cancelados</option>
                    </select>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Histórico de Transações</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">ID / Data</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Descrição</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Paciente</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Método</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Valor</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{transaction.invoiceId}</p>
                                            <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {transaction.date.toLocaleDateString('pt-PT')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="font-medium text-slate-900 text-sm">{transaction.description}</p>
                                        <p className="text-xs text-slate-600 capitalize">{transaction.type === 'consultation' ? 'Consulta' : 'Exame'}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-sm text-slate-700">{transaction.patientName}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-sm text-slate-700">{transaction.paymentMethod || '-'}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="font-bold text-slate-900">{formatCurrency(transaction.amount)}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        {getStatusBadge(transaction.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredTransactions.length === 0 && (
                        <div className="text-center py-12">
                            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600 font-medium">Nenhuma transação encontrada</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancePage;
