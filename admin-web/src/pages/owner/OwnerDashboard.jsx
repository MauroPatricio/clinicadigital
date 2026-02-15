import { useState, useEffect } from 'react';
import { Building2, DollarSign, Users, TrendingUp, TrendingDown, Award, Clock, AlertCircle, FlaskConical, UserCog, Activity, Bell, Calendar, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/premium/StatCard';
import SkeletonLoader from '../../components/premium/SkeletonLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('month');

    // New analytics data states
    const [kpis, setKpis] = useState(null);
    const [revenue, setRevenue] = useState([]);
    const [doctorOccupancy, setDoctorOccupancy] = useState([]);
    const [topServices, setTopServices] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, [period]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all owner analytics data in parallel
            const [kpisRes, revenueRes, doctorRes, servicesRes, alertsRes] = await Promise.all([
                api.get(`/owner/analytics/kpis?period=${period}`),
                api.get('/owner/analytics/revenue?period=daily'),
                api.get('/owner/analytics/doctor-occupancy'),
                api.get('/owner/analytics/top-services?limit=5'),
                api.get('/owner/analytics/alerts')
            ]);

            setKpis(kpisRes.data.data);
            setRevenue(revenueRes.data.data);
            setDoctorOccupancy(doctorRes.data.data);
            setTopServices(servicesRes.data.data);
            setAlerts(alertsRes.data.data.alerts);
        } catch (err) {
            console.error('Error loading owner dashboard:', err);
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 0
        }).format(value || 0);
    };

    const getTrendIcon = (trend) => {
        return trend >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />;
    };

    const getTrendColor = (trend) => {
        return trend >= 0 ? 'text-green-500' : 'text-red-500';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            critical: 'bg-red-500/10 text-red-500 border-red-500/20',
            warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            info: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        };
        return colors[severity] || colors.info;
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
                    <p className="text-gray-600 mt-1">Visão geral estratégica do seu negócio</p>
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

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header with Period Selector */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">✨ Dashboard Executivo</h1>
                    <p className="text-gray-600 mt-1">
                        Bem-vindo, <span className="font-semibold">{user?.profile?.firstName || 'Proprietário'}</span>!
                        Visão estratégica do seu negócio.
                    </p>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                    {[
                        { key: 'day', label: 'Hoje' },
                        { key: 'month', label: 'Mês' },
                        { key: 'year', label: 'Ano' }
                    ].map((p) => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${period === p.key
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Critical Alerts */}
            {alerts && alerts.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-orange-600 mt-0.5 animate-pulse" />
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-2">⚠️ Alertas Críticos ({alerts.length})</h3>
                            <div className="space-y-2">
                                {alerts.map((alert, idx) => (
                                    <div key={idx} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{alert.message}</p>
                                            <span className="text-sm opacity-75">{alert.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Cards - Premium Design with Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="w-10 h-10 opacity-80" />
                        <div className={`flex items-center gap-1 ${kpis?.revenue?.trend >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                            {getTrendIcon(kpis?.revenue?.trend)}
                            <span className="font-bold">{Math.abs(kpis?.revenue?.trend || 0)}%</span>
                        </div>
                    </div>
                    <p className="text-indigo-100 text-sm mb-1">Receita Total</p>
                    <p className="text-3xl font-bold">{formatCurrency(kpis?.revenue?.total || 0)}</p>
                    <p className="text-indigo-200 text-xs mt-2">{kpis?.revenue?.count || 0} transações</p>
                </div>

                {/* Patients Card */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-10 h-10 opacity-80" />
                        <Zap className="w-6 h-6 opacity-60" />
                    </div>
                    <p className="text-emerald-100 text-sm mb-1">Pacientes Atendidos</p>
                    <p className="text-3xl font-bold">{kpis?.totalPatients || 0}</p>
                    <p className="text-emerald-200 text-xs mt-2">Período: {period === 'day' ? 'Hoje' : period === 'month' ? 'Este mês' : 'Este ano'}</p>
                </div>

                {/* Appointments Card */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <Calendar className="w-10 h-10 opacity-80" />
                        <Clock className="w-6 h-6 opacity-60" />
                    </div>
                    <p className="text-purple-100 text-sm mb-1">Consultas Agendadas</p>
                    <p className="text-3xl font-bold">{kpis?.scheduledAppointments || 0}</p>
                    <p className="text-purple-200 text-xs mt-2">Próximas consultas</p>
                </div>

                {/* Doctor Occupancy Card */}
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                        <Activity className="w-10 h-10 opacity-80" />
                        <Award className="w-6 h-6 opacity-60" />
                    </div>
                    <p className="text-amber-100 text-sm mb-1">Taxa de Ocupação</p>
                    <p className="text-3xl font-bold">{kpis?.doctorOccupancy || 0}%</p>
                    <p className="text-amber-200 text-xs mt-2">Utilização de médicos</p>
                </div>
            </div>

            {/* Charts Row - Top Services & Doctor Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Services */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Serviços Mais Rentáveis
                    </h2>
                    <div className="space-y-4">
                        {topServices && topServices.length > 0 ? (
                            topServices.map((service, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-700">{service.service}</span>
                                        <span className="text-indigo-600 font-bold">{formatCurrency(service.totalRevenue)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${topServices[0] ? (service.totalRevenue / topServices[0].totalRevenue) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {service.count} vendas • Média: {formatCurrency(service.averagePrice)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">Sem dados de serviços disponíveis</p>
                        )}
                    </div>
                </div>

                {/* Doctor Performance */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        Desempenho dos Médicos
                    </h2>
                    <div className="space-y-4">
                        {doctorOccupancy && doctorOccupancy.length > 0 ? (
                            doctorOccupancy.slice(0, 5).map((doctor, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-700">{doctor.doctorName}</p>
                                            <p className="text-xs text-gray-500">{doctor.specialization || 'N/A'}</p>
                                        </div>
                                        <span className="text-emerald-600 font-bold">{doctor.occupancyRate.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
                                            style={{ width: `${Math.min(doctor.occupancyRate, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {doctor.completedAppointments} de {doctor.totalAppointments} consultas completadas
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">Sem dados de médicos disponíveis</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
