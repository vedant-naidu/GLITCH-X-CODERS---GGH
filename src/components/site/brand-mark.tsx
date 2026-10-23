import Image from "next/image";

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className = "", size = 36 }: BrandMarkProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-[#141416] border border-white/10 shadow-xs transition-transform group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.svg"
        alt="FXWise Logo"
        width={size}
        height={size}
        className="h-full w-full object-contain p-0.5"
        priority
      />
    </div>
  );
}