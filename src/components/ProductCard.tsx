"use client";

import Link from "next/link";
import { asset, catName, coverOf, inStock, mpLinks, priceText, variantOf, type Product } from "@/lib/catalog";
import { useCart } from "./cart";
import { Swatch } from "./chrome";

export function Photo({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  return (
    <div className={`aspect-square w-full overflow-hidden bg-n-900 ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(src)} alt={alt} loading="lazy" className="size-full object-cover" />
      ) : (
        <div className="grid size-full place-items-center text-[13px] text-n-400">Фото скоро будет</div>
      )}
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const cart = useCart();
  const href = `/product/${p.slug}/`;
  const shades = p.shades ?? [];
  const available = shades.length ? shades.some(inStock) : inStock(variantOf(p));
  return (
    <div className="tile flex flex-col overflow-hidden">
      <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
        <Photo src={coverOf(p)} alt={p.name} />
      </Link>
      <div className="flex flex-1 flex-col gap-[6px] p-[14px]">
        <span className="text-[12px] uppercase tracking-[0.05em] text-n-300">{catName(p.cat)}</span>
        <Link href={href} className="text-[15px] leading-[21px] font-medium text-fg hover:text-a-200">
          {p.name}
        </Link>
        <span className="text-[13px] text-n-300">{p.vol || " "}</span>
        <span className="flex min-h-[14px] items-center gap-[3px]">
          {shades.slice(0, 5).map((s) => (
            <Swatch key={s.uid} src={s.swatch} size={12} className="rounded-full" />
          ))}
          {shades.length > 5 && <span className="ml-[3px] text-[12px] text-n-300">+{shades.length - 5}</span>}
        </span>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="tnum text-[17px] font-medium">{priceText(p)}</span>
          {!available ? (
            <span className="text-[13px] text-n-300">Нет в наличии</span>
          ) : shades.length ? (
            <Link href={href} className="btn btn-secondary">
              Выбрать цвет
            </Link>
          ) : (
            <button className="btn btn-secondary" onClick={() => cart.add(p.slug, null)}>
              В корзину
            </button>
          )}
        </div>
        <div className="mt-1 flex flex-col gap-[6px] border-t border-n-800 pt-[10px]">
          <span className="text-[12px] text-n-300">Купить на маркетплейсе</span>
          <div className="grid grid-cols-4 gap-1">
            {mpLinks(p).map((m) => (
              <a
                key={m.label}
                href={m.href}
                target="_blank"
                rel="noopener"
                title={m.full}
                className="flex min-h-8 items-center justify-center whitespace-nowrap rounded-sm border border-n-700 text-[12px] text-fg transition-colors hover:border-accent hover:text-a-200"
              >
                {m.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
