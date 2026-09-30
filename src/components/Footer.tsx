import Link from "next/link";
import Image from "next/image";
import { asset, CONTACTS } from "@/lib/catalog";

export function Footer() {
  return (
    <footer className="border-t border-divider px-[clamp(16px,5vw,64px)] pt-9 pb-10">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-7 text-[14px] leading-[22px]">
        <div className="flex flex-col gap-[10px]">
          <Image src={asset("/logo.png")} alt="" width={64} height={64} className="block size-16" />
          <span className="font-medium">Kadilak Neo</span>
        </div>
        <div className="flex flex-col gap-[6px]">
          <span className="font-medium">Наши контакты</span>
          <span className="text-n-300">По любым вопросам обращайтесь к менеджеру Татьяне</span>
          {CONTACTS.phones.map((p) => (
            <a key={p.tel} href={`tel:${p.tel}`}>
              {p.text}
            </a>
          ))}
        </div>
        <div className="flex flex-col gap-[6px]">
          <span className="font-medium">Мы в сети</span>
          <a href={CONTACTS.telegram} target="_blank" rel="noopener">Telegram</a>
          <a href={CONTACTS.vk} target="_blank" rel="noopener">ВКонтакте</a>
          <a href={CONTACTS.instagram} target="_blank" rel="noopener">Instagram</a>
        </div>
        <div className="flex flex-col gap-[6px] text-n-300">
          <span className="font-medium text-fg">г. Оренбург</span>
          <Link href="/privacy/">Политика конфиденциальности</Link>
          <Link href="/rec/">Реквизиты</Link>
          <Link href="/oferta/">Публичная оферта</Link>
        </div>
      </div>
    </footer>
  );
}
