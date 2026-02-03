import { useState, useEffect } from 'react';
import { Building2, DoorOpen, DoorClosed, Wrench, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { getRooms } from '../../services/roomService';
import toast from 'react-hot-toast';

const RoomsPage = () => {
    const { currentClinic } = useClinic();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        occupied: 0,
        maintenance: 0,
        occupancyRate: 0
    });

    useEffect(() => {
        fetchRooms();
    }, [currentClinic]);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await getRooms();

            if (response.success) {
                setRooms(response.data || []);
                setStats(response.stats || {
                    total: 0,
                    available: 0,
                    occupied: 0,
                    maintenance: 0,
                    occupancyRate: 0
                });
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            toast.error('Erro ao carregar salas');
            // Keep empty state on error
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            available: {
                label: 'Disponível',
                className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                icon: DoorOpen
            },
            occupied: {
                label: 'Ocupada',
                className: 'bg-rose-50 text-rose-700 border-rose-200',
                icon: DoorClosed
            },
            maintenance: {
                label: 'Manutenção',
                className: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: Wrench
            }
        };

        const { label, className, icon: Icon } = config[status];

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${className}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
            </span>
        );
    };

    const getRoomTypeLabel = (type) => {
        const types = {
            consultation: 'Consulta',
            procedure: 'Procedimento',
            emergency: 'Emergência',
            examination: 'Exame',
            laboratory: 'Laboratório',
            radiology: 'Radiologia'
        };
        return types[type] || type;
    };

    const getOccupancyColor = (percentage) => {
        if (percentage < 70) return 'text-emerald-600';
        if (percentage < 90) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getTimeSince = (date) => {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}min`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display text-slate-900">Gestão de Salas</h1>
                    <p className="text-slate-600 mt-1">Controle de ocupação e disponibilidade</p>
                </div>
                <button className="btn-primary">
                    <Plus className="w-5 h-5" />
                    Nova Sala
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-600 text-sm font-medium">Total de Salas</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
                        </div>
                        <Building2 className="w-10 h-10 text-primary-600 opacity-20" />
                    </div>
                </div>

                <div className="card bg-emerald-50 border-emerald-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-700 text-sm font-medium">Disponíveis</p>
                            <p className="text-3xl font-black text-emerald-900 mt-1">{stats.available}</p>
                        </div>
                        <DoorOpen className="w-10 h-10 text-emerald-600 opacity-20" />
                    </div>
                </div>

                <div className="card bg-rose-50 border-rose-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-rose-700 text-sm font-medium">Ocupadas</p>
                            <p className="text-3xl font-black text-rose-900 mt-1">{stats.occupied}</p>
                        </div>
                        <DoorClosed className="w-10 h-10 text-rose-600 opacity-20" />
                    </div>
                </div>

                <div className="card bg-amber-50 border-amber-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-700 text-sm font-medium">Manutenção</p>
                            <p className="text-3xl font-black text-amber-900 mt-1">{stats.maintenance}</p>
                        </div>
                        <Wrench className="w-10 h-10 text-amber-600 opacity-20" />
                    </div>
                </div>

                <div className="card-premium">
                    <div>
                        <p className="text-slate-600 text-sm font-medium">Taxa de Ocupação</p>
                        <div className="flex items-end gap-2 mt-1">
                            <p className={`text-3xl font-black ${getOccupancyColor(stats.occupancyRate)}`}>
                                {stats.occupancyRate}%
                            </p>
                        </div>
                        <div className="mt-3 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${stats.occupancyRate < 70 ? 'bg-emerald-500' :
                                    stats.occupancyRate < 90 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                style={{ width: `${stats.occupancyRate}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <div
                        key={room._id}
                        className={`card hover-lift ${room.status === 'occupied' ? 'border-rose-200 bg-rose-50/30' :
                            room.status === 'maintenance' ? 'border-amber-200 bg-amber-50/30' :
                                'border-emerald-200 bg-emerald-50/30'
                            }`}
                    >
                        {/* Room Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-1 rounded-lg bg-slate-900 text-white text-xs font-black">
                                        {room.number}
                                    </span>
                                    <span className="text-xs text-slate-600 font-medium">
                                        {getRoomTypeLabel(room.type)}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg">{room.name}</h3>
                            </div>
                            <div className="flex gap-1">
                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4 text-slate-600" />
                                </button>
                                <button className="p-2 hover:bg-rose-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4 text-rose-600" />
                                </button>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                            {getStatusBadge(room.status)}
                        </div>

                        {/* Current Occupation */}
                        {room.status === 'occupied' && (
                            <div className="mb-4 p-3 rounded-xl bg-white border border-slate-200">
                                <p className="text-xs text-slate-600 font-medium mb-1">Em atendimento:</p>
                                <p className="font-bold text-slate-900 text-sm">{room.currentPatient}</p>
                                <p className="text-xs text-slate-600 mt-1">{room.doctor}</p>
                                <div className="flex items-center gap-1 mt-2 text-slate-500 text-xs">
                                    <Clock className="w-3 h-3" />
                                    Há {getTimeSince(room.startTime)}
                                </div>
                            </div>
                        )}

                        {/* Maintenance Note */}
                        {room.status === 'maintenance' && room.maintenanceNote && (
                            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                                <p className="text-xs text-amber-900 font-medium">{room.maintenanceNote}</p>
                            </div>
                        )}

                        {/* Equipment List */}
                        <div>
                            <p className="text-xs text-slate-600 font-medium mb-2">Equipamentos:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {room.equipment.map((item, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 rounded-lg bg-slate-100 text-xs text-slate-700"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Capacity */}
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-600">
                                Capacidade: <span className="font-bold text-slate-900">{room.capacity} {room.capacity === 1 ? 'pessoa' : 'pessoas'}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {rooms.length === 0 && (
                <div className="card text-center py-12">
                    <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Nenhuma sala cadastrada</p>
                    <p className="text-sm text-slate-500 mt-2">Adicione a primeira sala para começar</p>
                    <button className="btn-primary mt-6">
                        <Plus className="w-5 h-5" />
                        Adicionar Sala
                    </button>
                </div>
            )}
        </div>
    );
};

export default RoomsPage;
