"use client";

import React, { useState, useRef } from "react";
import { CartItem } from "../hooks/useCart";
import { Plus, Trash2, ShoppingBag, PlusCircle, MinusCircle, CornerDownLeft } from "lucide-react";

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
}: Props) {
  const [productName, setProductName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
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

    // Reset inputs & refocus for rapid continuous typing
    setProductName("");
    setUnitPrice("");
    setQuantity("1");
    nameInputRef.current?.focus();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header com totalizador rápido */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-900 text-white rounded-lg">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Itens da Venda</h2>
            <p className="text-xs text-slate-500">
              {items.length} {items.length === 1 ? "item lançado" : "itens lançados"}
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Limpar Carrinho
          </button>
        )}
      </div>

      {/* Formulário de Lançamento Ágil (Teclado / Enter) */}
      <form onSubmit={handleManualAdd} className="p-4 bg-slate-50 border-b border-slate-200/70">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12 sm:col-span-6">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Peça / Descrição (Enter para adicionar)
            </label>
            <input
              ref={nameInputRef}
              type="text"
              required
              placeholder="Ex: Short social, Calça jeans..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-slate-800"
            />
          </div>

          <div className="col-span-6 sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
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
              className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold text-slate-800"
            />
          </div>

          <div className="col-span-4 sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Qtd
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold text-center text-slate-800"
            />
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-end">
            <button
              type="submit"
              title="Lançar item no carrinho"
              className="w-full h-[38px] bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Lista de Itens no Carrinho */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[220px]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <ShoppingBag className="w-8 h-8 stroke-1 mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">Carrinho vazio</p>
            <p className="text-xs text-slate-400 max-w-xs mt-0.5">
              Digite o nome da peça acima ou clique em uma das peças frequentes do catálogo rápido.
            </p>
          </div>
        ) : (
          items.map((it) => {
            const itemTotal = it.unit_price * it.quantity;
            return (
              <div
                key={it.id}
                className="flex items-center justify-between p-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/60 rounded-xl transition-colors"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="font-semibold text-sm text-slate-800 truncate">
                    {it.product_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    R$ {it.unit_price.toFixed(2)} cada
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(it.id, -1)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-xs w-6 text-center text-slate-800">
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(it.id, 1)}
                      className="text-slate-400 hover:text-emerald-600 transition-colors p-0.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-bold text-sm text-slate-900 w-24 text-right">
                    R$ {itemTotal.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(it.id)}
                    className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
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

      {/* Rodapé Totalizador & Descontos */}
      <div className="p-4 bg-slate-900 text-white border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Subtotal</span>
          <span className="font-medium text-slate-200">R$ {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
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
              className="w-full text-right bg-slate-800 border border-slate-700 text-white rounded px-2 py-0.5 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
          <span className="text-sm font-bold uppercase tracking-wider text-rose-400">Total a Pagar</span>
          <span className="text-2xl font-black tracking-tight text-white">
            R$ {total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
