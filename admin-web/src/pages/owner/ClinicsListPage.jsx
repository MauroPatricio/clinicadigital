import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Users, TrendingUp, Plus, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SkeletonLoader from '../../components/premium/SkeletonLoader';

const ClinicsListPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClinics();
    }, []);

    const loadClinics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/clinics');
            setClinics(response.data.data);
        } catch (error) {
            console.error('Error loading clinics:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            case 'suspended':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Minhas Clínicas</h1>
                        <p className="text-gray-600 mt-1">Gerencie todas as suas clínicas</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SkeletonLoader variant="card" count={3} />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Minhas Clínicas</h1>
                    <p className="text-gray-600 mt-1">
                        Você possui {clinics.length} {clinics.length === 1 ? 'clínica' : 'clínicas'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/owner/clinics/compare')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <BarChart3 className="w-5 h-5" />
                        Comparar
                    </button>
                    <button
                        onClick={() => navigate('/owner/clinics/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Clínica
                    </button>
                </div>
            </div>

            {/* Clinics Grid */}
            {clinics.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma clínica encontrada</h3>
                    <p className="text-gray-600 mb-6">Comece adicionando sua primeira clínica</p>
                    <button
                        onClick={() => navigate('/owner/clinics/new')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Adicionar Clínica
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clinics.map((clinic) => (
                        <div
                            key={clinic._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => navigate(`/owner/clinics/${clinic._id}`)}
                        >
                            {/* Header with gradient */}
                            <div className="h-32 bg-gradient-to-br from-blue-500 to-cyan-500 p-6 flex items-center">
                                <div className="w-16 h-16 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{clinic.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{clinic.address?.city || 'N/A'}, {clinic.address?.state || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Users className="w-4 h-4" />
                                        <span>{clinic.stats?.totalStaff || 0} funcionários</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(clinic.status)}`}>
                                        {clinic.status === 'active' ? 'Ativa' :
                                            clinic.status === 'inactive' ? 'Inativa' : 'Suspensa'}
                                    </span>
                                </div>

                                {/* Manager Info */}
                                {clinic.manager && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-1">Gestor</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {clinic.manager.profile?.firstName} {clinic.manager.profile?.lastName}
                                        </p>
                                    </div>
                                )}

                                {/* Specialties */}
                                {clinic.specialties && clinic.specialties.length > 0 && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2">Especialidades</p>
                                        <div className="flex flex-wrap gap-2">
                                            {clinic.specialties.slice(0, 3).map((specialty, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                            {clinic.specialties.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                                    +{clinic.specialties.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/owner/clinics/${clinic._id}/analytics`);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        Análises
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/owner/clinics/${clinic._id}/settings`);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Configurar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClinicsListPage;
