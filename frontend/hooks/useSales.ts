"use client";

import { useState, useCallback } from "react";
import { CartItem } from "./useCart";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface SalePayload {
  payment_method: string;
  discount: number;
  amount_paid?: number;
  items: CartItem[];
}

export interface SaleRecord {
  id: number;
  register_id: number;
  timestamp: string;
  payment_method: string;
  subtotal: string;
  discount: string;
  total: string;
  amount_paid: string;
  change_amount: string;
  items: {
    id: number;
    product_name: string;
    unit_price: string;
    quantity: number;
    subtotal: string;
  }[];
}

export function useSales() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async (registerId?: number) => {
    try {
      const url = registerId
        ? `${API_BASE}/sales?register_id=${registerId}`
        : `${API_BASE}/sales`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      }
    } catch (e: any) {
      console.error("Erro ao buscar histórico de vendas:", e);
    }
  }, []);

  const submitSale = async (payload: SalePayload): Promise<SaleRecord> => {
    setSubmitting(true);
    setError(null);
    try {
      const formattedPayload = {
        payment_method: payload.payment_method,
        discount: payload.discount.toFixed(2),
        amount_paid: payload.amount_paid !== undefined ? payload.amount_paid.toFixed(2) : undefined,
        items: payload.items.map((it) => ({
          product_name: it.product_name,
          unit_price: it.unit_price.toFixed(2),
          quantity: it.quantity,
        })),
      };

      const res = await fetch(`${API_BASE}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao registrar venda");
      }

      const saleData: SaleRecord = await res.json();
      setSales((prev) => [saleData, ...prev]);
      return saleData;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    sales,
    submitting,
    error,
    submitSale,
    fetchSales,
  };
}
