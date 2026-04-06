import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

// Public
import Login from './pages/public/Login'
import { ForgotPassword, ResetPassword } from './pages/public/PasswordReset'
import AgencyApply from './pages/public/AgencyApply'
import EmploymentApply from './pages/public/EmploymentApply'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AgencyApplications from './pages/admin/AgencyApplications'
import AgencyDetail from './pages/admin/AgencyDetail'
import AllUsers from './pages/admin/AllUsers'
import AddUser from './pages/admin/AddUser'
import AddProgramDirector from './pages/admin/AddProgramDirector'
import EmploymentApplications from './pages/admin/EmploymentApplications'
import EmploymentDetail from './pages/admin/EmploymentDetail'
import UserDetail from './pages/admin/UserDetail'

// Director
import DirectorDashboard from './pages/director/DirectorDashboard'
import MyStaff from './pages/director/MyStaff'
// import AllConsumers from './pages/director/AllConsumers'
import AddConsumer from './pages/director/AddConsumer'
// import ConsumerDetail from './pages/director/ConsumerDetail'
// import EditConsumer from './pages/director/EditConsumer'

// Staff
import StaffDashboard from './pages/staff/StaffDashboard'

// Shared
import Profile from './pages/shared/Profile'
import StaffDetail from './pages/director/StaffDetail'
import AllConsumers from './pages/shared/AllConsumers'
// import AddConsumer from './pages/shared/AddConsumer'
import ConsumerDetail from './pages/shared/ConsumerDetail'
import EditConsumer from './pages/shared/EditConsumer'
import Appointments from './pages/shared/Appointments'

// Forms
import BasicFormsList from './pages/shared/forms/BasicFormsList'
import DentalForm from './pages/shared/forms/DentalForm'
import EnvironmentalForm from './pages/shared/forms/EnvironmentalForm'
import HotWaterFireEvacForm from './pages/shared/forms/HotWaterFireEvacForm'
import FireEmergencyForm from './pages/shared/forms/FireEmergencyForm'
import PoisonAssessmentForm from './pages/shared/forms/PoisonAssessmentForm'
import LegalAssessmentForm from './pages/shared/forms/LegalAssessmentForm'
import {
  RespiteServicePage,
  RssSlServicePage,
  SupportedHomeLivingPage,
  SupportedEmploymentPage,
  DayHabilitationPage,
} from './pages/shared/forms/DeliveryLogPages'
import PrnMedicationForm from './pages/shared/forms/PrnMedicationForm'
import ConsentMedicalInfoForm from './pages/shared/forms/ConsentMedicalInfoForm'
import FormDetail from './pages/shared/forms/FormDetail'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } })

function PlaceholderPage({ title }) {
  return (
    <div className="card">
      <div className="card-header-primary" style={{ margin: 0, borderRadius: '6px 6px 0 0', padding: '16px 20px' }}>
        <h4 className="card-title-white">{title}</h4>
        <p className="card-subtitle-white">Coming in a future phase</p>
      </div>
      <div className="card-body" style={{ padding: 40, textAlign: 'center', color: '#bbb' }}>
        <span className="material-icons" style={{ fontSize: 64 }}>construction</span>
        <p style={{ marginTop: 12 }}>This section is under development.</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/apply/agency" element={<AgencyApply />} />
          <Route path="/apply/employment" element={<EmploymentApply />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AllUsers />} />
            <Route path="users/add" element={<AddUser />} />
            <Route path="users/add-director" element={<AddProgramDirector />} />
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="agency-applications" element={<AgencyApplications />} />
            <Route path="agency-applications/:id" element={<AgencyDetail />} />
            <Route path="employments" element={<EmploymentApplications />} />
            <Route path="employments/:id" element={<EmploymentDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          </Route>

          {/* Director */}
          <Route path="/director" element={<ProtectedRoute allowedRoles={['director']}><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/director/dashboard" replace />} />
            <Route path="dashboard" element={<DirectorDashboard />} />
            <Route path="consumers" element={<AllConsumers />} />
            <Route path="consumers/add" element={<AddConsumer />} />
            <Route path="consumers/:id" element={<ConsumerDetail />} />
            <Route path="consumers/:id/edit" element={<EditConsumer />} />
            <Route path="employments" element={<EmploymentApplications />} />
            <Route path="employments/:id" element={<EmploymentDetail />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="forms/consumer" element={<BasicFormsList />} />
            <Route path="forms/consumer/dental" element={<DentalForm />} />
            <Route path="forms/consumer/environmental" element={<EnvironmentalForm />} />
            <Route path="forms/consumer/hot-water" element={<HotWaterFireEvacForm />} />
            <Route path="forms/consumer/fire-evac" element={<HotWaterFireEvacForm />} />
            <Route path="forms/consumer/fire-emergency" element={<FireEmergencyForm />} />
            <Route path="forms/consumer/poison" element={<PoisonAssessmentForm />} />
            <Route path="forms/consumer/legal" element={<LegalAssessmentForm />} />
            <Route path="forms/consumer/supported-home" element={<SupportedHomeLivingPage />} />
            <Route path="forms/consumer/supported-employment" element={<SupportedEmploymentPage />} />
            <Route path="forms/consumer/respite" element={<RespiteServicePage />} />
            <Route path="forms/consumer/rss-sl" element={<RssSlServicePage />} />
            <Route path="forms/consumer/day-habilitation" element={<DayHabilitationPage />} />
            <Route path="forms/consumer/prn-medication" element={<PrnMedicationForm />} />
            <Route path="forms/consumer/consent-medical" element={<ConsentMedicalInfoForm />} />
            <Route path="forms/view/:formId" element={<FormDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="staff" element={<MyStaff />} />
            <Route path="staff/:id" element={<StaffDetail />} />
          </Route>

          {/* Staff */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['nurse', 'caregiver']}><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            {/* <Route path="consumers" element={<PlaceholderPage title="Consumers" />} /> */}
            <Route path="consumers" element={<AllConsumers />} />
            <Route path="consumers/:id" element={<ConsumerDetail />} />
            <Route path="consumers/:id/edit" element={<EditConsumer />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="forms/consumer" element={<BasicFormsList />} />
            <Route path="forms/consumer/dental" element={<DentalForm />} />
            <Route path="forms/consumer/environmental" element={<EnvironmentalForm />} />
            <Route path="forms/consumer/hot-water" element={<HotWaterFireEvacForm />} />
            <Route path="forms/consumer/fire-evac" element={<HotWaterFireEvacForm />} />
            <Route path="forms/consumer/fire-emergency" element={<FireEmergencyForm />} />
            <Route path="forms/consumer/poison" element={<PoisonAssessmentForm />} />
            <Route path="forms/consumer/legal" element={<LegalAssessmentForm />} />
            <Route path="forms/consumer/supported-home" element={<SupportedHomeLivingPage />} />
            <Route path="forms/consumer/supported-employment" element={<SupportedEmploymentPage />} />
            <Route path="forms/consumer/respite" element={<RespiteServicePage />} />
            <Route path="forms/consumer/rss-sl" element={<RssSlServicePage />} />
            <Route path="forms/consumer/day-habilitation" element={<DayHabilitationPage />} />
            <Route path="forms/consumer/prn-medication" element={<PrnMedicationForm />} />
            <Route path="forms/consumer/consent-medical" element={<ConsentMedicalInfoForm />} />
            <Route path="forms/view/:formId" element={<FormDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
