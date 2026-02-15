import { CreditCard, CheckCircle, Package } from 'lucide-react';

const SubscriptionPage = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-8 h-8 text-indigo-600" />
                Assinatura e Faturamento
            </h1>

            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Plano Atual</span>
                        <h2 className="text-3xl font-bold mt-2">Enterprise Plan</h2>
                        <p className="text-indigo-200 mt-1">Próxima renovação: 15 de Março de 2024</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">120.000 MT</div>
                        <div className="text-sm text-indigo-200">/mês</div>
                    </div>
                </div>
                <div className="mt-8 flex gap-4">
                    <button className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                        Gerenciar Pagamento
                    </button>
                    <button className="bg-indigo-700 text-white border border-indigo-500 px-6 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors">
                        Mudar Plano
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { title: 'Usuários', used: 12, limit: 'Ilimitado' },
                    { title: 'Armazenamento', used: '45GB', limit: '1TB' },
                    { title: 'Filiais', used: 3, limit: 10 },
                ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 font-medium text-sm uppercase">{item.title}</h3>
                        <div className="flex items-end gap-2 mt-2">
                            <span className="text-2xl font-bold text-gray-900">{item.used}</span>
                            <span className="text-sm text-gray-400 mb-1">/ {item.limit}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-indigo-500 h-full w-1/3 rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPage;
