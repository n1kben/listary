import type { ReactNode } from "react";

interface AppHeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function AppHeader({ left, center, right }: AppHeaderProps) {
  return (
    <header className="flex-none border-b bg-background pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between p-2">
        <div>{left}</div>
        <div>{center}</div>
        <div>{right}</div>
      </div>
    </header>
  );
}
