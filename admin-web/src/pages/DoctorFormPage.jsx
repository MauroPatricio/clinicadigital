import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../services/apiService';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

const DoctorFormPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '', // Should be temporary or handled via invite
        specialization: '',
        licenseNumber: '',
        phone: '',
        address: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await doctorService.create(formData);
            toast.success('Doctor created successfully');
            navigate('/doctors');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create doctor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <button
                onClick={() => navigate('/doctors')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Doctors
            </button>

            <div className="card max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Doctor</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                required
                                value={formData.firstName}
                                onChange={handleChange}
                                className="input mt-1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                required
                                value={formData.lastName}
                                onChange={handleChange}
                                className="input mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="input mt-1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="input mt-1"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Specialization</label>
                            <select
                                name="specialization"
                                required
                                value={formData.specialization}
                                onChange={handleChange}
                                className="input mt-1"
                            >
                                <option value="">Select Specialization</option>
                                <option value="clinica-geral">General Practice</option>
                                <option value="cardiologia">Cardiology</option>
                                <option value="pediatria">Pediatrics</option>
                                <option value="dermatologia">Dermatology</option>
                                <option value="ortopedia">Orthopedics</option>
                                <option value="neurologia">Neurology</option>
                                <option value="psiquiatria">Psychiatry</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">License Number</label>
                            <input
                                type="text"
                                name="licenseNumber"
                                required
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                className="input mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input mt-1"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Saving...' : 'Save Doctor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorFormPage;
