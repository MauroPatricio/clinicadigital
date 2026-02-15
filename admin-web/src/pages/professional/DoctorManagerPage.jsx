import { useState, useEffect } from 'react';
import {
    Search, Plus, Filter, MoreVertical,
    Stethoscope, Mail, Phone, MapPin,
    Star, Calendar, UserPlus, Edit, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api'; // Adjust path if needed
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed

import DoctorFormModal from '../../components/professional/DoctorFormModal';

const DoctorManagerPage = () => {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialty, setFilterSpecialty] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        avgRating: 0
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/doctors');
            // Assuming response.data.data is the array of doctors
            // Adjust based on your actual API response structure
            const doctorList = response.data.data || [];
            setDoctors(doctorList);

            // Calculate simple stats
            const active = doctorList.filter(d => d.isAcceptingPatients).length;
            const validRatings = doctorList.filter(d => d.rating?.average);
            const avg = validRatings.length > 0
                ? (validRatings.reduce((acc, curr) => acc + curr.rating.average, 0) / validRatings.length).toFixed(1)
                : 0;

            setStats({
                total: doctorList.length,
                active,
                avgRating: avg
            });

        } catch (err) {
            console.error('Error fetching doctors:', err);
            setError('Falha ao carregar lista de médicos');
            toast.error('Erro ao carregar médicos');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredDoctors = doctors.filter(doctor => {
        const name = doctor.user?.profile?.firstName + ' ' + doctor.user?.profile?.lastName;
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterSpecialty === 'all' || doctor.specialization === filterSpecialty;
        return matchesSearch && matchesFilter;
    });

    const specialties = [...new Set(doctors.map(d => d.specialization))];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Médicos</h1>
                    <p className="text-gray-600">Gerencie sua equipe médica, horários e desempenho.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Novo Médico</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total de Médicos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ativos</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-full">
                        <UserPlus className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avaliação Média</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgRating}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
                        <Star className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou especialidade..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select
                        className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-full md:w-48"
                        value={filterSpecialty}
                        onChange={(e) => setFilterSpecialty(e.target.value)}
                    >
                        <option value="all">Todas Especialidades</option>
                        {specialties.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Doctors List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Carregando médicos...</p>
                </div>
            ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum médico encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Comece adicionando um novo médico à sua clínica.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <div key={doctor._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl uppercase">
                                            {doctor.user?.profile?.firstName?.charAt(0) || 'D'}
                                            {doctor.user?.profile?.lastName?.charAt(0) || 'R'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 truncate max-w-[150px]">
                                                Dr. {doctor.user?.profile?.firstName} {doctor.user?.profile?.lastName}
                                            </h3>
                                            <p className="text-indigo-600 text-sm font-medium">{doctor.specialization}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 p-1">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{doctor.user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{doctor.user?.profile?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="font-medium text-gray-900">{doctor.rating?.average?.toFixed(1) || '0.0'}</span>
                                        <span className="text-gray-400">({doctor.rating?.count || 0} avaliações)</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doctor.isAcceptingPatients
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {doctor.isAcceptingPatients ? 'Disponível' : 'Indisponível'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <Calendar className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingDoctor(doctor);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Doctor Form Modal */}
            <DoctorFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingDoctor(null);
                }}
                onSuccess={fetchDoctors}
                doctorToEdit={editingDoctor}
            />
        </div>
    );
};

export default DoctorManagerPage;
