import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { SocketProvider } from './context/SocketContext';
import { LoadingProvider } from './context/LoadingContext';
import { ConnectivityProvider } from './context/ConnectivityContext';
import GlobalLoader from './components/common/GlobalLoader';
import PremiumFeatureGate from './components/premium/PremiumFeatureGate';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClinicSelectionPage from './pages/ClinicSelectionPage';
import UnitRegistrationPage from './pages/UnitRegistrationPage';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import MultiClinicDashboard from './pages/owner/MultiClinicDashboard';
import ClinicsListPage from './pages/owner/ClinicsListPage';
import CompareClinic from './pages/owner/CompareClinicsPage';
import UserManagementPage from './pages/owner/UserManagementPage';
import PermissionsPage from './pages/owner/PermissionsPage';
import AuditLogPage from './pages/owner/AuditLogPage';
import FinancialDashboard from './pages/owner/FinancialDashboard';
import RevenueManagementPage from './pages/owner/RevenueManagementPage';
import ExpenseManagementPage from './pages/owner/ExpenseManagementPage';
import CommissionsPage from './pages/owner/CommissionsPage';
import InvoiceManagementPage from "./pages/owner/InvoiceManagementPage";
import InvoiceDetailPage from "./pages/owner/InvoiceDetailPage";
import RecurringPaymentsPage from "./pages/owner/RecurringPaymentsPage";
import InsuranceProvidersPage from "./pages/owner/InsuranceProvidersPage";
import InsurancePlansPage from "./pages/owner/InsurancePlansPage";
import InsuranceClaimsPage from "./pages/owner/InsuranceClaimsPage";
import DoctorManagerPage from './pages/professional/DoctorManagerPage';
import DoctorSchedulePage from './pages/professional/DoctorSchedulePage';
import DoctorPerformancePage from './pages/professional/DoctorPerformancePage';
import FinancialProjectionsPage from "./pages/owner/FinancialProjectionsPage";
import LaboratoryRequestsPage from './pages/owner/LaboratoryRequestsPage';
import LaboratoryResultsPage from './pages/owner/LaboratoryResultsPage';
import LaboratoryHistoryPage from './pages/owner/LaboratoryHistoryPage';

// New BI Pages
import DoctorPerformanceBI from './pages/owner/DoctorPerformanceBI';
import ProductivityAnalysisPage from './pages/owner/ProductivityAnalysisPage';
import GrowthAnalysisPage from './pages/owner/GrowthAnalysisPage';

// New Multi-clinic & Marketing Pages
import TransfersPage from './pages/owner/TransfersPage';
import LoyaltyProgramPage from './pages/owner/LoyaltyProgramPage';
import FeedbackManagementPage from './pages/owner/FeedbackManagementPage';

// New Telemedicine & Security Pages
import TelemedicineDashboard from './pages/owner/TelemedicineDashboard';
import AccessLogsPage from './pages/owner/AccessLogsPage';
import ChangeHistoryPage from './pages/owner/ChangeHistoryPage';
import BackupManagementPage from './pages/owner/BackupManagementPage';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import StaffManagementPage from './pages/manager/StaffManagementPage';
import ExamsPage from './pages/manager/ExamsPage';
import RoomsPage from './pages/manager/RoomsPage';
import FinancePage from './pages/manager/FinancePage';
import ReportsManagerPage from './pages/manager/ReportsManagerPage';
import PatientDetailPage from './pages/manager/PatientDetailPage';
import PatientManagementPage from './pages/manager/PatientManagementPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';

// Clinical Pages (Batch 3)
import QueueManagementPage from './pages/clinical/QueueManagementPage';
import AppointmentListPage from './pages/clinical/AppointmentListPage';
import ConfirmationPage from './pages/clinical/ConfirmationPage';
import ChatPage from './pages/chat/ChatPage';
import PatientDashboard from './pages/patient/PatientDashboard';

// BI Pages (Batch 4)
import FinancialReportsPage from './pages/bi/FinancialReportsPage';
import ClinicalReportsPage from './pages/bi/ClinicalReportsPage';

// Pharmacy & Stock (Batch 5)
import StockManagementPage from './pages/pharmacy/StockManagementPage';
import PharmacySalesPage from './pages/pharmacy/PharmacySalesPage';
import SupplierManagementPage from './pages/pharmacy/SupplierManagementPage';

// Batch 6: Premium & Settings
import AIDashboardPage from './pages/ai/AIDashboardPage';
import MarketingCampaignsPage from './pages/marketing/MarketingCampaignsPage';
import SettingsPage from './pages/settings/SettingsPage';

// Final Implementation (Remaining Screens)
import LabManagementPage from './pages/clinical/LabManagementPage';
import SecurityDashboardPage from './pages/owner/SecurityDashboardPage';
import OrganizationPage from './pages/owner/OrganizationPage';
import SubscriptionPage from './pages/owner/SubscriptionPage';
import StockMovementsPage from './pages/pharmacy/StockMovementsPage';
import GenericPlaceholderPage from './components/common/GenericPlaceholderPage';
import TelemedicineHistoryPage from './pages/telemedicine/TelemedicineHistoryPage';
import DigitalPrescriptionPage from './pages/telemedicine/DigitalPrescriptionPage';
import { BarChart, HeartHandshake, Smile, Bell, MessageCircle } from 'lucide-react'; // Icons for placeholders

