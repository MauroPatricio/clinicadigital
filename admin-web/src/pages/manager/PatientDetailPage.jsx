import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Calendar, FileText, Bell, Paperclip, Activity,
    ArrowLeft, Phone, Mail, AlertCircle, Shield
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PatientDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [timeline, setTimeline] = useState([]);
    const [alerts, setAlerts] = useState({ active: [], completed: [], dismissed: [] });

    useEffect(() => {
        loadPatientData();
    }, [id]);

    const loadPatientData = async () => {
        try {
            setLoading(true);
            const [patientRes, timelineRes, alertsRes] = await Promise.all([
                api.get(`/patients/${id}`),
                api.get(`/patients/${id}/timeline`),
                api.get(`/patients/${id}/alerts`)
            ]);

            setPatient(patientRes.data.data);
            setTimeline(timelineRes.data.data);
            setAlerts(alertsRes.data.data);
        } catch (error) {
            toast.error('Erro ao carregar dados do paciente');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Visão Geral', icon: User },
        { id: 'timeline', label: 'Timeline Médica', icon: Activity },
        { id: 'records', label: 'Prontuários', icon: FileText },
        { id: 'alerts', label: 'Alertas', icon: Bell, badge: alerts.active.length },
        { id: 'attachments', label: 'Anexos', icon: Paperclip }
    ];

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Paciente não encontrado</p>
                </div>
            </div>
        );
    }

    const getRiskBadgeColor = (risk) => {
        const colors = {
            low: 'bg-green-100 text-green-800 border-green-300',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            high: 'bg-orange-100 text-orange-800 border-orange-300',
            critical: 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[risk] || colors.low;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/manager/patients')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {patient.user?.profile?.firstName} {patient.user?.profile?.lastName}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Paciente Nº {patient.patientNumber}
                        </p>
                    </div>
                </div>

                {/* Risk Badge */}
                <div className={`px-4 py-2 rounded-full border-2 font-semibold ${getRiskBadgeColor(patient.riskClassification)}`}>
                    <Shield className="w-4 h-4 inline-block mr-2" />
                    Risco: {patient.riskClassification?.toUpperCase()}
                </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Phone className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Telefone</p>
                            <p className="font-semibold">{patient.user?.profile?.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold text-sm truncate">{patient.user?.email || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Última Visita</p>
                            <p className="font-semibold">
                                {patient.lastVisit
                                    ? new Date(patient.lastVisit).toLocaleDateString('pt-PT')
                                    : 'Nenhuma'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Tab Headers */}
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-b-2 border-primary-600 text-primary-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                                {tab.badge > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <OverviewTab patient={patient} />
                    )}
                    {activeTab === 'timeline' && (
                        <TimelineTab timeline={timeline} patientId={id} onUpdate={loadPatientData} />
                    )}
                    {activeTab === 'records' && (
                        <RecordsTab patientId={id} />
                    )}
                    {activeTab === 'alerts' && (
                        <AlertsTab alerts={alerts} patientId={id} onUpdate={loadPatientData} />
                    )}
                    {activeTab === 'attachments' && (
                        <AttachmentsTab patientId={id} />
                    )}
                </div>
            </div>
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ patient }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Demographics */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Informações Pessoais</h3>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm text-gray-600">Data de Nascimento</dt>
                            <dd className="font-semibold">
                                {patient.user?.profile?.dateOfBirth
                                    ? new Date(patient.user.profile.dateOfBirth).toLocaleDateString('pt-PT')
                                    : 'N/A'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-600">Género</dt>
                            <dd className="font-semibold capitalize">{patient.user?.profile?.gender || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-600">Tipo Sanguíneo</dt>
                            <dd className="font-semibold">{patient.bloodType || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-gray-600">Morada</dt>
                            <dd className="font-semibold">{patient.user?.profile?.address || 'N/A'}</dd>
                        </div>
                    </dl>
                </div>

                {/* Emergency Contact */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Contacto de Emergência</h3>
                    {patient.emergencyContact ? (
                        <dl className="space-y-3">
                            <div>
                                <dt className="text-sm text-gray-600">Nome</dt>
                                <dd className="font-semibold">{patient.emergencyContact.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-600">Relação</dt>
                                <dd className="font-semibold">{patient.emergencyContact.relationship}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-600">Telefone</dt>
                                <dd className="font-semibold">{patient.emergencyContact.phone}</dd>
                            </div>
                        </dl>
                    ) : (
                        <p className="text-gray-500">Nenhum contacto de emergência registado</p>
                    )}
                </div>
            </div>

            {/* Medical History */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Histórico Médico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Allergies */}
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-900 mb-2">Alergias</h4>
                        {patient.medicalHistory?.allergies?.length > 0 ? (
                            <ul className="space-y-1">
                                {patient.medicalHistory.allergies.map((allergy, idx) => (
                                    <li key={idx} className="text-sm text-red-800">
                                        • {allergy.name} <span className="text-xs">({allergy.severity})</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-red-700">Nenhuma alergia registada</p>
                        )}
                    </div>

                    {/* Chronic Diseases */}
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-900 mb-2">Doenças Crónicas</h4>
                        {patient.medicalHistory?.chronicDiseases?.length > 0 ? (
                            <ul className="space-y-1">
                                {patient.medicalHistory.chronicDiseases.map((disease, idx) => (
                                    <li key={idx} className="text-sm text-orange-800">
                                        • {disease.name} <span className="text-xs">({disease.status})</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-orange-700">Nenhuma doença crónica registada</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Insurance */}
            {patient.insurance?.provider && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Seguro de Saúde</h3>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-blue-700">Seguradora</dt>
                                <dd className="font-semibold text-blue-900">{patient.insurance.provider}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-blue-700">Nº Apólice</dt>
                                <dd className="font-semibold text-blue-900">{patient.insurance.policyNumber}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}
        </div>
    );
};

// Placeholder components for other tabs (to be implemented)
const TimelineTab = ({ timeline, patientId, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Linha do Tempo</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    + Adicionar Evento
                </button>
            </div>

            {timeline.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Activity className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p>Nenhum evento registado na linha do tempo.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pl-8 py-2">
                    {timeline.map((event) => (
                        <div key={event._id} className="relative">
                            <div className="absolute -left-[41px] bg-indigo-100 p-2 rounded-full border-2 border-white">
                                {event.type === 'appointment' && <Calendar className="w-4 h-4 text-indigo-600" />}
                                {event.type === 'diagnosis' && <Activity className="w-4 h-4 text-red-600" />}
                                {event.type === 'prescription' && <FileText className="w-4 h-4 text-green-600" />}
                                {event.type === 'exam' && <Paperclip className="w-4 h-4 text-amber-600" />}
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900 capitalize">{event.type || 'Evento'}</h4>
                                    <span className="text-xs text-gray-500">
                                        {new Date(event.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm">{event.description}</p>
                                {event.performedBy && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 inline-flex px-2 py-1 rounded">
                                        <User className="w-3 h-3" />
                                        <span>Dr. {event.performedBy.profile?.firstName}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AlertsTab = ({ alerts, patientId, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Alertas Clínicos</h3>
                <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors">
                    + Novo Alerta
                </button>
            </div>

            {alerts.active.length === 0 && alerts.resolved?.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Bell className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p>Nenhum alerta registado para este paciente.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Active Alerts */}
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ativos</h4>
                    {alerts.active.map(alert => (
                        <div key={alert._id} className={`p-4 rounded-lg border-l-4 shadow-sm flex justify-between items-start ${alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                            alert.severity === 'high' ? 'bg-orange-50 border-orange-500' : 'bg-yellow-50 border-yellow-500'
                            }`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className={`w-4 h-4 ${alert.severity === 'critical' ? 'text-red-600' :
                                        alert.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'
                                        }`} />
                                    <span className="font-bold text-gray-900">{alert.type}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 text-gray-600 border border-gray-200 capitalize">
                                        {alert.severity}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm">{alert.message}</p>
                                <p className="text-xs text-gray-400 mt-2">Criado em: {new Date(alert.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button className="text-sm text-gray-500 hover:text-gray-900 underline">
                                Resolver
                            </button>
                        </div>
                    ))}

                    {/* Resolved Alerts (Optional Display) */}
                    {alerts.resolved?.length > 0 && (
                        <>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-6">Histórico</h4>
                            {alerts.resolved.map(alert => (
                                <div key={alert._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-75">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-700 line-through">{alert.type}</span>
                                        <span className="text-xs text-green-600">Resolvido</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{alert.message}</p>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const RecordsTab = ({ patientId }) => {
    // Mock invoices for UI
    const invoices = [
        { _id: '1', number: 'INV-2024-001', date: '2024-01-15T10:00:00', amount: 2500, status: 'paid', description: 'Consulta Cardiologia' },
        { _id: '2', number: 'INV-2024-005', date: '2024-02-10T14:30:00', amount: 1500, status: 'pending', description: 'Exames Sangue' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Histórico Financeiro</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    + Nova Fatura
                </button>
            </div>

            <div className="overflow-hidden bg-white rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                            <tr key={invoice._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {invoice.number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(invoice.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {invoice.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(invoice.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {invoice.status === 'paid' ? 'Pago' : 'Pendente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">Ver</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AttachmentsTab = ({ patientId }) => {
    // Mock attachments
    const attachments = [
        { id: 1, name: 'Exame_Sangue_Jan24.pdf', type: 'exam', date: '2024-01-16', size: '2.4 MB' },
        { id: 2, name: 'Raio_X_Torax.jpg', type: 'image', date: '2023-11-05', size: '4.1 MB' },
        { id: 3, name: 'Receita_Dr_Silva.pdf', type: 'prescription', date: '2023-12-20', size: '150 KB' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Documentos e Anexos</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors">
                    <Paperclip className="w-4 h-4" />
                    Upload Arquivo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attachments.map((file) => (
                    <div key={file.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex items-start gap-3">
                        <div className={`p-3 rounded-lg ${file.type === 'image' ? 'bg-purple-100 text-purple-600' :
                                file.type === 'prescription' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{file.date} • {file.size}</p>
                            <div className="flex gap-3 mt-2">
                                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Download</button>
                                <button className="text-xs text-red-600 hover:text-red-800 font-medium">Excluir</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientDetailPage;
