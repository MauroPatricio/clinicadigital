import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';
import ClinicDashboard from './dashboards/ClinicDashboard';
import LaboratoryDashboard from './dashboards/LaboratoryDashboard';
import { Clock } from 'lucide-react';

const DashboardPage = () => {
    const { user } = useAuth();
    const { currentClinic } = useClinic();

    if (!currentClinic) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in p-4">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">
                        {currentClinic.type === 'laboratory' ? 'Painel Laboratorial' : 'Painel Clínico'}
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Bem-vindo de volta, {user?.profile?.firstName}.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider backdrop-blur-sm">
                    <Clock className="w-4 h-4 text-primary-500" />
                    Última atualização: {new Date().toLocaleTimeString()}
                </div>
            </header>

            {currentClinic.type === 'laboratory' ? (
                <LaboratoryDashboard />
            ) : (
                <ClinicDashboard />
            )}
        </div>
    );
};

export default DashboardPage;
