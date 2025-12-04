import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, User, Users, DollarSign } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { leadService, Lead } from '../services/leadService';
import { dealService, Deal } from '../services/dealService';

interface ResultItem {
  id: number | string;
  type: 'lead' | 'deal';
  title: string;
  subtitle?: string;
  path: string;
  icon: React.ReactNode;
}

const SimpleHeaderSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const debounced = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Outside click to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch results when typing
  useEffect(() => {
    let active = true;
    const run = async () => {
      const term = debounced.trim();
      if (term.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [lr, dr] = await Promise.all([
          leadService.getLeads({ page: 1, limit: 5, search: term }).catch(() => ({ data: { leads: [] } })),
          dealService.getDeals(1, 5, term).catch(() => ({ data: { deals: [] } })),
        ]);

        if (!active) return;
        const leadItems: ResultItem[] = ((lr as any)?.data?.leads ?? []).map((l: Lead) => ({
          id: l.id,
          type: 'lead',
          title: [l.firstName, l.lastName].filter(Boolean).join(' ') || l.email || `Lead #${l.id}`,
          subtitle: l.email || l.phone || '',
          path: `/leads/${l.id}`,
          icon: <User className="w-4 h-4" />,
        }));
        const dealItems: ResultItem[] = ((dr as any)?.data?.deals ?? []).map((d: Deal) => ({
          id: d.id,
          type: 'deal',
          title: d.title || `Deal #${d.id}`,
          subtitle: d.value != null && d.currency ? `${d.value} ${d.currency}` : d.status,
          path: `/deals/${d.id}`,
          icon: <DollarSign className="w-4 h-4" />,
        }));
        setResults([...leadItems, ...dealItems]);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [debounced]);

  const handleEnter = () => {
    const term = query.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        data-topsearch-input
        type="text"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleEnter();
        }}
        placeholder="Search leads, contacts, deals..."
        className="w-full h-11 pl-11 pr-4 border border-gray-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white dark:bg-slate-800 placeholder-gray-500 dark:placeholder-gray-400"
        style={{ color: '#111827' }}
        autoComplete="off"
        spellCheck={false}
      />
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />

      {open && debounced.trim().length >= 2 && (
        <div className="absolute z-50 mt-2 w-full max-w-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No results</div>
            ) : (
              <ul className="p-1">
                {results.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => navigate(item.path)}
                    >
                      <div className="text-gray-500 dark:text-gray-400">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</div>
                        {item.subtitle && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle}</div>
                        )}
                      </div>
                      <div className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 capitalize">
                        {item.type}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="px-3 py-2 text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800">Press Enter to view full results</div>
        </div>
      )}
    </div>
  );
};

export default SimpleHeaderSearch;
