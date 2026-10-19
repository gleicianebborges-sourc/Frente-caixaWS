"use client";

import React, { useState } from "react";
import { CatalogItem } from "../hooks/useCatalog";
import { Sparkles, Tag, TrendingUp, RefreshCw, Plus, X, Check } from "lucide-react";

interface Props {
  items: CatalogItem[];
  loading: boolean;
  onSelectItem: (name: string, price: number) => void;
  onRefresh: () => void;
  onAddDirectCatalogItem?: (name: string, price: number, category: string) => Promise<any>;
}

export default function QuickClothingCatalog({
  items,
  loading,
  onSelectItem,
  onRefresh,
  onAddDirectCatalogItem,
}: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("Geral");
  const [isSaving, setIsSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddDirectCatalogItem) return;

    const cleanName = newName.trim();
    const priceNum = parseFloat(newPrice.replace(",", "."));

    if (!cleanName) {
      setAddError("Informe o nome da peça.");
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setAddError("Informe um preço válido maior que zero.");
      return;
    }

    try {
      setIsSaving(true);
      setAddError(null);
      await onAddDirectCatalogItem(cleanName, priceNum, newCategory);
      setNewName("");
      setNewPrice("");
      setNewCategory("Geral");
      setShowAddModal(false);
    } catch (err: any) {
      setAddError(err.message || "Erro ao salvar peça.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#070b22] tracking-tight flex items-center gap-2">
              Peças do Catálogo & Atalhos Rápidos
              <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                {items.length} itens
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Clique em qualquer peça para lançar no carrinho ou cadastre novas peças abaixo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Incluir Produto sem Vender */}
          {onAddDirectCatalogItem && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Cadastrar Peça no Catálogo</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Recarregar catálogo"
            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grade de Peças */}
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-blue-50/30 rounded-xl border border-dashed border-blue-200">
          <Tag className="w-10 h-10 text-blue-300 mb-2" />
          <p className="text-sm font-bold text-slate-700">
            Nenhuma peça no catálogo ainda
          </p>
          <p className="text-xs text-slate-400 max-w-xs mt-1 mb-3">
            Cadastre peças pelo botão acima ou lance qualquer item no carrinho.
          </p>
          {onAddDirectCatalogItem && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Primeira Peça
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[280px] pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {items.map((item) => {
              const priceNum = parseFloat(item.default_price);
              const isNew = item.times_sold === 0;

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
                    {isNew ? (
                      <span className="text-[9px] font-extrabold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-full">
                        Novo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-100">
                        <TrendingUp className="w-3 h-3" />
                        {item.times_sold}x
                      </span>
                    )}
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

      {/* Modal / Card para Cadastrar Peça Diretamente no Catálogo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#070b22]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-blue-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#070b22]">
                    Cadastrar Peça no Catálogo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Disponibiliza o item como atalho sem precisar vender agora
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nome da Peça / Produto *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Saia Jeans, Conjunto Alfaiataria, Calça Flare..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Preço Padrão (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-blue-700 text-sm">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-bold text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-sm text-slate-800"
                  >
                    <option value="Geral">Geral</option>
                    <option value="Vestuário">Vestuário</option>
                    <option value="Moda Feminina">Moda Feminina</option>
                    <option value="Moda Masculina">Moda Masculina</option>
                    <option value="Moda Praia">Moda Praia</option>
                    <option value="Moda Íntima">Moda Íntima</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Calçados">Calçados</option>
                  </select>
                </div>
              </div>

              {addError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl font-medium">
                  {addError}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isSaving ? "Salvando..." : "Salvar no Catálogo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
