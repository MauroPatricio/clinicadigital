import React, { useState, useEffect } from 'react';
import { Award, Users, TrendingUp, Gift, Star, Settings } from 'lucide-react';
import marketingService from '../../services/marketingService';
import { useClinic } from '../../context/ClinicContext';
import toast from 'react-hot-toast';

const LoyaltyProgramPage = () => {
    const { selectedClinic } = useClinic();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [selectedClinic]);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await marketingService.getLoyaltyProgram(selectedClinic?.id);
            setData(result);
        } catch (error) {
            console.error('Error loading loyalty program:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Award className="w-8 h-8 text-yellow-600" />
                        Programa de Fidelidade
                    </h1>
                    <p className="text-gray-600 mt-1">Gerencie recompensas e pontos de fidelidade</p>
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">
                    <Settings className="w-5 h-5 inline mr-2" />
                    Configurar
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-gray-600 text-sm">Total de Membros</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.stats?.totalMembers || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-gray-600 text-sm">Membros Ativos</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.stats?.activeMembers || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                    <Gift className="w-8 h-8 text-yellow-600 mb-2" />
                    <p className="text-gray-600 text-sm">Pontos Emitidos</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.stats?.pointsIssued?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <Star className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-gray-600 text-sm">Taxa de Redenção</p>
                    <p className="text-3xl font-bold text-gray-800">{data?.stats?.redemptionRate || 0}%</p>
                </div>
            </div>

            {/* Loyalty Tiers */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Níveis de Fidelidade</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {data?.tiers?.map((tier) => (
                        <div key={tier.name} className="border-2 rounded-lg p-4 text-center hover:shadow-lg transition-shadow" style={{ borderColor: tier.color }}>
                            <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: tier.color + '20', color: tier.color }}>
                                <Award className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">{tier.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">A partir de {tier.minPoints} pts</p>
                            <div className="bg-gray-100 rounded-full px-3 py-1">
                                <span className="text-sm font-semibold">{tier.discount}% desconto</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Members */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Top Membros</h2>
                <div className="space-y-3">
                    {data?.topMembers?.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{member.name}</p>
                                    <p className="text-sm text-gray-500">{member.points} pontos</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                {member.tier}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoyaltyProgramPage;
