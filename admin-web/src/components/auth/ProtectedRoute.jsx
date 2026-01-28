import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.roleType)) {
        // Redirect to their default dashboard
        if (user?.roleType === 'owner') return <Navigate to="/owner/dashboard" replace />;
        if (user?.roleType === 'manager') return <Navigate to="/manager/dashboard" replace />;
        if (user?.roleType === 'staff') return <Navigate to="/staff/dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
