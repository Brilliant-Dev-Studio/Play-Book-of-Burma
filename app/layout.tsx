import type { Metadata } from "next";
import localFont from "next/font/local";
import { HeaderSwitch } from "@/app/components/header-switch";
import { FooterSwitch } from "@/app/components/footer-switch";
import "./globals.css";

// Body / UI — Open Sauce Sans (replaces Geist Sans)
const openSauce = localFont({
  variable: "--font-open-sauce",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  src: [
    { path: "./assets/open-sauce/OpenSauceSans-Light.ttf", weight: "300", style: "normal" },
    { path: "./assets/open-sauce/OpenSauceSans-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "./assets/open-sauce/OpenSauceSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "./assets/open-sauce/OpenSauceSans-Italic.ttf", weight: "400", style: "italic" },
    { path: "./assets/open-sauce/OpenSauceSans-Medium.ttf", weight: "500", style: "normal" },
    { path: "./assets/open-sauce/OpenSauceSans-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "./assets/open-sauce/OpenSauceSans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./assets/open-sauce/OpenSauceSans-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "./assets/open-sauce/OpenSauceSans-Bold.ttf", weight: "700", style: "normal" },
    { path: "./assets/open-sauce/OpenSauceSans-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "./assets/open-sauce/OpenSauceSans-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "./assets/open-sauce/OpenSauceSans-Black.ttf", weight: "900", style: "normal" },
  ],
});

// Accent / "mono" slot — Rumble Brave (replaces Geist Mono)
const rumbleBrave = localFont({
  variable: "--font-rumble-brave",
  display: "swap",
  src: "./assets/Rumble Brave/Rumble Brave.otf",
});

// Display headings — Roman Wood Type JNL (replaces Cinzel)
const romanWoodType = localFont({
  variable: "--font-rwst-stack",
  display: "swap",
  src: "./assets/Roman Wood Type JNL.ttf",
});

const SITE_URL = "https://playbookofburma.com";
const SITE_NAME = "Playbook of Burma";
const SITE_DESCRIPTION =
  "Myanmar's premier video and podcast learning platform. Watch interviews with founders, CEOs, and industry experts. Join our membership to unlock exclusive business insights.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Myanmar business",
    "Burma founders",
    "Myanmar entrepreneurs",
    "business podcast Myanmar",
    "CEO interviews Burma",
    "Myanmar startup",
    "business learning platform",
    "Playbook of Burma",
  ],
  authors: [{ name: "Playbook of Burma", url: SITE_URL }],
  creator: "Playbook of Burma",
  publisher: "Playbook of Burma",
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
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "my_MM",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/social.png",
        width: 1200,
        height: 630,
        alt: "Playbook of Burma — Myanmar Business Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/social.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSauce.variable} ${rumbleBrave.variable} ${romanWoodType.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <HeaderSwitch />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <FooterSwitch />
      </body>
    </html>
  );
}
