import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "KaoShop";
const SITE_DESCRIPTION =
  "เว็บรีวิวสินค้าและจัดอันดับสินค้าที่ดีที่สุด พร้อมลิงก์ซื้อสินค้าราคาดีจาก Shopee";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - รีวิวสินค้า จัดอันดับ แนะนำสินค้าดีที่สุด`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - รีวิวสินค้า จัดอันดับ แนะนำสินค้าดีที่สุด`,
    description: SITE_DESCRIPTION,
    locale: "th_TH",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
