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
  AlertCircle,
  CheckCircle,
  Lock,
  MessageCircle,
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

  // Contagens e valores por forma de pagamento
  const pixSales = sales.filter((s) => s.payment_method === "PIX");
  const moneySales = sales.filter((s) => s.payment_method === "MONEY");
  const creditSales = sales.filter((s) => s.payment_method === "CREDIT_CARD");
  const debitSales = sales.filter((s) => s.payment_method === "DEBIT_CARD");

  const pixCount = pixSales.length;
  const moneyCount = moneySales.length;
  const creditCount = creditSales.length;
  const debitCount = debitSales.length;

  const pixAmount = pixSales.reduce((acc, s) => acc + parseFloat(s.total), 0);
  const moneyAmount = moneySales.reduce((acc, s) => acc + parseFloat(s.total), 0);
  const creditAmount = creditSales.reduce((acc, s) => acc + parseFloat(s.total), 0);
  const debitAmount = debitSales.reduce((acc, s) => acc + parseFloat(s.total), 0);

  // Enviar Relatório no WhatsApp (85 985890911)
  const handleSendWhatsAppReport = () => {
    const openingBal = activeRegister ? parseFloat(activeRegister.opening_balance) : 0;
    const registerDate = activeRegister?.date || new Date().toISOString().split("T")[0];
    const registerId = activeRegister?.id || "1";

    // Consolidação de peças vendidas
    const itemsMap: { [name: string]: number } = {};
    sales.forEach((s) => {
      s.items?.forEach((it) => {
        itemsMap[it.product_name] = (itemsMap[it.product_name] || 0) + it.quantity;
      });
    });

    const itemsSummaryText = Object.entries(itemsMap)
      .map(([name, qty]) => `• ${qty}x ${name}`)
      .join("\n");

    const message = 
`🛍️ *WS MODA E VARIEDADES*
📊 *RELATÓRIO DIÁRIO DE VENDAS*
📅 Data: ${registerDate} | Caixa #${registerId}
----------------------------------
💳 *VENDAS POR FORMA DE PAGAMENTO:*
• *PIX:* ${pixCount} vendas (R$ ${pixAmount.toFixed(2)})
• *Dinheiro:* ${moneyCount} vendas (R$ ${moneyAmount.toFixed(2)})
• *Cartão Crédito:* ${creditCount} vendas (R$ ${creditAmount.toFixed(2)})
• *Cartão Débito:* ${debitCount} vendas (R$ ${debitAmount.toFixed(2)})
----------------------------------
💰 *CONSOLIDADO DO DIA:*
• *Total de Vendas:* ${totalSalesCount}
• *Faturamento Total:* R$ ${totalRevenue.toFixed(2)}
• *Ticket Médio:* R$ ${averageTicket.toFixed(2)}
• *Fundo de Troco Inicial:* R$ ${openingBal.toFixed(2)}
• *Dinheiro em Gaveta:* R$ ${expectedCashInDrawer.toFixed(2)}
${countedCashNum > 0 ? `• *Dinheiro Físico Contado:* R$ ${countedCashNum.toFixed(2)}\n• *Diferença:* R$ ${cashDifference.toFixed(2)}\n` : ""}----------------------------------
👗 *PEÇAS VENDIDAS:*
${itemsSummaryText || "Nenhuma peça registrada."}
`;

    const phone = "5585985890911";
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

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
    <div className="fixed inset-0 bg-[#070b22]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-blue-100">
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#070b22] to-[#1e3a8a] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-[#070b22] shrink-0">
              <img
                src="/logo.jpg"
                alt="WS Moda e Variedades"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wide">
                WS Moda e Variedades — Gestão Diária
              </h2>
              <p className="text-xs text-blue-200">
                Auditoria de vendas, ticket médio e fechamento financeiro
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas Superiores */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === "history"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Histórico de Vendas ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab("closure")}
            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === "closure"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Fechamento de Caixa Diário
          </button>
        </div>

        {/* Cards de Métricas em Destaque */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 sm:p-6 bg-blue-50/30 border-b border-blue-100">
          <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#070b22]">Faturamento</span>
              <DollarSign className="w-4 h-4 text-blue-700" />
            </div>
            <p className="text-xl font-black text-[#070b22]">
              R$ {totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#070b22]">Qtd Vendas</span>
              <Receipt className="w-4 h-4 text-indigo-700" />
            </div>
            <p className="text-xl font-black text-[#070b22]">{totalSalesCount}</p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#070b22]">Ticket Médio</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-black text-blue-800">
              R$ {averageTicket.toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">Esperado em Dinheiro</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-black text-emerald-700">
              R$ {expectedCashInDrawer.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Resumo Rápido das Formas de Pagamento */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <strong>PIX:</strong> {pixCount} ({`R$ ${pixAmount.toFixed(2)}`})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <strong>Dinheiro:</strong> {moneyCount} ({`R$ ${moneyAmount.toFixed(2)}`})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <strong>Crédito:</strong> {creditCount} ({`R$ ${creditAmount.toFixed(2)}`})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-600" />
              <strong>Débito:</strong> {debitCount} ({`R$ ${debitAmount.toFixed(2)}`})
            </span>
          </div>

          <button
            onClick={handleSendWhatsAppReport}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Enviar este relatório diretamente para o WhatsApp 85 985890911"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar no WhatsApp</span>
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {activeTab === "history" ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="font-bold text-sm text-[#070b22]">
                  Transações do Caixa #{activeRegister?.id}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendWhatsAppReport}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar WhatsApp (85 98589-0911)
                  </button>

                  <button
                    onClick={handleExportCSV}
                    disabled={sales.length === 0}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-200" />
                    Exportar CSV
                  </button>
                </div>
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
                      className="p-3.5 bg-slate-50/90 hover:bg-blue-50/40 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-[#070b22] text-sm">
                            Venda #{sale.id}
                          </span>
                          <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[10px]">
                            {sale.payment_method}
                          </span>
                          <span className="text-slate-400">
                            {new Date(sale.timestamp).toLocaleTimeString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">
                          {sale.items.map((i) => `${i.quantity}x ${i.product_name}`).join(", ")}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-blue-950 block">
                          R$ {parseFloat(sale.total).toFixed(2)}
                        </span>
                        {parseFloat(sale.change_amount) > 0 && (
                          <span className="text-[11px] text-emerald-600 font-semibold">
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
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-[#070b22] mb-2">
                    Caixa Fechado com Sucesso!
                  </h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                    O resumo diário foi auditado e registrado no banco de dados.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleSendWhatsAppReport}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer flex items-center gap-2 transition-all active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Enviar Fechamento no WhatsApp (85 985890911)
                    </button>

                    <button
                      onClick={onDismiss}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#070b22] to-[#1e3a8a] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
                    >
                      Concluir e Fechar Tela
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFinishClosure} className="max-w-xl mx-auto space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-950 text-xs leading-relaxed">
                    <p className="font-bold mb-1">Conferência Física de Gaveta:</p>
                    <p>
                      Conte todas as notas e moedas físicas presentes na gaveta e informe abaixo. O sistema confrontará com o saldo inicial + vendas registradas em dinheiro.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 font-black text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {countedCash && (
                    <div
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                        cashDifference === 0
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : cashDifference < 0
                          ? `Falta de Caixa (Quebra): R$ ${Math.abs(cashDifference).toFixed(2)}`
                          : `Sobra de Caixa: R$ ${cashDifference.toFixed(2)}`}
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Observações / Justificativa de Sangria ou Diferença
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Retirada de sangria para despesas da loja..."
                      value={closureNotes}
                      onChange={(e) => setClosureNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSendWhatsAppReport}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Enviar Parcial no WhatsApp
                    </button>

                    <button
                      type="submit"
                      disabled={submittingClosure}
                      className="flex-1 py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
                    >
                      <Lock className="w-4 h-4" />
                      {submittingClosure ? "Encerrando..." : "Confirmar e Fechar Caixa"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
