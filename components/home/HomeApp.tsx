"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import Calendar03Icon from "@hugeicons/core-free-icons/dist/esm/Calendar03Icon";
import Home01Icon from "@hugeicons/core-free-icons/dist/esm/Home01Icon";
import ListViewIcon from "@hugeicons/core-free-icons/dist/esm/ListViewIcon";
import UserIcon from "@hugeicons/core-free-icons/dist/esm/UserIcon";
import AiIdeaIcon from "@hugeicons/core-free-icons/dist/esm/AiIdeaIcon";
import TodayView from "./views/TodayView";
import WindowView from "./views/WindowView";
import LaterView from "./views/LaterView";
import ProfileView from "./views/ProfileView";
import MarkDoneSheet from "./sheets/MarkDoneSheet";
import ShowedUpSheet from "./sheets/ShowedUpSheet";
import NightCheckinSheet from "./sheets/NightCheckinSheet";
import AvoidedSheet from "./sheets/AvoidedSheet";
import TodayInfoSheet from "./sheets/TodayInfoSheet";
import AddMoveSheet from "./sheets/AddMoveSheet";
import AddLaterSheet from "./sheets/AddLaterSheet";
import DirectionDetailSheet from "./sheets/DirectionDetailSheet";
import LaterItemSheet from "./sheets/LaterItemSheet";
import DayDetailSheet from "./sheets/DayDetailSheet";
import DirectionsSheet from "./sheets/DirectionsSheet";
import TipsSheet from "./sheets/TipsSheet";
import WindowClosedFlow from "./WindowClosedFlow";
import { useAppContext, type SheetName } from "@/lib/context/AppContext";
import { isCycleExpired } from "@/lib/cycle/close";
import { Logo } from "@/components/shared/Logo";
import { ENTER_TRANSITION, EXIT_TRANSITION, MOTION_SPRING, TAP_SCALE, VIEW_TRANSITION } from "@/lib/motion/tokens";

type ViewId = "home" | "window" | "later" | "profile";

const VIEW_ORDER: ViewId[] = ["home", "window", "later", "profile"];
const VIEW_BACKGROUNDS: Record<ViewId, string> = {
  home: "bg-parchment",
  window: "bg-sand",
  later: "bg-parchment",
  profile: "bg-sand",
};

const viewVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-35%", transition: ENTER_TRANSITION }),
  center: { x: 0, transition: VIEW_TRANSITION },
  exit: (dir: number) => ({ x: dir > 0 ? "-12%" : "100%", transition: EXIT_TRANSITION }),
};

function NavIcon({ id, active }: { id: ViewId; active: boolean }) {
  const color = active ? "#F2EDE4" : "rgba(255,255,255,.3)";
  if (id === "home") {
    return <HugeiconsIcon icon={Home01Icon} size={20} color={color} strokeWidth={1.8} />;
  }
  if (id === "window") {
    return <HugeiconsIcon icon={Calendar03Icon} size={20} color={color} strokeWidth={1.8} />;
  }
  if (id === "later") {
    return <HugeiconsIcon icon={ListViewIcon} size={20} color={color} strokeWidth={1.8} />;
  }
  return <HugeiconsIcon icon={UserIcon} size={20} color={color} strokeWidth={1.8} />;
}

