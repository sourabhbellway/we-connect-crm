import { CheckSquare, DollarSign, Zap, Package, BarChart3 } from 'lucide-react';
import { PERMISSIONS } from '../constants';

export type NavItem = {
  id: string;
  name: string;
  href: string;
  icon: any;
  permission?: string;
  children?: NavItem[];
};

// Add new sidebar entries here; they will appear after Invoices by default
export const NAV_EXTRA_ITEMS: NavItem[] = [
  {
    id: 'task-management',
    name: 'Task Management',
    href: '/task-management',
    icon: CheckSquare,
    permission: PERMISSIONS.ACTIVITY.READ,
  },
  {
    id: 'expense-management',
    name: 'Expense',
    href: '/expense-management',
    icon: DollarSign,
    permission: PERMISSIONS.EXPENSE.READ,
  },
  {
    id: 'reports',
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    permission: PERMISSIONS.DASHBOARD.READ,
    children: [
      {
        id: 'report-tasks',
        name: 'Task Report',
        href: '/reports/tasks',
        icon: BarChart3,
        permission: PERMISSIONS.DASHBOARD.READ,
      },
      {
        id: 'report-leads',
        name: 'Lead Report',
        href: '/reports/leads',
        icon: BarChart3,
        permission: PERMISSIONS.DASHBOARD.READ,
      },
      {
        id: 'report-deals',
        name: 'Deal Report',
        href: '/reports/deals',
        icon: BarChart3,
        permission: PERMISSIONS.DASHBOARD.READ,
      },
      {
        id: 'report-expenses',
        name: 'Expense Report',
        href: '/reports/expenses',
        icon: BarChart3,
        permission: PERMISSIONS.DASHBOARD.READ,
      },
      {
        id: 'report-invoices',
        name: 'Invoice Report',
        href: '/reports/invoices',
        icon: BarChart3,
        permission: PERMISSIONS.DASHBOARD.READ,
      },
      {
        id: 'report-quotations',
        name: 'Quotation Report',
        href: '/reports/quotations',
        icon: BarChart3,
        permission: PERMISSIONS.DASHBOARD.READ,
      }
    ]
  },
  {
    id: 'products',
    name: 'Products',
    href: '/products',
    icon: Package,
    permission: 'product.read',
  },
  {
    id: 'automation-management',
    name: 'Automation',
    href: '/automation-management',
    icon: Zap,
    permission: PERMISSIONS.AUTOMATION.READ,
  },
  // {
  //   id: 'trash',
  //   name: 'Trash',
  //   href: '/trash',
  //   icon: Trash2,
  //   permission: 'deleted.read',
  // },
];
