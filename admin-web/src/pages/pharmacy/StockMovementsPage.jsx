import { ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';

const StockMovementsPage = () => {
    // Mock Data
    const movements = [
        { id: 1, item: 'Paracetamol 500mg', type: 'out', qty: 2, reason: 'Venda #1023', date: '06/02/2024 14:30', user: 'Farm. Lucas' },
        { id: 2, item: 'Seringas 5ml', type: 'in', qty: 500, reason: 'Compra PO-098', date: '05/02/2024 09:00', user: 'Gerente Ana' },
        { id: 3, item: 'Algodão Hidrófilo', type: 'out', qty: 1, reason: 'Uso Interno', date: '04/02/2024 11:15', user: 'Enf. Carla' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Movimentações de Estoque</h1>
                    <p className="text-gray-600">Histórico de entradas e saídas.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                        <Filter className="w-4 h-4" /> Filtros
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input type="text" placeholder="Buscar..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg outline-none" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Data/Hora</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Item</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Qtd</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Motivo</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {movements.map((mov) => (
                            <tr key={mov.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600">{mov.date}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{mov.item}</td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1 font-bold text-xs uppercase ${mov.type === 'in' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {mov.type === 'in' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                        {mov.type === 'in' ? 'Entrada' : 'Saída'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium">{mov.qty}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm">{mov.reason}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{mov.user}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockMovementsPage;
