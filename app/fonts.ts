import localFont from "next/font/local";

/** Display headlines — Times New Roman MT Condensed (Bold for section labels, Italic for hero titles).
 * WOFF2 files: the Bold was converted from CFF to TrueType outlines because Firefox's font
 * sanitizer rejects the original Bold OTF (it silently fell back to wide Times New Roman). */
export const timesNewRomanMtCondensed = localFont({
  variable: "--font-tnr-mt-condensed",
  display: "swap",
  adjustFontFallback: false,
  src: [
    {
      path: "./assets/times-new-roman-mt-condensed/TimesNewRomanMTCondensed-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./assets/times-new-roman-mt-condensed/TimesNewRomanMTCondensed-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
});

/** Myanmar body copy — Yati San */
export const yatiSan = localFont({
  variable: "--font-yati-san",
  display: "swap",
  src: "./assets/yati-san/YatiSan.ttf",
});
