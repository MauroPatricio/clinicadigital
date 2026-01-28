import { Building2, Check } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

const ClinicSelector = () => {
    const { currentClinic, availableClinics, switchClinic, canSwitchClinics } = useClinic();

    if (!canSwitchClinics || availableClinics.length <= 1) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Selecionar Clínica</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableClinics.map((clinic) => (
                    <button
                        key={clinic._id}
                        onClick={() => switchClinic(clinic)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${currentClinic?._id === clinic._id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 bg-white'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{clinic.name}</p>
                                <p className="text-sm text-gray-600 mt-1">{clinic.address?.city || 'N/A'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${clinic.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {clinic.status === 'active' ? 'Ativa' : 'Inativa'}
                                    </span>
                                </div>
                            </div>
                            {currentClinic?._id === clinic._id && (
                                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ClinicSelector;
