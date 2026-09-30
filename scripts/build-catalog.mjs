// Собирает каталог сайта из выгрузки старого сайта (data/products.json):
//  - объединяет серии («Гель Easy N 1…11») в один товар с оттенками;
//  - ужимает фото в public/img/<uid>/ (webp: 1000px для карточки, 160px для свотча).
// Запуск: npm run catalog. Результат (src/data/catalog.json и public/img) коммитится,
// чтобы сборка на GitHub Actions не зависела от sharp и исходников фото.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const src = JSON.parse(fs.readFileSync(path.join(ROOT, "data/products.json"), "utf8"));
const OUT_IMG = path.join(ROOT, "public/img");

// Категории сайта: порядок = порядок в меню. id — из адресов старого сайта.
const CATS = [
  { id: "base", old: "basa0", name: "Базы", note: "Rubber и Эластик — 15, 30 и 50 мл" },
  { id: "top", old: "top", name: "Топы", note: "Без липкого слоя, стойкий глянец" },
  { id: "gel", old: ["gel20", "gel50"], name: "Моделирующие гели", note: "Для укрепления и наращивания, 15 г и 50 г" },
  { id: "poly", old: "polygel2", name: "Полигель жидкий", note: "Для укрепления и донаращивания" },
  { id: "lak", old: "gel-lak", name: "Гель-лаки", note: "Плотные пигментированные цвета" },
  { id: "other", old: "other", name: "Прочие товары", note: "Баночки, салфетки и расходники" },
];

// Серии: товары, у которых отличается только номер оттенка.
// shade(title) → подпись оттенка в карточке.
const num = (t) => (t.match(/(?:N|№)\s*(\d+)/i) || [])[1];
const FAMILIES = [
  { slug: "gel-easy-15", name: "Гель Easy", vol: "15 г", test: /^Гель Easy/i, shade: (t) => `Easy ${num(t)}` },
  { slug: "gel-flame-15", name: "Гель Flame", vol: "15 г", test: /^Гель Flame/i, shade: (t) => `Flame ${num(t)}` },
  { slug: "gel-creamy-15", name: "Гель Creamy", vol: "15 г", test: /^Гель [CС]reamy/i, shade: (t) => `Creamy ${num(t)}` },
  { slug: "gel-opal-15", name: "Гель Opal", vol: "15 г", test: /^Гель Opal/i, shade: (t) => `Opal ${num(t)}` },
  { slug: "gel-50", name: "Гель моделирующий", vol: "50 г", test: /^Гель (N|shine)/i, shade: (t) => (/shine/i.test(t) ? `Shine ${num(t)}` : `№ ${num(t)}`) + (/молочн/i.test(t) ? " молочный" : /прозрачн/i.test(t) ? " прозрачный" : "") },
  { slug: "polygel-15", name: "Жидкий полигель", vol: "15 г", test: /^Жидкий полигель/i, shade: (t) => `№ ${num(t)}` },
  { slug: "gel-lak", name: "Гель-лак", vol: "", test: /^Гель лак/i, shade: (t) => `№ ${num(t)}` },
];

const TR = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" };
const slugify = (s) => s.toLowerCase().split("").map((c) => TR[c] ?? c).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// «Гель creamy № 1,15 гр.» → объём «15 г»
function volumeOf(t) {
  const m = t.match(/(\d+)\s*(мл|гр|г)(?![а-яё])/i);
  if (!m) return "";
  return `${m[1]} ${m[2].toLowerCase() === "мл" ? "мл" : "г"}`;
}
// Название без объёма и хвостовой пунктуации
function nameOf(t) {
  return t
    .replace(/,?\s*\d+\s*(мл|гр|г)(?![а-яё])\.?/i, "")
    .replace(/\s+-\s+/g, "-")               // «Гель - желе» → «Гель-желе»
    .replace(/\s*\(\s*/g, " (").replace(/\s*\)/g, ")")
    .replace(/"([^"]+)"/g, "«$1»")
    .replace(/\s+,/g, ",").replace(/[\s,.]+$/, "").replace(/\s{2,}/g, " ").trim();
}

