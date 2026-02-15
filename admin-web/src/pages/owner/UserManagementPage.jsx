import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, Download, Mail, Lock, Power, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import UserFormModal from '../../components/owner/UserFormModal';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        role: '',
        status: '',
        clinic: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadUsers();
        loadStats();
    }, [filters, pagination.page]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });

            const response = await api.get(`/users?${params}`);
            setUsers(response.data.data);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination.total,
                pages: response.data.pagination.pages
            }));
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await api.get('/users/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleCreateUser = () => {
        setSelectedUser(null);
        setShowUserModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const handleUserSaved = () => {
        setShowUserModal(false);
        setSelectedUser(null);
        loadUsers();
        loadStats();
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        if (!confirm(`${currentStatus ? 'Desativar' : 'Ativar'} este usuário?`)) return;

        try {
            await api.patch(`/users/${userId}/status`, {
                isActive: !currentStatus
            });
            loadUsers();
            loadStats();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleResetPassword = async (userId) => {
        const newPassword = prompt('Digite a nova senha (mínimo 6 caracteres):');
        if (!newPassword || newPassword.length < 6) {
            alert('Senha inválida');
            return;
        }

        try {
            await api.patch(`/users/${userId}/password`, { newPassword });
            alert('Senha resetada com sucesso!');
        } catch (error) {
            console.error('Error resetting password:', error);
            alert('Erro ao resetar senha');
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            owner: 'bg-purple-100 text-purple-700',
            manager: 'bg-blue-100 text-blue-700',
            staff: 'bg-green-100 text-green-700',
            patient: 'bg-gray-100 text-gray-700'
        };
        return badges[role] || badges.patient;
    };

    const getRoleLabel = (role) => {
        const labels = {
            owner: 'Proprietário',
            manager: 'Gestor',
            staff: 'Funcionário',
            patient: 'Paciente'
        };
        return labels[role] || role;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-8 h-8 text-indigo-600" />
                    Gestão de Utilizadores
                </h1>
                <p className="text-gray-600 mt-1">Gerencie todos os usuários do sistema</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
                        <p className="text-indigo-600 text-sm font-medium">Total de Usuários</p>
                        <p className="text-3xl font-bold text-indigo-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                        <p className="text-green-600 text-sm font-medium">Ativos</p>
                        <p className="text-3xl font-bold text-green-900 mt-1">{stats.active}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                        <p className="text-red-600 text-sm font-medium">Inativos</p>
                        <p className="text-3xl font-bold text-red-900 mt-1">{stats.inactive}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                        <p className="text-purple-600 text-sm font-medium">Gestores</p>
                        <p className="text-3xl font-bold text-purple-900 mt-1">
                            {stats.byRole.find(r => r._id === 'manager')?.count || 0}
                        </p>
                    </div>
                </div>
            )}

            {/* Filters & Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou email..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Todas as Funções</option>
                        <option value="owner">Proprietário</option>
                        <option value="manager">Gestor</option>
                        <option value="staff">Funcionário</option>
                        <option value="patient">Paciente</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Todos os Status</option>
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </select>

                    {/* Add User Button */}
                    <button
                        onClick={handleCreateUser}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <UserPlus className="w-5 h-5" />
                        Adicionar
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuário
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Função
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Clínica
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Nenhum usuário encontrado
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    {(user.profile?.firstName?.[0] || 'U').toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {user.profile?.firstName} {user.profile?.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{user.specialization || user.staffRole}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {user.clinic?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.isActive ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    Ativo
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(user._id)}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="Resetar Senha"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                    className={`p-2 rounded-lg transition-colors ${user.isActive
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={user.isActive ? 'Desativar' : 'Ativar'}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                            Mostrando {(pagination.page - 1) * pagination.limit + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuários
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

            {/* User Form Modal */}
            {showUserModal && (
                <UserFormModal
                    user={selectedUser}
                    onClose={() => setShowUserModal(false)}
                    onSave={handleUserSaved}
                />
            )}
        </div>
    );
};

export default UserManagementPage;
