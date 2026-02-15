import { useState, useEffect } from 'react';
import {
    Truck, Search, Plus, MapPin, Phone, Mail,
    MoreVertical, Edit, Trash2, Star
} from 'lucide-react';

const SupplierManagementPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Mock API call
        setTimeout(() => {
            setSuppliers([
                { id: 1, name: 'MediPharma Lda', code: 'SMP-001', contact: 'Carlos Silva', phone: '+258 84 111 2222', email: 'vendas@medipharma.mz', city: 'Maputo', rating: 4.5, status: 'active' },
                { id: 2, name: 'Global Health Supplies', code: 'SUP-INT', contact: 'Ana Sousa', phone: '+258 82 333 4444', email: 'contact@globalhealth.com', city: 'Maputo', rating: 5.0, status: 'active' },
                { id: 3, name: 'EquipMed Moçambique', code: 'EQP-MZ', contact: 'João Santos', phone: '+258 87 555 6666', email: 'geral@equipmed.co.mz', city: 'Beira', rating: 3.8, status: 'active' },
                { id: 4, name: 'Laboratórios Unidos', code: 'LAB-UNI', contact: 'Maria Costa', phone: '+258 21 000 111', email: 'pedidos@labunidos.mz', city: 'Matola', rating: 4.0, status: 'inactive' },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
                    <p className="text-gray-600">Gestão de parceiros e historial de compras.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Novo Fornecedor</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou código..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Nenhum fornecedor encontrado.
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                                <p className="text-sm text-gray-500">{supplier.code}</p>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>{supplier.contact}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{supplier.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">{supplier.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{supplier.city}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                    <Star className="w-4 h-4 fill-current" />
                                    {supplier.rating}
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Fixed missing import causing error in previous step logic if I were to copy-paste blindly
import { User } from 'lucide-react';

export default SupplierManagementPage;
