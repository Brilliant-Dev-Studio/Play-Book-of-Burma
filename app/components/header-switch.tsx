"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/app/components/site-header";
import { PortalHeader } from "@/app/components/portal-header";

export function HeaderSwitch() {
  const pathname = usePathname();
  if (pathname?.startsWith("/user-portal")) {
    return <PortalHeader />;
  }
  return <SiteHeader />;
}
