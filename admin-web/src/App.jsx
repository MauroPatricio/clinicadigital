import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ClinicsListPage from './pages/owner/ClinicsListPage';
import CompareClinic from './pages/owner/CompareClinicsPage';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import StaffManagementPage from './pages/manager/StaffManagementPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import ChatPage from './pages/chat/ChatPage';
import PatientDashboard from './pages/patient/PatientDashboard';

// Legacy Pages (to be migrated)
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientFormPage from './pages/PatientFormPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorFormPage from './pages/DoctorFormPage';
import DoctorFormPage from './pages/DoctorFormPage';
import AppointmentFormPage from './pages/AppointmentFormPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ConsultationPage from './pages/doctor/ConsultationPage';
import VideoConsultationPage from './pages/doctor/VideoConsultationPage';
import LabResultsPage from './pages/LabResultsPage';
import BillingPage from './pages/BillingPage';
import ReportsPage from './pages/ReportsPage';

import './index.css';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ClinicProvider>
                    <SocketProvider>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* Protected Routes with Layout */}
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <MainLayout />
                                    </ProtectedRoute>
                                }
                            >
                                {/* Default redirect based on role */}
                                <Route index element={<Navigate to="/dashboard" replace />} />

                                {/* Owner Routes */}
                                <Route
                                    path="owner"
                                    element={
                                        <ProtectedRoute allowedRoles={['owner']}>
                                            <div />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="dashboard" element={<OwnerDashboard />} />
                                    <Route path="clinics" element={<ClinicsListPage />} />
                                    <Route path="clinics/compare" element={<CompareClinic />} />
                                    <Route path="clinics/new" element={<div className="p-6">Add Clinic (Coming Soon)</div>} />
                                    <Route path="organization" element={<div className="p-6">Organization Settings (Coming Soon)</div>} />
                                    <Route path="subscription" element={<div className="p-6">Subscription (Coming Soon)</div>} />
                                    <Route path="reports" element={<ReportsPage />} />
                                    <Route path="messages" element={<ChatPage />} />
                                </Route>

                                {/* Manager Routes */}
                                <Route
                                    path="manager"
                                    element={
                                        <ProtectedRoute allowedRoles={['manager', 'owner']}>
                                            <div />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="dashboard" element={<ManagerDashboard />} />
                                    <Route path="staff" element={<StaffManagementPage />} />
                                    <Route path="appointments" element={<AppointmentsPage />} />
                                    <Route path="patients" element={<PatientsPage />} />
                                    <Route path="rooms" element={<div className="p-6">Rooms (Coming Soon)</div>} />
                                    <Route path="analytics" element={<div className="p-6">Analytics (Coming Soon)</div>} />
                                    <Route path="settings" element={<div className="p-6">Settings (Coming Soon)</div>} />
                                    <Route path="messages" element={<ChatPage />} />
                                </Route>

                                {/* Staff Routes */}
                                <Route
                                    path="staff"
                                    element={
                                        <ProtectedRoute allowedRoles={['staff']}>
                                            <div />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="dashboard" element={<StaffDashboard />} />
                                    <Route path="schedule" element={<AppointmentsPage />} />
                                    <Route path="patients" element={<PatientsPage />} />
                                    <Route path="messages" element={<ChatPage />} />
                                    <Route path="performance" element={<div className="p-6">Performance (Coming Soon)</div>} />
                                </Route>

                                {/* Patient Routes */}
                                <Route
                                    path="patient"
                                    element={
                                        <ProtectedRoute allowedRoles={['patient']}>
                                            <div />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="dashboard" element={<PatientDashboard />} />
                                    <Route path="appointments" element={<AppointmentsPage />} />
                                    <Route path="appointments/new" element={<AppointmentFormPage />} />
                                    <Route path="telemedicine/:appointmentId" element={<VideoConsultationPage />} />
                                </Route>

                                {/* Legacy Routes (shared across roles) */}
                                <Route path="dashboard" element={<DashboardPage />} />
                                <Route path="patients" element={<PatientsPage />} />
                                <Route path="patients/new" element={<PatientFormPage />} />
                                <Route path="doctors" element={<DoctorsPage />} />
                                <Route path="doctors/new" element={<DoctorFormPage />} />
                                <Route path="appointments" element={<AppointmentsPage />} />
                                <Route path="appointments/new" element={<AppointmentFormPage />} />
                                <Route path="consultations/:appointmentId" element={<ConsultationPage />} />
                                <Route path="telemedicine/:appointmentId" element={<VideoConsultationPage />} />
                                <Route path="lab-results" element={<LabResultsPage />} />
                                <Route path="billing" element={<BillingPage />} />
                                <Route path="reports" element={<ReportsPage />} />
                                <Route path="chat" element={<ChatPage />} />

                                {/* Catch all */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Route>
                        </Routes>

                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#363636',
                                    color: '#fff',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#10b981',
                                        secondary: '#fff',
                                    },
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />
                    </SocketProvider>
                </ClinicProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
