"use client";

import React, { useState } from "react";
import { Register } from "../hooks/useRegister";
import { Lock, Unlock, AlertCircle, Clock, BarChart3 } from "lucide-react";

interface Props {
  activeRegister: Register | null;
  salesCount: number;
  onOpenRegister: (openingBalance: number) => Promise<any>;
  onOpenClosureModal: () => void;
  onOpenManagementModal: () => void;
  loading: boolean;
}

export default function RegisterGuardBanner({
  activeRegister,
  salesCount,
  onOpenRegister,
  onOpenClosureModal,
  onOpenManagementModal,
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
      <div className="bg-[#070b22] text-white px-6 py-3 flex items-center justify-between shadow-md border-b border-blue-900/40">
        <span className="text-sm font-medium animate-pulse text-blue-200">Sincronizando status do caixa...</span>
      </div>
    );
  }

  // Caixa Fechado: Modal / Banner de Bloqueio com o Logo da Loja
  if (!activeRegister) {
    return (
      <div className="fixed inset-0 bg-[#070b22]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-blue-100 text-center animate-in fade-in zoom-in-95 duration-200">
          {/* Logo WS Moda e Variedades */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 shadow-xl ring-4 ring-blue-500/20 border-2 border-blue-600 bg-[#070b22]">
            <img
              src="/logo.jpg"
              alt="WS Moda e Variedades"
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-2xl font-black text-[#070b22] tracking-tight">
            WS MODA E VARIEDADES
          </h2>
          <p className="text-xs uppercase tracking-widest text-blue-600 font-bold mt-0.5">
            Frente de Caixa Diário
          </p>

          <p className="text-slate-500 text-xs mt-3 mb-6 leading-relaxed">
            Para registrar vendas e movimentações na loja, informe o fundo de troco (saldo inicial em gaveta) para abrir o caixa do dia.
          </p>

          <form onSubmit={handleOpen} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Saldo Inicial em Gaveta (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 font-bold">
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-bold text-lg text-slate-900 bg-slate-50"
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
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tracking-wide text-sm"
            >
              <Unlock className="w-4 h-4" />
              {isSubmitting ? "Abrindo caixa..." : "Abrir Caixa Diário"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Caixa Aberto: Topbar elegante com as cores exatas do logo
  return (
    <header className="bg-gradient-to-r from-[#070b22] via-[#0c1b48] to-[#1e3a8a] text-white px-5 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-4 border-b border-blue-500/20 shadow-lg">
      {/* Lado Esquerdo: Logo + Identidade + Status */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md ring-2 ring-blue-400/40 border border-white/20 bg-[#070b22] shrink-0">
          <img
            src="/logo.jpg"
            alt="WS Moda e Variedades"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-black text-sm tracking-wide text-white drop-shadow-sm">
              WS MODA E VARIEDADES
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Caixa #{activeRegister.id} Aberto
            </span>
          </div>
          <p className="text-[11px] text-blue-200/80 flex items-center gap-1.5 mt-0.5 font-medium">
            <Clock className="w-3 h-3 text-blue-300" />
            Data: {activeRegister.date}
          </p>
        </div>
      </div>

      {/* Lado Direito: Botão Gestão Diária (onde estava marcado de vermelho na imagem 2) + Fundo de Troco + Fechar Caixa */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Botão de Gestão Diária & Vendas posicionado exatamente na barra azul superior */}
        <button
          onClick={onOpenManagementModal}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 hover:text-white border border-white/25 text-blue-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md shadow-xs active:scale-95"
          title="Abrir auditoria diária e histórico de vendas"
        >
          <BarChart3 className="w-4 h-4 text-blue-300" />
          <span>Gestão Diária & Vendas ({salesCount})</span>
        </button>

        <div className="text-right border-l border-white/15 pl-4 sm:pl-6">
          <span className="text-[10px] uppercase text-blue-300/80 tracking-wider font-semibold block">
            Fundo de Troco
          </span>
          <p className="font-extrabold text-sm text-white">
            R$ {parseFloat(activeRegister.opening_balance).toFixed(2)}
          </p>
        </div>

        <button
          onClick={onOpenClosureModal}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-red-500/25 hover:text-red-300 hover:border-red-500/50 border border-white/20 rounded-xl text-xs font-semibold text-blue-100 transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-sm"
        >
          <Lock className="w-3 h-3" />
          Fechar Caixa
        </button>
      </div>
    </header>
  );
}
