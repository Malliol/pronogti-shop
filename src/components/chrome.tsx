"use client";

// Шапка, нижнее меню (мобильный), выезжающая корзина и тост — всё, что живёт на каждой странице
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { asset, rub } from "@/lib/catalog";
import { useCart } from "./cart";
import { Handbag, House, Moon, Question, SquaresFour, Sun } from "./icons";

const NAV = [
  { href: "/catalog/", label: "Каталог", match: (p: string) => (p.startsWith("/catalog") && !p.startsWith("/catalog/lak")) || p.startsWith("/product") },
  { href: "/catalog/lak/", label: "Гель-лаки", match: (p: string) => p.startsWith("/catalog/lak") },
  { href: "/quiz/", label: "Подбор", match: (p: string) => p.startsWith("/quiz") },
  { href: "/delivery/", label: "Доставка", match: (p: string) => p.startsWith("/delivery") },
];

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- тему выставил инлайн-скрипт в <head>, здесь только синхронизируем кнопку
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);
  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("kn-theme", next);
    } catch {}
    setTheme(next);
  };
  return { theme, toggle };
}

export function Header() {
  const path = usePathname();
  const cart = useCart();
  const { theme, toggle } = useTheme();
  const title = theme === "light" ? "Тёмная тема" : "Светлая тема";
  return (
    <nav className="sticky top-0 z-20 flex flex-nowrap items-center gap-x-[22.4px] gap-y-[11.2px] border-b border-divider bg-bg/86 px-[clamp(16px,5vw,64px)] py-[14px] backdrop-blur-[10px] max-md:gap-x-[11.2px]">
      <Link href="/" className="flex items-center gap-[10px] text-[17px] font-medium tracking-[0.04em] text-fg hover:text-fg">
        <Image src={asset("/logo.png")} alt="" width={40} height={40} className="block size-10" priority />
        Kadilak Neo
      </Link>
      <div className="flex min-w-0 flex-1 gap-[16.8px] overflow-x-auto text-[14px]">
        {NAV.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap py-[6px] max-md:hidden ${l.match(path) ? "text-accent" : "text-fg"} hover:text-a-200`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <button onClick={toggle} title={title} aria-label={title} className="btn btn-ghost btn-icon">
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      <button className="btn btn-primary min-h-10 gap-2" onClick={() => cart.setOpen(true)} aria-label="Корзина">
        <Handbag size={18} />
        <span className="max-md:hidden">Корзина</span>
        {cart.count > 0 && (
          <span className="tnum rounded-full bg-a-800 px-[7px] text-[12px] leading-[18px] text-a-100">{cart.count}</span>
        )}
      </button>
    </nav>
  );
}

export function MobileNav() {
  const path = usePathname();
  const cart = useCart();
  const tabs = [
    { href: "/", label: "Главная", Icon: House, active: path === "/" },
    { href: "/catalog/", label: "Каталог", Icon: SquaresFour, active: path.startsWith("/catalog") || path.startsWith("/product") },
    { href: "/quiz/", label: "Подбор", Icon: Question, active: path.startsWith("/quiz") },
  ];
  const cls = (a: boolean) =>
    `relative flex h-[60px] flex-col items-center justify-center gap-[3px] text-[11px] ${a ? "text-accent" : "text-n-300"}`;
  const mark = (a: boolean) => <span className={`absolute top-0 h-[2px] w-5 rounded-[2px] ${a ? "bg-accent" : ""}`} />;
  return (
    <>
      <div className="h-16 md:hidden" />
      <nav className="fixed inset-x-0 bottom-0 z-25 grid grid-cols-4 border-t border-divider bg-surface/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-[12px] md:hidden">
        {tabs.map(({ href, label, Icon, active }) => {
          const a = active && !cart.open;
          return (
            <Link key={href} href={href} className={`${cls(a)} hover:text-accent`}>
              {mark(a)}
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
        <button className={cls(cart.open)} onClick={() => cart.setOpen(true)}>
          {mark(cart.open)}
          <Handbag />
          <span>Корзина{cart.count ? ` · ${cart.count}` : ""}</span>
        </button>
      </nav>
    </>
  );
}

export function Swatch({ src, size, className = "" }: { src: string | null; size: number; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset(src)} alt="" width={size} height={size} loading="lazy" className={`ring-swatch block object-cover ${className}`} style={{ width: size, height: size }} />
  ) : (
    <span className={`ring-swatch block bg-n-800 ${className}`} style={{ width: size, height: size }} />
  );
}

export function CartDrawer() {
  const cart = useCart();
  const path = usePathname();
  // Закрываем при переходе на другую страницу
  useEffect(() => {
    cart.setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  useEffect(() => {
    if (!cart.open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart]);
  if (!cart.open) return null;
  return (
    <>
      <div onClick={() => cart.setOpen(false)} className="fixed inset-0 z-40 bg-black/55" />
      <aside role="dialog" aria-label="Корзина" className="fixed inset-y-0 right-0 z-41 flex w-[min(420px,100%)] flex-col border-l border-n-800 bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-divider px-5 py-[18px]">
          <span className="text-[20px] font-medium">Корзина</span>
          <button className="btn btn-ghost btn-icon" onClick={() => cart.setOpen(false)} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {cart.lines.length === 0 && (
            <div className="flex flex-col items-start gap-[14px] py-12">
              <span className="text-[15px] text-n-300">В корзине пока пусто.</span>
              <Link className="btn btn-primary" href="/catalog/" onClick={() => cart.setOpen(false)}>
                В каталог
              </Link>
            </div>
          )}
          {cart.lines.map((l) => (
            <div key={l.key} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-b border-n-800 py-[14px]">
              <Swatch src={l.swatch} size={44} className="rounded-sm" />
              <div className="flex min-w-0 flex-col gap-[3px]">
                <Link href={`/product/${l.product.slug}/${l.shade ? `?c=${l.shade}` : ""}`} className="text-[14px] font-medium text-fg hover:text-a-200">
                  {l.product.name}
                </Link>
                <span className="text-[12px] text-n-300">
                  {[l.product.vol, l.shadeName, rub(l.price)].filter(Boolean).join(" · ")}
                </span>
                <div className="mt-1 flex items-center gap-1">
                  <button onClick={() => cart.setQty(l.key, -1)} aria-label="Меньше" className="size-7 rounded-sm border border-n-700">
                    −
                  </button>
                  <span className="tnum min-w-6 text-center text-[14px]">{l.qty}</span>
                  <button onClick={() => cart.setQty(l.key, 1)} aria-label="Больше" className="size-7 rounded-sm border border-n-700">
                    +
                  </button>
                  <button onClick={() => cart.setQty(l.key, -l.qty)} className="ml-2 text-[12px] text-n-300 hover:text-accent">
                    Удалить
                  </button>
                </div>
              </div>
              <span className="tnum whitespace-nowrap text-[14px]">{rub(l.sum)}</span>
            </div>
          ))}
        </div>
        {cart.count > 0 && (
          <div className="flex flex-col gap-3 border-t border-divider px-5 py-[18px]">
            <div className="flex justify-between text-[17px] font-medium">
              <span>Товары</span>
              <span className="tnum">{rub(cart.subtotal)}</span>
            </div>
            <span className="text-[13px] text-n-300">Доставку рассчитаем на следующем шаге</span>
            <Link className="btn btn-primary btn-block min-h-11" href="/checkout/" onClick={() => cart.setOpen(false)}>
              Оформить заказ
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

export function Toast() {
  const cart = useCart();
  if (!cart.toast) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-[14px] rounded-md border border-a-700 bg-n-800 px-[18px] py-3 text-[14px] shadow-md max-md:bottom-[76px]"
    >
      <span>{cart.toast}</span>
      <button onClick={() => cart.setOpen(true)} className="whitespace-nowrap text-a-300">
        Корзина →
      </button>
    </div>
  );
}
