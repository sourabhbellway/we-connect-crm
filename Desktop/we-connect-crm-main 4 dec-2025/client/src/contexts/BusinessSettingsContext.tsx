import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { businessSettingsService } from '../features/business-settings/services/businessSettingsService';
import { useAuth } from './AuthContext';
import { BusinessSettings, CompanySettings, CurrencySettings, TaxSettings, LeadSource, Pipeline, DealStage } from '../features/business-settings/types';
import { DEFAULT_BUSINESS_SETTINGS } from '../constants';
import { toast } from 'react-toastify';

interface BusinessSettingsContextType {
  // Data
  businessSettings: BusinessSettings | null;
  companySettings: CompanySettings | null;
  currencySettings: CurrencySettings | null;
  taxSettings: TaxSettings | null;
  leadSources: LeadSource[];
  pipelines: Pipeline[];
  defaultPipeline: Pipeline | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Methods
  refreshBusinessSettings: () => Promise<void>;
  updateCompanySettings: (data: Partial<CompanySettings>) => Promise<void>;
  updateCurrencySettings: (data: Partial<CurrencySettings>) => Promise<void>;
  updateTaxSettings: (data: Partial<TaxSettings>) => Promise<void>;
  
  // Lead Sources
  addLeadSource: (data: Omit<LeadSource, 'id'>) => Promise<void>;
  updateLeadSource: (id: string, data: Partial<LeadSource>) => Promise<void>;
  deleteLeadSource: (id: string) => Promise<void>;
  reorderLeadSources: (sourceIds: string[]) => Promise<void>;
  
  // Pipelines
  addPipeline: (data: Omit<Pipeline, 'id'>) => Promise<void>;
  updatePipeline: (id: string, data: Partial<Pipeline>) => Promise<void>;
  deletePipeline: (id: string) => Promise<void>;
  setDefaultPipeline: (id: string) => Promise<void>;
  
  // Deal Stages
  getDealStages: (pipelineId?: string) => DealStage[];
  addDealStage: (pipelineId: string, data: Omit<DealStage, 'id'>) => Promise<void>;
  updateDealStage: (id: string, data: Partial<DealStage>) => Promise<void>;
  deleteDealStage: (id: string) => Promise<void>;
  
