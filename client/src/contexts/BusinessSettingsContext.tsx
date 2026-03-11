import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { businessSettingsService } from "../features/business-settings/services/businessSettingsService";
import { useAuth } from "./AuthContext";
import {
  BusinessSettings,
  CompanySettings,
  CurrencySettings,
  TaxSettings,
  LeadSource,
  LeadStatus,
  DealStatus,
  
} from "../features/business-settings/types";
import { DEFAULT_BUSINESS_SETTINGS } from "../constants";
import { toast } from "react-toastify";

interface BusinessSettingsContextType {
  // Data
  businessSettings: BusinessSettings | null;
  companySettings: CompanySettings | null;
  currencySettings: CurrencySettings | null;
  taxSettings: TaxSettings | null;
  leadSources: LeadSource[];
  leadStatuses: LeadStatus[]; // This is now used for Call Outcomes
  leadStatusOptions: any[]; // New dynamic lead status stages
  dealStatuses: DealStatus[];
  isLoading: boolean;
  isInitialized: boolean;

  // Methods
  refreshBusinessSettings: () => Promise<void>;
  updateCompanySettings: (data: Partial<CompanySettings>) => Promise<void>;
  updateCurrencySettings: (data: Partial<CurrencySettings>) => Promise<void>;
  updateTaxSettings: (data: Partial<TaxSettings>) => Promise<void>;

  // Lead Sources
  addLeadSource: (data: Omit<LeadSource, "id">) => Promise<void>;
  updateLeadSource: (id: string, data: Partial<LeadSource>) => Promise<void>;
  deleteLeadSource: (id: string) => Promise<void>;
  reorderLeadSources: (sourceIds: string[]) => Promise<void>;

  // Call Outcomes (previously leadStatuses)
  getCallOutcomes: () => LeadStatus[];
  addCallOutcome: (data: Omit<LeadStatus, "id">) => Promise<void>;
  updateCallOutcome: (id: string, data: Partial<LeadStatus>) => Promise<void>;
  deleteCallOutcome: (id: string) => Promise<void>;
  addLeadStatus: (data: Omit<LeadStatus, "id">) => Promise<void>;
  updateLeadStatus: (id: string, data: Partial<LeadStatus>) => Promise<void>;
  deleteLeadStatus: (id: string) => Promise<void>;

  // Lead Status Stages (New)
  getLeadStatusOptions: () => any[];
  updateLeadStatusOption: (id: string, data: any) => Promise<void>;

  // Deal Statuses (Dynamic)
  getDealStages: () => DealStatus[]; // Renamed from getDealStages but kept for BC/Compatibility
  addDealStatus: (data: Omit<DealStatus, "id">) => Promise<void>;
  updateDealStatus: (id: string, data: Partial<DealStatus>) => Promise<void>;
  deleteDealStatus: (id: string) => Promise<void>;

  // Utility Methods
  formatCurrency: (amount: number | undefined | null, currency?: string) => string;
  calculateTax: (amount: number, rate?: number) => number;
  getCurrency: () => string;
  getLeadSourceById: (id: string) => LeadSource | null;
  getLeadStatusById: (id: string) => LeadStatus | null;
  getDealStatusById: (id: string) => DealStatus | null;
}

const BusinessSettingsContext = createContext<BusinessSettingsContextType | undefined>(undefined);

interface BusinessSettingsProviderProps {
  children: ReactNode;
}

