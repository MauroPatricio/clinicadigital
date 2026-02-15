import React, { useState, useEffect } from 'react';
import { History, Search, Filter } from 'lucide-react';
import securityService from '../../services/securityService';
import { useClinic } from '../../context/ClinicContext';

const ChangeHistoryPage = () => {
    const { selectedClinic } = useClinic();
    const [changes, setChanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [entityTypeFilter, setEntityTypeFilter] = useState('all');

    useEffect(() => {
        loadChanges();
    }, [selectedClinic, entityTypeFilter]);

    const loadChanges = async () => {
        setLoading(true);
        try {
            const data = await securityService.getChangeHistory({
                clinicId: selectedClinic?.id,
                entityType: entityTypeFilter === 'all' ? undefined : entityTypeFilter,
            });
            setChanges(data);
        } catch (error) {
            console.error('Error loading change history:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEntityTypeColor = (type) => {
        const colors = {
            patient: 'bg-blue-100 text-blue-800',
            appointment: 'bg-green-100 text-green-800',
            user: 'bg-purple-100 text-purple-800',
            setting: 'bg-yellow-100 text-yellow-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <History className="w-8 h-8 text-blue-600" />
                    Histórico de Alterações
                </h1>
                <p className="text-gray-600 mt-1">Auditoria completa de modificações no sistema</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={entityTypeFilter}
                        onChange={(e) => setEntityTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todos os Tipos</option>
                        <option value="patient">Pacientes</option>
                        <option value="appointment">Consultas</option>
                        <option value="user">Usuários</option>
                        <option value="setting">Configurações</option>
                    </select>
                </div>
            </div>

            {/* Change History List */}
            <div className="space-y-4">
                {changes.map((change) => (
                    <div key={change.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <History className="w-6 h-6 text-blue-600" />
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-800">{change.entityName}</h3>
                                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getEntityTypeColor(change.entityType)}`}>
                                            {change.entityType}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Alterado por <strong>{change.changedBy}</strong> em {change.timestamp}
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-semibold">
                                {change.action}
                            </span>
                        </div>

                        {/* Before & After */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-xs font-semibold text-red-800 mb-2 uppercase">Antes</p>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-700"><strong>{change.field}:</strong></p>
                                    <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded">{change.oldValue || '(vazio)'}</p>
                                </div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-xs font-semibold text-green-800 mb-2 uppercase">Depois</p>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-700"><strong>{change.field}:</strong></p>
                                    <p className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded">{change.newValue}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {changes.length === 0 && (
                <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma alteração encontrada</p>
                </div>
            )}
        </div>
    );
};

export default ChangeHistoryPage;
