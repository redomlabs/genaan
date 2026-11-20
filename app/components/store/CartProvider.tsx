"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MAX_LINE_QUANTITY } from "../../lib/pricing";
import type { CartLine } from "../../lib/types";

/** A cart line plus what the drawer shows. Prices are re-checked on the server at checkout. */
export type CartEntry = CartLine & {
  nameAr: string;
  nameEn: string;
  imageUrl: string;
  unitPrice: number;
  plantable: boolean;
  service: "business" | "planting";
};

type CartContextValue = {
  entries: CartEntry[];
  ready: boolean;
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (entry: CartEntry) => void;
  setQuantity: (type: CartLine["type"], id: number, quantity: number) => void;
  /** One planting choice for the whole order. */
  plantAll: boolean;
  setPlantAll: (planting: boolean) => void;
  remove: (type: CartLine["type"], id: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "genaan_cart_v2";
const PLANT_KEY = "genaan_plant_all";
const CartContext = createContext<CartContextValue | null>(null);

const clamp = (n: number) => Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.floor(n) || 1));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [plantAll, setPlantAllState] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring from storage after hydration
      if (Array.isArray(saved)) setEntries(saved);
      if (localStorage.getItem(PLANT_KEY) === "no") setPlantAllState(false);
    } catch {
      /* storage unavailable */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* storage unavailable */
    }
  }, [entries, ready]);

  const add = useCallback((entry: CartEntry) => {
    setEntries((current) => {
      const existing = current.find((e) => e.type === entry.type && e.id === entry.id);
      if (!existing) return [...current, { ...entry, quantity: clamp(entry.quantity) }];
      return current.map((e) =>
        e === existing
          ? { ...entry, quantity: clamp(e.quantity + entry.quantity), planting: entry.planting }
          : e,
      );
    });
    setOpen(true);
  }, []);

  const setQuantity = useCallback((type: CartLine["type"], id: number, quantity: number) => {
    setEntries((c) => c.map((e) => (e.type === type && e.id === id ? { ...e, quantity: clamp(quantity) } : e)));
  }, []);
  const remove = useCallback((type: CartLine["type"], id: number) => {
    setEntries((c) => c.filter((e) => !(e.type === type && e.id === id)));
  }, []);
  const clear = useCallback(() => setEntries([]), []);
  const setPlantAll = useCallback((value: boolean) => {
    setPlantAllState(value);
    try {
      localStorage.setItem(PLANT_KEY, value ? "yes" : "no");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      entries,
      ready,
      count: entries.reduce((s, e) => s + e.quantity, 0),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQuantity,
      plantAll,
      setPlantAll,
      remove,
      clear,
    }),
    [entries, ready, isOpen, add, setQuantity, plantAll, setPlantAll, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