  // Utility Methods
  formatCurrency: (amount: number | undefined | null, currency?: string) => string;
  calculateTax: (amount: number, rate?: number) => number;
  getCurrency: () => string;
  getLeadSourceById: (id: string) => LeadSource | null;
  getPipelineById: (id: string) => Pipeline | null;
  getDealStageById: (id: string) => DealStage | null;
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
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultPipeline = pipelines.find(p => p.isDefault) || pipelines[0] || null;

// Initialize business settings only when authenticated
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      initializeBusinessSettings();
    }
  }, [isAuthenticated]);

  const initializeBusinessSettings = async () => {
    try {
      setIsLoading(true);
      
      // Try to load all settings at once, fallback to individual calls if not available
      try {
        const response = await businessSettingsService.getAllBusinessSettings();
        setBusinessSettings(response.data);
        setCompanySettings(response.data.company);
        setCurrencySettings(response.data.currency);
        setTaxSettings(response.data.tax);
        setLeadSources(response.data.leadSources || []);
        setPipelines(response.data.pipelines || []);
      } catch (error) {
        // Fallback to individual API calls
        await loadSettingsIndividually();
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize business settings:', error);
      toast.error('Failed to load business settings');
      
      // Set defaults if everything fails
      setCompanySettings(DEFAULT_BUSINESS_SETTINGS.company as CompanySettings);
      setCurrencySettings(DEFAULT_BUSINESS_SETTINGS.currency as CurrencySettings);
      setTaxSettings(DEFAULT_BUSINESS_SETTINGS.tax as TaxSettings);
      setLeadSources(DEFAULT_BUSINESS_SETTINGS.leadSources.map((name, index) => ({
        id: `default-${index}`,
        name,
        description: '',
        color: '#6B7280',
        isActive: true,
        sortOrder: index,
      })));
      setPipelines([{
        id: 'default-pipeline',
        name: 'Default Pipeline',
        description: 'Default sales pipeline',
        stages: DEFAULT_BUSINESS_SETTINGS.dealStages.map((stage, index) => ({
          id: `stage-${index}`,
          name: stage.name,
          probability: stage.probability,
          color: stage.color,
          sortOrder: index,
          isActive: true,
          isClosedWon: stage.name === 'Closed Won',
          isClosedLost: stage.name === 'Closed Lost',
        })),
        isDefault: true,
        isActive: true,
      }]);
      
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettingsIndividually = async () => {
    const promises = [
      businessSettingsService.getCompanySettings().then(r => setCompanySettings(r.data)),
      businessSettingsService.getCurrencySettings().then(r => setCurrencySettings(r.data)),
      businessSettingsService.getTaxSettings().then(r => setTaxSettings(r.data)),
      businessSettingsService.getLeadSources().then(r => setLeadSources(r.data)),
      businessSettingsService.getPipelines().then(r => setPipelines(r.data)),
    ];

    await Promise.allSettled(promises);
  };

  const refreshBusinessSettings = async () => {
    await initializeBusinessSettings();
  };

  const updateCompanySettings = async (data: Partial<CompanySettings>) => {
    try {
      const response = await businessSettingsService.updateCompanySettings(data);
      setCompanySettings(response.data);
      toast.success('Company settings updated successfully');
    } catch (error) {
      console.error('Failed to update company settings:', error);
      toast.error('Failed to update company settings');
      throw error;
    }
  };

  const updateCurrencySettings = async (data: Partial<CurrencySettings>) => {
    try {
      const response = await businessSettingsService.updateCurrencySettings(data);
      setCurrencySettings(response.data);
      toast.success('Currency settings updated successfully');
    } catch (error) {
      console.error('Failed to update currency settings:', error);
      toast.error('Failed to update currency settings');
      throw error;
    }
  };

  const updateTaxSettings = async (data: Partial<TaxSettings>) => {
    try {
      const response = await businessSettingsService.updateTaxSettings(data);
      setTaxSettings(response.data);
      toast.success('Tax settings updated successfully');
    } catch (error) {
      console.error('Failed to update tax settings:', error);
      toast.error('Failed to update tax settings');
      throw error;
    }
  };

  // Lead Sources Methods
  const addLeadSource = async (data: Omit<LeadSource, 'id'>) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || '',
        isActive: data.isActive !== false,
        color: data.color,
        sortOrder: data.sortOrder,
      };

      const response = await businessSettingsService.createLeadSource(payload as any);
      const serverPayload: any = (response as any)?.data ?? response;

      setLeadSources(prev => {
        const sortOrder = data.sortOrder ?? serverPayload?.sortOrder ?? prev.length;
        const color = data.color ?? serverPayload?.color ?? '#6B7280';
        const created: LeadSource = {
          ...(serverPayload as LeadSource),
          color,
          sortOrder,
          isActive: data.isActive ?? (serverPayload?.isActive ?? true),
        };
        return [...prev, created];
      });

      toast.success('Lead source added successfully');
    } catch (error) {
      console.error('Failed to add lead source:', error);
      toast.error((error as any)?.response?.data?.message || 'Failed to add lead source');
      throw error;
    }
  };

  const updateLeadSource = async (id: string, data: Partial<LeadSource>) => {
    try {
      const response = await businessSettingsService.updateLeadSource(id, data);
      const serverPayload: any = (response as any)?.data ?? response;

      setLeadSources(prev => prev.map(source => {
        if (source.id !== id) return source;
        const updated: LeadSource = {
          ...source,
          ...(serverPayload as LeadSource),
          color: data.color ?? serverPayload?.color ?? source.color,
          sortOrder: data.sortOrder ?? serverPayload?.sortOrder ?? source.sortOrder,
        };
        return updated;
      }));

      toast.success('Lead source updated successfully');
    } catch (error) {
      console.error('Failed to update lead source:', error);
      toast.error('Failed to update lead source');
      throw error;
    }
  };

  const deleteLeadSource = async (id: string) => {
    try {
      await businessSettingsService.deleteLeadSource(id);
      setLeadSources(prev => prev.filter(source => source.id !== id));
      toast.success('Lead source deleted successfully');
    } catch (error) {
      console.error('Failed to delete lead source:', error);
      toast.error('Failed to delete lead source');
      throw error;
    }
  };

  const reorderLeadSources = async (sourceIds: string[]) => {
    try {
      const response = await businessSettingsService.reorderLeadSources(sourceIds);
      setLeadSources(response.data);
      toast.success('Lead sources reordered successfully');
    } catch (error) {
      console.error('Failed to reorder lead sources:', error);
      toast.error('Failed to reorder lead sources');
      throw error;
    }
  };

  // Pipelines Methods
  const addPipeline = async (data: Omit<Pipeline, 'id'>) => {
    try {
      const response = await businessSettingsService.createPipeline(data);
      setPipelines(prev => [...prev, response.data]);
      toast.success('Pipeline added successfully');
    } catch (error) {
      console.error('Failed to add pipeline:', error);
      toast.error('Failed to add pipeline');
      throw error;
    }
  };

  const updatePipeline = async (id: string, data: Partial<Pipeline>) => {
    try {
      const response = await businessSettingsService.updatePipeline(id, data);
      setPipelines(prev => prev.map(pipeline => 
        pipeline.id === id ? response.data : pipeline
      ));
      toast.success('Pipeline updated successfully');
    } catch (error) {
      console.error('Failed to update pipeline:', error);
      toast.error('Failed to update pipeline');
      throw error;
    }
  };

  const deletePipeline = async (id: string) => {
    try {
      await businessSettingsService.deletePipeline(id);
      setPipelines(prev => prev.filter(pipeline => pipeline.id !== id));
      toast.success('Pipeline deleted successfully');
    } catch (error) {
      console.error('Failed to delete pipeline:', error);
      toast.error('Failed to delete pipeline');
      throw error;
    }
  };

  const setDefaultPipeline = async (id: string) => {
    try {
      await businessSettingsService.setDefaultPipeline(id);
      setPipelines(prev => prev.map(pipeline => ({
        ...pipeline,
        isDefault: pipeline.id === id
      })));
      toast.success('Default pipeline updated successfully');
    } catch (error) {
      console.error('Failed to set default pipeline:', error);
      toast.error('Failed to set default pipeline');
      throw error;
    }
  };

  // Deal Stages Methods
  const getDealStages = (pipelineId?: string): DealStage[] => {
    if (pipelineId) {
      const pipeline = pipelines.find(p => p.id === pipelineId);
      return pipeline?.stages || [];
    }
    return defaultPipeline?.stages || [];
  };

  const addDealStage = async (pipelineId: string, data: Omit<DealStage, 'id'>) => {
    try {
      const response = await businessSettingsService.createDealStage(data);
      setPipelines(prev => prev.map(pipeline => 
        pipeline.id === pipelineId 
          ? { ...pipeline, stages: [...pipeline.stages, response.data] }
          : pipeline
      ));
      toast.success('Deal stage added successfully');
    } catch (error) {
      console.error('Failed to add deal stage:', error);
      toast.error('Failed to add deal stage');
      throw error;
    }
  };

  const updateDealStage = async (id: string, data: Partial<DealStage>) => {
    try {
      const response = await businessSettingsService.updateDealStage(id, data);
      setPipelines(prev => prev.map(pipeline => ({
        ...pipeline,
        stages: pipeline.stages.map(stage => 
          stage.id === id ? response.data : stage
        )
      })));
      toast.success('Deal stage updated successfully');
    } catch (error) {
      console.error('Failed to update deal stage:', error);
      toast.error('Failed to update deal stage');
      throw error;
    }
  };

  const deleteDealStage = async (id: string) => {
    try {
      await businessSettingsService.deleteDealStage(id);
      setPipelines(prev => prev.map(pipeline => ({
        ...pipeline,
        stages: pipeline.stages.filter(stage => stage.id !== id)
      })));
      toast.success('Deal stage deleted successfully');
    } catch (error) {
      console.error('Failed to delete deal stage:', error);
      toast.error('Failed to delete deal stage');
      throw error;
    }
  };

  // Utility Methods
  const formatCurrency = (amount: number | string | undefined | null, currency?: string): string => {
    // Normalize to number first
    let num = Number(amount);
    if (!isFinite(num)) num = 0;
    
    if (!currencySettings) return String(num);
    
    const curr = currency || currencySettings.primary;
    const decimals = currencySettings.decimalPlaces || 2;

    // When a specific currency is requested and it may differ from the primary,
    // try to format using Intl for correct symbol (₹, $, €, etc.)
    try {
      if (curr) {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: curr,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(num);
      }
    } catch (e) {
      // Fall back to manual formatting below
    }

    // Fallback: use configured symbol/position, but pick a sensible symbol for non-primary currencies
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      SGD: 'S$',
    };

    const symbol = curr && curr !== currencySettings.primary
      ? (symbolMap[curr] || currencySettings.symbol || '$')
      : (currencySettings.symbol || '$');

    const formatted = num.toFixed(decimals);
    
    return currencySettings.position === 'before' 
      ? `${symbol}${formatted}`
      : `${formatted}${symbol}`;
  };

  const calculateTax = (amount: number, rate?: number): number => {
    if (!taxSettings) return 0;
    
    const taxRate = rate || taxSettings.defaultRate;
    return (amount * taxRate) / 100;
  };

  const getLeadSourceById = (id: string): LeadSource | null => {
    return leadSources.find(source => source.id === id) || null;
  };

  const getPipelineById = (id: string): Pipeline | null => {
    return pipelines.find(pipeline => pipeline.id === id) || null;
  };

  const getCurrency = (): string => {
    return currencySettings?.primary || 'USD';
  };

  const getDealStageById = (id: string): DealStage | null => {
    for (const pipeline of pipelines) {
      const stage = pipeline.stages.find(stage => stage.id === id);
      if (stage) return stage;
    }
    return null;
  };

  const value: BusinessSettingsContextType = {
    // Data
    businessSettings,
    companySettings,
    currencySettings,
    taxSettings,
    leadSources,
    pipelines,
    defaultPipeline,
    isLoading,
    isInitialized,
    
    // Methods
    refreshBusinessSettings,
    updateCompanySettings,
    updateCurrencySettings,
    updateTaxSettings,
    
    // Lead Sources
    addLeadSource,
    updateLeadSource,
    deleteLeadSource,
    reorderLeadSources,
    
    // Pipelines
    addPipeline,
    updatePipeline,
    deletePipeline,
    setDefaultPipeline,
    
    // Deal Stages
    getDealStages,
    addDealStage,
    updateDealStage,
    deleteDealStage,
    
    // Utility Methods
    formatCurrency,
    calculateTax,
    getCurrency,
    getLeadSourceById,
    getPipelineById,
    getDealStageById,
  };

  return (
    <BusinessSettingsContext.Provider value={value}>
      {children}
    </BusinessSettingsContext.Provider>
  );
};

export const useBusinessSettings = (): BusinessSettingsContextType => {
  const context = useContext(BusinessSettingsContext);
  if (context === undefined) {
    throw new Error('useBusinessSettings must be used within a BusinessSettingsProvider');
  }
  return context;
};

export default BusinessSettingsContext;