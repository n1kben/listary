import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useSupabaseLists } from '@/hooks/useSupabaseLists';
import { useSupabasePreferences } from '@/hooks/useSupabasePreferences';
import type { List, ListItem, PlacementPosition } from '@/types';

interface ListContextType {
  lists: List[];
  loading: boolean;
  defaultListId: string | null;
  setDefaultListId: (id: string | null) => void;
  newListPlacement: PlacementPosition;
  setNewListPlacement: (position: PlacementPosition) => void;
  newItemPlacement: PlacementPosition;
  setNewItemPlacement: (position: PlacementPosition) => void;
  addList: (name: string) => void;
  deleteList: (id: string) => void;
  deleteLists: (ids: string[]) => void;
  updateList: (id: string, updates: Partial<List>) => void;
  reorderLists: (lists: List[]) => void;
  addItem: (listId: string, text: string) => void;
  addItems: (listId: string, texts: string[]) => void;
  deleteItem: (listId: string, itemId: string) => void;
  deleteItems: (listId: string, itemIds: string[]) => void;
  toggleItem: (listId: string, itemId: string) => void;
  updateItem: (listId: string, itemId: string, updates: Partial<ListItem>) => void;
  updateItems: (listId: string, itemIds: string[], updates: Partial<ListItem>) => void;
  reorderItems: (listId: string, items: ListItem[]) => void;
  moveItems: (fromListId: string, toListId: string, itemIds: string[]) => void;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

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

export function ListProvider({ children }: { children: ReactNode }) {
  const {
    lists,
    loading: listsLoading,
    addList: addListDb,
    deleteList: deleteListDb,
    deleteLists: deleteListsDb,
    updateList: updateListDb,
    reorderLists: reorderListsDb,
    addItem: addItemDb,
    addItems: addItemsDb,
    deleteItem: deleteItemDb,
    deleteItems: deleteItemsDb,
    toggleItem: toggleItemDb,
    updateItem: updateItemDb,
    updateItems: updateItemsDb,
    reorderItems: reorderItemsDb,
    moveItems: moveItemsDb,
  } = useSupabaseLists();

  const {
    defaultListId,
    newListPlacement,
    newItemPlacement,
    loading: prefsLoading,
    setDefaultListId: setDefaultListIdDb,
    setNewListPlacement: setNewListPlacementDb,
    setNewItemPlacement: setNewItemPlacementDb,
  } = useSupabasePreferences();

  const loading = listsLoading || prefsLoading;

  const setDefaultListId = async (id: string | null) => {
    try {
      await setDefaultListIdDb(id);
    } catch (error) {
      console.error('Error setting default list:', error);
    }
  };

  const setNewListPlacement = async (position: PlacementPosition) => {
    try {
      await setNewListPlacementDb(position);
    } catch (error) {
      console.error('Error setting new list placement:', error);
    }
  };

  const setNewItemPlacement = async (position: PlacementPosition) => {
    try {
      await setNewItemPlacementDb(position);
    } catch (error) {
      console.error('Error setting new item placement:', error);
    }
  };

  const addList = async (name: string) => {
    try {
      // Assign a random color from the palette
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#FF6B6B";
      const order = newListPlacement === 'top' ? 0 : lists.length;

      // If adding to top, we need to reorder existing lists
      if (newListPlacement === 'top') {
        const reorderedLists = lists.map((list, index) => ({
          id: list.id,
          order: index + 1,
        }));
        await Promise.all([
          addListDb(name, randomColor, order),
          reorderListsDb(reorderedLists),
        ]);
      } else {
        await addListDb(name, randomColor, order);
      }
    } catch (error) {
      console.error('Error adding list:', error);
    }
  };

  const deleteList = async (id: string) => {
    try {
      await deleteListDb(id);
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const deleteLists = async (ids: string[]) => {
    try {
      await deleteListsDb(ids);
    } catch (error) {
      console.error('Error deleting lists:', error);
    }
  };

  const updateList = async (id: string, updates: Partial<List>) => {
    try {
      await updateListDb(id, updates);
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const reorderLists = async (newLists: List[]) => {
    try {
      const reorderedLists = newLists.map((list, index) => ({
        id: list.id,
        order: index,
      }));
      await reorderListsDb(reorderedLists);
    } catch (error) {
      console.error('Error reordering lists:', error);
    }
  };

  const addItem = async (listId: string, text: string) => {
    try {
      const list = lists.find((l) => l.id === listId);
      if (!list) return;

      const order = newItemPlacement === 'top' ? 0 : list.items.length;

      // If adding to top, we need to reorder existing items
      if (newItemPlacement === 'top' && list.items.length > 0) {
        const reorderedItems = list.items.map((item, index) => ({
          id: item.id,
          order: index + 1,
        }));
        await Promise.all([
          addItemDb(listId, text, order),
          reorderItemsDb(reorderedItems),
        ]);
      } else {
        await addItemDb(listId, text, order);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const addItems = async (listId: string, texts: string[]) => {
    try {
      const list = lists.find((l) => l.id === listId);
      if (!list) return;

      const items = texts.map((text, index) => ({
        text,
        order: newItemPlacement === 'top' ? index : list.items.length + index,
      }));

      // If adding to top, we need to reorder existing items
      if (newItemPlacement === 'top' && list.items.length > 0) {
        const reorderedItems = list.items.map((item, index) => ({
          id: item.id,
          order: index + texts.length,
        }));
        await Promise.all([
          addItemsDb(listId, items),
          reorderItemsDb(reorderedItems),
        ]);
      } else {
        await addItemsDb(listId, items);
      }
    } catch (error) {
      console.error('Error adding items:', error);
    }
  };

  const deleteItem = async (_listId: string, itemId: string) => {
    try {
      await deleteItemDb(itemId);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const deleteItems = async (_listId: string, itemIds: string[]) => {
    try {
      await deleteItemsDb(itemIds);
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  const toggleItem = async (_listId: string, itemId: string) => {
    try {
      await toggleItemDb(itemId);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const updateItem = async (_listId: string, itemId: string, updates: Partial<ListItem>) => {
    try {
      await updateItemDb(itemId, updates);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const updateItems = async (_listId: string, itemIds: string[], updates: Partial<ListItem>) => {
    try {
      const itemUpdates = itemIds.map((id) => ({ id, ...updates }));
      await updateItemsDb(itemUpdates);
    } catch (error) {
      console.error('Error updating items:', error);
    }
  };

  const reorderItems = async (_listId: string, newItems: ListItem[]) => {
    try {
      const reorderedItems = newItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));
      await reorderItemsDb(reorderedItems);
    } catch (error) {
      console.error('Error reordering items:', error);
    }
  };

  const moveItems = async (_fromListId: string, toListId: string, itemIds: string[]) => {
    try {
      await moveItemsDb(itemIds, toListId);
    } catch (error) {
      console.error('Error moving items:', error);
    }
  };

  return (
    <ListContext.Provider
      value={{
        lists,
        loading,
        defaultListId,
        setDefaultListId,
        newListPlacement,
        setNewListPlacement,
        newItemPlacement,
        setNewItemPlacement,
        addList,
        deleteList,
        deleteLists,
        updateList,
        reorderLists,
        addItem,
        addItems,
        deleteItem,
        deleteItems,
        toggleItem,
        updateItem,
        updateItems,
        reorderItems,
        moveItems,
      }}
    >
      {children}
    </ListContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLists() {
  const context = useContext(ListContext);
  if (context === undefined) {
    throw new Error('useLists must be used within a ListProvider');
  }
  return context;
}
