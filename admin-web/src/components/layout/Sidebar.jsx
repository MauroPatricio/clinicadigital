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
    MessageSquare,
    UserCog,
    FlaskConical,
    Sparkles,
    FileHeart,
    CalendarClock,
    Video,
    Package,
    Brain,
    ClipboardList,
    Shield,
    TrendingUp,
    Bell,
    Pill,
    Wallet,
    PieChart,
    ScrollText,
    Building,
    Megaphone,
    Lock,
    UserPlus,
    Banknote,
    History,
    AlertCircle
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

    // Owner Menu - Reorganized per User Request
    const ownerItems = [
        {
            name: 'Dashboard',
            icon: LayoutDashboard,
            path: '/owner/dashboard'
        },
        {
            name: 'Utilizadores',
            icon: Users,
            path: '/owner/users',
            submenu: [
                { name: 'Gestão de Utilizadores', path: '/owner/users' },
                { name: 'Permissões', path: '/owner/permissions' }
            ]
        },
        {
            name: 'Médicos',
            icon: Stethoscope,
            path: '/owner/doctors',
            submenu: [
                { name: 'Lista de Médicos', path: '/owner/doctors' },
                { name: 'Escalas', path: '/owner/doctors/schedules' },
                { name: 'Desempenho', path: '/owner/doctors/performance' },
                { name: 'Comissões', path: '/owner/doctors/commissions' }
            ]
        },
        {
            name: 'Pacientes',
            icon: FileHeart,
            path: '/owner/patients',
            submenu: [
                { name: 'Lista de Pacientes', path: '/owner/patients' },
                { name: 'Histórico', path: '/owner/patients/clinical' },
                { name: 'Histórico Financeiro', path: '/owner/patients/financial' }
            ]
        },
        {
            name: 'Agendamentos',
            icon: Calendar,
            path: '/owner/appointments',
            submenu: [
                { name: 'Agenda', path: '/owner/appointments' },
                { name: 'Fila', path: '/owner/queue' },
                { name: 'Confirmações', path: '/owner/confirmations' }
            ]
        },
        {
            name: 'Financeiro',
            icon: DollarSign, // Or Wallet
            path: '/owner/finance',
            submenu: [
                { name: 'Dashboard', path: '/owner/finance/dashboard' },
                { name: 'Faturas', path: '/owner/finance/invoices' },
                { name: 'Receitas', path: '/owner/finance/revenue' },
                { name: 'Despesas', path: '/owner/finance/expenses' },
                { name: 'Pagamentos Recorrentes', path: '/owner/finance/recurring' },
                { name: 'Projeções', path: '/owner/finance/projections' },
                { name: 'Comissões', path: '/owner/finance/commissions' }
            ]
        },
        {
            name: 'Laboratório',
            icon: FlaskConical,
            path: '/owner/laboratory',
            submenu: [
                { name: 'Solicitações', path: '/owner/laboratory/requests' },
                { name: 'Resultados', path: '/owner/laboratory/results' },
                { name: 'Histórico', path: '/owner/laboratory/history' }
            ]
        },
        {
            name: 'Farmácia',
            icon: Pill, // Represents Farmácia well
            path: '/owner/pharmacy',
            submenu: [
                { name: 'Vendas', path: '/owner/pharmacy/sales' },
                { name: 'Estoque', path: '/owner/pharmacy/stock' },
                { name: 'Fornecedores', path: '/owner/pharmacy/suppliers' }
            ]
        },
        {
            name: 'Stock',
            icon: Package,
            path: '/owner/stock',
            submenu: [
                { name: 'Inventário', path: '/owner/stock/inventory' },
                { name: 'Movimentações', path: '/owner/stock/movements' },
                { name: 'Alertas', path: '/owner/stock/alerts' }
            ]
        },
        {
            name: 'Relatórios',
            icon: BarChart3,
            path: '/owner/reports',
            submenu: [
                { name: 'Geral', path: '/owner/reports' },
                { name: 'Impacto Digital', path: '/owner/bi/impact' }
            ]
        },
        {
            name: 'Convênios',
            icon: ScrollText,
            path: '/owner/insurance',
            submenu: [
                { name: 'Seguradoras', path: '/owner/finance/insurance' }, // Pointing to implemented page
                { name: 'Faturas', path: '/owner/insurance/invoices' }
            ]
        },
        {
            name: 'Unidades',
            icon: Building2,
            path: '/owner/multiclinic',
            submenu: [
                { name: 'Visão Geral', path: '/owner/multiclinic/overview' },
                { name: 'Comparação', path: '/owner/multiclinic/compare' },
                { name: 'Transferências', path: '/owner/multiclinic/transfers' }
            ]
        },
        {
            name: 'Marketing',
            icon: Megaphone,
            path: '/owner/marketing',
            submenu: [
                { name: 'Campanhas', path: '/owner/marketing/campaigns' },
                { name: 'Fidelização', path: '/owner/marketing/loyalty' }
            ]
        },
        {
            name: 'Configurações',
            icon: Settings,
            path: '/owner/settings',
            submenu: [
                { name: 'Geral', path: '/owner/settings' },
                { name: 'Integrações', path: '/owner/settings/integrations' },
                { name: 'Backup', path: '/owner/security/backup' }
            ]
        },
        {
            name: 'Auditoria',
            icon: Shield,
            path: '/owner/audit'
        }
    ];

    // Determine if current unit is a laboratory
    const isLaboratory = currentClinic?.type === 'laboratory';

    // Define menu items based on role
    const getMenuItems = () => {
        // Owner Menu - Uses the comprehensive list defined above
        if (isOwner()) return ownerItems;


        const managerItems = [
            {
                name: isLaboratory ? 'Painel Laboratorial' : 'Painel Clínico',
                icon: LayoutDashboard,
                path: '/manager/dashboard'
            },
            {
                name: '📋 Operações Diárias',
                isSection: true
            },
            {
                name: 'Gestão de Pacientes',
                icon: FileHeart,
                path: '/manager/patients',
                description: 'Cadastro, histórico e timeline',
                submenu: [
                    { name: 'Todos os Pacientes', path: '/manager/patients' },
                    { name: 'Alertas Ativos', path: '/manager/patient-alerts' },
                    { name: 'Prontuários', path: '/manager/medical-records' }
                ]
            },
            {
                name: 'Agenda Inteligente',
                icon: CalendarClock,
                path: '/manager/appointments',
                description: isLaboratory ? 'Exames e fila' : 'Consultas e fila',
                submenu: [
                    { name: 'Calendário', path: '/manager/appointments' },
                    { name: 'Fila de Atendimento', path: '/manager/queue' },
                    { name: 'Confirmações', path: '/manager/confirmations' }
                ]
            },
            {
                name: isLaboratory ? 'Técnicos' : 'Profissionais',
                icon: UserCog,
                path: '/manager/staff',
                description: 'Escalas e desempenho'
            },
            {
                name: isLaboratory ? 'Equipamentos' : 'Salas',
                icon: Building2,
                path: isLaboratory ? '/manager/equipment' : '/manager/rooms',
                description: isLaboratory ? 'Calibração e status' : 'Ocupação e gestão'
            },
            {
                name: '🎯 Funcionalidades Premium',
                isSection: true
            },
            {
                name: 'Telemedicina',
                icon: Video,
                path: '/manager/telemedicine',
                description: 'Consultas online',
                submenu: [
                    { name: 'Consultas Agendadas', path: '/manager/telemedicine' },
                    { name: 'Histórico', path: '/manager/telemedicine/history' },
                    { name: 'Prescrições Digitais', path: '/manager/prescriptions' }
                ]
            },
            {
                name: 'Estoque Médico',
                icon: Package,
                path: '/manager/stock',
                description: 'Medicamentos e materiais',
                submenu: [
                    { name: 'Inventário', path: '/manager/stock' },
                    { name: 'Alertas de Reposição', path: '/manager/stock/alerts' },
                    { name: 'Fornecedores', path: '/manager/suppliers' },
                    { name: 'Relatórios de Uso', path: '/manager/stock/usage' }
                ]
            },
            {
                name: 'Inteligência AI',
                icon: Brain,
                path: '/manager/ai-insights',
                description: 'Análises preditivas',
                badge: 'BETA'
            },
            {
                name: '💰 Gestão',
                isSection: true
            },
            {
                name: 'Financeiro',
                icon: DollarSign,
                path: '/manager/finance',
                description: 'Receitas e pagamentos'
            },
            {
                name: 'Relatórios',
                icon: FileText,
                path: '/manager/reports',
                description: 'Operacional e clínico',
                submenu: [
                    { name: 'Operacional', path: '/manager/reports' },
                    { name: 'Impacto Digital', path: '/owner/bi/impact' } // Direct link for demo
                ]
            },
            {
                name: 'Configurações',
                icon: Settings,
                path: '/manager/settings'
            }
        ];

        // Staff Menu - Personal View
        const staffItems = [
            { name: 'Meu Painel', icon: LayoutDashboard, path: '/staff/dashboard' },
            { name: 'Minha Agenda', icon: Calendar, path: '/staff/schedule' },
            { name: isLaboratory ? 'Meus Exames' : 'Meus Pacientes', icon: Stethoscope, path: '/staff/patients' },
            { name: 'Mensagens', icon: MessageSquare, path: '/staff/messages' },
            { name: 'Meu Desempenho', icon: Activity, path: '/staff/performance' }
        ];

        if (isManager()) return managerItems;
        if (isStaff()) return staffItems;
        return [];
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
                fixed top-0 left-0 z-50 h-screen w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static
                flex flex-col shadow-2xl border-r border-slate-800/50
            `}>
                {/* Header - Antigravity Branding */}
                <div className="p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-500 animate-pulse-glow"></div>
                                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-primary-500/30 group-hover:scale-110 transition-transform duration-500">
                                    <Activity className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black font-display tracking-tight bg-gradient-to-r from-white via-primary-200 to-indigo-200 bg-clip-text text-transparent leading-tight">
                                    Clinica Digital
                                </h1>
                                <p className="text-[10px] font-black mt-1">Gestão de Clínicas</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Info - Premium Card */}
                <div className="px-6 py-4">
                    <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800/50 border border-slate-700/50 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                                <div className="relative w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-primary-600 text-lg shadow-lg">
                                    {user?.profile?.firstName?.charAt(0) || 'U'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-sm truncate text-white tracking-tight">
                                    {user?.profile?.firstName} {user?.profile?.lastName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{getRoleDisplayName()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Unit Badge (for Managers) */}
                {isManager() && currentClinic && (
                    <div className="px-6 py-2">
                        <div className="px-4 py-2 rounded-xl bg-primary-950/30 border border-primary-800/30">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isLaboratory ? 'bg-cyan-400' : 'bg-emerald-400'} animate-pulse`}></div>
                                <span className="text-xs font-bold text-slate-300 truncate">{currentClinic.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                                {isLaboratory ? '🧪 Laboratório' : '🏥 Clínica'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {menuItems.map((item, idx) => (
                        <div key={idx}>
                            {/* Section Header */}
                            {item.isSection ? (
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3 mt-6 px-2">
                                    {item.name}
                                </p>
                            ) : item.submenu ? (
                                // Submenu Item
                                <div className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 text-left ${expandedMenus[item.name] ? 'bg-white/5 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-5 h-5 ${expandedMenus[item.name] ? 'text-primary-400' : 'text-slate-500 group-hover:text-primary-400'} transition-colors`} />
                                            <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedMenus[item.name] ? 'rotate-180 text-primary-400' : 'text-slate-700'}`} />
                                    </button>
                                    {expandedMenus[item.name] && (
                                        <div className="ml-10 space-y-2 border-l-2 border-slate-800/80 pl-4 py-2 mt-1 animate-slide-up">
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
                                // Regular Nav Item
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                                        ${isActive
                                            ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-xl shadow-primary-600/20'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                        }
                                    `}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0 z-10" />
                                    <div className="flex-1 z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm tracking-tight">{item.name}</span>
                                            {item.badge && (
                                                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[9px] font-black uppercase tracking-wider">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        {item.description && (
                                            <p className="text-[10px] text-slate-500 mt-0.5">{item.description}</p>
                                        )}
                                    </div>
                                </NavLink>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/20 hover:-translate-y-0.5 transition-all duration-300  group"
                    >
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="font-semibold text-sm">Terminar Sessão</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
