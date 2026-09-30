"use client";

import Link from "next/link";
import { useState } from "react";
import { asset, type Product } from "@/lib/catalog";

// Короткие подписи серий для табов на мобильном
const TAB_LABEL: Record<string, string> = {
  "gel-lak": "Гель-лак",
  "polygel-15": "Полигель",
  "gel-easy-15": "Easy",
  "gel-flame-15": "Flame",
  "gel-creamy-15": "Creamy",
  "gel-opal-15": "Opal",
  "gel-50": "Гель 50 г",
};

// Десктоп — все серии сетками друг под другом.
// Мобильный — табы серий, под ними одна выбранная серия горизонтальным слайдером.
export function Palette({ series }: { series: Product[] }) {
  const [active, setActive] = useState(series[0]?.slug);
  return (
    <>
      <div
        role="tablist"
        aria-label="Серии"
        className="bleed mb-4 flex gap-[6px] overflow-x-auto pb-1 [scrollbar-width:none] md:hidden"
      >
        {series.map((p) => (
          <button
            key={p.slug}
            role="tab"
            aria-selected={p.slug === active}
            onClick={() => setActive(p.slug)}
            className="chip flex-none"
          >
            {TAB_LABEL[p.slug] ?? p.name}
            <span className="ml-1 text-fg/55">{p.shades!.length}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-6">
        {series.map((p) => (
          <div key={p.slug} role="tabpanel" className={p.slug === active ? "" : "max-md:hidden"}>
            <Link
              href={`/product/${p.slug}/`}
              className="mb-[10px] inline-block text-[13px] uppercase tracking-[0.05em] text-fg/72 hover:text-a-200 max-md:hidden"
            >
              {p.name} {p.vol}
            </Link>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-[10px] max-md:bleed max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-[clamp(16px,5vw,64px)] max-md:overflow-x-auto max-md:pb-1 max-md:[scrollbar-width:none]">
              {p.shades!.map((s) => (
                <Link
                  key={s.uid}
                  href={`/product/${p.slug}/?c=${s.uid}`}
                  title={`${p.name}, ${s.name}`}
                  className="group flex flex-col items-center gap-[6px] text-fg/78 hover:text-fg max-md:w-[72px] max-md:flex-none max-md:snap-start"
                >
                  {s.swatch ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset(s.swatch)} alt="" loading="lazy" className="ring-swatch aspect-square w-full rounded-md object-cover transition-transform duration-150 ease-out group-hover:-translate-y-0.5" />
                  ) : (
                    <span className="ring-swatch aspect-square w-full rounded-md bg-n-800" />
                  )}
                  <span className="text-center text-[11px] leading-[14px]">{s.name}</span>
                </Link>
              ))}
            </div>
            <Link href={`/product/${p.slug}/`} className="mt-3 inline-block text-[14px] text-a-300 md:hidden">
              {p.name} {p.vol} →
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
