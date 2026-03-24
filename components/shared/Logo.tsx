import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

const LOGO_RATIO = 225 / 236;

export function Logo({ size = 28, className }: LogoProps) {
  return (
    <Image
      src="/logo_primary.svg"
      alt="Align."
      height={size}
      width={Math.round(size * LOGO_RATIO)}
      className={className}
      priority
    />
  );
}
