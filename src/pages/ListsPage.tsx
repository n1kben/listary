import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Settings,
  ChevronRight,
  List as ListIcon,
  ListPlus,
  Trash2,
} from "lucide-react";
import { useLists } from "@/contexts/ListContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { FullscreenDialog } from "@/components/FullscreenDialog";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { AddItemsDialog } from "@/components/AddItemsDialog";
import { EditListDialog } from "@/components/EditListDialog";
import { DragHandle } from "@/components/icons/DragHandle";
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
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
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
  onEdit,
  isSelected,
  onToggleSelect,
}: {
  list: List;
  isEditing: boolean;
  onEdit: (listId: string) => void;
  isSelected: boolean;
  onToggleSelect: (listId: string) => void;
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

  const content = (
    <div className="w-full flex items-center h-auto py-3 px-4">
      {!isEditing ? (
        <>
          <ListIcon className="h-5 w-5 text-muted-foreground shrink-0" />
          <span className="font-medium ml-3 flex-1">{list.name}</span>
          {totalCount > 0 && <Badge variant="secondary">{totalCount}</Badge>}
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(list.id)}
              className="rounded-full h-5 w-5"
            />
            <span
              className="font-medium flex-1 cursor-pointer"
              onClick={() => onEdit(list.id)}
            >
              {list.name}
            </span>
          </div>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 shrink-0 touch-none"
          >
            <DragHandle className="text-muted-foreground" />
          </div>
        </>
      )}
    </div>
  );

  return (
    <div ref={setNodeRef} style={style}>
      {isEditing ? (
        content
      ) : (
        <Link to={`/list/${list.id}`}>
          {content}
        </Link>
      )}
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
    updateList,
    deleteList,
    defaultListId,
    setDefaultListId,
  } = useLists();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
      if (movedList) {
        newLists.splice(newIndex, 0, movedList);
        reorderLists(newLists);
      }
    }
  };

  const handleAddList = () => {
    if (newListName.trim()) {
      addList(newListName.trim());
      setNewListName("");
      setIsListDialogOpen(false);
    }
  };

  const handleAddItems = (listId: string, items: string[]) => {
    items.forEach((text) => {
      addItem(listId, text);
    });
  };

  const handleEditList = (listId: string, newName: string) => {
    updateList(listId, { name: newName });
  };

  const handleToggleSelect = (listId: string) => {
    setSelectedLists((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listId)) {
        newSet.delete(listId);
      } else {
        newSet.add(listId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    selectedLists.forEach((listId) => {
      deleteList(listId);
    });
    setSelectedLists(new Set());
  };

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
    if (!editing) {
      setSelectedLists(new Set());
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
            onClick={() => handleEditingChange(!isEditing)}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        }
      />

      {/* Lists */}
      <main className="container max-w-2xl px-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
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
                onEdit={setEditingListId}
                isSelected={selectedLists.has(list.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </SortableContext>
        </DndContext>
      </main>

      {/* Edit List Dialog */}
      {editingListId && (
        <EditListDialog
          open={!!editingListId}
          onOpenChange={(open) => !open && setEditingListId(null)}
          listId={editingListId}
          currentName={lists.find((l) => l.id === editingListId)?.name ?? ""}
          onSave={handleEditList}
        />
      )}

      {/* Bottom Bar */}
      <AppFooter>
        {isEditing && selectedLists.size > 0 ? (
          <div className="flex-1 flex justify-center">
            {/* Remove button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelected}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        ) : (
          <>
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
            <AddItemsDialog
              lists={lists}
              defaultListId={defaultList?.id ?? sortedLists[0]?.id ?? null}
              onAddItems={handleAddItems}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={sortedLists.length === 0}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              }
            />
          </>
        )}
      </AppFooter>
    </div>
  );
}
