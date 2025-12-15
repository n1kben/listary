import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Edit3, Check, Trash2 } from 'lucide-react';
import { useLists } from '@/contexts/ListContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ListItem } from '@/types';

function SortableItem({
  listId,
  item,
  isEditing,
  onToggle,
  onDelete,
}: {
  listId: string;
  item: ListItem;
  isEditing: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="bg-white rounded-xl p-4 mb-2 shadow-sm flex items-center gap-3"
    >
      {!isEditing ? (
        <>
          <Checkbox
            checked={item.completed}
            onCheckedChange={onToggle}
            className="flex-shrink-0"
          />
          <span
            className={`flex-1 ${
              item.completed ? 'line-through text-gray-400' : 'text-gray-800'
            }`}
          >
            {item.text}
          </span>
        </>
      ) : (
        <>
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </div>
          <span className="flex-1 text-gray-800">{item.text}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </>
      )}
    </motion.div>
  );
}

export function ListItemsPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { lists, addItem, toggleItem, deleteItem, reorderItems } = useLists();
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const list = lists.find(l => l.id === listId);

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">List not found</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const sortedItems = [...list.items].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedItems.findIndex(item => item.id === active.id);
      const newIndex = sortedItems.findIndex(item => item.id === over.id);

      const newItems = [...sortedItems];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);

      reorderItems(list.id, newItems);
    }
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      addItem(list.id, newItemText.trim());
      setNewItemText('');
      setIsDialogOpen(false);
    }
  };

  const completedCount = sortedItems.filter(item => item.completed).length;
  const totalCount = sortedItems.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ backgroundColor: list.color }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <Button
              variant={isEditing ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-white hover:bg-white/20"
            >
              {isEditing ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Done
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{list.name}</h1>
          <p className="text-white/90">
            {completedCount} of {totalCount} completed
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {sortedItems.map(item => (
                <SortableItem
                  key={item.id}
                  listId={list.id}
                  item={item}
                  isEditing={isEditing}
                  onToggle={() => toggleItem(list.id, item.id)}
                  onDelete={() => deleteItem(list.id, item.id)}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>

        {/* Add Item Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <motion.button
              className="w-full rounded-xl p-4 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-gray-700 mt-4"
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Item</span>
            </motion.button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Item name..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddItem();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleAddItem} className="flex-1">Add</Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
