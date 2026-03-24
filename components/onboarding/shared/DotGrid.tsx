import clsx from "clsx";

type DotGridProps = {
  variant: "light" | "dark";
  showLabel?: boolean;
};

export default function DotGrid({ variant, showLabel = true }: DotGridProps) {
  const isLight = variant === "light";

  if (isLight) {
    return (
      <svg width="300" height="150" viewBox="0 0 300 150" fill="none" aria-hidden>
        <rect x="16" y="8" width="268" height="120" rx="14" fill="#E8E2D9" />
        <circle className="dg0" cx="44" cy="50" r="9" />
        <circle className="dg1" cx="76" cy="50" r="9" />
        <circle className="dg2" cx="108" cy="50" r="9" />
        <circle className="dg3" cx="140" cy="50" r="9" />
        <circle className="dg4" cx="172" cy="50" r="9" />
        <circle className="dg5" cx="204" cy="50" r="9" />
        <circle className="dg6" cx="236" cy="50" r="9" />
        <circle className="dg7" cx="44" cy="84" r="9" />
        <circle className="dg8" cx="76" cy="84" r="9" />
        <circle className="dg9" cx="108" cy="84" r="9" />
        <circle className="dg10" cx="140" cy="84" r="9" />
        <circle className="dg11" cx="172" cy="84" r="9" />
        <circle className="dg12" cx="204" cy="84" r="9" />
        <circle className="dg13" cx="236" cy="84" r="9" />
        <g className="tk3">
          <path d="M134 50 L138 54 L146 46" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g className="cr10">
          <path d="M135 79 L145 89M145 79 L135 89" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </g>
        <g className="tk12">
          <path d="M198 84 L202 88 L210 80" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {showLabel && (
          <text x="150" y="118" fontFamily="Satoshi,sans-serif" fontSize="9" fill="#9E9485" textAnchor="middle" letterSpacing="2">
            14 DAYS · 1 CYCLE
          </text>
        )}
      </svg>
    );
  }

  return (
    <svg width="280" height="175" viewBox="0 0 280 175" fill="none" className={clsx("animate-[floatY_3.5s_ease-in-out_infinite]")} aria-hidden>
      <rect x="22" y="14" width="236" height="130" rx="14" stroke="rgba(255,255,255,.1)" strokeWidth="1.5" />
      <circle cx="46" cy="33" r="5" fill="rgba(255,255,255,.12)" />
      <circle cx="62" cy="33" r="5" fill="rgba(255,255,255,.08)" />
      <circle cx="78" cy="33" r="5" fill="rgba(255,255,255,.05)" />
      <circle className="wdg0" cx="46" cy="68" r="8" />
      <circle className="wdg1" cx="74" cy="68" r="8" />
      <circle className="wdg2" cx="102" cy="68" r="8" />
      <circle className="wdg3" cx="130" cy="68" r="8" />
      <circle className="wdg4" cx="158" cy="68" r="8" />
      <circle className="wdg5" cx="186" cy="68" r="8" />
      <circle className="wdg6" cx="214" cy="68" r="8" />
      <circle className="wdg7" cx="46" cy="98" r="8" />
      <circle className="wdg8" cx="74" cy="98" r="8" />
      <circle className="wdg9" cx="102" cy="98" r="8" />
      <circle className="wdg10" cx="130" cy="98" r="8" />
      <circle className="wdg11" cx="158" cy="98" r="8" />
      <circle className="wdg12" cx="186" cy="98" r="8" />
      <circle className="wdg13" cx="214" cy="98" r="8" />
      <g className="tk3">
        <path d="M124 68 L128 72 L136 64" stroke="rgba(255,255,255,.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g className="cr10">
        <path d="M125 93 L135 103M135 93 L125 103" stroke="rgba(255,255,255,.75)" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <g className="tk12">
        <path d="M180 98 L184 102 L192 94" stroke="rgba(255,255,255,.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {showLabel && (
        <text x="130" y="130" fontFamily="Satoshi,sans-serif" fontSize="9" fill="rgba(255,255,255,.18)" textAnchor="middle" letterSpacing="2.5">
          DAY 5 OF 14
        </text>
      )}
    </svg>
  );
}
