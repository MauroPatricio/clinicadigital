import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Star, Clock, Users, DollarSign } from 'lucide-react';
import biService from '../../services/biService';
import { useClinic } from '../../context/ClinicContext';

const DoctorPerformanceBI = () => {
    const { selectedClinic } = useClinic();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('month');

    useEffect(() => {
        loadData();
    }, [selectedClinic, dateRange]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await biService.getDoctorPerformance({
                clinicId: selectedClinic?.id,
                dateRange,
            });
            setData(result);
        } catch (error) {
            console.error('Error loading doctor performance:', error);
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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                        Performance dos Médicos
                    </h1>
                    <p className="text-gray-600 mt-1">Análise detalhada do desempenho individual</p>
                </div>

                {/* Date Range Filter */}
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="week">Última Semana</option>
                    <option value="month">Último Mês</option>
                    <option value="quarter">Último Trimestre</option>
                    <option value="year">Último Ano</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-gray-600 text-sm">Total Consultas</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.summary?.totalAppointments || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-gray-600 text-sm">Receita Total</p>
                    <p className="text-3xl font-bold text-gray-800">€{data?.summary?.totalRevenue?.toLocaleString() || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                    <Star className="w-8 h-8 text-yellow-600 mb-2" />
                    <p className="text-gray-600 text-sm">Avaliação Média</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.summary?.avgRating?.toFixed(1) || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-gray-600 text-sm">Satisfação Média</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.summary?.avgSatisfaction || 0}%</p>
                </div>
            </div>

            {/* Doctors Performance Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Desempenho por Médico</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Médico
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Especialidade
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Consultas
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Receita
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Avaliação
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Satisfação
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tempo Médio
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data?.doctors?.map((doctor) => (
                                <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{doctor.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            {doctor.specialty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-900 font-semibold">
                                        {doctor.appointments}
                                    </td>
                                    <td className="px-6 py-4 text-center text-green-600 font-semibold">
                                        €{doctor.revenue?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-semibold">{doctor.rating.toFixed(1)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-purple-600 h-2 rounded-full"
                                                    style={{ width: `${doctor.patientSatisfaction}%` }}
                                                ></div>
                                            </div>
                                            <span className="ml-2 text-sm font-medium">{doctor.patientSatisfaction}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-700">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {doctor.avgConsultationTime} min
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Download Report Button */}
            <div className="flex justify-end">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
                    Exportar Relatório
                </button>
            </div>
        </div>
    );
};

export default DoctorPerformanceBI;
