import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../../services/api';

const UserFormModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'staff',
        clinicId: '',
        profile: {
            firstName: '',
            lastName: '',
            phone: '',
            dateOfBirth: ''
        },
        staffRole: '',
        specialization: '',
        licenseNumber: ''
    });
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadClinics();
        if (user) {
            setFormData({
                email: user.email || '',
                password: '', // Never populate password
                role: user.role || 'staff',
                clinicId: user.clinicId?._id || '',
                profile: {
                    firstName: user.profile?.firstName || '',
                    lastName: user.profile?.lastName || '',
                    phone: user.profile?.phone || '',
                    dateOfBirth: user.profile?.dateOfBirth || ''
                },
                staffRole: user.staffRole || '',
                specialization: user.specialization || '',
                licenseNumber: user.licenseNumber || ''
            });
        }
    }, [user]);

    const loadClinics = async () => {
        try {
            const response = await api.get('/clinics');
            setClinics(response.data.data || []);
        } catch (error) {
            console.error('Error loading clinics:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        if (!formData.email || !formData.profile.firstName || !formData.profile.lastName) {
            alert('Nome, sobrenome e email são obrigatórios');
            return;
        }

        if (!user && (!formData.password || formData.password.length < 6)) {
            alert('Senha deve ter no mínimo 6 caracteres');
            return;
        }

        try {
            setLoading(true);

            if (user) {
                // Update user
                await api.patch(`/users/${user._id}`, formData);
            } else {
                // Create user
                await api.post('/users', formData);
            }

            onSave();
        } catch (error) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.message || 'Erro ao salvar usuário');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {user ? 'Editar Usuário' : 'Novo Usuário'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Personal Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome *
                                </label>
                                <input
                                    type="text"
                                    value={formData.profile.firstName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        profile: { ...formData.profile, firstName: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sobrenome *
                                </label>
                                <input
                                    type="text"
                                    value={formData.profile.lastName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        profile: { ...formData.profile, lastName: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                    disabled={!!user}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.profile.phone}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        profile: { ...formData.profile, phone: e.target.value }
                                    })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Conta</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Função *
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="patient">Paciente</option>
                                    <option value="staff">Funcionário</option>
                                    <option value="manager">Gestor</option>
                                    <option value="owner">Proprietário</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Clínica
                                </label>
                                <select
                                    value={formData.clinicId}
                                    onChange={(e) => setFormData({ ...formData, clinicId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Selecione uma clínica</option>
                                    {clinics.map(clinic => (
                                        <option key={clinic._id} value={clinic._id}>
                                            {clinic.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {!user && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Senha Inicial * (mínimo 6 caracteres)
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required={!user}
                                        minLength={6}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Staff-specific fields */}
                    {(formData.role === 'staff' || formData.role === 'manager') && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Profissionais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cargo
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.staffRole}
                                        onChange={(e) => setFormData({ ...formData, staffRole: e.target.value })}
                                        placeholder="ex: Médico, Enfermeiro"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Especialização
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        placeholder="ex: Cardiologia"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Licença
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;
