import Image from "next/image";
import kbzPayLogo from "@/app/assets/kbzpay.png";
import wavePayLogo from "@/app/assets/wavepay.png";
import { MembershipSubmissionForm } from "@/app/components/membership-submission-form";



function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconCursor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="m17 13 4 4-2 1 1 2-2 1-1-2-2 1Z" />
    </svg>
  );
}

function IconKeypad({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 7h.01M12 7h.01M16 7h.01M8 12h.01M12 12h.01M16 12h.01M8 17h.01M12 17h.01M16 17h.01" />
    </svg>
  );
}

function TimelineStep({
  isLast,
  text,
  illustration,
}: {
  isLast?: boolean;
  text: React.ReactNode;
  illustration?: React.ReactNode;
}) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Bullet + connector */}
      <div className="relative flex flex-col items-center">
        <span
          className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral text-white shadow-[0_4px_14px_rgba(236,113,71,0.45)]"
          aria-hidden
        >
          <IconCheck className="h-4 w-4" />
        </span>
        {!isLast && (
          <span
            className="absolute left-1/2 top-9 h-full w-px -translate-x-1/2 bg-gradient-to-b from-coral/55 via-coral/30 to-coral/10"
            aria-hidden
          />
        )}
      </div>

      <div className="min-w-0 flex-1 pt-1">
        <p className="text-sm font-semibold leading-snug tracking-tight text-white sm:text-[15px]">
          {text}
        </p>
        {illustration && <div className="mt-3">{illustration}</div>}
      </div>
    </li>
  );
}

function CredentialChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-white/12 bg-zinc-950/70 px-3.5 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:text-base">
      <span className="text-white/85">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function MiniStepChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-950/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-white/85">
        {icon}
      </span>
      <p className="min-w-0 text-sm font-semibold leading-tight text-white">
        {label}
      </p>
    </div>
  );
}

function ApprovalTimeline() {
  return (
    <ol className="relative flex flex-col">
      <TimelineStep
        text={
          <>
            You will receive <span className="text-coral">email</span> and{" "}
            <span className="text-coral">password</span> via your email
          </>
        }
        illustration={
          <div className="flex flex-wrap gap-2">
            <CredentialChip icon={<IconMail className="h-5 w-5" />} label="Email" />
            <CredentialChip icon={<IconLock className="h-5 w-5" />} label="Password" />
          </div>
        }
      />
      <TimelineStep
        text={
          <>
            Log in with your email and password via our{" "}
            <span className="text-coral">website / app</span>
          </>
        }
        illustration={
          <div className="flex flex-col gap-2">
            <MiniStepChip
              icon={<IconCursor className="h-5 w-5" />}
              label={
                <>
                  Click the <span className="text-coral">Log in</span> button
                </>
              }
            />
            <MiniStepChip
              icon={<IconKeypad className="h-5 w-5" />}
              label="Enter email & password"
            />
          </div>
        }
      />
      <TimelineStep
        isLast
        text={
          <>
            Done — start learning 24/7,{" "}
            <span className="text-coral">anytime, anywhere</span>
          </>
        }
      />
    </ol>
  );
}

