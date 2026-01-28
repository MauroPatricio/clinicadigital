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
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statsCards.map((stat, index) => (
                    <div key={index} className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className={`text-sm mt-1 ${stat.trend === 'up' ? 'text-green-600' :
                                        stat.trend === 'down' ? 'text-red-600' :
                                            'text-gray-600'
                                    }`}>
                                    {stat.change}
                                </p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-full`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                            { name: 'Jan', revenue: 45000 },
                            { name: 'Feb', revenue: 52000 },
                            { name: 'Mar', revenue: 48000 },
                            { name: 'Apr', revenue: 61000 },
                            { name: 'May', revenue: 55000 },
                            { name: 'Jun', revenue: 67000 },
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#0ea5e9" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {[
                            { type: 'success', text: 'New patient registered', time: '2 min ago' },
                            { type: 'info', text: 'Appointment confirmed', time: '15 min ago' },
                            { type: 'warning', text: 'Payment pending', time: '1 hour ago' },
                            { type: 'success', text: 'Lab results uploaded', time: '2 hours ago' },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <div className={`mt-1 ${activity.type === 'success' ? 'text-green-500' :
                                        activity.type === 'warning' ? 'text-yellow-500' :
                                            'text-blue-500'
                                    }`}>
                                    {activity.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                                        activity.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                                            <Activity className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/patients" className="card hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                        <Users className="w-8 h-8 text-primary-600" />
                        <div>
                            <h3 className="font-semibold text-gray-900">Manage Patients</h3>
                            <p className="text-sm text-gray-500">View and edit patient records</p>
                        </div>
                    </div>
                </Link>

                <Link to="/appointments" className="card hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                        <Calendar className="w-8 h-8 text-primary-600" />
                        <div>
                            <h3 className="font-semibold text-gray-900">Appointments</h3>
                            <p className="text-sm text-gray-500">Schedule and manage appointments</p>
                        </div>
                    </div>
                </Link>

                <Link to="/billing" className="card hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                        <DollarSign className="w-8 h-8 text-primary-600" />
                        <div>
                            <h3 className="font-semibold text-gray-900">Billing</h3>
                            <p className="text-sm text-gray-500">Invoices and financial reports</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default DashboardPage;
