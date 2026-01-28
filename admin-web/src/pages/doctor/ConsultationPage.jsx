import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText,
    Activity,
    Pill,
    FlaskConical,
    History,
    Save,
    Check,
    Clock,
    User,
    Scale,
    Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import medicalRecordService from '../../services/medicalRecordService';
import api from '../../services/api'; // For direct patient/appointment fetch if needed
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ConsultationPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [appointment, setAppointment] = useState(null);
    const [patient, setPatient] = useState(null);
    const [activeTab, setActiveTab] = useState('notes'); // notes, prescriptions, exams, history

    // Form Stats
    const [vitals, setVitals] = useState({
        bloodPressure: { systolic: '', diastolic: '' },
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        bmi: ''
    });

    const [notes, setNotes] = useState({
        chiefComplaint: '',
        presentIllnessHistory: '',
        physicalExamination: '',
        diagnosis: '', // Simple string for now, could be ICD-10 search later
        treatment: '',
        privateNotes: ''
    });

    const [prescriptions, setPrescriptions] = useState([{
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
    }]);

    useEffect(() => {
        loadData();
    }, [appointmentId]);

    useEffect(() => {
        // Calculate BMI
        if (vitals.weight && vitals.height) {
            const h = parseFloat(vitals.height) / 100;
            const w = parseFloat(vitals.weight);
            if (h > 0 && w > 0) {
                const bmi = (w / (h * h)).toFixed(1);
                setVitals(prev => ({ ...prev, bmi }));
            }
        }
    }, [vitals.weight, vitals.height]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch appointment details
            const response = await api.get(`/appointments/${appointmentId}`);
            const apt = response.data.data;
            setAppointment(apt);
            setPatient(apt.patient);

            // Should also check if record exists for this appointment
            // For now assume new
        } catch (error) {
            console.error('Error loading consultation:', error);
            toast.error(t('common.errorLoadingConsultation', 'Erro ao carregar dados da consulta'));
        } finally {
            setLoading(false);
        }
    };

    const handleVitalsChange = (field, value, subField = null) => {
        if (subField) {
            setVitals(prev => ({
                ...prev,
                [field]: { ...prev[field], [subField]: value }
            }));
        } else {
            setVitals(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = async (complete = false) => {
        try {
            const recordData = {
                appointment: appointmentId,
                patient: patient._id,
                doctor: user._id, // Assuming doctor is current user
                vitalSigns: vitals,
                ...notes,
                prescriptions: prescriptions.filter(p => p.name) // Filter empty rows
            };

            await medicalRecordService.createRecord(recordData);

            if (complete) {
                // Mark appointment as completed
                await api.put(`/appointments/${appointmentId}/status`, { status: 'completed' });
                toast.success(t('consultation.successFinish'));
                navigate('/appointments');
            } else {
                toast.success(t('consultation.draftSaved'));
            }
        } catch (error) {
            console.error(error);
            toast.error(t('consultation.errorSaving'));
        }
    };

    const addPrescriptionRow = () => {
        setPrescriptions(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    if (loading) {
        return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
            {/* Left Sidebar - Navigation */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {patient?.profile?.firstName?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="font-bold text-gray-900 truncate">
                                {patient?.profile?.firstName} {patient?.profile?.lastName}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {patient?.profile?.gender === 'male' ? t('common.male') : t('common.female')}, {
                                    new Date().getFullYear() - new Date(patient?.profile?.dateOfBirth).getFullYear()
                                } {t('common.years')}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="p-2 space-y-1 flex-1">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notes' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        {t('consultation.notes')}
                    </button>
                    <button
                        onClick={() => setActiveTab('prescriptions')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'prescriptions' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Pill className="w-4 h-4" />
                        {t('consultation.prescriptions')}
                    </button>
                    <button
                        onClick={() => setActiveTab('exams')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'exams' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FlaskConical className="w-4 h-4" />
                        {t('consultation.exams')}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <History className="w-4 h-4" />
                        {t('consultation.history')}
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-200 space-y-2">
                    <button
                        onClick={() => handleSave(false)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors bg-white font-medium"
                    >
                        <Save className="w-4 h-4" />
                        {t('consultation.saveDraft')}
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-md font-medium"
                    >
                        <Check className="w-4 h-4" />
                        {t('consultation.finish')}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Vitals Bar - Always visible */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-red-500" />
                            <h3 className="font-bold text-gray-900">{t('consultation.vitals')}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('consultation.bloodPressure')}</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        placeholder="120"
                                        value={vitals.bloodPressure.systolic}
                                        onChange={(e) => handleVitalsChange('bloodPressure', e.target.value, 'systolic')}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                    />
                                    <span>/</span>
                                    <input
                                        type="number"
                                        placeholder="80"
                                        value={vitals.bloodPressure.diastolic}
                                        onChange={(e) => handleVitalsChange('bloodPressure', e.target.value, 'diastolic')}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('consultation.temperature')}</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={vitals.temperature}
                                    onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('consultation.heartRate')}</label>
                                <input
                                    type="number"
                                    value={vitals.heartRate}
                                    onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('consultation.oxygenSaturation')}</label>
                                <input
                                    type="number"
                                    value={vitals.oxygenSaturation}
                                    onChange={(e) => handleVitalsChange('oxygenSaturation', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('consultation.weight')}</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={vitals.weight}
                                    onChange={(e) => handleVitalsChange('weight', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">{t('consultation.bmi')}</label>
                                <input
                                    type="text"
                                    readOnly
                                    value={vitals.bmi}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    {activeTab === 'notes' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('consultation.chiefComplaint')}</label>
                                <input
                                    type="text"
                                    value={notes.chiefComplaint}
                                    onChange={(e) => setNotes(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    placeholder="Ex: Dor de cabeça há 3 dias..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('consultation.hpi')}</label>
                                    <textarea
                                        value={notes.presentIllnessHistory}
                                        onChange={(e) => setNotes(prev => ({ ...prev, presentIllnessHistory: e.target.value }))}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Detalhes sobre a condição do paciente..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('consultation.physicalExam')}</label>
                                    <textarea
                                        value={notes.physicalExamination}
                                        onChange={(e) => setNotes(prev => ({ ...prev, physicalExamination: e.target.value }))}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Achados do exame físico..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('consultation.diagnosisLabel')}</label>
                                <input
                                    type="text"
                                    value={notes.diagnosis}
                                    onChange={(e) => setNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Digite o diagnóstico..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('consultation.treatment')}</label>
                                <textarea
                                    value={notes.treatment}
                                    onChange={(e) => setNotes(prev => ({ ...prev, treatment: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Plano de tratamento..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'prescriptions' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Pill className="w-5 h-5 text-blue-600" />
                                {t('consultation.medicalPrescription')}
                            </h3>
                            <div className="space-y-4">
                                {prescriptions.map((script, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('consultation.medication')}</label>
                                                <input
                                                    type="text"
                                                    value={script.name}
                                                    onChange={(e) => {
                                                        const newRx = [...prescriptions];
                                                        newRx[idx].name = e.target.value;
                                                        setPrescriptions(newRx);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                    placeholder="Nome do medicamento..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('consultation.dosage')}</label>
                                                <input
                                                    type="text"
                                                    value={script.dosage}
                                                    onChange={(e) => {
                                                        const newRx = [...prescriptions];
                                                        newRx[idx].dosage = e.target.value;
                                                        setPrescriptions(newRx);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                    placeholder="Ex: 500mg"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('consultation.frequency')}</label>
                                                <input
                                                    type="text"
                                                    value={script.frequency}
                                                    onChange={(e) => {
                                                        const newRx = [...prescriptions];
                                                        newRx[idx].frequency = e.target.value;
                                                        setPrescriptions(newRx);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                    placeholder="Ex: 8/8h"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('consultation.duration')}</label>
                                                <input
                                                    type="text"
                                                    value={script.duration}
                                                    onChange={(e) => {
                                                        const newRx = [...prescriptions];
                                                        newRx[idx].duration = e.target.value;
                                                        setPrescriptions(newRx);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                    placeholder="Ex: 5 dias"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('consultation.instructions')}</label>
                                                <input
                                                    type="text"
                                                    value={script.instructions}
                                                    onChange={(e) => {
                                                        const newRx = [...prescriptions];
                                                        newRx[idx].instructions = e.target.value;
                                                        setPrescriptions(newRx);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                    placeholder="Ex: Tomar após refeições"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={addPrescriptionRow}
                                    className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-800"
                                >
                                    {t('consultation.addMedication')}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                            <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>{t('consultation.historyComingSoon')}</p>
                        </div>
                    )}

                    {activeTab === 'exams' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FlaskConical className="w-5 h-5 text-blue-600" />
                                {t('consultation.examRequest')}
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-blue-500 transition-colors"
                                        onClick={() => {
                                            toast.success(t('consultation.examAdded'));
                                            // Implement logic to add to a state list
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700">{t('exams.cbc')}</span>
                                            <Plus className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-blue-500 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700">{t('exams.fastingGlucose')}</span>
                                            <Plus className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-blue-500 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700">{t('exams.cholesterol')}</span>
                                            <Plus className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-blue-500 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700">{t('exams.urine')}</span>
                                            <Plus className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('consultation.otherExams')}</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder={t('consultation.ph_otherExams')}
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                        <FlaskConical className="w-4 h-4" />
                                        {t('consultation.generateExamOrder')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ConsultationPage;
