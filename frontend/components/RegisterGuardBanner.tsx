"use client";

import React, { useState } from "react";
import { Register } from "../hooks/useRegister";
import { Lock, Unlock, AlertCircle, DollarSign, Clock } from "lucide-react";

interface Props {
  activeRegister: Register | null;
  onOpenRegister: (openingBalance: number) => Promise<any>;
  onOpenClosureModal: () => void;
  loading: boolean;
}

export default function RegisterGuardBanner({
  activeRegister,
  onOpenRegister,
  onOpenClosureModal,
  loading,
}: Props) {
  const [openingBalanceInput, setOpeningBalanceInput] = useState<string>("50.00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(openingBalanceInput.replace(",", "."));
    if (isNaN(val) || val < 0) {
      setErrorMsg("Informe um saldo inicial válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onOpenRegister(val);
    } catch (err: any) {
      setErrorMsg(err.message || "Falha ao abrir caixa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <span className="text-sm font-medium animate-pulse">Sincronizando status do caixa...</span>
      </div>
    );
  }

  // Caixa Fechado: Banner Guardião em tela cheia / bloqueador de operação
  if (!activeRegister) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Caixa Fechado</h2>
          <p className="text-slate-500 text-sm mt-2 mb-6">
            Para registrar vendas e movimentações na loja, informe o valor de fundo de troco (saldo inicial em gaveta) para abrir o dia.
          </p>

          <form onSubmit={handleOpen} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Saldo Inicial em Gaveta (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  autoFocus
                  value={openingBalanceInput}
                  onChange={(e) => setOpeningBalanceInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-semibold text-lg text-slate-800"
                  placeholder="0.00"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Unlock className="w-5 h-5" />
              {isSubmitting ? "Abrindo caixa..." : "Abrir Caixa Diário"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Caixa Aberto: Barra superior de status ativo
  return (
    <header className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-wide text-white">WS MODA PDV</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30">
              Caixa Aberto #{activeRegister.id}
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            Data: {activeRegister.date}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="text-xs uppercase text-slate-400 tracking-wider font-medium">Fundo de Troco</span>
          <p className="font-semibold text-sm text-slate-200">
            R$ {parseFloat(activeRegister.opening_balance).toFixed(2)}
          </p>
        </div>

        <button
          onClick={onOpenClosureModal}
          className="px-4 py-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800 border border-slate-700 rounded-lg text-xs font-semibold tracking-wide text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Lock className="w-3.5 h-3.5" />
          Encerrar / Fechar Caixa
        </button>
      </div>
    </header>
  );
}
