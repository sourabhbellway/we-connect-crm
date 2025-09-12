import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CountsProvider } from "./contexts/CountsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Leads from "./components/Leads";
import LeadCreate from "./components/LeadCreate";
import LeadEdit from "./components/LeadEdit";
import Users from "./components/Users";
import UserCreate from "./components/UserCreate";
import UserEdit from "./components/UserEdit";
import Roles from "./components/Roles";
import RoleCreate from "./components/RoleCreate";
import RoleEdit from "./components/RoleEdit";
import Trash from "./components/Trash";
import TrashUsers from "./components/TrashUsers";
import TrashLeads from "./components/TrashLeads";
import TrashRoles from "./components/TrashRoles";
import LeadSettings from "./components/LeadSettings";
import IndustrySettings from "./components/IndustrySettings";
import Profile from "./components/Profile";
import TokenExpiryModal from "./components/TokenExpiryModal";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppContent() {
  const { error } = useAuth();
  const navigate = useNavigate();
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  React.useEffect(() => {
    if (error === "Session expired. Please login again.") {
      setShowExpiryModal(true);
    }
  }, [error]);

  const handleLoginAgain = () => {
    setShowExpiryModal(false);
    navigate("/login");
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute requiredPermission="dashboard.read">
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute requiredPermission="lead.read">
              <Layout>
                <Leads />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/new"
          element={
            <ProtectedRoute requiredPermission="lead.create">
              <Layout>
                <LeadCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads/:id/edit"
          element={
            <ProtectedRoute requiredPermission="lead.update">
              <Layout>
                <LeadEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermission="user.read">
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <ProtectedRoute requiredPermission="user.create">
              <Layout>
                <UserCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute requiredPermission="user.update">
              <Layout>
                <UserEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute requiredPermission="role.read">
              <Layout>
                <Roles />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/new"
          element={
            <ProtectedRoute requiredPermission="role.create">
              <Layout>
                <RoleCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/:id/edit"
          element={
            <ProtectedRoute requiredPermission="role.update">
              <Layout>
                <RoleEdit />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/leads"
          element={
            <ProtectedRoute requiredPermission="lead.read">
              <Layout>
                <LeadSettings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/industries"
          element={
            <ProtectedRoute requiredRole="Admin">
              <Layout>
                <IndustrySettings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash"
          element={
            <ProtectedRoute>
              <Layout>
                <Trash />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash/users"
          element={
            <ProtectedRoute>
              <Layout>
                <TrashUsers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash/leads"
          element={
            <ProtectedRoute>
              <Layout>
                <TrashLeads />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash/roles"
          element={
            <ProtectedRoute>
              <Layout>
                <TrashRoles />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <TokenExpiryModal isOpen={showExpiryModal} onLogin={handleLoginAgain} />
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
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
              <AppContent />
            </CountsProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
