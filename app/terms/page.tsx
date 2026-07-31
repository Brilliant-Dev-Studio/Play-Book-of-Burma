import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — Playbook of Burma",
  description: "Terms and conditions for using the Playbook of Burma platform.",
};

type Section = { title: string; kicker: string; body: React.ReactNode };

const acceptableUseRules = [
  "Share your account with others.",
  "Copy or redistribute course content.",
  "Attempt to hack, disrupt, or interfere with the Platform.",
  "Use the Platform for any unlawful or unauthorized purpose.",
];

const sections: Section[] = [
  {
    title: "Eligibility",
    kicker: "Who can join",
    body: (
      <p>
        You must be at least 13 years old or have permission from a parent or
        legal guardian to use the Platform.
      </p>
    ),
  },
  {
    title: "User Account",
    kicker: "Your responsibility",
    body: (
      <p>
        You are responsible for maintaining the confidentiality of your
        account credentials and for all activities conducted under your
        account. You agree to provide accurate and up-to-date information.
      </p>
    ),
  },
  {
    title: "Courses & Subscription",
    kicker: "Payment",
    body: (
      <p>
        Certain courses and learning materials require a paid subscription or
        one-time purchase. All fees are payable in advance and, unless
        required by law, are non-refundable.
      </p>
    ),
  },
  {
    title: "License to Use",
    kicker: "What you get",
    body: (
      <p>
        Playbook of Burma grants you a limited, non-exclusive,
        non-transferable license to access and use the Platform solely for
        your personal, non-commercial learning.
      </p>
    ),
  },
  {
    title: "Intellectual Property",
    kicker: "Ownership",
    body: (
      <>
        <p>
          All videos, documentary, podcasts, course materials, graphics,
          trademarks, and other content on the Platform are owned by or
          licensed to Playbook of Burma and are protected by applicable
          intellectual property laws.
        </p>
        <p className="mt-4">
          You may not copy, record, download, reproduce, distribute, sell, or
          otherwise use any content without our prior written permission.
        </p>
      </>
    ),
  },
  {
    title: "Acceptable Use",
    kicker: "House rules",
    body: (
      <>
        <p>You agree not to:</p>
        <ul className="mt-4">
          {acceptableUseRules.map((rule) => (
            <li
              key={rule}
              className="border-t border-white/10 py-2.5 first:border-t-0 first:pt-0"
            >
              {rule}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    title: "Disclaimer",
    kicker: "No guarantees",
    body: (
      <p>
        The Platform provides educational content for informational purposes
        only. We do not guarantee any specific educational, professional, or
        financial outcomes.
      </p>
    ),
  },
  {
    title: "Changes to These Terms",
    kicker: "Updates",
    body: (
      <p>
        We may update these Terms from time to time. Continued use of the
        Platform after changes are published constitutes your acceptance of
        the updated Terms.
      </p>
    ),
  },
  {
    title: "Governing Law",
    kicker: "Jurisdiction",
    body: (
      <p>
        These Terms shall be governed by the laws of the Republic of the Union
        of Myanmar.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="bg-black">
      <div className="mx-auto w-full max-w-4xl px-5 pt-10 sm:px-8">
        {/* Running head */}
        <div className="flex items-baseline justify-between border-b border-white/15 pb-3 font-mono text-[11px] tracking-[0.2em] text-white/45">
          <span>PLAYBOOK OF BURMA</span>
          <span>LEGAL · 2026</span>
        </div>

        {/* Masthead */}
        <header className="pb-10 pt-10 sm:pt-14">
          <p className="text-sm italic text-white/55">
            The rules of the road, in plain terms.
          </p>
          <h1 className="font-(family-name:--font-rwst-stack) mt-3 text-[3.2rem] leading-[0.9] text-white sm:text-7xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-sm text-white/45">
            Effective 1 September 2026
          </p>
        </header>

        {/* Drop-cap lede */}
        <p className="text-[17px] leading-[1.8] text-white/80 first-letter:float-left first-letter:mr-3 first-letter:font-(family-name:--font-rwst-stack) first-letter:text-6xl first-letter:leading-[0.8] first-letter:text-coral">
          Welcome to Playbook of Burma. By accessing or using our website,
          mobile application, or services, you agree to the terms set out
          below — read them once, and you&rsquo;re set for everything that
          follows.
        </p>

        {/* Sections */}
        <div className="mt-4">
          {sections.map((s) => (
            <section
              key={s.title}
              className="border-t border-white/15 py-9 first:mt-6"
            >
              <p className="font-mono text-[11px] tracking-[0.22em] text-coral">
                {s.kicker.toUpperCase()}
              </p>
              <h2 className="font-(family-name:--font-rwst-stack) mt-1 text-3xl text-white sm:text-4xl">
                {s.title}
              </h2>
              <div className="mt-4 text-[15px] leading-[1.8] text-white/75">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        {/* Pull quote */}
        <figure className="border-t border-white/15 py-12">
          <blockquote className="font-(family-name:--font-rwst-stack) max-w-[26ch] text-3xl leading-[1.15] text-butter sm:text-4xl">
            &ldquo;Continued use after we update these Terms means you accept
            them.&rdquo;
          </blockquote>
          <figcaption className="mt-4 font-mono text-[11px] tracking-[0.22em] text-white/45">
            SECTION 08 — CHANGES TO THESE TERMS
          </figcaption>
        </figure>

        {/* Colophon */}
        <div className="border-t border-white/15 py-9">
          <p className="font-mono text-[11px] tracking-[0.22em] text-coral">
            COLOPHON
          </p>
          <h2 className="font-(family-name:--font-rwst-stack) mt-1 text-3xl text-white sm:text-4xl">
            Contact Us
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-white/75">
            For questions regarding these Terms, please contact us at:
          </p>
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-[15px]">
            <dt className="text-white/45">Facebook</dt>
            <dd className="text-white">Playbook of Burma</dd>
            <dt className="text-white/45">Phone</dt>
            <dd className="text-white">09451563102</dd>
            <dt className="text-white/45">Email</dt>
            <dd className="text-white">pr.playbookofburma@gmail.com</dd>
            <dt className="text-white/45">Website</dt>
            <dd className="text-white">playbookofburma.com</dd>
          </dl>
        </div>

        {/* Folio */}
        <div className="flex items-center justify-between border-t border-white/15 py-6 font-mono text-[11px] tracking-[0.2em] text-white/35">
          <Link href="/" className="text-white/60 transition-colors hover:text-coral">
            ← BACK TO HOME
          </Link>
          <span>— 01 —</span>
        </div>
      </div>
    </main>
  );
}
