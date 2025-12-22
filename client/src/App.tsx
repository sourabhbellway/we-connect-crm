import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CountsProvider } from "./contexts/CountsContext";
import { BusinessSettingsProvider } from "./contexts/BusinessSettingsContext";
import { MenuProvider } from "./contexts/MenuContext";
import { LoaderProvider } from "./contexts/LoaderContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { MainLayout } from "./layouts";
import { BusinessSettingsPage } from "./pages";
import TeamsPage from './pages/business-settings/TeamsPage';
import CompanySettingsPage from "./pages/business-settings/CompanySettingsPage";
import CurrencyTaxSettingsPage from "./pages/business-settings/CurrencyTaxSettingsPage";
import LeadSourcesPage from "./pages/business-settings/LeadSourcesPage";
import LeadFieldsSettingsPage from "./pages/business-settings/LeadFieldsSettingsPage";
import TagsPage from "./pages/business-settings/TagsPage";
import IndustriesPage from "./pages/business-settings/IndustriesPage";
import LeadStatusesPage from "./pages/business-settings/DealStagesPage";
import CommunicationPage from "./pages/business-settings/CommunicationPage";
import CommunicationAPIPage from "./pages/business-settings/CommunicationAPIPage";
import QuotationTemplatesPage from "./pages/business-settings/QuotationTemplatesPage";
import InvoiceTemplatesPage from './pages/business-settings/InvoiceTemplatesPage';
import NumberingSettingsPage from "./pages/business-settings/NumberingSettingsPage";
import TermsAndConditionsPage from "./pages/business-settings/TermsAndConditionsPage";
import { NotificationPreferencesPage } from "./pages/business-settings/NotificationPreferencesPage";
import DashboardSettingsPage from "./pages/business-settings/DashboardSettingsPage";
import UnitTypesPage from "./pages/business-settings/UnitTypesPage";
import ProductCategoriesPage from "./pages/business-settings/ProductCategoriesPage";
import QuotationsPage from "./pages/quotations/QuotationsPage";
import CreateQuotationPage from "./pages/quotations/CreateQuotationPage";
import QuotationDetailPage from "./pages/quotations/QuotationDetailPage";
import InvoicesPage from "./pages/invoices/InvoicesPage";
import CreateInvoicePage from "./pages/invoices/CreateInvoicePage";
import { PERMISSIONS, TOAST_CONFIG } from "./constants";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Leads from "./components/Leads";
import LeadCreate from "./components/LeadCreate";
import LeadEdit from "./components/LeadEdit";
import LeadProfile from "./components/LeadProfile";
import Deals from "./components/Deals";
import DealProfile from "./components/deal/DealProfileEnhanced";
import DealCreate from "./components/DealCreate";
import DealEdit from "./components/DealEdit";
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
import IntegrationSettings from "./components/IntegrationSettings";
import LeadSettings from "./components/LeadSettings";
import Profile from "./components/Profile";
import Products from "./components/Products";
import ReportsPage from "./pages/reports/ReportsPage";
import TaskReportPage from "./pages/reports/TaskReportPage";
import LeadReportPage from "./pages/reports/LeadReportPage";
import DealReportPage from "./pages/reports/DealReportPage";
import ExpenseReportPage from "./pages/reports/ExpenseReportPage";
import InvoiceReportPage from "./pages/reports/InvoiceReportPage";
import QuotationReportPage from "./pages/reports/QuotationReportPage";
import TokenExpiryModal from "./components/TokenExpiryModal";
import ErrorBoundary from "./components/ErrorBoundary";
import SearchResults from "./pages/SearchResults";
import TasksPage from "./pages/tasks/TasksPage";
import TaskDetailPage from "./pages/tasks/TaskDetailPage";
import ExpensesPage from "./pages/expenses/ExpensesPage";
import AutomationManagementPage from "./pages/automation/AutomationManagementPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppContent() {
  const { error, isAuthenticated, isBootstrapping } = useAuth();
  const navigate = useNavigate();
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryTitle, setExpiryTitle] = useState<string | undefined>(undefined);
  const [expiryMessage, setExpiryMessage] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (error === "Session expired. Please login again.") {
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
    navigate("/login");
  };

  // Show loading spinner only during initial auth bootstrap
  if (isBootstrapping) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
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

  return (
    <>
      {isAuthenticated ? (
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD.READ}>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
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
              <ProtectedRoute requiredPermission="lead.create">
                <MainLayout>
                  <LeadCreate />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads/:id/edit"
            element={
              <ProtectedRoute requiredPermission="lead.update">
                <MainLayout>
                  <LeadEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads/:id"
            element={
              <ProtectedRoute requiredPermission="lead.read">
                <MainLayout>
                  <LeadProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DEAL.READ}>
                <MainLayout>
                  <Deals />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals/new"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DEAL.CREATE}>
                <MainLayout>
                  <DealCreate />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals/:id/edit"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DEAL.UPDATE}>
                <MainLayout>
                  <DealEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals/:id"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DEAL.READ}>
                <MainLayout>
                  <DealProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SearchResults />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.QUOTATION.READ}>
                <MainLayout>
                  <QuotationsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/:id"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.QUOTATION.READ}>
                <MainLayout>
                  <QuotationDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/new"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.QUOTATION.CREATE}>
                <MainLayout>
                  <CreateQuotationPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations/edit/:id"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.QUOTATION.UPDATE}>
                <MainLayout>
                  <CreateQuotationPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.INVOICE.READ}>
                <MainLayout>
                  <InvoicesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/new"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.INVOICE.CREATE}>
                <MainLayout>
                  <CreateInvoicePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/edit/:id"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.INVOICE.UPDATE}>
                <MainLayout>
                  <CreateInvoicePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute requiredPermission="product.read">
                <MainLayout>
                  <Products />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute requiredPermission="product.create">
                <MainLayout>
                  <div>Product Create Form - Coming Soon</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute requiredPermission="product.update">
                <MainLayout>
                  <div>Product Edit Form - Coming Soon</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/task-management"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TasksPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.ACTIVITY.READ}>
                <MainLayout>
                  <TaskDetailPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.ACTIVITY.READ}>
                <MainLayout>
                  <ActivitiesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/expense-management"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.EXPENSE.READ}>
                <MainLayout>
                  <ExpensesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/automation-management"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.AUTOMATION.READ}>
                <MainLayout>
                  <AutomationManagementPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredPermission="user.read">
                <MainLayout>
                  <Users />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <ProtectedRoute requiredPermission="user.create">
                <MainLayout>
                  <UserCreate />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <ProtectedRoute requiredPermission="user.update">
                <MainLayout>
                  <UserEdit />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute requiredPermission="role.read">
                <MainLayout>
                  <Roles />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles/new"
            element={
              <ProtectedRoute requiredPermission="role.create">
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
          <Route
            path="/business-settings/teams"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TeamsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/company"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CompanySettingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/currency"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CurrencyTaxSettingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/business-settings/lead-sources"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LeadSourcesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/lead-fields"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.BUSINESS_SETTINGS.READ}>
                <MainLayout>
                  <LeadFieldsSettingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
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
            path="/business-settings/tags"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TagsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/industries"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <IndustriesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/unit-types"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <UnitTypesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/product-categories"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ProductCategoriesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/lead-statuses"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LeadStatusesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/business-settings/communication"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CommunicationPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/integrations/communication"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CommunicationAPIPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/notifications"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NotificationPreferencesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/integrations/leads"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.LEAD.CREATE}>
                <MainLayout>
                  <IntegrationSettings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/quotation-templates"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <QuotationTemplatesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/invoice-templates"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <InvoiceTemplatesPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/numbering"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NumberingSettingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/terms-and-conditions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <TermsAndConditionsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD.READ}>
                <MainLayout>
                  <ReportsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/tasks"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD.READ}>
                <MainLayout>
                  <TaskReportPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/leads"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD.READ}>
                <MainLayout>
                  <LeadReportPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/deals"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD.READ}>
                <MainLayout>
                  <DealReportPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/expenses"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD.READ}>
                <MainLayout>
                  <ExpenseReportPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/invoices"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD.READ}>
                <MainLayout>
                  <InvoiceReportPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/quotations"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD.READ}>
                <MainLayout>
                  <QuotationReportPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-settings/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardSettingsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
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
          <Route
            path="/tasks"
            element={
              <ProtectedRoute requiredPermission={PERMISSIONS.ACTIVITY.READ}>
                <MainLayout>
                  <TasksPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Login />
      )}

      {isAuthenticated && (
        <TokenExpiryModal
          isOpen={showExpiryModal}
          onLogin={handleLoginAgain}
          title={expiryTitle}
          message={expiryMessage}
        />
      )}

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
            <LoaderProvider>
              <CountsProvider>
                <BusinessSettingsProvider>
                  <MenuProvider>
                    <AppContent />
                  </MenuProvider>
                </BusinessSettingsProvider>
              </CountsProvider>
            </LoaderProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
