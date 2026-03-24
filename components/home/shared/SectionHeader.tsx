interface SectionHeaderProps {
  label: string;
  title: string;
  count: string;
  paddingTop?: number;
}

export default function SectionHeader({ label, title, count, paddingTop = 36 }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-end px-7 pb-[10px]" style={{ paddingTop }}>
      <div>
        <div className="font-body text-[9px] font-medium tracking-[0.11em] uppercase text-dusk">{label}</div>
        <div className="font-gtw text-[32px] font-normal tracking-[-0.04em] leading-[0.95] text-ink">{title}</div>
      </div>
      <div className="font-gtw text-[40px] font-light tracking-[-0.04em] leading-none text-ink opacity-[0.12] mb-[-2px]">{count}</div>
    </div>
  );
}
