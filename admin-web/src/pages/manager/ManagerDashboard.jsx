import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, Award, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import api from '../../services/api';
import StatCard from '../../components/premium/StatCard';
import SkeletonLoader from '../../components/premium/SkeletonLoader';
import ClinicSelector from '../../components/clinics/ClinicSelector';

const ManagerDashboard = () => {
    const { user } = useAuth();
    const { currentClinic } = useClinic();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        if (currentClinic) {
            loadDashboard();
        }
    }, [currentClinic]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/analytics/manager-dashboard');
            setDashboardData(response.data.data);
        } catch (err) {
            console.error('Error loading dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <SkeletonLoader variant="card" count={4} />
            </div>
        );
    }

    if (!dashboardData) {
        return <div className="p-6">Erro ao carregar dados</div>;
    }

    const { today, staff } = dashboardData;

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
                <h1 className="text-3xl font-bold text-gray-900">Dashboard do Gestor</h1>
                <p className="text-gray-600 mt-1">
                    Bem-vindo, <span className="font-semibold">{user?.profile?.firstName}</span>!
                    Gerencie {currentClinic?.name || 'sua clínica'}.
                </p>
            </div>

            {/* Clinic Selector (for owners) */}
            <ClinicSelector />

            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Consultas Hoje"
                    value={today.appointments}
                    icon={Calendar}
                    color="blue"
                />
                <StatCard
                    title="Receita Hoje"
                    value={formatCurrency(today.revenue)}
                    icon={DollarSign}
                    color="green"
                />
                <StatCard
                    title="Funcionários de Plantão"
                    value={today.staffOnDuty}
                    icon={Users}
                    color="purple"
                />
                <StatCard
                    title="Salas Disponíveis"
                    value={today.availableRooms}
                    icon={Clock}
                    color="orange"
                />
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Consultas de Hoje</h3>
                {today.appointmentsList && today.appointmentsList.length > 0 ? (
                    <div className="space-y-3">
                        {today.appointmentsList.slice(0, 5).map((apt) => (
                            <div
                                key={apt._id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {apt.patient?.profile?.firstName} {apt.patient?.profile?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Com Dr. {apt.doctor?.profile?.firstName}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">
                                        {new Date(apt.dateTime).toLocaleTimeString('pt-PT', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            apt.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                apt.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {apt.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Nenhuma consulta agendada para hoje</p>
                )}
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Award className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-900">Melhores Desempenhos (Este Mês)</h3>
                </div>
                {staff.topPerformers && staff.topPerformers.length > 0 ? (
                    <div className="space-y-3">
                        {staff.topPerformers.map((performer, idx) => (
                            <div
                                key={performer._id}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {performer.staff?.profile?.firstName} {performer.staff?.profile?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">{performer.staff?.staffRole}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-purple-900">
                                        {performer.score?.total || 0}
                                    </p>
                                    <p className="text-sm text-purple-700">pontos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Dados de desempenho não disponíveis</p>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
