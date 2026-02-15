import React, { useState, useEffect } from 'react';
import { Shield, Search, Download, AlertTriangle } from 'lucide-react';
import securityService from '../../services/securityService';
import { useClinic } from '../../context/ClinicContext';

const AccessLogsPage = () => {
    const { selectedClinic } = useClinic();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadLogs();
    }, [selectedClinic]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await securityService.getAccessLogs({ clinicId: selectedClinic?.id });
            setLogs(data);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status) => {
        return status === 'success' ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Sucesso</span>
        ) : (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold">Falhou</span>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-blue-600" />
                        Logs de Acesso
                    </h1>
                    <p className="text-gray-600 mt-1">Monitoramento de atividades e acessos ao sistema</p>
                </div>

                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Exportar Logs
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar por usuário ou ação..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dispositivo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localização</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className={`hover:bg-gray-50 ${log.status === 'failed' ? 'bg-red-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{log.user}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{log.action}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.timestamp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{log.ip}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.device}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.location}</td>
                                    <td className="px-6 py-4 text-center">
                                        {getStatusBadge(log.status)}
                                        {log.status === 'failed' && log.reason && (
                                            <div className="flex items-center justify-center gap-1 mt-1">
                                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                                <span className="text-xs text-red-600">{log.reason}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AccessLogsPage;
