interface SectionHeaderProps {
  label: string;
  title: string;
  count: string;
  paddingTop?: number;
}

export default function SectionHeader({ label, title, count, paddingTop = 36 }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-end pb-[10px]" style={{ paddingTop }}>
      <div>
        <div className="font-body text-[9px] font-medium tracking-[0.11em] uppercase text-dusk">{label}</div>
        <div className="font-gtw text-[31px] font-normal tracking-[-0.035em] leading-[1] text-ink whitespace-nowrap">{title}</div>
      </div>
      <div className="font-gtw text-[38px] font-light tracking-[-0.04em] leading-none text-ink opacity-[0.12] mb-[-1px]">{count}</div>
    </div>
  );
}
