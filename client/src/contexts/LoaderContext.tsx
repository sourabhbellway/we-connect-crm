import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface LoaderContextValue {
  isGlobalLoading: boolean;
  activeRequests: number;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextValue | undefined>(undefined);

type ExternalCallbacks = {
  start: () => void;
  stop: () => void;
} | null;

let externalCallbacks: ExternalCallbacks = null;

const setExternalCallbacks = (callbacks: ExternalCallbacks) => {
  externalCallbacks = callbacks;
};

export const notifyGlobalLoaderStart = () => {
  externalCallbacks?.start();
};

export const notifyGlobalLoaderStop = () => {
  externalCallbacks?.stop();
};

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRequests, setActiveRequests] = useState(0);

  const showLoader = useCallback(() => {
    setActiveRequests((prev) => prev + 1);
  }, []);

  const hideLoader = useCallback(() => {
    setActiveRequests((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    setExternalCallbacks({
      start: showLoader,
      stop: hideLoader,
    });

    return () => setExternalCallbacks(null);
  }, [showLoader, hideLoader]);

  const value = useMemo(
    () => ({
      isGlobalLoading: activeRequests > 0,
      activeRequests,
      showLoader,
      hideLoader,
    }),
    [activeRequests, showLoader, hideLoader],
  );

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }

  return context;
};

