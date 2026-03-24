"use client";

import { useEffect, useId, useState } from "react";

const PROJECT_ID = "jgnlBVzmtq819Jfg1NOj";
const SDK_URL =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.5/dist/unicornStudio.umd.js";

type UnicornSceneHandle = {
  destroy?: () => void;
};

type UnicornStudioApi = {
  addScene: (options: {
    elementId: string;
    projectId: string;
    lazyLoad?: boolean;
    production?: boolean;
    scale?: number;
    dpi?: number;
    fps?: number;
  }) => Promise<UnicornSceneHandle> | UnicornSceneHandle;
};

declare global {
  interface Window {
    UnicornStudio?: UnicornStudioApi;
  }
}

let sdkPromise: Promise<UnicornStudioApi> | null = null;

function loadSdk() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Unicorn Studio can only load in the browser."));
  }

  if (window.UnicornStudio) {
    return Promise.resolve(window.UnicornStudio);
  }

  if (!sdkPromise) {
    sdkPromise = new Promise<UnicornStudioApi>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-unicorn-sdk="true"]');

      const handleLoad = () => {
        if (window.UnicornStudio) {
          resolve(window.UnicornStudio);
          return;
        }

        reject(new Error("Unicorn Studio SDK loaded without exposing the global API."));
      };

      if (existingScript) {
        existingScript.addEventListener("load", handleLoad, { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Unicorn Studio SDK.")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.dataset.unicornSdk = "true";
      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", () => reject(new Error("Failed to load Unicorn Studio SDK.")), { once: true });
      document.head.appendChild(script);
    });
  }

  return sdkPromise;
}

export default function UnicornHeroBackground() {
  const reactId = useId();
  const containerId = `unicorn-hero-${reactId.replace(/:/g, "")}`;
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let scene: UnicornSceneHandle | null = null;
    let cancelled = false;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isNarrowViewport = window.innerWidth < 768;

    loadSdk()
      .then((sdk) =>
        sdk.addScene({
          elementId: containerId,
          projectId: PROJECT_ID,
          production: true,
          lazyLoad: false,
          scale: prefersReducedMotion ? 0.55 : isNarrowViewport ? 0.72 : 0.9,
          dpi: prefersReducedMotion ? 1 : 1.2,
          fps: prefersReducedMotion ? 30 : 60,
        })
      )
      .then((instance) => {
        if (cancelled) {
          instance?.destroy?.();
          return;
        }

        scene = instance ?? null;
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
        }
      });

    return () => {
      cancelled = true;
      scene?.destroy?.();
    };
  }, [containerId]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        id={containerId}
        className={`absolute inset-0 transition-opacity duration-300 ${loadFailed ? "opacity-0" : "opacity-100"}`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.5),rgba(242,237,228,0.9)_56%,#F2EDE4)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(242,237,228,0.94),rgba(242,237,228,0))]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,rgba(242,237,228,0),rgba(242,237,228,0.88)_72%,#F2EDE4)]" />
    </div>
  );
}
