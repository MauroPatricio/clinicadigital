import React, { useState } from 'react';
import { Video, Calendar, Users, Activity, Phone, Clock } from 'lucide-react';

const TelemedicineDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Mock data
    const stats = {
        activeSessions: 3,
        todayAppointments: 12,
        onlineDoctors: 8,
        avgSessionQuality: 4.5,
    };

    const activeSessions = [
        { id: 1, doctor: 'Dr. João Silva', patient: 'Maria Santos', duration: '15 min', quality: 'Excelente' },
        { id: 2, doctor: 'Dra. Ana Costa', patient: 'Pedro Alves', duration: '8 min', quality: 'Boa' },
        { id: 3, doctor: 'Dr. Carlos Mendes', patient: 'Sofia Lima', duration: '22 min', quality: 'Excelente' },
    ];

    const upcomingAppointments = [
        { time: '14:30', doctor: 'Dr. João Silva', patient: 'António Ferreira', type: 'Consulta Geral' },
        { time: '15:00', doctor: 'Dra. Ana Costa', patient: 'Isabel Rodrigues', type: 'Acompanhamento' },
        { time: '15:30', doctor: 'Dr. Carlos Mendes', patient: 'Manuel Santos', type: 'Primeira Consulta' },
    ];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Video className="w-8 h-8 text-blue-600" />
                    Telemedicina
                </h1>
                <p className="text-gray-600 mt-1">Gestão de consultas virtuais e videoconferências</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <Video className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-gray-600 text-sm">Sessões Ativas</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.activeSessions}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <Calendar className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-gray-600 text-sm">Consultas Hoje</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.todayAppointments}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <Users className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-gray-600 text-sm">Médicos Online</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.onlineDoctors}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                    <Activity className="w-8 h-8 text-yellow-600 mb-2" />
                    <p className="text-gray-600 text-sm">Qualidade Média</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.avgSessionQuality}/5</p>
                </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-bold text-gray-800">Sessões em Andamento</h2>
                </div>

                <div className="space-y-3">
                    {activeSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center">
                                    <Video className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{session.doctor}</p>
                                    <p className="text-sm text-gray-600">Paciente: {session.patient}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 flex items-center gap-1 justify-end">
                                    <Clock className="w-4 h-4" />
                                    {session.duration}
                                </p>
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">{session.quality}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    Próximas Consultas
                </h2>

                <div className="space-y-3">
                    {upcomingAppointments.map((apt, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                                    <p className="font-bold text-blue-600">{apt.time}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{apt.doctor}</p>
                                    <p className="text-sm text-gray-600">{apt.patient} - {apt.type}</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Iniciar
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Doctor Availability */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Disponibilidade dos Médicos</h2>
                <p className="text-gray-600">Calendário de disponibilidade será exibido aqui.</p>
            </div>
        </div>
    );
};

export default TelemedicineDashboard;
