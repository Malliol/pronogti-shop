import type { Metadata } from "next";
import { CatalogView } from "@/components/CatalogView";

export const metadata: Metadata = { title: "Каталог" };

export default function CatalogPage() {
  return <CatalogView />;
}
