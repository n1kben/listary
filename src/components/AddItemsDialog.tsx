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

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    const pastedText = e.clipboardData.getData("text");

    // Check if the pasted text contains newlines
    if (pastedText.includes("\n")) {
      e.preventDefault();

      // Parse the pasted content to extract items
      const lines = pastedText.split("\n");
      const extractedItems: string[] = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Remove common list prefixes
        let cleanedText = trimmedLine;

        // Match various list formats:
        // - "- item" or "* item"
        // - "- [ ] item" or "- [x] item" (checkbox items)
        // - "1. item" or "1) item" (numbered lists)
        const patterns = [
          /^[-*]\s*\[[ xX]\]\s*/,  // - [ ] or - [x]
          /^[-*]\s+/,               // - or *
          /^\d+[.)]\s+/,            // 1. or 1)
        ];

        for (const pattern of patterns) {
          if (pattern.test(cleanedText)) {
            cleanedText = cleanedText.replace(pattern, "");
            break;
          }
        }

        if (cleanedText) {
          extractedItems.push(cleanedText);
        }
      }

      if (extractedItems.length > 0) {
        // Replace the current input and add new ones for additional items
        const updated = [...newItemTexts];
        updated[index] = extractedItems[0] || "";

        // Add remaining items as new inputs
        for (let i = 1; i < extractedItems.length; i++) {
          updated.splice(index + i, 0, extractedItems[i] || "");
        }

        setNewItemTexts(updated);
      }
    }
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
          <Button variant="ghost" size="header-icon-ios">
            <Plus className="size-5" />
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
                  onPaste={(e) => handlePaste(index, e)}
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
