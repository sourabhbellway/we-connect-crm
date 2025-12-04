import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Users, FileText, DollarSign, Settings, Home, Package, Receipt, UserPlus, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { UI_CONFIG } from '../constants';

interface SearchResult {
  id: string;
  title: string;
  type: 'lead' | 'contact' | 'deal' | 'user' | 'page' | 'action';
  description?: string;
  path: string;
  icon: React.ReactNode;
  category?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { hasPermission } = useAuth();
  const { t } = useTranslation();

  // Quick actions / pages with categories
  const quickActions: SearchResult[] = [
    // Navigation
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'page',
      description: 'View your CRM overview and statistics',
      path: '/',
      icon: <Home className="w-5 h-5" />,
      category: 'Navigation',
    },
    {
      id: 'leads',
      title: 'Leads',
      type: 'page',
      description: 'Manage and track your leads',
      path: '/leads',
      icon: <FileText className="w-5 h-5" />,
      category: 'Navigation',
    },
    {
      id: 'contacts',
      title: 'Contacts',
      type: 'page',
      description: 'View and manage all contacts',
      path: '/contacts',
      icon: <Users className="w-5 h-5" />,
      category: 'Navigation',
    },
    {
      id: 'deals',
      title: 'Deals',
      type: 'page',
      description: 'Manage deals and sales pipeline',
      path: '/deals',
      icon: <DollarSign className="w-5 h-5" />,
      category: 'Navigation',
    },
    {
      id: 'quotations',
      title: 'Quotations',
      type: 'page',
      description: 'Create and manage quotations',
      path: '/quotations',
      icon: <Package className="w-5 h-5" />,
      category: 'Navigation',
    },
    {
      id: 'invoices',
      title: 'Invoices',
      type: 'page',
      description: 'Manage invoices and payments',
      path: '/invoices',
      icon: <Receipt className="w-5 h-5" />,
      category: 'Navigation',
    },
    // Quick Actions
    {
      id: 'new-lead',
      title: 'Create New Lead',
      type: 'action',
      description: 'Add a new lead to your pipeline',
      path: '/leads/new',
      icon: <FileText className="w-5 h-5" />,
      category: 'Quick Actions',
    },
    {
      id: 'new-contact',
      title: 'Create New Contact',
      type: 'action',
      description: 'Add a new contact',
      path: '/contacts/new',
      icon: <UserPlus className="w-5 h-5" />,
      category: 'Quick Actions',
    },
    {
      id: 'new-deal',
      title: 'Create New Deal',
      type: 'action',
      description: 'Create a new deal opportunity',
      path: '/deals/new',
      icon: <DollarSign className="w-5 h-5" />,
      category: 'Quick Actions',
    },
    // Settings
    {
      id: 'business-settings',
      title: 'Business Settings',
      type: 'page',
      description: 'Configure your CRM settings',
      path: '/business-settings',
      icon: <Settings className="w-5 h-5" />,
      category: 'Settings',
    },
    {
      id: 'company-settings',
      title: 'Company Settings',
      type: 'page',
      description: 'Manage company information',
      path: '/business-settings/company',
      icon: <Building className="w-5 h-5" />,
      category: 'Settings',
    },
    {
      id: 'users',
      title: 'Users',
      type: 'page',
      description: 'Manage user accounts',
      path: '/users',
      icon: <Users className="w-5 h-5" />,
      category: 'Settings',
    },
  ].filter(action => {
    // Filter based on permissions if needed
    return true;
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Load recent searches from localStorage
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      // Enhanced search with better matching
      const filtered = quickActions.filter(
        action => {
          const titleMatch = action.title.toLowerCase().includes(searchTerm);
          const descMatch = action.description?.toLowerCase().includes(searchTerm);
          const categoryMatch = action.category?.toLowerCase().includes(searchTerm);
          
          // Split query into words for better matching
          const words = searchTerm.split(' ');
          const wordMatch = words.some(word => 
            action.title.toLowerCase().includes(word) ||
            action.description?.toLowerCase().includes(word)
          );
          
          return titleMatch || descMatch || categoryMatch || wordMatch;
        }
      );
      
      // Sort results by relevance
      const sorted = filtered.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aStarts = aTitle.startsWith(searchTerm);
        const bStarts = bTitle.startsWith(searchTerm);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
      
      setResults(sorted);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    // Save to recent searches
    const updated = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate
    navigate(result.path);
    
    // Clear query and close
    setQuery('');
    onClose();
  };

  // Group results by category
  const groupedResults = React.useMemo(() => {
    const groups: { [key: string]: SearchResult[] } = {};
    results.forEach(result => {
      const category = result.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(result);
    });
    return groups;
  }, [results]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Modal */}
      <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 animate-fadeInUp">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="search-title">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder', 'Search pages, create new items, or find settings...')}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base"
              autoComplete="off"
              aria-label="Search"
            />
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
              aria-label="Close search"
            >
              <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {query.trim() === '' ? (
              // Show recent searches and quick actions
              <div className="p-3">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <Clock className="w-4 h-4" />
                      {t('search.recent', 'Recent')}
                    </div>
                    {recentSearches.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <div className="text-gray-400">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('search.quickActions', 'Quick Actions')}
                  </div>
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleSelectResult(action)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                    >
                      <div className="text-gray-400">{action.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {action.title}
                        </div>
                        {action.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {action.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length > 0 ? (
              // Show search results grouped by category
              <div className="p-3">
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {category}
                    </div>
                    {items.map((result) => {
                      const itemIndex = results.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                            itemIndex === selectedIndex
                              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                              : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className={itemIndex === selectedIndex ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}>
                            {result.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                              </span>
                              {result.type === 'action' && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                                  Action
                                </span>
                              )}
                            </div>
                            {result.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {result.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              // No results
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t('search.noResults', 'No results found for')} "{query}"</p>
              </div>
            )}
          </div>

          {/* Footer - Keyboard shortcuts help */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-xs font-mono shadow-sm">↑↓</kbd>
                {t('search.navigate', 'Navigate')}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-xs font-mono shadow-sm">↵</kbd>
                {t('search.select', 'Select')}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-xs font-mono shadow-sm">esc</kbd>
                {t('search.close', 'Close')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalSearch;
