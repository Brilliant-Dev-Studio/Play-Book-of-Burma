import type { Metadata } from "next";
import { MembershipSubmissionForm } from "@/app/components/membership-submission-form";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/app/components/json-ld";

export const metadata: Metadata = {
  title: "Get Membership",
  description:
    "Join Playbook of Burma and unlock exclusive access to video interviews and podcasts with Myanmar's top founders, CEOs, and business experts. Pay via KBZ Pay or Wave Money.",
  alternates: { canonical: "https://playbookofburma.com/membership" },
  openGraph: {
    title: "Get Membership | Playbook of Burma",
    description:
      "Join Playbook of Burma and unlock exclusive access to video interviews and podcasts with Myanmar's top founders, CEOs, and business experts. Pay via KBZ Pay or Wave Money.",
    url: "https://playbookofburma.com/membership",
  },
};



function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}



const APPROVAL_STEPS = [
  {
    title: "Received Password",
    description: "You will receive your password via email",
  },
  {
    title: "Log in Your Account",
    description: "You can log in using your email and password through the website or app",
  },
  {
    title: "Completed",
    description: "You can now learn from the best CEOs in Myanmar at anytime, anywhere",
  },
] as const;

function ApprovalTimeline() {
  return (
    <ol className="flex flex-col gap-6">
      {APPROVAL_STEPS.map((step) => (
        <li key={step.title} className="flex items-start gap-4">
          <span
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral shadow-[0_4px_14px_rgba(236,113,71,0.45)]"
            aria-hidden
          >
            <IconCheck className="h-4 w-4 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold leading-snug text-white">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/70">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function HowPayStepCard({
  step,
  title,
  children,
  accent,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={[
        "relative flex h-full flex-col rounded-2xl border bg-zinc-900/90 px-6 pb-8 pt-12 shadow-[0_16px_48px_rgba(0,0,0,0.35)] sm:px-7 sm:pb-9 sm:pt-14",
        accent
          ? "border-coral/25 ring-1 ring-coral/20 shadow-[0_20px_56px_rgba(0,0,0,0.4)]"
          : "border-white/12",
      ].join(" ")}
    >
      <div
        className="absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-coral text-2xl font-bold text-white shadow-[0_4px_16px_rgba(236,113,71,0.45)]"
        aria-hidden
      >
        {step}
      </div>
      <h3 className="text-pretty text-center text-xl font-semibold leading-snug tracking-tight text-white">
        {title}
      </h3>
      <div className="mt-6 min-h-0 flex-1">
        {children}
      </div>
    </div>
  );
}

const PLANS = [
  {
    id: "standard",
    label: "Standard",
    featured: false,
  },
  {
    id: "6m",
    label: "6 Months",
    featured: true,
  },
  {
    id: "12m",
    label: "12 Months",
    featured: false,
  },
] as const;

const ROW_PRIMARY = "Lorem Ipsum is simply";
const ROW_SECONDARY =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry.";

function MembershipPlanCard({
  label,
  featured,
}: {
  label: string;
  featured: boolean;
}) {
  const shell = [
    "relative z-10 flex w-full flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-zinc-900/90 via-zinc-950/88 to-zinc-950/95 backdrop-blur-md",
    "transition-[border-color,box-shadow] duration-300 ease-out hover:border-white/[0.14] motion-reduce:transition-none",
    featured
      ? "shadow-[0_24px_80px_rgba(0,0,0,0.72),0_0_64px_-24px_rgba(236,113,71,0.16),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-coral/25 hover:border-white/[0.16] hover:shadow-[0_28px_88px_rgba(0,0,0,0.75),0_0_72px_-20px_rgba(236,113,71,0.22),inset_0_1px_0_rgba(255,255,255,0.07)]"
      : "shadow-[0_24px_80px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.05] hover:shadow-[0_28px_88px_rgba(0,0,0,0.78),inset_0_1px_0_rgba(255,255,255,0.07)]",
  ].join(" ");

  const padSize = [
    "px-5 pb-6 pt-6 sm:px-6 sm:pb-7 sm:pt-7 md:px-7 md:pb-8 md:pt-8",
    featured
      ? "md:min-h-[33rem] md:max-w-[min(100%,32rem)] md:px-8 md:pb-9 md:pt-9 lg:min-h-[35rem] lg:max-w-[min(100%,36rem)] lg:px-9 lg:pb-10 lg:pt-10 xl:max-w-[min(100%,38rem)]"
      : "md:min-h-[27rem] md:max-w-[min(100%,26rem)] lg:min-h-[29rem] lg:max-w-[min(100%,28rem)]",
  ].join(" ");

  return (
    <div className="relative w-full max-w-xl md:max-w-none">
      <article className={[shell, padSize].join(" ")}>
        <div
          className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent opacity-90 sm:inset-x-6 md:inset-x-8"
          aria-hidden
        />

        <div
          className={[
            "relative mx-auto w-full max-w-none rounded-xl px-4 py-2.5 text-center text-base font-semibold tracking-tight transition-[box-shadow,background-color,border-color] duration-300 sm:px-5 sm:py-3",
            featured
              ? "border border-white/15 bg-coral text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
              : "border border-white/[0.12] bg-zinc-950/55 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-white/[0.18] hover:bg-zinc-950/70",
          ].join(" ")}
        >
          {label}
        </div>

        {featured ? (
          <div
            className="relative mx-auto mt-3 h-[3px] w-11 shrink-0 rounded-full bg-coral shadow-[0_0_18px_rgba(236,113,71,0.45)] sm:mt-3.5"
            aria-hidden
          />
        ) : null}

        <div className="relative mt-5 flex flex-1 flex-col divide-y divide-white/[0.08] sm:mt-6">
          <p className="pb-4 text-xl font-semibold leading-snug tracking-tight text-white md:pb-5">
            {ROW_PRIMARY}
          </p>
          <p className="py-3.5 text-sm leading-relaxed text-white/80 sm:py-4 sm:text-base">
            {ROW_SECONDARY}
          </p>
          <p className="py-3.5 text-sm leading-relaxed text-white/80 sm:py-4 sm:text-base">
            {ROW_SECONDARY}
          </p>
          <p className="pt-3.5 text-sm leading-relaxed text-white/80 sm:pt-4 sm:text-base">
            {ROW_SECONDARY}
          </p>
        </div>
      </article>
    </div>
  );
}

const FAQ_GENERALS: { q: string; a: string }[] = [
  {
    q: "What is Playbook of Burma?",
    a: "Playbook of Burma is a learning platform featuring playbooks from Myanmar’s top founders, CEOs, and experts—stories, frameworks, and decisions you can apply to your own path.",
  },
  {
    q: "What is included in Playbook of Burma?",
    a: "Your membership includes access to our library of sessions, structured learning materials, and updates as we release new playbooks and episodes.",
  },
  {
    q: "Where can I watch?",
    a: "You can watch on the web and through our mobile apps once your account is approved and activated.",
  },
];

const FAQ_PAYMENTS: { q: string; a: string }[] = [
  {
    q: "Which payment method have you accepted?",
    a: 'We currently accept KBZ Pay and Wave Money. Details are shown in the "How do I pay?" section above.',
  },
  {
    q: "What if I don't get approval in 30 mins?",
    a: "Approvals are usually within 30 minutes. If it takes longer, check your spam folder or contact support with your payment screenshot and registered email.",
  },
  {
    q: "What does 1 Device Plan mean?",
    a: "It means your membership can be signed in on one device at a time to keep access fair and secure for all members.",
  },
];

function MembershipFaqPanel({
  title,
  items,
}: {
  title: string;
  items: { q: string; a: string }[];
}) {
  return (
    <div className="rounded-none border border-white/10 bg-zinc-900/90">
      <h3 className="border-b border-white/10 px-5 py-4 text-lg font-semibold tracking-tight text-white sm:px-6 sm:py-4 sm:text-xl">
        {title}
      </h3>
      <div>
        {items.map((item, index) => (
          <details
            key={item.q}
            className="group border-b border-white/[0.08] last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 pr-4 text-left transition-colors hover:bg-white/[0.04] sm:px-6 [&::-webkit-details-marker]:hidden">
              <span className="w-6 shrink-0 text-sm font-medium tabular-nums text-white/45">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-white sm:text-[15px]">
                {item.q}
              </span>
              <span
                className="shrink-0 text-xs text-white/50 transition-transform duration-200 ease-out group-open:rotate-180"
                aria-hidden
              >
                ▼
              </span>
            </summary>
            <div className="border-t border-white/[0.06] bg-black/25 px-5 py-4 pl-[3.25rem] text-sm leading-relaxed text-white/80 sm:px-6 sm:pl-14 sm:text-[15px]">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function MembershipPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-black pb-16 pt-14 text-white md:pb-22 md:pt-16 lg:pb-24 lg:pt-20">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Membership", href: "/membership" },
        ]}
      />
      <FaqJsonLd items={[...FAQ_GENERALS, ...FAQ_PAYMENTS]} />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,rgba(236,113,71,0.09),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(255,255,255,0.03),transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[80%] px-4 sm:px-6 lg:max-w-[min(80%,1400px)] lg:px-8">
        <header className="flex flex-col items-center text-center">
          <span
            className="mb-4 h-1 w-10 rounded-full bg-coral shadow-[0_0_20px_rgba(236,113,71,0.45)]"
            aria-hidden
          />
          <h1 className="max-w-2xl text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Choose Monthly Membership
          </h1>
        </header>

        <div className="mx-auto mt-10 flex w-full flex-col items-stretch justify-center gap-8 sm:mt-12 sm:gap-10 md:mt-14 md:flex-row md:items-center md:justify-center md:gap-5 lg:mt-16 lg:gap-7 xl:gap-9">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={[
                "flex w-full justify-center md:flex-1",
                plan.featured ? "md:z-10 md:px-1" : "",
              ].join(" ")}
            >
              <MembershipPlanCard
                label={plan.label}
                featured={plan.featured}
              />
            </div>
          ))}
        </div>

        <section
          className="mt-14 sm:mt-16 md:mt-20"
          aria-labelledby="how-pay-heading"
        >
          <h2
            id="how-pay-heading"
            className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            How do I pay?
          </h2>

          <div className="mx-auto mt-10 grid w-full items-stretch gap-6 sm:mt-12 sm:gap-8 md:mt-14 md:grid-cols-3 lg:gap-10">
            <HowPayStepCard step={1} title="Scan the MMQR Here">
              <div className="flex flex-col items-center gap-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mmqr.png"
                  alt="MMQR payment code"
                  className="w-full max-w-55 rounded-xl object-contain shadow-lg"
                />
                <p className="text-xs leading-relaxed text-white/55">
                  <span className="font-semibold text-white/75">Note:</span> MMQR can accept KBZ
                  Pay, Wave Money, OK$, CB Pay, uabpay, A+ Wallet, CTZ Pay, Yoma, Trusty, Zego,
                  Mpitesan
                </p>
              </div>
            </HowPayStepCard>

            <HowPayStepCard step={2} title="Fill in the following information" accent>
              <MembershipSubmissionForm />
            </HowPayStepCard>

            <HowPayStepCard step={3} title="Approval in Not more than 30 mins">
              <ApprovalTimeline />
            </HowPayStepCard>
          </div>
        </section>

        <section
          className="mt-14 sm:mt-16 md:mt-20"
          aria-labelledby="faq-heading"
        >
          <h2
            id="faq-heading"
            className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Frequently asked questions
          </h2>
          <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-2 sm:mt-12 md:mt-14">
            <MembershipFaqPanel title="Generals" items={FAQ_GENERALS} />
            <MembershipFaqPanel title="Payments" items={FAQ_PAYMENTS} />
          </div>
        </section>
      </div>
    </main>
  );
}
