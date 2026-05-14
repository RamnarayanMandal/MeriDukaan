import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { shopSettingsService } from "@/service/shopSettingsService";
import { ShopSettingsProvider } from "@/context/ShopSettingsContext";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await shopSettingsService.getSettings("default");
    
    return {
      title: {
        template: `%s | ${settings.shopName}`,
        default: settings.seoTitle || `${settings.shopName} | Best Bike Service`,
      },
      description: settings.seoDescription || "Expert two-wheeler repair and servicing.",
      keywords: settings.seoKeywords ? settings.seoKeywords.split(",").map(k => k.trim()) : [],
      authors: [{ name: settings.shopName }],
      creator: settings.shopName,
      icons: {
        icon: settings.favicon || "/favicon.ico",
      },
      openGraph: {
        type: "website",
        locale: "en_IN",
        title: settings.seoTitle || settings.shopName,
        description: settings.seoDescription,
        siteName: settings.shopName,
        images: settings.logo ? [settings.logo] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: settings.seoTitle || settings.shopName,
        description: settings.seoDescription,
      },
    };
  } catch (error) {
    console.error("Error fetching shop settings for metadata:", error);
    return {
      title: "Mukesh Auto Garage | Best Bike Service",
      description: "Expert two-wheeler repair and servicing.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ShopSettingsProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ShopSettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
