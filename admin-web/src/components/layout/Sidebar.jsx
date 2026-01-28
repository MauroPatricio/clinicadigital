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
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static
                flex flex-col
            `}>
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">{t('nav.systemName')}</h1>
                                <p className="text-xs text-gray-400">{t('nav.systemSlogan')}</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 bg-gray-800/50 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-lg">
                            {user?.profile?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">
                                {user?.profile?.firstName} {user?.profile?.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{getRoleDisplayName()}</p>
                        </div>
                    </div>
                    {currentClinic && !isOwner() && (
                        <div className="mt-3 p-2 bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-400">{t('nav.clinicLabel')}</p>
                            <p className="text-sm font-medium truncate">{currentClinic.name}</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {menuItems.map((item, idx) => (
                        <div key={idx}>
                            {item.submenu ? (
                                <div>
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedMenus[item.name] ? 'rotate-180' : ''}`} />
                                    </button>
                                    {expandedMenus[item.name] && (
                                        <div className="ml-8 mt-1 space-y-1">
                                            {item.submenu.map((subItem, subIdx) => (
                                                <NavLink
                                                    key={subIdx}
                                                    to={subItem.path}
                                                    className={({ isActive }) => `
                                                        block px-4 py-2 rounded-lg transition-colors
                                                        ${isActive
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-300 hover:bg-gray-700/50'
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
                                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                        ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                            : 'text-gray-300 hover:bg-gray-700/50'
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </NavLink>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">{t('nav.logout')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
