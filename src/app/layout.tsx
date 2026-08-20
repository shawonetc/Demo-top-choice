import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import MetaPixel from "../components/MetaPixel";
import { siteConfig } from "../lib/config";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: [siteConfig.name, "Online Shopping BD", "E-commerce Bangladesh", "Buy Electronics Online", "Home Appliances Bangladesh"],
  authors: [{ name: `${siteConfig.name} Team` }],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Online Shopping`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Online Shopping in Bangladesh`,
    description: `Shop for genuine products at ${siteConfig.name}, the most trusted e-commerce platform in BD.`,
    images: ["/images/og-image.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.variable}>
        <Providers>{children}</Providers>
        <MetaPixel />
      </body>
    </html>
  );
}
