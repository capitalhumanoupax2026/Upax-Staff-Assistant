import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  initials?: string;
  alt?: string;
}

export function Avatar({ src, initials, alt, className, ...props }: AvatarProps) {
  const [error, setError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary border border-white/10",
        className
      )}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-[var(--dyn-accent-transparent)] text-[var(--dyn-accent)] font-bold text-sm">
          {initials || "??"}
        </span>
      )}
    </div>
  )
}
