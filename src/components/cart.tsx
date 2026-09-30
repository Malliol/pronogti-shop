"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { bySlug, variantOf, type Product } from "@/lib/catalog";

// Позиция корзины = товар + оттенок; одинаковая пара складывается
export type CartItem = { slug: string; shade: string | null; qty: number };
export type CartLine = CartItem & { key: string; product: Product; shadeName?: string; price: number; sum: number; swatch: string | null };

type Ctx = {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  open: boolean;
  toast: string;
  setOpen: (v: boolean) => void;
  add: (slug: string, shade: string | null, qty?: number, silent?: boolean) => void;
  setQty: (key: string, delta: number) => void;
  clear: () => void;
};

const CartCtx = createContext<Ctx | null>(null);
const KEY = "kn-cart";
const keyOf = (i: { slug: string; shade: string | null }) => `${i.slug}:${i.shade ?? ""}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]") as CartItem[];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- корзина читается из localStorage только на клиенте
      setItems(saved.filter((i) => bySlug(i.slug)));
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = useCallback((slug: string, shade: string | null, qty = 1, silent = false) => {
    const p = bySlug(slug);
    if (!p) return;
    const k = keyOf({ slug, shade });
    setItems((prev) => {
      const i = prev.findIndex((x) => keyOf(x) === k);
      if (i < 0) return [...prev, { slug, shade, qty }];
      const next = prev.slice();
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
    if (silent) return;
    const v = variantOf(p, shade);
    setToast(`Добавлено: ${p.name}${v.name ? ", " + v.name : ""}`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const setQty = useCallback((key: string, delta: number) => {
    setItems((prev) => prev.map((x) => (keyOf(x) === key ? { ...x, qty: x.qty + delta } : x)).filter((x) => x.qty > 0));
  }, []);

  const value = useMemo<Ctx>(() => {
    const lines = items.flatMap((i) => {
      const product = bySlug(i.slug);
      if (!product) return [];
      const v = variantOf(product, i.shade);
      return [{ ...i, key: keyOf(i), product, shadeName: v.name, price: v.price, sum: v.price * i.qty, swatch: v.swatch }];
    });
    return {
      items,
      lines,
      count: items.reduce((a, x) => a + x.qty, 0),
      subtotal: lines.reduce((a, l) => a + l.sum, 0),
      open,
      toast: open ? "" : toast,
      setOpen: (v) => {
        setOpen(v);
        if (v) setToast("");
      },
      add,
      setQty,
      clear: () => setItems([]),
    };
  }, [items, open, toast, add, setQty]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart вне CartProvider");
  return c;
}
