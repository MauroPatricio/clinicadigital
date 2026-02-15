import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Clock, CheckCircle, XCircle, Users, Package } from 'lucide-react';
import transferService from '../../services/transferService';
import { useClinic } from '../../context/ClinicContext';
import toast from 'react-hot-toast';

const TransfersPage = () => {
    const { selectedClinic } = useClinic();
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadTransfers();
    }, [selectedClinic, filter]);

    const loadTransfers = async () => {
        setLoading(true);
        try {
            const data = await transferService.getTransferRequests({
                clinicId: selectedClinic?.id,
                status: filter === 'all' ? undefined : filter,
            });
            setTransfers(data);
        } catch (error) {
            console.error('Error loading transfers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (transferId) => {
        try {
            await transferService.approveTransfer(transferId);
            toast.success('Transferência aprovada com sucesso');
            loadTransfers();
        } catch (error) {
            toast.error('Erro ao aprovar transferência');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300',
            completed: 'bg-blue-100 text-blue-800 border-blue-300',
        };
        const labels = {
            pending: 'Pendente',
            approved: 'Aprovado',
            rejected: 'Rejeitado',
            completed: 'Concluído',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getTypeIcon = (type) => {
        return type === 'patient' ? (
            <Users className="w-5 h-5 text-blue-600" />
        ) : (
            <Package className="w-5 h-5 text-purple-600" />
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <ArrowRightLeft className="w-8 h-8 text-blue-600" />
                        Gestão de Transferências
                    </h1>
                    <p className="text-gray-600 mt-1">Transferências de pacientes e recursos entre clínicas</p>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                    Nova Transferência
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-2 flex gap-2">
                {['all', 'pending', 'approved', 'completed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'approved' ? 'Aprovados' : 'Concluídos'}
                    </button>
                ))}
            </div>

            {/* Transfers List */}
            <div className="space-y-4">
                {transfers.length === 0 ? (
                    <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
                        <ArrowRightLeft className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Nenhuma transferência encontrada</p>
                    </div>
                ) : (
                    transfers.map((transfer) => (
                        <div
                            key={transfer.id}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        {getTypeIcon(transfer.type)}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">
                                                {transfer.type === 'patient'
                                                    ? transfer.patient?.name
                                                    : transfer.resource?.name}
                                            </h3>
                                            {getStatusBadge(transfer.status)}
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <span className="font-medium">{transfer.fromClinic}</span>
                                            <ArrowRightLeft className="w-4 h-4" />
                                            <span className="font-medium">{transfer.toClinic}</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(transfer.requestDate).toLocaleDateString('pt-PT')}
                                            </span>
                                            <span>Solicitado por: {transfer.requestedBy}</span>
                                        </div>
                                    </div>
                                </div>

                                {transfer.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(transfer.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Aprovar
                                        </button>
                                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                                            <XCircle className="w-4 h-4" />
                                            Rejeitar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {transfer.reason && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-700">
                                        <strong>Motivo:</strong> {transfer.reason}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Simple Modal Placeholder */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Nova Transferência</h2>
                        <p className="text-gray-600 mb-4">Formulário de criação de transferência será implementado aqui.</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransfersPage;