export const BusinessSettingsProvider: React.FC<BusinessSettingsProviderProps> = ({ children }) => {
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings | null>(null);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>([]);
  const [leadStatusOptions, setLeadStatusOptions] = useState<any[]>([]);
  const [dealStatuses, setDealStatuses] = useState<DealStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize business settings only when authenticated
  const { isAuthenticated } = useAuth();

  const initializeBusinessSettings = async () => {
    try {
      setIsLoading(true);

      // Try to load all settings at once
      try {
        const response = await businessSettingsService.getAllBusinessSettings();
        const data = response.data;
        if (data) {
          setBusinessSettings(data);
          setCompanySettings(
            data.company || (DEFAULT_BUSINESS_SETTINGS.company as CompanySettings)
          );
          setCurrencySettings(
            data.currency || (DEFAULT_BUSINESS_SETTINGS.currency as CurrencySettings)
          );
          setTaxSettings(data.tax || (DEFAULT_BUSINESS_SETTINGS.tax as TaxSettings));
          setLeadSources(data.leadSources || []);
          setLeadStatuses(data.leadStatuses || []);
          setLeadStatusOptions(data.leadStatusOptions || []); // Fetched from backend
          setDealStatuses(data.dealStatuses || []);
        }
      } catch (error) {
        console.error("Failed to load all settings, falling back to individual calls", error);
        await loadSettingsIndividually();
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize business settings:", error);

      // Set defaults if everything fails
      setCompanySettings(DEFAULT_BUSINESS_SETTINGS.company as CompanySettings);
      setCurrencySettings(DEFAULT_BUSINESS_SETTINGS.currency as CurrencySettings);
      setTaxSettings(DEFAULT_BUSINESS_SETTINGS.tax as TaxSettings);
      setLeadSources(
        DEFAULT_BUSINESS_SETTINGS.leadSources.map((name, index) => ({
          id: `default-${index}`,
          name,
          description: "",
          color: "#6B7280",
          isActive: true,
          sortOrder: index,
        }))
      );
      setLeadStatuses([]);
      setDealStatuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettingsIndividually = async () => {
    const promises = [
      businessSettingsService.getCompanySettings().then((r) => setCompanySettings(r.data)),
      businessSettingsService.getCurrencySettings().then((r) => setCurrencySettings(r.data)),
      businessSettingsService.getTaxSettings().then((r) => setTaxSettings(r.data)),
      businessSettingsService.getLeadSources().then((r) => setLeadSources(r.data)),
      businessSettingsService.getLeadStatuses().then((r) => setLeadStatuses(r.data)),
      businessSettingsService.getFieldConfigs("lead").then((r: any) => {
        const statusField = r.data?.find((f: any) => f.fieldName === "status");
        setLeadStatusOptions(statusField?.options || []);
      }),
      businessSettingsService.getDealStatuses().then((r) => setDealStatuses(r.data)),
    ];

    await Promise.allSettled(promises);
  };

  useEffect(() => {
    if (isAuthenticated) {
      initializeBusinessSettings();
    }
  }, [isAuthenticated]);

  const refreshBusinessSettings = async () => {
    await initializeBusinessSettings();
  };

  const updateCompanySettings = async (data: Partial<CompanySettings>) => {
    try {
      const response = await businessSettingsService.updateCompanySettings(data);
      setCompanySettings(response.data);
      toast.success("Company settings updated successfully");
    } catch (error) {
      console.error("Failed to update company settings:", error);
      toast.error("Failed to update company settings");
      throw error;
    }
  };

  const updateCurrencySettings = async (data: Partial<CurrencySettings>) => {
    try {
      const response = await businessSettingsService.updateCurrencySettings(data);
      setCurrencySettings(response.data);
      toast.success("Currency settings updated successfully");
    } catch (error) {
      console.error("Failed to update currency settings:", error);
      toast.error("Failed to update currency settings");
      throw error;
    }
  };

  const updateTaxSettings = async (data: Partial<TaxSettings>) => {
    try {
      const response = await businessSettingsService.updateTaxSettings(data);
      setTaxSettings(response.data);
      toast.success("Tax settings updated successfully");
    } catch (error) {
      console.error("Failed to update tax settings:", error);
      toast.error("Failed to update tax settings");
      throw error;
    }
  };

  // Lead Sources Methods
  const addLeadSource = async (data: Omit<LeadSource, "id">) => {
    try {
      const response = await businessSettingsService.createLeadSource(data as any);
      const created = (response.data || response) as LeadSource;
      setLeadSources((prev) => [...prev, created]);
      toast.success("Lead source added successfully");
    } catch (error) {
      console.error("Failed to add lead source:", error);
      toast.error("Failed to add lead source");
      throw error;
    }
  };

  const updateLeadSource = async (id: string, data: Partial<LeadSource>) => {
    try {
      const response = await businessSettingsService.updateLeadSource(id, data);
      const updated = (response.data || response) as LeadSource;
      setLeadSources((prev) => prev.map((source) => (source.id === id ? updated : source)));
      toast.success("Lead source updated successfully");
    } catch (error) {
      console.error("Failed to update lead source:", error);
      toast.error("Failed to update lead source");
      throw error;
    }
  };

  const deleteLeadSource = async (id: string) => {
    try {
      await businessSettingsService.deleteLeadSource(id);
      setLeadSources((prev) => prev.filter((source) => source.id !== id));
      toast.success("Lead source deleted successfully");
    } catch (error) {
      console.error("Failed to delete lead source:", error);
      toast.error("Failed to delete lead source");
      throw error;
    }
  };

  const reorderLeadSources = async (sourceIds: string[]) => {
    try {
      const response = await businessSettingsService.reorderLeadSources(sourceIds);
      setLeadSources(response.data);
      toast.success("Lead sources reordered successfully");
    } catch (error) {
      console.error("Failed to reorder lead sources:", error);
      toast.error("Failed to reorder lead sources");
      throw error;
    }
  };

  // Lead Statuses (now repurposed for Call Outcomes)
  const addLeadStatus = async (data: Omit<LeadStatus, "id">) => {
    try {
      const response = await businessSettingsService.createLeadStatus(data);
      setLeadStatuses((prev) => [...prev, response.data]);
      toast.success("Lead status updated successfully");
    } catch (error) {
      console.error("Failed to add lead status:", error);
      toast.error("Failed to add lead status");
      throw error;
    }
  };

  const updateLeadStatus = async (id: string, data: Partial<LeadStatus>) => {
    try {
      const response = await businessSettingsService.updateLeadStatus(id, data);
      setLeadStatuses((prev) => prev.map((s) => (s.id === id ? response.data : s)));
      toast.success("Lead status updated successfully");
    } catch (error) {
      console.error("Failed to update lead status:", error);
      toast.error("Failed to update lead status");
      throw error;
    }
  };

  const deleteLeadStatus = async (id: string) => {
    try {
      await businessSettingsService.deleteLeadStatus(id);
      setLeadStatuses((prev) => prev.filter((s) => s.id !== id));
      toast.success("Lead status deleted successfully");
    } catch (error) {
      console.error("Failed to delete lead status:", error);
      toast.error("Failed to delete lead status");
      throw error;
    }
  };

  // Call Outcomes (Compatibility aliases)
  const getCallOutcomes = (): LeadStatus[] => {
    return leadStatuses;
  };

  const addCallOutcome = addLeadStatus;
  const updateCallOutcome = updateLeadStatus;
  const deleteCallOutcome = deleteLeadStatus;

  // Lead Status Stages
  const getLeadStatusOptions = (): any[] => {
    return leadStatusOptions;
  };

  const updateLeadStatusOption = async (id: string, data: any) => {
    // This will depend on your field config update API
    try {
      // Logic to update field config options
      setLeadStatusOptions(data.options);
    } catch (error) {
      console.error("Failed to update lead status options:", error);
    }
  };

  // Deal Statuses Methods
  const getDealStages = (): DealStatus[] => {
    return dealStatuses;
  };

  const addDealStatus = async (data: Omit<DealStatus, "id">) => {
    try {
      const response = await businessSettingsService.createDealStatus(data);
      setDealStatuses((prev) => [...prev, response.data]);
      toast.success("Deal status added successfully");
    } catch (error) {
      console.error("Failed to add deal status:", error);
      toast.error("Failed to add deal status");
      throw error;
    }
  };

  const updateDealStatus = async (id: string, data: Partial<DealStatus>) => {
    try {
      const response = await businessSettingsService.updateDealStatus(id, data);
      setDealStatuses((prev) => prev.map((s) => (s.id === id ? response.data : s)));
      toast.success("Deal status updated successfully");
    } catch (error) {
      console.error("Failed to update deal status:", error);
      toast.error("Failed to update deal status");
      throw error;
    }
  };

  const deleteDealStatus = async (id: string) => {
    try {
      await businessSettingsService.deleteDealStatus(id);
      setDealStatuses((prev) => prev.filter((s) => s.id !== id));
      toast.success("Deal status deleted successfully");
    } catch (error) {
      console.error("Failed to delete deal status:", error);
      toast.error("Failed to delete deal status");
      throw error;
    }
  };

  // Utility Methods
  // Map common currency symbols → ISO 4217 codes (DB sometimes stores the symbol instead of the code)
  const SYMBOL_TO_ISO: Record<string, string> = {
    "₹": "INR",
    $: "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "₩": "KRW",
    "₺": "TRY",
    "₽": "RUB",
    "د.إ": "AED",
    "﷼": "SAR",
    "৳": "BDT",
    "₦": "NGN",
    A$: "AUD",
    C$: "CAD",
    S$: "SGD",
    HK$: "HKD",
  };

  const normaliseIso = (code?: string): string => {
    if (!code) return "USD";
    if (code.length === 3) return code; // already an ISO code
    return SYMBOL_TO_ISO[code] ?? "USD";
  };

  const formatCurrency = (
    amount: number | string | undefined | null,
    currency?: string
  ): string => {
    let num = Number(amount);
    if (!isFinite(num)) num = 0;
    if (!currencySettings) return String(num);

    const rawCode = currency || currencySettings.primary;
    const isoCode = normaliseIso(rawCode);
    const decimals = currencySettings.decimalPlaces || 2;

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: isoCode,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    } catch (e) {
      const symbol = currencySettings.symbol || rawCode || "$";
      return currencySettings.position === "before"
        ? `${symbol}${num.toFixed(decimals)}`
        : `${num.toFixed(decimals)}${symbol}`;
    }
  };

  const calculateTax = (amount: number, rate?: number): number => {
    if (!taxSettings) return 0;
    return (amount * (rate || taxSettings.defaultRate)) / 100;
  };

  const getCurrency = (): string => currencySettings?.primary || "USD";
  const getLeadSourceById = (id: string) => leadSources.find((s) => s.id === id) || null;
  const getLeadStatusById = (id: string) => leadStatuses.find((s) => s.id === id) || null;
  const getDealStatusById = (id: string) => dealStatuses.find((s) => s.id === id) || null;

  const value: BusinessSettingsContextType = {
    businessSettings,
    companySettings,
    currencySettings,
    taxSettings,
    leadSources,
    leadStatuses,
    leadStatusOptions,
    dealStatuses,
    isLoading,
    isInitialized,
    refreshBusinessSettings,
    updateCompanySettings,
    updateCurrencySettings,
    updateTaxSettings,
    addLeadSource,
    updateLeadSource,
    deleteLeadSource,
    reorderLeadSources,
    addLeadStatus,
    updateLeadStatus,
    deleteLeadStatus,
    getCallOutcomes,
    addCallOutcome,
    updateCallOutcome,
    deleteCallOutcome,
    getLeadStatusOptions,
    updateLeadStatusOption,
    getDealStages,
    addDealStatus,
    updateDealStatus,
    deleteDealStatus,
    formatCurrency,
    calculateTax,
    getCurrency,
    getLeadSourceById,
    getLeadStatusById,
    getDealStatusById,
  };

  return (
    <BusinessSettingsContext.Provider value={value}>{children}</BusinessSettingsContext.Provider>
  );
};

export const useBusinessSettings = (): BusinessSettingsContextType => {
  const context = useContext(BusinessSettingsContext);
  if (context === undefined) {
    throw new Error("useBusinessSettings must be used within a BusinessSettingsProvider");
  }
  return context;
};

export default BusinessSettingsContext;
