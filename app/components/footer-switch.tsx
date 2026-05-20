"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/app/components/site-footer";

export function FooterSwitch() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <SiteFooter />;
}
