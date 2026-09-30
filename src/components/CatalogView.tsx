"use client";

import Link from "next/link";
import { useState } from "react";
import { CATS, PRODUCTS, priceInfo } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

const SORTS = [
  { k: "pop", label: "Популярные" },
  { k: "cheap", label: "Дешевле" },
  { k: "exp", label: "Дороже" },
] as const;

export function CatalogView({ cat }: { cat?: string }) {
  const [sort, setSort] = useState<(typeof SORTS)[number]["k"]>("pop");
  const cur = CATS.find((c) => c.id === cat);
  const list = PRODUCTS.filter((p) => !cat || p.cat === cat).sort((a, b) =>
    sort === "cheap" ? priceInfo(a).min - priceInfo(b).min : sort === "exp" ? priceInfo(b).min - priceInfo(a).min : a.pop - b.pop,
  );
  return (
    <>
      <section className="pt-10 pb-5">
        <h1 className="m-0 text-[clamp(30px,4vw,44px)]">{cur ? cur.name : "Каталог"}</h1>
        <p className="mt-[10px] text-[15px] text-n-300">{cur ? cur.note : "Все товары магазина"}</p>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
        <div className="flex flex-wrap gap-[6px]">
          {[{ id: "", name: "Все" }, ...CATS].map((c) => (
            <Link key={c.id} href={c.id ? `/catalog/${c.id}/` : "/catalog/"} aria-current={(cat ?? "") === c.id} className="chip">
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-[6px] text-[13px] text-n-300">
          <span>Сортировка:</span>
          {SORTS.map((s) => (
            <button
              key={s.k}
              onClick={() => setSort(s.k)}
              className={`rounded-sm px-2 py-[6px] ${sort === s.k ? "bg-a-900 text-a-200" : "text-n-300 hover:text-fg"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <section className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 pb-16">
        {list.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </section>
    </>
  );
}
