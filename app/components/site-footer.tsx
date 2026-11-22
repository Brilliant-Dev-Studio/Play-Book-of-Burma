"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AtSign,
  BriefcaseBusiness,
  Mail,
  Music2,
  Phone,
  Play,
  Users,
} from "lucide-react";
import logo from "@/app/assets/logo.png";
import appStoreBadge from "@/app/assets/download-on-the-app-store-apple-logo-svgrepo-com.png";
import googlePlayBadge from "@/app/assets/google-play-badge-logo-svgrepo-com.png";

const APP_STORE_URL =
  "https://apps.apple.com/sg/app/playbookofburma/id6802000866";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.playbookofburma.app&hl=en";

const PHONE_DISPLAY = "+95 9454161306";
const PHONE_TEL = "+959454161306";
const EMAIL = "pr.playbookofburma@gmail.com";

const PLAYBOOK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/membership", label: "Membership" },
  { href: "/library", label: "Library" },
  { href: "/login", label: "Login" },
  { href: "/terms", label: "Terms & Conditions" },
] as const;

const SOCIALS: { label: string; icon: LucideIcon }[] = [
  { label: "Facebook", icon: Users },
  { label: "TikTok", icon: Music2 },
  { label: "YouTube", icon: Play },
  { label: "LinkedIn", icon: BriefcaseBusiness },
];

/**
 * Section heading: small muted uppercase label on phone/tablet (reads as a tidy, compact
 * list), the original large white heading from `lg` up so the desktop footer is unchanged.
 */
const headingClass =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45 lg:text-xl lg:font-semibold lg:normal-case lg:tracking-tight lg:text-white";

function FooterIconBadge({ icon: Icon, srLabel }: { icon: LucideIcon; srLabel?: string }) {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-sm bg-coral text-black shadow-[0_6px_14px_rgba(0,0,0,0.55)] ring-1 ring-black/25">
      {srLabel ? <span className="sr-only">{srLabel}</span> : null}
      <Icon className="h-3 w-3" aria-hidden strokeWidth={2.5} absoluteStrokeWidth />
    </span>
  );
}

function StoreBadge({ src, alt }: { src: StaticImageData | string; alt: string }) {
  const imgSrc = typeof src === "string" ? src : src.src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      width={150}
      height={66}
      className="h-[44px] w-[132px] select-none object-contain object-left drop-shadow-[0_14px_34px_rgba(0,0,0,0.55)] lg:h-[50px] lg:w-[150px]"
      loading="lazy"
    />
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/15 bg-black pb-8 pt-8 sm:pt-10 lg:pb-14">
      <div className="mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8">
        {/* Phone/tablet: brand block on top (desktop footer has no brand column) */}
        <div className="mb-7 lg:hidden">
          <Image src={logo} alt="Playbook of Burma" className="h-12 w-auto" sizes="80px" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
            Learn the real playbooks of Myanmar&apos;s top founders, CEOs and experts.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4 lg:gap-12">
          {/* Download */}
          <section className="col-span-2 border-t border-white/10 pt-6 md:col-span-4 lg:col-span-1 lg:border-0 lg:pt-0">
            <h3 className={headingClass}>Download</h3>
            <div className="mt-3 flex flex-wrap gap-3 lg:mt-6 lg:grid lg:gap-4">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit transition-opacity hover:opacity-90"
              >
                <StoreBadge src={appStoreBadge} alt="Download on the App Store" />
              </a>
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit transition-opacity hover:opacity-90"
              >
                <StoreBadge src={googlePlayBadge} alt="Get it on Google Play" />
              </a>
            </div>
          </section>

          {/* Playbook links */}
          <section className="col-span-2 border-t border-white/10 pt-6 md:col-span-2 lg:col-span-1 lg:border-0 lg:pt-0">
            <h3 className={headingClass}>Playbook</h3>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[15px] leading-snug text-white/85 lg:mt-6 lg:block lg:space-y-1.5">
              {PLAYBOOK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-coral lg:hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Social */}
          <section className="col-span-2 border-t border-white/10 pt-6 md:col-span-2 lg:col-span-1 lg:border-0 lg:pt-0">
            <h3 className={headingClass}>Social</h3>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm text-white/85 lg:mt-6 lg:block lg:space-y-3 lg:text-[15px]">
              {SOCIALS.map(({ label, icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3.5 lg:gap-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0"
                >
                  <FooterIconBadge icon={icon} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Contact — tappable on phones */}
          <section className="col-span-2 border-t border-white/10 pt-6 md:col-span-4 lg:col-span-1 lg:border-0 lg:pt-0">
            <h3 className={headingClass}>Contact Information</h3>
            <ul className="mt-3 space-y-3 text-[15px] text-white/85 lg:mt-6 lg:space-y-4">
              <li>
                <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-3 transition-colors hover:text-white">
                  <FooterIconBadge icon={Phone} srLabel="Phone" />
                  <span>{PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 transition-colors hover:text-white">
                  <FooterIconBadge icon={Mail} srLabel="Email" />
                  <span className="break-all">{EMAIL}</span>
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FooterIconBadge icon={AtSign} srLabel="Social handle" />
                <span>@playbookofburma</span>
              </li>
            </ul>
          </section>
        </div>

        <p className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-white/40 lg:mt-12 lg:text-left">
          © {year} Playbook of Burma. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
