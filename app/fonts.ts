import localFont from "next/font/local";

/** Hero headline — Times New Roman MT Condensed Bold */
export const timesNewRomanMtCondensed = localFont({
  variable: "--font-tnr-mt-condensed",
  display: "swap",
  adjustFontFallback: false,
  src: [
    {
      path: "./assets/times-new-roman-mt-condensed/TimesNewRomanMTCondensed-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
});

/** Myanmar body copy — Yati San */
export const yatiSan = localFont({
  variable: "--font-yati-san",
  display: "swap",
  src: "./assets/yati-san/YatiSan.ttf",
});
