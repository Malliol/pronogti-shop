import fs from "node:fs";
import path from "node:path";

// Тексты юридических страниц — из выгрузки старого сайта (content/*.md).
// Первая строка там — заголовок страницы вперемешку с меню Tilda, её пропускаем.
export function legalText(name: "privacy" | "oferta" | "rec") {
  const raw = fs.readFileSync(path.join(process.cwd(), "content", `${name}.md`), "utf8");
  return raw
    .split(/\n{2,}/)
    .slice(1)
    .map((s) => s.replace(/﻿/g, "").trim())
    .filter(Boolean);
}
// «1. Общие положения» — заголовок раздела
export const isHeading = (s: string) => /^\d+\.\s+\S/.test(s) && s.length < 90 && !/[.;:]$/.test(s);
