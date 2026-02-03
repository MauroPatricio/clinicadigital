import { useState, useEffect } from 'react';
import { Building2, DollarSign, Users, TrendingUp, Award, Clock, AlertCircle, FlaskConical, UserCog, Activity, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/premium/StatCard';
import SkeletonLoader from '../../components/premium/SkeletonLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/analytics/owner-dashboard');
            setDashboardData(response.data.data);
        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError(err.response?.data?.message || 'Erro ao carregar dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard do Proprietário</h1>
                    <p className="text-gray-600 mt-1">Visão geral de todas as clínicas</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SkeletonLoader variant="card" count={4} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonLoader variant="chart" count={2} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-semibold text-red-900">Erro ao carregar dashboard</h3>
                        <p className="text-red-700 mt-1">{error}</p>
                        <button
                            onClick={loadDashboard}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { overview, growth, alerts, unitPerformance, subscription, bestPerformingClinic, topStaffMember, metrics, insights } = dashboardData;

    // Prepare chart data
    const serviceData = insights.topServices.map(s => ({
        name: s._id,
        value: s.count
    }));

    const unitComparisonData = unitPerformance.topPerforming.map(u => ({
        name: u.clinicData?.name || 'Unit',
        revenue: u.revenue
    }));

    const COLORS = ['#0066CC', '#00CC99', '#FF6B6B', '#FFB020', '#A855F7'];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 0
        }).format(value);
    };

    const getGrowthColor = (growth) => {
        return parseFloat(growth) >= 0 ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">✨ Dashboard Antigravity</h1>
                <p className="text-gray-600 mt-1">
                    Bem-vindo, <span className="font-semibold">{user?.profile?.firstName || 'Proprietário'}</span>!
                    Gerencie todas as suas {overview.totalUnits} unidades ({overview.totalClinics} clínicas + {overview.totalLaboratories} laboratórios).
                </p>
            </div>

            {/* Critical Alerts */}
            {alerts && alerts.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-orange-600 mt-0.5 animate-pulse" />
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-2">Alertas Críticos</h3>
                            <div className="space-y-2">
                                {alerts.map((alert, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' :
                                                alert.severity === 'high' ? 'bg-orange-500' :
                                                    'bg-yellow-500'
                                                }`} />
                                            <span className="text-sm text-gray-900">{alert.message}</span>
                                        </div>
                                        <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                            {alert.action}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Overview Stats - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Unidades Ativas"
                    value={overview.totalUnits}
                    subtitle={`${overview.totalClinics} Clínicas + ${overview.totalLaboratories} Labs`}
                    icon={Building2}
                    color="blue"
                />
                <StatCard
                    title="Total de Membros"
                    value={overview.totalStaff}
                    subtitle={`${overview.totalDoctors} Médicos + ${overview.totalTechnicians} Técnicos`}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="Pacientes Cadastrados"
                    value={overview.totalPatients}
                    subtitle={`+${overview.newPatientsThisMonth} este mês`}
                    icon={UserCog}
                    color="emerald"
                />
                <StatCard
                    title="Receita Total"
                    value={formatCurrency(overview.totalRevenue)}
                    icon={DollarSign}
                    color="green"
                    change={growth.revenueGrowth}
                    changeType={growth.revenueGrowth >= 0 ? 'up' : 'down'}
                />
            </div>

            {/* Growth Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Crescimento de Receita</p>
                            <p className={`text-3xl font-bold ${getGrowthColor(growth.revenueGrowth)}`}>
                                {growth.revenueGrowth > 0 ? '+' : ''}{growth.revenueGrowth}%
                            </p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-blue-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Crescimento de Consultas</p>
                            <p className={`text-3xl font-bold ${getGrowthColor(growth.appointmentGrowth)}`}>
                                {growth.appointmentGrowth > 0 ? '+' : ''}{growth.appointmentGrowth}%
                            </p>
                        </div>
                        <Activity className="w-10 h-10 text-purple-600" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Novos Pacientes</p>
                            <p className={`text-3xl font-bold ${getGrowthColor(growth.patientGrowth)}`}>
                                {growth.patientGrowth > 0 ? '+' : ''}{growth.patientGrowth}%
                            </p>
                        </div>
                        <Users className="w-10 h-10 text-emerald-600" />
                    </div>
                </div>
            </div>

            {/* Best Performing Clinic & Top Staff */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Best Clinic */}
                {bestPerformingClinic && (
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Melhor Clínica</h3>
                                <p className="text-sm text-gray-600">Por receita este mês</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold text-blue-900">
                                {bestPerformingClinic.clinic?.name || 'N/A'}
                            </p>
                            <p className="text-lg text-blue-700">
                                {formatCurrency(bestPerformingClinic.revenue)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Top Staff */}
                {topStaffMember && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Melhor Funcionário</h3>
                                <p className="text-sm text-gray-600">Por desempenho este mês</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold text-purple-900">
                                {topStaffMember.staffData?.profile?.firstName} {topStaffMember.staffData?.profile?.lastName}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">
                                    Score: {topStaffMember.score?.total || 0}/100
                                </span>
                                <span className="text-sm text-purple-700">
                                    {topStaffMember.staffData?.staffRole}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unit Performance Comparison - NEW */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Comparação de Unidades</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={unitComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="revenue" fill="#0066CC" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Services */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Serviços Mais Solicitados</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={serviceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {serviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Average Duration by Specialty */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Duração Média por Especialidade</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={metrics.avgDurationBySpecialty.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="_id" />
                            <YAxis label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Bar dataKey="avgDuration" fill="#0066CC" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Peak Hours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-900">Horários de Pico</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {insights.peakHours.map((peak, idx) => (
                        <div key={idx} className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                            <p className="text-sm text-gray-600 font-medium">#{idx + 1} Horário</p>
                            <p className="text-2xl font-bold text-orange-900 mt-1">{peak.hour}</p>
                            <p className="text-sm text-orange-700 mt-1">{peak.appointments} consultas</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
