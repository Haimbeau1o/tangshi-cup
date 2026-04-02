import Image from "next/image";

import { cn } from "@/lib/utils";

type TeamAvatarProps = {
  src?: string;
  alt: string;
  accentColor?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: 44,
  md: 60,
  lg: 84,
} as const;

export function TeamAvatar({
  src,
  alt,
  accentColor = "#ff7a45",
  size = "md",
  className,
}: TeamAvatarProps) {
  const pixels = sizeMap[size];

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-black/30 p-1",
        className,
      )}
      style={{
        width: pixels,
        height: pixels,
        boxShadow: `0 0 0 1px ${accentColor}44, 0 18px 36px ${accentColor}22`,
        backgroundImage: `radial-gradient(circle at 20% 20%, ${accentColor}33, transparent 55%)`,
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={pixels}
          height={pixels}
          unoptimized={src.startsWith("data:")}
          className="h-full w-full rounded-[18px] object-contain bg-black/45 p-1"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-[18px] bg-black/45 text-lg font-semibold text-stone-100">
          {alt.slice(0, 1)}
        </div>
      )}
    </div>
  );
}
