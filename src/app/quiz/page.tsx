import type { Metadata } from "next";
import { QuizView } from "@/components/QuizView";

export const metadata: Metadata = { title: "Подбор", description: "Ответьте на два вопроса — соберём набор для укрепления, наращивания или цветного покрытия." };

export default function QuizPage() {
  return <QuizView />;
}
