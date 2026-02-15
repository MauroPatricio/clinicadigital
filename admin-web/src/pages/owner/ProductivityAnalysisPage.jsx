import React, { useState, useEffect } from 'react';
import { Activity, Users, Clock, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import biService from '../../services/biService';
import { useClinic } from '../../context/ClinicContext';

const ProductivityAnalysisPage = () => {
    const { selectedClinic } = useClinic();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [selectedClinic]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await biService.getProductivityMetrics({
                clinicId: selectedClinic?.id,
            });
            setData(result);
        } catch (error) {
            console.error('Error loading productivity data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'text-red-600 bg-red-100 border-red-300';
            case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
            case 'low': return 'text-green-600 bg-green-100 border-green-300';
            default: return 'text-gray-600 bg-gray-100 border-gray-300';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Activity className="w-8 h-8 text-blue-600" />
                    Análise de Produtividade
                </h1>
                <p className="text-gray-600 mt-1">Métricas de eficiência e utilização de recursos</p>
            </div>

            {/* Staff Metrics */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Equipa
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-gray-600 text-sm">Total de Funcionários</p>
                        <p className="text-3xl font-bold text-blue-600">{data?.staff?.totalStaff || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-gray-600 text-sm">Ativos Hoje</p>
                        <p className="text-3xl font-bold text-green-600">{data?.staff?.activeToday || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-gray-600 text-sm">Produtividade Média</p>
                        <p className="text-3xl font-bold text-purple-600">{data?.staff?.avgProductivity || 0}%</p>
                    </div>
                </div>
            </div>

            {/* Room Utilization */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Utilização de Salas</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-gray-600 text-sm mb-1">Total de Salas</p>
                        <p className="text-2xl font-bold text-gray-800">{data?.rooms?.total || 0}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm mb-1">Taxa de Utilização</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all"
                                    style={{ width: `${data?.rooms?.utilizationRate || 0}%` }}
                                ></div>
                            </div>
                            <span className="text-xl font-bold text-blue-600">{data?.rooms?.utilizationRate || 0}%</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm mb-1">Tempo Médio de Rotação</p>
                        <p className="text-2xl font-bold text-gray-800 flex items-center gap-1">
                            <Clock className="w-5 h-5 text-gray-400" />
                            {data?.rooms?.avgTurnaroundTime || 0} min
                        </p>
                    </div>
                </div>
            </div>

            {/* Appointment Efficiency */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Eficiência de Consultas</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                        <p className="text-gray-600 text-sm mb-1">Agendadas</p>
                        <p className="text-3xl font-bold text-blue-600">{data?.appointments?.scheduled || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600 text-sm mb-1">Completadas</p>
                        <p className="text-3xl font-bold text-green-600">{data?.appointments?.completed || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600 text-sm mb-1">Canceladas</p>
                        <p className="text-3xl font-bold text-yellow-600">{data?.appointments?.cancelled || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600 text-sm mb-1">Não Compareceram</p>
                        <p className="text-3xl font-bold text-red-600">{data?.appointments?.noShow || 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Tempo Médio de Espera
                        </p>
                        <p className="text-2xl font-bold text-gray-800">{data?.appointments?.avgWaitTime || 0} minutos</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Duração Média de Consulta
                        </p>
                        <p className="text-2xl font-bold text-gray-800">{data?.appointments?.avgConsultationTime || 0} minutos</p>
                    </div>
                </div>
            </div>

            {/* Bottlenecks */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    Pontos de Estrangulamento Identificados
                </h2>

                {data?.bottlenecks && data.bottlenecks.length > 0 ? (
                    <div className="space-y-3">
                        {data.bottlenecks.map((bottleneck, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-4 rounded-lg border ${getSeverityColor(bottleneck.severity)}`}
                            >
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5" />
                                    <div>
                                        <p className="font-semibold">{bottleneck.area}</p>
                                        <p className="text-sm opacity-80">{bottleneck.impact}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-white bg-opacity-50">
                                    {bottleneck.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p>Nenhum ponto de estrangulamento identificado</p>
                    </div>
                )}
            </div>

            {/* Completion Rate Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Taxa de Conclusão</h2>

                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-end pr-2"
                                style={{
                                    width: `${((data?.appointments?.completed || 0) /
                                            (data?.appointments?.scheduled || 1)) *
                                        100
                                        }%`,
                                }}
                            >
                                <span className="text-white font-bold text-sm">
                                    {Math.round(
                                        ((data?.appointments?.completed || 0) /
                                            (data?.appointments?.scheduled || 1)) *
                                        100
                                    )}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
            </div>
        </div>
    );
};

export default ProductivityAnalysisPage;
