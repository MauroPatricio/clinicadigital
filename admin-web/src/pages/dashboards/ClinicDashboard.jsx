import { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { dashboardService } from '../../services/apiService';
import { Users, Calendar, Clock, DollarSign, Activity, TrendingUp, AlertCircle, Stethoscope, UserCheck } from 'lucide-react';
import StatCard from '../../components/premium/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ClinicDashboard = () => {
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
            console.error('Error loading clinic stats:', error);
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

    // Mock specialty data (in real scenario, from API)
    const specialtyData = [
        { name: 'Cardiologia', appointments: 45, avgWait: 12 },
        { name: 'Pediatria', appointments: 38, avgWait: 8 },
        { name: 'Ortopedia', appointments: 32, avgWait: 15 },
        { name: 'Dermatologia', appointments: 28, avgWait: 10 },
        { name: 'Oftalmologia', appointments: 22, avgWait: 14 }
    ];

    const queueData = [
        { status: 'Aguardando', count: 12, color: '#F59E0B' },
        { status: 'Em atendimento', count: 8, color: '#3B82F6' },
        { status: 'Concluído', count: 34, color: '#10B981' }
    ];

    const COLORS = ['#F59E0B', '#3B82F6', '#10B981'];

    // Calculate occupancy
    const totalRooms = 20; // Mock data
    const occupiedRooms = 14;
    const occupancyRate = ((occupiedRooms / totalRooms) * 100).toFixed(0);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Visão Geral da Clínica</h2>
                <p className="text-slate-500">Acompanhamento em tempo real • <span className="font-semibold text-primary-600">{currentClinic.name}</span></p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Consultas Hoje"
                    value={kpi.appointmentsToday}
                    icon={Calendar}
                    color="blue"
                    change={"+2"}
                    changeType="up"
                />
                <StatCard
                    title="Pacientes Ativos"
                    value={common.totalPatients}
                    icon={Users}
                    color="emerald"
                />
                <StatCard
                    title="Médicos de Plantão"
                    value={kpi.doctorsOnDuty}
                    icon={Activity}
                    color="purple"
                />
                <StatCard
                    title="Receita (Mês)"
                    value={`${common.revenueThisMonth.toLocaleString()} MT`}
                    icon={DollarSign}
                    color="amber"
                />
            </div>

            {/* Capacity & Queue Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ocupação de Salas */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Ocupação de Salas</h3>
                        <span className={`text-2xl font-bold ${occupancyRate > 90 ? 'text-red-600' :
                                occupancyRate > 70 ? 'text-orange-600' :
                                    'text-green-600'
                            }`}>{occupancyRate}%</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Salas Ocupadas</span>
                            <span className="font-bold">{occupiedRooms}/{totalRooms}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all ${occupancyRate > 90 ? 'bg-red-500' :
                                        occupancyRate > 70 ? 'bg-orange-500' :
                                            'bg-green-500'
                                    }`}
                                style={{ width: `${occupancyRate}%` }}
                            ></div>
                        </div>
                        {occupancyRate > 90 && (
                            <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-red-900">Alta ocupação - considerar redistribuição</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fila de Atendimento */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Fila de Atendimento</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={queueData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {queueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {queueData.map((item, idx) => (
                            <div key={idx} className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                </div>
                                <p className="text-2xl font-bold text-slate-900">{item.count}</p>
                                <p className="text-xs text-slate-500">{item.status}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Specialty Analytics */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Stethoscope className="w-6 h-6 text-primary-600" />
                        <h3 className="text-lg font-bold text-slate-900">Análise por Especialidade</h3>
                    </div>
                    <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm">
                        <option>Este Mês</option>
                        <option>Última Semana</option>
                        <option>Hoje</option>
                    </select>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={specialtyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="appointments" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Wait Time Card */}
            <div className="bg-gradient-to-br from-primary-900 to-indigo-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-2">Tempo Médio de Espera</h3>
                    <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-4xl font-black">{kpi.avgWaitTime}</span>
                        <span className="text-sm text-indigo-200">minutos</span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-indigo-200">Eficiência da Recepção</span>
                            <span className="font-bold text-emerald-400">94%</span>
                        </div>
                        <div className="w-full bg-indigo-950/50 rounded-full h-2">
                            <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicDashboard;
