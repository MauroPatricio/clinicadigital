import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, ArrowRight, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';
import toast from 'react-hot-toast';

const ClinicSelectionPage = () => {
    const { user, logout } = useAuth();
    const { availableClinics, switchClinic, loading: clinicsLoading, loadClinics } = useClinic();
    const navigate = useNavigate();

    // Refresh clinics list on mount
    useEffect(() => {
        loadClinics();
    }, []);

    useEffect(() => {
        // If user is not an owner/admin, redirect to home
        if (user && user.roleType !== 'owner' && user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSelectClinic = (clinic) => {
        switchClinic(clinic);
        toast.success(`Bem-vindo à ${clinic.name}`);
        navigate('/dashboard');
    };

    const handleCreateClinic = () => {
        navigate('/owner/units/new');
    };

    if (clinicsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-5xl mx-auto z-10 relative">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white font-display tracking-tight">
                            Olá, <span className="text-primary-500">{user?.profile?.firstName}</span>
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">Selecione uma clínica ou laboratório para gerenciar</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-all text-sm font-bold"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableClinics.map((clinic) => (
                        <button
                            key={clinic._id}
                            onClick={() => handleSelectClinic(clinic)}
                            className="group bg-white/5 backdrop-blur-xl border-2 border-white/10 p-8 rounded-[2.5rem] text-left hover:border-primary-500/50 hover:bg-white/10 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-6 h-6 text-primary-500" />
                            </div>

                            <div className="bg-gradient-to-br from-primary-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2 font-display">{clinic.name}</h3>
                            <p className="text-slate-400 text-sm font-medium line-clamp-1">
                                {clinic.type === 'laboratory' ? 'Laboratório' : 'Clínica'} • {clinic.address?.city}
                            </p>

                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800"></div>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    {clinic.stats?.totalStaff || 0} Staff Members
                                </span>
                            </div>
                        </button>
                    ))}

                    <button
                        onClick={handleCreateClinic}
                        className="group border-2 border-dashed border-white/20 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-primary-500/50 hover:bg-white/5 transition-all duration-500 min-h-[280px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary-500 transition-colors duration-500">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black text-white font-display">Adicionar Unidade</h3>
                            <p className="text-slate-500 text-sm font-semibold mt-1">Clínica ou Laboratório</p>
                        </div>
                    </button>
                </div>

                {availableClinics.length > 0 && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-black uppercase text-xs tracking-[0.2em]"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Ir para o Dashboard Global
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClinicSelectionPage;
