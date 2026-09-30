import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/ProductView";
import { asset, bySlug, coverOf, PRODUCTS, type Product } from "@/lib/catalog";

export const dynamicParams = false;
export const generateStaticParams = () => PRODUCTS.map((p) => ({ slug: p.slug }));

// «С этим берут»: связи по категории
const RELATED: Record<string, string[]> = {
  base: ["top-sk-15-ml", "polygel-15", "salfetki-bezvorsovye-plotnye-belye"],
  top: ["baza-elastik-15-ml", "gel-lak", "salfetki-bezvorsovye-plotnye-belye"],
  gel: ["baza-elastik-15-ml", "top-sk-15-ml", "banochka-dlya-gelya-80-g"],
  poly: ["baza-elastik-15-ml", "top-sk-15-ml", "salfetki-bezvorsovye-plotnye-belye"],
  lak: ["baza-elastik-15-ml", "top-sk-15-ml", "salfetki-bezvorsovye-plotnye-belye"],
  other: ["baza-elastik-15-ml", "top-sk-15-ml", "gel-easy-15"],
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = bySlug((await params).slug);
  if (!p) return {};
  const cover = coverOf(p);
  return {
    title: `${p.name} ${p.vol}`.trim(),
    description: p.descr.split("\n")[0].slice(0, 160) || undefined,
    openGraph: cover ? { images: [asset(cover)] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const p = bySlug((await params).slug);
  if (!p) notFound();
  const related = (RELATED[p.cat] ?? []).filter((s) => s !== p.slug).map(bySlug).filter(Boolean) as Product[];
  return <ProductView p={p} related={related} />;
}
