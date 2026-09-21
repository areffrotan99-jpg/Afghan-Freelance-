import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency } from '../types';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  exchangeRate: number; // AFN per USD (e.g. 70.5)
  formatAmount: (amountAFN: number, amountUSD?: number) => string;
  formatRaw: (amount: number, cur: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('af_cur') as Currency;
    return saved === 'USD' ? 'USD' : 'AFN';
  });

  const [exchangeRate, setExchangeRate] = useState<number>(70.5);

  useEffect(() => {
    localStorage.setItem('af_cur', currency);
  }, [currency]);

  // Optionally fetch live exchange rate from our backend settings
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.exchangeRateAfnPerUsd) {
          setExchangeRate(data.exchangeRateAfnPerUsd);
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = (cur: Currency) => {
    setCurrencyState(cur);
  };

  const formatAmount = (amountAFN: number, amountUSD?: number): string => {
    if (currency === 'USD') {
      const usdVal = amountUSD !== undefined ? amountUSD : Math.round(amountAFN / exchangeRate);
      return `$${usdVal.toLocaleString()}`;
    }
    return `${amountAFN.toLocaleString()} افغانی`;
  };

  const formatRaw = (amount: number, cur: Currency): string => {
    if (cur === 'USD') {
      return `$${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()} ؋`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, formatAmount, formatRaw }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
