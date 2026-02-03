import { useState, useEffect } from 'react';
import { FlaskConical, Clock, AlertTriangle, CheckCircle2, Search, Filter, Calendar, User, FileText, Download } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { labService } from '../../services/labService';
import toast from 'react-hot-toast';

const ExamsPage = () => {
    const { currentClinic } = useClinic();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchExams();
    }, [currentClinic, statusFilter]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const params = statusFilter !== 'all' ? { status: statusFilter } : {};
            const response = await labService.getOrders(params);

            if (response.success) {
                setExams(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
            toast.error('Erro ao carregar exames');
            setExams([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            critical: 'bg-rose-50 text-rose-700 border-rose-200'
        };

        const labels = {
            pending: 'Pendente',
            in_progress: 'Em Análise',
            completed: 'Concluído',
            critical: 'Crítico'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        return priority === 'urgent' ? (
            <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                URGENTE
            </span>
        ) : null;
    };

    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.examId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.examType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: exams.length,
        pending: exams.filter(e => e.status === 'pending').length,
        inProgress: exams.filter(e => e.status === 'in_progress').length,
        critical: exams.filter(e => e.status === 'critical').length,
        completed: exams.filter(e => e.status === 'completed').length
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
                    <h1 className="text-3xl font-bold font-display text-slate-900">Gestão de Exames</h1>
                    <p className="text-slate-600 mt-1">Controle e acompanhamento de exames laboratoriais</p>
                </div>
                <button className="btn-primary">
                    <FlaskConical className="w-5 h-5" />
                    Novo Exame
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="card-premium">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-600 text-sm font-medium">Total</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
                        </div>
                        <FlaskConical className="w-10 h-10 text-primary-600 opacity-20" />
                    </div>
                </div>

                <div className="card bg-amber-50 border-amber-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-700 text-sm font-medium">Pendentes</p>
                            <p className="text-3xl font-black text-amber-900 mt-1">{stats.pending}</p>
                        </div>
                        <Clock className="w-10 h-10 text-amber-600 opacity-20" />
                    </div>
                </div>

                <div className="card bg-blue-50 border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-700 text-sm font-medium">Em Análise</p>
                            <p className="text-3xl font-black text-blue-900 mt-1">{stats.inProgress}</p>
                        </div>
                        <FlaskConical className="w-10 h-10 text-blue-600 opacity-20" />
                    </div>
                </div>

                <div className="card bg-rose-50 border-rose-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-rose-700 text-sm font-medium">Críticos</p>
                            <p className="text-3xl font-black text-rose-900 mt-1">{stats.critical}</p>
                        </div>
                        <AlertTriangle className="w-10 h-10 text-rose-600 opacity-20" />
                    </div>
                </div>

                <div className="card bg-emerald-50 border-emerald-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-700 text-sm font-medium">Concluídos</p>
                            <p className="text-3xl font-black text-emerald-900 mt-1">{stats.completed}</p>
                        </div>
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por paciente, ID ou tipo de exame..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input md:w-48"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="pending">Pendentes</option>
                        <option value="in_progress">Em Análise</option>
                        <option value="critical">Críticos</option>
                        <option value="completed">Concluídos</option>
                    </select>
                </div>
            </div>

            {/* Exams List */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">ID / Paciente</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Tipo de Exame</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Solicitante</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Data</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Status</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-700">Técnico</th>
                                <th className="text-right py-4 px-4 text-sm font-bold text-slate-700">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExams.map((exam) => (
                                <tr key={exam._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{exam.examId}</p>
                                            <p className="text-xs text-slate-600">{exam.patientName}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-slate-900 text-sm">{exam.examType}</p>
                                            {getPriorityBadge(exam.priority)}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-sm text-slate-700">{exam.requestedBy}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            {exam.requestDate.toLocaleDateString('pt-PT')}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        {getStatusBadge(exam.status)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-sm text-slate-700">{exam.technician || '-'}</p>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 hover:bg-primary-50 rounded-lg transition-colors">
                                                <FileText className="w-4 h-4 text-primary-600" />
                                            </button>
                                            {exam.status === 'completed' && (
                                                <button className="p-2 hover:bg-emerald-50 rounded-lg transition-colors">
                                                    <Download className="w-4 h-4 text-emerald-600" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredExams.length === 0 && (
                        <div className="text-center py-12">
                            <FlaskConical className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600 font-medium">Nenhum exame encontrado</p>
                            <p className="text-sm text-slate-500 mt-2">Tente ajustar os filtros ou criar um novo exame</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamsPage;
