import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LogOut, Menu, Home, Users, Calendar,
    DollarSign, FileText, X, FlaskConical, UserCheck
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import NotificationBell from '../components/NotificationBell';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const DashboardLayout = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
    };

    const navigation = [
        { name: t('nav.dashboard'), href: '/', icon: Home },
        { name: t('nav.patients'), href: '/patients', icon: Users },
        { name: t('nav.doctors'), href: '/doctors', icon: UserCheck },
        { name: t('nav.appointments'), href: '/appointments', icon: Calendar },
        { name: t('nav.labResults') || t('nav.exams'), href: '/lab-results', icon: FlaskConical },
        { name: t('nav.billing'), href: '/billing', icon: DollarSign },
        { name: t('nav.reports'), href: '/reports', icon: FileText },
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } `}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-primary-600">{t('nav.systemName')}</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="px-4 py-6 space-y-1">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.href)
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    } `}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            >
                                <Menu className="h-6 w-6" />
                            </button>

                            <div className="flex items-center space-x-4 ml-auto">
                                <LanguageSwitcher />
                                <NotificationBell />
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.profile?.firstName} {user?.profile?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                    title={t('nav.logout')}
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
