import { useState } from 'react';
import {
    Shield, Lock, FileText, Database,
    AlertTriangle, Check, RefreshCw
} from 'lucide-react';

const SecurityDashboardPage = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-8 h-8 text-green-600" />
                Segurança e Compliance
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Lock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">ATIVO</span>
                    </div>
                    <h3 className="font-bold text-gray-900">Controle de Acesso</h3>
                    <p className="text-sm text-gray-500 mt-1">2FA Ativado para 80% dos usuários.</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="text-indigo-600 text-sm font-medium hover:underline">Gerenciar Permissões</button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Database className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">1h atrás</span>
                    </div>
                    <h3 className="font-bold text-gray-900">Backup Automático</h3>
                    <p className="text-sm text-gray-500 mt-1">Último backup: 1.2GB - Sucesso.</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="text-indigo-600 text-sm font-medium hover:underline">Configurar Rotina</button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold bg-gray-100 text-gray-800 px-2 py-1 rounded">0 Críticos</span>
                    </div>
                    <h3 className="font-bold text-gray-900">Logs de Auditoria</h3>
                    <p className="text-sm text-gray-500 mt-1">45 ações registradas hoje.</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <button className="text-indigo-600 text-sm font-medium hover:underline">Ver Logs</button>
                    </div>
                </div>
            </div>

            {/* Recent Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-lg mb-4">Atividade Recente</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-4 py-2">Evento</th>
                                <th className="px-4 py-2">Usuário</th>
                                <th className="px-4 py-2">IP</th>
                                <th className="px-4 py-2">Data/Hora</th>
                                <th className="px-4 py-2">Resultado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr>
                                <td className="px-4 py-3 font-medium">Login Sucesso</td>
                                <td className="px-4 py-3">admin@clinica.com</td>
                                <td className="px-4 py-3">192.168.1.1</td>
                                <td className="px-4 py-3">Agora mesmo</td>
                                <td className="px-4 py-3 text-green-600 font-medium">Sucesso</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium">Alteração Registro Paciente</td>
                                <td className="px-4 py-3">doutor@clinica.com</td>
                                <td className="px-4 py-3">192.168.1.45</td>
                                <td className="px-4 py-3">10 min atrás</td>
                                <td className="px-4 py-3 text-green-600 font-medium">Sucesso</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium">Tentativa Login Falha</td>
                                <td className="px-4 py-3">desconhecido</td>
                                <td className="px-4 py-3 text-red-500">45.2.1.1 (Externo)</td>
                                <td className="px-4 py-3">2h atrás</td>
                                <td className="px-4 py-3 text-red-600 font-medium">Bloqueado</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboardPage;
