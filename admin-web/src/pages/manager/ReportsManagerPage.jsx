import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getOperationalReport, getClinicalReport, getFinancialReport } from '../../services/reportsService';
import toast from 'react-hot-toast';

const ReportsManagerPage = () => {
    const { currentClinic } = useClinic();
    const [activeTab, setActiveTab] = useState('operational');
    const [dateRange, setDateRange] = useState('month');
    const [loading, setLoading] = useState(false);

    // Data states for each report type
    const [operationalData, setOperationalData] = useState(null);
    const [clinicalData, setClinicalData] = useState(null);
    const [financialData, setFinancialData] = useState(null);

    const isLaboratory = currentClinic?.type === 'laboratory';

    useEffect(() => {
        fetchReportData();
    }, [activeTab, dateRange, currentClinic]);

    const fetchReportData = async () => {
        try {
            setLoading(true);

            if (activeTab === 'operational') {
                const response = await getOperationalReport({ dateRange });
                if (response.success) {
                    setOperationalData(response.data);
                }
            } else if (activeTab === 'clinical') {
                const response = await getClinicalReport({ dateRange });
                if (response.success) {
                    setClinicalData(response.data);
                }
            } else if (activeTab === 'financial') {
                const response = await getFinancialReport({ dateRange });
                if (response.success) {
                    setFinancialData(response.data);
                }
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('Erro ao carregar relatório');
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

    const tabs = [
        { id: 'operational', label: 'Operacional', icon: Activity },
        { id: 'clinical', label: isLaboratory ? 'Laboratorial' : 'Clínico', icon: Users },
        { id: 'financial', label: 'Financeiro', icon: DollarSign }
    ];

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display text-slate-900">Relatórios</h1>
                    <p className="text-slate-600 mt-1">Análises e relatórios estratégicos</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="input md:w-48"
                    >
                        <option value="week">Última Semana</option>
                        <option value="month">Este Mês</option>
                        <option value="quarter">Último Trimestre</option>
                        <option value="year">Este Ano</option>
                    </select>
                    <button className="btn-primary">
                        <Download className="w-5 h-5" />
                        Exportar PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="card">
                <div className="flex gap-2 border-b border-slate-200 pb-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Operational Tab */}
                {activeTab === 'operational' && (
                    <div className="space-y-6 pt-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            </div>
                        ) : operationalData ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
                                        <p className="text-sm font-medium text-primary-700">Total de Atendimentos</p>
                                        <p className="text-3xl font-black text-primary-900 mt-2">{operationalData.kpis?.totalAppointments || 0}</p>
                                        <p className="text-xs text-primary-600 mt-1">Período selecionado</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                                        <p className="text-sm font-medium text-emerald-700">Taxa de Comparecimento</p>
                                        <p className="text-3xl font-black text-emerald-900 mt-2">{operationalData.kpis?.attendanceRate || 0}%</p>
                                        <p className="text-xs text-emerald-600 mt-1">Consultas realizadas</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                        <p className="text-sm font-medium text-amber-700">Tempo Médio de Espera</p>
                                        <p className="text-3xl font-black text-amber-900 mt-2">{operationalData.kpis?.avgWaitTime || 0}min</p>
                                        <p className="text-xs text-amber-600 mt-1">Tempo médio</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100">
                                        <p className="text-sm font-medium text-cyan-700">Ocupação Média</p>
                                        <p className="text-3xl font-black text-cyan-900 mt-2">{operationalData.kpis?.occupancyRate || 0}%</p>
                                        <p className="text-xs text-cyan-600 mt-1">Taxa de salas</p>
                                    </div>
                                </div>

                                <div className="card-premium">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">
                                        {isLaboratory ? 'Volume de Exames por Dia' : 'Volume de Consultas por Dia'}
                                    </h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={operationalData.dailyVolume || []}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="name" stroke="#64748b" />
                                                <YAxis stroke="#64748b" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey={isLaboratory ? 'exames' : 'consultas'}
                                                    fill="#6366f1"
                                                    radius={[8, 8, 0, 0]}
                                                    name={isLaboratory ? 'Exames' : 'Consultas'}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-600">Sem dados disponíveis</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Clinical/Laboratory Tab */}
                {activeTab === 'clinical' && (
                    <div className="space-y-6 pt-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            </div>
                        ) : clinicalData ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card-premium">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">
                                        {isLaboratory ? 'Distribuição de Exames' : 'Distribuição por Especialidade'}
                                    </h3>
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={clinicalData.distribution || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={90}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {(clinicalData.distribution || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="card bg-primary-50 border-primary-100">
                                        <h4 className="font-bold text-primary-900 mb-3">
                                            {isLaboratory ? 'Top 5 Exames Mais Solicitados' : 'Top 5 Procedimentos'}
                                        </h4>
                                        <div className="space-y-2">
                                            {(clinicalData.topProcedures || []).map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg">
                                                    <span className="text-sm font-medium text-slate-700">{item}</span>
                                                    <span className="text-sm font-bold text-primary-600">{85 - idx * 10}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card bg-emerald-50 border-emerald-100">
                                        <h4 className="font-bold text-emerald-900 mb-3">Indicadores de Qualidade</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-emerald-700">Taxa de Satisfação</span>
                                                    <span className="font-bold text-emerald-900">{clinicalData.qualityIndicators?.satisfactionRate || 0}%</span>
                                                </div>
                                                <div className="bg-emerald-200 rounded-full h-2">
                                                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${clinicalData.qualityIndicators?.satisfactionRate || 0}%` }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-emerald-700">Precisão de Resultados</span>
                                                    <span className="font-bold text-emerald-900">{clinicalData.qualityIndicators?.resultsAccuracy || 0}%</span>
                                                </div>
                                                <div className="bg-emerald-200 rounded-full h-2">
                                                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${clinicalData.qualityIndicators?.resultsAccuracy || 0}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-600">Sem dados disponíveis</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Financial Tab */}
                {activeTab === 'financial' && (
                    <div className="space-y-6 pt-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            </div>
                        ) : financialData ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="card-gradient">
                                        <p className="text-white/80 text-sm font-medium">Receita Total</p>
                                        <p className="text-3xl font-black text-white mt-2">{formatCurrency(financialData.kpis?.totalRevenue || 0)}</p>
                                        <div className="flex items-center gap-1 mt-2 text-emerald-300">
                                            <TrendingUp className="w-4 h-4" />
                                            <span className="text-sm font-bold">+{financialData.kpis?.growth || 0}% vs período anterior</span>
                                        </div>
                                    </div>
                                    <div className="card bg-emerald-50 border-emerald-100">
                                        <p className="text-emerald-700 text-sm font-medium">Receita Média Diária</p>
                                        <p className="text-3xl font-black text-emerald-900 mt-2">{formatCurrency(financialData.kpis?.dailyAverage || 0)}</p>
                                    </div>
                                    <div className="card bg-primary-50 border-primary-100">
                                        <p className="text-primary-700 text-sm font-medium">Ticket Médio</p>
                                        <p className="text-3xl font-black text-primary-900 mt-2">{formatCurrency(financialData.kpis?.avgTicket || 0)}</p>
                                    </div>
                                </div>

                                <div className="card-premium">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">Evolução de Receita</h3>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={financialData.revenueEvolution || []}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="month" stroke="#64748b" />
                                                <YAxis stroke="#64748b" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                                                <Tooltip
                                                    formatter={(value) => formatCurrency(value)}
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="receita"
                                                    stroke="#6366f1"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#6366f1', r: 6 }}
                                                    activeDot={{ r: 8 }}
                                                    name="Receita (MZN)"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="card">
                                        <h4 className="font-bold text-slate-900 mb-4">Métodos de Pagamento</h4>
                                        <div className="space-y-3">
                                            {(financialData.paymentMethods || []).map((item, idx) => (
                                                <div key={idx}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium text-slate-700">{item.method}</span>
                                                        <span className="text-sm font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                                                    </div>
                                                    <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary-600 to-indigo-600"
                                                            style={{ width: `${item.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="card">
                                        <h4 className="font-bold text-slate-900 mb-4">Receita por Categoria</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Consultas</p>
                                                    <p className="text-xl font-black text-slate-900">{formatCurrency(financialData.categoryRevenue?.consultas || 0)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-xl">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-600">Exames</p>
                                                    <p className="text-xl font-black text-slate-900">{formatCurrency(financialData.categoryRevenue?.exames || 0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-600">Sem dados disponíveis</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Exportar Relatórios</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl hover:border-primary-600 hover:bg-primary-50 transition-all">
                        <FileText className="w-6 h-6 text-primary-600" />
                        <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm">Relatório Completo</p>
                            <p className="text-xs text-slate-600">PDF com todos os dados</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl hover:border-emerald-600 hover:bg-emerald-50 transition-all">
                        <BarChart3 className="w-6 h-6 text-emerald-600" />
                        <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm">Dados para Excel</p>
                            <p className="text-xs text-slate-600">Exportar em .xlsx</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 border-2 border-slate-200 rounded-xl hover:border-amber-600 hover:bg-amber-50 transition-all">
                        <Calendar className="w-6 h-6 text-amber-600" />
                        <div className="text-left">
                            <p className="font-bold text-slate-900 text-sm">Agendar Relatório</p>
                            <p className="text-xs text-slate-600">Receber periodicamente</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportsManagerPage;
