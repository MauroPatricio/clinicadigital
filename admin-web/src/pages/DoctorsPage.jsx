import { useState, useEffect } from 'react';
import { UserCheck, Star, Calendar, Edit } from 'lucide-react';
import { doctorService } from '../services/apiService';
import toast from 'react-hot-toast';

const DoctorsPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadDoctors();
    }, [filter]);

    const loadDoctors = async () => {
        try {
            const params = filter !== 'all' ? { specialization: filter } : {};
            const data = await doctorService.getAll(params);
            setDoctors(data.data);
        } catch (error) {
            toast.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    const specializations = [
        'General Practice',
        'Cardiology',
        'Pediatrics',
        'Dermatology',
        'Orthopedics',
        'Neurology',
        'Psychiatry'
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
                <button
                    onClick={() => window.location.href = '/doctors/new'}
                    className="btn-primary flex items-center space-x-2"
                >
                    <UserCheck className="w-5 h-5" />
                    <span>Add Doctor</span>
                </button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex items-center space-x-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input max-w-xs"
                    >
                        <option value="all">All Specializations</option>
                        {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Doctors Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctors.length === 0 ? (
                        <div className="col-span-full card text-center py-12">
                            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
                        </div>
                    ) : (
                        doctors.map((doctor) => (
                            <div key={doctor._id} className="card hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                                            <span className="text-primary-600 font-medium text-lg">
                                                {doctor.user?.profile?.firstName?.charAt(0)}
                                                {doctor.user?.profile?.lastName?.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Dr. {doctor.user?.profile?.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-500">{doctor.specialization}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Star className="w-4 h-4 text-yellow-500 mr-2" />
                                        <span className="font-medium">{doctor.rating?.average?.toFixed(1) || 'N/A'}</span>
                                        <span className="text-gray-400 ml-1">
                                            ({doctor.rating?.count || 0} reviews)
                                        </span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>{doctor.stats?.totalConsultations || 0} consultations</span>
                                    </div>

                                    <div className="text-sm">
                                        <span className="font-medium text-gray-700">License: </span>
                                        <span className="text-gray-600">{doctor.licenseNumber}</span>
                                    </div>

                                    <div className="text-sm">
                                        <span className="font-medium text-gray-700">Consultation Types: </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {doctor.consultationTypes?.map(type => (
                                                <span key={type} className="badge badge-info text-xs">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-sm">
                                        <span className={`badge ${doctor.isAcceptingPatients ? 'badge-success' : 'badge-danger'}`}>
                                            {doctor.isAcceptingPatients ? 'Accepting Patients' : 'Not Accepting'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button className="w-full btn-secondary text-sm">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorsPage;
