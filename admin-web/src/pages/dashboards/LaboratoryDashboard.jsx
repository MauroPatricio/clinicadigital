import { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { dashboardService } from '../../services/apiService';
import { FlaskConical, ClipboardList, Clock, CheckCircle2, AlertTriangle, Beaker, TrendingDown, Award } from 'lucide-react';
import StatCard from '../../components/premium/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const LaboratoryDashboard = () => {
    const { currentClinic } = useClinic();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentClinic) {
            loadStats();
        }
    }, [currentClinic]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getUnitStats(currentClinic._id);
            setStats(data);
        } catch (error) {
            console.error('Error loading lab stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const { kpi, common } = stats;

    // Mock exam breakdown data
    const examBreakdown = [
        { name: 'Hemograma', count: 145, avgTime: 2.5 },
        { name: 'Biópsia', count: 32, avgTime: 72 },
        { name: 'Colesterol', count: 98, avgTime: 4 },
        { name: 'Glicose', count: 156, avgTime: 1.5 },
        { name: 'Urina', count: 87, avgTime: 3 },
        { name: 'TSH', count: 64, avgTime: 24 }
    ];

    const processingTimeData = [
        { day: 'Seg', urgente: 1.2, normal: 16 },
        { day: 'Ter', urgente: 1.5, normal: 18 },
        { day: 'Qua', urgente: 1.1, normal: 14 },
        { day: 'Qui', urgente: 1.8, normal: 20 },
        { day: 'Sex', urgente: 1.3, normal: 15 }
    ];

    const qualityMetrics = [
        { metric: 'Precisão de Resultados', value: 99.2, target: 98, status: 'excellent' },
        { metric: 'Taxa de Rejeição de Amostras', value: 1.8, target: 3, status: 'good' },
        { metric: 'Cumprimento de Prazos', value: 96.5, target: 95, status: 'excellent' }
    ];

    const equipmentStatus = [
        { equipment: 'Analisador Hematológico', status: 'operational', nextCalibration: '2026-02-15' },
        { equipment: 'Microscópio Digital', status: 'operational', nextCalibration: '2026-03-01' },
        { equipment: 'Centrífuga', status: 'maintenance', nextCalibration: '2026-02-05' },
        { equipment: 'Espectrofotómetro', status: 'operational', nextCalibration: '2026-02-20' }
    ];

    const technicianPerformance = [
        { name: 'Dr. Carlos Silva', testsCompleted: 156, avgTime: 15.2, accuracy: 99.5 },
        { name: 'Dra. Ana Santos', testsCompleted: 143, avgTime: 14.8, accuracy: 99.8 },
        { name: 'Téc. João Costa', testsCompleted: 128, avgTime: 16.5, accuracy: 98.9 }
    ];

    const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

    const getStatusColor = (status) => {
        switch (status) {
            case 'operational': return 'text-green-600';
            case 'maintenance': return 'text-orange-600';
            case 'offline': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'operational': return 'bg-green-100 text-green-800';
            case 'maintenance': return 'bg-orange-100 text-orange-800';
            case 'offline': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header with Lab Theme */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Controle Laboratorial</h2>
                    <p className="text-slate-500">Gestão de Análises • <span className="font-semibold text-cyan-600">{currentClinic.name}</span></p>
                </div>
                <div className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-bold border border-cyan-100 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Modo Laboratório
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Exames Hoje"
                    value={kpi.examsToday}
                    icon={ClipboardList}
                    color="cyan"
                />
                <StatCard
                    title="Resultados Pendentes"
                    value={kpi.pendingResults}
                    icon={Clock}
                    color="amber"
                />
                <StatCard
                    title="Total Processado (Mês)"
                    value={kpi.examsThisMonth}
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatCard
                    title="Tempo Médio Entrega"
                    value={kpi.avgTurnaroundTime}
                    icon={FlaskConical}
                    color="indigo"
                />
            </div>

            {/* Exam Breakdown & Processing Time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Exam Type Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-6">
                        <Beaker className="w-6 h-6 text-cyan-600" />
                        <h3 className="text-lg font-bold text-slate-900">Distribuição de Exames</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={examBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {examBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Processing Time Trends */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingDown className="w-6 h-6 text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-900">Tempo de Processamento (horas)</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processingTimeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="urgente" stroke="#ef4444" strokeWidth={2} name="Urgente" />
                                <Line type="monotone" dataKey="normal" stroke="#3b82f6" strokeWidth={2} name="Normal" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quality Control Metrics */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Métricas de Controle de Qualidade</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {qualityMetrics.map((item, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg p-4">
                            <p className="text-sm text-slate-600 mb-2">{item.metric}</p>
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-3xl font-bold text-slate-900">{item.value}%</span>
                                <span className="text-sm text-slate-500">Meta: {item.target}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${item.status === 'excellent' ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${(item.value / item.target) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Equipment Status & Technician Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Equipment Calibration Status */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Estado dos Equipamentos</h3>
                    <div className="space-y-3">
                        {equipmentStatus.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-900">{item.equipment}</p>
                                    <p className="text-xs text-slate-500">Próxima calibração: {item.nextCalibration}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(item.status)}`}>
                                    {item.status === 'operational' ? 'Operacional' :
                                        item.status === 'maintenance' ? 'Manutenção' : 'Offline'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technician Performance */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-4">
                        <Award className="w-6 h-6 text-purple-600" />
                        <h3 className="text-lg font-bold text-slate-900">Desempenho Técnicos</h3>
                    </div>
                    <div className="space-y-3">
                        {technicianPerformance.map((tech, idx) => (
                            <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-slate-900">{tech.name}</p>
                                    <span className="text-sm font-bold text-green-600">{tech.accuracy}%</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                    <span>{tech.testsCompleted} testes</span>
                                    <span>{tech.avgTime}h médio</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Critical Results Alert */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-amber-900 mb-2">Resultados Críticos Pendentes</h3>
                        <p className="text-amber-800 mb-4">2 resultados críticos aguardam validação do responsável técnico.</p>
                        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
                            Ver Resultados Críticos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LaboratoryDashboard;
