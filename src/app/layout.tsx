import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart";
import { CartDrawer, Header, MobileNav, Toast } from "@/components/chrome";
import { Footer } from "@/components/Footer";
import { asset } from "@/lib/catalog";

const inter = Inter({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-inter" });

export const metadata: Metadata = {
  // адрес сайта для og-картинок; на своём домене задать NEXT_PUBLIC_SITE_URL
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://imiron.ru"),
  title: { default: "Kadilak Neo — базы, гели, топы для маникюра", template: "%s — Kadilak Neo" },
  description: "Базы, гели, топы, жидкий полигель и гель-лаки по адекватным ценам без переплаты за бренд. Оренбург, доставка по России СДЭК и Почтой России.",
  icons: { icon: asset("/logo.png") },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

// Тема до первой отрисовки, чтобы не мигало: ?theme= → localStorage → светлая
const themeScript = `try{var t=new URLSearchParams(location.search).get('theme')||localStorage.getItem('kn-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" data-theme="light" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="wrap flex-1">{children}</main>
            <Footer />
            <MobileNav />
          </div>
          <CartDrawer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
