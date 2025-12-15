import type { ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
  return (
    <>
      <div className="h-15"></div>
      <footer className="shrink-0 border-t bg-card box-border h-[calc(theme(spacing.15)+env(safe-area-inset-bottom))] fixed bottom-0 w-full">
        <div className="flex justify-between items-center h-15">{children}</div>
      </footer>
    </>
  );
}
