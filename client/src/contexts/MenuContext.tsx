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
  'expense-management',
  'task-management',
  'automation-management',
  'communication-management',
  'business-settings',
  'trash'
];

interface MenuProviderProps {
  children: ReactNode;
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const [menuOrder, setMenuOrderState] = useState<string[]>(DEFAULT_MENU_ORDER);

  // Load menu order from localStorage on component mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('menuOrder');
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        if (Array.isArray(parsedOrder)) {
          setMenuOrderState(parsedOrder);
        }
      } catch (error) {
        console.error('Failed to parse saved menu order:', error);
      }
    }
  }, []);

  // Save menu order to localStorage whenever it changes
  const setMenuOrder = (order: string[]) => {
    setMenuOrderState(order);
    localStorage.setItem('menuOrder', JSON.stringify(order));
  };

  const resetMenuOrder = () => {
    setMenuOrderState(DEFAULT_MENU_ORDER);
    localStorage.removeItem('menuOrder');
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