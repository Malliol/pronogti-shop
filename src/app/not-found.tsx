import Link from "next/link";

export default function NotFound() {
  return (
    <section className="max-w-[620px] pt-[72px] pb-24">
      <div className="kicker">404</div>
      <h1 className="mt-3 mb-4 text-[clamp(30px,4vw,44px)]">Такой страницы нет</h1>
      <p className="mb-7 text-[16px] leading-[26px] text-n-200">Возможно, товар переехал. Загляните в каталог.</p>
      <Link className="btn btn-primary" href="/catalog/">В каталог</Link>
    </section>
  );
}
