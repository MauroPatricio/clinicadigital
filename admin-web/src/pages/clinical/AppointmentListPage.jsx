import { useState, useEffect } from 'react';
import {
    Calendar, List, User, Clock, Check, X, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/api';

const AppointmentListPage = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch
        setTimeout(() => {
            setAppointments([
                { id: 1, patient: 'Maria Silva', doctor: 'Dr. Santos', date: new Date(), time: '09:00', status: 'confirmed', type: 'Consulta' },
                { id: 2, patient: 'João Paulo', doctor: 'Dra. Costa', date: new Date(), time: '10:30', status: 'pending', type: 'Exame' },
                { id: 3, patient: 'Ana Beatriz', doctor: 'Dr. Lima', date: new Date(), time: '14:00', status: 'cancelled', type: 'Retorno' },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
                    <p className="text-gray-600">Consulte e gerencie todas as marcações.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <List className="w-4 h-4" /> Lista
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Calendar className="w-4 h-4" /> Calendário
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Paciente</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Médico</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Data & Hora</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {appointments.map((appt) => (
                                <tr key={appt.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{appt.patient}</td>
                                    <td className="px-6 py-4 text-gray-600">{appt.doctor}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{format(appt.date, 'dd/MM/yyyy')}</span>
                                            <span className="text-xs text-gray-500">{appt.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{appt.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(appt.status)}`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Detalhes</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Visualização de calendário será implementada (utilizar componente BigCalendar).</p>
                </div>
            )}
        </div>
    );
};

export default AppointmentListPage;
