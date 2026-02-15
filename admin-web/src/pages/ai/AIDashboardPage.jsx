import { useState } from 'react';
import {
    Brain, TrendingUp, Users, AlertTriangle,
    Zap, Calendar, Target, ArrowUpRight
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const AIDashboardPage = () => {
    // Mock Prediction Data
    const predictionData = [
        { month: 'Jan', real: 4000, previsto: 4100 },
        { month: 'Fev', real: 3000, previsto: 3200 },
        { month: 'Mar', real: 2000, previsto: 2400 },
        { month: 'Abr', real: 2780, previsto: 2600 },
        { month: 'Mai', real: 1890, previsto: 2100 },
        { month: 'Jun', real: 2390, previsto: 2500 },
        { month: 'Jul', real: 3490, previsto: 3600 },
        { month: 'Ago', real: null, previsto: 4200 }, // Future
        { month: 'Set', real: null, previsto: 4500 },
    ];

    const riskData = [
        { subject: 'Satisfação', A: 120, fullMark: 150 },
        { subject: 'Retenção', A: 98, fullMark: 150 },
        { subject: 'Pontualidade', A: 86, fullMark: 150 },
        { subject: 'Eficiência', A: 99, fullMark: 150 },
        { subject: 'Ocupação', A: 85, fullMark: 150 },
        { subject: 'Rentabilidade', A: 65, fullMark: 150 },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Brain className="w-8 h-8 text-purple-600" />
                        Inteligência Artificial (Antigravity AI)
                    </h1>
                    <p className="text-gray-600">Insights preditivos e otimização operacional autônoma.</p>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-100">
                    <Zap className="w-4 h-4" />
                    Motor Neural Ativo v2.4
                </div>
            </div>

            {/* AI Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Previsão de Demanda</h3>
                    <p className="text-purple-100 text-sm mb-4">Próxima semana</p>
                    <div className="text-3xl font-bold mb-2">+24%</div>
                    <p className="text-sm text-purple-100">Pico esperado: Terça-feira, 14:00</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Risco de Cancelamento</h3>
                            <div className="text-2xl font-bold text-gray-900 mt-2">12 Pacientes</div>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">15% acima da média histórica</p>
                    </div>
                    <button className="mt-4 text-sm text-indigo-600 font-medium hover:underline">
                        Verlista de risco e enviar lembretes
                    </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Otimização de Agenda</h3>
                            <div className="text-2xl font-bold text-gray-900 mt-2">4.5h Recuperáveis</div>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                        O algoritmo sugere mover 3 agendamentos para preencher lacunas na manhã de Quarta-feira.
                    </p>
                    <button className="mt-4 w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                        Aplicar Sugestões
                    </button>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Projeção de Atendimentos</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={predictionData}>
                                <defs>
                                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="real" stroke="#4f46e5" fillOpacity={1} fill="url(#colorReal)" name="Realizado" />
                                <Area type="monotone" dataKey="previsto" stroke="#9333ea" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPrev)" name="Previsão AI" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Radar de Saúde Operacional</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis />
                                <Radar name="Performance" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recommendations List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sugestões Estratégicas</h3>
                <div className="space-y-4">
                    {[
                        { title: 'Aumentar disponibilidade de Cardiologia', desc: 'Alta demanda prevista para próximas 2 semanas (+15%). Considere abrir agenda extra.', effect: 'Lucro Est. +12,000 MZN', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
                        { title: 'Campanha de Retargeting', desc: '38 pacientes não retornaram para check-up anual. Iniciar campanha automática?', effect: 'Retenção +5%', icon: Target, color: 'text-blue-600 bg-blue-50' },
                        { title: 'Otimização de Estoque', desc: 'Excesso de "Paracetamol 500mg" detectado baseada na saída média. Reduzir próxima compra.', effect: 'Redução Custo -5,400 MZN', icon: Zap, color: 'text-amber-600 bg-amber-50' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className={`p-2 rounded-lg ${item.color}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                            </div>
                            <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                {item.effect}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AIDashboardPage;
