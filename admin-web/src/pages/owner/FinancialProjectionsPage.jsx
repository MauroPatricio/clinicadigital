import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import {
    Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign
} from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);
import toast from 'react-hot-toast';

const FinancialProjectionsPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [months, setMonths] = useState(6);

    useEffect(() => {
        loadProjections();
    }, [months]);

    const loadProjections = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/owner/finance/premium/projections?months=${months}`);
            setData(res.data);
        } catch (error) {
            toast.error('Erro ao carregar projeções');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div></div>;

    const chartData = {
        labels: data?.data?.map(d => d.month) || [],
        datasets: [
            {
                label: 'Receita Total Projetada',
                data: data?.data?.map(d => d.totalRevenue) || [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.4
            },
            {
                label: 'Despesas Estimadas',
                data: data?.data?.map(d => d.estimatedExpenses) || [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4
            }
        ]
    };

    const cashFlowData = {
        labels: data?.data?.map(d => d.month) || [],
        datasets: [
            {
                label: 'Fluxo de Caixa Líquido',
                data: data?.data?.map(d => d.netCashFlow) || [],
                backgroundColor: data?.data?.map(d => d.netCashFlow >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'),
            }
        ]
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projeções Financeiras</h1>
                    <p className="text-gray-500">Análise preditiva de receitas e fluxo de caixa</p>
                </div>
                <select
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                    <option value={3}>Próximos 3 meses</option>
                    <option value={6}>Próximos 6 meses</option>
                    <option value={12}>Próximos 12 meses</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Receita Estável (Recorrente)
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {data?.data?.[0]?.recurringRevenue?.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                        <span className="text-xs text-gray-400 font-normal ml-2">/mês atual</span>
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Média Despesas
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {data?.summary?.avgExpenseBase?.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Planos Ativos
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {data?.summary?.activeRecurringPlans}
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Projeção Receita vs Despesa</h3>
                    <Line data={chartData} options={{ responsive: true }} />
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Fluxo de Caixa Líquido</h3>
                    <Bar data={cashFlowData} options={{ responsive: true }} />
                </div>
            </div>
        </div>
    );
};

export default FinancialProjectionsPage;
