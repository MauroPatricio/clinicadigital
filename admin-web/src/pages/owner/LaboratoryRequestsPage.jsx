import { useState, useEffect } from 'react';
import { FlaskConical, Search, Filter, Clock, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import labService from '../../services/labService';
import { format } from 'date-fns';

const LaboratoryRequestsPage = () => {
    const { currentClinic } = useClinic();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, pending: 0, urgent: 0 });
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: ''
    });

    useEffect(() => {
        loadRequests();
    }, [currentClinic, filters]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const params = {
                ...(currentClinic && { clinic: currentClinic._id }),
                ...(filters.status && { status: filters.status }),
                ...(filters.priority && { priority: filters.priority }),
                ...(filters.search && { search: filters.search })
            };

            const response = await labService.getOwnerRequests(params);
            setOrders(response.data || []);
            setStats(response.stats || { today: 0, pending: 0, urgent: 0 });
        } catch (error) {
            console.error('Error loading lab requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'stat': return 'bg-red-100 text-red-800 border-red-200';
            case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'routine': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'in-progress': return <FlaskConical className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FlaskConical className="w-8 h-8 text-cyan-600" />
                        Solicitações de Laboratório
                    </h1>
                    <p className="text-gray-600 mt-1">Gestão de requisições de exames laboratoriais</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-cyan-100 text-sm font-medium">Solicitações Hoje</p>
                            <h3 className="text-4xl font-bold mt-2">{stats.today}</h3>
                        </div>
                        <FlaskConical className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm font-medium">Pendentes</p>
                            <h3 className="text-4xl font-bold mt-2">{stats.pending}</h3>
                        </div>
                        <Clock className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">Urgentes</p>
                            <h3 className="text-4xl font-bold mt-2">{stats.urgent}</h3>
                        </div>
                        <AlertCircle className="w-12 h-12 opacity-80" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por paciente ou nº pedido..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                        className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                        <option value="">Todas as Prioridades</option>
                        <option value="routine">Rotina</option>
                        <option value="urgent">Urgente</option>
                        <option value="stat">STAT</option>
                    </select>

                    <button
                        onClick={() => setFilters({ status: '', priority: '', search: '' })}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                        Limpar Filtros
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <FlaskConical className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-gray-900 font-semibold text-lg">Nenhuma solicitação encontrada</h3>
                        <p className="text-gray-500 mt-1">Não há solicitações de laboratório com os filtros selecionados</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row justify-between gap-4">
                                {/* Patient Info */}
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {order.patient?.user?.profile?.firstName?.charAt(0) || 'P'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {order.patient?.user?.profile?.firstName} {order.patient?.user?.profile?.lastName}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                {order.orderNumber}
                                            </span>
                                            <span>•</span>
                                            <span>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                                            <span>•</span>
                                            <span>Dr. {order.doctor?.user?.profile?.firstName} {order.doctor?.user?.profile?.lastName}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status & Priority */}
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${getPriorityColor(order.priority)}`}>
                                        {order.priority?.toUpperCase()}
                                    </span>
                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Exams */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Exames Solicitados:</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {order.exams?.map((exam, idx) => (
                                        <div key={idx} className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-800">{exam.name}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(exam.status)}`}>
                                                    {exam.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            {order.notes && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-sm text-blue-900"><strong>Observações:</strong> {order.notes}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LaboratoryRequestsPage;
