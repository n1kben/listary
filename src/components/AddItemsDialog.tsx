import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FullscreenDialog } from "@/components/FullscreenDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { List } from "@/types";

interface AddItemsDialogProps {
  lists: List[];
  defaultListId?: string | null;
  onAddItems: (listId: string, items: string[]) => void;
  trigger?: React.ReactNode;
}

export function AddItemsDialog({
  lists,
  defaultListId,
  onAddItems,
  trigger,
}: AddItemsDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState<string[]>([""]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const sortedLists = [...lists].sort((a, b) => a.order - b.order);

  const handleAddItems = () => {
    if (selectedListId) {
      // Filter out empty items and trim them
      const items = newItemTexts
        .map((text) => text.trim())
        .filter((text) => text !== "");
      if (items.length > 0) {
        onAddItems(selectedListId, items);
      }
      setNewItemTexts([""]);
      setSelectedListId(null);
      setIsDialogOpen(false);
    }
  };

  const handleItemKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const currentText = newItemTexts[index];
      if (currentText?.trim()) {
        // Add a new input field
        addNewItemInput();
      }
    }
  };

  const addNewItemInput = () => {
    setNewItemTexts([...newItemTexts, ""]);
  };

  const updateItemText = (index: number, value: string) => {
    const updated = [...newItemTexts];
    updated[index] = value;
    setNewItemTexts(updated);
  };


  return (
    <FullscreenDialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (open) {
          // Set default list when opening dialog
          setSelectedListId(defaultListId ?? sortedLists[0]?.id ?? null);
          setNewItemTexts([""]);
        }
      }}
      title="Add Items"
      onCancel={() => {
        setIsDialogOpen(false);
        setNewItemTexts([""]);
      }}
      onDone={handleAddItems}
      doneDisabled={!selectedListId || !newItemTexts.some((t) => t.trim())}
      trigger={
        trigger ?? (
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <div className="px-4 pt-4">
          <div className="bg-background rounded-lg border overflow-hidden">
            {newItemTexts.map((text, index) => (
              <div key={index}>
                <Input
                  placeholder="e.g. Milk, Bread..."
                  value={text}
                  onChange={(e) => updateItemText(index, e.target.value)}
                  onKeyDown={(e) => handleItemKeyDown(index, e)}
                  autoFocus={index === newItemTexts.length - 1}
                  className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 h-auto bg-transparent rounded-none"
                />
                {index < newItemTexts.length - 1 && <Separator />}
              </div>
            ))}
            <Separator />
            <Button
              type="button"
              variant="ghost"
              className="w-full rounded-none"
              onClick={addNewItemInput}
              disabled={newItemTexts.some((text) => text.trim() === "")}
            >
              Add another item
            </Button>
          </div>
        </div>

        <div className="px-4">
          <div className="bg-background rounded-lg border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-base">Add To</span>
              <Select
                value={selectedListId ?? ""}
                onValueChange={(value) => setSelectedListId(value || null)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  {sortedLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </FullscreenDialog>
  );
}
