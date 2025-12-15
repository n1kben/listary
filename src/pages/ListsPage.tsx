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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#95E1D3",
  "#FFD93D",
  "#6BCF7F",
  "#A78BFA",
  "#FFA07A",
  "#87CEEB",
];

export function ListsPage() {
  const { lists, reorderLists, addList, addItem } = useLists();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0] ?? "#FF6B6B");

  const sortedLists = [...lists].sort((a, b) => a.order - b.order);
  const defaultList = sortedLists[0];

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
      addList(newListName.trim(), selectedColor);
      setNewListName("");
      setSelectedColor(COLORS[0] ?? "#FF6B6B");
      setIsListDialogOpen(false);
    }
  };

  const handleAddItem = () => {
    if (newItemText.trim() && defaultList) {
      addItem(defaultList.id, newItemText.trim());
      setNewItemText("");
      setIsItemDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen pb-14">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between p-2">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <div>
                <Label className="text-sm text-muted-foreground px-4 py-2 block">
                  Theme
                </Label>
                <RadioGroup
                  value={theme}
                  onValueChange={(value) =>
                    setTheme(value as "light" | "dark" | "system")
                  }
                >
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-between h-auto py-3 rounded-none"
                      onClick={() => setTheme("light")}
                    >
                      <span className="font-medium">Light</span>
                      <RadioGroupItem value="light" id="light" />
                    </Button>
                    <Separator />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-between h-auto py-3 rounded-none"
                      onClick={() => setTheme("dark")}
                    >
                      <span className="font-medium">Dark</span>
                      <RadioGroupItem value="dark" id="dark" />
                    </Button>
                    <Separator />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-between h-auto py-3 rounded-none"
                      onClick={() => setTheme("system")}
                    >
                      <span className="font-medium">System</span>
                      <RadioGroupItem value="system" id="system" />
                    </Button>
                  </div>
                </RadioGroup>
              </div>
            </DialogContent>
          </Dialog>
          <h1 className="text-lg font-semibold">Lists</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>
      </header>

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
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur">
        <div className="flex p-2 justify-between">
          {/* Add List Button */}
          <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <ListPlus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="list-name">List Name</Label>
                  <Input
                    id="list-name"
                    placeholder="e.g. Shopping, Work Tasks..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddList();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {COLORS.map((color) => (
                      <Button
                        key={color}
                        type="button"
                        variant={
                          selectedColor === color ? "default" : "outline"
                        }
                        size="icon"
                        onClick={() => setSelectedColor(color)}
                        className="h-10 w-10 rounded-full"
                        style={{
                          backgroundColor:
                            selectedColor === color ? color : "transparent",
                          borderColor: color,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsListDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddList}>Add List</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Item Button */}
          <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!defaultList}>
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Item to {defaultList?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item-text">Item</Label>
                  <Input
                    id="item-text"
                    placeholder="e.g. Milk, Bread..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem();
                      }
                    }}
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsItemDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </footer>
    </div>
  );
}
