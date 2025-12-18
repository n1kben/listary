import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, MoveRight, ListTodo } from "lucide-react";
import { useLists } from "@/contexts/ListContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { AddItemsDialog } from "@/components/AddItemsDialog";
import { FullscreenDialog } from "@/components/FullscreenDialog";
import { EditItemDialog } from "@/components/EditItemDialog";
import { DragHandle } from "@/components/icons/DragHandle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ListItem } from "@/types";

function SortableItem({
  item,
  isEditing,
  onToggle,
  isSelected,
  onToggleSelect,
  onEditItem,
}: {
  item: ListItem;
  isEditing: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onToggleSelect: (itemId: string) => void;
  onEditItem: (item: ListItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="w-full flex items-center h-auto py-3 px-4 select-none">
        {!isEditing ? (
          <>
            <Checkbox
              checked={item.completed}
              onCheckedChange={onToggle}
              className="h-5 w-5"
            />
            <span
              className={`flex-1 ml-3 cursor-pointer ${
                item.completed ? "line-through text-muted-foreground" : ""
              }`}
              onClick={() => onEditItem(item)}
            >
              {item.text}
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 flex-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(item.id)}
                className="rounded-full h-5 w-5"
              />
              <span
                className="flex-1 cursor-pointer"
                onClick={() => onEditItem(item)}
              >
                {item.text}
              </span>
            </div>
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing shrink-0 touch-none"
            >
              <DragHandle className="text-muted-foreground" />
            </div>
          </>
        )}
      </div>
      <Separator />
    </div>
  );
}

