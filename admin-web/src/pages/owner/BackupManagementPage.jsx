import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, Clock, HardDrive, Settings, AlertTriangle } from 'lucide-react';
import securityService from '../../services/securityService';
import { useClinic } from '../../context/ClinicContext';
import toast from 'react-hot-toast';

const BackupManagementPage = () => {
    const { selectedClinic } = useClinic();
    const [backups, setBackups] = useState([]);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [creatingBackup, setCreatingBackup] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedClinic]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [backupsData, scheduleData] = await Promise.all([
                securityService.getBackups(selectedClinic?.id),
                securityService.getBackupSchedule(selectedClinic?.id),
            ]);
            setBackups(backupsData);
            setSchedule(scheduleData);
        } catch (error) {
            console.error('Error loading backup data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        if (!confirm('Deseja criar um backup manual agora?')) return;

        setCreatingBackup(true);
        try {
            await securityService.createBackup(selectedClinic?.id);
            toast.success('Backup criado com sucesso');
            loadData();
        } catch (error) {
            toast.error('Erro ao criar backup');
        } finally {
            setCreatingBackup(false);
        }
    };

    const handleRestore = async (backupId) => {
        if (!confirm('ATENÇÃO: Restaurar um backup substituirá todos os dados atuais. Esta ação não pode ser desfeita. Deseja continuar?')) return;

        try {
            await securityService.restoreBackup(backupId);
            toast.success('Restauração iniciada. O sistema será reiniciado.');
        } catch (error) {
            toast.error('Erro ao restaurar backup');
        }
    };

    const getStatusBadge = (status) => {
        return status === 'completed' ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Concluído</span>
        ) : status === 'failed' ? (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold">Falhou</span>
        ) : (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">Em andamento</span>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Database className="w-8 h-8 text-blue-600" />
                        Gestão de Backups
                    </h1>
                    <p className="text-gray-600 mt-1">Gerencie backups e restaurações dos dados</p>
                </div>

                <button
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {creatingBackup ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Criando...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Criar Backup Manual
                        </>
                    )}
                </button>
            </div>

            {/* Backup Schedule */}
            {schedule && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-blue-600" />
                            Agendamento Automático
                        </h2>
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Configurar
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <p className="font-bold text-gray-800">{schedule.enabled ? 'Ativado' : 'Desativado'}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Frequência</p>
                            <p className="font-bold text-gray-800 capitalize">{schedule.frequency}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Horário</p>
                            <p className="font-bold text-gray-800">{schedule.time}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Retenção</p>
                            <p className="font-bold text-gray-800">{schedule.retention} dias</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Backups List */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <HardDrive className="w-6 h-6 text-blue-600" />
                        Backups Disponíveis
                    </h2>
                </div>

                <div className="divide-y divide-gray-200">
                    {backups.map((backup) => (
                        <div key={backup.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Database className="w-6 h-6 text-blue-600" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-800">{backup.name}</h3>
                                            {getStatusBadge(backup.status)}
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${backup.type === 'automatic' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(backup.date).toLocaleString('pt-PT')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <HardDrive className="w-4 h-4" />
                                                {backup.size}
                                            </span>
                                            <span>Duração: {backup.duration}</span>
                                            {backup.createdBy && <span>Por: {backup.createdBy}</span>}
                                        </div>
                                    </div>
                                </div>

                                {backup.status === 'completed' && (
                                    <button
                                        onClick={() => handleRestore(backup.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Restaurar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-yellow-900 mb-1">Atenção</p>
                        <p className="text-sm text-yellow-800">
                            Restaurar um backup substituirá TODOS os dados atuais do sistema. Certifique-se de que compreende as implicações antes de prosseguir.
                            Recomendamos criar um backup manual antes de qualquer restauração.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupManagementPage;
