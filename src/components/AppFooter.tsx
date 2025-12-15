import type { ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
  return (
    <footer className="shrink-0 border-t bg-background box-border h-15">
      <div className="flex justify-between items-center h-15">{children}</div>
    </footer>
  );
}
