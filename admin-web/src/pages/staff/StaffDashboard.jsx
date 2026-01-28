import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/premium/StatCard';
import SkeletonLoader from '../../components/premium/SkeletonLoader';

const StaffDashboard = () => {
    const { user, getRoleDisplayName } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/analytics/staff-dashboard');
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
                <SkeletonLoader variant="card" count={3} />
            </div>
        );
    }

    if (!dashboardData) {
        return <div className="p-6">Erro ao carregar dados</div>;
    }

    const { today, thisMonth } = dashboardData;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Meu Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Bem-vindo, <span className="font-semibold">{user?.profile?.firstName}</span>
                    ({getRoleDisplayName()})
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Consultas Hoje"
                    value={today.count}
                    icon={Calendar}
                    color="blue"
                />
                <StatCard
                    title="Consultas Este Mês"
                    value={thisMonth.totalAppointments}
                    icon={TrendingUp}
                    color="green"
                />
                {thisMonth.performance && (
                    <StatCard
                        title="Meu Desempenho"
                        value={`${thisMonth.performance.score?.total || 0}/100`}
                        icon={Activity}
                        color="purple"
                    />
                )}
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Agenda de Hoje</h3>
                {today.appointments && today.appointments.length > 0 ? (
                    <div className="space-y-3">
                        {today.appointments.map((apt) => (
                            <div
                                key={apt._id}
                                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                        {new Date(apt.dateTime).toLocaleTimeString('pt-PT', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {apt.patient?.profile?.firstName} {apt.patient?.profile?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {apt.reason || 'Consulta'}
                                        </p>
                                        {apt.patient?.contact?.phone && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                📞 {apt.patient.contact.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            apt.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                apt.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {apt.status === 'completed' ? 'Concluída' :
                                            apt.status === 'in-progress' ? 'Em Andamento' :
                                                apt.status === 'confirmed' ? 'Confirmada' :
                                                    'Agendada'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma consulta agendada para hoje</p>
                    </div>
                )}
            </div>

            {/* Performance Summary */}
            {thisMonth.performance && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo de Desempenho (Este Mês)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-gray-600">Consultas</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {thisMonth.performance.appointments?.completed || 0}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-gray-600">Taxa Conclusão</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {thisMonth.performance.efficiency?.completionRate || 0}%
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-gray-600">Avaliação Média</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {thisMonth.performance.patientFeedback?.averageRating?.toFixed(1) || 'N/A'} ⭐
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-gray-600">Pontualidade</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {thisMonth.performance.efficiency?.onTimeRate || 0}%
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
