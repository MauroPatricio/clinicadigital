import { useState, useEffect } from 'react';
import { FlaskConical, Search, Calendar, Download, FileText, TrendingUp, Clock } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import labService from '../../services/labService';
import { format } from 'date-fns';

const LaboratoryResultsPage = () => {
    const { currentClinic } = useClinic();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ avgTurnaround: 0, minTurnaround: 0, maxTurnaround: 0 });
    const [filters, setFilters] = useState({
        search: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        loadResults();
    }, [currentClinic, filters]);

    const loadResults = async () => {
        try {
            setLoading(true);
            const params = {
                ...(currentClinic && { clinic: currentClinic._id }),
                ...(filters.search && { search: filters.search }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate })
            };

            const response = await labService.getOwnerResults(params);
            setResults(response.data || []);
            setStats(response.stats || { avgTurnaround: 0, minTurnaround: 0, maxTurnaround: 0 });
        } catch (error) {
            console.error('Error loading lab results:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAbnormalFlagColor = (flag) => {
        switch (flag) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'low': return 'bg-yellow-100 text-yellow-800';
            case 'normal': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-600" />
                    Resultados de Laboratório
                </h1>
                <p className="text-gray-600 mt-1">Visualização de resultados completos de exames</p>
            </div>

            {/* Turnaround Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Tempo Médio Entrega</p>
                            <h3 className="text-4xl font-bold mt-2">{stats.avgTurnaround}h</h3>
                        </div>
                        <Clock className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Tempo Mínimo</p>
                            <h3 className="text-4xl font-bold mt-2">{stats.minTurnaround}h</h3>
                        </div>
                        <TrendingUp className="w-12 h-12 opacity-80" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Tempo Máximo</p>
                            <h3 className="text-4xl font-bold mt-2">{stats.maxTurnaround}h</h3>
                        </div>
                        <Clock className="w-12 h-12 opacity-80" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar paciente ou nº pedido..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Data Inicial"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Data Final"
                        />
                    </div>
                </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-gray-900 font-semibold text-lg">Nenhum resultado encontrado</h3>
                        <p className="text-gray-500 mt-1">Não há resultados de laboratório disponíveis</p>
                    </div>
                ) : (
                    results.map((order) => (
                        <div key={order._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                                {/* Patient Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {order.patient?.user?.profile?.firstName?.charAt(0) || 'P'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            {order.patient?.user?.profile?.firstName} {order.patient?.user?.profile?.lastName}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                {order.orderNumber}
                                            </span>
                                            <span>•</span>
                                            <span>Resultado: {format(new Date(order.resultsAvailableAt), 'dd/MM/yyyy HH:mm')}</span>
                                        </div>
                                    </div>
                                </div>

                                <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 h-fit">
                                    <Download className="w-4 h-4" />
                                    Baixar Relatório
                                </button>
                            </div>

                            {/* Results Details */}
                            {order.exams?.map((exam, examIdx) => (
                                exam.status === 'completed' && exam.results && (
                                    <div key={examIdx} className="mb-6 last:mb-0">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <FlaskConical className="w-5 h-5 text-emerald-600" />
                                            {exam.name}
                                        </h4>

                                        {/* Result Values Table */}
                                        {exam.results.values && exam.results.values.length > 0 && (
                                            <div className="overflow-x-auto mb-4">
                                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Parâmetro</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Valor</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unidade</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ref. Normal</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {exam.results.values.map((value, valueIdx) => (
                                                            <tr key={valueIdx} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{value.parameter}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{value.value}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">{value.unit}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">{value.referenceRange}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getAbnormalFlagColor(value.flag)}`}>
                                                                        {value.flag?.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {/* Interpretation */}
                                        {exam.results.interpretation && (
                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                                <p className="text-sm font-semibold text-blue-900 mb-1">Interpretação:</p>
                                                <p className="text-sm text-blue-800">{exam.results.interpretation}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LaboratoryResultsPage;
