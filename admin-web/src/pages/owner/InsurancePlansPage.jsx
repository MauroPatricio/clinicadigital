import { useState, useEffect } from 'react';
import {
    FileText, Search, Plus, CheckCircle, XCircle,
    MoreVertical, Shield
} from 'lucide-react';

const InsurancePlansPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data
        setTimeout(() => {
            setPlans([
                { id: 1, name: 'Plano Básico', provider: 'MediPlus Seguros', coverage: '80%', copay: '200 MZN', status: 'active', members: 164 },
                { id: 2, name: 'Plano Gold', provider: 'MediPlus Seguros', coverage: '100%', copay: '0 MZN', status: 'active', members: 85 },
                { id: 3, name: 'Empresarial Standard', provider: 'Global Health', coverage: '90%', copay: '100 MZN', status: 'active', members: 320 },
                { id: 4, name: 'Plano Familiar', provider: 'Seguradora Unida', coverage: '70%', copay: '500 MZN', status: 'inactive', members: 0 },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Planos de Saúde</h1>
                    <p className="text-gray-600">Gerencie co-participações e coberturas por plano.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Novo Plano</span>
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    plans.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{plan.provider}</p>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Cobertura:</span>
                                        <span className="font-semibold text-gray-900">{plan.coverage}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Co-pagamento:</span>
                                        <span className="font-semibold text-gray-900">{plan.copay}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Beneficiários:</span>
                                        <span className="font-semibold text-gray-900">{plan.members}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {plan.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Ver Detalhes</button>
                            </div>
                        </div>
                    ))
                )}

                {/* Add New Card Placeholder */}
                <button className="bg-gray-50 rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer min-h-[200px]">
                    <Plus className="w-10 h-10 mb-2" />
                    <span className="font-medium">Adicionar Novo Plano</span>
                </button>
            </div>
        </div>
    );
};

export default InsurancePlansPage;
