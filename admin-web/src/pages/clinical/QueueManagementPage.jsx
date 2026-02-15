import { useState, useEffect } from 'react';
import {
    Clock, User, CheckCircle, MoreHorizontal,
    ArrowRight, Filter, AlertCircle
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../../services/api';

// Strict Mode warning with react-beautiful-dnd is known, ignoring for demo correctness
const QueueManagementPage = () => {
    const [columns, setColumns] = useState({
        waiting: {
            id: 'waiting',
            title: 'Em Espera',
            items: [],
            color: 'bg-yellow-50 text-yellow-800 border-yellow-200'
        },
        in_service: {
            id: 'in_service',
            title: 'Em Atendimento',
            items: [],
            color: 'bg-blue-50 text-blue-800 border-blue-200'
        },
        completed: {
            id: 'completed',
            title: 'Finalizado',
            items: [],
            color: 'bg-green-50 text-green-800 border-green-200'
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data loading
        setTimeout(() => {
            const mockData = {
                waiting: [
                    { id: '1', name: 'Maria Silva', service: 'Consulta Geral', time: '10:30', waitTime: '15m', doctor: 'Dr. Santos' },
                    { id: '2', name: 'João Paulo', service: 'Cardiologia', time: '10:45', waitTime: '5m', doctor: 'Dra. Costa' }
                ],
                in_service: [
                    { id: '3', name: 'Ana Beatriz', service: 'Pediatria', time: '10:15', startedAt: '10:35', doctor: 'Dr. Lima' }
                ],
                completed: [
                    { id: '4', name: 'Pedro Henrique', service: 'Exame Sangue', time: '09:00', completedAt: '09:30', doctor: 'Lab' }
                ]
            };

            setColumns(prev => ({
                waiting: { ...prev.waiting, items: mockData.waiting },
                in_service: { ...prev.in_service, items: mockData.in_service },
                completed: { ...prev.completed, items: mockData.completed }
            }));
            setLoading(false);
        }, 1000);
    }, []);

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...sourceColumn,
                    items: sourceItems
                },
                [destination.droppableId]: {
                    ...destColumn,
                    items: destItems
                }
            });

            // Here we would call API to update status
            // api.patch(`/appointments/${removed.id}/status`, { status: destination.droppableId });
        } else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: {
                    ...column,
                    items: copiedItems
                }
            });
        }
    };

    return (
        <div className="p-6 h-screen flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fila de Atendimento</h1>
                    <p className="text-gray-600">Gestão de fluxo de pacientes em tempo real.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                        Tempo Médio de Espera: <span className="font-bold">12 min</span>
                    </div>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden h-full">
                        {Object.entries(columns).map(([columnId, column]) => (
                            <div key={columnId} className="flex flex-col bg-gray-100 rounded-xl p-4 h-full">
                                <div className={`flex items-center justify-between p-3 rounded-lg mb-4 border ${column.color} bg-white bg-opacity-50`}>
                                    <h2 className="font-bold text-gray-900">{column.title}</h2>
                                    <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold border border-gray-200">
                                        {column.items.length}
                                    </span>
                                </div>

                                <Droppable droppableId={columnId}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="flex-1 overflow-y-auto space-y-3 min-h-[100px]"
                                        >
                                            {column.items.map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                                <button className="text-gray-400 hover:text-gray-600">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <div className="text-sm text-gray-600 mb-3">{item.service}</div>

                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                                <div className="flex items-center text-xs text-gray-500">
                                                                    <User className="w-3 h-3 mr-1" />
                                                                    {item.doctor}
                                                                </div>

                                                                {columnId === 'waiting' && (
                                                                    <div className="flex items-center text-xs text-orange-600 font-medium">
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        {item.waitTime}
                                                                    </div>
                                                                )}
                                                                {columnId === 'in_service' && (
                                                                    <div className="flex items-center text-xs text-blue-600 font-medium animate-pulse">
                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                        Em curso
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            )}
        </div>
    );
};

export default QueueManagementPage;
