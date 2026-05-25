"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/app/components/sign-out-button";

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.JSX.Element;
};

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function IconUsers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M21.5 18.5a4.5 4.5 0 0 0-6-4.2" />
    </svg>
  );
}
function IconHeart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />
    </svg>
  );
}
function IconSubs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}
function IconInbox({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}
function IconUserCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 18.5a6 6 0 0 1 11 0" />
    </svg>
  );
}
function IconPlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M10.5 9.5v5l4-2.5-4-2.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
function IconChevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: IconDashboard },
  { label: "Submissions", href: "/admin/submissions", icon: IconInbox },
  { label: "Instructors", href: "/admin/instructors", icon: IconUserCircle },
  { label: "Videos", href: "/admin/videos", icon: IconPlay },
  { label: "Subscribers", href: "/admin/subscribers", icon: IconSubs },
  { label: "Retention", href: "/admin/retention", icon: IconHeart },
  { label: "Users", href: "/admin/users", icon: IconUsers },
  { label: "Admins", href: "/admin/admins", icon: IconShield },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    // Desktop-only for now; mobile drawer is out of scope.
    <aside
      className={`sticky top-0 z-20 hidden h-dvh shrink-0 flex-col border-r border-white/10 bg-zinc-950 transition-[width] duration-200 lg:flex ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div
        className={`px-5 pb-6 pt-7 ${
          collapsed ? "flex flex-col items-center gap-3" : "flex items-center gap-3"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-coral text-sm font-bold text-black shadow-[0_0_20px_rgba(236,113,71,0.45)]">
          PB
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-[family-name:var(--font-rwst-stack)] text-sm font-bold tracking-tight text-white">
              Playbook
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-coral/80">Admin</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
        >
          <IconChevron className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white/[0.06] text-white"
                      : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-6 w-0.75 -translate-y-1/2 rounded-r-full bg-coral shadow-[0_0_10px_rgba(236,113,71,0.6)]"
                      aria-hidden
                    />
                  )}
                  <Icon className={`h-5 w-5 shrink-0 ${active ? "text-coral" : "text-white/70 group-hover:text-white"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`border-t border-white/10 bg-black/30 px-4 py-4 ${collapsed ? "flex flex-col items-center gap-3" : ""}`}>
        {!collapsed && (
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Admin v0.1
          </p>
        )}
        <SignOutButton />
      </div>
    </aside>
  );
}
