import { useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Activity, Users, HeartPulse, Brain } from 'lucide-react';

const ClinicalReportsPage = () => {
    // Mock Data
    const diagnosisData = [
        { name: 'Hipertensão', value: 400 },
        { name: 'Diabetes T2', value: 300 },
        { name: 'Infecções Resp.', value: 300 },
        { name: 'Outros', value: 200 },
    ];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const demographicData = [
        { name: '0-18', pacientes: 150 },
        { name: '19-35', pacientes: 400 },
        { name: '36-50', pacientes: 300 },
        { name: '50+', pacientes: 250 },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Relatórios Clínicos</h1>
                    <p className="text-gray-600">Panorama de saúde da população de pacientes.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-full">
                        <HeartPulse className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Casos Críticos</p>
                        <h3 className="text-xl font-bold">24</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Novos Pacientes</p>
                        <h3 className="text-xl font-bold">145</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Consultas Realizadas</p>
                        <h3 className="text-xl font-bold">1,204</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Saúde Mental</p>
                        <h3 className="text-xl font-bold">12%</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Diagnoses Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Diagnósticos Mais Comuns</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={diagnosisData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {diagnosisData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Demographics Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Demografia dos Pacientes (Idade)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={demographicData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={50} />
                                <Tooltip />
                                <Bar dataKey="pacientes" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Pacientes" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicalReportsPage;
