import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, Mail, Heart, Eye, EyeOff, Activity, PlusSquare } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await login(email, password);
            toast.success('Login successful!');

            // Redirect based on role and clinic selection
            if (response.data.role === 'admin' || response.data.roleType === 'owner' || response.data.roleType === 'manager') {
                navigate('/clinic-selection');
            } else {
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-[420px] w-full mx-4 z-10 animate-scale-in">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-[1.25rem] shadow-xl shadow-primary-500/30 mb-4 rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Heart className="w-8 h-8 text-white fill-current" />
                        </div>
                        <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">Clinica<span className="text-primary-600">Digital</span></h1>
                        <p className="text-slate-500 mt-1 font-bold tracking-wide uppercase text-[9px]">Sistema de gestão de clínicas</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-1">
                                e-mail
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all duration-200 font-semibold text-sm"
                                    placeholder="admin@clinica.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                                    password
                                </label>
                                <a href="#" className="text-[9px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-wider transition-colors">Esqueceu?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-12 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all duration-200 font-semibold text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-premium py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-3 text-base">
                                    Fazer login
                                    <Activity className="w-5 h-5 group-hover:animate-pulse fill-current" />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/register" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors font-black uppercase text-[10px] tracking-[0.1em] group/register">
                            <PlusSquare className="w-4 h-4 text-primary-600 group-hover/register:scale-110 transition-transform" />
                            Novo cadastro
                        </a>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">Credenciais do Sistema</p>
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-primary-700">admin@clinica.com</span>
                            <span className="h-3 w-px bg-slate-200"></span>
                            <span className="text-[10px] font-bold text-primary-700">admin123</span>
                        </div>
                    </div>
                </div>

                <p className="mt-6 text-center text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">
                    Desenvolvido por Nhiquela Servicos e Consultoria, LDA
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
