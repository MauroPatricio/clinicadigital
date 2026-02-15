import { useState } from 'react';
import {
    Settings, Building, CreditCard, Lock, Bell,
    Database, Users, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('organization');

    const renderContent = () => {
        switch (activeTab) {
            case 'organization':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nome da Clínica</label>
                                <input type="text" defaultValue="Clínica Digital Premium" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIF / NUIT</label>
                                <input type="text" defaultValue="123456789" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                                <input type="text" defaultValue="Av. Julius Nyerere, 1234, Maputo" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                                <input type="text" defaultValue="+258 84 000 0000" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Website</label>
                                <input type="text" defaultValue="www.clinicadigital.mz" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                        </div>
                    </div>
                );
            case 'financial':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                            <h4 className="font-bold flex items-center gap-2"><Lock className="w-4 h-4" /> Configurações Sensíveis</h4>
                            <p>Alterações nas moedas e taxas afetarão faturas futuras.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Moeda Padrão</label>
                                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                                    <option>MZN (Metical)</option>
                                    <option>USD ($)</option>
                                    <option>EUR (€)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">IVA (%)</label>
                                <input type="number" defaultValue="16" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-red-50 text-red-800 rounded-lg text-sm">
                            <h4 className="font-bold flex items-center gap-2"><Lock className="w-4 h-4" /> Configurações de Segurança</h4>
                            <p>Gerencie autenticação e permissões de acesso.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Autenticação de Dois Fatores (2FA)</h4>
                                    <p className="text-sm text-gray-600">Forçar 2FA para todos os usuários</p>
                                </div>
                                <input type="checkbox" className="toggle" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Timeout de Sessão</h4>
                                    <p className="text-sm text-gray-600">Minutos de inatividade antes do logout automático</p>
                                </div>
                                <input type="number" defaultValue="30" className="w-20 px-2 py-1 border border-gray-300 rounded" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Política de Senha</h4>
                                    <p className="text-sm text-gray-600">Mínimo de 8 caracteres, incluindo números e símbolos</p>
                                </div>
                                <input type="checkbox" defaultChecked className="toggle" />
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="border-b border-gray-200 pb-3">
                                <h3 className="font-semibold text-gray-900">Notificações por Email</h3>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Novas Consultas</h4>
                                    <p className="text-sm text-gray-600">Receber email quando nova consulta é agendada</p>
                                </div>
                                <input type="checkbox" defaultChecked className="toggle" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Faturas Pendentes</h4>
                                    <p className="text-sm text-gray-600">Alertas de faturas não pagas</p>
                                </div>
                                <input type="checkbox" defaultChecked className="toggle" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Relatórios Mensais</h4>
                                    <p className="text-sm text-gray-600">Resumo mensal de métricas e performance</p>
                                </div>
                                <input type="checkbox" className="toggle" />
                            </div>
                            <div className="border-b border-gray-200 pb-3 mt-6">
                                <h3 className="font-semibold text-gray-900">Notificações Push</h3>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Habilitar Push Notifications</h4>
                                    <p className="text-sm text-gray-600">Receber notificações no navegador</p>
                                </div>
                                <input type="checkbox" className="toggle" />
                            </div>
                        </div>
                    </div>
                );
            case 'backup':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                            <h4 className="font-bold flex items-center gap-2"><Database className="w-4 h-4" /> Backup Automático</h4>
                            <p>Configure backups automáticos para proteção de dados.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Frequência de Backup</label>
                                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                                    <option>Diário</option>
                                    <option>Semanal</option>
                                    <option>Mensal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Horário</label>
                                <input type="time" defaultValue="03:00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Retenção (dias)</label>
                                <input type="number" defaultValue="30" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Armazenamento</label>
                                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                                    <option>Local</option>
                                    <option>Cloud (AWS S3)</option>
                                    <option>Cloud (Google Drive)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <h4 className="font-medium text-gray-900">Backup Automático Habilitado</h4>
                                <p className="text-sm text-gray-600">Último backup: 13/02/2026 às 03:00</p>
                            </div>
                            <input type="checkbox" defaultChecked className="toggle" />
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Auto-aprovação de Novos Usuários</h4>
                                    <p className="text-sm text-gray-600">Novos registros precisam de aprovação manual</p>
                                </div>
                                <input type="checkbox" className="toggle" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">Limite de Usuários</h4>
                                    <p className="text-sm text-gray-600">Máximo de usuários permitidos no sistema</p>
                                </div>
                                <input type="number" defaultValue="100" className="w-24 px-2 py-1 border border-gray-300 rounded" />
                            </div>
                            <div className="border-b border-gray-200 pb-3 mt-6">
                                <h3 className="font-semibold text-gray-900">Permissões Padrão</h3>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Novo Médico</label>
                                <select multiple className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border h-32">
                                    <option selected>Ver Pacientes</option>
                                    <option selected>Criar Consultas</option>
                                    <option selected>Prescrever Medicamentos</option>
                                    <option>Ver Relatórios Financeiros</option>
                                    <option>Gerir Equipa</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-center py-12 text-gray-500">
                        <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Selecione uma categoria nas opções ao lado</p>
                    </div>
                );
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
            {/* Sidebar Params */}
            <div className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-bold text-gray-900">Configurações</h2>
                </div>
                <nav className="p-2 space-y-1">
                    {[
                        { id: 'organization', label: 'Organização', icon: Building },
                        { id: 'financial', label: 'Financeiro', icon: CreditCard },
                        { id: 'security', label: 'Segurança', icon: Lock },
                        { id: 'notifications', label: 'Notificações', icon: Bell },
                        { id: 'backup', label: 'Backup & Dados', icon: Database },
                        { id: 'users', label: 'Usuários', icon: Users },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 capitalize">
                        {activeTab === 'organization' ? 'Dados da Organização' :
                            activeTab === 'financial' ? 'Configurações Financeiras' : activeTab}
                    </h2>
                    <button
                        onClick={() => toast.success('Configurações salvas com sucesso!')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                    </button>
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default SettingsPage;
