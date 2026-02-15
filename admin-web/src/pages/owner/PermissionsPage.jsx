import { useState, useEffect } from 'react';
import { Shield, Save, RotateCcw, Check, X } from 'lucide-react';
import api from '../../services/api';

const PermissionsPage = () => {
    const [selectedRole, setSelectedRole] = useState('manager');
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const modules = [
        { key: 'patients', label: 'Pacientes' },
        { key: 'appointments', label: 'Consultas' },
        { key: 'staff', label: 'Funcionários' },
        { key: 'finance', label: 'Financeiro' },
        { key: 'reports', label: 'Relatórios' },
        { key: 'exams', label: 'Exames' },
        { key: 'prescriptions', label: 'Prescrições' },
        { key: 'stock', label: 'Estoque' },
        { key: 'analytics', label: 'Analytics' },
        { key: 'clinics', label: 'Clínicas' },
        { key: 'users', label: 'Usuários' },
        { key: 'permissions', label: 'Permissões' },
        { key: 'audit', label: 'Auditoria' }
    ];

    useEffect(() => {
        loadPermissions();
    }, [selectedRole]);

    const loadPermissions = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/permissions/${selectedRole}`);

            // Convert array to object for easier access
            const permissionsMap = {};
            response.data.data.forEach(perm => {
                permissionsMap[perm.module] = perm.permissions;
            });
            setPermissions(permissionsMap);
            setHasChanges(false);
        } catch (error) {
            console.error('Error loading permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePermission = (module, action) => {
        setPermissions(prev => ({
            ...prev,
            [module]: {
                ...prev[module],
                [action]: !prev[module]?.[action]
            }
        }));
        setHasChanges(true);
    };

    const handleSaveAll = async () => {
        if (!confirm(`Salvar todas as permissões para ${selectedRole}?`)) return;

        try {
            setSaving(true);

            // Save each module permission
            const promises = Object.keys(permissions).map(module =>
                api.patch(`/permissions/${selectedRole}`, {
                    module,
                    permissions: permissions[module]
                })
            );

            await Promise.all(promises);

            alert('Permissões salvas com sucesso!');
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving permissions:', error);
            alert('Erro ao salvar permissões');
        } finally {
            setSaving(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            owner: 'bg-purple-100 text-purple-700',
            manager: 'bg-blue-100 text-blue-700',
            staff: 'bg-green-100 text-green-700',
            patient: 'bg-gray-100 text-gray-700'
        };
        return colors[role] || colors.staff;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-8 h-8 text-indigo-600" />
                    Gestão de Permissões
                </h1>
                <p className="text-gray-600 mt-1">Configure permissões para cada função do sistema</p>
            </div>

            {/* Role Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Função</h2>
                <div className="flex gap-3">
                    {['owner', 'manager', 'staff', 'patient'].map(role => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${selectedRole === role
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {role === 'owner' ? 'Proprietário' :
                                role === 'manager' ? 'Gestor' :
                                    role === 'staff' ? 'Funcionário' : 'Paciente'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Permission Matrix */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Matriz de Permissões
                        </h2>
                        <p className="text-sm text-gray-600">
                            Configurando permissões para: <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedRole)}`}>
                                {selectedRole}
                            </span>
                        </p>
                    </div>
                    {hasChanges && (
                        <div className="flex gap-2">
                            <button
                                onClick={loadPermissions}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Descartar
                            </button>
                            <button
                                onClick={handleSaveAll}
                                disabled={saving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Salvando...' : 'Salvar Tudo'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                                    Módulo
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ler
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Escrever
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Deletar
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Carregando permissões...
                                    </td>
                                </tr>
                            ) : (
                                modules.map(module => (
                                    <tr key={module.key} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {module.label}
                                            </span>
                                        </td>
                                        {['read', 'write', 'delete'].map(action => (
                                            <td key={action} className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => handleTogglePermission(module.key, action)}
                                                    className={`w-12 h-12 rounded-lg transition-all ${permissions[module.key]?.[action]
                                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                        }`}
                                                >
                                                    {permissions[module.key]?.[action] ? (
                                                        <Check className="w-6 h-6 mx-auto" />
                                                    ) : (
                                                        <X className="w-6 h-6 mx-auto" />
                                                    )}
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> As alterações só serão aplicadas após clicar em "Salvar Tudo".
                    Tenha cuidado ao modificar permissões, pois isso pode afetar o acesso dos usuários ao sistema.
                </p>
            </div>
        </div>
    );
};

export default PermissionsPage;
