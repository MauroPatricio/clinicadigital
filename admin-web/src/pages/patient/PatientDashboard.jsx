import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, FlaskConical, Pill, ChevronRight, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const PatientDashboard = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch my appointments
            const response = await api.get('/appointments?my=true');
            setAppointments(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {t('dashboard.welcomeUser', { name: user?.profile?.firstName })}
                </h1>
                <p className="opacity-90">{t('dashboard.welcomeMessage')}</p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                    onClick={() => window.location.href = '/appointments/new'}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center gap-3"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700">{t('actions.schedule')}</span>
                </button>
                <button
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center gap-3"
                >
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <FlaskConical className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700">{t('actions.exams')}</span>
                </button>
                <button
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center gap-3"
                >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Pill className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700">{t('actions.prescriptions')}</span>
                </button>
                <button
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center gap-3"
                >
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <Video className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-gray-700">{t('actions.telemedicine')}</span>
                </button>
            </div>

            {/* Next Appointment Card */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{t('dashboard.upcomingAppointments')}</h2>
                    <button className="text-blue-600 text-sm font-medium hover:underline">{t('common.viewAll', 'Ver todas')}</button>
                </div>

                {loading ? (
                    <div className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                ) : appointments.length > 0 ? (
                    <div className="space-y-4">
                        {appointments.slice(0, 3).map(apt => (
                            <div key={apt._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex gap-4">
                                    <div className="bg-blue-50 px-4 py-2 rounded-lg text-center min-w-[80px]">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {format(new Date(apt.dateTime), 'dd')}
                                        </div>
                                        <div className="text-xs font-semibold text-blue-400 uppercase">
                                            {format(new Date(apt.dateTime), 'MMM', { locale: i18n.language === 'pt' ? ptBR : enUS })}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Dr. {apt.doctor?.user?.profile?.lastName}</h3>
                                        <p className="text-sm text-gray-500">{apt.doctor?.specialty || 'Clínico Geral'}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(apt.dateTime), 'HH:mm')}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {apt.type === 'online' ? <Video className="w-3 h-3 text-blue-500" /> : <MapPin className="w-3 h-3" />}
                                                {apt.type === 'online' ? 'Videochamada' : 'Consultório 1'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {apt.type === 'online' && apt.status === 'in-waiting-room' && (
                                    <button
                                        onClick={() => window.location.href = `/telemedicine/${apt._id}`}
                                        className="w-full md:w-auto px-6 py-3 bg-green-500 text-white rounded-lg font-bold shadow-md hover:bg-green-600 transition-transform hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <Video className="w-5 h-5" />
                                        {t('appointments.joinRoom', 'Entrar na Sala')}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">{t('dashboard.noAppointments')}</p>
                        <button className="mt-4 text-blue-600 font-medium">{t('dashboard.scheduleNow')}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDashboard;
