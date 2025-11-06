import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import { Card, CardHeader, CardContent, PageLoader } from '../../components/ui';
import { BUSINESS_SETTINGS } from '../../constants';
import {
  Building2,
  CreditCard,
  Receipt,
  Users,
  Workflow,
  Package,
  FileText,
  Bell,
  Zap,
  Link,
  Wallet,
  Settings,
  ChevronRight,
  Tag,
} from 'lucide-react';

interface SettingsCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  items: Array<{
    name: string;
    description: string;
    path: string;
  }>;
}

const BusinessSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { companySettings, isLoading } = useBusinessSettings();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const settingsCategories: SettingsCategory[] = [
    {
      id: 'user-management',
      name: 'User Management',
      description: 'Manage users, roles, and permissions for your CRM system',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-emerald-500',
      items: [
        { name: 'Users', description: 'Create, edit, and manage user accounts', path: '/users' },
        { name: 'Roles & Permissions', description: 'Define roles and assign permissions', path: '/roles' },
        { name: 'User Analytics', description: 'User activity and performance metrics', path: '/users/analytics' },
      ],
    },
    {
      id: BUSINESS_SETTINGS.CATEGORIES.COMPANY,
      name: 'Company Information',
      description: 'Basic company details, logo, and contact information',
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-blue-500',
      items: [
        { name: 'Company Profile', description: 'Name, address, logo, GST details', path: '/business-settings/company' },
        { name: 'Fiscal Settings', description: 'Timezone configuration', path: '/business-settings/company/fiscal' },
      ],
    },
    {
      id: BUSINESS_SETTINGS.CATEGORIES.CURRENCY_TAX,
      name: 'Currency & Tax',
      description: 'Currency settings, tax rates, and financial configuration',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-green-500',
      items: [
        { name: 'Currency Settings', description: 'Primary currency, exchange rates', path: '/business-settings/currency' },
        { name: 'Tax Configuration', description: 'GST/VAT rates, tax rules', path: '/business-settings/tax' },
      ],
    },
    {
      id: BUSINESS_SETTINGS.CATEGORIES.LEAD_SOURCES,
      name: 'Lead Sources',
      description: 'Configurable dropdown options for lead sources',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
      items: [
        { name: 'Lead Sources', description: 'Manage lead source options', path: '/business-settings/lead-sources' },
        { name: 'Source Analytics', description: 'Cost per lead, conversion rates', path: '/business-settings/lead-sources/analytics' },
      ],
    },
    {
      id: 'tags',
      name: 'Tags',
      description: 'Manage tags for organizing leads and deals',
      icon: <Tag className="w-6 h-6" />,
      color: 'bg-blue-500',
      items: [
        { name: 'Tags Management', description: 'Create and manage tags', path: '/business-settings/tags' },
      ],
    },
    {
      id: 'industries',
      name: 'Industries',
      description: 'Manage industry options for leads and companies',
      icon: <Building2 className="w-6 h-6" />,
      color: 'bg-green-500',
      items: [
        { name: 'Industries Management', description: 'Create and manage industries', path: '/business-settings/industries' },
      ],
    },
    {
      id: BUSINESS_SETTINGS.CATEGORIES.DEAL_STAGES,
      name: 'Deal Stages & Pipelines',
      description: 'Customizable sales pipelines and deal stages',
      icon: <Workflow className="w-6 h-6" />,
      color: 'bg-orange-500',
      items: [
        { name: 'Sales Pipelines', description: 'Create and manage pipelines', path: '/business-settings/pipelines' },
        { name: 'Deal Stages', description: 'Configure stage probabilities', path: '/business-settings/deal-stages' },
      ],
    },
    {
      id: BUSINESS_SETTINGS.CATEGORIES.PRODUCTS,
      name: 'Product Management',
      description: 'Product categories and price lists',
      icon: <Package className="w-6 h-6" />,
      color: 'bg-indigo-500',
      items: [
        { name: 'Product Categories', description: 'Organize products by categories', path: '/business-settings/product-categories' },
        { name: 'Price Lists', description: 'Manage pricing strategies', path: '/business-settings/price-lists' },
      ],
    },
    {
      id: BUSINESS_SETTINGS.CATEGORIES.TEMPLATES,
      name: 'Document Templates',
      description: 'Quotation, invoice, and email templates',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-red-500',
      items: [
        { name: 'Quotation Templates', description: 'Professional quote layouts', path: '/business-settings/quotation-templates' },
        { name: 'Invoice Templates', description: 'Invoice formats and layouts', path: '/business-settings/invoice-templates' },
        { name: 'Email Templates', description: 'Customize email communications', path: '/business-settings/email-templates' },
      ],
    },
    {
      id: BUSINESS_SETTINGS.CATEGORIES.NOTIFICATIONS,
      name: 'Notification Settings',
      description: 'Email, SMS, and notification preferences',
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-yellow-500',
      items: [
        { name: 'Channel Settings', description: 'Email, SMS, WhatsApp preferences', path: '/business-settings/notifications' },
        { name: 'Notification Rules', description: 'When and how to notify users', path: '/business-settings/notifications/rules' },
      ],
    },
    {
      id: BUSINESS_SETTINGS.CATEGORIES.AUTOMATION,
      name: 'Automation Rules',
      description: 'Workflow automation and triggers',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-pink-500',
      items: [
        { name: 'Workflow Rules', description: 'Automate repetitive tasks', path: '/business-settings/automation' },
        { name: 'Custom Triggers', description: 'Create custom automation rules', path: '/business-settings/automation/custom' },
      ],
    },
    {
      id: BUSINESS_SETTINGS.CATEGORIES.INTEGRATIONS,
      name: 'API & Integrations',
      description: 'WhatsApp, SMS, email gateway, and third-party integrations',
      icon: <Link className="w-6 h-6" />,
      color: 'bg-teal-500',
      items: [
        { name: 'Communication Settings', description: 'Templates, automation, and providers', path: '/business-settings/communication' },
        { name: 'Lead Integrations', description: 'Meta Ads, IndiaMart, TradeIndia integrations', path: '/business-settings/integrations/leads' },
        { name: 'Communication APIs', description: 'WhatsApp, SMS, Email gateways', path: '/business-settings/integrations/communication' },
        { name: 'Third-party Apps', description: 'Zapier, webhooks, custom APIs', path: '/business-settings/integrations/third-party' },
      ],
    },
    {
      id: BUSINESS_SETTINGS.CATEGORIES.PAYMENTS,
      name: 'Payment Gateways',
      description: 'Payment gateway configuration and settings',
      icon: <Wallet className="w-6 h-6" />,
      color: 'bg-cyan-500',
      items: [
        { name: 'Gateway Settings', description: 'Stripe, PayPal, Razorpay setup', path: '/business-settings/payment-gateways' },
        { name: 'Transaction Rules', description: 'Payment processing rules', path: '/business-settings/payment-gateways/rules' },
      ],
    },
  ];

  if (isLoading) {
    return <PageLoader message="Loading business settings..." />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Business Settings
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure your CRM system and business processes
            </p>
          </div>
        </div>
        
        {/* Company Quick Info */}
        {companySettings && (
          <Card variant="GRADIENT" className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {companySettings.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {companySettings.email} • {companySettings.timezone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">GST Number</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {companySettings.gstNumber || 'Not configured'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Settings Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category) => (
          <Card
            key={category.id}
            variant="ELEVATED"
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div className={`p-3 ${category.color} rounded-xl text-white group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {category.description}
                  </p>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                    selectedCategory === category.id ? 'rotate-90' : 'group-hover:translate-x-1'
                  }`}
                />
              </div>
            </CardHeader>
            
            {selectedCategory === category.id && (
              <CardContent className="pt-0">
                <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group/item"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to specific settings page
                        navigate(item.path);
                      }}
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500 group-hover/item:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card variant="OUTLINED">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
              <Receipt className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2" />
              <p className="font-medium text-sm text-gray-900 dark:text-white">Export Settings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Download configuration backup</p>
            </button>
            
            <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group">
              <Package className="w-8 h-8 text-gray-400 group-hover:text-green-500 mb-2" />
              <p className="font-medium text-sm text-gray-900 dark:text-white">Import Settings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Restore from backup file</p>
            </button>
            
            <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group">
              <Settings className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mb-2" />
              <p className="font-medium text-sm text-gray-900 dark:text-white">Reset to Defaults</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Restore default settings</p>
            </button>
            
            <button className="p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all group">
              <Zap className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-2" />
              <p className="font-medium text-sm text-gray-900 dark:text-white">System Health</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Check configuration status</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessSettingsPage;