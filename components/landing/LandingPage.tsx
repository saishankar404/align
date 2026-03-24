"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity,
  Apple,
  Bell,
  Book,
  Calendar,
  Check,
  Chrome,
  Compass,
  CornerDownLeft,
  Download,
  Dumbbell,
  Droplets,
  Github,
  Layers,
  Linkedin,
  Lightbulb,
  Link2,
  MousePointerClick,
  PieChart,
  Twitter,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import UnicornHeroBackground from "@/components/landing/UnicornHeroBackground";

type Habit = {
  id: string;
  title: string;
  subtitle: string;
  icon: "droplets" | "book" | "dumbbell";
  showedUp: boolean;
};

type FaqItem = {
  title: string;
  desc: string;
  icon: "calendar" | "layers" | "activity";
};

const COPY = {
  nav: {
    left: "Method",
    right: "Support",
    cta: "Start in browser",
  },
  hero: {
    badge: "Local-first. Open source.",
    titleLine1: "Stop planning forever.",
    titleLine2: "Start showing up for 2 weeks.",
    subtitle:
      "Most apps create more options, then call it productivity. Align. cuts the noise: one window, up to three moves, honest nightly check-in.",
    primaryCta: "Start in browser app",
    secondaryCta: "See the method behind Align.",
  },
  trustStrip: {
    one: "14-day windows",
    two: "Max 3 moves/day",
    three: "Offline-first by default",
  },
  phone: {
    heading: "day 5",
    progress: "progress",
  },
  bento: {
    titleEyebrow: "How it works",
    title: "Less choice. More follow-through.",
    directions: {
      eyebrow: "01 - Direction",
      big: "1-3",
      title: "Pick 1-3 directions for this window.",
      body: "No giant system. Just one clear direction set.",
    },
    moves: {
      eyebrow: "02 - Moves",
      title: "Three moves a day. That's it.",
      body: "Not worth a slot? It goes to later pile.",
      disabled: "Pitch deck redesign",
    },
    window: {
      eyebrow: "03 - Window",
      big: "14",
      title: "Days to prove you can show up.",
    },
    later: {
      eyebrow: "Later pile",
      title: "Capture ideas without letting them hijack today.",
      first: "Build a founder memo",
      second: "research thread: attention design",
      more: "+ 3 more",
    },
    night: {
      eyebrow: "Night",
      idleTitle: '"Did you show up today?"',
      idleBody: "No streak theater. Just signal.",
      yesTitle: "Day secured.",
      yesBody: "You showed up. Repeat tomorrow.",
      noTitle: "Marked avoided. Open tomorrow.",
      noBody: "No drama. Regain signal tomorrow.",
      yesButton: "Yes, showed up",
      noButton: "Avoided today",
    },
    point: {
      eyebrow: "The point",
      title: '"Showed up" beats "perfect".',
      chip: "Day 5 of 14",
    },
  },
  featureShowcase: {
    title: "Your commitment stack, built to make follow-through inevitable.",
    subtitle: "No clutter. No fake urgency. Just clean execution.",
    cta: "Open Align.",
    cards: {
      reminders: {
        title: "Adaptive reminders",
        body: "Nudges for your window, not addiction loops. Quiet when you need focus.",
      },
      logging: {
        title: "Frictionless logging",
        body: "One tap to log a move. The interface disappears so action stays in focus.",
      },
      quote: {
        line: "No streaks. No badges. No fake levels.",
        author: "Build consistency, not dependency.",
      },
      analytics: {
        title: "Window clarity",
        body: "See direction balance, showed-up rate, and where your energy actually went.",
      },
    },
  },
  scrollStatement:
    "Most apps reward streak obsession. Align rewards real follow-through, then gets out of your way.",
  features: {
    heading: "Built for real life",
    subtitle: "What existing apps usually miss.",
    oneTitle: "Local-first reliability",
    oneBody: "Your window still works offline. No lost day when network drops.",
    twoTitle: "Open-source transparency",
    twoBody: "No black box behavior. Inspect the product logic end-to-end.",
    threeTitle: "No gamified noise",
    threeBody: "No streak bait, no fake urgency. Just direction, moves, and signal.",
  },
  faq: {
    heading: "system rules",
    subtitle: "Why this works when other apps stall out.",
  },
  footer: {
    titleLine1: "Open your first window.",
    titleLine2: "Make today count.",
    cta: "Get Started",
    browserHint: "Also available in browsers",
    brand: "Align.",
    home: "Home",
    guides: "Method",
    support: "Support",
    missing: "404",
    stayInTouch: "Stay in touch",
    subscribePlaceholder: "Send a hi",
    subscribeCta: "Send",
    copyright: "© 2026 Align. Open source.",
  },
} as const;

const FAQ_DATA: FaqItem[] = [
  {
    title: "why only 14 days?",
    desc: "Long enough to build traction. Short enough to stay urgent.",
    icon: "calendar",
  },
  {
    title: "why max 3 moves?",
    desc: "Because priority requires tradeoffs. Three forces focus.",
    icon: "layers",
  },
  {
    title: "why “showed up” over completion?",
    desc: "Completion can be noisy. Showing up is signal. Track behavior first.",
    icon: "activity",
  },
];

function FaqIcon({ icon }: { icon: FaqItem["icon"] }) {
  if (icon === "calendar") return <Calendar className="h-5 w-5 text-zinc-400" />;
  if (icon === "layers") return <Layers className="h-5 w-5 text-zinc-400" />;
  return <Activity className="h-5 w-5 text-zinc-400" />;
}

