import type { Metadata } from "next";
import { Legal } from "@/components/Legal";

export const metadata: Metadata = { title: "Реквизиты" };

export default function RecPage() {
  return <Legal title="Реквизиты" name="rec" />;
}
