#!/usr/bin/env python3
"""Выгрузка каталога pronogti-shop.ru (Tilda Store) в data/ + фото в images/."""
import csv, html, json, re, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).parent
DATA, IMG = ROOT / "data", ROOT / "images"
SITE = "https://pronogti-shop.ru"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128 Safari/537.36"}
PAGES = ["basa0", "gel20", "gel50", "polygel2", "gel-lak", "other", "top"]


def get(url, referer=None):
    h = dict(UA)
    if referer:
        h["Referer"] = referer
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=30) as r:
                return r.read()
        except Exception as e:
            print(f"  retry {attempt + 1} {url}: {e}")
            time.sleep(2 + attempt * 3)
    raise RuntimeError(url)


def clean(s):
    s = re.sub(r"<br\s*/?>", "\n", s or "")
    s = re.sub(r"<[^>]+>", "", s)
    return html.unescape(s).strip()


def slug(s):
    return re.sub(r"[^\w\-]+", "_", s, flags=re.U).strip("_")[:60]


def main():
    DATA.mkdir(exist_ok=True)
    IMG.mkdir(exist_ok=True)
    categories, products = [], []
    for page in PAGES:
        url = f"{SITE}/{page}"
        try:
            src = get(url).decode("utf-8", "replace")
        except RuntimeError:
            print(f"! страница {page} недоступна")
            continue
        title = clean((re.search(r"<title>(.*?)</title>", src, re.S) or [None, page])[1])
        found = re.findall(r"t_store_init\('(\d+)',options\)", src)
        parts = re.findall(r"storepart:'(\d+)'", src)
        if not found or not parts:
            print(f"- {page}: нет каталога ({title})")
            continue
        recid, part = found[0], parts[0]
        api = (f"https://store.tildaapi.com/api/getproductslist/?storepartuid={part}&recid={recid}"
               f"&c={int(time.time() * 1000)}&getparts=true&getoptions=true&slice=1&size=500")
        d = json.loads(get(api, referer=url))
        print(f"+ {page}: {title} — {len(d['products'])} товаров (total {d.get('total')})")
        categories.append({"slug": page, "title": title, "url": url, "storepart": part, "count": len(d["products"])})
        for p in d["products"]:
            gallery = [g["img"] for g in json.loads(p.get("gallery") or "[]") if g.get("img")]
            products.append({
                "uid": p["uid"],
                "category": page,
                "category_title": title,
                "title": clean(p["title"]),
                "sku": p.get("sku", ""),
                "price": float(p["price"] or 0),
                "price_old": float(p["priceold"]) if p.get("priceold") else None,
                "quantity": p.get("quantity", ""),
                "mark": clean(p.get("mark")),
                "descr": clean(p.get("descr")),
                "text": clean(p.get("text")),
                "descr_html": p.get("descr", ""),
                "text_html": p.get("text", ""),
                "options": json.loads(p["json_options"]) if p.get("json_options") else [],
                "editions": p.get("editions", []),
                "characteristics": p.get("characteristics", []),
                "url": p.get("url", ""),
                "gallery_urls": gallery,
                "images": [],
            })
        time.sleep(1)

    # фото
    for p in products:
        folder = IMG / p["category"] / f"{p['uid']}_{slug(p['title'])}"
        folder.mkdir(parents=True, exist_ok=True)
        for i, u in enumerate(p["gallery_urls"], 1):
            ext = Path(u.split("?")[0]).suffix.lower() or ".jpg"
            f = folder / f"{i:02d}{ext}"
            if not f.exists():
                f.write_bytes(get(u))
            p["images"].append(str(f.relative_to(ROOT)))
        print(f"  фото {len(p['images'])}: {p['title']}")

    (DATA / "categories.json").write_text(json.dumps(categories, ensure_ascii=False, indent=2))
    (DATA / "products.json").write_text(json.dumps(products, ensure_ascii=False, indent=2))
    with open(DATA / "products.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(["uid", "Категория", "Название", "Артикул", "Цена", "Старая цена", "Остаток", "Описание", "Текст", "Фото", "URL"])
        for p in products:
            w.writerow([p["uid"], p["category_title"], p["title"], p["sku"], p["price"], p["price_old"] or "",
                        p["quantity"], p["descr"], p["text"], " | ".join(p["images"]), p["url"]])
    print(f"\nИтого: {len(categories)} категорий, {len(products)} товаров, "
          f"{sum(len(p['images']) for p in products)} фото")


if __name__ == "__main__":
    main()
