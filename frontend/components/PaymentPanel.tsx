"use client";

import React, { useState, useEffect } from "react";
import { Banknote, QrCode, CreditCard, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface Props {
  total: number;
  itemsCount: number;
  isSubmitting: boolean;
  onConfirmSale: (method: string, amountPaid?: number) => Promise<any>;
}

export default function PaymentPanel({
  total,
  itemsCount,
  isSubmitting,
  onConfirmSale,
}: Props) {
  const [method, setMethod] = useState<string>("MONEY");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (total > 0 && (!cashReceived || parseFloat(cashReceived) < total)) {
      setCashReceived(total.toFixed(2));
    }
  }, [total]);

  const cashReceivedNum = parseFloat(cashReceived.replace(",", ".")) || 0;
  const changeDue = cashReceivedNum > total ? cashReceivedNum - total : 0;
  const isCashInsufficient = method === "MONEY" && total > 0 && cashReceivedNum < total;

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount.toFixed(2));
  };

  const handleFinish = async () => {
    setErrorMsg(null);
    if (itemsCount === 0 || total <= 0) {
      setErrorMsg("Adicione pelo menos um item ao carrinho.");
      return;
    }

    if (method === "MONEY") {
      if (cashReceivedNum < total) {
        setErrorMsg("O valor recebido em dinheiro é menor que o total da venda.");
        return;
      }
    }

    try {
      await onConfirmSale(method, method === "MONEY" ? cashReceivedNum : total);
      setCashReceived("");
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao registrar venda.");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <h2 className="text-sm font-black text-[#070b22]">Forma de Pagamento</h2>
        <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
          Total: R$ {total.toFixed(2)}
        </span>
      </div>

      {/* Grid de Formas de Pagamento */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <button
          type="button"
          onClick={() => setMethod("MONEY")}
          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            method === "MONEY"
              ? "bg-blue-50/80 border-blue-600 text-[#070b22] shadow-sm ring-2 ring-blue-600/20"
              : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <div className={`p-2 rounded-xl ${method === "MONEY" ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white" : "bg-slate-200 text-slate-600"}`}>
            <Banknote className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-black text-xs uppercase tracking-wider">Dinheiro</span>
            <span className="text-[11px] text-slate-500">Com cálculo de troco</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMethod("PIX")}
          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            method === "PIX"
              ? "bg-blue-50/80 border-blue-600 text-[#070b22] shadow-sm ring-2 ring-blue-600/20"
              : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <div className={`p-2 rounded-xl ${method === "PIX" ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white" : "bg-slate-200 text-slate-600"}`}>
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-black text-xs uppercase tracking-wider">PIX</span>
            <span className="text-[11px] text-slate-500">Chave / QR Code</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMethod("CREDIT_CARD")}
          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            method === "CREDIT_CARD"
              ? "bg-blue-50/80 border-blue-600 text-[#070b22] shadow-sm ring-2 ring-blue-600/20"
              : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <div className={`p-2 rounded-xl ${method === "CREDIT_CARD" ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white" : "bg-slate-200 text-slate-600"}`}>
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-black text-xs uppercase tracking-wider">Cartão Crédito</span>
            <span className="text-[11px] text-slate-500">Maquininha TEF/POS</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMethod("DEBIT_CARD")}
          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
            method === "DEBIT_CARD"
              ? "bg-blue-50/80 border-blue-600 text-[#070b22] shadow-sm ring-2 ring-blue-600/20"
              : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <div className={`p-2 rounded-xl ${method === "DEBIT_CARD" ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white" : "bg-slate-200 text-slate-600"}`}>
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <span className="block font-black text-xs uppercase tracking-wider">Cartão Débito</span>
            <span className="text-[11px] text-slate-500">À vista no cartão</span>
          </div>
        </button>
      </div>

      {/* Seção Dinâmica de Troco para Dinheiro */}
      {method === "MONEY" && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-950 mb-1">
                Valor Recebido (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-blue-700 text-sm">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-blue-300 font-black text-lg text-[#070b22] focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex-1 bg-white border border-blue-200 rounded-xl p-2.5 text-right shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Troco a Devolver
              </span>
              <span className="text-xl font-black text-blue-700">
                R$ {changeDue.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Atalhos Rápidos de Dinheiro */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-blue-900 font-bold mr-1">Atalhos:</span>
            {[total, 20, 50, 100, 200].map((val, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickCash(val)}
                className="text-[11px] font-bold bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-lg cursor-pointer transition-colors shadow-2xs"
              >
                {val === total ? "Exato" : `R$ ${val}`}
              </button>
            ))}
          </div>

          {isCashInsufficient && (
            <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold mt-2.5 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>Valor recebido em dinheiro é menor que o total da venda.</span>
            </div>
          )}
        </div>
      )}

      {/* Exibição para PIX */}
      {method === "PIX" && (
        <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-4 mb-4 text-center">
          <QrCode className="w-8 h-8 text-blue-700 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-[#070b22]">QR Code / Chave PIX WS Moda e Variedades</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Aguarde o comprovante de transferência ou leitura do QR Code do cliente.
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Botão de Conclusão com Estilo WS Gradient */}
      <div className="mt-auto">
        <button
          type="button"
          onClick={handleFinish}
          disabled={isSubmitting || itemsCount === 0 || isCashInsufficient}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base active:scale-[0.99] tracking-wide"
        >
          {isSubmitting ? (
            <span>Concluindo e Aprendendo Itens...</span>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-blue-200" />
              <span>Finalizar Venda (R$ {total.toFixed(2)})</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
