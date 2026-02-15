import { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight,
    User, Filter, Plus, Save
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const DoctorSchedulePage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDoctor, setSelectedDoctor] = useState('all');
    const [doctors, setDoctors] = useState([]);
    const [schedules, setSchedules] = useState([]); // Mock data structure for now
    const [loading, setLoading] = useState(true);

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

    // Time slots (08:00 - 18:00)
    const timeSlots = [...Array(11)].map((_, i) => {
        const hour = 8 + i;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    useEffect(() => {
        fetchDoctors();
        fetchSchedules();
    }, [currentDate, selectedDoctor]);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors');
            setDoctors(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSchedules = async () => {
        // Needs backend endpoint for schedules, mocking for UI
        setLoading(true);
        setTimeout(() => {
            setSchedules([
                {
                    id: 1,
                    doctorId: doctors[0]?._id,
                    day: weekDays[0], // Monday
                    startTime: '08:00',
                    endTime: '12:00',
                    type: 'shift'
                },
                {
                    id: 2,
                    doctorId: doctors[0]?._id,
                    day: weekDays[2], // Wednesday
                    startTime: '14:00',
                    endTime: '18:00',
                    type: 'shift'
                }
            ]);
            setLoading(false);
        }, 800);
    };

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Escalas Médicas</h1>
                    <p className="text-gray-600">Gestão de horários de atendimento e turnos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm">
                        <Plus className="w-5 h-5" />
                        <span>Novo Turno</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm">
                        <Filter className="w-5 h-5" />
                        <span>Filtros</span>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button onClick={prevWeek} className="p-2 hover:bg-white rounded-md transition-all shadow-sm">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="px-4 font-medium text-gray-900 capitalize min-w-[150px] text-center">
                            {format(weekStart, 'MMMM yyyy', { locale: ptBR })}
                        </div>
                        <button onClick={nextWeek} className="p-2 hover:bg-white rounded-md transition-all shadow-sm">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                        Hoje
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <User className="w-5 h-5 text-gray-400" />
                    <select
                        className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                        <option value="all">Todos os Médicos</option>
                        {doctors.map(d => (
                            <option key={d._id} value={d._id}>
                                Dr. {d.user?.profile?.firstName} {d.user?.profile?.lastName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                    <div className="p-4 border-r border-gray-200 text-center font-medium text-gray-500 text-sm">
                        Horário
                    </div>
                    {weekDays.map((day, i) => (
                        <div key={i} className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${isSameDay(day, new Date()) ? 'bg-indigo-50' : ''
                            }`}>
                            <div className="text-xs font-medium text-gray-500 uppercase">
                                {format(day, 'EEE', { locale: ptBR })}
                            </div>
                            <div className={`mt-1 text-lg font-bold ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-gray-900'
                                }`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    )}

                    {timeSlots.map((time, i) => (
                        <div key={time} className="grid grid-cols-8 border-b border-gray-100 min-h-[60px]">
                            <div className="p-2 border-r border-gray-100 text-center text-xs text-gray-500 font-medium translate-y-[-8px]">
                                {time}
                            </div>
                            {weekDays.map((day, dIndex) => (
                                <div key={dIndex} className="relative border-r border-gray-100 last:border-r-0 p-1 group hover:bg-gray-50 transition-colors">
                                    {/* Mock interaction area */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                                        <Plus className="w-4 h-4 text-gray-300" />
                                    </div>

                                    {/* Render mock shifts here based on logic */}
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Mock Shift Item placed absolutely based on calculation (simplified for UI Demo) */}
                    <div className="absolute top-[60px] left-[12.5%] w-[12.5%] p-1 z-1 pointer-events-none">
                        <div className="bg-green-100 border-l-4 border-green-500 p-2 rounded text-xs shadow-sm">
                            <div className="font-bold text-green-900">Dr. Ana Silva</div>
                            <div className="text-green-700">08:00 - 12:00</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorSchedulePage;
