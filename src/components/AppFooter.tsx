import { type ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
  return (
    <footer className="shrink-0 border-t bg-background box-border fixed bottom-0 left-0 right-0">
      <div className="flex items-start h-22">
        <div className="flex items-center justify-between w-full">
          {children}
        </div>
      </div>
    </footer>
  );
}
