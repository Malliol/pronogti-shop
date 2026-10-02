import data from "@/data/catalog.json";
import direct from "@/data/marketplace-links.json";

// Каталог генерируется из выгрузки старого сайта: npm run catalog
export type Variant = {
  uid: string;
  price: number;
  priceOld: number | null;
  stock: number | null; // null — остаток не ведётся (в наличии), 0 — нет в наличии
  images: string[];
  swatch: string | null;
  oldUrl: string;
};
export type Shade = Variant & { name: string };
export type Product = {
  slug: string;
  cat: string;
  name: string;
  vol: string;
  descr: string;
  pop: number;
  shades?: Shade[];
} & Partial<Variant>;
export type Category = { id: string; name: string; note: string; count: number };

export const CATS = data.cats as Category[];
export const PRODUCTS = data.products as Product[];

export const bySlug = (slug: string) => PRODUCTS.find((p) => p.slug === slug);
export const catName = (id: string) => CATS.find((c) => c.id === id)?.name ?? "";

/** Вариант для покупки: оттенок по uid или сам товар. */
export function variantOf(p: Product, shadeUid?: string | null): Variant & { name?: string } {
  if (p.shades?.length) return p.shades.find((s) => s.uid === shadeUid) ?? p.shades[0];
  return p as Variant;
}
export const inStock = (v: { stock: number | null }) => v.stock !== 0;

export function priceInfo(p: Product) {
  const prices = p.shades ? p.shades.map((s) => s.price) : [p.price ?? 0];
  const min = Math.min(...prices);
  return { min, from: Math.max(...prices) !== min };
}
export const priceText = (p: Product) => {
  const { min, from } = priceInfo(p);
  return (from ? "от " : "") + rub(min);
};
export const coverOf = (p: Product) => (p.shades ? p.shades.find((s) => s.images[0])?.images[0] : p.images?.[0]);

export const rub = (n: number) => n.toLocaleString("ru-RU") + " ₽";

// Файлы из public/ с учётом подпапки GitHub Pages
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (p: string) => BASE + p;

export const SHIP = { cdek: 350, post: 280 } as const;

// По умолчанию ссылки ведут на поиск по маркетплейсу. Прямые ссылки на карточки —
// в src/data/marketplace-links.json: { "<slug>": { "WB": "https://…", "Ozon": "https://…" } },
// ключ — label маркетплейса из списка ниже.
export const MARKETPLACES = [
  { label: "Ozon", full: "Ozon", url: "https://www.ozon.ru/search/?text=" },
  { label: "WB", full: "Wildberries", url: "https://www.wildberries.ru/catalog/0/search.aspx?search=" },
  { label: "Авито", full: "Авито", url: "https://www.avito.ru/rossiya?q=" },
  { label: "Я.Маркет", full: "Яндекс Маркет", url: "https://market.yandex.ru/search?text=" },
];
const DIRECT = direct as Record<string, Record<string, string>>;
export const mpLinks = (p: Product) =>
  MARKETPLACES.map((m) => ({
    ...m,
    href: DIRECT[p.slug]?.[m.label] ?? m.url + encodeURIComponent(`Kadilak Neo ${p.name} ${p.vol}`.trim()),
  }));

export const CONTACTS = {
  manager: "Татьяна",
  phones: [
    { text: "+7 953 450-73-11", tel: "+79534507311" },
    { text: "+7 922 537-54-61", tel: "+79225375461" },
  ],
  telegram: "https://t.me/+Lbfz2WjDNkM3YTli",
  vk: "https://vk.com/pronogti56",
  instagram: "https://www.instagram.com/pronogti_56/",
};

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://imiron.ru") + BASE;
