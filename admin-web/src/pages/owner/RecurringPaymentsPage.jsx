import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Plus, Search, Calendar, RefreshCcw, PauseCircle, PlayCircle, XCircle,
    CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const RecurringPaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/owner/finance/premium/recurring-payments');
            setPayments(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar pagamentos recorrentes');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/owner/finance/premium/recurring-payments/${id}/status`, { status: newStatus });
            toast.success(`Status alterado para ${newStatus}`);
            loadPayments();
        } catch (error) {
            toast.error('Erro ao alterar status');
        }
    };

    const getFrequencyLabel = (freq) => {
        const labels = {
            monthly: 'Mensal',
            weekly: 'Semanal',
            'bi-weekly': 'Quinzenal',
            quarterly: 'Trimestral',
            yearly: 'Anual'
        };
        return labels[freq] || freq;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pagamentos Recorrentes</h1>
                    <p className="text-gray-500">Gestão de assinaturas e planos de pagamento</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Novo Plano
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500">Paciente</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Descrição</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Frequência</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Próx. Cobrança</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Valor</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center">Carregando...</td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-500">Nenhum plano recorrente encontrado</td></tr>
                        ) : (
                            payments.map(payment => (
                                <tr key={payment._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {payment.patient?.profile?.firstName} {payment.patient?.profile?.lastName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{payment.description}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                                            {getFrequencyLabel(payment.frequency)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(payment.nextPaymentDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {payment.amount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                            ${payment.status === 'active' ? 'bg-green-100 text-green-800' :
                                                payment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                            {payment.status === 'active' ? 'Ativo' :
                                                payment.status === 'paused' ? 'Pausado' : 'Cancelado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        {payment.status === 'active' ? (
                                            <button
                                                onClick={() => handleStatusChange(payment._id, 'paused')}
                                                title="Pausar"
                                                className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                                            >
                                                <PauseCircle className="w-5 h-5" />
                                            </button>
                                        ) : payment.status === 'paused' ? (
                                            <button
                                                onClick={() => handleStatusChange(payment._id, 'active')}
                                                title="Retomar"
                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                            >
                                                <PlayCircle className="w-5 h-5" />
                                            </button>
                                        ) : null}
                                        {payment.status !== 'cancelled' && (
                                            <button
                                                onClick={() => handleStatusChange(payment._id, 'cancelled')}
                                                title="Cancelar"
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecurringPaymentsPage;
