"use client";

import { useState, useMemo } from "react";

export interface CartItem {
  id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);

  const addItem = (product_name: string, unit_price: number, quantity: number = 1) => {
    const cleanName = product_name.trim();
    if (!cleanName || unit_price <= 0 || quantity <= 0) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (it) => it.product_name.toLowerCase() === cleanName.toLowerCase()
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      }

      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          product_name: cleanName,
          unit_price,
          quantity,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateUnitPrice = (id: string, newPrice: number) => {
    if (newPrice < 0) return;
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, unit_price: newPrice } : it))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(0);
  };

  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + it.unit_price * it.quantity, 0);
  }, [items]);

  const total = useMemo(() => {
    const finalVal = subtotal - discount;
    return finalVal > 0 ? finalVal : 0;
  }, [subtotal, discount]);

  return {
    items,
    discount,
    subtotal,
    total,
    setDiscount,
    addItem,
    updateQuantity,
    updateUnitPrice,
    removeItem,
    clearCart,
  };
}
