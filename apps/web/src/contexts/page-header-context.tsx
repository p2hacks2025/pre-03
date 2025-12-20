"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface PageHeaderState {
  title: string;
  subtitle?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

interface PageHeaderContextValue extends PageHeaderState {
  setHeader: (state: PageHeaderState) => void;
  clearHeader: () => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

const defaultState: PageHeaderState = {
  title: "",
  subtitle: undefined,
  rightContent: undefined,
};

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PageHeaderState>(defaultState);

  const setHeader = useCallback((newState: PageHeaderState) => {
    setState(newState);
  }, []);

  const clearHeader = useCallback(() => {
    setState(defaultState);
  }, []);

  return (
    <PageHeaderContext.Provider value={{ ...state, setHeader, clearHeader }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error("usePageHeader must be used within a PageHeaderProvider");
  }
  return context;
}
