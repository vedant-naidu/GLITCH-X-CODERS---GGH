import Image from "next/image";

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className = "", size = 40 }: BrandMarkProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-[1rem] border border-[var(--border)] shadow-[var(--shadow)] transition-transform hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.svg"
        alt="FXWise Logo"
        width={size}
        height={size}
        className="h-full w-full object-contain"
        priority
      />
    </div>
  );
}