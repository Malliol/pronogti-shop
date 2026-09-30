"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bySlug, inStock, rub, variantOf, type Product } from "@/lib/catalog";
import { useCart } from "./cart";

const WHO = [
  { v: "self", label: "Для себя", hint: "Маникюр дома, небольшие объёмы" },
  { v: "pro", label: "Я мастер", hint: "Работаю с клиентами, нужны большие флаконы" },
];
const TASKS = [
  { v: "strong", label: "Укрепить свои ногти", hint: "Натуральная длина, ногти ломаются или слоятся" },
  { v: "ext", label: "Нарастить длину", hint: "Моделирование гелем" },
  { v: "color", label: "Цветное покрытие", hint: "Гель-лак на базу" },
  { v: "all", label: "Собрать всё с нуля", hint: "Первый набор для маникюра" },
];

// Наборы из реального ассортимента. Согласовать с магазином: обезжиривателя и пилок на сайте пока нет.
function quizSet(who: string, task: string): { slug: string; why: string }[] {
  const pro = who === "pro";
  const base = { slug: pro ? "baza-elastik-30-g" : "baza-elastik-15-ml", why: pro ? "Подложка под любое покрытие, большой флакон" : "Подложка под гель, полигель и гель-лак" };
  const top = { slug: pro ? "top-sk-30-g" : "top-sk-15-ml", why: "Защищает покрытие и даёт глянец" };
  const wipes = { slug: "salfetki-bezvorsovye-plotnye-belye", why: "Для обезжиривания и снятия липкого слоя" };
  const poly = { slug: "polygel-15", why: "Укрепляет натуральный ноготь, оттенок — в карточке" };
  const gel = { slug: pro ? "prozrachnyy-gel-50-g" : "prozrachnyy-gel-clear-15-g", why: pro ? "Для моделирования длины, выгодный объём" : "Для моделирования длины" };
  const lak = { slug: "gel-lak", why: "Цвет выберите в карточке товара" };
  const sets: Record<string, { slug: string; why: string }[]> = {
    strong: [base, poly, top, wipes],
    ext: [base, gel, top, wipes],
    color: [base, lak, top, wipes],
    all: [base, poly, lak, top, wipes],
  };
  return sets[task] ?? [];
}

export function QuizView() {
  const cart = useCart();
  const [who, setWho] = useState<string | null>(null);
  const [task, setTask] = useState<string | null>(null);
  const [step, setStep] = useState(0);

  // /quiz/?task=… — задача выбрана на главной, остаётся шаг «Для кого»
  useEffect(() => {
    const t = new URLSearchParams(location.search).get("task");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- параметр адреса доступен только после гидрации
    if (t && TASKS.some((x) => x.v === t)) setTask(t);
  }, []);

  const done = step >= 2 && !!who && !!task;
  const restart = () => {
    setWho(null);
    setTask(null);
    setStep(0);
    history.replaceState(null, "", location.pathname);
  };

  if (!done) {
    const q = step === 0 ? { q: "Для кого покупаете?", opts: WHO, pick: (v: string) => { setWho(v); setStep(task ? 2 : 1); } }
                         : { q: "Что хотите сделать?", opts: TASKS, pick: (v: string) => { setTask(v); setStep(2); } };
    return (
      <section className="max-w-[760px] pt-12 pb-[72px]">
        <div className="kicker">Подбор · шаг {step + 1} из 2</div>
        <h1 className="mt-3 mb-7 text-[clamp(28px,3.6vw,40px)]">{q.q}</h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[10px]">
          {q.opts.map((o) => (
            <button key={o.v} onClick={() => q.pick(o.v)} className="opt flex min-h-24 flex-col gap-[6px] p-[18px] text-left">
              <span className="text-[17px] font-medium">{o.label}</span>
              <span className="text-[14px] leading-5 text-n-300">{o.hint}</span>
            </button>
          ))}
        </div>
        {step > 0 && (
          <button className="btn btn-ghost mt-5" onClick={() => setStep(step - 1)}>
            ← Назад
          </button>
        )}
      </section>
    );
  }

  const items = quizSet(who!, task!).flatMap(({ slug, why }) => {
    const p = bySlug(slug);
    if (!p) return [];
    // для серии берём первый оттенок в наличии
    const shade = p.shades?.find(inStock) ?? p.shades?.[0];
    const v = variantOf(p, shade?.uid);
    return [{ p, why, shade: shade?.uid ?? null, price: v.price }] as { p: Product; why: string; shade: string | null; price: number }[];
  });
  const total = items.reduce((a, x) => a + x.price, 0);
  const taskLabel = TASKS.find((t) => t.v === task)?.label;

  return (
    <section className="max-w-[760px] pt-12 pb-[72px]">
      <div className="kicker">Ваш набор</div>
      <h1 className="mt-3 mb-[10px] text-[clamp(28px,3.6vw,40px)]">
        {taskLabel} — {who === "pro" ? "для мастера" : "для себя"}
      </h1>
      <p className="mb-6 max-w-[56ch] text-[15px] leading-6 text-n-300">
        {who === "pro"
          ? "Подобрали большие объёмы там, где это выгоднее. Оттенки полигеля и гель-лаков можно поменять в карточке товара."
          : "Всё необходимое без лишнего. Оттенок можно поменять в карточке товара."}
      </p>
      <div className="flex flex-col">
        {items.map((x, i) => (
          <div key={x.p.slug} className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-[14px] border-t border-n-800 py-[14px]">
            <span className="tnum text-[13px] text-accent">{String(i + 1).padStart(2, "0")}</span>
            <Link href={`/product/${x.p.slug}/`} className="flex flex-col gap-[2px] text-fg hover:text-a-200">
              <span className="text-[15px] font-medium">{[x.p.name, x.p.vol].filter(Boolean).join(", ")}</span>
              <span className="text-[13px] text-n-300">{x.why}</span>
            </Link>
            <span className="tnum whitespace-nowrap text-[15px]">{rub(x.price)}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-[10px] border-t border-n-800 pt-[18px]">
        <span className="tnum text-[18px] font-medium">Итого {rub(total)}</span>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-ghost" onClick={restart}>
            Пройти заново
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              items.forEach((x) => cart.add(x.p.slug, x.shade, 1, true));
              cart.setOpen(true);
            }}
          >
            Добавить набор в корзину
          </button>
        </div>
      </div>
    </section>
  );
}
