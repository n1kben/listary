import type { ReactNode } from "react";

interface AppHeaderProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function AppHeader({ left, center, right }: AppHeaderProps) {
  return (
    <>
      <header className="shrink-0 border-b bg-background box-border fixed w-full">
        <div className="flex items-center justify-between h-26 items-end">
          <div className="flex items-center justify-between w-full">
            <div>{left}</div>
            <div>{center}</div>
            <div>{right}</div>
          </div>
        </div>
      </header>
      <div className="h-26"></div>
    </>
  );
}
