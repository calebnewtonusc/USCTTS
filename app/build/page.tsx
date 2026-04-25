import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Laptop,
  Rocket,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import {
  BUILD_SESSIONS,
  currentBuildSession,
  type BuildDeliverable,
} from "@/lib/build";

const statusLabel: Record<BuildDeliverable["status"], string> = {
  done: "Complete",
  before: "Before meeting",
  during: "During meeting",
  after: "After meeting",
};

const statusClass: Record<BuildDeliverable["status"], string> = {
  done: "border-white/10 bg-white/[0.03] text-zinc-400",
  before: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  during: "border-red-400/25 bg-red-500/10 text-red-200",
  after: "border-emerald-400/25 bg-emerald-500/10 text-emerald-200",
};

export const metadata = {
  title: "Build Team Hub | Trojan Technology Solutions",
  description:
    "The public home base for TTS Build Team sessions, pre-build setup, meeting slides, and deliverables.",
};

export default function BuildPage() {
  const sessions = [...BUILD_SESSIONS].sort((a, b) => a.number - b.number);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -10%, rgba(204,0,0,0.28), transparent 62%), radial-gradient(ellipse 45% 35% at 12% 18%, rgba(255,204,0,0.08), transparent 60%)",
        }}
      />

      <header className="relative z-10 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-red-300">
              <Code2 className="h-4 w-4" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight">
                TTS Build
              </span>
              <span className="block text-xs text-zinc-500 group-hover:text-zinc-400">
                usctts.com/build
              </span>
            </span>
          </Link>
          <nav aria-label="Build navigation" className="hidden items-center gap-2 sm:flex">
            <a
              href="#pre-build"
              className="rounded-full px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.05] hover:text-white"
            >
              Pre-build
            </a>
            <a
              href="#deliverables"
              className="rounded-full px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.05] hover:text-white"
            >
              Deliverables
            </a>
            <a
              href="#sessions"
              className="rounded-full px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.05] hover:text-white"
            >
              Slides
            </a>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-200">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Build Team Hub
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
            Everything Build needs, in one place.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
            Slides, pre-build setup, deliverables, and the next action for the
            TTS Build Team. Meeting 2 is simple: arrive set up, follow along,
            and leave with your first webpage started.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/build/${currentBuildSession.slug}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-950/30 hover:bg-red-500"
            >
              Open Meeting 2 slides
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="#pre-build"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.08]"
            >
              Start pre-build checklist
            </a>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30">
          <div className="rounded-[1.5rem] border border-white/10 bg-zinc-950/80 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Current session
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Meeting two: Vibe code your first web page
                </h2>
              </div>
              <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                Next up
              </span>
            </div>
            <p className="text-sm leading-6 text-zinc-300">
              Caleb joins on Zoom for prompt engineering and resourceful
              prompting. Kaitlyn supports the room with formatting,
              functionality, and getting people unstuck.
            </p>
            <div className="mt-6 grid gap-3">
              <Metric icon={Laptop} label="Before" value="Set up tools" />
              <Metric icon={TerminalSquare} label="During" value="Build page" />
              <Metric icon={Rocket} label="After" value="Push to GitHub" />
            </div>
          </div>
        </aside>
      </section>

      <section
        id="pre-build"
        className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <SectionHeader
          eyebrow="Before Build Meeting 2"
          title="Pre-build checklist"
          body="This is the stuff that should also go in the email. If it is required before the meeting, it lives here too."
        />
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {currentBuildSession.preBuild?.map((item) => (
            <DeliverableCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section
        id="deliverables"
        className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <SectionHeader
          eyebrow="Current deliverables"
          title="What people should leave with"
          body="The hub separates before-meeting setup, in-meeting work, and after-meeting next steps so nobody has to hunt through messages."
        />
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {currentBuildSession.deliverables.map((item) => (
            <DeliverableCard key={item.title} item={item} />
          ))}
        </div>
      </section>

      <section
        id="sessions"
        className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <SectionHeader
          eyebrow="Build archive"
          title="Meetings and deliverables"
          body="Each Build meeting gets one clear home: slides, prep, deliverables, and links."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {sessions.map((session) => (
            <article
              key={session.slug}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    {session.shortTitle}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">
                    {session.title.replace(/^Build Meeting \d+: /, "")}
                  </h3>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                  {session.status}
                </span>
              </div>
              <p className="text-sm leading-6 text-zinc-300">{session.focus}</p>
              <div className="mt-5 grid gap-2">
                {session.deliverables.map((deliverable) => (
                  <div
                    key={deliverable.title}
                    className="flex items-start gap-2 text-sm text-zinc-300"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                    <span>{deliverable.title}</span>
                  </div>
                ))}
              </div>
              <Link
                href={`/build/${session.slug}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/[0.08]"
              >
                Open slides
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-10 pb-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Setup links"
          title="Tools to have ready"
          body="Use these links in the email and on the build site so everyone sees the same instructions."
        />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {currentBuildSession.resources?.map((resource) => (
            <a
              key={resource.label}
              href={resource.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.07]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{resource.label}</h3>
                <ExternalLink className="h-4 w-4 text-zinc-500" aria-hidden />
              </div>
              <p className="text-sm leading-6 text-zinc-400">
                {resource.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-6 text-zinc-400 sm:text-base">{body}</p>
    </div>
  );
}

function DeliverableCard({ item }: { item: BuildDeliverable }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusClass[item.status]}`}
        >
          {statusLabel[item.status]}
        </span>
      </div>
      <p className="text-sm leading-6 text-zinc-400">{item.description}</p>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <Icon className="h-4 w-4 text-red-300" aria-hidden />
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
          {label}
        </p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
