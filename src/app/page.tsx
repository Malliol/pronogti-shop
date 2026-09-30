import Link from "next/link";
import { asset, CATS, PRODUCTS } from "@/lib/catalog";

// Главная, вариант C (палитра). Палитра собрана из всех серий с оттенками:
// гель-лаков на сайте пока два, поэтому показываем и гели, и полигель.
const PALETTE_ORDER = ["gel-lak", "polygel-15", "gel-easy-15", "gel-flame-15", "gel-creamy-15", "gel-opal-15", "gel-50"];
const palette = PALETTE_ORDER.map((slug) => PRODUCTS.find((p) => p.slug === slug)).filter((p) => p?.shades?.length);

const TASKS = [
  { v: "strong", label: "Укрепить свои ногти" },
  { v: "ext", label: "Нарастить длину" },
  { v: "color", label: "Цветное покрытие" },
  { v: "all", label: "Собрать всё с нуля" },
];

const FAQ = [
  { q: "Под ваши гели нужна база?", a: "Смотреть базы", href: "/catalog/base/" },
  { q: "Покажите палитру гель-лаков/гелей? На сайте не понимаю цвет", a: "Открыть палитру", href: "#palette" },
  { q: "Как выбрать то, что мне нужно? Я запуталась", a: "Пройти подбор", href: "/quiz/" },
];

export default function Home() {
  return (
    <>
      <section className="pt-[clamp(40px,7vw,88px)] pb-10">
        <h1 className="m-0 max-w-[18ch] text-[clamp(34px,5vw,64px)] leading-[1.08] tracking-[-0.02em]">
          Базы, гели, топы по адекватным ценам без переплаты за бренд
        </h1>
        <p className="mt-5 max-w-[52ch] text-[16px] leading-[26px] text-n-200">
          Регулярное обновление ассортимента. Отличное качество по доступной цене!
        </p>
      </section>

      <section id="palette" className="bleed scroll-mt-20 border-y border-a-800 bg-a-900 py-9">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="m-0 text-[24px]">Палитра оттенков</h2>
          <span className="text-[14px] text-fg/72">Нажмите на цвет, чтобы открыть товар</span>
        </div>
        <div className="flex flex-col gap-6">
          {palette.map((p) => (
            <div key={p!.slug}>
              <Link href={`/product/${p!.slug}/`} className="mb-[10px] inline-block text-[13px] uppercase tracking-[0.05em] text-fg/72 hover:text-a-200">
                {p!.name} {p!.vol}
              </Link>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-[10px]">
                {p!.shades!.map((s) => (
                  <Link
                    key={s.uid}
                    href={`/product/${p!.slug}/?c=${s.uid}`}
                    title={`${p!.name}, ${s.name}`}
                    className="group flex flex-col items-center gap-[6px] text-fg/78 hover:text-fg"
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
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-10 pt-14 pb-16">
        <div>
          <h2 className="mb-2 text-[24px]">Что нужно сделать?</h2>
          <p className="mb-5 text-[15px] leading-6 text-n-300">Выберите задачу — соберём набор.</p>
          <div className="flex flex-col gap-2">
            {TASKS.map((t) => (
              <Link key={t.v} href={`/quiz/?task=${t.v}`} className="opt flex justify-between gap-3 px-4 py-[14px] text-fg hover:text-fg">
                <span className="text-[15px]">{t.label}</span>
                <span className="text-accent">→</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-5 text-[24px]">Категории</h2>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <Link key={c.id} href={`/catalog/${c.id}/`} className="btn btn-secondary">
                {c.name} <span className="text-n-300">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3 pb-10">
        {FAQ.map((f) => (
          <Link key={f.q} href={f.href} className="tile flex flex-col justify-between gap-3 p-[18px] text-fg hover:text-fg">
            <span className="text-[16px] leading-[23px]">{f.q}</span>
            <span className="text-[14px] text-a-300">{f.a} →</span>
          </Link>
        ))}
      </section>

      <section className="flex flex-wrap gap-x-10 gap-y-3 border-t border-divider pt-6 pb-16 text-[14px] text-n-200">
        <span>Сборка и отправка — 1–3 рабочих дня</span>
        <span>СДЭК и Почта России</span>
        <span>Доставка в среднем 280–350 ₽</span>
        <Link href="/delivery/">О доставке →</Link>
      </section>
    </>
  );
}
