import { useState, useEffect } from 'react';
import {
    Building2, Search, Plus, MoreVertical,
    Shield, Phone, Globe, Edit, Trash2
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const InsuranceProvidersPage = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                // Mocking API call for now or use real endpoint if available
                // const res = await api.get('/insurance/providers');
                // setProviders(res.data.data);

                // Mock Data
                setTimeout(() => {
                    setProviders([
                        { id: 1, name: 'MediPlus Seguros', code: 'MP-001', contact: '+258 84 123 4567', email: 'contato@mediplus.co.mz', website: 'www.mediplus.co.mz', status: 'active', coverage: 'Nacional' },
                        { id: 2, name: 'Global Health', code: 'GH-INT', contact: '+258 82 987 6543', email: 'support@globalhealth.com', website: 'www.globalhealth.com', status: 'active', coverage: 'Internacional' },
                        { id: 3, name: 'Seguradora Unida', code: 'SU-MZ', contact: '+258 21 333 444', email: 'geral@unida.co.mz', website: 'www.unida.co.mz', status: 'inactive', coverage: 'Regional' }
                    ]);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Error fetching providers", error);
                setLoading(false);
            }
        };

        fetchProviders();
    }, []);

    const filteredProviders = providers.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Seguradoras</h1>
                    <p className="text-gray-600">Gerencie as empresas de seguros conveniadas.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Nova Seguradora</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar seguradora por nome ou código..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seguradora</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contactos</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cobertura</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                        Carregando...
                                    </td>
                                </tr>
                            ) : filteredProviders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Nenhuma seguradora encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredProviders.map((provider) => (
                                    <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{provider.name}</p>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                        {provider.code}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                                    {provider.contact}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Globe className="w-3 h-3 mr-2 text-gray-400" />
                                                    {provider.website}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                <Shield className="w-3 h-3 mr-1" />
                                                {provider.coverage}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${provider.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {provider.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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

export default InsuranceProvidersPage;
