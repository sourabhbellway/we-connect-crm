import { CheckSquare, DollarSign, Zap } from 'lucide-react';

export type NavItem = {
  id: string;
  name: string;
  href: string;
  icon: any;
  permission?: string;
};

// Add new sidebar entries here; they will appear after Invoices by default
export const NAV_EXTRA_ITEMS: NavItem[] = [
  {
    id: 'task-management',
    name: 'Task Management',
    href: '/task-management',
    icon: CheckSquare,
  },
  {
    id: 'expense-management',
    name: 'Expense',
    href: '/expense-management',
    icon: DollarSign,
  },
  {
    id: 'automation-management',
    name: 'Automation',
    href: '/automation-management',
    icon: Zap,
  },
];
