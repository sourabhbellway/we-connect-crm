import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessSettings } from '../../contexts/BusinessSettingsContext';
import { Card, CardHeader, CardContent, PageLoader } from '../../components/ui';
import { BUSINESS_SETTINGS } from '../../constants';
import {
    Building2,
    CreditCard,
    Users,
    Workflow,
    FileText,
    Bell,
    Link,
    Settings,
    ChevronRight,
    Tag,
    BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PERMISSIONS as PERMS } from '../../constants';

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
        permission?: string;
    }>;
}

const BusinessSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { companySettings, isLoading } = useBusinessSettings();
    const { hasPermission } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const settingsCategories: SettingsCategory[] = [
        {
            id: 'user-management',
            name: 'User Management',
            description: 'Manage users, roles, and permissions for your CRM system',
            icon: <Users className="w-6 h-6" />,
            color: 'bg-emerald-500',
            items: [
                { name: 'Users', description: 'Create, edit, and manage user accounts', path: '/users', permission: PERMS.USER.READ },
                { name: 'Roles & Permissions', description: 'Define roles and assign permissions', path: '/roles', permission: PERMS.ROLE.READ },
                { name: 'Teams', description: 'Manage teams and reporting structures', path: '/business-settings/teams', permission: PERMS.TEAM.READ },
            ],
        },
        {
            id: BUSINESS_SETTINGS.CATEGORIES.COMPANY,
            name: 'Company Information',
            description: 'Basic company details, logo, and contact information',
            icon: <Building2 className="w-6 h-6" />,
            color: 'bg-blue-500',
            items: [
                { name: 'Company Profile', description: 'Name, address, logo, GST details', path: '/business-settings/company', permission: PERMS.BUSINESS_SETTINGS.COMPANY.READ },
            ],
        },
        {
            id: BUSINESS_SETTINGS.CATEGORIES.CURRENCY_TAX,
            name: 'Currency & Tax',
            description: 'Currency settings, tax rates, and financial configuration',
            icon: <CreditCard className="w-6 h-6" />,
            color: 'bg-green-500',
            items: [
                { name: 'Currency Settings', description: 'Primary currency, exchange rates', path: '/business-settings/currency', permission: PERMS.BUSINESS_SETTINGS.CURRENCY.READ },
            ],
        },
        {
            id: BUSINESS_SETTINGS.CATEGORIES.LEAD_SOURCES,
            name: 'Lead Sources',
            description: 'Configurable dropdown options for lead sources',
            icon: <Users className="w-6 h-6" />,
            color: 'bg-purple-500',
            items: [
                { name: 'Lead Sources', description: 'Manage lead source options', path: '/business-settings/lead-sources', permission: PERMS.BUSINESS_SETTINGS.LEAD_SOURCE.READ },
                { name: 'Lead Form Fields', description: 'Configure lead form fields - add, hide, show, make required', path: '/business-settings/lead-fields', permission: PERMS.BUSINESS_SETTINGS.FIELD_CONFIG.READ },
            ],
        },
        {
            id: 'tags',
            name: 'Tags',
            description: 'Manage tags for organizing leads and deals',
            icon: <Tag className="w-6 h-6" />,
            color: 'bg-blue-500',
            items: [
                { name: 'Tags Management', description: 'Create and manage tags', path: '/business-settings/tags', permission: PERMS.TAG.READ },
            ],
        },
        {
            id: 'product-config',
            name: 'Product Configuration',
            description: 'Configure product categories and measurement units',
            icon: <BarChart3 className="w-6 h-6" />,
            color: 'bg-green-500',
            items: [
                { name: 'Product Categories', description: 'Create and manage product categories', path: '/business-settings/product-categories', permission: PERMS.PRODUCT_CATEGORY.READ },
                { name: 'Unit Types', description: 'Manage measurement units for products', path: '/business-settings/unit-types', permission: PERMS.UNIT_TYPE.READ },
            ],
        },
        {
            id: 'industries',
            name: 'Industries',
            description: 'Manage industry options for leads and companies',
            icon: <Building2 className="w-6 h-6" />,
            color: 'bg-green-500',
            items: [
                { name: 'Industries Management', description: 'Create and manage industries', path: '/business-settings/industries', permission: PERMS.INDUSTRY.READ },
            ],
        },
        {
            id: BUSINESS_SETTINGS.CATEGORIES.LEAD_STATUSES,
            name: 'Lead Statuses',
            description: 'Customizable lead statuses for your pipeline',
            icon: <Workflow className="w-6 h-6" />,
            color: 'bg-blue-500',
            items: [
                { name: 'Lead Status Management', description: 'Configure dynamic lead statuses', path: '/business-settings/lead-statuses', permission: PERMS.BUSINESS_SETTINGS.DEAL_STATUS.READ },
            ],
        },
        {
            id: 'deal-stages',
            name: 'Deal Stages',
            description: 'Customizable deal stages for your sales pipeline',
            icon: <Workflow className="w-6 h-6" />,
            color: 'bg-orange-500',
            items: [
                { name: 'Deal Stage Management', description: 'Configure dynamic deal stages', path: '/business-settings/deal-stages', permission: PERMS.BUSINESS_SETTINGS.DEAL_STATUS.READ },
            ],
        },

        {
            id: BUSINESS_SETTINGS.CATEGORIES.TEMPLATES,
            name: 'Document Templates',
            description: 'Quotation, invoice, and email templates',
            icon: <FileText className="w-6 h-6" />,
            color: 'bg-red-500',
            items: [
                { name: 'Invoice Templates', description: 'Invoice formats and layouts', path: '/business-settings/invoice-templates', permission: PERMS.BUSINESS_SETTINGS.TEMPLATES.EMAIL.READ }, // Assuming email templates for now
                { name: 'Document Numbering', description: 'Configure prefixes, suffixes, and numbering formats', path: '/business-settings/numbering', permission: PERMS.BUSINESS_SETTINGS.NUMBERING.READ },
                { name: 'Terms & Conditions', description: 'Legal terms and conditions templates', path: '/business-settings/terms-and-conditions', permission: PERMS.BUSINESS_SETTINGS.TEMPLATES.TERMS.READ },
            ],
        },
        {
            id: BUSINESS_SETTINGS.CATEGORIES.NOTIFICATIONS,
            name: 'Notification Settings',
            description: 'Email, SMS, and notification preferences',
            icon: <Bell className="w-6 h-6" />,
            color: 'bg-yellow-500',
            items: [
                { name: 'Channel Settings', description: 'Email, SMS, WhatsApp preferences', path: '/business-settings/notifications', permission: PERMS.NOTIFICATION.READ },
            ],
        },

        {
            id: BUSINESS_SETTINGS.CATEGORIES.INTEGRATIONS,
            name: 'API & Integrations',
            description: 'WhatsApp, SMS, email gateway, and third-party integrations',
            icon: <Link className="w-6 h-6" />,
            color: 'bg-teal-500',
            items: [
                { name: 'Communication Settings', description: 'Templates', path: '/business-settings/communication', permission: PERMS.COMMUNICATION.READ },
                { name: 'Lead Integrations', description: 'Meta Ads, IndiaMart, TradeIndia integrations', path: '/business-settings/integrations/leads', permission: PERMS.BUSINESS_SETTINGS.INTEGRATIONS.READ },
                { name: 'Communication APIs', description: 'WhatsApp, SMS, Email gateways', path: '/business-settings/integrations/communication', permission: PERMS.BUSINESS_SETTINGS.INTEGRATIONS.READ },
            ],
        },

    ];

    // Filter categories and items based on permissions
    const accessibleCategories = settingsCategories
        .map(category => ({
            ...category,
            items: category.items.filter(item => !item.permission || hasPermission(item.permission))
        }))
        .filter(category => category.items.length > 0);

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
                {accessibleCategories.map((category) => (
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
                                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${selectedCategory === category.id ? 'rotate-90' : 'group-hover:translate-x-1'
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


        </div>
    );
};

export default BusinessSettingsPage;
