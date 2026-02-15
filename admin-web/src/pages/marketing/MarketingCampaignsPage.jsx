import { useState } from 'react';
import {
    Megaphone, Mail, MessageSquare, Plus,
    Calendar, Users, BarChart2, Send
} from 'lucide-react';

const MarketingCampaignsPage = () => {
    // Mock Campaigns
    const campaigns = [
        { id: 1, name: 'Check-up Anual - Março', type: 'email', status: 'active', audience: 1200, sent: 850, openRate: '42%' },
        { id: 2, name: 'Promoção Clareamento', type: 'sms', status: 'draft', audience: 500, sent: 0, openRate: '-' },
        { id: 3, name: 'Lembrete Vacinação', type: 'whatsapp', status: 'completed', audience: 300, sent: 300, openRate: '95%' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Marketing & CRM</h1>
                    <p className="text-gray-600">Gerencie campanhas de comunicação com pacientes.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Nova Campanha</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {campaigns.map((camp) => (
                    <div key={camp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${camp.type === 'email' ? 'bg-blue-50 text-blue-600' :
                                    camp.type === 'sms' ? 'bg-green-50 text-green-600' : 'bg-green-100 text-green-700'
                                }`}>
                                {camp.type === 'email' && <Mail className="w-6 h-6" />}
                                {camp.type === 'sms' && <MessageSquare className="w-6 h-6" />}
                                {camp.type === 'whatsapp' && <Send className="w-6 h-6" />}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${camp.status === 'active' ? 'bg-green-100 text-green-800' :
                                    camp.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {camp.status}
                            </span>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-1">{camp.name}</h3>
                        <p className="text-xs text-gray-500 mb-4 capitalize">Canal: {camp.type}</p>

                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1"><Users className="w-3 h-3" /> Público</span>
                                <span className="font-medium">{camp.audience}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1"><Send className="w-3 h-3" /> Enviados</span>
                                <span className="font-medium">{camp.sent}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Taxa Abertura</span>
                                <span className="font-medium text-green-600">{camp.openRate}</span>
                            </div>
                        </div>

                        <button className="mt-6 w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                            Gerenciar
                        </button>
                    </div>
                ))}

                {/* Add New Placeholder */}
                <button className="bg-gray-50 rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer min-h-[200px]">
                    <Megaphone className="w-10 h-10 mb-2" />
                    <span className="font-medium">Criar Nova Campanha</span>
                </button>
            </div>
        </div>
    );
};

export default MarketingCampaignsPage;
