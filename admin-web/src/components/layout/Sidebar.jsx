import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Users,
    Calendar,
    FileText,
    Activity,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    BarChart3,
    Stethoscope,
    DollarSign,
    MessageSquare
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { t } = useTranslation();
    const { user, logout, isOwner, isManager, isStaff, getRoleDisplayName } = useAuth();
    const { currentClinic } = useClinic();
    const navigate = useNavigate();
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (menu) => {
        setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Define menu items based on role
    const getMenuItems = () => {
        const commonItems = [
            {
                name: t('nav.dashboard'),
                icon: LayoutDashboard,
                path: isOwner() ? '/owner/dashboard' : isManager() ? '/manager/dashboard' : '/staff/dashboard',
                roles: ['owner', 'manager', 'staff']
            }
        ];

        const ownerItems = [
            { name: t('nav.overview'), icon: BarChart3, path: '/owner/dashboard' },
            {
                name: t('nav.clinics'),
                icon: Building2,
                path: '/owner/clinics',
                submenu: [
                    { name: t('nav.allClinics'), path: '/owner/clinics' },
                    { name: t('nav.comparePerformance'), path: '/owner/clinics/compare' },
                    { name: t('nav.addClinic'), path: '/owner/clinics/new' }
                ]
            },
            { name: t('nav.organization'), icon: Settings, path: '/owner/organization' },
            { name: t('nav.subscription'), icon: DollarSign, path: '/owner/subscription' },
            { name: t('nav.reports'), icon: FileText, path: '/owner/reports' }
        ];

        const managerItems = [
            { name: t('nav.dashboard'), icon: LayoutDashboard, path: '/manager/dashboard' },
            { name: t('nav.employees'), icon: Users, path: '/manager/staff' },
            { name: t('nav.appointments'), icon: Calendar, path: '/manager/appointments' },
            { name: t('nav.patients'), icon: Stethoscope, path: '/manager/patients' },
            { name: t('nav.rooms'), icon: Building2, path: '/manager/rooms' },
            { name: t('nav.analytics'), icon: BarChart3, path: '/manager/analytics' },
            { name: t('nav.settings'), icon: Settings, path: '/manager/settings' }
        ];

        const staffItems = [
            { name: t('nav.dashboard'), icon: LayoutDashboard, path: '/staff/dashboard' },
            { name: t('nav.mySchedule'), icon: Calendar, path: '/staff/schedule' },
            { name: t('nav.patients'), icon: Stethoscope, path: '/staff/patients' },
            { name: t('nav.messages'), icon: MessageSquare, path: '/staff/messages' },
            { name: t('nav.myPerformance'), icon: Activity, path: '/staff/performance' }
        ];

        if (isOwner()) return ownerItems;
        if (isManager()) return managerItems;
        if (isStaff()) return staffItems;
        return commonItems;
    };

    const menuItems = getMenuItems();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-72 bg-slate-950 text-white
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static
                flex flex-col shadow-2xl
            `}>
                {/* Header */}
                <div className="p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-primary-500/30 group-hover:rotate-6 transition-transform duration-500">
                                <Activity className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black font-display tracking-tight text-white leading-tight">Clinic<span className="text-primary-400">Digital</span></h1>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mt-1">Intelligence Platform</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Info - Premium Card */}
                <div className="px-6 py-4">
                    <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                                <div className="relative w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-primary-600 text-lg shadow-lg">
                                    {user?.profile?.firstName?.charAt(0) || 'U'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-sm truncate text-white tracking-tight">
                                    {user?.profile?.firstName} {user?.profile?.lastName}
                                </p>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{getRoleDisplayName()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-3">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-6 px-2">{t('nav.menuHeading', 'Operations Control')}</p>
                    {menuItems.map((item, idx) => (
                        <div key={idx}>
                            {item.submenu ? (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 text-left ${expandedMenus[item.name] ? 'bg-white/5 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-5 h-5 ${expandedMenus[item.name] ? 'text-primary-400' : 'text-slate-500 group-hover:text-primary-400'}`} />
                                            <span className={`font-bold text-sm tracking-tight`}>{item.name}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedMenus[item.name] ? 'rotate-180 text-primary-400' : 'text-slate-700'}`} />
                                    </button>
                                    {expandedMenus[item.name] && (
                                        <div className="ml-10 space-y-2 border-l-2 border-slate-800/80 pl-4 py-2 mt-1">
                                            {item.submenu.map((subItem, subIdx) => (
                                                <NavLink
                                                    key={subIdx}
                                                    to={subItem.path}
                                                    className={({ isActive }) => `
                                                        block px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                                                        ${isActive
                                                            ? 'text-white bg-slate-800/50'
                                                            : 'text-slate-500 hover:text-slate-100 hover:translate-x-1'
                                                        }
                                                    `}
                                                >
                                                    {subItem.name}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                                        ${isActive
                                            ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-xl shadow-primary-600/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className={`font-black text-sm tracking-tight`}>{item.name}</span>
                                </NavLink>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/20 transition-all duration-300 group"
                    >
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="font-semibold text-sm">{t('nav.logout')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
