import { useState, useEffect } from 'react';
import { Building2, DollarSign, Users, TrendingUp, Award, Clock, AlertCircle } from 'lucide-react';
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

    const { overview, bestPerformingClinic, topStaffMember, metrics, insights } = dashboardData;

    // Prepare chart data
    const serviceData = insights.topServices.map(s => ({
        name: s._id,
        value: s.count
    }));

    const COLORS = ['#0066CC', '#00CC99', '#FF6B6B', '#FFB020', '#A855F7'];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-MZ', {
            style: 'currency',
            currency: 'MZN',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard do Proprietário</h1>
                <p className="text-gray-600 mt-1">
                    Bem-vindo, <span className="font-semibold">{user?.profile?.firstName || 'Proprietário'}</span>!
                    Gerencie todas as suas {overview.totalClinics} clínicas em um só lugar.
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total de Clínicas"
                    value={overview.totalClinics}
                    icon={Building2}
                    color="blue"
                />
                <StatCard
                    title="Receita Total"
                    value={formatCurrency(overview.totalRevenue)}
                    icon={DollarSign}
                    color="green"
                    change={12.5}
                    changeType="up"
                />
                <StatCard
                    title="Consultas (Mês)"
                    value={metrics.totalAppointments}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="Taxa de Falta"
                    value={`${metrics.noShowRate}%`}
                    icon={AlertCircle}
                    color={metrics.noShowRate > 15 ? 'red' : 'orange'}
                    change={2.3}
                    changeType="down"
                />
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
