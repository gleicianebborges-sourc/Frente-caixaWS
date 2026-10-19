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
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#070b22] tracking-tight flex items-center gap-2">
              Peças Frequentes & Atalhos Rápidos
              <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                Auto-Aprendizado
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Clique em qualquer peça para lançar diretamente no carrinho
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Recarregar catálogo"
          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-blue-50/30 rounded-xl border border-dashed border-blue-200">
          <Tag className="w-10 h-10 text-blue-300 mb-2" />
          <p className="text-sm font-bold text-slate-700">
            Nenhuma peça no catálogo ainda
          </p>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Lance qualquer peça manualmente no carrinho. Ao concluir a venda, ela será aprendida e fixada como atalho aqui!
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
                  className="group relative flex flex-col items-start p-3 bg-gradient-to-b from-slate-50/80 to-white hover:from-blue-50/70 hover:to-white border border-slate-200 hover:border-blue-500 rounded-xl text-left transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
                >
                  <div className="w-full flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-blue-700 truncate">
                      {item.category || "Vestuário"}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-100">
                      <TrendingUp className="w-3 h-3" />
                      {item.times_sold}x
                    </span>
                  </div>

                  <span className="font-bold text-sm text-slate-800 group-hover:text-[#070b22] line-clamp-1">
                    {item.name}
                  </span>

                  <span className="mt-1.5 font-black text-sm text-blue-700 group-hover:text-blue-800">
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
