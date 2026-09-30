import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/CatalogView";
import { CATS } from "@/lib/catalog";

export const dynamicParams = false;
export const generateStaticParams = () => CATS.map((c) => ({ cat: c.id }));

type Props = { params: Promise<{ cat: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cat } = await params;
  const c = CATS.find((x) => x.id === cat);
  return { title: c?.name, description: c?.note };
}

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params;
  if (!CATS.some((c) => c.id === cat)) notFound();
  return <CatalogView cat={cat} />;
}
