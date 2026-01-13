import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './components/ThemeProvider.jsx';
import { PrivateRoute } from './components/PrivateRoute.jsx';
import { Layout } from './components/Layout.jsx';
import { ScrollToTop } from './components/ScrollToTop.jsx';

// Public Pages
import { HomePage } from './pages/HomePage.jsx';
import { HomePageNew } from './pages/HomePageNew.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { AboutPageNew } from './pages/AboutPageNew.jsx';
import { ServicesPage } from './pages/ServicesPage.jsx';
import { ServicesPageNew } from './pages/ServicesPageNew.jsx';
import { SoftwareDevelopmentPage } from './pages/SoftwareDevelopmentPage.jsx';
import { SoftwareDevelopmentPageNew } from './pages/SoftwareDevelopmentPageNew.jsx';
import { ProfessionalServicesPage } from './pages/ProfessionalServicesPage.jsx';
import { ProfessionalServicesPageNew } from './pages/ProfessionalServicesPageNew.jsx';
import { DBAPage } from './pages/DBAPage.jsx';
import { DBAPageNew } from './pages/DBAPageNew.jsx';
import { QAPage } from './pages/QAPage.jsx';
import { QAPageNew } from './pages/QAPageNew.jsx';
import { BusinessIntelligencePage } from './pages/BusinessIntelligencePage.jsx';
import { BusinessIntelligencePageNew } from './pages/BusinessIntelligencePageNew.jsx';
import { DataSciencePage } from './pages/DataSciencePage.jsx';
import { DataSciencePageNew } from './pages/DataSciencePageNew.jsx';
import { CRMPage } from './pages/CRMPage.jsx';
import { CRMPageNew } from './pages/CRMPageNew.jsx';
import { CloudServicesPage } from './pages/CloudServicesPage.jsx';
import { CloudServicesPageNew } from './pages/CloudServicesPageNew.jsx';
import { DevOpsPage } from './pages/DevOpsPage.jsx';
import { DevOpsPageNew } from './pages/DevOpsPageNew.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { ContactPageNew } from './pages/ContactPageNew.jsx';
import { CareersPage } from './pages/CareersPage.jsx';
import { CareersPageNew } from './pages/CareersPageNew.jsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.jsx';
import { TermsConditions } from './pages/TermsConditions.jsx';
import { CookiePolicy } from './pages/CookiePolicy.jsx';

// Auth Pages
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { RoleLoginPage } from './pages/RoleLoginPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx';

// Admin Portal
import AdminLayout from './pages/admin/AdminLayout.jsx';
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { ClientManagement } from './pages/admin/ClientManagement.jsx';
import { AdminReports } from './pages/admin/AdminReports.jsx';
import ClientLogoManagement from './pages/admin/ClientLogoManagement.jsx';
import { JobManagement } from './pages/admin/JobManagement.jsx';
import { JobApplications } from './pages/admin/JobApplications.jsx';
import { AdminUserManagement } from './pages/admin/AdminUserManagement.jsx';
import { ContactMessages } from './pages/admin/ContactMessages.jsx';
import { InvoicesPayroll } from './pages/admin/InvoicesPayroll.jsx';
import { TimecardsManagement } from './pages/admin/TimecardsManagement.jsx';

// Common Pages
import { ChangePassword } from './pages/common/ChangePassword.jsx';

// User Portal
import UserLayout from './pages/user/UserLayout.jsx';
import { UserDashboard } from './pages/user/UserDashboard.jsx';
import { LogHours } from './pages/user/LogHours.jsx';
import { HoursHistory } from './pages/user/HoursHistory.jsx';

// Employee Portal
import { EmployeeTimeCards } from './pages/employee/EmployeeTimeCards.jsx';

// Employer Portal
import { EmployerDashboard } from './pages/employer/EmployerDashboard.jsx';
import { EmployerTimeCards } from './pages/employer/EmployerTimeCards.jsx';

function App() {
  return (
    <>
      <ThemeProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePageNew />} />
            <Route path="/about" element={<AboutPageNew />} />
            <Route path="/services" element={<ServicesPageNew />} />
            <Route path="/services/software-development" element={<SoftwareDevelopmentPageNew />} />
            <Route path="/services/professional" element={<ProfessionalServicesPageNew />} />
            <Route path="/services/dba" element={<DBAPageNew />} />
            <Route path="/services/qa" element={<QAPageNew />} />
            <Route path="/services/business-intelligence" element={<BusinessIntelligencePageNew />} />
            <Route path="/services/data-science" element={<DataSciencePageNew />} />
            <Route path="/services/crm" element={<CRMPageNew />} />
            <Route path="/services/cloud-services" element={<CloudServicesPageNew />} />
            <Route path="/services/devops" element={<DevOpsPageNew />} />
            <Route path="/contact" element={<ContactPageNew />} />
            <Route path="/careers" element={<CareersPageNew />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
          </Route>

          {/* Auth Routes - Role-based Login */}
          <Route path="/login/:role" element={<RoleLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          {/* Reset password - Supabase Auth sends token in URL hash */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Portal */}
          <Route
            element={
              <PrivateRoute requiredRole="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/clients" element={<ClientManagement />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/client-logos" element={<ClientLogoManagement />} />
            <Route path="/admin/jobs" element={<JobManagement />} />
            <Route path="/admin/job-applications" element={<JobApplications />} />
            <Route path="/admin/contact-messages" element={<ContactMessages />} />
            <Route path="/admin/invoices" element={<InvoicesPayroll />} />
            <Route path="/admin/timecards" element={<TimecardsManagement />} />
          </Route>

          {/* Employer Portal */}
          <Route
            path="/employer/dashboard"
            element={
              <PrivateRoute requiredRole="employer">
                <EmployerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/employer/timecards"
            element={
              <PrivateRoute requiredRole="employer">
                <EmployerTimeCards />
              </PrivateRoute>
            }
          />
          <Route
            path="/employer/change-password"
            element={
              <PrivateRoute requiredRole="employer">
                <ChangePassword />
              </PrivateRoute>
            }
          />

          {/* Employee Portal */}
          <Route
            path="/employee/timecards"
            element={
              <PrivateRoute requiredRole="employee">
                <EmployeeTimeCards />
              </PrivateRoute>
            }
          />
          <Route
            path="/employee/change-password"
            element={
              <PrivateRoute requiredRole="employee">
                <ChangePassword />
              </PrivateRoute>
            }
          />

          {/* User Portal */}
          <Route
            element={
              <PrivateRoute requiredRole="user">
                <UserLayout />
              </PrivateRoute>
            }
          >
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/log-hours" element={<LogHours />} />
            <Route path="/user/history" element={<HoursHistory />} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ThemeProvider>
      <ToastContainer position="bottom-right" />
    </>
  );
}

export default App;
