import { Building, Upload, Network } from 'lucide-react';

const OrganizationPage = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Building className="w-8 h-8 text-indigo-600" />
                Dados da Organização
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Instituição</label>
                        <input type="text" defaultValue="Clínica Digital Premium" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIF / NUIT</label>
                        <input type="text" defaultValue="543219876" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Principal</label>
                        <input type="text" defaultValue="Av. 24 de Julho, Maputo" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <input type="text" defaultValue="https://clinicadigital.mz" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" />
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Branding</h3>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400">
                            Logo
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Upload className="w-4 h-4" />
                            Carregar Logotipo
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Network className="w-5 h-5" /> Estrutura</h3>
                    <p className="text-gray-600 text-sm">Gerencie múltiplos centros de custo e departamentos em configurações avançadas.</p>
                </div>
            </div>
        </div>
    );
};

export default OrganizationPage;