async function images(p) {
  const out = [];
  const dir = path.join(OUT_IMG, String(p.uid));
  fs.mkdirSync(dir, { recursive: true });
  for (const [i, rel] of p.images.entries()) {
    const n = String(i + 1).padStart(2, "0");
    const big = path.join(dir, `${n}.webp`);
    if (!fs.existsSync(big)) await sharp(path.join(ROOT, rel)).rotate().resize(1000, 1000, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(big);
    out.push(`/img/${p.uid}/${n}.webp`);
  }
  if (p.images[0]) {
    const th = path.join(dir, "sw.webp");
    if (!fs.existsSync(th)) {
      // Свотч — квадрат из центра верхней части первого фото: там накраска,
      // а баночка/флакон обычно внизу кадра
      const file = path.join(ROOT, p.images[0]);
      const buf = await sharp(file).rotate().toBuffer();
      const { width: w, height: h } = await sharp(buf).metadata();
      const side = Math.round(Math.min(w, h) * 0.55);
      const left = Math.round(Math.min(Math.max(w * 0.5 - side / 2, 0), w - side));
      const top = Math.round(Math.min(Math.max(h * 0.4 - side / 2, 0), h - side));
      await sharp(buf).extract({ left, top, width: side, height: side }).resize(160, 160).webp({ quality: 75 }).toFile(th);
    }
  }
  return out;
}

const catOf = (old) => CATS.find((c) => [].concat(c.old).includes(old)).id;
// quantity: "" — остаток не ведётся (в наличии), "0" — нет в наличии
const stockOf = (q) => (q === "" || q == null ? null : Number(q));

const products = [];
const bySlug = new Map();
for (const p of src) {
  const variant = {
    uid: String(p.uid),
    price: p.price,
    priceOld: p.price_old,
    stock: stockOf(p.quantity),
    images: await images(p),
    swatch: p.images[0] ? `/img/${p.uid}/sw.webp` : null,
    descr: p.descr,
    oldUrl: p.url,
  };
  const fam = FAMILIES.find((f) => f.test.test(p.title));
  if (fam) {
    let prod = bySlug.get(fam.slug);
    if (!prod) {
      prod = { slug: fam.slug, cat: catOf(p.category), name: fam.name, vol: fam.vol, shades: [] };
      bySlug.set(fam.slug, prod);
      products.push(prod);
    }
    prod.shades.push({ ...variant, name: fam.shade(p.title) });
  } else {
    const name = nameOf(p.title);
    const vol = volumeOf(p.title);
    const slug = slugify(`${name} ${vol}`);
    products.push({ slug, cat: catOf(p.category), name, vol, ...variant });
  }
}

// Оттенки по номеру; у серии описание берём самое подробное из оттенков
for (const p of products) {
  if (!p.shades) continue;
  p.shades.sort((a, b) => (parseInt(a.name.replace(/\D/g, "")) || 0) - (parseInt(b.name.replace(/\D/g, "")) || 0));
  p.descr = p.shades.map((s) => s.descr).sort((a, b) => b.length - a.length)[0] || "";
  for (const s of p.shades) delete s.descr;
}

// «Популярность» пока = порядок на старом сайте внутри категории, категории — по меню
products.sort((a, b) => CATS.findIndex((c) => c.id === a.cat) - CATS.findIndex((c) => c.id === b.cat));
products.forEach((p, i) => (p.pop = i));

const cats = CATS.map(({ old, ...c }) => ({ ...c, count: products.filter((p) => p.cat === c.id).length }));
fs.mkdirSync(path.join(ROOT, "src/data"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "src/data/catalog.json"), JSON.stringify({ cats, products }, null, 2));
console.log(`Категорий ${cats.length}, карточек ${products.length} (из ${src.length} позиций старого сайта)`);
for (const p of products) console.log(`  ${p.cat.padEnd(6)} ${p.slug.padEnd(34)} ${p.name} ${p.vol}${p.shades ? ` · ${p.shades.length} отт.` : ""}`);
