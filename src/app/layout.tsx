import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google"; // Modern font
import { Providers } from "@/components/providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Warehouse Mapping",
    template: "%s | Warehouse Mapping",
  },
  description: "Production-ready warehouse inventory location mapping system",
  keywords: ["warehouse", "inventory", "mapping", "putaway", "scanning"],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
