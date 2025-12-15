import * as React from "react";
import { cn } from "@/lib/utils";

interface ClickableAreaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /**
   * The size of the clickable area. Defaults to full navbar height.
   */
  size?: "header" | "default";
}

/**
 * A wrapper component that provides a large clickable area while keeping
 * the visual button small. Useful for touch targets that need to be large
 * but shouldn't visually dominate the UI.
 *
 * @example
 * ```tsx
 * <ClickableArea onClick={handleClick} disabled={isDisabled}>
 *   <Button size="compact">Done</Button>
 * </ClickableArea>
 * ```
 */
export function ClickableArea({
  children,
  size = "header",
  className,
  ...props
}: ClickableAreaProps) {
  const sizeClasses = {
    header: "h-15 px-6",
    default: "h-11 px-4",
  };

  return (
    <button
      className={cn(
        "flex items-center justify-center disabled:opacity-50 group",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
