import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../services/apiService';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

const PatientFormPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        bloodType: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        insuranceProvider: '',
        policyNumber: ''
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
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                bloodType: formData.bloodType,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode
                },
                insurance: {
                    provider: formData.insuranceProvider,
                    policyNumber: formData.policyNumber
                }
            };

            await patientService.create(payload);
            toast.success('Patient created successfully');
            navigate('/patients');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <button
                onClick={() => navigate('/patients')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Patients
            </button>

            <div className="card max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New Patient</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                            <p className="mt-1 text-sm text-gray-500">Basic details of the patient.</p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="input mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="input mt-1" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="input mt-1" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className="input mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select name="gender" required value={formData.gender} onChange={handleChange} className="input mt-1">
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="input mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Medical & Address</h3>
                            <p className="mt-1 text-sm text-gray-500">Additional information.</p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                                <select name="bloodType" value={formData.bloodType} onChange={handleChange} className="input mt-1">
                                    <option value="">Select Blood Type</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                                    <input type="text" name="street" value={formData.street} onChange={handleChange} className="input mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="input mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="input mt-1" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="btn-primary flex items-center">
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Saving...' : 'Register Patient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientFormPage;
