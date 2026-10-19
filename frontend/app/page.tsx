"use client";

import React, { useState, useEffect } from "react";
import { useRegister } from "../hooks/useRegister";
import { useCart } from "../hooks/useCart";
import { useCatalog } from "../hooks/useCatalog";
import { useSales } from "../hooks/useSales";

import RegisterGuardBanner from "../components/RegisterGuardBanner";
import QuickClothingCatalog from "../components/QuickClothingCatalog";
import CartPanel from "../components/CartPanel";
import PaymentPanel from "../components/PaymentPanel";
import HistoryAndClosureView from "../components/HistoryAndClosureView";

import { Shirt, BarChart3, Bell } from "lucide-react";

export default function POSPage() {
  const {
    activeRegister,
    summary,
    loading: registerLoading,
    openRegister,
    closeRegister,
    refreshRegister,
  } = useRegister();

  const {
    items,
    discount,
    subtotal,
    total,
    setDiscount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const { popularItems, loading: catalogLoading, refreshCatalog } = useCatalog();
  const { sales, submitting, submitSale, fetchSales } = useSales();

  const [showClosureModal, setShowClosureModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Busca vendas do caixa ativo
  useEffect(() => {
    if (activeRegister) {
      fetchSales(activeRegister.id);
    }
  }, [activeRegister, fetchSales]);

  // Toast auto-hide
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Handler de Finalização de Venda
  const handleConfirmSale = async (paymentMethod: string, amountPaid?: number) => {
    const sale = await submitSale({
      payment_method: paymentMethod,
      discount,
      amount_paid: amountPaid,
      items,
    });

    // 1. Limpa o carrinho
    clearCart();

    // 2. Atualiza imediatamente o catálogo de peças aprendidas
    await refreshCatalog();

    // 3. Atualiza o resumo financeiro do caixa
    await refreshRegister();

    // 4. Exibe confirmação visual
    setSuccessToast(`Venda #${sale.id} de R$ ${parseFloat(sale.total).toFixed(2)} finalizada com sucesso!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900">
      {/* 1. Bloqueador ou Barra Superior de Caixa */}
      <RegisterGuardBanner
        activeRegister={activeRegister}
        onOpenRegister={openRegister}
        onOpenClosureModal={() => setShowClosureModal(true)}
        loading={registerLoading}
      />

      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 right-6 z-40 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Conteúdo Principal do PDV */}
      <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto flex flex-col gap-5">
        {/* Barra de Sub-Header com Título e Ação de Gestão */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">
                Frente de Caixa WS - Vestuário & Moda
              </h1>
              <p className="text-xs text-slate-500">
                Lançamento ágil sem restrição de estoque com auto-alimentação inteligente de mercadorias
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClosureModal(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer border border-slate-300/80"
            >
              <BarChart3 className="w-4 h-4 text-slate-600" />
              Gestão Diária & Vendas ({sales.length})
            </button>
          </div>
        </div>

        {/* 2. Catálogo Rápido de Peças Aprendidas (Auto-Alimentação) */}
        <section className="min-h-[220px]">
          <QuickClothingCatalog
            items={popularItems}
            loading={catalogLoading}
            onSelectItem={(name, price) => addItem(name, price, 1)}
            onRefresh={refreshCatalog}
          />
        </section>

        {/* 3. Área Operacional de Lançamento e Pagamento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
          {/* Painel do Carrinho e Entrada Ágil */}
          <div className="lg:col-span-7 flex flex-col">
            <CartPanel
              items={items}
              subtotal={subtotal}
              discount={discount}
              total={total}
              onAddItem={addItem}
              onUpdateQty={updateQuantity}
              onRemoveItem={removeItem}
              onSetDiscount={setDiscount}
              onClearCart={clearCart}
            />
          </div>

          {/* Painel de Pagamento e Finalização */}
          <div className="lg:col-span-5 flex flex-col">
            <PaymentPanel
              total={total}
              itemsCount={items.length}
              isSubmitting={submitting}
              onConfirmSale={handleConfirmSale}
            />
          </div>
        </div>
      </main>

      {/* 4. Modal de Gestão Diária, Auditoria e Fechamento */}
      {showClosureModal && (
        <HistoryAndClosureView
          activeRegister={activeRegister}
          summary={summary}
          sales={sales}
          onCloseRegister={closeRegister}
          onDismiss={() => setShowClosureModal(false)}
        />
      )}
    </div>
  );
}
