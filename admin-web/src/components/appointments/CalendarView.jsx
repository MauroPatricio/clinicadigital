import { format, startOfWeek, addDays, isSameDay, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView = ({ appointments, currentDate, onDateChange, onSlotClick, onAppointmentClick }) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 11 }).map((_, i) => i + 8); // 8:00 to 18:00

    const getAppointmentsForSlot = (day, hour) => {
        return appointments.filter(apt => {
            const aptDate = new Date(apt.dateTime);
            return isSameDay(aptDate, day) && aptDate.getHours() === hour;
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            scheduled: 'bg-blue-100 border-blue-200 text-blue-700',
            confirmed: 'bg-purple-100 border-purple-200 text-purple-700',
            'in-progress': 'bg-yellow-100 border-yellow-200 text-yellow-700',
            completed: 'bg-green-100 border-green-200 text-green-700',
            cancelled: 'bg-red-100 border-red-200 text-red-700',
            'no-show': 'bg-gray-100 border-gray-200 text-gray-700'
        };
        return colors[status] || 'bg-gray-100 border-gray-200 text-gray-700';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDateChange(addDays(currentDate, -7))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 capitalize">
                        {format(weekStart, "MMMM yyyy", { locale: ptBR })}
                    </h2>
                    <button
                        onClick={() => onDateChange(addDays(currentDate, 7))}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                <div className="text-sm text-gray-500">
                    Semana de {format(weekStart, "dd 'de' MMM", { locale: ptBR })}
                </div>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Week Header */}
                    <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                        <div className="p-3 text-center text-xs font-semibold text-gray-500 border-r border-gray-200">
                            Hora
                        </div>
                        {weekDays.map(day => (
                            <div key={day.toString()} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                                <p className="text-xs text-gray-500 uppercase">{format(day, 'EEE', { locale: ptBR })}</p>
                                <p className={`text-lg font-bold mt-1 ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'}`}>
                                    {format(day, 'dd')}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Time Slots */}
                    {hours.map(hour => (
                        <div key={hour} className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 h-32">
                            {/* Time Col */}
                            <div className="p-2 text-center text-xs text-gray-500 font-medium border-r border-gray-200 bg-gray-50">
                                {hour}:00
                            </div>

                            {/* Days Cols */}
                            {weekDays.map(day => {
                                const slotAppointments = getAppointmentsForSlot(day, hour);
                                return (
                                    <div
                                        key={`${day}-${hour}`}
                                        className="relative border-r border-gray-200 last:border-r-0 p-1 hover:bg-gray-50 transition-colors cursor-pointer group"
                                        onClick={() => onSlotClick(day, hour)}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                                                + Agendar
                                            </span>
                                        </div>

                                        <div className="relative z-10 space-y-1">
                                            {slotAppointments.map(apt => (
                                                <div
                                                    key={apt._id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAppointmentClick(apt);
                                                    }}
                                                    className={`
                                                        p-1.5 rounded-md border text-xs cursor-pointer shadow-sm hover:shadow-md transition-shadow
                                                        ${getStatusColor(apt.status)}
                                                    `}
                                                >
                                                    <p className="font-semibold truncate">
                                                        {apt.patient?.profile?.firstName}
                                                    </p>
                                                    <p className="truncate opacity-75">
                                                        Dr. {apt.doctor?.profile?.lastName}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
