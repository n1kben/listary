import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";

interface FullscreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  onCancel: () => void;
  onDone: () => void;
  doneDisabled?: boolean;
  doneText?: string;
  children: ReactNode;
}

export function FullscreenDialog({
  open,
  onOpenChange,
  trigger,
  title,
  onCancel,
  onDone,
  doneDisabled = false,
  doneText = "Done",
  children,
}: FullscreenDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className="h-screen max-w-none w-screen p-0 gap-0 flex flex-col top-0 left-0 translate-x-0 translate-y-0 rounded-none"
        showCloseButton={false}
      >
        <AppHeader
          left={
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          }
          center={<h1 className="text-lg font-semibold">{title}</h1>}
          right={
            <Button size="sm" onClick={onDone} disabled={doneDisabled}>
              {doneText}
            </Button>
          }
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
