import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationBell from '../notifications/NotificationBell';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';

const MainLayout = () => {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, getRoleDisplayName } = useAuth();
    const { currentClinic } = useClinic();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return t('nav.dashboard');
        if (path.includes('/clinics')) return t('nav.myClinics');
        if (path.includes('/staff')) return t('nav.staff');
        if (path.includes('/patients')) return t('nav.patients');
        if (path.includes('/appointments')) return t('nav.appointments');
        if (path.includes('/reports')) return t('nav.reports');
        if (path.includes('/schedule')) return t('nav.mySchedule');
        return t('common.appName', 'Clinic Digital');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header (Desktop & Mobile) */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{getPageTitle()}</h2>
                                {currentClinic && (
                                    <p className="text-sm text-gray-500 hidden md:block">
                                        {currentClinic.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {user?.profile?.firstName} {user?.profile?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                    {user?.profile?.firstName?.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
