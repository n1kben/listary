import type { ReactNode } from "react";

interface AppHeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function AppHeader({ left, center, right }: AppHeaderProps) {
  return (
    <header className="shrink-0 border-b bg-background pt-[env(safe-area-inset-top)] box-border">
      <div className="flex items-center justify-between">
        <div>{left}</div>
        <div>{center}</div>
        <div>{right}</div>
      </div>
    </header>
  );
}
