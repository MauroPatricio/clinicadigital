import { useState, useEffect } from 'react';
import {
    Phone, Check, X, MessageSquare, Calendar
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ConfirmationPage = () => {
    const [pendingConfirmations, setPendingConfirmations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data for unconfirmed appointments tomorrow
        setTimeout(() => {
            setPendingConfirmations([
                { id: 1, patient: 'Pedro Santos', phone: '841234567', doctor: 'Dr. Silva', date: addDays(new Date(), 1), time: '09:00', type: 'Consulta Inicial' },
                { id: 2, patient: 'Luisa Ferreira', phone: '829876543', doctor: 'Dra. Gomes', date: addDays(new Date(), 1), time: '11:00', type: 'Retorno' },
                { id: 3, patient: 'Carlos Alberto', phone: '871122334', doctor: 'Dr. Silva', date: addDays(new Date(), 1), time: '14:30', type: 'Exame' },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    const handleConfirm = (id) => {
        setPendingConfirmations(prev => prev.filter(p => p.id !== id));
        toast.success('Agendamento confirmado!');
    };

    const handleCancel = (id) => {
        setPendingConfirmations(prev => prev.filter(p => p.id !== id));
        toast.success('Agendamento cancelado.');
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Confirmações Pendentes</h1>
                    <p className="text-gray-600">Pacientes agendados para amanhã que ainda não confirmaram.</p>
                </div>
                <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Para: {format(addDays(new Date(), 1), 'dd/MM/yyyy')}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : pendingConfirmations.length === 0 ? (
                <div className="bg-green-50 p-12 text-center rounded-xl border border-green-200">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-green-900">Tudo Pronto!</h3>
                    <p className="text-green-700">Todos os agendamentos de amanhã foram processados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingConfirmations.map((appt) => (
                        <div key={appt.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                                    {appt.time}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{appt.patient}</h3>
                                    <p className="text-sm text-gray-600">{appt.type} com {appt.doctor}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Phone className="w-3 h-3" /> {appt.phone}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Enviar WhatsApp">
                                    <MessageSquare className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleCancel(appt.id)}
                                    className="flex-1 sm:flex-none px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleConfirm(appt.id)}
                                    className="flex-1 sm:flex-none px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Confirmar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConfirmationPage;
