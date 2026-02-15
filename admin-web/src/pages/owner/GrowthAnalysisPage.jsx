import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, MapPin, Target, ArrowUp, ArrowDown } from 'lucide-react';
import biService from '../../services/biService';
import { useClinic } from '../../context/ClinicContext';

const GrowthAnalysisPage = () => {
    const { selectedClinic } = useClinic();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [selectedClinic]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await biService.getGrowthAnalytics({
                clinicId: selectedClinic?.id,
            });
            setData(result);
        } catch (error) {
            console.error('Error loading growth data:', error);
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

    const GrowthIndicator = ({ value }) => {
        const isPositive = value >= 0;
        return (
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="font-bold">{Math.abs(value).toFixed(1)}%</span>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    Análise de Crescimento
                </h1>
                <p className="text-gray-600 mt-1">Tendências de crescimento e projeções futuras</p>
            </div>

            {/* Patient Growth */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Crescimento de Pacientes
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-gray-600 text-sm mb-1">Total de Pacientes</p>
                        <p className="text-3xl font-bold text-blue-600">{data?.patients?.total || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-gray-600 text-sm mb-1">Novos Pacientes</p>
                        <p className="text-3xl font-bold text-green-600">{data?.patients?.new || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-gray-600 text-sm mb-1">Pacientes Recorrentes</p>
                        <p className="text-3xl font-bold text-purple-600">{data?.patients?.returning || 0}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <p className="text-gray-600 text-sm mb-1">Taxa de Crescimento</p>
                        <div className="flex items-center gap-2">
                            <p className="text-3xl font-bold text-yellow-600">{data?.patients?.growthRate || 0}%</p>
                            <TrendingUp className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Growth */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    Crescimento de Receita
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-gray-600 text-sm mb-2">Período Atual</p>
                        <p className="text-4xl font-bold text-gray-800">
                            €{data?.revenue?.current?.toLocaleString() || 0}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm mb-2">Período Anterior</p>
                        <p className="text-4xl font-bold text-gray-500">
                            €{data?.revenue?.previous?.toLocaleString() || 0}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm mb-2">Previsão Próximo Período</p>
                        <p className="text-4xl font-bold text-blue-600">
                            €{data?.revenue?.forecast?.toLocaleString() || 0}
                        </p>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Taxa de Crescimento de Receita</span>
                        <GrowthIndicator value={data?.revenue?.growthRate || 0} />
                    </div>
                </div>
            </div>

            {/* Service Adoption */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-600" />
                    Adoção de Serviços
                </h2>

                <div className="space-y-4">
                    {data?.services?.map((service, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-800">{service.name}</span>
                                <GrowthIndicator value={service.growth} />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                                        style={{ width: `${service.adoption}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-600 w-12 text-right">
                                    {service.adoption}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-red-600" />
                    Distribuição Geográfica
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data?.geographic?.map((region, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800 text-lg">{region.region}</h3>
                                <MapPin className="w-5 h-5 text-red-500" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">Pacientes</span>
                                    <span className="font-bold text-gray-800">{region.patients}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 text-sm">Crescimento</span>
                                    <GrowthIndicator value={region.growth} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary & Recommendations */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-200 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo e Recomendações</h3>

                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <div className="bg-green-500 rounded-full p-1 mt-0.5">
                            <ArrowUp className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-gray-700">
                            <strong>Crescimento positivo</strong> em todas as métricas principais. Continue com as estratégias atuais.
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="bg-blue-500 rounded-full p-1 mt-0.5">
                            <Target className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-gray-700">
                            <strong>Telemedicina</strong> apresenta maior taxa de crescimento (45%). Considere expansão deste serviço.
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="bg-purple-500 rounded-full p-1 mt-0.5">
                            <Users className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-gray-700">
                            <strong>Região Norte</strong> mostra maior potencial de crescimento (18%). Invista em marketing local.
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default GrowthAnalysisPage;
