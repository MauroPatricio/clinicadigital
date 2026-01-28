import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Filter, Plus, List, Grid } from 'lucide-react';
import { appointmentService } from '../services/apiService';
import api from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import CalendarView from '../components/appointments/CalendarView';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/premium/SkeletonLoader';

const AppointmentsPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('calendar'); // 'list' or 'calendar'
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        loadAppointments();
    }, [filterStatus, currentDate, viewMode]);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const params = filterStatus !== 'all' ? { status: filterStatus } : {};

            // In a real implementation with large data, we would pass start/end dates
            const response = await api.get('/appointments', { params });
            setAppointments(response.data.data || []);
        } catch (error) {
            console.error(error);
            // Don't show toast on initial load if just empty
            if (appointments.length > 0) toast.error(t('appointments.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        try {
            await api.put(`/appointments/${id}/status`, { status: 'confirmed' });
            toast.success(t('appointments.confirmedSuccess'));
            loadAppointments();
        } catch (error) {
            toast.error(t('appointments.errorConfirming'));
        }
    };

    const handleSlotClick = (date, hour) => {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        window.location.href = `/appointments/new?date=${date.toISOString()}&time=${timeString}`;
    };

    const getStatusBadge = (status) => {
        const badges = {
            scheduled: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-purple-100 text-purple-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            'no-show': 'bg-gray-100 text-gray-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading && !appointments.length) {
        return (
            <div className="p-6">
                <SkeletonLoader variant="card" count={1} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('appointments.title')}</h1>
                    <p className="text-gray-600 mt-1">{t('appointments.subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            title={t('common.calendar')}
                        >
                            <CalendarIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            title={t('common.list')}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={() => window.location.href = '/appointments/new'}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        {t('appointments.newAppointment')}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border-none bg-transparent focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer outline-none"
                >
                    <option value="all">{t('appointments.status.all')}</option>
                    <option value="scheduled">{t('appointments.status.scheduled')}</option>
                    <option value="confirmed">{t('appointments.status.confirmed')}</option>
                    <option value="in-progress">{t('appointments.status.inProgress')}</option>
                    <option value="completed">{t('appointments.status.completed')}</option>
                    <option value="cancelled">{t('appointments.status.cancelled')}</option>
                </select>
            </div>

            {/* Content */}
            {viewMode === 'calendar' ? (
                <CalendarView
                    appointments={appointments}
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    onSlotClick={handleSlotClick}
                    onAppointmentClick={(apt) => window.location.href = `/consultations/${apt._id}`}
                />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('appointments.table.patient')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('appointments.table.doctor')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('appointments.table.dateTime')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('appointments.table.status')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('appointments.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointments.map((apt) => (
                                    <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {apt.patient?.profile?.firstName?.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {apt.patient?.profile?.firstName} {apt.patient?.profile?.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {apt.reason || t('appointments.routineConsultation')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">Dr. {apt.doctor?.profile?.firstName}</div>
                                            <div className="text-sm text-gray-500">{apt.doctor?.specialty}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {format(new Date(apt.dateTime), 'dd/MM/yyyy')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {format(new Date(apt.dateTime), 'HH:mm')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {apt.status === 'scheduled' && (
                                                <button
                                                    onClick={() => handleConfirm(apt._id)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    {t('common.confirm')}
                                                </button>
                                            )}
                                            <button className="text-gray-400 hover:text-gray-600">
                                                {t('common.details')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {appointments.length === 0 && (
                            <div className="text-center py-12">
                                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">{t('appointments.noAppointments')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentsPage;
