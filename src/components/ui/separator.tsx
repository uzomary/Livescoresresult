import * as React from "react"

import { cn } from "@/lib/utils"

type Orientation = "horizontal" | "vertical";

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation
  decorative?: boolean
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, role, ...props }, ref) => {
    const ariaOrientation = orientation === "vertical" ? "vertical" : undefined;
    const computedRole = decorative ? "none" : role ?? "separator";

    return (
      <div
        ref={ref}
        role={computedRole}
        aria-orientation={ariaOrientation as any}
        className={cn(
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className
        )}
        {...props}
      />
    )
  }
)
Separator.displayName = "Separator"

export { Separator }
