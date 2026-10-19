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

import { CheckCircle2 } from "lucide-react";

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

  const { popularItems, loading: catalogLoading, refreshCatalog, addCatalogItem } = useCatalog();
  const { sales, submitting, submitSale, fetchSales } = useSales();

  const [showClosureModal, setShowClosureModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Busca histórico de vendas do caixa ativo
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

  // Inclusão direta no catálogo
  const handleAddDirectCatalogItem = async (
    name: string,
    price: number,
    category: string = "Geral"
  ) => {
    const saved = await addCatalogItem(name, price, category);
    setSuccessToast(
      `Peça "${saved.name}" (R$ ${parseFloat(saved.default_price).toFixed(2)}) cadastrada com sucesso!`
    );
    return saved;
  };

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
    <div className="min-h-screen flex flex-col bg-[#f0f4fc] text-slate-900 font-sans">
      {/* 1. Barra Superior com Logo, Status e Botão Gestão Diária (posicionado no local solicitado) */}
      <RegisterGuardBanner
        activeRegister={activeRegister}
        salesCount={sales.length}
        onOpenRegister={openRegister}
        onOpenClosureModal={() => setShowClosureModal(true)}
        onOpenManagementModal={() => setShowClosureModal(true)}
        loading={registerLoading}
      />

      {/* Toast Notification com estilo WS Navy & Blue */}
      {successToast && (
        <div className="fixed top-16 right-6 z-40 bg-gradient-to-r from-[#070b22] to-[#1e3a8a] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400/30 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* Conteúdo Principal do PDV */}
      <main className="flex-1 p-3.5 lg:p-5 max-w-[1600px] w-full mx-auto flex flex-col gap-4">
        {/* 2. Catálogo de Peças & Atalhos Rápidos */}
        <section className="min-h-[220px]">
          <QuickClothingCatalog
            items={popularItems}
            loading={catalogLoading}
            onSelectItem={(name, price) => addItem(name, price, 1)}
            onRefresh={refreshCatalog}
            onAddDirectCatalogItem={handleAddDirectCatalogItem}
          />
        </section>

        {/* 3. Área Operacional de Lançamento e Pagamento */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
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
