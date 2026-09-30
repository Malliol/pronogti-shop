"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { asset, catName, CONTACTS, coverOf, inStock, mpLinks, priceText, rub, variantOf, type Product } from "@/lib/catalog";
import { useCart } from "./cart";
import { Swatch } from "./chrome";
import { Photo } from "./ProductCard";

export function ProductView({ p, related }: { p: Product; related: Product[] }) {
  const cart = useCart();
  const shades = p.shades ?? [];
  const [shadeUid, setShadeUid] = useState<string | null>(shades[0]?.uid ?? null);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);

  // Оттенок из ?c= (ссылки из палитры и корзины). Страница статическая, поэтому читаем на клиенте.
  useEffect(() => {
    const c = new URLSearchParams(location.search).get("c");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- параметр адреса доступен только после гидрации
    if (c && p.shades?.some((s) => s.uid === c)) setShadeUid(c);
  }, [p]);

  const v = variantOf(p, shadeUid);
  const pick = (uid: string) => {
    setShadeUid(uid);
    setImg(0);
    history.replaceState(null, "", `?c=${uid}`);
  };
  const available = inStock(v);
  const cover = v.images[img] ?? v.images[0];

  return (
    <>
      <div className="flex flex-wrap gap-2 pt-6 pb-5 text-[13px] text-n-300">
        <Link href="/catalog/">Каталог</Link>
        <span>/</span>
        <Link href={`/catalog/${p.cat}/`}>{catName(p.cat)}</Link>
        <span>/</span>
        <span>{p.name}</span>
      </div>
      <section className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-[clamp(24px,5vw,64px)] pb-14">
        <div className="flex flex-col gap-3">
          <Photo src={cover} alt={`${p.name}${v.name ? ", " + v.name : ""}`} className="rounded-md bg-surface" />
          {v.images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {v.images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setImg(i)}
                  aria-label={`Фото ${i + 1}`}
                  className={`size-16 overflow-hidden rounded-sm border-2 ${i === img ? "border-accent" : "border-transparent"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(src)} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {shades.length > 0 && (
            <div className="flex items-center gap-[14px] rounded-md border border-n-800 p-[14px]">
              <Swatch src={v.swatch} size={56} className="rounded-md" />
              <span className="flex flex-col gap-[2px]">
                <span className="text-[15px] font-medium">{v.name}</span>
                <span className="text-[13px] text-n-300">Оттенок на экране может немного отличаться</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <div className="kicker">{catName(p.cat)}</div>
            <h1 className="mt-[10px] mb-[6px] text-[clamp(28px,3.4vw,40px)]">{p.name}</h1>
            {p.vol && <div className="text-[15px] text-n-300">{p.vol}</div>}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="tnum text-[30px] font-medium">{rub(v.price)}</span>
            {v.priceOld ? <span className="tnum text-[17px] text-n-400 line-through">{rub(v.priceOld)}</span> : null}
          </div>

          {shades.length > 0 && (
            <div>
              <div className="mb-[10px] text-[14px]">
                Цвет: <span className="text-n-300">{v.name}</span> <span className="text-n-400">· {shades.length} {plural(shades.length)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {shades.map((s) => (
                  <button
                    key={s.uid}
                    onClick={() => pick(s.uid)}
                    title={s.name + (inStock(s) ? "" : " — нет в наличии")}
                    aria-label={s.name}
                    aria-pressed={s.uid === v.uid}
                    className={`relative size-10 rounded-full border-2 p-[3px] ${s.uid === v.uid ? "border-accent" : "border-transparent"} ${inStock(s) ? "" : "opacity-40"}`}
                  >
                    <Swatch src={s.swatch} size={30} className="rounded-full" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-[10px]">
            {available ? (
              <>
                <div className="flex h-10 items-center rounded-md border border-n-700">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 text-center text-[18px]" aria-label="Меньше">
                    −
                  </button>
                  <span className="tnum min-w-7 text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 text-center text-[18px]" aria-label="Больше">
                    +
                  </button>
                </div>
                <button className="btn btn-primary min-h-10 px-[22px]" onClick={() => cart.add(p.slug, shades.length ? v.uid : null, qty)}>
                  В корзину · {rub(v.price * qty)}
                </button>
              </>
            ) : (
              <span className="text-[15px] text-n-300">Нет в наличии{shades.length ? " — выберите другой оттенок" : ""}</span>
            )}
            <a href={CONTACTS.telegram} target="_blank" rel="noopener" className="btn btn-ghost min-h-10">
              Спросить менеджера
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[14px] text-n-300">Или купите на маркетплейсе</span>
            <div className="flex flex-wrap gap-2">
              {mpLinks(p).map((m) => (
                <a key={m.label} href={m.href} target="_blank" rel="noopener" className="btn btn-secondary min-h-10">
                  {m.full}
                </a>
              ))}
            </div>
          </div>

          {p.descr && <p className="m-0 max-w-[56ch] whitespace-pre-line text-[15px] leading-[25px] text-n-200">{p.descr}</p>}

          <div className="flex flex-col gap-[6px] border-t border-divider pt-4 text-[14px] text-n-300">
            <span>Отправка 1–3 рабочих дня после оплаты · СДЭК или Почта России</span>
            <span>Возврат товара надлежащего качества — 7 дней после получения</span>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <h2 className="mb-4 text-[22px]">С этим берут</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {related.map((r) => (
            <Link key={r.slug} href={`/product/${r.slug}/`} className="tile flex items-center gap-3 p-[10px] text-fg hover:text-fg">
              {/* обёртка фиксирует 64×64: у Photo свой w-full, className его не перебивает */}
              <div className="size-16 flex-none overflow-hidden rounded-sm">
                <Photo src={coverOf(r)} alt="" />
              </div>
              <span className="flex flex-col gap-[3px]">
                <span className="text-[14px] font-medium">{r.name}</span>
                <span className="text-[13px] text-n-300">{[r.vol, priceText(r)].filter(Boolean).join(" · ")}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function plural(n: number) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "оттенок";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "оттенка";
  return "оттенков";
}
