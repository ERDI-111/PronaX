'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CompareProperty {
  id: string;
  title: string;
  price: number;
  currency: string;
  listing_type: string;
  property_type: string;
  municipality_name: string;
  settlement_name?: string;
  area_m2: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor?: number | null;
  year_built?: number | null;
  furnished?: string | null;
  heating_type?: string | null;
  has_balcony?: boolean;
  has_parking?: boolean;
  has_elevator?: boolean;
  cover_image: string;
}

interface CompareContextType {
  items: CompareProperty[];
  addToCompare: (property: CompareProperty) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType>({
  items: [],
  addToCompare: () => false,
  removeFromCompare: () => {},
  clearCompare: () => {},
  isInCompare: () => false,
});

export function useCompare() {
  return useContext(CompareContext);
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareProperty[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pronax_compare');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveItems = (newItems: CompareProperty[]) => {
    setItems(newItems);
    try {
      localStorage.setItem('pronax_compare', JSON.stringify(newItems));
    } catch {}
  };

  const addToCompare = (property: CompareProperty): boolean => {
    if (items.some((i) => i.id === property.id)) {
      return false;
    }
    if (items.length >= 4) {
      alert('Mund të krahasoni deri në 4 prona njëkohësisht.');
      return false;
    }
    saveItems([...items, property]);
    return true;
  };

  const removeFromCompare = (id: string) => {
    saveItems(items.filter((i) => i.id !== id));
  };

  const clearCompare = () => {
    saveItems([]);
  };

  const isInCompare = (id: string) => {
    return items.some((i) => i.id === id);
  };

  return (
    <CompareContext.Provider
      value={{ items, addToCompare, removeFromCompare, clearCompare, isInCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}
