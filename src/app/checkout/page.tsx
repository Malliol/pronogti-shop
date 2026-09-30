import type { Metadata } from "next";
import { CheckoutView } from "@/components/CheckoutView";

export const metadata: Metadata = { title: "Оформление заказа", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutView />;
}
