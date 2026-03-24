import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export const metadata: Metadata = {
  title: "The Align method",
  description:
    "Learn the Align method: 14-day windows, up to 3 daily moves, and a nightly check-in built for consistent follow-through.",
  alternates: {
    canonical: "/method",
  },
};

const principles = [
  {
    title: "Work in windows, not forever plans.",
    body: "A 14-day window is long enough to create traction and short enough to keep urgency honest.",
  },
  {
    title: "Three moves forces real prioritization.",
    body: "If everything belongs today, nothing does. Align keeps the day narrow on purpose.",
  },
  {
    title: "Showed up is the metric.",
    body: "Completion is noisy. Some days are partial. Some days are messy. Showing up is the repeatable signal.",
  },
  {
    title: "The app should disappear behind the work.",
    body: "No streak theater, fake levels, or productivity cosplay. Direction, moves, check-in, done.",
  },
];

export default function MethodPage() {
  return (
    <main className="min-h-screen bg-[#0c0c0d] text-[#f3eee5]">
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-8 md:px-8 md:pb-24 md:pt-10">
        <div className="mb-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={30} src="/logo_secondary.svg" priority />
            <span className="font-gtw text-[24px] tracking-[-0.03em] text-[#f3eee5]">
              Align.
            </span>
          </Link>
          <a
            href="mailto:saishankar2803@gmail.com?subject=Align%20Support"
            className="font-body rounded-full border border-white/10 px-5 py-2 text-[12px] font-medium tracking-[-0.01em] text-white/80 transition-colors hover:border-white/20 hover:text-white"
          >
            Support
          </a>
        </div>

        <section className="mb-20 max-w-3xl md:mb-24">
          <div className="font-body mb-5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
            The method
          </div>
          <h1 className="font-gtw max-w-3xl text-[2.85rem] leading-[0.92] tracking-[-0.055em] text-[#f3eee5] text-balance md:text-[4.9rem]">
            A commitment system for people who are done performing productivity.
          </h1>
          <p className="font-body mt-8 max-w-[40rem] text-[1rem] leading-[1.78] tracking-[-0.01em] text-white/58 md:text-[1.06rem]">
            Align is built around one belief: consistency comes from fewer decisions, not more tools. The method is simple
            enough to remember without the app, which is the point.
          </p>
        </section>

        <section className="grid gap-x-10 gap-y-12 md:grid-cols-2 md:gap-y-14">
          {principles.map((item, index) => (
            <article key={item.title} className="border-t border-white/10 pt-5">
              <div className="font-body mb-4 text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
                0{index + 1}
              </div>
              <h2 className="font-gtw max-w-[18rem] text-[1.8rem] leading-[0.98] tracking-[-0.04em] text-[#f3eee5] md:max-w-[19rem] md:text-[2.15rem]">
                {item.title}
              </h2>
              <p className="font-body mt-4 max-w-[23rem] text-[0.98rem] leading-[1.75] tracking-[-0.01em] text-white/58">
                {item.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-20 border-t border-white/10 pt-6 md:mt-24">
          <div className="font-body text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
            In practice
          </div>
          <p className="font-gtw mt-4 max-w-3xl text-[1.85rem] leading-[0.98] tracking-[-0.04em] text-[#f3eee5] md:text-[2.55rem]">
            Pick one to three directions. Protect three moves. Answer honestly at night. Repeat for fourteen days.
          </p>
          <p className="font-body mt-5 max-w-[38rem] text-[0.98rem] leading-[1.75] tracking-[-0.01em] text-white/56">
            The method should feel simple enough to carry in your head. The app exists to support the rhythm, not become the
            rhythm.
          </p>
          <div className="mt-7">
            <Link
              href="/"
              className="font-body inline-flex rounded-full bg-[#f3eee5] px-6 py-3 text-[12px] font-medium tracking-[-0.01em] text-[#0c0c0d] transition-transform hover:scale-[1.02]"
            >
              Back to landing
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
