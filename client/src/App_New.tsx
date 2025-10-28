import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CountsProvider } from './contexts/CountsContext';
import { BusinessSettingsProvider } from './contexts/BusinessSettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import { MainLayout } from './layouts';
import { LoginPage, DashboardPage, RolesPage, BusinessSettingsPage } from './pages';
import { PERMISSIONS, TOAST_CONFIG } from './constants';

// Import existing components that haven't been migrated yet
import Leads from './components/Leads';
import LeadCreate from './components/LeadCreate';
import LeadEdit from './components/LeadEdit';
import Users from './components/Users';
import UserCreate from './components/UserCreate';
import UserEdit from './components/UserEdit';
import RoleCreate from './components/RoleCreate';
import RoleEdit from './components/RoleEdit';
import Trash from './components/Trash';
import TrashUsers from './components/TrashUsers';
import TrashLeads from './components/TrashLeads';
import TrashRoles from './components/TrashRoles';
import LeadSettings from './components/LeadSettings';
import UserSettings from './components/UserSettings';
import IndustrySettings from './components/IndustrySettings';
import Profile from './components/Profile';
import TokenExpiryModal from './components/TokenExpiryModal';
import ErrorBoundary from './components/ErrorBoundary';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const { error } = useAuth();
  const navigate = useNavigate();
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryTitle, setExpiryTitle] = useState<string | undefined>(undefined);
  const [expiryMessage, setExpiryMessage] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (error === 'Session expired. Please login again.') {
      setShowExpiryModal(true);
    }
  }, [error]);

  // Listen for token expiry events
  React.useEffect(() => {
    const handleTokenExpiry = (event: Event) => {
      const customEvent = event as CustomEvent<{ title?: string; message?: string }>;
      setExpiryTitle(customEvent.detail?.title);
      setExpiryMessage(customEvent.detail?.message);
      setShowExpiryModal(true);
    };

    window.addEventListener('tokenExpired', handleTokenExpiry);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpiry);
    };
  }, []);

  const handleLoginAgain = () => {
    setShowExpiryModal(false);
    setExpiryTitle(undefined);
    setExpiryMessage(undefined);
    navigate('/login');
  };

  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD.READ}>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Lead Routes */}
        <Route
          path="/leads"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.LEAD.READ}>
              <MainLayout>
                <Leads />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/new"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.LEAD.CREATE}>
              <MainLayout>
                <LeadCreate />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/:id/edit"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.LEAD.UPDATE}>
              <MainLayout>
                <LeadEdit />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.USER.READ}>
              <MainLayout>
                <Users />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.USER.CREATE}>
              <MainLayout>
                <UserCreate />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.USER.UPDATE}>
              <MainLayout>
                <UserEdit />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Role Routes */}
        <Route
          path="/roles"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.ROLE.READ}>
              <MainLayout>
                <RolesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/new"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.ROLE.CREATE}>
              <MainLayout>
                <RoleCreate />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/:id/edit"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.ROLE.UPDATE}>
              <MainLayout>
                <RoleEdit />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Business Settings Routes */}
        <Route
          path="/business-settings"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.BUSINESS_SETTINGS.READ}>
              <MainLayout>
                <BusinessSettingsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Settings Routes */}
        <Route
          path="/settings/leads"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.LEAD.READ}>
              <MainLayout>
                <LeadSettings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/users"
          element={
            <ProtectedRoute requiredRole="Admin">
              <MainLayout>
                <UserSettings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/industries"
          element={
            <ProtectedRoute requiredRole="Admin">
              <MainLayout>
                <IndustrySettings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Trash Routes */}
        <Route
          path="/trash"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Trash />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash/users"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TrashUsers />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash/leads"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TrashLeads />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash/roles"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TrashRoles />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <TokenExpiryModal
        isOpen={showExpiryModal}
        onLogin={handleLoginAgain}
        title={expiryTitle}
        message={expiryMessage}
      />
      <ToastContainer
        position={TOAST_CONFIG.POSITION as any}
        autoClose={TOAST_CONFIG.AUTO_CLOSE}
        hideProgressBar={TOAST_CONFIG.HIDE_PROGRESS_BAR}
        newestOnTop
        closeOnClick={TOAST_CONFIG.CLOSE_ON_CLICK}
        pauseOnHover={TOAST_CONFIG.PAUSE_ON_HOVER}
        draggable={TOAST_CONFIG.DRAGGABLE}
        theme="colored"
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <CountsProvider>
              <BusinessSettingsProvider>
                <AppContent />
              </BusinessSettingsProvider>
            </CountsProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;