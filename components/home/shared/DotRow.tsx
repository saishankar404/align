interface DotRowProps {
  currentDay: number;
  lengthDays: number;
}

export default function DotRow({ currentDay, lengthDays }: DotRowProps) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: lengthDays }).map((_, index) => {
        const day = index + 1;
        if (day < currentDay) {
          return <div key={day} className="w-[8px] h-[8px] rounded-full bg-ink" />;
        }

        if (day === currentDay) {
          return <div key={day} className="w-[8px] h-[8px] rounded-full bg-slate animate-[pulse_1.8s_ease-in-out_infinite]" />;
        }

        return <div key={day} className="w-[8px] h-[8px] rounded-full border border-border bg-transparent" />;
      })}
    </div>
  );
}
