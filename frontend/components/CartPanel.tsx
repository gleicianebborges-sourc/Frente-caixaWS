"use client";

import React, { useState, useRef } from "react";
import { CartItem } from "../hooks/useCart";
import { Trash2, ShoppingBag, PlusCircle, MinusCircle, CornerDownLeft, BookmarkPlus } from "lucide-react";

interface Props {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  onAddItem: (name: string, price: number, qty?: number) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onSetDiscount: (discount: number) => void;
  onClearCart: () => void;
  onSaveToCatalogOnly?: (name: string, price: number) => Promise<any>;
}

export default function CartPanel({
  items,
  subtotal,
  discount,
  total,
  onAddItem,
  onUpdateQty,
  onRemoveItem,
  onSetDiscount,
  onClearCart,
  onSaveToCatalogOnly,
}: Props) {
  const [productName, setProductName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [savingCatalogOnly, setSavingCatalogOnly] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = productName.trim();
    const priceNum = parseFloat(unitPrice.replace(",", "."));
    const qtyNum = parseInt(quantity, 10);

    if (!cleanName) return;
    if (isNaN(priceNum) || priceNum <= 0) return;
    if (isNaN(qtyNum) || qtyNum <= 0) return;

    onAddItem(cleanName, priceNum, qtyNum);

    // Limpa os campos e refoca para digitação contínua ágil
    setProductName("");
    setUnitPrice("");
    setQuantity("1");
    nameInputRef.current?.focus();
  };

  const handleSaveOnlyToCatalog = async () => {
    if (!onSaveToCatalogOnly) return;
    const cleanName = productName.trim();
    const priceNum = parseFloat(unitPrice.replace(",", "."));

    if (!cleanName || isNaN(priceNum) || priceNum <= 0) {
      alert("Para cadastrar no catálogo, informe o Nome da Peça e o Preço.");
      return;
    }

    try {
      setSavingCatalogOnly(true);
      await onSaveToCatalogOnly(cleanName, priceNum);
      setProductName("");
      setUnitPrice("");
      setQuantity("1");
      nameInputRef.current?.focus();
    } catch (err: any) {
      alert(err.message || "Erro ao salvar peça no catálogo.");
    } finally {
      setSavingCatalogOnly(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header com totalizador rápido */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#070b22] text-white rounded-xl shadow-xs">
            <ShoppingBag className="w-4 h-4 text-blue-300" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#070b22]">Itens da Venda Atual</h2>
            <p className="text-xs text-slate-500">
              {items.length} {items.length === 1 ? "peça adicionada" : "peças adicionadas"}
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Limpar Carrinho
          </button>
        )}
      </div>

      {/* Formulário de Lançamento Ágil (Teclado / Enter) */}
      <form onSubmit={handleManualAdd} className="p-4 bg-blue-50/40 border-b border-blue-100">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12 sm:col-span-5">
            <label className="block text-[11px] font-bold text-[#070b22] uppercase tracking-wider mb-1">
              Peça / Descrição (Enter para adicionar)
            </label>
            <input
              ref={nameInputRef}
              type="text"
              required
              placeholder="Ex: Short social, Calça jeans..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-slate-900 shadow-2xs"
            />
          </div>

          <div className="col-span-6 sm:col-span-3">
            <label className="block text-[11px] font-bold text-[#070b22] uppercase tracking-wider mb-1">
              Preço Unit. (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-bold text-slate-900 shadow-2xs"
            />
          </div>

          <div className="col-span-3 sm:col-span-2">
            <label className="block text-[11px] font-bold text-[#070b22] uppercase tracking-wider mb-1">
              Qtd
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-bold text-center text-slate-900 shadow-2xs"
            />
          </div>

          <div className="col-span-3 sm:col-span-2 flex items-end gap-1.5">
            <button
              type="submit"
              title="Lançar item no carrinho da venda"
              className="flex-1 h-[38px] bg-gradient-to-r from-[#070b22] to-[#1e3a8a] hover:from-[#0b1338] hover:to-[#2563eb] text-white rounded-xl flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>

            {onSaveToCatalogOnly && (
              <button
                type="button"
                onClick={handleSaveOnlyToCatalog}
                disabled={savingCatalogOnly}
                title="Cadastrar direto no catálogo (sem colocar no carrinho)"
                className="h-[38px] px-2.5 bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <BookmarkPlus className="w-4 h-4 text-blue-700" />
                <span className="hidden xl:inline">Só Catálogo</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Lista de Itens no Carrinho */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[220px]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShoppingBag className="w-9 h-9 stroke-1 mb-2 text-blue-300/80" />
            <p className="text-sm font-bold text-slate-600">Carrinho vazio</p>
            <p className="text-xs text-slate-400 max-w-xs mt-0.5">
              Digite o nome da mercadoria acima ou clique em uma das peças do catálogo.
            </p>
          </div>
        ) : (
          items.map((it) => {
            const itemTotal = it.unit_price * it.quantity;
            return (
              <div
                key={it.id}
                className="flex items-center justify-between p-3 bg-slate-50/90 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-300 rounded-xl transition-all"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="font-bold text-sm text-[#070b22] truncate">
                    {it.product_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    R$ {it.unit_price.toFixed(2)} cada
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-2xs">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(it.id, -1)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-xs w-6 text-center text-slate-900">
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(it.id, 1)}
                      className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-black text-sm text-blue-900 w-24 text-right">
                    R$ {itemTotal.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(it.id)}
                    className="text-slate-300 hover:text-red-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Remover peça"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rodapé Totalizador com Estilo WS Midnight */}
      <div className="p-4 bg-gradient-to-r from-[#070b22] via-[#0c1842] to-[#0f1f4d] text-white border-t border-blue-900/50 shadow-inner">
        <div className="flex items-center justify-between text-xs text-blue-200/80 mb-1.5">
          <span>Subtotal</span>
          <span className="font-semibold text-white">R$ {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-blue-200/80 mb-2">
          <span>Desconto (R$)</span>
          <div className="w-24">
            <input
              type="number"
              step="0.01"
              min="0"
              max={subtotal}
              placeholder="0.00"
              value={discount === 0 ? "" : discount}
              onChange={(e) => onSetDiscount(parseFloat(e.target.value) || 0)}
              className="w-full text-right bg-[#070b22]/80 border border-blue-400/40 text-white rounded-md px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400 font-bold"
            />
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-2.5 border-t border-white/10">
          <span className="text-xs font-black uppercase tracking-wider text-blue-300">
            Total a Pagar
          </span>
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
            R$ {total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
