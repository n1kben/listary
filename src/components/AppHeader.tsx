import type { ReactNode } from "react";

interface AppHeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function AppHeader({ left, center, right }: AppHeaderProps) {
  return (
    <>
      <header className="shrink-0 border-b bg-card box-border fixed w-full h-[calc(theme(spacing.15)+env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <div>{left}</div>
          <div>{center}</div>
          <div>{right}</div>
        </div>
      </header>
      <div className="h-15"></div>
    </>
  );
}
