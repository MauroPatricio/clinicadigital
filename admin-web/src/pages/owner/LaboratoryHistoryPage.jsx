import { useState, useEffect } from 'react';
import { FlaskConical, Search, Calendar, Filter, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import labService from '../../services/labService';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line } from 'recharts';

const LaboratoryHistoryPage = () => {
    const { currentClinic } = useClinic();
    const [history, setHistory] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        loadHistory();
    }, [currentClinic, filters]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const params = {
                ...(currentClinic && { clinic: currentClinic._id }),
                ...(filters.status && { status: filters.status }),
                ...(filters.priority && { priority: filters.priority }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate })
            };

            const response = await labService.getOwnerHistory(params);
            setHistory(response.data || []);
            setAnalytics(response.analytics || null);
        } catch (error) {
            console.error('Error loading lab history:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

    const statusData = analytics?.statusDistribution?.map(item => ({
        name: item._id,
        value: item.count
    })) || [];

    const priorityData = analytics?.priorityDistribution?.map(item => ({
        name: item._id,
        value: item.count
    })) || [];

    const topExamsData = analytics?.topExams?.slice(0, 10).map(item => ({
        name: item._id,
        count: item.count
    })) || [];

    const monthlyTrendData = analytics?.monthlyTrend?.map(item => ({
        month: `${item._id.month}/${item._id.year}`,
        count: item.count
    })) || [];

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    Histórico Laboratorial
                </h1>
                <p className="text-gray-600 mt-1">Análise histórica completa de exames laboratoriais</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Data Inicial"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Data Final"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="">Todos os Status</option>
                        <option value="pending">Pendente</option>
                        <option value="in-progress">Em Progresso</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="">Todas as Prioridades</option>
                        <option value="routine">Rotina</option>
                        <option value="urgent">Urgente</option>
                        <option value="stat">STAT</option>
                    </select>

                    <button
                        onClick={() => setFilters({ status: '', priority: '', startDate: '', endDate: '' })}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                        Limpar Filtros
                    </button>
                </div>
            </div>

            {/* Analytics Dashboard */}
            {analytics && (
                <div className="space-y-6">
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Status Distribution */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-purple-600" />
                                Distribuição por Status
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Priority Distribution */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-purple-600" />
                                Distribuição por Prioridade
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={priorityData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {priorityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Top Exams */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-purple-600" />
                            Top 10 Exames Mais Solicitados
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topExamsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#9333ea" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            Tendência Mensal
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#9333ea" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Historical Records */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Registros Históricos ({history.length})</h3>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12">
                            <FlaskConical className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-gray-900 font-semibold text-lg">Nenhum registro encontrado</h3>
                            <p className="text-gray-500 mt-1">Não há registros históricos com os filtros selecionados</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nº Pedido</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Paciente</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Exames</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Prioridade</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {history.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.patient?.user?.profile?.firstName} {order.patient?.user?.profile?.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {order.exams?.length} exame(s)
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.priority === 'stat' ? 'bg-red-100 text-red-800' :
                                                    order.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {order.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LaboratoryHistoryPage;
