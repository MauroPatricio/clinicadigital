import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Filter, Award, Calendar, Activity, MoreVertical } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import api from '../../services/api';
import SkeletonLoader from '../../components/premium/SkeletonLoader';

const StaffManagementPage = () => {
    const { currentClinic } = useClinic();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        if (currentClinic) {
            loadStaff();
        }
    }, [currentClinic]);

    const loadStaff = async () => {
        try {
            setLoading(true);
            // Using doctors endpoint for now - in production would be /staff
            const response = await api.get('/doctors');
            setStaff(response.data.data || []);
        } catch (error) {
            console.error('Error loading staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            doctor: 'bg-blue-100 text-blue-800',
            nurse: 'bg-green-100 text-green-800',
            receptionist: 'bg-purple-100 text-purple-800',
            technician: 'bg-orange-100 text-orange-800',
            pharmacist: 'bg-cyan-100 text-cyan-800',
            administrator: 'bg-pink-100 text-pink-800'
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const getRoleName = (role) => {
        const names = {
            doctor: 'Médico',
            nurse: 'Enfermeiro(a)',
            receptionist: 'Recepcionista',
            technician: 'Técnico(a)',
            pharmacist: 'Farmacêutico(a)',
            administrator: 'Administrador(a)'
        };
        return names[role] || role;
    };

    const filteredStaff = staff.filter(member => {
        const matchesSearch =
            member.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || member.staffRole === filterRole || member.role === filterRole;

        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Funcionários</h1>
                <SkeletonLoader variant="list" count={1} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestão de Funcionários</h1>
                    <p className="text-gray-600 mt-1">
                        {currentClinic?.name} • {filteredStaff.length} funcionário(s)
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-md">
                    <UserPlus className="w-5 h-5" />
                    Adicionar Funcionário
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Todos os Cargos</option>
                            <option value="doctor">Médicos</option>
                            <option value="nurse">Enfermeiros</option>
                            <option value="receptionist">Recepcionistas</option>
                            <option value="technician">Técnicos</option>
                            <option value="pharmacist">Farmacêuticos</option>
                            <option value="administrator">Administradores</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Staff List */}
            {filteredStaff.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterRole !== 'all' ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário cadastrado'}
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm || filterRole !== 'all'
                            ? 'Tente ajustar os filtros de busca'
                            : 'Comece adicionando funcionários à sua equipe'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredStaff.map((member) => (
                        <div
                            key={member._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                {/* Staff Info */}
                                <div className="flex items-start gap-4 flex-1">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                        {member.profile?.firstName?.charAt(0) || 'U'}
                                        {member.profile?.lastName?.charAt(0) || ''}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {member.profile?.firstName} {member.profile?.lastName}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.staffRole || member.role)}`}>
                                                {getRoleName(member.staffRole || member.role)}
                                            </span>
                                            {member.isActive === false && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Inativo
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p>📧 {member.email}</p>
                                            {member.profile?.phone && <p>📞 {member.profile.phone}</p>}
                                            {member.licenseNumber && (
                                                <p className="font-mono">🏥 Licença: {member.licenseNumber}</p>
                                            )}
                                        </div>

                                        {/* Specialties */}
                                        {member.specialties && member.specialties.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {member.specialties.map((specialty, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
                                                    >
                                                        {specialty}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="mt-4 flex gap-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {member.stats?.totalAppointments || 0} consultas
                                                </span>
                                            </div>
                                            {member.stats?.averageRating && (
                                                <div className="flex items-center gap-2">
                                                    <Award className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-sm text-gray-600">
                                                        {member.stats.averageRating.toFixed(1)} ⭐
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-green-500" />
                                                <span className="text-sm text-gray-600">
                                                    {member.isActive !== false ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StaffManagementPage;
