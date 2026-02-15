import { useState, useEffect } from 'react';
import { X, Save, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const DoctorFormModal = ({ isOpen, onClose, onSuccess, doctorToEdit = null }) => {
    const [formData, setFormData] = useState({
        user: '', // User ID
        specialization: '',
        licenseNumber: '',
        bio: '',
        consultationFee: 0,
        appointmentDuration: 30
    });

    // For user search logic (simplified for now)
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUsersLines(); // To select a user to be a doctor
            if (doctorToEdit) {
                setFormData({
                    user: doctorToEdit.user?._id || '',
                    specialization: doctorToEdit.specialization || '',
                    licenseNumber: doctorToEdit.licenseNumber || '',
                    bio: doctorToEdit.bio || '',
                    consultationFee: doctorToEdit.consultationFee || 0,
                    appointmentDuration: doctorToEdit.appointmentDuration || 30
                });
            } else {
                // Reset form
                setFormData({
                    user: '',
                    specialization: '',
                    licenseNumber: '',
                    bio: '',
                    consultationFee: 0,
                    appointmentDuration: 30
                });
            }
        }
    }, [isOpen, doctorToEdit]);

    const fetchUsersLines = async () => {
        try {
            // Fetch users with role="doctor" or similar candidates
            // For now fetching all and filtering in dropdown might be heavy, ideally backend endpoint
            const res = await api.get('/users?role=doctor');
            setUsers(res.data.data || []);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (doctorToEdit) {
                await api.put(`/doctors/${doctorToEdit._id}`, formData);
                toast.success('Médico atualizado com sucesso!');
            } else {
                await api.post('/doctors', formData);
                toast.success('Médico cadastrado com sucesso!');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar médico. Verifique os dados.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backbone-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {doctorToEdit ? 'Editar Médico' : 'Novo Médico'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* User Selection (Only for Create) */}
                    {!doctorToEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário (Médico)</label>
                            <select
                                name="user"
                                value={formData.user}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            >
                                <option value="">Selecione um usuário...</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>
                                        {u.profile?.firstName} {u.profile?.lastName} ({u.email})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">O usuário deve ter o papel 'doctor' criado no sistema.</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                        <input
                            type="text"
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                            placeholder="Ex: Cardiologia"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número da Licença (CRM)</label>
                        <input
                            type="text"
                            name="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Consulta (MZN)</label>
                            <input
                                type="number"
                                name="consultationFee"
                                value={formData.consultationFee}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                            <select
                                name="appointmentDuration"
                                value={formData.appointmentDuration}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="15">15 minutos</option>
                                <option value="30">30 minutos</option>
                                <option value="45">45 minutos</option>
                                <option value="60">1 hora</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Biografia Resumida</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="3"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Salvando...' : 'Salvar Médico'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorFormModal;
