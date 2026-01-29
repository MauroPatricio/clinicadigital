import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = JSON.parse(localStorage.getItem('user'));
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);

            if (response.success) {
                setUser(response.data);
                return response;
            }

            throw new Error(response.message || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    // Helper functions for role checking
    const isOwner = () => user?.roleType === 'owner';
    const isManager = () => user?.roleType === 'manager';
    const isStaff = () => user?.roleType === 'staff';
    const isPatient = () => user?.roleType === 'patient';

    // Check if user has specific permission
    const hasPermission = (permission) => {
        if (isOwner()) return true; // Owners have all permissions
        return user?.permissions?.includes(permission) || false;
    };

    // Check if user has specific staff role
    const hasStaffRole = (role) => {
        if (!isStaff()) return false;
        return user?.staffRole === role;
    };

    // Get user's clinic
    const getUserClinic = () => user?.clinic || null;

    // Get user's organization
    const getUserOrganization = () => user?.organization || null;

    // Get role display name
    const getRoleDisplayName = () => {
        if (!user) return 'Guest';

        if (isOwner()) return 'Proprietário';
        if (isManager()) return 'Gestor';
        if (isStaff()) {
            const roleNames = {
                doctor: 'Médico',
                nurse: 'Enfermeiro(a)',
                receptionist: 'Recepcionista',
                technician: 'Técnico(a)',
                pharmacist: 'Farmacêutico(a)',
                administrator: 'Administrador(a)'
            };
            return roleNames[user.staffRole] || 'Funcionário';
        }
        if (isPatient()) return 'Paciente';

        return 'Usuário';
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isOwner,
        isManager,
        isStaff,
        isPatient,
        hasPermission,
        hasStaffRole,
        getUserClinic,
        getUserOrganization,
        getRoleDisplayName,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
