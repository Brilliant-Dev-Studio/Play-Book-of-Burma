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

function FooterIconBadge({
  icon: Icon,
  srLabel,
}: {
  icon: LucideIcon;
  srLabel?: string;
}) {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-sm bg-coral text-black shadow-[0_6px_14px_rgba(0,0,0,0.55)] ring-1 ring-black/25">
      {srLabel ? <span className="sr-only">{srLabel}</span> : null}
      <Icon
        className="h-3 w-3"
        aria-hidden
        strokeWidth={2.5}
        absoluteStrokeWidth
      />
    </span>
  );
}

function StoreBadge({
  src,
  alt,
}: {
  src: StaticImageData | string;
  alt: string;
}) {
  const imgSrc = typeof src === "string" ? src : src.src;
  return (
    <span className="inline-flex flex  justify-start items-start">
      <img
        src={imgSrc}
        alt={alt}
        width={150}
        height={66}
        className="h-[50px] w-[150px] object-contain   select-none drop-shadow-[0_14px_34px_rgba(0,0,0,0.55)] sm:w-[150px]"
        loading="lazy"
      />
    </span>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/15 bg-black pb-10 pt-8 sm:pb-14 sm:pt-10">
      <div className="mx-auto w-full max-w-[85%] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:mb-10 sm:flex-row sm:items-start sm:gap-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src={logo}
              alt="Story of Burma"
              className="h-10 w-auto"
              sizes="160px"
            />
          </Link>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-white/85 sm:justify-end sm:gap-x-10">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/membership" className="hover:text-white">
              Membership
            </Link>
            <Link href="/library" className="hover:text-white">
              Library
            </Link>
            <Link href="/login" className="hover:text-white">
              Login
            </Link>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <section>
            <h3 className="text-left text-lg font-semibold tracking-tight text-white sm:text-xl">
              Download
            </h3>
            <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4">
              <Link href="#" className="inline-flex w-fit">
                <StoreBadge src={appStoreBadge} alt="Download on the App Store" />
              </Link>
              <Link href="#" className="inline-flex w-fit">
                <StoreBadge src={googlePlayBadge} alt="Get it on Google Play" />
              </Link>
            </div>
          </section>

          <section>
            <h3 className="text-left text-lg font-semibold tracking-tight text-white sm:text-xl">
              Playbook
            </h3>
            <ul className="mt-5 space-y-1.5 text-sm leading-snug text-white/85 sm:mt-6 sm:text-[15px]">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-white">
                  Membership
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-white">
                  Library
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-left text-lg font-semibold tracking-tight text-white sm:text-xl">
              Social
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-white/85 sm:mt-6 sm:text-[15px]">
              <li className="flex items-center gap-3">
                <FooterIconBadge icon={Users} srLabel="Facebook" />
                <span>Facebook</span>
              </li>
              <li className="flex items-center gap-3">
                <FooterIconBadge icon={Music2} srLabel="TikTok" />
                <span>TikTok</span>
              </li>
              <li className="flex items-center gap-3">
                <FooterIconBadge icon={Play} srLabel="YouTube" />
                <span>YouTube</span>
              </li>
              <li className="flex items-center gap-3">
                <FooterIconBadge icon={BriefcaseBusiness} srLabel="LinkedIn" />
                <span>LinkedIn</span>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-left text-lg font-semibold tracking-tight text-white sm:text-xl">
              Contact Information
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-white/85 sm:mt-6 sm:text-[15px]">
              <li className="flex items-start gap-3">
                <FooterIconBadge icon={Phone} srLabel="Phone" />
                <span>+95 9454161306</span>
              </li>
              <li className="flex items-start gap-3">
                <FooterIconBadge icon={Mail} srLabel="Email" />
                <span className="break-all">pr.playbookofburma@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <FooterIconBadge icon={AtSign} srLabel="Social handle" />
                <span>@playbookofburma</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </footer>
  );
}