function HabitIcon({ icon }: { icon: Habit["icon"] }) {
  if (icon === "book") return <Book className="h-4 w-4 text-zinc-400" />;
  if (icon === "dumbbell") return <Dumbbell className="h-4 w-4 text-zinc-400" />;
  return <Droplets className="h-4 w-4 text-zinc-400" />;
}

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const scrollTextSectionRef = useRef<HTMLElement | null>(null);
  const scrollTextInnerRef = useRef<HTMLDivElement | null>(null);
  const scrollWordRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const [habits, setHabits] = useState<Habit[]>([
    { id: "ship-v1", title: "ship copy update", subtitle: "showed up", icon: "droplets", showedUp: true },
    { id: "deep-work", title: "deep work block", subtitle: "queued", icon: "book", showedUp: false },
    { id: "strength", title: "strength session", subtitle: "queued", icon: "dumbbell", showedUp: false },
  ]);
  const [movesChecked, setMovesChecked] = useState([true, false]);
  const [windowDays, setWindowDays] = useState<number[]>([0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 1]);
  const [nightState, setNightState] = useState<"idle" | "yes" | "no">("idle");
  const [faqIndex, setFaqIndex] = useState(0);
  const [faqProgressKey, setFaqProgressKey] = useState(0);
  const [faqVisible, setFaqVisible] = useState(true);
  const [hiMessage, setHiMessage] = useState("");

  const faqDuration = 5000;
  const supportEmail = "saishankar2803@gmail.com";

  const showedUpCount = useMemo(() => habits.filter((h) => h.showedUp).length, [habits]);
  const supportMailto = `mailto:${supportEmail}`;
  const hiMailto = useMemo(() => {
    const subject = encodeURIComponent("Hi from Align.");
    const body = encodeURIComponent(hiMessage.trim() ? hiMessage.trim() : "Hi Sai,");
    return `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  }, [hiMessage]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!document.getElementById("dotlottie-script")) {
      const script = document.createElement("script");
      script.id = "dotlottie-script";
      script.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.3/dist/dotlottie-wc.js";
      script.type = "module";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFaqIndex((prev) => (prev + 1) % FAQ_DATA.length);
      setFaqProgressKey((prev) => prev + 1);
    }, faqDuration);

    return () => window.clearTimeout(timeout);
  }, [faqIndex]);

  useEffect(() => {
    const section = scrollTextSectionRef.current;
    const inner = scrollTextInnerRef.current;
    const words = scrollWordRefs.current.filter((word): word is HTMLSpanElement => word !== null);

    if (!section || !inner || words.length === 0) return;

    const context = gsap.context(() => {
      gsap.set(words, { color: "#334155" });

      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }).to(words, {
        color: "#111111",
        stagger: {
          each: 1 / words.length,
        },
      });
    }, section);

    const timeoutId = window.setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      window.clearTimeout(timeoutId);
      context.revert();
    };
  }, []);

  useEffect(() => {
    setFaqVisible(false);
    const t = window.setTimeout(() => setFaqVisible(true), 120);
    return () => window.clearTimeout(t);
  }, [faqIndex]);

  const handleToggleHabit = (index: number) => {
    setHabits((prev) =>
      prev.map((habit, i) => {
        if (i !== index) return habit;
        const showedUp = !habit.showedUp;
        return {
          ...habit,
          showedUp,
          subtitle: showedUp ? "showed up" : "queued",
        };
      })
    );
  };

  const handleFaqSelect = (index: number) => {
    setFaqIndex(index);
    setFaqProgressKey((prev) => prev + 1);
  };

  const scrollLines = useMemo(
    () => [
      ["Most", "apps", "reward", "streak", "obsession."],
      ["Align", "follow-through,"],
      ["then", "gets", "out", "of", "the", "way."],
    ],
    []
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        .stagger-1 { transition-delay: 0.1s; }
        .stagger-2 { transition-delay: 0.2s; }
        .stagger-3 { transition-delay: 0.3s; }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { border-radius: 4px; background: #27272a; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }

        .card-transition {
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .organic-blob {
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          animation: morph 8s ease-in-out infinite both alternate;
        }

        .organic-blob.fast { animation-duration: 5s; }
        .organic-blob.slow { animation-duration: 12s; }

        @keyframes morph {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg) scale(1); }
          33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; transform: rotate(5deg) scale(1.05); }
          66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; transform: rotate(-5deg) scale(0.95); }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg) scale(1); }
        }

        @keyframes faqFill {
          from { width: 0; }
          to { width: 100%; }
        }

        .faq-progress-active {
          width: 100%;
          animation: faqFill var(--faq-duration) linear;
        }

        @keyframes auroraBlue {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.35; }
          50% { transform: translate3d(20px, -16px, 0) scale(1.08); opacity: 0.55; }
        }

        @keyframes auroraOrange {
          0%, 100% { transform: rotate(-45deg) translate3d(0, 0, 0) scale(1); opacity: 0.35; }
          50% { transform: rotate(-42deg) translate3d(-20px, -10px, 0) scale(1.05); opacity: 0.55; }
        }

        .aurora-blue { animation: auroraBlue 9s ease-in-out infinite; }
        .aurora-orange { animation: auroraOrange 10s ease-in-out infinite; }

        .landing-grain {
          position: relative;
          isolation: isolate;
        }

        .landing-grain::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: url("/noisy-background.jpg");
          background-size: 500px auto;
          background-repeat: repeat;
          opacity: 0.14;
          mix-blend-mode: overlay;
        }

        .landing-content {
          position: relative;
          z-index: 1;
        }
      `,
        }}
      />

      <div
        className="landing-grain min-h-screen bg-zinc-950 font-body text-zinc-50 selection:bg-indigo-500/30 selection:text-indigo-200"
      >
        <div className="landing-content">
          <nav className="fixed left-1/2 top-4 z-50 flex w-[min(540px,calc(100vw-20px))] -translate-x-1/2 flex-col gap-3 rounded-[2rem] border border-white/5 bg-[#161616]/95 px-3 py-3 shadow-2xl backdrop-blur sm:top-8 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:rounded-full sm:px-1.5 sm:py-1.5 sm:pr-2.5">
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
              <div className="ml-1 flex items-center gap-2.5 self-start sm:self-auto">
                <div className="flex h-8 w-8 items-center justify-center sm:h-8 sm:w-8">
                  <Logo size={30} src="/logo_secondary.svg" priority />
                </div>
                <span className="font-gtw text-[20px] leading-none tracking-[-0.03em] text-white sm:text-[22px]">
                  Align.
                </span>
              </div>
              <Link
                href="/app"
                className="rounded-full border border-white/5 bg-[#282828] px-4 py-2 text-center text-[13px] font-medium text-white transition-colors hover:bg-[#333] sm:hidden"
              >
                {COPY.nav.cta}
              </Link>
            </div>
            <div className="flex w-full items-center justify-center gap-6 border-t border-white/5 pt-3 text-[13px] font-medium text-zinc-300 sm:w-auto sm:justify-start sm:gap-6 sm:border-t-0 sm:pt-0 sm:text-[14px]">
              <Link href="/method" className="min-h-[32px] px-1 transition-colors hover:text-white">
                {COPY.nav.left}
              </Link>
              <a href={supportMailto} className="min-h-[32px] px-1 transition-colors hover:text-white">
                {COPY.nav.right}
              </a>
              <Link
                href="/app"
                className="hidden rounded-full border border-white/5 bg-[#282828] px-5 py-1.5 text-center font-medium text-white transition-colors hover:bg-[#333] sm:inline-flex"
              >
                {COPY.nav.cta}
              </Link>
            </div>
          </nav>

          <div className="relative isolate z-20 overflow-hidden rounded-b-[3.5rem] bg-[#F2EDE4] pb-20 text-zinc-900 shadow-[0_30px_80px_rgba(0,0,0,0.18)] md:rounded-b-[5.5rem]">
            <UnicornHeroBackground />
            <header className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 pb-10 pt-40 text-center sm:px-6 sm:pb-12 sm:pt-48">
              <div className="reveal mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-center text-[12px] font-medium text-indigo-600 sm:mb-8 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
                </span>
                {COPY.hero.badge}
              </div>
              <h1 className="reveal stagger-1 mb-6 text-[2.8rem] font-bold leading-[1.02] tracking-tighter text-zinc-900 sm:text-5xl md:text-7xl">
                {COPY.hero.titleLine1} <br className="hidden md:block" /> {COPY.hero.titleLine2}
              </h1>
              <p className="reveal stagger-2 mb-10 max-w-2xl px-1 text-[16px] leading-[1.65] text-zinc-600 sm:text-lg md:text-xl">{COPY.hero.subtitle}</p>
              <div className="reveal stagger-3 flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
                <Link
                  href="/app"
                  className="w-full rounded-full bg-zinc-900 px-8 py-4 text-center font-medium text-white transition-transform hover:scale-105 sm:w-auto"
                >
                  {COPY.hero.primaryCta}
                </Link>
                <Link
                  href="/method"
                  className="w-full rounded-full border border-zinc-300 bg-[#F7F4EE] px-8 py-4 text-center font-medium text-zinc-900 transition-colors hover:bg-[#f1ece2] sm:w-auto"
                >
                  {COPY.hero.secondaryCta}
                </Link>
              </div>
            </header>

            <div className="reveal stagger-3 relative z-10 mx-auto mb-[-72px] mt-10 flex w-full max-w-6xl items-end justify-center overflow-visible sm:mb-[-96px] sm:mt-14 md:mb-[-120px]">
              <div className="animate-pulse-glow absolute left-1/2 top-[44%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B8AEE0]/45 blur-[70px] sm:h-72 sm:w-72 sm:blur-[80px] md:h-80 md:w-80 md:blur-[90px]" />
              <div
                className="animate-pulse-glow absolute right-[18%] top-[36%] h-48 w-48 rounded-full bg-[#E8694A]/20 blur-[52px] sm:right-[24%] sm:h-60 sm:w-60 sm:blur-[60px] md:right-[28%] md:h-72 md:w-72 md:blur-[70px]"
                style={{ animationDelay: "1s" }}
              />

              <div className="relative z-10 flex h-[420px] w-[min(420px,calc(100vw-30px))] items-start justify-center overflow-hidden bg-transparent sm:h-[500px] md:h-[590px] md:w-[470px]">
                <div className="relative h-[760px] w-full rounded-[3.2rem] bg-[linear-gradient(145deg,#3b3b3f_0%,#17171a_14%,#545458_32%,#111215_52%,#4b4b50_74%,#1a1b1f_100%)] p-[7px] shadow-[0_50px_120px_rgba(0,0,0,0.44)] sm:h-[820px] sm:rounded-[3.8rem] md:h-[860px] md:rounded-[4.2rem] md:p-[8px] md:shadow-[0_70px_160px_rgba(0,0,0,0.5)]">
                  <div className="absolute left-[-3px] top-[138px] h-14 w-[4px] rounded-r-full bg-[#6a6a70]" />
                  <div className="absolute left-[-3px] top-[204px] h-20 w-[4px] rounded-r-full bg-[#6a6a70]" />
                  <div className="absolute left-[-3px] top-[304px] h-20 w-[4px] rounded-r-full bg-[#6a6a70]" />
                  <div className="absolute right-[-3px] top-[228px] h-28 w-[4px] rounded-l-full bg-[#6a6a70]" />

                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[3.7rem] bg-[#0b0b0d] p-[10px] ring-1 ring-white/10">
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03)_35%,transparent_78%)]" />
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-8 bg-[linear-gradient(90deg,rgba(255,255,255,0.08),transparent)]" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-8 bg-[linear-gradient(270deg,rgba(255,255,255,0.06),transparent)]" />

                    <div className="absolute left-1/2 top-4 z-40 flex h-9 w-[134px] -translate-x-1/2 items-center justify-end rounded-full bg-black px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <span className="mr-2 h-2.5 w-2.5 rounded-full bg-[#151515]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1f1f1f]" />
                    </div>

                    <div className="relative mt-4 flex h-full flex-col overflow-hidden rounded-[3rem] bg-parchment text-ink">
                      <div className="flex items-center justify-between px-7 pb-[2px] pt-[18px]">
                        <div className="flex items-center gap-[10px]">
                          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-parchment">
                            A
                          </div>
                          <span className="font-gtw text-[25px] tracking-[-0.01em] text-dusk">Align.</span>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-sand/80 text-dusk">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden px-7 pb-24 pt-2">
                        <div className="flex items-start justify-between">
                          <div className="pl-[6px] pt-[8px] text-left">
                            <div className="font-body text-[10px] font-medium uppercase tracking-[0.12em] text-dusk/90">Good morning</div>
                            <div className="font-gtw text-[54px] font-normal leading-[0.9] tracking-[-0.04em] text-ink">Sai</div>
                          </div>
                          <div className="flex flex-col items-end gap-2 pt-[2px]">
                            <div className="font-gtw text-[88px] font-light leading-[0.9] tracking-[-0.06em] text-ink opacity-[0.07]">05</div>
                            <div className="flex gap-[7px]">
                              {Array.from({ length: 14 }).map((_, index) => (
                                <span
                                  key={index}
                                  className={`h-[6px] w-[6px] rounded-full ${index < 5 ? "bg-ink" : index === 5 ? "bg-terra" : "bg-border"
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 rounded-[22px] bg-sand px-[22px] py-[20px] text-left">
                          <div className="font-gtw text-[25px] leading-[1.03] tracking-[-0.035em] text-ink">
                            1 move left.
                            <br />
                            You&apos;re moving forward.
                          </div>
                          <div className="mt-3 font-body text-[13px] leading-[1.55] text-dusk">
                            2 of 3 done today. Day 5 of 14.
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                            <span className="font-body text-[10px] font-medium uppercase tracking-[0.11em] text-dusk">Today</span>
                            <span className="font-body text-[11px] text-dusk">Mar 24 - Apr 6</span>
                          </div>
                        </div>

                        <div className="flex items-end justify-between pb-[10px] pt-7">
                          <div className="text-left">
                            <div className="font-body text-[9px] font-medium uppercase tracking-[0.11em] text-dusk">Today</div>
                            <div className="font-gtw whitespace-nowrap text-[31px] leading-[1] tracking-[-0.035em] text-ink">Moves</div>
                          </div>
                          <div className="mb-[-1px] font-gtw text-[38px] font-light leading-none tracking-[-0.04em] text-ink opacity-[0.12]">
                            {showedUpCount}/3
                          </div>
                        </div>

                        <div className="flex flex-col gap-[12px]">
                          {habits.map((habit, index) => (
                            <button
                              key={habit.id}
                              type="button"
                              onClick={() => handleToggleHabit(index)}
                              className={`relative overflow-hidden rounded-[24px] border px-5 pb-5 pt-4 text-left transition-transform hover:scale-[1.01] active:scale-[0.99] ${habit.showedUp
                                ? "border-border bg-[#E6F4EC]"
                                : "border-border bg-parchment"
                                }`}
                            >
                              <div
                                className={`absolute inset-x-0 bottom-0 top-auto h-full origin-bottom transition-transform duration-500 ${habit.showedUp ? "scale-y-100 bg-forest/12" : "scale-y-0 bg-forest/12"
                                  }`}
                              />
                              <div className="relative z-[1] flex items-center justify-between">
                                <div className="font-body truncate pr-2 text-[9px] font-medium uppercase tracking-[0.1em] text-dusk">
                                  {index === 0 ? "Writing" : index === 1 ? "Product" : "Health"}
                                </div>
                                <div
                                  className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] ${habit.showedUp ? "border-ink bg-ink" : "border-ink/20 bg-transparent"
                                    }`}
                                >
                                  {habit.showedUp ? (
                                    <Check className="h-[10px] w-[10px] text-white" />
                                  ) : (
                                    <div className="scale-[0.85] text-dusk">
                                      <HabitIcon icon={habit.icon} />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div
                                className={`relative z-[1] mt-[10px] max-w-[92%] font-gtw text-[22px] leading-[1.18] tracking-[-0.025em] text-ink ${habit.showedUp ? "line-through opacity-50" : ""
                                  }`}
                              >
                                {habit.title}
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="pt-[14px] text-left">
                          <button className="flex min-h-[32px] items-center gap-[10px] text-left">
                            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px] border-dashed border-bs text-[15px] text-bs">
                              +
                            </span>
                            <span className="font-body text-[13px] text-dusk">Add a move</span>
                          </button>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-[22px] pt-14 sm:px-5 sm:pb-[26px]">
                        <div className="rounded-full bg-ink p-[8px_6px] shadow-[0_12px_40px_rgba(0,0,0,.28)]">
                          <div className="flex items-center">
                            {[
                              { label: "Home", active: true },
                              { label: "Window", active: false },
                              { label: "Later", active: false },
                              { label: "Profile", active: false },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className={`flex flex-1 flex-col items-center gap-1 rounded-full p-[8px_4px] ${item.active ? "bg-white/10" : "bg-transparent"
                                  }`}
                              >
                                <div className={`h-5 w-5 rounded-full ${item.active ? "bg-parchment/90" : "bg-white/25"}`} />
                                <span
                                  className={`font-body text-[9px] font-medium uppercase tracking-[0.07em] ${item.active ? "text-parchment" : "text-white/30"
                                    }`}
                                >
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-1/2 h-1.5 w-28 -translate-x-1/2 rounded-full bg-white/18" />
                </div>
              </div>
            </div>
          </div>

          <main className="relative z-10 -mt-[64px] bg-[#D8D1F6] pt-[88px] sm:-mt-[80px] sm:pt-[96px] md:-mt-[96px] md:pt-[110px]">
            <section ref={scrollTextSectionRef} className="relative h-[200vh] w-full">
              <div ref={scrollTextInnerRef} className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden px-6">
                <div
                  className="font-body max-w-5xl text-center text-[2rem] font-bold leading-[1.02] tracking-tighter sm:text-4xl md:text-5xl lg:text-7xl"
                >
                  {scrollLines.map((line, lineIndex) => (
                    <div key={`line-${lineIndex}`} className="mb-[0.14em] block whitespace-normal last:mb-0 md:whitespace-nowrap">
                      {line.map((word, wordIndex) => {
                        const flatIndex =
                          scrollLines.slice(0, lineIndex).reduce((count, currentLine) => count + currentLine.length, 0) +
                          wordIndex;

                        return (
                          <span
                            key={`${lineIndex}-${wordIndex}`}
                            ref={(element) => {
                              scrollWordRefs.current[flatIndex] = element;
                            }}
                            className="mr-[0.22em] inline-block last:mr-0"
                            style={{ color: "#F2EDE4", textShadow: "0 1px 0 rgba(255,255,255,0.18)" }}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>

          <div className="relative z-20 -mt-[56px] rounded-t-[3rem] bg-zinc-950 pt-[88px] shadow-[0_-24px_60px_rgba(0,0,0,0.24)] sm:-mt-[72px] sm:pt-[100px] md:-mt-[88px] md:rounded-t-[5.5rem] md:pt-[120px]">
            <section className="relative z-0 mx-auto max-w-[1200px] px-5 pb-24 sm:px-6 sm:pb-32">
              <div className="reveal mb-12 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
                <h2 className="max-w-2xl text-[2.5rem] font-medium leading-[1.1] tracking-tight text-white md:text-5xl">
                  {COPY.featureShowcase.title}
                </h2>
                <div className="flex max-w-sm flex-col items-start gap-5 pb-2 text-left lg:items-end lg:text-right">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    No clutter. No fake urgency.
                    <br />
                    Just clean execution.
                  </p>
                  <a
                    href="/app"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-800 bg-[#161616] px-4 py-3 text-[13px] font-medium text-zinc-300 shadow-sm transition-colors hover:bg-[#222] hover:text-white sm:w-auto"
                  >
                    <Download className="h-4 w-4" />
                    {COPY.featureShowcase.cta}
                  </a>
                </div>
              </div>

              <div className="reveal stagger-1 rounded-[2.5rem] border border-zinc-800/80 bg-[#0c0c0c] p-3">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="group flex min-h-[420px] flex-col overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-[#121212] md:h-[480px]">
                    <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#121212]">
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 457 250"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      >
                        <rect width="457" height="250" fill="#121212" />
                        <g transform="translate(158, 20)">
                          <rect x="0" y="0" width="140" height="220" rx="32" fill="#18181b" stroke="#27272a" strokeWidth="2" />
                          <rect x="16" y="20" width="108" height="12" rx="6" fill="#27272a" />

                          <g transform="translate(-40, 60)">
                            <rect width="180" height="48" rx="16" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
                            <rect x="-2" y="12" width="6" height="24" rx="3" fill="#818cf8" />
                            <circle cx="24" cy="24" r="8" fill="#3f3f46" />
                            <rect x="44" y="20" width="60" height="8" rx="4" fill="#3f3f46" />
                          </g>

                          <g transform="translate(-20, 120)">
                            <rect width="160" height="48" rx="16" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
                            <rect x="-2" y="12" width="6" height="24" rx="3" fill="#68c78e" />
                            <circle cx="24" cy="24" r="8" fill="#3f3f46" />
                            <rect x="44" y="20" width="40" height="8" rx="4" fill="#3f3f46" />
                          </g>
                        </g>
                      </svg>
                    </div>
                    <div className="shrink-0 p-8 pt-6">
                      <Bell className="mb-4 h-5 w-5 text-white" />
                      <h3 className="mb-2 text-xl font-medium tracking-tight text-white">
                        {COPY.featureShowcase.cards.reminders.title}
                      </h3>
                      <p className="pr-4 text-sm leading-relaxed text-zinc-400">{COPY.featureShowcase.cards.reminders.body}</p>
                    </div>
                  </div>

                  <div className="group flex min-h-[420px] flex-col overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-[#121212] md:h-[480px]">
                    <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#121212]">
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 457 250"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      >
                        <rect width="457" height="250" fill="#121212" />
                        <g transform="translate(228.5, 125)">
                          <circle r="100" fill="#18181b" stroke="#27272a" strokeWidth="2" />
                          <circle r="70" fill="none" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 6" />
                          <circle r="50" fill="#27272a" />
                          <circle cx="-15" cy="-15" r="24" fill="#818cf8" />
                          <circle cx="15" cy="15" r="28" fill="#68c78e" />
                          <circle cx="20" cy="-20" r="8" fill="#f07053" />
                        </g>
                      </svg>
                    </div>
                    <div className="shrink-0 p-8 pt-6">
                      <MousePointerClick className="mb-4 h-5 w-5 text-white" />
                      <h3 className="mb-2 text-xl font-medium tracking-tight text-white">
                        {COPY.featureShowcase.cards.logging.title}
                      </h3>
                      <p className="pr-4 text-sm leading-relaxed text-zinc-400">{COPY.featureShowcase.cards.logging.body}</p>
                    </div>
                  </div>

                  <div className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-[#121212] md:h-[480px]">
                    <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#121212]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(240,112,83,0.1),transparent_60%)]" />
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            '<dotlottie-wc src="https://lottie.host/fb9e4d75-380d-4ee7-b40e-dc7696fe56c3/uhNmwMbvVO.lottie" style="width: 250px; height: 250px; filter: saturate(2) brightness(1.2) drop-shadow(0 0 20px rgba(240,112,83,0.3));" class="transition-transform duration-700 group-hover:scale-110" autoplay loop></dotlottie-wc>',
                        }}
                      />
                    </div>
                    <div className="relative z-10 shrink-0 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent p-8 pt-6">
                      <Activity className="mb-4 h-5 w-5 text-white" />
                      <h3 className="mb-2 text-xl font-medium tracking-tight text-white">
                        {COPY.featureShowcase.cards.quote.line}
                      </h3>
                      <p className="pr-4 text-sm leading-relaxed text-zinc-400">{COPY.featureShowcase.cards.quote.author}</p>
                    </div>
                  </div>

                  <div className="group flex min-h-[420px] flex-col overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-[#121212] md:h-[480px]">
                    <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#121212]">
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 457 250"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      >
                        <rect width="457" height="250" fill="#121212" />
                        <g transform="translate(130, 135)">
                          <g transform="matrix(0.866 -0.5 0.866 0.5 0 0)">
                            <rect x="0" y="0" width="140" height="100" rx="16" fill="#18181b" stroke="#27272a" strokeWidth="2" />
                            <path d="M 20 20 L 20 -40" stroke="#3f3f46" strokeWidth="16" strokeLinecap="round" />
                            <path d="M 60 20 L 60 -60" stroke="#68c78e" strokeWidth="16" strokeLinecap="round" />
                            <path d="M 100 20 L 100 -20" stroke="#3f3f46" strokeWidth="16" strokeLinecap="round" />
                            <path d="M 140 20 L 140 -80" stroke="#818cf8" strokeWidth="16" strokeLinecap="round" />
                            <path d="M 20 60 L 20 -10" stroke="#f07053" strokeWidth="16" strokeLinecap="round" />
                            <path d="M 60 60 L 60 0" stroke="#3f3f46" strokeWidth="16" strokeLinecap="round" />
                            <path d="M 100 60 L 100 -50" stroke="#68c78e" strokeWidth="16" strokeLinecap="round" />
                          </g>
                        </g>
                      </svg>
                    </div>
                    <div className="shrink-0 p-8 pt-6">
                      <PieChart className="mb-4 h-5 w-5 text-white" />
                      <h3 className="mb-2 text-xl font-medium tracking-tight text-white">
                        {COPY.featureShowcase.cards.analytics.title}
                      </h3>
                      <p className="pr-4 text-sm leading-relaxed text-zinc-400">{COPY.featureShowcase.cards.analytics.body}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="relative z-0 mx-auto max-w-6xl px-5 pb-16 pt-24 sm:px-6 sm:pt-28">
            <div className="reveal mb-12">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">{COPY.bento.titleEyebrow}</h3>
              <h2 className="text-4xl font-medium tracking-tight text-white md:text-5xl">{COPY.bento.title}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
              <div className="reveal stagger-1 relative col-span-12 overflow-hidden rounded-[2rem] bg-[#68c78e] p-8 md:col-span-5">
                <div className="organic-blob slow absolute -bottom-20 -right-20 z-0 h-80 w-80 overflow-hidden bg-gradient-to-br from-[#5eb480] to-[#3b7a54] shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]" />
                <div className="relative z-10">
                  <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#3b7a54]">
                    {COPY.bento.directions.eyebrow}
                  </div>
                  <div className="-ml-1 mb-6 text-8xl font-medium leading-none tracking-tighter text-[#5eb480]">
                    {COPY.bento.directions.big}
                  </div>
                  <h3 className="mb-4 pr-8 text-3xl font-medium leading-tight text-[#13311f]">{COPY.bento.directions.title}</h3>
                  <p className="pr-12 text-sm text-[#2e6343]">{COPY.bento.directions.body}</p>
                </div>
              </div>

              <div className="reveal stagger-2 relative col-span-12 flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#212121] p-6 sm:p-8 md:col-span-7">
                <div className="absolute -bottom-6 -right-2 z-0 text-[14rem] font-medium leading-none tracking-tighter text-[#2a2a2a]">
                  3
                </div>
                <div className="relative z-10 w-full md:w-4/5">
                  <div className="mb-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    {COPY.bento.moves.eyebrow}
                  </div>

                  <div className="mb-12 space-y-3">
                    {[0, 1].map((i) => {
                      const checked = movesChecked[i];
                      const label = i === 0 ? "Publish the window plan" : "Protect a deep work block";
                      const color = i === 0 ? "bg-[#f07053]" : "bg-[#68c78e]";
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() =>
                            setMovesChecked((prev) => {
                              const next = [...prev];
                              next[i] = !next[i];
                              return next;
                            })
                          }
                          className={`group flex w-full cursor-pointer items-center gap-4 rounded-xl p-3 transition-all ${checked ? "bg-[#2a2a2a]" : "bg-[#2a2a2a] opacity-80 hover:opacity-100"
                            }`}
                        >
                          <div className={`ml-1 h-3 w-3 rounded-[3px] transition-transform group-active:scale-75 ${color}`} />
                          <div
                            className={`flex-1 text-left text-sm font-medium transition-colors ${checked ? "text-zinc-300" : "text-zinc-400"
                              }`}
                          >
                            {label}
                          </div>
                          <div
                            className={`mr-1 flex h-5 w-5 items-center justify-center rounded-full transition-all ${checked ? "bg-zinc-500" : "border border-zinc-600"
                              }`}
                          >
                            {checked ? <Check className="h-3 w-3 text-[#2a2a2a]" /> : null}
                          </div>
                        </button>
                      );
                    })}
                    <div className="flex cursor-not-allowed items-center gap-4 rounded-xl p-3 opacity-40">
                      <div className="ml-1 h-3 w-3 rounded-[3px] bg-[#818cf8]" />
                      <div className="flex-1 text-sm font-medium text-zinc-500">{COPY.bento.moves.disabled}</div>
                      <div className="mr-2 text-xs font-bold text-zinc-600">+1</div>
                    </div>
                  </div>

                  <h3 className="mb-2 text-2xl font-medium text-white">{COPY.bento.moves.title}</h3>
                  <p className="text-sm text-zinc-500">{COPY.bento.moves.body}</p>
                </div>
              </div>

              <div className="reveal relative col-span-12 overflow-hidden rounded-[2rem] bg-[#f07053] p-6 sm:p-8 md:col-span-4">
                <div className="organic-blob fast absolute -bottom-16 -right-16 z-0 h-64 w-64 overflow-hidden bg-gradient-to-tr from-[#d9654b] to-[#b34026] shadow-[inset_0_0_30px_rgba(0,0,0,0.15)]" />
                <div className="relative z-10">
                  <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[#8c3521]">{COPY.bento.window.eyebrow}</div>
                  <div className="-ml-1 mb-6 text-8xl font-medium leading-none tracking-tighter text-[#d9654b]">
                    {COPY.bento.window.big}
                  </div>
                  <h3 className="mb-8 text-3xl font-medium leading-tight text-[#4a190f]">{COPY.bento.window.title}</h3>

                  <div className="flex w-full flex-wrap gap-2 sm:w-4/5">
                    {windowDays.map((value, index) => {
                      const colorClass = value === 0 ? "bg-[#212121]" : value === 1 ? "bg-[#d9654b]" : "bg-[#68c78e]";
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() =>
                            setWindowDays((prev) => {
                              const next = [...prev];
                              next[index] = (next[index] + 1) % 3;
                              return next;
                            })
                          }
                          className={`h-8 w-8 rounded-md transition-transform hover:scale-110 active:scale-95 ${colorClass}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="reveal stagger-1 relative col-span-12 flex flex-col overflow-hidden rounded-[2rem] bg-[#212121] p-6 sm:p-8 md:col-span-4">
                <div className="organic-blob slow absolute -left-16 -top-16 z-0 h-64 w-64 overflow-hidden bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] opacity-50" />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{COPY.bento.later.eyebrow}</div>
                  <h3 className="mb-8 pr-4 text-xl font-medium leading-tight text-white">{COPY.bento.later.title}</h3>

                  <div className="mt-auto space-y-3">
                    <div className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#2a2a2a] p-3 transition-all hover:-translate-y-1 hover:bg-[#333] hover:shadow-lg">
                      <Lightbulb className="ml-1 h-4 w-4 text-zinc-500" />
                      <span className="text-sm font-medium text-zinc-500 transition-colors hover:text-white">
                        {COPY.bento.later.first}
                      </span>
                    </div>
                    <div className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#2a2a2a] p-3 transition-all hover:-translate-y-1 hover:bg-[#333] hover:shadow-lg">
                      <Link2 className="ml-1 h-4 w-4 text-zinc-500" />
                      <span className="text-sm font-medium text-zinc-500 transition-colors hover:text-white">
                        {COPY.bento.later.second}
                      </span>
                    </div>
                    <div className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#2a2a2a] p-3 transition-colors hover:bg-[#333]">
                      <span className="ml-1 text-sm font-medium text-zinc-600">{COPY.bento.later.more}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reveal stagger-2 relative col-span-12 overflow-hidden rounded-[2rem] bg-[#F2EDE4] p-6 sm:p-8 md:col-span-4">
                <div
                  className={`absolute -bottom-16 -right-16 z-0 h-56 w-56 transition-all duration-700 ease-in-out ${nightState === "idle" ? "" : "scale-[2.5] opacity-30"
                    }`}
                >
                  <div
                    className={`organic-blob absolute inset-0 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.05)] transition-colors duration-700 ease-in-out ${nightState === "yes" ? "bg-[#68c78e]" : nightState === "no" ? "bg-[#f07053]" : "bg-[#e4dfd5]"
                      }`}
                    style={{ animationDelay: "-5s" }}
                  />
                </div>
                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{COPY.bento.night.eyebrow}</div>
                  <h3 className="mb-2 text-2xl font-medium leading-tight text-zinc-900">
                    {nightState === "yes"
                      ? COPY.bento.night.yesTitle
                      : nightState === "no"
                        ? COPY.bento.night.noTitle
                        : COPY.bento.night.idleTitle}
                  </h3>
                  <p className="mb-8 text-sm text-zinc-500">
                    {nightState === "yes"
                      ? COPY.bento.night.yesBody
                      : nightState === "no"
                        ? COPY.bento.night.noBody
                        : COPY.bento.night.idleBody}
                  </p>

                  {nightState === "idle" ? (
                    <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setNightState("yes")}
                        className="w-full rounded-xl bg-[#212121] px-4 py-3 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95 sm:w-auto"
                      >
                        {COPY.bento.night.yesButton}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNightState("no")}
                        className="w-full rounded-xl bg-[#e4dfd5] px-4 py-3 text-xs font-semibold text-zinc-500 transition-all hover:bg-[#dbd6cc] active:scale-95 sm:w-auto"
                      >
                        {COPY.bento.night.noButton}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="reveal stagger-3 relative col-span-12 flex flex-col items-start justify-between overflow-hidden rounded-[2rem] bg-[#68c78e] p-8 md:flex-row md:items-end md:p-10">
                <div className="organic-blob slow absolute left-8 top-8 z-0 h-16 w-16 overflow-hidden bg-gradient-to-br from-[#f07053] to-[#d9654b] opacity-30 mix-blend-multiply" />
                <div className="relative z-10 max-w-3xl">
                  <div className="mb-4 ml-2 text-[10px] font-bold uppercase tracking-widest text-[#3b7a54]">{COPY.bento.point.eyebrow}</div>
                  <h3 className="text-3xl font-medium leading-tight text-[#13311f] md:text-4xl">{COPY.bento.point.title}</h3>
                </div>
                <div className="relative z-10 mt-8 whitespace-nowrap rounded-full bg-[#5eb480] px-6 py-3 text-sm font-medium text-[#13311f] md:mb-2 md:mt-0">
                  {COPY.bento.point.chip}
                </div>
              </div>
            </div>
          </section>

          <section className="relative z-0 mx-auto max-w-6xl px-5 py-12 sm:px-6">
            <div className="reveal flex flex-col items-center gap-10 rounded-[2.4rem] bg-[#B8AEE0] p-5 sm:gap-12 sm:rounded-[3rem] sm:p-8 md:flex-row md:p-12 lg:gap-20 lg:p-16">
              <div className="w-full md:w-1/2">
                <h2 className="mb-4 text-4xl font-medium tracking-tight text-zinc-900 md:text-5xl">{COPY.faq.heading}</h2>
                <p className="mb-10 text-lg text-zinc-800/80">{COPY.faq.subtitle}</p>

                <div className="space-y-3">
                  {FAQ_DATA.map((faq, index) => (
                    <button
                      key={faq.title}
                      type="button"
                      onClick={() => handleFaqSelect(index)}
                      className="faq-pill relative w-full overflow-hidden rounded-xl bg-black/[0.06] text-left transition-colors hover:bg-black/[0.1]"
                    >
                      <div
                        key={`${faqProgressKey}-${index}`}
                        className={`absolute bottom-0 left-0 top-0 z-0 bg-black/[0.12] ${faqIndex === index ? "faq-progress-active" : "w-0"
                          }`}
                        style={
                          faqIndex === index
                            ? ({ ["--faq-duration" as string]: `${faqDuration}ms` } as CSSProperties)
                            : undefined
                        }
                      />
                      <div className="relative z-10 flex items-center gap-3 p-4 text-sm font-semibold text-zinc-900">
                        {faq.icon === "calendar" ? <Calendar className="h-4 w-4 text-zinc-800" /> : null}
                        {faq.icon === "layers" ? <Layers className="h-4 w-4 text-zinc-800" /> : null}
                        {faq.icon === "activity" ? <Activity className="h-4 w-4 text-zinc-800" /> : null}
                        {faq.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex h-[340px] w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-[#1a1a1a] bg-[#212121] p-2 sm:h-[400px] sm:rounded-[2.5rem] md:w-1/2 md:p-3">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.03]"
                  style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                />
                <div className="pointer-events-none absolute left-[-8%] top-[8%] h-40 w-40 rounded-full bg-[#B8AEE0]/15 blur-3xl" />
                <div className="pointer-events-none absolute bottom-[-8%] right-[-4%] h-44 w-44 rounded-full bg-[#E8694A]/10 blur-3xl" />

                <div
                  className={`card-transition relative z-10 h-full w-full rounded-[2rem] ${faqVisible ? "translate-y-0 opacity-100" : "translate-y-[10px] opacity-0"
                    }`}
                >
                  <div className="relative flex h-full w-full scale-[0.84] items-center justify-center sm:scale-100">
                    {faqIndex === 0 ? (
                      <div className="relative h-full w-full">
                        <div className="absolute left-[-1%] top-[3%] w-[74%] rotate-[-10deg] overflow-hidden rounded-[1.9rem] border border-border/80 bg-parchment p-4 shadow-[0_30px_70px_rgba(0,0,0,0.28)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-body text-[8px] font-medium uppercase tracking-[0.12em] text-dusk">Your window</div>
                              <div className="font-gtw text-[22px] tracking-[-0.03em] text-ink">14 days</div>
                            </div>
                            <div className="rounded-full bg-sand px-3 py-1 font-body text-[9px] font-medium uppercase tracking-[0.1em] text-dusk">
                              day 05
                            </div>
                          </div>
                          <div className="mt-4 rounded-[1.3rem] bg-sand p-4">
                            <div className="font-body text-[8px] font-medium uppercase tracking-[0.12em] text-dusk">Directions</div>
                            <div className="mt-3 space-y-2.5">
                              {[
                                { label: "Ship copy update", color: "bg-terra" },
                                { label: "Protect deep work", color: "bg-forest" },
                                { label: "Lift 3x this week", color: "bg-slate" },
                              ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                  <span className="font-gtw text-[15px] tracking-[-0.02em] text-ink">{item.label}</span>
                                  <span className={`h-[8px] w-[8px] rounded-full ${item.color}`} />
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4 flex gap-[7px]">
                            {Array.from({ length: 14 }).map((_, index) => (
                              <span
                                key={index}
                                className={`h-[8px] w-[8px] rounded-full ${index < 5 ? "bg-ink" : index === 5 ? "bg-terra" : "bg-border"}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="absolute right-[-2%] top-[16%] w-[48%] rotate-[12deg] overflow-hidden rounded-[1.6rem] border border-zinc-700/50 bg-[#18181b] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="font-body text-[8px] font-medium uppercase tracking-[0.12em] text-zinc-500">Preview</span>
                            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          </div>
                          <div className="space-y-2">
                            {["Writing", "Product", "Health"].map((item, index) => (
                              <div key={item} className="rounded-[1rem] bg-[#232326] px-3 py-2.5">
                                <div className="font-body text-[7px] uppercase tracking-[0.1em] text-zinc-500">slot {index + 1}</div>
                                <div className="mt-1 font-medium text-[12px] text-white">{item}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {faqIndex === 1 ? (
                      <div className="relative h-full w-full">
                        <div className="absolute left-[-1%] top-[5%] w-[78%] rotate-[-4deg] overflow-hidden rounded-[2rem] border border-border/80 bg-parchment p-4 shadow-[0_30px_70px_rgba(0,0,0,0.26)]">
                          <div className="flex items-end justify-between pb-3">
                            <div>
                              <div className="font-body text-[8px] font-medium uppercase tracking-[0.12em] text-dusk">Today</div>
                              <div className="font-gtw text-[24px] tracking-[-0.03em] text-ink">Moves</div>
                            </div>
                            <div className="font-gtw text-[30px] leading-none tracking-[-0.04em] text-ink/15">3</div>
                          </div>
                          <div className="space-y-3">
                            {[
                              { label: "Publish the window plan", done: true },
                              { label: "Protect a deep work block", done: false },
                              { label: "Pitch deck redesign", done: false, muted: true },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className={`rounded-[1.25rem] border px-4 pb-4 pt-3 ${item.done
                                  ? "border-border bg-[#E6F4EC]"
                                  : item.muted
                                    ? "border-border/70 bg-parchment opacity-50"
                                    : "border-border bg-parchment"
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-body text-[8px] font-medium uppercase tracking-[0.1em] text-dusk">
                                    {item.done ? "Done" : item.muted ? "Later" : "Pending"}
                                  </span>
                                  <span
                                    className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${item.done ? "border-ink bg-ink text-white" : "border-ink/20 bg-transparent text-transparent"
                                      }`}
                                  >
                                    <Check className="h-[9px] w-[9px]" />
                                  </span>
                                </div>
                                <div className={`mt-2 font-gtw text-[17px] leading-[1.14] tracking-[-0.02em] text-ink ${item.done ? "line-through opacity-50" : ""}`}>
                                  {item.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="absolute bottom-[4%] right-[-1%] w-[42%] rotate-[10deg] overflow-hidden rounded-[1.5rem] border border-zinc-700/50 bg-[#18181b] p-3 shadow-[0_22px_56px_rgba(0,0,0,0.32)]">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="font-body text-[8px] font-medium uppercase tracking-[0.12em] text-zinc-500">Cap</span>
                            <Layers className="h-3.5 w-3.5 text-zinc-500" />
                          </div>
                          <div className="rounded-[1rem] bg-[#232326] px-3 py-3">
                            <div className="font-body text-[7px] uppercase tracking-[0.1em] text-zinc-500">Rule</div>
                            <div className="mt-1.5 font-medium text-[13px] leading-[1.25] text-white">Three moves.
                              <br />No more.</div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {faqIndex === 2 ? (
                      <div className="relative h-full w-full">
                        <div className="absolute left-[1%] top-[3%] w-[73%] rotate-[-7deg] overflow-hidden rounded-[1.9rem] border border-zinc-700/50 bg-[#171717] p-4 shadow-[0_34px_78px_rgba(0,0,0,0.36)]">
                          <div className="rounded-[1.3rem] bg-[#111111] px-4 py-4 text-parchment">
                            <div className="font-body text-[8px] font-medium uppercase tracking-[0.12em] text-white/35">Tonight</div>
                            <div className="mt-2 font-gtw text-[22px] leading-[1.08] tracking-[-0.03em]">Did you show up today?</div>
                            <div className="mt-2 font-body text-[11px] leading-[1.5] text-white/50">Day 5 of 14. Honest answer only.</div>
                          </div>
                          <div className="mt-3 rounded-[1.3rem] bg-[#5DBF8A] px-4 py-3.5 text-ink">
                            <div className="font-body text-[8px] font-medium uppercase tracking-[0.12em] text-ink/45">Saved</div>
                            <div className="mt-1 font-gtw text-[20px] tracking-[-0.03em]">You showed up.</div>
                          </div>
                          <div className="mt-3 rounded-[1.15rem] bg-[#232326] px-4 py-3 text-zinc-300">
                            <div className="font-body text-[7px] font-medium uppercase tracking-[0.11em] text-zinc-500">Why it matters</div>
                            <div className="mt-1 font-body text-[11px] leading-[1.45]">
                              Signal over streaks. Honest check-ins compound.
                            </div>
                          </div>
                        </div>

                        <div className="absolute right-[-1%] top-[17%] w-[45%] rotate-[11deg] overflow-hidden rounded-[1.7rem] border border-border/80 bg-parchment p-4 shadow-[0_26px_62px_rgba(0,0,0,0.24)]">
                          <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-sand">
                              <Activity className="h-4 w-4 text-dusk" />
                            </div>
                            <div className="font-gtw text-[16px] tracking-[-0.02em] text-ink">Signal</div>
                          </div>
                          <div className="rounded-[1rem] bg-sand px-3 py-3">
                            <p className="font-body text-[11px] leading-[1.55] text-dusk">
                              Completion can be noisy. Showing up is the behavior worth keeping.
                            </p>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-body text-[8px] font-medium uppercase tracking-[0.1em] text-dusk">State</span>
                            <span className="rounded-full bg-[#5DBF8A] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.1em] text-ink">
                              showed up
                            </span>
                          </div>
                        </div>

                        <div className="absolute bottom-[5%] left-[11%] rounded-full bg-[#232326] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 shadow-[0_14px_40px_rgba(0,0,0,0.3)]">
                          No streak theater
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="relative mt-20 flex flex-col">
            <div className="relative z-10 rounded-[3rem] bg-[#F2EDE4] text-zinc-900 shadow-2xl md:rounded-[5rem]">
              <div className="reveal mx-auto max-w-5xl px-5 py-24 text-center sm:px-6 sm:py-32">
                <h2 className="mb-8 text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-4xl md:text-6xl">
                  {COPY.footer.titleLine1} <br /> {COPY.footer.titleLine2}
                </h2>
                <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <Link
                    href="/app"
                    className="w-full rounded-full bg-zinc-900 px-8 py-4 font-medium text-white transition-transform hover:scale-105 sm:w-auto"
                  >
                    {COPY.footer.cta}
                  </Link>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Apple className="h-5 w-5 text-black" />
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Chrome className="h-5 w-5 text-black" />
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Compass className="h-5 w-5 text-black" />
                    </div>
                  </div>
                  <p className="text-[13px] font-medium text-zinc-500">{COPY.footer.browserHint}</p>
                </div>
              </div>
            </div>

            <div className="relative z-0 -mt-10 overflow-hidden pb-12 pt-24">
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="aurora-blue absolute bottom-[-10%] left-[10%] h-[300px] w-[300px] rounded-full bg-blue-600/20 blur-[100px] mix-blend-screen md:left-[20%] md:h-[500px] md:w-[500px] md:blur-[120px]" />
                <div className="aurora-orange absolute bottom-[-15%] right-[10%] h-[80px] w-[400px] -rotate-45 transform bg-gradient-to-r from-orange-500/40 to-yellow-400/40 blur-[60px] mix-blend-screen md:right-[30%] md:h-[100px] md:w-[600px] md:blur-[80px]" />
              </div>

              <div className="relative z-10 mx-auto max-w-6xl px-6">
                <div className="reveal stagger-1 flex flex-col items-start justify-between gap-12 border-t border-dashed border-zinc-800/80 pt-10 md:flex-row">
                  <div className="flex flex-col gap-4 text-[13px] font-medium text-white">
                    <Link href="/" className="transition-colors hover:text-zinc-300">
                      {COPY.footer.home}
                    </Link>
                    <Link href="/method" className="transition-colors hover:text-zinc-300">
                      {COPY.footer.guides}
                    </Link>
                    <a href={supportMailto} className="transition-colors hover:text-zinc-300">
                      {COPY.footer.support}
                    </a>
                    <a
                      href="https://github.com/saishankar404/align"
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-zinc-300"
                    >
                      GitHub
                    </a>
                    <div className="pt-2 text-[12px] text-zinc-500">{COPY.footer.copyright}</div>
                    <a
                      href="https://www.linkedin.com/in/sai-shankar101/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-300"
                    >
                      built with care @saishankar
                    </a>
                  </div>

                  <div className="w-full md:w-[380px] md:border-l md:border-dashed md:border-zinc-800/80 md:pl-16">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-[13px] font-medium text-white">{COPY.footer.stayInTouch}</span>
                      <div className="flex gap-4 text-zinc-400">
                        <a
                          href="https://x.com/saishankar404"
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors hover:text-white"
                          aria-label="X profile"
                        >
                          <Twitter className="h-[18px] w-[18px] stroke-[1.5]" />
                        </a>
                        <a
                          href="https://www.linkedin.com/in/sai-shankar101/"
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors hover:text-white"
                          aria-label="LinkedIn profile"
                        >
                          <Linkedin className="h-[18px] w-[18px] stroke-[1.5]" />
                        </a>
                        <a
                          href="https://github.com/saishankar404/align"
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors hover:text-white"
                          aria-label="GitHub repository"
                        >
                          <Github className="h-[18px] w-[18px] stroke-[1.5]" />
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-2 rounded-xl border border-zinc-800/50 bg-[#121212] p-1.5 shadow-inner transition-colors focus-within:border-zinc-600 sm:flex-row sm:items-center sm:gap-0">
                      <input
                        type="text"
                        placeholder={COPY.footer.subscribePlaceholder}
                        value={hiMessage}
                        onChange={(event) => setHiMessage(event.target.value)}
                        className="w-full border-none bg-transparent px-3 py-2 text-[13px] font-medium text-zinc-300 outline-none placeholder:text-zinc-500"
                      />
                      <a
                        href={hiMailto}
                        className="flex min-h-[44px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-zinc-700/50 bg-[#222] px-4 py-2 text-[12px] font-medium text-zinc-300 shadow-sm transition-colors hover:bg-[#333] hover:text-white sm:min-h-0"
                      >
                        <CornerDownLeft className="h-3.5 w-3.5" />
                        {COPY.footer.subscribeCta}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
