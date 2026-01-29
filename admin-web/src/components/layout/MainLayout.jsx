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
        <div className="flex h-screen bg-[#f8fafc]">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header (Premium Glass) */}
                <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight hidden md:block uppercase text-sm">
                                    {getPageTitle()}
                                </h2>
                                {currentClinic && (
                                    <p className="text-[11px] font-semibold text-primary-600 uppercase tracking-widest hidden md:block">
                                        {currentClinic.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <NotificationBell />
                            </div>

                            <div className="hidden md:flex items-center gap-4 pl-6 border-l border-slate-200">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900 leading-tight">
                                        {user?.profile?.firstName} {user?.profile?.lastName}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{getRoleDisplayName()}</p>
                                </div>
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20 ring-2 ring-white">
                                    {user?.profile?.firstName?.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className="max-w-7xl mx-auto animate-slide-up">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
