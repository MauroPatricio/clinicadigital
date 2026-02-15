import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, TrendingUp, Filter, MessageCircle } from 'lucide-react';
import marketingService from '../../services/marketingService';
import { useClinic } from '../../context/ClinicContext';
import toast from 'react-hot-toast';

const FeedbackManagementPage = () => {
    const { selectedClinic } = useClinic();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadData();
    }, [selectedClinic, filterRating, filterStatus]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await marketingService.getFeedback({
                clinicId: selectedClinic?.id,
                rating: filterRating === 'all' ? undefined : filterRating,
                status: filterStatus === 'all' ? undefined : filterStatus,
            });
            setData(result);
        } catch (error) {
            console.error('Error loading feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (feedbackId) => {
        const response = prompt('Digite sua resposta:');
        if (response) {
            try {
                await marketingService.respondToFeedback(feedbackId, response);
                toast.success('Resposta enviada com sucesso');
                loadData();
            } catch (error) {
                toast.error('Erro ao enviar resposta');
            }
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
        ));
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                    Feedback dos Pacientes
                </h1>
                <p className="text-gray-600 mt-1">Acompanhe e responda ao feedback dos pacientes</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <MessageCircle className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-gray-600 text-sm">Total de Feedback</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.stats?.totalFeedback || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <Star className="w-8 h-8 text-yellow-600 mb-2" />
                    <p className="text-gray-600 text-sm">Avaliação Média</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.stats?.avgRating?.toFixed(1) || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-gray-600 text-sm">NPS Score</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.stats?.nps || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <Filter className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-gray-600 text-sm">Taxa de Resposta</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.stats?.responseRate || 0}%</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4 flex gap-4">
                <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="px-4 py-2 border rounded-lg">
                    <option value="all">Todas as Avaliações</option>
                    <option value="5">5 Estrelas</option>
                    <option value="4">4 Estrelas</option>
                    <option value="3">3 Estrelas</option>
                    <option value="2">2 Estrelas</option>
                    <option value="1">1 Estrela</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
                    <option value="all">Todos os Status</option>
                    <option value="pending">Pendente</option>
                    <option value="responded">Respondido</option>
                </select>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
                {data?.feedback?.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="font-bold text-gray-800">{item.patient}</p>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{item.category}</span>
                                    {item.status === 'responded' && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Respondido</span>}
                                </div>
                                <div className="flex items-center gap-1">{renderStars(item.rating)}</div>
                            </div>
                            <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString('pt-PT')}</p>
                        </div>

                        <p className="text-gray-700 mb-3">{item.comment}</p>

                        {item.response && (
                            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Sua Resposta:</p>
                                <p className="text-sm text-blue-800">{item.response}</p>
                            </div>
                        )}

                        {item.status === 'pending' && (
                            <button onClick={() => handleRespond(item.id)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Responder
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedbackManagementPage;
