import type { ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
  return (
    <footer className="flex-none border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="flex p-2 justify-between">{children}</div>
    </footer>
  );
}
