import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Calendar, DollarSign, Activity,
    TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { dashboardService } from '../services/apiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await dashboardService.getStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const thisMonth = stats?.thisMonth || [];
    const paidThisMonth = thisMonth.find(s => s._id === 'paid');
    const pendingThisMonth = thisMonth.find(s => s._id === 'pending');

    const statsCards = [
        {
            title: 'Total Revenue (This Month)',
            value: `${paidThisMonth?.total?.toLocaleString() || 0} MT`,
            change: '+12.5%',
            icon: DollarSign,
            color: 'bg-green-500',
            trend: 'up'
        },
        {
            title: 'Pending Payments',
            value: `${pendingThisMonth?.total?.toLocaleString() || 0} MT`,
            change: `${pendingThisMonth?.count || 0} invoices`,
            icon: Clock,
            color: 'bg-yellow-500',
            trend: 'neutral'
        },
        {
            title: 'Total Patients',
            value: '1,234',
            change: '+8.2%',
            icon: Users,
            color: 'bg-blue-500',
            trend: 'up'
        },
        {
            title: 'Today\'s Appointments',
            value: '24',
            change: '6 completed',
            icon: Calendar,
            color: 'bg-purple-500',
            trend: 'up'
        },
    ];

    return (
        <div className="space-y-10 animate-fade-in p-4">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1 font-medium">Welcome back, {user?.profile?.firstName}. Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider backdrop-blur-sm">
                    <Clock className="w-4 h-4 text-primary-500" />
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-[1.5rem] p-6 border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-primary-100 transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className={`p-3 rounded-2xl ${stat.trend === 'up' ? 'bg-emerald-500' : stat.trend === 'down' ? 'bg-rose-500' : 'bg-primary-500'} shadow-lg shadow-black/5 text-white transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black font-display text-slate-900">{stat.value}</p>
                                        <div className={`flex items-center gap-0.5 text-[11px] font-black ${stat.trend === 'up' ? 'text-emerald-600' :
                                            stat.trend === 'down' ? 'text-rose-600' :
                                                'text-slate-600'
                                            }`}>
                                            {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : ''}
                                            {stat.change}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border-2 border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">Financial Health</h2>
                            <p className="text-sm text-slate-500 font-bold mt-1">Net revenue performance (Real-time)</p>
                        </div>
                        <select className="bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-xs font-black text-slate-600 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all cursor-pointer">
                            <option>Last 6 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Jan', revenue: 45000 },
                                { name: 'Feb', revenue: 52000 },
                                { name: 'Mar', revenue: 48000 },
                                { name: 'Apr', revenue: 61000 },
                                { name: 'May', revenue: 55000 },
                                { name: 'Jun', revenue: 67000 },
                            ]}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#4c1d95" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }}
                                    tickFormatter={(val) => `${val / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: '2px solid #f1f5f9',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                        padding: '12px',
                                        fontWeight: '800'
                                    }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="url(#barGradient)"
                                    radius={[8, 8, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-[2rem] p-8 border-2 border-slate-100 shadow-sm">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">System Feed</h2>
                        <p className="text-sm text-slate-500 font-bold mt-1">Live operational updates</p>
                    </div>
                    <div className="space-y-8">
                        {[
                            { type: 'success', text: 'New patient registered', time: '2 min ago', person: 'Sarah J.' },
                            { type: 'info', text: 'Appointment confirmed', time: '15 min ago', person: 'Dr. Mike' },
                            { type: 'warning', text: 'Verification pending', time: '1 hour ago', person: 'System' },
                            { type: 'success', text: 'Results uploaded', time: '2 hours ago', person: 'Lab A' },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-start gap-5 group cursor-default">
                                <div className={`mt-0.5 p-2 rounded-xl shrink-0 transition-all group-hover:scale-110 ${activity.type === 'success' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                    activity.type === 'warning' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' :
                                        'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                    }`}>
                                    {activity.type === 'success' ? <CheckCircle className="w-4.5 h-4.5" /> :
                                        activity.type === 'warning' ? <AlertCircle className="w-4.5 h-4.5" /> :
                                            <Activity className="w-4.5 h-4.5" />}
                                </div>
                                <div className="flex-1 min-w-0 border-b border-slate-50 pb-5 group-last:border-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className="text-sm font-black text-slate-900 truncate tracking-tight">{activity.text}</p>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{activity.time}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold">Log by <span className="text-primary-600 font-black">{activity.person}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 btn-secondary text-[11px] uppercase tracking-[0.25em]">
                        View Intelligence Hub
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                {[
                    { label: 'Patient Hub', desc: 'Secure medical records', icon: Users, path: '/patients', color: 'from-emerald-500 to-emerald-700' },
                    { label: 'Scheduler', desc: 'Sync & calendar management', icon: Calendar, path: '/appointments', color: 'from-primary-500 to-primary-700' },
                    { label: 'Finances', desc: 'Invoices & billings', icon: DollarSign, path: '/billing', color: 'from-amber-500 to-amber-700' },
                ].map((action, i) => (
                    <Link key={i} to={action.path} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 group active:scale-[0.98]">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className={`bg-gradient-to-br ${action.color} p-6 rounded-[2rem] shadow-xl shadow-black/10 text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                <action.icon className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black font-display text-slate-900 leading-tight">{action.label}</h3>
                                <p className="text-sm text-slate-500 font-bold mt-2">{action.desc}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DashboardPage;
