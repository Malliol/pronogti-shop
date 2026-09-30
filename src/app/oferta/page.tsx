import type { Metadata } from "next";
import { Legal } from "@/components/Legal";

export const metadata: Metadata = { title: "Публичная оферта" };

export default function OfertaPage() {
  return <Legal title="Публичная оферта" name="oferta" />;
}
