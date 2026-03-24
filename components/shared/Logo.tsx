import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  src?: string;
  priority?: boolean;
}

const LOGO_RATIO = 225 / 236;

export function Logo({ size = 28, className, src = "/logo_primary.svg", priority = false }: LogoProps) {
  return (
    <Image
      src={src}
      alt="Align."
      height={size}
      width={Math.round(size * LOGO_RATIO)}
      className={className}
      priority={priority}
    />
  );
}
