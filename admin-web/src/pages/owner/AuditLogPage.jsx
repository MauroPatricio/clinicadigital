import { useState, useEffect } from 'react';
import { FileText, Download, Search, Filter, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        module: '',
        startDate: '',
        endDate: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
    });
    const [expandedLog, setExpandedLog] = useState(null);

    useEffect(() => {
        loadLogs();
    }, [filters, pagination.page]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });

            const response = await api.get(`/audit-logs?${params}`);
            setLogs(response.data.data);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination.total,
                pages: response.data.pagination.pages
            }));
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const params = new URLSearchParams(filters);
            window.open(`/api/audit-logs/export?${params}`, '_blank');
        } catch (error) {
            console.error('Error exporting logs:', error);
        }
    };

    const getActionBadge = (action) => {
        const badges = {
            CREATE: 'bg-green-100 text-green-700',
            UPDATE: 'bg-blue-100 text-blue-700',
            DELETE: 'bg-red-100 text-red-700',
            LOGIN: 'bg-purple-100 text-purple-700',
            LOGOUT: 'bg-gray-100 text-gray-700',
            VIEW: 'bg-indigo-100 text-indigo-700'
        };
        return badges[action] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-8 h-8 text-indigo-600" />
                    Logs de Auditoria
                </h1>
                <p className="text-gray-600 mt-1">Rastreie todas as atividades do sistema</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Date Range */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Data Início</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Data Fim</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>

                    {/* Action Filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ação</label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            <option value="">Todas</option>
                            <option value="CREATE">Criar</option>
                            <option value="UPDATE">Atualizar</option>
                            <option value="DELETE">Deletar</option>
                            <option value="LOGIN">Login</option>
                            <option value="LOGOUT">Logout</option>
                            <option value="VIEW">Visualizar</option>
                        </select>
                    </div>

                    {/* Module Filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Módulo</label>
                        <select
                            value={filters.module}
                            onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            <option value="">Todos</option>
                            <option value="users">Usuários</option>
                            <option value="patients">Pacientes</option>
                            <option value="appointments">Consultas</option>
                            <option value="auth">Autenticação</option>
                            <option value="finance">Financeiro</option>
                        </select>
                    </div>

                    {/* Export Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleExportCSV}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Exportar CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data/Hora
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ação
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Módulo
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    IP
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Detalhes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Carregando logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Nenhum log encontrado
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <>
                                        <tr key={log._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {log.user?.profile?.firstName} {log.user?.profile?.lastName}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                                {log.module}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {log.ipAddress || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                                                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    {expandedLog === log._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedLog === log._id && (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-4 bg-gray-50">
                                                    <div className="space-y-2 text-sm">
                                                        <p><strong>Tipo de Recurso:</strong> {log.resourceType || 'N/A'}</p>
                                                        <p><strong>ID do Recurso:</strong> {log.resourceId || 'N/A'}</p>
                                                        <p><strong>User Agent:</strong> {log.userAgent || 'N/A'}</p>
                                                        <p><strong>Clínica:</strong> {log.clinic?.name || 'N/A'}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                            Mostrando {(pagination.page - 1) * pagination.limit + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} logs
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogPage;
