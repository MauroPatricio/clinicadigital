import { useState, useEffect } from 'react';
import { FlaskConical, FileText, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import medicalRecordService from '../services/medicalRecordService'; // Need to ensure this service has getLabOrders or similar
// Or use direct api
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import SkeletonLoader from '../components/premium/SkeletonLoader';

const LabResultsPage = () => {
    const { user } = useAuth();
    const { t, i18n } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed

    useEffect(() => {
        loadLabOrders();
    }, [filter]);

    const loadLabOrders = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            // Using direct API call assuming route exists or adding method later
            const response = await api.get('/lab/orders', { params });
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Error loading lab orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-50 border-green-200';
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'in-progress': return <FlaskConical className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    if (loading && !orders.length) {
        return <div className="p-6"><SkeletonLoader variant="card" count={3} /></div>;
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{t('lab.resultsTitle')}</h1>
                    <p className="text-gray-600 mt-1">{t('lab.resultsSubtitle')}</p>
                </div>

                <div className="flex gap-2">
                    {['all', 'pending', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {f === 'all' ? t('common.all', 'Todos') : f === 'pending' ? t('status.pending', 'Pendentes') : t('status.completed', 'Concluídos')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <FlaskConical className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-gray-900 font-medium">{t('lab.noResults')}</h3>
                        <p className="text-gray-500 text-sm">{t('lab.noResultsMessage')}</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {order.patient?.user?.profile?.firstName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            {order.patient?.user?.profile?.firstName} {order.patient?.user?.profile?.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {t('lab.orderNumber', { number: order.orderNumber })} • {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: i18n.language === 'pt' ? ptBR : enUS })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 h-fit w-fit ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    <span className="uppercase">{order.status}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{t('lab.requestedExams')}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {order.exams.map((exam, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-800">{exam.name}</span>
                                            {exam.status === 'completed' && (
                                                <button className="text-blue-600 hover:text-blue-800 p-1">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {order.status === 'completed' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {t('lab.viewFullResults')}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LabResultsPage;