// Legacy Pages (to be migrated)
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientFormPage from './pages/PatientFormPage';
import DoctorsPage from './pages/DoctorsPage';
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
                <ConnectivityProvider>
                    <LoadingProvider>
                        <ClinicProvider>
                            <SocketProvider>
                                <GlobalLoader />
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    <Route path="/clinic-selection" element={<ClinicSelectionPage />} />
                                    <Route path="/owner/units/new" element={<UnitRegistrationPage />} />

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
                                                    <Outlet />
                                                </ProtectedRoute>
                                            }
                                        >
                                            <Route path="dashboard" element={<OwnerDashboard />} />
                                            <Route path="clinics" element={<ClinicsListPage />} />
                                            <Route path="clinics/compare" element={<CompareClinic />} />
                                            <Route path="clinics/new" element={<GenericPlaceholderPage title="Nova Clínica" icon={BarChart} />} />
                                            <Route path="organization" element={<OrganizationPage />} />
                                            <Route path="subscription" element={<SubscriptionPage />} />
                                            <Route path="reports" element={<ReportsPage />} />
                                            <Route path="messages" element={<ChatPage />} />
                                            {/* User Management */}
                                            <Route path="users" element={<UserManagementPage />} />
                                            <Route path="permissions" element={<PermissionsPage />} />
                                            <Route path="audit" element={<SecurityDashboardPage />} />
                                            {/* Financial Management */}
                                            <Route path="finance/dashboard" element={<FinancialDashboard />} />
                                            <Route path="finance/revenue" element={<RevenueManagementPage />} />
                                            <Route path="finance/expenses" element={<ExpenseManagementPage />} />
                                            <Route path="finance/commissions" element={<CommissionsPage />} />
                                            {/* Doctor Management */}
                                            <Route path="doctors" element={<DoctorManagerPage />} />
                                            <Route path="doctors/schedules" element={<DoctorSchedulePage />} />
                                            <Route path="doctors/performance" element={<DoctorPerformancePage />} />
                                            <Route path="doctors/commissions" element={<CommissionsPage />} />
                                            {/* Patient Management */}
                                            <Route path="patients" element={<PatientManagementPage />} />
                                            <Route path="patients/clinical" element={<Navigate to="/patients" replace />} />
                                            <Route path="patients/financial" element={<Navigate to="/patients" replace />} />
                                            {/* Appointments */}
                                            <Route path="appointments" element={<AppointmentListPage />} />
                                            <Route path="queue" element={<QueueManagementPage />} />
                                            <Route path="confirmations" element={<ConfirmationPage />} />
                                            {/* Financial Premium */}
                                            <Route path="finance/invoices" element={<InvoiceManagementPage />} />
                                            <Route path="finance/invoices/:id" element={<InvoiceDetailPage />} />
                                            <Route path="finance/recurring" element={<RecurringPaymentsPage />} />
                                            <Route path="finance/insurance" element={<InsuranceProvidersPage />} />
                                            <Route path="finance/projections" element={<FinancialProjectionsPage />} />
                                            {/* Insurance */}
                                            <Route path="insurance/providers" element={<InsuranceProvidersPage />} />
                                            <Route path="insurance/plans" element={<InsurancePlansPage />} />
                                            <Route path="insurance/invoices" element={<InsuranceClaimsPage />} />
                                            {/* Business Intelligence */}
                                            <Route path="bi/financial" element={<FinancialReportsPage />} />
                                            <Route path="bi/clinical" element={<ClinicalReportsPage />} />
                                            <Route path="bi/doctors" element={<DoctorPerformanceBI />} />
                                            <Route path="bi/productivity" element={<ProductivityAnalysisPage />} />
                                            <Route path="bi/growth" element={<GrowthAnalysisPage />} />
                                            {/* Laboratory */}
                                            <Route path="laboratory/requests" element={<LaboratoryRequestsPage />} />
                                            <Route path="laboratory/results" element={<LaboratoryResultsPage />} />
                                            <Route path="laboratory/history" element={<LaboratoryHistoryPage />} />
                                            {/* Pharmacy */}
                                            <Route path="pharmacy/stock" element={<StockManagementPage />} />
                                            <Route path="pharmacy/sales" element={<PharmacySalesPage />} />
                                            <Route path="pharmacy/suppliers" element={<SupplierManagementPage />} />
                                            {/* Stock */}
                                            <Route path="stock/inventory" element={<StockManagementPage />} />
                                            <Route path="stock/movements" element={<StockMovementsPage />} />
                                            <Route path="stock/alerts" element={<StockManagementPage />} />
                                            {/* Multi-clinic */}
                                            <Route path="multiclinic/overview" element={<MultiClinicDashboard />} />
                                            <Route path="multiclinic/compare" element={<CompareClinic />} />
                                            <Route path="clinics/compare" element={<Navigate to="/owner/multiclinic/compare" replace />} />
                                            <Route path="multiclinic/transfers" element={<TransfersPage />} />
                                            {/* Marketing */}
                                            <Route path="marketing/campaigns" element={<MarketingCampaignsPage />} />
                                            <Route path="marketing/loyalty" element={<LoyaltyProgramPage />} />
                                            <Route path="marketing/feedback" element={<FeedbackManagementPage />} />
                                            {/* AI Features */}
                                            <Route path="ai/predictions" element={<AIDashboardPage />} />
                                            <Route path="ai/recommendations" element={<AIDashboardPage />} />
                                            <Route path="ai/optimization" element={<AIDashboardPage />} />
                                            {/* Telemedicine */}
                                            <Route path="telemedicine" element={<TelemedicineDashboard />} />
                                            {/* Settings */}
                                            <Route path="settings" element={<SettingsPage />} />
                                            <Route path="settings/services" element={<SettingsPage />} />
                                            <Route path="settings/payments" element={<SettingsPage />} />
                                            <Route path="settings/templates" element={<SettingsPage />} />
                                            <Route path="settings/integrations" element={<SettingsPage />} />
                                            {/* Security */}
                                            <Route path="security/logs" element={<AccessLogsPage />} />
                                            <Route path="security/history" element={<ChangeHistoryPage />} />
                                            <Route path="security/backup" element={<BackupManagementPage />} />
                                        </Route>

                                        {/* Manager Routes */}
                                        <Route
                                            path="manager"
                                            element={
                                                <ProtectedRoute allowedRoles={['manager', 'owner']}>
                                                    <Outlet />
                                                </ProtectedRoute>
                                            }
                                        >
                                            <Route path="dashboard" element={<ManagerDashboard />} />
                                            <Route path="staff" element={<StaffManagementPage />} />
                                            <Route path="appointments" element={<AppointmentsPage />} />
                                            <Route path="patients" element={<PatientsPage />} />
                                            <Route path="patients/:id" element={<PatientDetailPage />} />
                                            <Route path="exams" element={<ExamsPage />} />
                                            <Route path="rooms" element={<RoomsPage />} />
                                            <Route path="rooms" element={<RoomsPage />} />
                                            <Route path="equipment" element={<GenericPlaceholderPage title="Gestão de Equipamentos" icon={BarChart} />} />
                                            <Route path="finance" element={<FinancePage />} />
                                            <Route path="reports" element={<ReportsManagerPage />} />
                                            <Route path="analytics" element={<ReportsManagerPage />} />
                                            <Route path="settings" element={<SettingsPage />} />
                                            <Route path="messages" element={<ChatPage />} />
                                            {/* Premium Features - Placeholders */}
                                            <Route path="patient-alerts" element={<GenericPlaceholderPage title="Alertas de Pacientes" icon={Bell} />} />
                                            <Route path="medical-records" element={<Navigate to="/manager/patients" replace />} />
                                            <Route path="queue" element={<QueueManagementPage />} />
                                            <Route path="confirmations" element={<ConfirmationPage />} />
                                            <Route path="telemedicine" element={<GenericPlaceholderPage title="Telemedicina" icon={MessageCircle} />} />
                                            <Route path="telemedicine/history" element={<TelemedicineHistoryPage />} />
                                            <Route path="prescriptions" element={<DigitalPrescriptionPage />} />
                                            <Route path="stock" element={<StockManagementPage />} />
                                            <Route path="stock/alerts" element={<StockManagementPage />} />
                                            <Route path="suppliers" element={<SupplierManagementPage />} />
                                            <Route path="stock/usage" element={<PharmacySalesPage />} />
                                            <Route path="ai-insights" element={<AIDashboardPage />} />
                                        </Route>

                                        {/* Staff Routes */}
                                        <Route
                                            path="staff"
                                            element={
                                                <ProtectedRoute allowedRoles={['staff']}>
                                                    <Outlet />
                                                </ProtectedRoute>
                                            }
                                        >
                                            <Route path="dashboard" element={<StaffDashboard />} />
                                            <Route path="schedule" element={<AppointmentsPage />} />
                                            <Route path="patients" element={<PatientsPage />} />
                                            <Route path="messages" element={<ChatPage />} />
                                            <Route path="performance" element={<DoctorPerformancePage />} />
                                        </Route>

                                        {/* Patient Routes */}
                                        <Route
                                            path="patient"
                                            element={
                                                <ProtectedRoute allowedRoles={['patient']}>
                                                    <Outlet />
                                                </ProtectedRoute>
                                            }
                                        >
                                            <Route path="dashboard" element={<PatientDashboard />} />
                                            <Route path="appointments" element={<AppointmentListPage />} />
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
                    </LoadingProvider>
                </ConnectivityProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
