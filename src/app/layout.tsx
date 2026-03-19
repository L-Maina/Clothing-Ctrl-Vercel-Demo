import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ClientLayout } from "@/components/layout/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clothing Ctrl | Nairobi Fashion Store",
  description: "Your one-stop fashion destination in Nairobi, Kenya. Luxury brands, streetwear, thrifted gems & custom pieces. Gucci, Prada, Balenciaga, Bape & more. Worldwide shipping available.",
  keywords: ["fashion", "Nairobi", "Kenya", "luxury brands", "streetwear", "thrifted", "custom clothing", "Gucci", "Prada", "Balenciaga", "Bape", "Diesel", "Chrome Hearts", "Carhartt", "designer clothes", "African fashion"],
  authors: [{ name: "Clothing Ctrl" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Clothing Ctrl | Nairobi Fashion Store",
    description: "Your one-stop fashion destination in Nairobi, Kenya. Luxury brands, streetwear, thrifted gems & custom pieces.",
    type: "website",
    url: "https://clothingctrl.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clothing Ctrl | Nairobi Fashion Store",
    description: "Your one-stop fashion destination in Nairobi, Kenya. Luxury brands, streetwear, thrifted gems & custom pieces.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
