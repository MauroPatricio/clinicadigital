import { useState, useEffect } from 'react';
import {
    Package, Search, Plus, Filter, AlertTriangle,
    MoreVertical, ArrowUp, ArrowDown, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const StockManagementPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            // Mocking API call
            setTimeout(() => {
                setItems([
                    { id: 1, name: 'Paracetamol 500mg', sku: 'MED-001', category: 'medication', quantity: 1500, unit: 'comps', minStock: 500, status: 'active', supplier: 'MediPharma', expiry: '2025-12-31' },
                    { id: 2, name: 'Amoxicilina 1g', sku: 'MED-002', category: 'medication', quantity: 45, unit: 'cx', minStock: 50, status: 'low_stock', supplier: 'Global Health', expiry: '2024-10-15' },
                    { id: 3, name: 'Luvas Cirúrgicas M', sku: 'EQP-005', category: 'consumable', quantity: 200, unit: 'pares', minStock: 100, status: 'active', supplier: 'EquipMed', expiry: '2026-05-20' },
                    { id: 4, name: 'Seringa 5ml', sku: 'EQP-010', category: 'consumable', quantity: 0, unit: 'unid', minStock: 200, status: 'out_of_stock', supplier: 'EquipMed', expiry: '2027-01-01' },
                ]);
                setLoading(false);
            }, 800);
        } catch (error) {
            console.error("Error fetching stock", error);
            setLoading(false);
        }
    };

    const getStatusBadge = (status, quantity, minStock) => {
        if (quantity === 0) return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Esgotado</span>;
        if (quantity <= minStock) return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Baixo Estoque</span>;
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Em Estoque</span>;
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão de Estoque</h1>
                    <p className="text-gray-600">Controle de medicamentos, consumíveis e equipamentos.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Novo Item</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou SKU..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 outline-none"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="all">Todas as Categorias</option>
                        <option value="medication">Medicamentos</option>
                        <option value="consumable">Consumíveis</option>
                        <option value="equipment">Equipamentos</option>
                    </select>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stock Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Item / SKU</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Quantidade</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fornecedor</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Validade</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                        Carregando estoque...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        Nenhum item encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.name}</p>
                                                    <span className="text-xs text-gray-500 font-mono">{item.sku}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 capitalize">{item.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{item.quantity} {item.unit}</span>
                                                <span className="text-xs text-gray-400">Min: {item.minStock}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status, item.quantity, item.minStock)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {item.supplier}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(item.expiry).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-indigo-600 p-1">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockManagementPage;
