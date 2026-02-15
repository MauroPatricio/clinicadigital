import { useState } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { TrendingUp, DollarSign, PieChart as PieIcon, ArrowUpRight, Download } from 'lucide-react';

const FinancialReportsPage = () => {
    const [period, setPeriod] = useState('year');

    // Mock Data
    const revenueData = [
        { name: 'Jan', receita: 40000, despesa: 24000, lucro: 16000 },
        { name: 'Fev', receita: 30000, despesa: 13980, lucro: 16020 },
        { name: 'Mar', receita: 20000, despesa: 9800, lucro: 10200 },
        { name: 'Abr', receita: 27800, despesa: 3908, lucro: 23892 },
        { name: 'Mai', receita: 18900, despesa: 4800, lucro: 14100 },
        { name: 'Jun', receita: 23900, despesa: 3800, lucro: 20100 },
        { name: 'Jul', receita: 34900, despesa: 4300, lucro: 30600 },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
                    <p className="text-gray-600">Análise detalhada de receitas, despesas e lucratividade.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-white border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="month">Este Mês</option>
                        <option value="quarter">Este Trimestre</option>
                        <option value="year">Este Ano</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                        <Download className="w-5 h-5" /> Exportar PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Receita Total</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">1,245,000 MZN</h3>
                    <div className="flex items-center mt-2 text-green-600 text-sm">
                        <ArrowUpRight className="w-4 h-4 mr-1" /> +12%
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Despesa Total</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">450,000 MZN</h3>
                    <div className="flex items-center mt-2 text-red-600 text-sm">
                        <ArrowUpRight className="w-4 h-4 mr-1" /> +5%
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Lucro Líquido</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">795,000 MZN</h3>
                    <div className="flex items-center mt-2 text-green-600 text-sm">
                        <ArrowUpRight className="w-4 h-4 mr-1" /> +18%
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Margem</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">63.8%</h3>
                    <div className="flex items-center mt-2 text-gray-500 text-sm">
                        Média do setor: 55%
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Receita vs Despesa</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="receita" fill="#6366f1" radius={[4, 4, 0, 0]} name="Receita" />
                                <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesa" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Crescimento do Lucro</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="lucro" stroke="#22c55e" fillOpacity={1} fill="url(#colorLucro)" name="Lucro" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialReportsPage;
