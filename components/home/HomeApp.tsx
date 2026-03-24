"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddCircleIcon,
  Calendar03Icon,
  Home01Icon,
  ListViewIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
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
import WindowClosedFlow from "./WindowClosedFlow";
import { useAppContext } from "@/lib/context/AppContext";
import { isCycleExpired } from "@/lib/cycle/close";

type ViewId = "home" | "window" | "later" | "profile";

const VIEW_ORDER: ViewId[] = ["home", "window", "later", "profile"];
const VIEW_BACKGROUNDS: Record<ViewId, string> = {
  home: "bg-parchment",
  window: "bg-sand",
  later: "bg-parchment",
  profile: "bg-sand",
};

const TRANSITION = { duration: 0.46, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

const viewVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-35%" }),
  center: { x: 0, transition: TRANSITION },
  exit: (dir: number) => ({ x: dir > 0 ? "-12%" : "100%", transition: TRANSITION }),
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
    const sheet = new URL(window.location.href).searchParams.get("sheet");
    if (sheet === "night-checkin") {
      window.setTimeout(() => context.openSheet("night-checkin"), 800);
      window.history.replaceState({}, "", "/home");
    }
  }, []);

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
      <div className="flex items-center gap-[6px] px-7 pt-[calc(14px+env(safe-area-inset-top))] shrink-0 z-10" style={{ background: "transparent" }}>
        <motion.button whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => goView("home")} className={`font-gtw text-[13px] tracking-[-0.01em] px-[18px] py-2 rounded-full ${selectedTab === "home" ? "bg-ink text-parchment" : "bg-sand text-dusk"}`}>Today</motion.button>
        <motion.button whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => goView("window")} className={`font-gtw text-[13px] tracking-[-0.01em] px-[18px] py-2 rounded-full ${selectedTab === "window" ? "bg-ink text-parchment" : "bg-sand text-dusk"}`}>Window</motion.button>
        <motion.button whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => context.openSheet("add-move")} className="ml-auto w-[34px] h-[34px] rounded-full bg-sand text-dusk flex items-center justify-center">
          <HugeiconsIcon icon={AddCircleIcon} size={18} color="#9E9485" strokeWidth={1.8} />
        </motion.button>
      </div>

      <div className="flex-1 relative overflow-hidden z-10">
        <AnimatePresence initial={false} custom={direction} mode="sync">
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
              <motion.button key={nav} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} onClick={() => goView(nav)} className={`flex-1 flex flex-col items-center gap-1 p-[8px_4px] rounded-full ${active ? "bg-white/10" : "bg-transparent"}`}>
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
      <LaterItemSheet />
      <DayDetailSheet />

      {windowClosedVisible && context.currentCycle && context.userId ? (
        <WindowClosedFlow visible={windowClosedVisible} onComplete={() => { setWindowClosedVisible(false); void context.refresh(); }} />
      ) : null}
    </div>
  );
}
