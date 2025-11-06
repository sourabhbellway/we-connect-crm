import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Search as SearchIcon, User, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { leadService, Lead } from '../services/leadService';
import { dealService, Deal } from '../services/dealService';

export type SearchType = 'all' | 'leads' | 'deals';

interface HeaderSearchProps {
  className?: string;
}

export interface HeaderSearchRef {
  focus: () => void;
}

interface ResultItem {
  id: number | string;
  type: 'lead' | 'deal';
  title: string;
  subtitle?: string;
  path: string;
  icon: React.ReactNode;
}

const TYPE_TABS: Array<{ key: SearchType; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'leads', label: 'Leads' },
  { key: 'deals', label: 'Deals' },
];

const HeaderSearch = forwardRef<HeaderSearchRef, HeaderSearchProps>(({ className = '' }, ref) => {
  const [type, setType] = useState<SearchType>('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const q = debouncedQuery.trim();
        const allResults: ResultItem[] = [];

        const fetchLeads = async () => {
          try {
            const res = await leadService.getLeads({ page: 1, limit: 5, search: q });
            const list: Lead[] = (res?.data?.leads ?? res?.data?.items ?? res?.leads ?? res?.items ?? []) as any;
            return (list || []).slice(0, 5).map((l) => ({
              id: l.id,
              type: 'lead' as const,
              title: [l.firstName, l.lastName].filter(Boolean).join(' ') || l.email || `Lead #${l.id}`,
              subtitle: l.email || l.phone || '',
              path: `/leads/${l.id}`,
              icon: <User className="w-4 h-4" />,
            } satisfies ResultItem));
          } catch {
            return [] as ResultItem[];
          }
        };

        const fetchDeals = async () => {
          try {
            const res = await dealService.getDeals(1, 5, q);
            const list: Deal[] = res?.data?.deals ?? [];
            return (list || []).slice(0, 5).map((d) => ({
              id: d.id,
              type: 'deal' as const,
              title: d.title || `Deal #${d.id}`,
              subtitle: d.value != null && d.currency ? `${d.value} ${d.currency}` : d.status,
              path: `/deals/${d.id}`,
              icon: <DollarSign className="w-4 h-4" />,
            } satisfies ResultItem));
          } catch {
            return [] as ResultItem[];
          }
        };

        let data: ResultItem[] = [];
        if (type === 'all') {
          const [a, b] = await Promise.all([fetchLeads(), fetchDeals()]);
          data = [...a, ...b];
        } else if (type === 'leads') {
          data = await fetchLeads();
        } else if (type === 'deals') {
          data = await fetchDeals();
        }

        if (!active) return;
        setResults(data);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [debouncedQuery, type]);

  const onSelect = (item: ResultItem) => {
    navigate(item.path);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Type tabs + search input */}
      <div className="flex items-center gap-2">
        {/* Type selector */}
        <div className="hidden sm:flex items-center bg-gray-100 dark:bg-slate-800 rounded-full p-1">
          {TYPE_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                type === t.key
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex-1 min-w-[200px] w-full max-w-xl">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onFocus={() => setOpen(true)}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${type === 'all' ? 'everything' : type}...`}
              className="w-full h-11 pl-9 pr-4 border border-gray-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Results dropdown */}
      {open && (debouncedQuery.trim().length > 0) && (
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
                      onClick={() => onSelect(item)}
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
        </div>
      )}
    </div>
  );
});

HeaderSearch.displayName = 'HeaderSearch';

export default HeaderSearch;