function HowPayStepCard({
  step,
  title,
  children,
  emphasized,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
  emphasized?: boolean;
}) {
  return (
    <div
      className={[
        "relative flex min-h-0 flex-col rounded-2xl border border-white/12 bg-zinc-900/90 shadow-[0_16px_48px_rgba(0,0,0,0.35)]",
        emphasized
          ? "px-5 pb-7 pt-10 sm:px-7 sm:pb-8 sm:pt-11 md:min-h-[26rem] md:px-8 md:pb-9 md:pt-12 lg:min-h-[28rem]"
          : "px-5 pb-6 pt-10 sm:px-6 sm:pb-7 sm:pt-11",
        emphasized
          ? "ring-1 ring-coral/20 shadow-[0_20px_56px_rgba(0,0,0,0.4)]"
          : "",
      ].join(" ")}
    >
      <div
        className={[
          "absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-coral font-bold text-white shadow-[0_4px_16px_rgba(236,113,71,0.45)]",
          emphasized ? "h-11 w-11 text-lg" : "h-10 w-10 text-base",
        ].join(" ")}
        aria-hidden
      >
        {step}
      </div>
      <h3
        className={[
          "text-pretty pr-1 font-semibold leading-snug tracking-tight text-white",
          emphasized ? "text-xl sm:text-2xl" : "text-xl",
        ].join(" ")}
      >
        {title}
      </h3>
      <div className={emphasized ? "mt-5 min-h-0 flex-1 md:mt-6" : "mt-4 min-h-0 flex-1"}>
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
    <main className="relative flex flex-1 flex-col overflow-hidden bg-black pb-20 pt-16 text-white md:pb-28 md:pt-20 lg:pb-32 lg:pt-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,rgba(236,113,71,0.09),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(255,255,255,0.03),transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-[85%] px-4 sm:px-6 lg:max-w-[min(85%,1400px)] lg:px-8">
        <header className="flex flex-col items-center text-center">
          <span
            className="mb-4 h-1 w-10 rounded-full bg-coral shadow-[0_0_20px_rgba(236,113,71,0.45)]"
            aria-hidden
          />
          <h1 className="max-w-2xl text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Choose Monthly Membership
          </h1>
        </header>

        <div className="mx-auto mt-12 flex w-full flex-col items-stretch justify-center gap-8 sm:mt-14 sm:gap-10 md:mt-16 md:flex-row md:items-center md:justify-center md:gap-5 lg:mt-20 lg:gap-7 xl:gap-9">
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
          className="mt-20  pt-16 sm:mt-24 sm:pt-20 md:mt-28 md:pt-24"
          aria-labelledby="how-pay-heading"
        >
          <h2
            id="how-pay-heading"
            className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            How do I pay?
          </h2>

          <div className="mx-auto mt-10 grid w-full gap-6 sm:mt-12 sm:gap-8 md:mt-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
            <HowPayStepCard step={1} title="Choose your payment method">
              <div className="flex w-full flex-col">
                <div className="flex w-full items-center gap-4 sm:gap-5">
                  <Image
                    src={kbzPayLogo}
                    alt="KBZ Pay"
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-md object-contain shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-coral/95">
                      KBZ Pay
                    </p>
                    <p className="mt-1 text-[15px] font-semibold leading-snug tracking-tight text-white">
                      Account
                    </p>
                    <dl className="mt-3 grid gap-x-4 gap-y-2.5 sm:grid-cols-[minmax(0,4.5rem)_1fr] sm:gap-x-5">
                      <div className="sm:contents">
                        <dt className="text-xs font-medium text-white/45 sm:pt-0.5">Name</dt>
                        <dd className="text-sm font-medium leading-snug text-white/92 sm:min-w-0">
                          Htet Naing Oo
                        </dd>
                      </div>
                      <div className="sm:contents">
                        <dt className="text-xs font-medium text-white/45 sm:pt-0.5">Number</dt>
                        <dd className="font-mono text-[15px] font-medium tabular-nums tracking-wide text-white sm:min-w-0">
                          09763600983
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <div
                  className="my-4 h-px w-full shrink-0 bg-white/[0.08] sm:my-5"
                  aria-hidden
                />
                <div className="flex w-full items-center gap-4 sm:gap-5">
                  <Image
                    src={wavePayLogo}
                    alt="Wave Money"
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-md object-contain shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fecf73]">
                      Wave Money
                    </p>
                    <p className="mt-1 text-[15px] font-semibold leading-snug tracking-tight text-white">
                      Account
                    </p>
                    <dl className="mt-3 grid gap-x-4 gap-y-2.5 sm:grid-cols-[minmax(0,4.5rem)_1fr] sm:gap-x-5">
                      <div className="sm:contents">
                        <dt className="text-xs font-medium text-white/45 sm:pt-0.5">Name</dt>
                        <dd className="text-sm font-medium leading-snug text-white/92 sm:min-w-0">
                          Htet Naing Oo
                        </dd>
                      </div>
                      <div className="sm:contents">
                        <dt className="text-xs font-medium text-white/45 sm:pt-0.5">Number</dt>
                        <dd className="font-mono text-[15px] font-medium tabular-nums tracking-wide text-white sm:min-w-0">
                          09763600983
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </HowPayStepCard>

            <HowPayStepCard
              step={2}
              title="Fill in the following information"
              emphasized
            >
              <MembershipSubmissionForm />
            </HowPayStepCard>

            <HowPayStepCard step={3} title="Approval in Not more than 30 mins">
              <ApprovalTimeline />
            </HowPayStepCard>
          </div>
        </section>

        <section
          className="mt-20  pt-16 sm:mt-24 sm:pt-20 md:mt-28 md:pt-24"
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
