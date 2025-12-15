import { useState } from 'react';
import { FullscreenDialog } from './FullscreenDialog';
import { Input } from './ui/input';

interface EditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  currentName: string;
  onSave: (listId: string, newName: string) => void;
}

export function EditListDialog({
  open,
  onOpenChange,
  listId,
  currentName,
  onSave,
}: EditListDialogProps) {
  const [name, setName] = useState(currentName);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset the name when dialog opens
      setName(currentName);
    }
    onOpenChange(isOpen);
  };

  const handleDone = () => {
    if (name.trim()) {
      onSave(listId, name.trim());
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setName(currentName);
    onOpenChange(false);
  };

  return (
    <FullscreenDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit List"
      onCancel={handleCancel}
      onDone={handleDone}
      doneDisabled={!name.trim()}
    >
      <div className="p-4">
        <div className="bg-background rounded-lg border overflow-hidden">
          <Input
            id="list-name"
            placeholder="e.g. Shopping, Work Tasks..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) {
                handleDone();
              }
            }}
            autoFocus
            className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 h-auto bg-transparent rounded-none"
          />
        </div>
      </div>
    </FullscreenDialog>
  );
}
