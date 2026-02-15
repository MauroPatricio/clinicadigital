import { useState, useEffect } from 'react';
import {
    Activity, Users, DollarSign, Calendar,
    TrendingUp, Award, Clock
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend
} from 'recharts';
import api from '../../services/api';

const DoctorPerformancePage = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('all');
    const [period, setPeriod] = useState('month');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
        // Here we would fetch performance stats
        setLoading(false);
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors');
            setDoctors(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    // Mock Data
    const mockKPIs = {
        patientsSeen: 145,
        revenue: 254000,
        rating: 4.8,
        occupancy: 87
    };

    const mockChartData = [
        { name: 'Jan', consultations: 65, revenue: 120000 },
        { name: 'Feb', consultations: 59, revenue: 110000 },
        { name: 'Mar', consultations: 80, revenue: 150000 },
        { name: 'Apr', consultations: 81, revenue: 160000 },
        { name: 'May', consultations: 96, revenue: 190000 },
        { name: 'Jun', consultations: 115, revenue: 230000 },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Desempenho Médico</h1>
                    <p className="text-gray-600">Métricas de produtividade e qualidade de atendimento.</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="week">Esta Semana</option>
                        <option value="month">Este Mês</option>
                        <option value="quarter">Este Trimestre</option>
                        <option value="year">Este Ano</option>
                    </select>
                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white md:w-64"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                        <option value="all">Todos os Médicos</option>
                        {doctors.map(d => (
                            <option key={d._id} value={d._id}>
                                Dr. {d.user?.profile?.firstName} {d.user?.profile?.lastName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pacientes Atendidos</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{mockKPIs.patientsSeen}</p>
                            <span className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" /> +12% vs mês anterior
                            </span>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Receita Gerada</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(mockKPIs.revenue)}
                            </p>
                            <span className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" /> +8% vs mês anterior
                            </span>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-full">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Taxa de Ocupação</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{mockKPIs.occupancy}%</p>
                            <span className="text-xs text-gray-500 mt-1">
                                4h livres / dia (média)
                            </span>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avaliação Média</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{mockKPIs.rating}</p>
                            <span className="text-xs text-yellow-600 flex items-center mt-1">
                                <Award className="w-3 h-3 mr-1" /> Top 5% da clínica
                            </span>
                        </div>
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Consultas vs Receita</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" orientation="left" stroke="#6366f1" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="#22c55e" axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar yAxisId="left" dataKey="consultations" name="Consultas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="revenue" name="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Tendência de Atendimento</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="consultations" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorPerformancePage;
