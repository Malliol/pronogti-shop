import { isHeading, legalText } from "@/lib/legal";

export function Legal({ title, name }: { title: string; name: "privacy" | "oferta" | "rec" }) {
  return (
    <section className="prose-legal max-w-[820px] pt-12 pb-[72px] text-[15px] leading-[25px] text-n-200">
      <h1 className="mb-9 text-[clamp(30px,4vw,44px)] text-fg">{title}</h1>
      {legalText(name).map((s, i) =>
        isHeading(s) ? (
          <h2 key={i} className="mt-8 mb-3 text-[20px] text-fg">
            {s}
          </h2>
        ) : (
          <p key={i}>{s}</p>
        ),
      )}
    </section>
  );
}
