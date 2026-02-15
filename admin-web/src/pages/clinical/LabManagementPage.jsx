import { useState } from 'react';
import {
    TestTube, FileText, Clock, CheckCircle,
    Search, Plus, Download, Filter
} from 'lucide-react';

const LabManagementPage = () => {
    const [activeTab, setActiveTab] = useState('requests');

    // Mock Data
    const requests = [
        { id: 1, patient: 'Maria Silva', exam: 'Hemograma Completo', doctor: 'Dr. Mauro', date: '06/02/2024', status: 'pending', priority: 'high' },
        { id: 2, patient: 'João Santos', exam: 'Perfil Lipídico', doctor: 'Dra. Ana', date: '06/02/2024', status: 'processing', priority: 'normal' },
        { id: 3, patient: 'Pedro Costa', exam: 'Glicemia Jejum', doctor: 'Dr. Mauro', date: '05/02/2024', status: 'completed', priority: 'normal' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TestTube className="w-8 h-8 text-indigo-600" />
                        Gestão Laboratorial
                    </h1>
                    <p className="text-gray-600">Central de exames e resultados.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Novo Pedido</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 text-center transition-colors ${activeTab === 'requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Solicitações
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 text-center transition-colors ${activeTab === 'results' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Resultados
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-4 text-sm font-medium border-b-2 text-center transition-colors ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Histórico
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por paciente, exame ou código..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Paciente</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Exame</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Médico</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                item.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.patient}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.exam}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.doctor}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{item.date}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {item.status === 'completed' && (
                                            <button className="text-gray-500 hover:text-indigo-600">
                                                <Download className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Ver Detalhes</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LabManagementPage;
