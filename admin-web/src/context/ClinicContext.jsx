import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ClinicContext = createContext();

export const useClinic = () => {
    const context = useContext(ClinicContext);
    if (!context) {
        throw new Error('useClinic must be used within a ClinicProvider');
    }
    return context;
};

export const ClinicProvider = ({ children }) => {
    const { user, isOwner, isManager, isStaff } = useAuth();
    const [currentClinic, setCurrentClinic] = useState(null);
    const [availableClinics, setAvailableClinics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadClinics();
        }
    }, [user]);

    const loadClinics = async () => {
        try {
            setLoading(true);

            if (isOwner()) {
                // Owners can see all clinics in their organization
                const response = await api.get('/clinics');
                setAvailableClinics(response.data.data);

                // Set first clinic as default
                if (response.data.data.length > 0) {
                    const savedClinicId = localStorage.getItem('currentClinicId');
                    const clinic = savedClinicId
                        ? response.data.data.find(c => c._id === savedClinicId)
                        : response.data.data[0];

                    setCurrentClinic(clinic || response.data.data[0]);
                }
            } else if (isManager() || isStaff()) {
                // Managers and staff only see their assigned clinic
                if (user.clinic) {
                    const response = await api.get(`/clinics/${user.clinic}`);
                    const clinic = response.data.data;
                    setAvailableClinics([clinic]);
                    setCurrentClinic(clinic);
                }
            }
        } catch (error) {
            console.error('Error loading clinics:', error);
        } finally {
            setLoading(false);
        }
    };

    const switchClinic = (clinic) => {
        if (!isOwner()) {
            console.warn('Only owners can switch clinics');
            return;
        }

        setCurrentClinic(clinic);
        localStorage.setItem('currentClinicId', clinic._id);
    };

    const refreshClinic = async () => {
        if (!currentClinic) return;

        try {
            const response = await api.get(`/clinics/${currentClinic._id}`);
            setCurrentClinic(response.data.data);

            // Update in available clinics list
            setAvailableClinics(prev =>
                prev.map(c => c._id === response.data.data._id ? response.data.data : c)
            );
        } catch (error) {
            console.error('Error refreshing clinic:', error);
        }
    };

    const value = {
        currentClinic,
        availableClinics,
        loading,
        switchClinic,
        refreshClinic,
        loadClinics, // Exposed to allow manual refresh
        canSwitchClinics: isOwner() && availableClinics.length > 1
    };

    return (
        <ClinicContext.Provider value={value}>
            {children}
        </ClinicContext.Provider>
    );
};

export default ClinicContext;
