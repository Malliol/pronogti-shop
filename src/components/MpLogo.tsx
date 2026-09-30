import { MP_LOGOS } from "@/lib/mp-logos";

// Логотип маркетплейса по подписи из MARKETPLACES; высота задаётся className (h-…), ширина — по пропорциям
export function MpLogo({ label, className = "" }: { label: string; className?: string }) {
  const l = MP_LOGOS[label];
  if (!l) return <span>{label}</span>;
  return (
    <svg
      viewBox={l.viewBox}
      // у Авито корневая заливка должна быть none, у остальных надписи без fill наследуют цвет текста
      fill={label === "Авито" ? "none" : "currentColor"}
      className={`block w-auto max-w-full ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: l.body }}
    />
  );
}
