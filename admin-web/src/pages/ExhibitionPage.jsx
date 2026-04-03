import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Wifi, 
  MessageSquare, 
  FileText, 
  Pill, 
  Activity, 
  AlertCircle, 
  LayoutDashboard, 
  Monitor, 
  PlayCircle, 
  Microscope, 
  CloudOff,
  Globe,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Clock,
  Heart
} from 'lucide-react';

const ExhibitionPage = () => {
    const { t, i18n } = useTranslation();
    const [activeLang, setActiveLang] = useState(i18n.language.split('-')[0] || 'pt');

    const toggleLanguage = () => {
        const newLang = activeLang === 'pt' ? 'en' : 'pt';
        i18n.changeLanguage(newLang);
        setActiveLang(newLang);
    };

    const innovations = [
        {
            id: 1,
            icon: <Wifi className="w-8 h-8 text-blue-500" />,
            title: t('exhibition.solutions.telemedicine.title'),
            desc: t('exhibition.solutions.telemedicine.desc'),
            impact: t('exhibition.solutions.telemedicine.impact'),
            problem: t('exhibition.solutions.telemedicine.problem')
        },
        {
            id: 2,
            icon: <MessageSquare className="w-8 h-8 text-green-500" />,
            title: t('exhibition.solutions.whatsapp.title'),
            desc: t('exhibition.solutions.whatsapp.desc'),
            impact: t('exhibition.solutions.whatsapp.impact'),
            problem: t('exhibition.solutions.whatsapp.problem')
        },
        {
            id: 3,
            icon: <FileText className="w-8 h-8 text-purple-500" />,
            title: t('exhibition.solutions.ehr.title'),
            desc: t('exhibition.solutions.ehr.desc'),
            impact: t('exhibition.solutions.ehr.impact'),
            problem: t('exhibition.solutions.ehr.problem')
        },
        {
            id: 4,
            icon: <Pill className="w-8 h-8 text-orange-500" />,
            title: t('exhibition.solutions.pharmacy.title'),
            desc: t('exhibition.solutions.pharmacy.desc'),
            impact: t('exhibition.solutions.pharmacy.impact'),
            problem: t('exhibition.solutions.pharmacy.problem')
        },
        {
            id: 5,
            icon: <Activity className="w-8 h-8 text-red-500" />,
            title: t('exhibition.solutions.ai_assistant.title'),
            desc: t('exhibition.solutions.ai_assistant.desc'),
            impact: t('exhibition.solutions.ai_assistant.impact'),
            problem: t('exhibition.solutions.ai_assistant.problem')
        },
        {
            id: 6,
            icon: <AlertCircle className="w-8 h-8 text-yellow-500" />,
            title: t('exhibition.solutions.emergency.title'),
            desc: t('exhibition.solutions.emergency.desc'),
            impact: t('exhibition.solutions.emergency.impact'),
            problem: t('exhibition.solutions.emergency.problem')
        },
        {
            id: 7,
            icon: <LayoutDashboard className="w-8 h-8 text-indigo-500" />,
            title: t('exhibition.solutions.dashboard.title'),
            desc: t('exhibition.solutions.dashboard.desc'),
            impact: t('exhibition.solutions.dashboard.impact'),
            problem: t('exhibition.solutions.dashboard.problem')
        },
        {
            id: 8,
            icon: <Monitor className="w-8 h-8 text-cyan-500" />,
            title: t('exhibition.solutions.remote_monitoring.title'),
            desc: t('exhibition.solutions.remote_monitoring.desc'),
            impact: t('exhibition.solutions.remote_monitoring.impact'),
            problem: t('exhibition.solutions.remote_monitoring.problem')
        },
        {
            id: 9,
            icon: <PlayCircle className="w-8 h-8 text-pink-500" />,
            title: t('exhibition.solutions.hms.title'),
            desc: t('exhibition.solutions.hms.desc'),
            impact: t('exhibition.solutions.hms.impact'),
            problem: t('exhibition.solutions.hms.problem')
        },
        {
            id: 10,
            icon: <Microscope className="w-8 h-8 text-emerald-500" />,
            title: t('exhibition.solutions.ai_diagnosis.title'),
            desc: t('exhibition.solutions.ai_diagnosis.desc'),
            impact: t('exhibition.solutions.ai_diagnosis.impact'),
            problem: t('exhibition.solutions.ai_diagnosis.problem')
        },
        {
            id: 11,
            icon: <CloudOff className="w-8 h-8 text-slate-500" />,
            title: t('exhibition.solutions.offline.title'),
            desc: t('exhibition.solutions.offline.desc'),
            impact: t('exhibition.solutions.offline.impact'),
            problem: t('exhibition.solutions.offline.problem')
        }
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Header / Navbar */}
            <header className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Heart className="w-6 h-6 text-white fill-white/20" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">{t('nav.systemName')}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleLanguage}
                            className="px-3 py-1 text-sm border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <Globe className="w-4 h-4" />
                            {activeLang.toUpperCase()}
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95">
                            {t('exhibition.requestDemo')}
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative py-24 lg:py-32 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-visible pointer-events-none opacity-20">
                        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500 rounded-full blur-[120px]" />
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                {t('exhibition.badge')}
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-8">
                                {t('exhibition.title').split(' ').map((word, i) => i > 3 ? <span key={i} className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">{word} </span> : word + ' ')}
                            </h1>
                            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mb-12">
                                {t('exhibition.subtitle')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="#grid" className="bg-white text-slate-950 px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all hover:scale-105">
                                    {t('exhibition.explore')} <ChevronRight className="w-5 h-5" />
                                </a>
                                <a href="#impact" className="border border-slate-700 bg-slate-900/50 backdrop-blur px-8 py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                                    {t('exhibition.viewImpact')}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Innovation Grid */}
                <section id="grid" className="py-24 bg-[#0a0f1d]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-20">
                            <h2 className="text-3xl font-bold text-white mb-4">{t('exhibition.innovationsTitle')}</h2>
                            <div className="h-1 w-20 bg-blue-500 rounded-full" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {innovations.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="group relative bg-slate-900/50 border border-slate-800 p-8 rounded-3xl transition-all duration-500 hover:border-blue-500/50 hover:bg-slate-900 hover:-translate-y-2"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="mb-6 p-4 rounded-2xl bg-[#0f172a] inline-block border border-slate-800 group-hover:border-blue-500/30 transition-colors">
                                        {item.icon}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-6">{item.desc}</p>
                                    
                                    <div className="pt-6 border-t border-slate-800/50 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-1 rounded-full bg-red-400/10">
                                                <TrendingDown className="w-3 h-3 text-red-500" />
                                            </div>
                                            <div className="text-xs">
                                                <span className="text-slate-500 block mb-1">{t('exhibition.problemLabel')}</span>
                                                <span className="text-slate-300 italic">{item.problem}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-1 rounded-full bg-green-400/10">
                                                <TrendingUp className="w-3 h-3 text-green-500" />
                                            </div>
                                            <div className="text-xs">
                                                <span className="text-slate-500 block mb-1">{t('exhibition.impactLabel')}</span>
                                                <span className="text-green-400 font-semibold">{item.impact}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Differential Area (Highlight) */}
                <section className="py-24 relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 rounded-[3rem] p-8 lg:p-20 relative overflow-hidden shadow-2xl shadow-blue-500/20">
                            {/* Decorative bubbles */}
                            <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-[-20%] right-[-5%] w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />

                            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <div className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6">
                                        {t('exhibition.integratedSystem.badge')}
                                    </div>
                                    <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-8 leading-tight">
                                        {t('exhibition.integratedSystem.title')}
                                    </h2>
                                    <p className="text-white/80 text-lg leading-relaxed mb-10">
                                        {t('exhibition.integratedSystem.desc')}
                                    </p>
                                    <ul className="grid grid-cols-2 gap-4">
                                        {['Telemedicina', 'Prontuário', 'Pagamentos Móveis', 'Gestão Hospitalar', 'IA Preditiva', 'Offline-First'].map((feat) => (
                                            <li key={feat} className="flex items-center gap-3 text-white font-medium">
                                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                </div>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="relative">
                                    <div className="aspect-[4/3] bg-slate-900/40 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl group cursor-pointer shadow-xl">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                                                <PlayCircle className="w-10 h-10 text-blue-600 ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-slate-900/90 to-transparent">
                                            <p className="text-white font-bold">{t('exhibition.integratedSystem.videoCta')}</p>
                                            <p className="text-white/60 text-sm">{t('exhibition.integratedSystem.videoSub')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Impact / Stats Section */}
                <section id="impact" className="py-24">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl font-extrabold text-white mb-6">{t('exhibition.impact.title')}</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                                {t('exhibition.impact.subtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: t('exhibition.impact.waitingTime'), value: "-45%", sub: t('exhibition.impact.waitingTimeSub'), icon: <Clock className="text-blue-400" /> },
                                { label: t('exhibition.impact.access'), value: "+10M", sub: t('exhibition.impact.accessSub'), icon: <Globe className="text-cyan-400" /> },
                                { label: t('exhibition.impact.errors'), value: "-30%", sub: t('exhibition.impact.errorsSub'), icon: <Activity className="text-emerald-400" /> },
                                { label: t('exhibition.impact.lives'), value: "85k", sub: t('exhibition.impact.livesSub'), icon: <Heart className="text-red-400" /> }
                            ].map((stat) => (
                                <div key={stat.label} className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl text-center hover:border-blue-500/30 transition-all">
                                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        {stat.icon}
                                    </div>
                                    <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                                    <div className="text-sm font-bold text-slate-300 mb-1">{stat.label}</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-widest">{stat.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 border-t border-slate-900">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col items-center text-center">
                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-10">{t('exhibition.cta.title')}</h2>
                            <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-2xl hover:shadow-blue-500/40 text-white px-10 py-5 rounded-2xl text-xl font-bold transition-all hover:scale-105 active:scale-95">
                                {t('exhibition.cta.button')}
                            </button>
                            <p className="mt-8 text-slate-500 text-sm">
                                {t('exhibition.cta.sub')}
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12 border-t border-slate-900 bg-[#0a0f1d]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-pointer">
                        <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                            <Heart className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('exhibition.footer.rights')}</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        {t('exhibition.footer.developedBy')} <span className="text-blue-500 font-semibold">Nhiquela Serviços e Consultoria, LDA</span>
                    </div>
                    <div className="flex gap-6 text-slate-500 text-sm">
                        <a href="#" className="hover:text-blue-400 transition-colors">{t('exhibition.footer.terms')}</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">{t('exhibition.footer.privacy')}</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">{t('exhibition.footer.contact')}</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ExhibitionPage;
