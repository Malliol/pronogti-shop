import type { MetadataRoute } from "next";
import { CATS, PRODUCTS, SITE_URL } from "@/lib/catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/catalog", "/quiz", "/delivery", "/privacy", "/rec", "/oferta"];
  return [
    ...pages.map((p) => `${SITE_URL}${p}/`),
    ...CATS.map((c) => `${SITE_URL}/catalog/${c.id}/`),
    ...PRODUCTS.map((p) => `${SITE_URL}/product/${p.slug}/`),
  ].map((url) => ({ url }));
}
