"use client";

import React, { useState } from "react";
import { RegisterSummary, Register } from "../hooks/useRegister";
import { SaleRecord } from "../hooks/useSales";
import {
  X,
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
  Receipt,
  QrCode,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Lock,
} from "lucide-react";

interface Props {
  activeRegister: Register | null;
  summary: RegisterSummary | null;
  sales: SaleRecord[];
  onCloseRegister: (reportedCash: number, notes?: string) => Promise<any>;
  onDismiss: () => void;
}

export default function HistoryAndClosureView({
  activeRegister,
  summary,
  sales,
  onCloseRegister,
  onDismiss,
}: Props) {
  const [activeTab, setActiveTab] = useState<"history" | "closure">("history");
  const [countedCash, setCountedCash] = useState<string>("");
  const [closureNotes, setClosureNotes] = useState<string>("");
  const [submittingClosure, setSubmittingClosure] = useState(false);
  const [closureSuccess, setClosureSuccess] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Métricas Consolidadas
  const totalSalesCount = summary?.total_sales_count ?? sales.length;
  const totalRevenue = summary
    ? parseFloat(summary.total_sales_amount)
    : sales.reduce((acc, s) => acc + parseFloat(s.total), 0);
  const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  const expectedCashInDrawer = summary
    ? parseFloat(summary.current_cash_in_drawer)
    : 0;

  const countedCashNum = parseFloat(countedCash.replace(",", ".")) || 0;
  const cashDifference = countedCashNum - expectedCashInDrawer;

  const handleExportCSV = () => {
    if (sales.length === 0) return;

    const headers = ["ID", "Data/Hora", "Forma Pagamento", "Subtotal", "Desconto", "Total", "Itens"];
    const rows = sales.map((s) => [
      s.id,
      new Date(s.timestamp).toLocaleString("pt-BR"),
      s.payment_method,
      s.subtotal,
      s.discount,
      s.total,
      `"${s.items.map((i) => `${i.quantity}x ${i.product_name}`).join("; ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `vendas_ws_moda_${activeRegister?.date || "diario"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFinishClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(countedCashNum) || countedCashNum < 0) {
      setErrorMsg("Informe o valor físico contado em dinheiro.");
      return;
    }

    try {
      setSubmittingClosure(true);
      setErrorMsg(null);
      const res = await onCloseRegister(countedCashNum, closureNotes);
      setClosureSuccess(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Falha ao fechar caixa.");
    } finally {
      setSubmittingClosure(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho do Modal */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Gestão Diária & Conferência de Caixa
            </h2>
            <p className="text-xs text-slate-500">
              Auditoria de vendas, ticket médio e fechamento financeiro
            </p>
          </div>

          <button
            onClick={onDismiss}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas Superiores */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === "history"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Histórico de Vendas ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab("closure")}
            className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === "closure"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Fechamento de Caixa Diário
          </button>
        </div>

        {/* Cards de Métricas em Destaque */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-slate-100/60 border-b border-slate-200">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Faturamento</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-slate-900">
              R$ {totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Qtd Vendas</span>
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-black text-slate-900">{totalSalesCount}</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Ticket Médio</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xl font-black text-slate-900">
              R$ {averageTicket.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Esperado em Dinheiro</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-black text-amber-700">
              R$ {expectedCashInDrawer.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Conteúdo da Aba */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "history" ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-800">
                  Transações Registradas
                </h3>
                <button
                  onClick={handleExportCSV}
                  disabled={sales.length === 0}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Exportar CSV
                </button>
              </div>

              {sales.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  Nenhuma venda realizada neste caixa até o momento.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800 text-sm">
                            Venda #{sale.id}
                          </span>
                          <span className="bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                            {sale.payment_method}
                          </span>
                          <span className="text-slate-400">
                            {new Date(sale.timestamp).toLocaleTimeString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          {sale.items.map((i) => `${i.quantity}x ${i.product_name}`).join(", ")}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 block">
                          R$ {parseFloat(sale.total).toFixed(2)}
                        </span>
                        {parseFloat(sale.change_amount) > 0 && (
                          <span className="text-[11px] text-emerald-600">
                            Troco: R$ {parseFloat(sale.change_amount).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {closureSuccess ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Caixa Fechado com Sucesso!
                  </h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                    O resumo diário foi auditado e gravado no banco de dados.
                  </p>
                  <button
                    onClick={onDismiss}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold"
                  >
                    Concluir e Fechar Tela
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFinishClosure} className="max-w-xl mx-auto space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                    <p className="font-bold mb-1">Conferência Física de Gaveta:</p>
                    <p>
                      Conte todas as notas e moedas físicas presentes na gaveta e digite abaixo. O sistema confrontará com o saldo inicial + vendas em dinheiro registradas.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Dinheiro Físico Contado na Gaveta (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      autoFocus
                      placeholder="0.00"
                      value={countedCash}
                      onChange={(e) => setCountedCash(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {countedCash && (
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                        cashDifference === 0
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : cashDifference < 0
                          ? "bg-red-50 border-red-300 text-red-800"
                          : "bg-blue-50 border-blue-300 text-blue-800"
                      }`}
                    >
                      <span>
                        {cashDifference === 0
                          ? "Caixa Exato (Sem diferença)"
                          : cashDifference < 0
                          ? `Falta de Caixa (Quebra): R$ ${Math.abs(cashDifference).toFixed(2)}`
                          : `Sobra de Caixa: R$ ${cashDifference.toFixed(2)}`}
                      </span>
                      <span>Esperado: R$ {expectedCashInDrawer.toFixed(2)}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Observações / Justificativa de Sangria ou Diferença
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Pagamento de frete de R$ 20, retirada para compras..."
                      value={closureNotes}
                      onChange={(e) => setClosureNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingClosure}
                    className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    {submittingClosure ? "Encerrando..." : "Confirmar e Fechar Caixa Diário"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