export function ListItemsPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const {
    lists,
    loading,
    addItems,
    toggleItem,
    deleteItems,
    reorderItems,
    moveItems,
    updateItem,
  } = useLists();
  const [isEditing, setIsEditing] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [targetListId, setTargetListId] = useState<string>("");
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ListItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const list = lists.find((l) => l.id === listId);

  if (loading) {
    return <LoadingSpinner message="Loading items..." />;
  }

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">List not found</p>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  const sortedItems = [...list.items].sort((a, b) => a.order - b.order);
  const activeItems = sortedItems.filter((item) => !item.completed);
  const completedItems = sortedItems.filter((item) => item.completed);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
      const newIndex = sortedItems.findIndex((item) => item.id === over.id);

      const newItems = [...sortedItems];
      const [movedItem] = newItems.splice(oldIndex, 1);
      if (movedItem) {
        newItems.splice(newIndex, 0, movedItem);
        reorderItems(list.id, newItems);
      }
    }
  };

  const handleAddItems = (listId: string, items: string[]) => {
    addItems(listId, items);
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    deleteItems(list.id, Array.from(selectedItems));
    setSelectedItems(new Set());
    setIsEditing(false);
  };

  const handleMoveSelected = () => {
    if (targetListId && targetListId !== list.id) {
      const itemsToMove =
        selectedItems.size > 0
          ? Array.from(selectedItems)
          : sortedItems.map((item) => item.id);

      moveItems(list.id, targetListId, itemsToMove);
      setSelectedItems(new Set());
      setIsMoveDialogOpen(false);
      setTargetListId("");
      setIsEditing(false);
    }
  };

  const handleDeleteAll = () => {
    const allItemIds = sortedItems.map((item) => item.id);
    deleteItems(list.id, allItemIds);
    setIsEditing(false);
  };

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
    if (!editing) {
      setSelectedItems(new Set());
    }
  };

  const handleEditItem = (item: ListItem) => {
    setItemToEdit(item);
    setIsEditItemDialogOpen(true);
  };

  const handleSaveItemEdit = (newText: string) => {
    if (itemToEdit) {
      updateItem(list.id, itemToEdit.id, { text: newText });
    }
  };

  return (
    <>
      {/* Header */}
      <AppHeader
        left={
          <Button
            variant="ghost"
            size="header-icon-ios"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="size-5" />
          </Button>
        }
        center={<h1 className="text-lg font-semibold">{list.name}</h1>}
        right={
          <Button
            variant="ghost"
            size="header-ios"
            onClick={() => handleEditingChange(!isEditing)}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        }
      />

      {/* Items */}
      <main className="pt-26 pb-22 px-0 flex-1">
        {activeItems.length === 0 && completedItems.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListTodo />
              </EmptyMedia>
              <EmptyTitle>No Items Yet</EmptyTitle>
              <EmptyDescription>
                Start adding items to your list. Tap the plus button below to
                add your first item.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              {/* Active Items */}
              <SortableContext
                items={activeItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {activeItems.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    isEditing={isEditing}
                    onToggle={() => toggleItem(list.id, item.id)}
                    isSelected={selectedItems.has(item.id)}
                    onToggleSelect={handleToggleSelect}
                    onEditItem={handleEditItem}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Hide/Show Completed Toggle */}
            {completedItems.length > 0 && (
              <>
                <Separator />
                <Button
                  variant="ghost"
                  className="w-full justify-center h-auto py-3 rounded-none text-muted-foreground"
                  onClick={() => setHideCompleted(!hideCompleted)}
                >
                  {hideCompleted
                    ? `Show ${completedItems.length} Completed Item${completedItems.length === 1 ? "" : "s"}`
                    : `Hide ${completedItems.length} Completed Item${completedItems.length === 1 ? "" : "s"}`}
                </Button>
                <Separator />
              </>
            )}

            {/* Completed Items */}
            {!hideCompleted && completedItems.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={completedItems.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {completedItems.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      isEditing={isEditing}
                      onToggle={() => toggleItem(list.id, item.id)}
                      isSelected={selectedItems.has(item.id)}
                      onToggleSelect={handleToggleSelect}
                      onEditItem={handleEditItem}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </>
        )}
      </main>

      {/* Bottom Bar */}
      <AppFooter>
        {isEditing ? (
          selectedItems.size > 0 ? (
            <div className="flex-1 flex justify-center items-center gap-2">
              {/* Move (n) button */}
              <Button
                variant="ghost"
                size="header-ios"
                onClick={() => setIsMoveDialogOpen(true)}
              >
                <MoveRight className="mr-2" />
                Move ({selectedItems.size})
              </Button>

              {/* Delete (n) button */}
              <Button
                variant="ghost"
                size="header-ios"
                onClick={handleDeleteSelected}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2" />
                Delete ({selectedItems.size})
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center gap-2">
              {/* Move All button */}
              <Button
                variant="ghost"
                size="header-ios"
                onClick={() => setIsMoveDialogOpen(true)}
              >
                <MoveRight className="mr-2" />
                Move All
              </Button>

              {/* Delete All button */}
              <Button
                variant="ghost"
                size="header-ios"
                onClick={handleDeleteAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2" />
                Delete All
              </Button>
            </div>
          )
        ) : (
          <>
            <div className="flex-1" />
            <AddItemsDialog
              lists={lists}
              defaultListId={list.id}
              onAddItems={handleAddItems}
            />
          </>
        )}
      </AppFooter>

      {/* Move Dialog */}
      <FullscreenDialog
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        title="Move Items"
        onCancel={() => {
          setIsMoveDialogOpen(false);
          setTargetListId("");
        }}
        onDone={handleMoveSelected}
        doneDisabled={!targetListId || targetListId === list.id}
      >
        <div className="p-4">
          <div className="mb-4 text-sm text-muted-foreground">
            {selectedItems.size > 0
              ? `Move ${selectedItems.size} item${selectedItems.size === 1 ? "" : "s"} to:`
              : `Move all ${sortedItems.length} item${sortedItems.length === 1 ? "" : "s"} to:`}
          </div>
          <Select value={targetListId} onValueChange={setTargetListId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a list" />
            </SelectTrigger>
            <SelectContent>
              {lists
                .filter((l) => l.id !== list.id)
                .map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </FullscreenDialog>

      {/* Edit Item Dialog */}
      {itemToEdit && (
        <EditItemDialog
          open={isEditItemDialogOpen}
          onOpenChange={setIsEditItemDialogOpen}
          itemText={itemToEdit.text}
          onSave={handleSaveItemEdit}
        />
      )}
    </>
  );
}
