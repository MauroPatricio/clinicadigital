import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
    Building2, DollarSign, Users, Activity, TrendingUp, Calendar,
    ArrowRight, MapPin, BarChart3
} from 'lucide-react';
import SkeletonLoader from '../../components/premium/SkeletonLoader';

const MultiClinicDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/owner/multi-clinic/dashboard');
            setStats(res.data.data);
        } catch (error) {
            console.error('Error loading multi-clinic data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Visão Geral Corporativa</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <SkeletonLoader variant="card" count={4} />
                </div>
                <SkeletonLoader variant="chart" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visão Geral Corporativa</h1>
                    <p className="text-gray-500">Monitorize o desempenho de todas as suas unidades ({stats.totalClinics})</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/owner/clinics/compare')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Comparar Unidades
                    </button>
                    <button
                        onClick={() => navigate('/owner/finance/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <DollarSign className="w-4 h-4" />
                        Painel Financeiro
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-16 h-16 text-green-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Receita (Mês)</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats.financial.totalRevenue.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>{stats.financial.transactionCount} transações</span>
                    </div>
                </div>

                {/* Total Appointments */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="w-16 h-16 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Consultas (Mês)</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats.operational.totalAppointmentsMonth}
                    </p>
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                        {stats.operational.completionRate}% Conclusão
                    </div>
                </div>

                {/* Active Patients */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-purple-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Pacientes Ativos</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats.patients.totalActive}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">Total na rede</p>
                </div>

                {/* Operational Health */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-16 h-16 text-orange-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Activity className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Operacional (Hoje)</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats.operational.todayAppointments}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">Agendamentos para hoje</p>
                </div>
            </div>

            {/* Quick Actions / Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Gerir Clínicas</h3>
                        <p className="text-indigo-100 mb-6 max-w-md">Visualize, configure e gerencie cada uma das suas unidades clínicas individualmente.</p>
                        <button
                            onClick={() => navigate('/owner/clinics')}
                            className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            Ver Lista de Clínicas
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <Building2 className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white opacity-10" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Atalhos</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/owner/finance/invoices/new')}
                            className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">Nova Fatura</span>
                        </button>
                        <button
                            onClick={() => navigate('/owner/users')}
                            className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">Gerir Usuários</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiClinicDashboard;
