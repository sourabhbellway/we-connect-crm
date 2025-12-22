import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MenuContextType {
  menuOrder: string[];
  setMenuOrder: (order: string[]) => void;
  resetMenuOrder: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const DEFAULT_MENU_ORDER = [
  'dashboard',
  'leads',
  'deals',
  'quotations',
  'invoices',
  'task-management',
  'expense-management',
  'products',
  'automation-management',
  'trash',
  'business-settings'
];

// Increment this when default order changes so saved orders can be reconciled
const MENU_ORDER_VERSION = 4;

interface MenuProviderProps {
  children: ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [menuOrder, setMenuOrderState] = useState<string[]>(DEFAULT_MENU_ORDER);

  // Load menu order from localStorage on component mount
  useEffect(() => {
    try {
      const savedOrderRaw = localStorage.getItem('menuOrder');
      const savedVersion = Number(localStorage.getItem('menuOrderVersion') || '0');
      const parsedOrder = savedOrderRaw ? JSON.parse(savedOrderRaw) : [];

      let normalized: string[];
      if (Array.isArray(parsedOrder)) {
        // Keep existing known items in their saved order
        normalized = parsedOrder.filter((id: string) => DEFAULT_MENU_ORDER.includes(id));
        // Append any new default items that aren't present
        DEFAULT_MENU_ORDER.forEach((id) => {
          if (!normalized.includes(id)) normalized.push(id);
        });
      } else {
        normalized = [...DEFAULT_MENU_ORDER];
      }

      // If version changed or order invalid, save reconciled order
      if (savedVersion !== MENU_ORDER_VERSION) {
        localStorage.setItem('menuOrderVersion', String(MENU_ORDER_VERSION));
        localStorage.setItem('menuOrder', JSON.stringify(normalized));
      }

      setMenuOrderState(normalized);
    } catch (error) {
      console.error('Failed to parse saved menu order:', error);
      setMenuOrderState(DEFAULT_MENU_ORDER);
    }
  }, []);

  // Save menu order to localStorage whenever it changes
  const setMenuOrder = (order: string[]) => {
    setMenuOrderState(order);
    localStorage.setItem('menuOrder', JSON.stringify(order));
    localStorage.setItem('menuOrderVersion', String(MENU_ORDER_VERSION));
  };

  const resetMenuOrder = () => {
    setMenuOrderState(DEFAULT_MENU_ORDER);
    localStorage.setItem('menuOrder', JSON.stringify(DEFAULT_MENU_ORDER));
    localStorage.setItem('menuOrderVersion', String(MENU_ORDER_VERSION));
  };

  return (
    <MenuContext.Provider value={{ menuOrder, setMenuOrder, resetMenuOrder }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};