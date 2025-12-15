import type { ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
  return (
    <footer className="shrink-0 border-t bg-background pb-[env(safe-area-inset-bottom)] box-border">
      <div className="flex justify-between items-center h-full">{children}</div>
    </footer>
  );
}
