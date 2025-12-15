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
        <div className="flex items-end h-26">
          <div className="grid grid-cols-3 items-center w-full">
            <div className="justify-self-start">{left}</div>
            <div className="justify-self-center">{center}</div>
            <div className="justify-self-end">{right}</div>
          </div>
        </div>
      </header>
      <div className="h-26"></div>
    </>
  );
}
