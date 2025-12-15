import { useState, useEffect } from 'react';
import { FullscreenDialog } from './FullscreenDialog';
import { Input } from './ui/input';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemText: string;
  onSave: (newText: string) => void;
}

export function EditItemDialog({
  open,
  onOpenChange,
  itemText,
  onSave,
}: EditItemDialogProps) {
  const [text, setText] = useState(itemText);

  // Update text when itemText prop changes
  useEffect(() => {
    setText(itemText);
  }, [itemText]);

  const handleCancel = () => {
    setText(itemText); // Reset to original
    onOpenChange(false);
  };

  const handleDone = () => {
    if (text.trim()) {
      onSave(text.trim());
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && text.trim()) {
      handleDone();
    }
  };

  return (
    <FullscreenDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Item"
      onCancel={handleCancel}
      onDone={handleDone}
      doneDisabled={!text.trim()}
      doneText="Done"
    >
      <div className="p-4">
        <div className="rounded-lg border bg-card p-4">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Item name"
            autoFocus
            className="text-base"
          />
        </div>
      </div>
    </FullscreenDialog>
  );
}