export default function HomeApp() {
  const context = useAppContext();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewId>("home");
  const [selectedTab, setSelectedTab] = useState<ViewId>("home");
  const [direction, setDirection] = useState(1);
  const [windowClosedVisible, setWindowClosedVisible] = useState(false);

  const goView = (next: ViewId) => {
    if (next === view) return;
    const dir = VIEW_ORDER.indexOf(next) > VIEW_ORDER.indexOf(view) ? 1 : -1;
    setDirection(dir);
    setSelectedTab(next);
    setView(next);
  };

  useEffect(() => {
    const sheet = searchParams.get("sheet");
    const viewParam = searchParams.get("view");
    const windowClosed = searchParams.get("windowClosed");
    const validViews: ViewId[] = ["home", "window", "later", "profile"];
    const validSheets: SheetName[] = [
      "mark-done",
      "showed-up",
      "night-checkin",
      "avoided",
      "today-info",
      "tips",
      "add-move",
      "add-later",
      "directions",
      "direction-detail",
      "later-item",
      "day-detail",
    ];

    if (viewParam && validViews.includes(viewParam as ViewId)) {
      const v = viewParam as ViewId;
      setView(v);
      setSelectedTab(v);
      setDirection(1);
    }

    if (sheet && validSheets.includes(sheet as SheetName)) {
      window.setTimeout(() => context.openSheet(sheet as SheetName), 200);
    }

    if (windowClosed === "1") {
      setWindowClosedVisible(true);
    }
  }, [context, searchParams]);

  useEffect(() => {
    const check = () => {
      if (context.currentCycle && isCycleExpired(context.currentCycle)) {
        setWindowClosedVisible(true);
      }
    };
    check();
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, [context.currentCycle]);

  const renderView = (viewId: ViewId) => {
    if (viewId === "home") return <TodayView onOpenLaterTab={() => goView("later")} />;
    if (viewId === "window") return <WindowView />;
    if (viewId === "later") return <LaterView />;
    return <ProfileView />;
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-parchment flex flex-col">
      <div className={`flex items-center justify-between px-7 pt-[calc(6px+env(safe-area-inset-top))] pb-[2px] shrink-0 z-10 ${VIEW_BACKGROUNDS[view]}`}>
        <div className="flex items-center gap-[10px] shrink-0">
          <Logo size={26} />
          <span className="font-gtw text-[25px] tracking-[-0.01em] text-dusk">Align.</span>
        </div>
        <button
          onClick={() => context.openSheet("tips")}
          className="w-8 h-8 rounded-full bg-sand/80 border border-border flex items-center justify-center"
          aria-label="Tips"
        >
          <HugeiconsIcon icon={AiIdeaIcon} size={16} color="#9E9485" strokeWidth={1.9} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden z-10">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div key={view} custom={direction} variants={viewVariants} initial="enter" animate="center" exit="exit" className={`absolute inset-0 overflow-hidden ${VIEW_BACKGROUNDS[view]}`}>
            {renderView(view)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-5 navbar-safe bg-gradient-to-t from-parchment from-[65%] to-transparent z-50">
        <div className="bg-ink rounded-full p-[8px_6px] flex items-center shadow-[0_12px_40px_rgba(0,0,0,.28)]">
          {VIEW_ORDER.map((nav) => {
            const active = nav === selectedTab;
            return (
              <motion.button key={nav} whileTap={{ scale: TAP_SCALE.default }} transition={MOTION_SPRING.press} onClick={() => goView(nav)} className={`flex-1 flex flex-col items-center gap-1 p-[8px_4px] rounded-full ${active ? "bg-white/10" : "bg-transparent"}`}>
                <NavIcon id={nav} active={active} />
                <span className={`font-body text-[9px] font-medium tracking-[0.07em] uppercase ${active ? "text-parchment" : "text-white/30"}`}>{nav === "home" ? "Home" : nav[0].toUpperCase() + nav.slice(1)}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <MarkDoneSheet />
      <ShowedUpSheet />
      <NightCheckinSheet />
      <AvoidedSheet />
      <TodayInfoSheet />
      <AddMoveSheet />
      <AddLaterSheet />
      <DirectionDetailSheet />
      <DirectionsSheet />
      <LaterItemSheet />
      <DayDetailSheet />
      <TipsSheet />

      {windowClosedVisible && context.currentCycle && context.userId ? (
        <WindowClosedFlow visible={windowClosedVisible} onComplete={() => { setWindowClosedVisible(false); void context.refresh(); }} />
      ) : null}
    </div>
  );
}
