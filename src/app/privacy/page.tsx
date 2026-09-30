import type { Metadata } from "next";
import { Legal } from "@/components/Legal";

export const metadata: Metadata = { title: "Политика конфиденциальности" };

export default function PrivacyPage() {
  return <Legal title="Политика конфиденциальности" name="privacy" />;
}
