"use client";

import React from "react";
import { CatalogItem } from "../hooks/useCatalog";
import { Sparkles, Tag, TrendingUp, RefreshCw } from "lucide-react";

interface Props {
  items: CatalogItem[];
  loading: boolean;
  onSelectItem: (name: string, price: number) => void;
  onRefresh: () => void;
}

export default function QuickClothingCatalog({
  items,
  loading,
  onSelectItem,
  onRefresh,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              Peças Frequentes & Atalhos Inteligentes
              <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full uppercase">
                Auto-Aprendizado
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Itens sugeridos automaticamente a partir das vendas finalizadas
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Recarregar catálogo"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <Tag className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">
            Nenhuma peça no catálogo ainda
          </p>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Lance qualquer mercadoria manualmente no carrinho. Ao concluir a venda, o sistema aprenderá o item e criará o atalho aqui automaticamente!
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[280px] pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {items.map((item) => {
              const priceNum = parseFloat(item.default_price);
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item.name, priceNum)}
                  className="group relative flex flex-col items-start p-3 bg-gradient-to-b from-slate-50 to-white hover:from-rose-50 hover:to-white border border-slate-200/90 hover:border-rose-400 rounded-xl text-left transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
                >
                  <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-rose-600 truncate">
                      {item.category || "Vestuário"}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 group-hover:text-rose-500">
                      <TrendingUp className="w-3 h-3" />
                      {item.times_sold}x
                    </span>
                  </div>

                  <span className="font-semibold text-sm text-slate-800 group-hover:text-rose-950 line-clamp-1">
                    {item.name}
                  </span>

                  <span className="mt-1.5 font-bold text-sm text-emerald-600 group-hover:text-emerald-700">
                    R$ {priceNum.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
