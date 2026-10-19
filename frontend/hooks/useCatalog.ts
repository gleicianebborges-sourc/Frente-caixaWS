"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface CatalogItem {
  id: number;
  name: string;
  default_price: string;
  times_sold: number;
  category: string;
  last_sold_at: string;
}

export function useCatalog() {
  const [popularItems, setPopularItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPopular = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/catalog/popular?limit=40`);
      if (res.ok) {
        const data = await res.json();
        setPopularItems(data);
      }
    } catch (e) {
      console.error("Falha ao carregar catálogo:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCatalog = async (query: string): Promise<CatalogItem[]> => {
    if (!query.trim()) return [];
    try {
      const res = await fetch(`${API_BASE}/catalog/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  return {
    popularItems,
    loading,
    refreshCatalog: fetchPopular,
    searchCatalog,
  };
}
