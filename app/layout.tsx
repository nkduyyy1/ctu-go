import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LoadingProvider } from "@/components/providers/LoadingProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CTU GO - Bản đồ Đại học Cần Thơ (Cập nhật 2025)",
  description:
    "Bản đồ campus ĐH Cần Thơ chi tiết nhất: tìm căn tin, khoa, ký túc xá, thư viện, bãi xe. Hỗ trợ chỉ đường, tìm nhanh, zoom vệ tinh siêu nét!",
  keywords:
    "bản đồ đại học cần thơ, ctu map, đại học cần thơ, căn tin ctu, ktx ctu, khoa cntt ctu, thư viện ctu, campus map ctu",
  authors: [{ name: "CTU GO Team" }],
  creator: "CTU GO",
  publisher: "CTU GO",
  metadataBase: new URL("https://ctugo.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CTU GO - Bản đồ Đại học Cần Thơ",
    description: "Khám phá toàn bộ campus ĐH Cần Thơ chỉ trong 1 click!",
    url: "https://ctugo.vercel.app",
    siteName: "CTU GO",
    images: [
      {
        url: "/assets/cg-logo.png",
        width: 1200,
        height: 630,
        alt: "Bản đồ vệ tinh Đại học Cần Thơ - CTU GO",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CTU GO - Bản đồ ĐH Cần Thơ",
    description: "Tìm căn tin, khoa, ký túc xá siêu nhanh!",
    images: ["/assets/cg-logo.png"],
    creator: "@ctugo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://server.arcgisonline.com" />
        <link rel="dns-prefetch" href="https://server.arcgisonline.com" />
      </head>
      <body className={inter.className}>
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}
