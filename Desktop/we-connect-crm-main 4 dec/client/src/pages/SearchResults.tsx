import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, User, Users, DollarSign } from 'lucide-react';
import { leadService, Lead } from '../services/leadService';
import { dealService, Deal } from '../services/dealService';

const SearchResults: React.FC = () => {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const leadPromise = q ? leadService.getLeads({ page: 1, limit: 10, search: q }) : Promise.resolve({ data: { leads: [] } });
        const dealPromise = q ? dealService.getDeals(1, 10, q) : Promise.resolve({ data: { deals: [] } });

        const [lr, dr] = await Promise.all([
          leadPromise.catch(() => ({ data: { leads: [] } })),
          dealPromise.catch(() => ({ data: { deals: [] } })),
        ]);

        if (!active) return;
        setLeads((lr as any)?.data?.leads ?? (lr as any)?.data?.items ?? []);
        setDeals((dr as any)?.data?.deals ?? []);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => { active = false; };
  }, [q]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-500" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Search results</h1>
        {q && <span className="text-gray-500">for "{q}"</span>}
      </div>

      {loading && (
        <div className="text-gray-500">Searching...</div>
      )}

      {!loading && !q && (
        <div className="text-gray-500">Type a search above and press Enter.</div>
      )}

      {!loading && q && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leads */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Leads</h2>
              <span className="ml-auto text-xs text-gray-500">{leads.length}</span>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-slate-800">
              {leads.map(l => (
                <li key={l.id}>
                  <Link to={`/leads/${l.id}`} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{[l.firstName, l.lastName].filter(Boolean).join(' ') || l.email || `Lead #${l.id}`}</div>
                    <div className="text-xs text-gray-500">{l.email || l.phone || ''}</div>
                  </Link>
                </li>
              ))}
              {leads.length === 0 && (
                <li className="px-4 py-6 text-sm text-gray-500">No leads found</li>
              )}
            </ul>
          </div>

          {/* Deals */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Deals</h2>
              <span className="ml-auto text-xs text-gray-500">{deals.length}</span>
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-slate-800">
              {deals.map(d => (
                <li key={d.id}>
                  <Link to={`/deals/${d.id}`} className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{d.title || `Deal #${d.id}`}</div>
                    <div className="text-xs text-gray-500">{d.value != null && d.currency ? `${d.value} ${d.currency}` : d.status}</div>
                  </Link>
                </li>
              ))}
              {deals.length === 0 && (
                <li className="px-4 py-6 text-sm text-gray-500">No deals found</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
