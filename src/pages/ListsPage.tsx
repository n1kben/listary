import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Settings,
  ChevronRight,
  List as ListIcon,
  ListPlus,
} from "lucide-react";
import { useLists } from "@/contexts/ListContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FullscreenDialog } from "@/components/FullscreenDialog";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { List } from "@/types";

function SortableListItem({
  list,
  isEditing,
}: {
  list: List;
  isEditing: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const totalCount = list.items.length;

  return (
    <div ref={setNodeRef} style={style}>
      <Link
        to={`/list/${list.id}`}
        className={isEditing ? "pointer-events-none" : ""}
      >
        <Button
          variant="ghost"
          className="w-full justify-between h-auto py-3 rounded-none"
          {...(isEditing ? { ...attributes, ...listeners } : {})}
        >
          <div className="flex items-center gap-3">
            <ListIcon className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{list.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {totalCount > 0 && <Badge variant="secondary">{totalCount}</Badge>}
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Button>
      </Link>
      <Separator />
    </div>
  );
}

export function ListsPage() {
  const {
    lists,
    reorderLists,
    addList,
    addItem,
    defaultListId,
    setDefaultListId,
  } = useLists();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newItemTexts, setNewItemTexts] = useState<string[]>([""]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const sortedLists = [...lists].sort((a, b) => a.order - b.order);
  const defaultList = defaultListId
    ? lists.find((l) => l.id === defaultListId)
    : sortedLists[0];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedLists.findIndex((list) => list.id === active.id);
      const newIndex = sortedLists.findIndex((list) => list.id === over.id);

      const newLists = [...sortedLists];
      const [movedList] = newLists.splice(oldIndex, 1);
      newLists.splice(newIndex, 0, movedList);

      reorderLists(newLists);
    }
  };

  const handleAddList = () => {
    if (newListName.trim()) {
      addList(newListName.trim());
      setNewListName("");
      setIsListDialogOpen(false);
    }
  };

  const handleAddItems = () => {
    if (selectedListId) {
      // Add all non-empty items
      newItemTexts.forEach((text) => {
        if (text.trim()) {
          addItem(selectedListId, text.trim());
        }
      });
      setNewItemTexts([""]);
      setSelectedListId(null);
      setIsItemDialogOpen(false);
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

    // If the input is cleared and there are multiple inputs, remove it
    if (value === "" && newItemTexts.length > 1) {
      const filtered = updated.filter((_, i) => i !== index);
      setNewItemTexts(filtered);
    } else {
      setNewItemTexts(updated);
    }
  };

  return (
    <div className="min-h-screen pb-14">
      {/* Header */}
      <AppHeader
        left={
          <FullscreenDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            title="Settings"
            onCancel={() => setIsSettingsOpen(false)}
            onDone={() => setIsSettingsOpen(false)}
            trigger={
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            }
          >
            <div>
              {/* Theme Setting */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <Label className="text-base font-normal">Theme</Label>
                <ToggleGroup
                  type="single"
                  value={theme}
                  onValueChange={(value) => {
                    if (value) setTheme(value as "light" | "dark" | "system");
                  }}
                >
                  <ToggleGroupItem value="light" aria-label="Light theme">
                    Light
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dark" aria-label="Dark theme">
                    Dark
                  </ToggleGroupItem>
                  <ToggleGroupItem value="system" aria-label="System theme">
                    System
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Default List Setting */}
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <Label htmlFor="default-list" className="text-base font-normal">
                  Default List
                </Label>
                <Select
                  value={defaultListId ?? ""}
                  onValueChange={(value) => setDefaultListId(value || null)}
                >
                  <SelectTrigger id="default-list" className="w-[180px]">
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
          </FullscreenDialog>
        }
        center={<h1 className="text-lg font-semibold">Lists</h1>}
        right={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        }
      />

      {/* Lists */}
      <main className="container max-w-2xl px-0">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedLists.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedLists.map((list) => (
              <SortableListItem
                key={list.id}
                list={list}
                isEditing={isEditing}
              />
            ))}
          </SortableContext>
        </DndContext>
      </main>

      {/* Bottom Bar */}
      <AppFooter>
        {/* Add List Button */}
        <FullscreenDialog
          open={isListDialogOpen}
          onOpenChange={setIsListDialogOpen}
          title="Add New List"
          onCancel={() => setIsListDialogOpen(false)}
          onDone={handleAddList}
          doneDisabled={!newListName.trim()}
          trigger={
            <Button variant="ghost" size="icon">
              <ListPlus className="h-5 w-5" />
            </Button>
          }
        >
          <div className="p-4">
            <div className="bg-background rounded-lg border overflow-hidden">
              <Input
                id="list-name"
                placeholder="e.g. Shopping, Work Tasks..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newListName.trim()) {
                    handleAddList();
                  }
                }}
                autoFocus
                className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 h-auto bg-transparent rounded-none"
              />
            </div>
          </div>
        </FullscreenDialog>

        {/* Add Item Button */}
        <FullscreenDialog
          open={isItemDialogOpen}
          onOpenChange={(open) => {
            setIsItemDialogOpen(open);
            if (open) {
              // Set default list when opening dialog
              setSelectedListId(defaultList?.id ?? sortedLists[0]?.id ?? null);
              setNewItemTexts([""]);
            }
          }}
          title="Add Items"
          onCancel={() => {
            setIsItemDialogOpen(false);
            setNewItemTexts([""]);
          }}
          onDone={handleAddItems}
          doneDisabled={!selectedListId || !newItemTexts.some((t) => t.trim())}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              disabled={sortedLists.length === 0}
            >
              <Plus className="h-5 w-5" />
            </Button>
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
      </AppFooter>
    </div>
  );
}
