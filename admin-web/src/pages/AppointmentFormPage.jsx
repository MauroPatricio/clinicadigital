import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService, patientService, doctorService } from '../services/apiService';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

const AppointmentFormPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        date: '',
        time: '',
        type: 'presencial',
        specialty: '',
        reason: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [patientsData, doctorsData] = await Promise.all([
                patientService.getAll(),
                doctorService.getAll()
            ]);
            setPatients(patientsData.data);
            setDoctors(doctorsData.data);
        } catch (error) {
            toast.error('Failed to load dependency data');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-set specialty when doctor is selected
            if (name === 'doctorId') {
                const doc = doctors.find(d => d._id === value);
                if (doc) newData.specialty = doc.specialization;
            }

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dateTime = new Date(`${formData.date}T${formData.time}`);

            await appointmentService.create({
                patientId: formData.patientId,
                doctorId: formData.doctorId,
                dateTime: dateTime.toISOString(),
                type: formData.type,
                specialty: formData.specialty,
                reason: formData.reason,
                // clinicId is optional or could be hardcoded/fetched if needed.
                // Assuming backend might require it or make it optional. 
                // Looking at controller: clinicId is used. 
                // We might need to fetch a default clinic or leave it empty if backend allows.
                // Controller: const { ... clinicId } = req.body;
                // create({ ... clinic: clinicId })
                // Models say clinic ref 'Clinic'.
                // If required, we fail. Let's try without and see.
            });

            toast.success('Appointment created successfully');
            navigate('/appointments');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <button
                onClick={() => navigate('/appointments')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Appointments
            </button>

            <div className="card max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">New Appointment</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Patient</label>
                        <select name="patientId" required value={formData.patientId} onChange={handleChange} className="input mt-1">
                            <option value="">Select Patient</option>
                            {patients.map(p => (
                                <option key={p._id} value={p._id}>
                                    {p.user?.profile?.firstName} {p.user?.profile?.lastName} ({p.patientNumber})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Doctor</label>
                        <select name="doctorId" required value={formData.doctorId} onChange={handleChange} className="input mt-1">
                            <option value="">Select Doctor</option>
                            {doctors.map(d => (
                                <option key={d._id} value={d._id}>
                                    Dr. {d.user?.profile?.lastName} ({d.specialization})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" name="date" required value={formData.date} onChange={handleChange} className="input mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Time</label>
                            <input type="time" name="time" required value={formData.time} onChange={handleChange} className="input mt-1" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select name="type" required value={formData.type} onChange={handleChange} className="input mt-1">
                            <option value="presencial">In Person</option>
                            <option value="online">Online</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Reason</label>
                        <textarea name="reason" rows="3" value={formData.reason} onChange={handleChange} className="input mt-1"></textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="btn-primary flex items-center">
                            <Save className="w-5 h-5 mr-2" />
                            {loading ? 'Book Appointment' : 'Book Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentFormPage;
