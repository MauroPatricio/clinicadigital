import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Plus, User, FileText, Calendar,
    MoreVertical, Phone, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PatientManagementPage = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/patients');
            setPatients(response.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar pacientes');
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient => {
        const fullName = `${patient.user?.profile?.firstName} ${patient.user?.profile?.lastName}`.toLowerCase();
        const email = patient.user?.email?.toLowerCase() || '';
        const phone = patient.user?.profile?.phone || '';
        const term = searchTerm.toLowerCase();

        return fullName.includes(term) || email.includes(term) || phone.includes(term);
    });

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-orange-600 bg-orange-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-blue-600 bg-blue-100';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Pacientes</h1>
                    <p className="text-gray-600">Consulte e gerencie o histórico de todos os pacientes.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Novo Paciente</span>
                </button>
            </div>

            {/* Search & Stats Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou telefone..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-gray-500">
                    Mostrando <span className="font-bold text-gray-900">{filteredPatients.length}</span> pacientes
                </div>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto / Email</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Última Visita</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Risco</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                        Carregando...
                                    </td>
                                </tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Nenhum paciente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <tr
                                        key={patient._id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/manager/patients/${patient._id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    {patient.user?.profile?.firstName?.charAt(0) || 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Nº {patient.patientNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-2 text-gray-900">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {patient.user?.profile?.phone || 'N/A'}
                                                </div>
                                                <div className="text-gray-500 text-xs mt-0.5">{patient.user?.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {patient.lastVisit
                                                ? format(new Date(patient.lastVisit), "d 'de' MMM, yyyy", { locale: ptBR })
                                                : 'Nunca visitou'
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(patient.riskClassification)}`}>
                                                <Shield className="w-3 h-3 mr-1" />
                                                {patient.riskClassification ? patient.riskClassification.toUpperCase() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientManagementPage;
