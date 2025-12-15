import type { ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
  return (
    <footer className="shrink-0 border-t bg-background pb-[env(safe-area-inset-bottom)] box-border">
      <div className="flex p-2 justify-between">{children}</div>
    </footer>
  );
}
