"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { rub, SHIP } from "@/lib/catalog";
import { useCart } from "./cart";
import { Swatch } from "./chrome";

type Mode = "pay" | "manager";
type Deliv = keyof typeof SHIP;

const MODES: { k: Mode; label: string; hint: string }[] = [
  { k: "pay", label: "Оплатить онлайн", hint: "Сразу рассчитаем доставку, чек придёт на почту" },
  { k: "manager", label: "Заявка менеджеру", hint: "Татьяна свяжется, уточнит заказ и доставку" },
];
const CHANNELS = [
  { k: "tg", label: "Telegram" },
  { k: "vk", label: "ВКонтакте" },
  { k: "wa", label: "WhatsApp" },
  { k: "call", label: "Звонок" },
];
const DELIVS: { k: Deliv; label: string; hint: string }[] = [
  { k: "cdek", label: "СДЭК", hint: "До пункта выдачи" },
  { k: "post", label: "Почта России", hint: "До отделения" },
];

export function CheckoutView() {
  const cart = useCart();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("pay");
  const [channel, setChannel] = useState("tg");
  const [deliv, setDeliv] = useState<Deliv>("cdek");
  const [form, setForm] = useState({ name: "", phone: "", email: "", vk: "", city: "", address: "" });
  const [err, setErr] = useState("");
  const manager = mode === "manager";
  const ship = SHIP[deliv];
  const f = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value }),
  });

  const submit = () => {
    if (!cart.lines.length) return setErr("Корзина пуста.");
    if (!form.name.trim() || form.phone.replace(/\D/g, "").length < 10) return setErr("Укажите имя и телефон.");
    // TODO: отправка заказа (API магазина / платёжный провайдер). Пока — только экран «Заказ принят».
    const no = 1000 + Math.floor(Math.random() * 9000);
    try {
      sessionStorage.setItem("kn-order", JSON.stringify({ no, mode }));
    } catch {}
    cart.clear();
    router.push("/order/");
  };

  return (
    <section className="pt-10 pb-[72px]">
      <h1 className="mb-7 text-[clamp(30px,4vw,44px)]">Оформление заказа</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-[clamp(24px,5vw,56px)]">
        <div className="flex flex-col gap-7">
          <div>
            <div className="mb-[10px] text-[14px]">Как оформить</div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
              {MODES.map((o) => (
                <button key={o.k} aria-pressed={mode === o.k} onClick={() => setMode(o.k)} className="opt flex flex-col gap-1 p-[14px] text-left">
                  <span className="text-[15px] font-medium">{o.label}</span>
                  <span className="text-[13px] leading-[18px] text-n-300">{o.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
            <div className="field">
              <label htmlFor="f-name">Ваше имя *</label>
              <input id="f-name" className="input" placeholder="Анна" autoComplete="name" {...f("name")} />
            </div>
            <div className="field">
              <label htmlFor="f-phone">Ваш телефон *</label>
              <input id="f-phone" className="input" placeholder="+7 ___ ___-__-__" inputMode="tel" autoComplete="tel" {...f("phone")} />
            </div>
            <div className="field">
              <label htmlFor="f-email">Ваш Email</label>
              <input id="f-email" className="input" placeholder="Для чека об оплате" type="email" autoComplete="email" {...f("email")} />
            </div>
            <div className="field">
              <label htmlFor="f-vk">Ссылка ВКонтакте</label>
              <input id="f-vk" className="input" placeholder="vk.com/…" {...f("vk")} />
            </div>
          </div>
          {manager && (
            <div>
              <div className="mb-[10px] text-[14px]">Где удобнее общаться</div>
              <div className="flex flex-wrap gap-[6px]">
                {CHANNELS.map((o) => (
                  <button key={o.k} aria-pressed={channel === o.k} onClick={() => setChannel(o.k)} className="chip px-[14px] py-2 text-[14px]">
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="mb-[10px] text-[14px]">Доставка</div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2">
              {DELIVS.map((o) => (
                <button key={o.k} aria-pressed={deliv === o.k} onClick={() => setDeliv(o.k)} className="opt flex justify-between gap-[10px] p-[14px] text-left">
                  <span className="flex flex-col gap-[3px]">
                    <span className="text-[15px] font-medium">{o.label}</span>
                    <span className="text-[13px] text-n-300">{o.hint}</span>
                  </span>
                  {!manager && <span className="whitespace-nowrap text-[14px]">≈ {rub(SHIP[o.k])}</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
            <div className="field">
              <label htmlFor="f-city">Город</label>
              <input id="f-city" className="input" placeholder="Оренбург" autoComplete="address-level2" {...f("city")} />
            </div>
            <div className="field">
              <label htmlFor="f-addr">{deliv === "cdek" ? "Адрес пункта СДЭК" : "Адрес и индекс"}</label>
              <input id="f-addr" className="input" placeholder={deliv === "cdek" ? "ул. Ленина, 10" : "460000, ул. …, д. …, кв. …"} {...f("address")} />
            </div>
          </div>
        </div>

        <aside className="sticky top-[88px] flex flex-col gap-[14px] rounded-md border border-n-800 bg-surface p-5">
          <div className="text-[16px] font-medium">Ваш заказ</div>
          {cart.lines.length === 0 && (
            <span className="text-[14px] text-n-300">
              Корзина пуста. <Link href="/catalog/">В каталог</Link>
            </span>
          )}
          {cart.lines.map((l) => (
            <div key={l.key} className="flex justify-between gap-3 text-[14px]">
              <span className="flex items-center gap-2">
                <Swatch src={l.swatch} size={10} className="flex-none rounded-full" />
                {l.product.name}
                {l.shadeName ? `, ${l.shadeName}` : ""} × {l.qty}
              </span>
              <span className="tnum whitespace-nowrap">{rub(l.sum)}</span>
            </div>
          ))}
          <div className="flex flex-col gap-[6px] border-t border-divider pt-3 text-[14px] text-n-200">
            <div className="flex justify-between">
              <span>Товары</span>
              <span className="tnum">{rub(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Доставка</span>
              <span className="tnum">{manager ? "рассчитает менеджер" : "≈ " + rub(ship)}</span>
            </div>
          </div>
          <div className="flex justify-between text-[18px] font-medium">
            <span>Итого</span>
            <span className="tnum">{rub(cart.subtotal + (manager ? 0 : ship))}</span>
          </div>
          {err && <div className="text-[13px] text-a-200">{err}</div>}
          <button className="btn btn-primary btn-block min-h-11" onClick={submit}>
            {manager ? "Отправить заявку" : "Перейти к оплате"}
          </button>
          <span className="text-[12px] leading-[17px] text-n-300">
            Нажимая кнопку, вы соглашаетесь с <Link href="/oferta/">публичной офертой</Link> и{" "}
            <Link href="/privacy/">политикой конфиденциальности</Link>.
          </span>
        </aside>
      </div>
    </section>
  );
}

export function OrderDone() {
  const [order, setOrder] = useState<{ no: number; mode: Mode } | null>(null);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- номер заказа лежит в sessionStorage, доступен только на клиенте
      setOrder(JSON.parse(sessionStorage.getItem("kn-order") || "null"));
    } catch {}
  }, []);
  const manager = order?.mode === "manager";
  return (
    <section className="max-w-[620px] pt-[72px] pb-24">
      {order && <div className="kicker">Заказ № {order.no}</div>}
      <h1 className="mt-3 mb-4 text-[clamp(30px,4vw,44px)]">{!order ? "Заказ принят" : manager ? "Заявка отправлена" : "Заказ оплачен"}</h1>
      <p className="mb-7 text-[16px] leading-[26px] text-n-200">
        {manager
          ? "Менеджер Татьяна свяжется с вами, уточнит заказ и стоимость доставки."
          : "Чек об оплате придёт на вашу почту. Сбор и отправка — 1–3 рабочих дня, трек-номер пришлёт менеджер."}
      </p>
      <Link className="btn btn-primary" href="/">
        На главную
      </Link>
    </section>
  );
}
