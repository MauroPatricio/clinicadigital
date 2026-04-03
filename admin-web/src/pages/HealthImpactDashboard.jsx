import { useState, useEffect } from 'react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { 
    Activity, Users, Clipboard, Package, AlertCircle, 
    TrendingUp, ShieldCheck, Zap 
} from 'lucide-react';
import { api } from '../services/apiService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const HealthImpactDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/analytics/innovation-stats');
                setStats(response.data.data);
            } catch (error) {
                console.error('Error fetching innovation stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <Zap className="w-12 h-12 text-indigo-600 animate-pulse" />
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Innovation Index */}
            <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Painel de Impacto Digital</h1>
                        <p className="text-indigo-100 font-medium max-w-xl">
                            Visualização em tempo real dos indicadores de inovação em saúde na Clínica Digital.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center min-w-[200px]">
                        <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1">Innovation Index</p>
                        <div className="text-5xl font-black tracking-tighter">{stats?.innovationScore}%</div>
                        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-green-300">
                            <ShieldCheck className="w-3 h-3" /> SISTEMA CERTIFICADO
                        </div>
                    </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Crescimento Mensal', val: '+24%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Stock Crítico', val: stats?.stock?.lowCount || 0, icon: Package, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Pacientes Ativos', val: '1,280', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Eficiência Triagem', val: '98.2%', icon: Clipboard, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-4 ${item.bg} ${item.color} rounded-xl`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">{item.label}</p>
                            <p className="text-xl font-black text-gray-900 leading-tight">{item.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Epidemiology Breakdown */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Tendências Epidemiológicas</h3>
                            <p className="text-xs text-gray-500 font-medium">Top 5 diagnósticos mais comuns este mês</p>
                        </div>
                        <Activity className="text-indigo-600 w-5 h-5" />
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={stats?.epidemiology || []} 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={8} 
                                    dataKey="value"
                                >
                                    {(stats?.epidemiology || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Triage Wait Times */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Eficiência por Urgência</h3>
                            <p className="text-xs text-gray-500 font-medium">Tempo médio de espera (minutos) por cor de triagem</p>
                        </div>
                        <Zap className="text-yellow-600 w-5 h-5" />
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.triage || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="wait" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Critical Stock Alert Dashboard */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Monitoria de Stock Crítico</h3>
                        <p className="text-xs text-gray-500 font-medium">Alertas de rutura previsível nas próximas 48h</p>
                    </div>
                    <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {stats?.stock?.lowCount} ALERTAS ATIVOS
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 uppercase text-[10px] font-black text-gray-400 tracking-widest">
                            <tr>
                                <th className="px-8 py-4 text-left">Medicamento / Item</th>
                                <th className="px-8 py-4 text-left">Quantidade Atual</th>
                                <th className="px-8 py-4 text-left">Mínimo Recomendado</th>
                                <th className="px-8 py-4 text-left">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats?.stock?.lowItems?.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-4 font-bold text-gray-900">{item.name}</td>
                                    <td className="px-8 py-4 text-sm">{item.quantity} {item.unit}</td>
                                    <td className="px-8 py-4 text-sm text-gray-400">{item.minQuantity} {item.unit}</td>
                                    <td className="px-8 py-4">
                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Crítico</span>
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.stock?.lowItems || stats?.stock?.lowItems.length === 0) && (
                                <tr>
                                    <td colSpan="4" className="px-8 py-10 text-center text-gray-400 font-medium">
                                        Nenhum item em estado crítico no momento.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HealthImpactDashboard;
