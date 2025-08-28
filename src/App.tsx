import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Leads from "./components/Leads";
import LeadCreate from "./components/LeadCreate";
import LeadEdit from "./components/LeadEdit";
import Users from "./components/Users";
import Roles from "./components/Roles";
import LeadSettings from "./components/LeadSettings";
import IndustrySettings from "./components/IndustrySettings";
import Profile from "./components/Profile";
import TokenExpiryModal from "./components/TokenExpiryModal";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://31.97.233.21:8081/api";

// console.log("API_BASE_URL", API_BASE_URL);

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
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
