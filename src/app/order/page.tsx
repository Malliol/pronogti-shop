import type { Metadata } from "next";
import { OrderDone } from "@/components/CheckoutView";

export const metadata: Metadata = { title: "Заказ принят", robots: { index: false } };

export default function OrderPage() {
  return <OrderDone />;
}
