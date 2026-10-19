"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface Register {
  id: number;
  date: string;
  opening_balance: string;
  current_balance: string;
  status: "OPEN" | "CLOSED";
  opened_at: string;
  closed_at: string | null;
}

export interface RegisterSummary {
  register_id: number;
  date: string;
  status: string;
  opening_balance: string;
  total_sales_count: number;
  total_sales_amount: string;
  total_money: string;
  total_pix: string;
  total_card: string;
  current_cash_in_drawer: string;
}

export function useRegister() {
  const [activeRegister, setActiveRegister] = useState<Register | null>(null);
  const [summary, setSummary] = useState<RegisterSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkActiveRegister = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/register/active`);
      if (!res.ok) throw new Error("Erro ao verificar status do caixa");
      const data = await res.json();
      setActiveRegister(data);

      if (data?.id) {
        const sumRes = await fetch(`${API_BASE}/register/${data.id}/summary`);
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setSummary(sumData);
        }
      } else {
        setSummary(null);
      }
    } catch (err: any) {
      setError(err.message || "Falha na conexão com a API");
    } finally {
      setLoading(false);
    }
  }, []);

  const openRegister = async (openingBalance: number) => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/register/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opening_balance: openingBalance.toFixed(2) }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao abrir o caixa");
      }

      const opened = await res.json();
      setActiveRegister(opened);
      await checkActiveRegister();
      return opened;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const closeRegister = async (reportedCash: number, notes?: string) => {
    if (!activeRegister) return;
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/closure/${activeRegister.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reported_cash: reportedCash.toFixed(2),
          notes: notes || "",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao fechar o caixa");
      }

      const closureData = await res.json();
      setActiveRegister(null);
      setSummary(null);
      return closureData;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    checkActiveRegister();
  }, [checkActiveRegister]);

  return {
    activeRegister,
    summary,
    loading,
    error,
    openRegister,
    closeRegister,
    refreshRegister: checkActiveRegister,
  };
}
