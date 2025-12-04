import React, { useState } from 'react';
import { ChevronDown, Plus, Zap } from 'lucide-react';
import { UI_CONFIG } from '../../constants';
import Button from './Button';

interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  hasDropdown?: boolean;
  active?: boolean;
}

interface UserProfile {
  name: string;
  avatar: string;
  email?: string;
}

interface HeaderProps {
  logo?: React.ReactNode;
  logoText?: string;
  menuItems?: MenuItem[];
  user?: UserProfile;
  onUpgrade?: () => void;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  logo,
  logoText = 'weconnect',
  menuItems = [
    { label: 'Home', active: true },
    { label: 'Products', hasDropdown: true },
    { label: 'Integrations', hasDropdown: true },
    { label: 'Pricing' }
  ],
  user,
  onUpgrade,
  className = ''
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (itemLabel: string) => {
    setActiveDropdown(activeDropdown === itemLabel ? null : itemLabel);
  };

  return (
    <header className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-full px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            {logo ? (
              logo
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-weconnect-red flex items-center justify-center text-white font-bold text-sm">
                  W
                </div>
                <span className="text-xl font-bold text-gray-900">{logoText}</span>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <div key={index} className="relative">
                <button
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                    item.active 
                      ? 'text-weconnect-red bg-red-50' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (item.hasDropdown) {
                      toggleDropdown(item.label);
                    } else if (item.onClick) {
                      item.onClick();
                    }
                  }}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 ml-1" />
                    </div>
                  )}
                </button>
                
                {/* Dropdown Menu - Add actual dropdown content as needed */}
                {item.hasDropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Dropdown content for {item.label}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section - Upgrade Button and User Profile */}
          <div className="flex items-center space-x-4">
            {/* Upgrade Button */}
            {onUpgrade && (
              <Button
                variant="OUTLINE"
                size="SM"
                onClick={onUpgrade}
                icon={<Zap className="w-4 h-4" />}
                className="text-gray-700 border-gray-300 hover:border-gray-400"
              >
                Upgrade account
              </Button>
            )}

            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ef444e&color=fff`;
                  }}
                />
                <div className="hidden lg:block">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  {user.email && (
                    <div className="text-xs text-gray-500">{user.email}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-6 py-4 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                item.active 
                  ? 'text-weconnect-red bg-red-50' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={item.onClick}
            >
              <div className="flex items-center justify-between">
                <span>{item.label}</span>
                {item.hasDropdown && <Plus className="w-4 h-4" />}
              </div>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;