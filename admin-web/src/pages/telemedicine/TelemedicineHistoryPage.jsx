import { useState, useEffect } from 'react';
import {
    Video, Calendar, Clock, User, Download,
    FileText, Search, PlayCircle
} from 'lucide-react';

const TelemedicineHistoryPage = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Mock data
        setHistory([
            { id: 1, doctor: 'Dr. Mauro Patricio', patient: 'Ana Silva', date: '2024-02-05', time: '14:30', duration: '25m', status: 'completed', recording: true },
            { id: 2, doctor: 'Dra. Sofia Costa', patient: 'João Paulo', date: '2024-02-04', time: '10:00', duration: '15m', status: 'completed', recording: false },
            { id: 3, doctor: 'Dr. Mauro Patricio', patient: 'Carlos Dias', date: '2024-02-03', time: '16:00', duration: '40m', status: 'completed', recording: true },
        ]);
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Histórico de Telemedicina</h1>
                <p className="text-gray-600">Registro de todas as videochamadas realizadas.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por paciente ou médico..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Paciente</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Médico</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Data/Hora</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duração</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Gravação</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                        {item.patient.substring(0, 2).toUpperCase()}
                                    </div>
                                    {item.patient}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{item.doctor}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex flex-col text-sm">
                                        <span className="font-semibold">{item.date}</span>
                                        <span className="text-gray-400">{item.time}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{item.duration}</td>
                                <td className="px-6 py-4">
                                    {item.recording ? (
                                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                            <PlayCircle className="w-4 h-4" /> Disponível
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-sm italic">Não gravado</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">Detalhes</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TelemedicineHistoryPage;
