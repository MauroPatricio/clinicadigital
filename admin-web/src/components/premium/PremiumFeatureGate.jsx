import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';

const PremiumFeatureGate = ({
    children,
    featureName,
    isPremium = false, // TODO: Connect to actual subscription context
    blurOnly = false
}) => {
    const navigate = useNavigate();

    // For now, allowing all features - replace with actual subscription check
    const hasAccess = true; // TODO: Replace with actual subscription logic

    if (hasAccess) {
        return <>{children}</>;
    }

    if (blurOnly) {
        return (
            <div className="relative">
                {/* Blurred content */}
                <div className="filter blur-md pointer-events-none select-none">
                    {children}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50/90 to-purple-50/90">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-full">
                                <Crown className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Funcionalidade Premium
                        </h3>

                        <p className="text-gray-600 mb-1">
                            <strong>{featureName}</strong> está disponível apenas no plano Premium
                        </p>

                        <p className="text-sm text-gray-500 mb-6">
                            Atualize seu plano para aceder a esta e muitas outras funcionalidades avançadas
                        </p>

                        <button
                            onClick={() => navigate('/owner/subscription')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Ver Planos Premium
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Block completely
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-red-400 to-pink-600 p-4 rounded-full">
                        <Lock className="w-16 h-16 text-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Acesso Bloqueado
                </h2>

                <div className="mb-6">
                    <div className="inline-flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-4">
                        <Crown className="w-5 h-5 text-yellow-600 mr-2" />
                        <span className="text-yellow-800 font-medium">Funcionalidade Premium</span>
                    </div>

                    <p className="text-gray-700 mb-2">
                        <strong>{featureName}</strong> requer um plano de subscrição ativo
                    </p>

                    <p className="text-sm text-gray-500">
                        Desbloqueie todo o potencial da plataforma com nossos planos Premium e Enterprise
                    </p>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => navigate('/owner/subscription')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        Explorar Planos
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumFeatureGate;
