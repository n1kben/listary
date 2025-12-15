import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { List, ListItem, PlacementPosition } from '@/types';

interface ListContextType {
  lists: List[];
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

const INITIAL_LISTS: List[] = [
  {
    id: '1',
    name: 'Shopping',
    color: '#FF6B6B',
    order: 0,
    items: [
      { id: '1-1', text: 'Milk', completed: false, order: 0 },
      { id: '1-2', text: 'Bread', completed: true, order: 1 },
      { id: '1-3', text: 'Eggs', completed: false, order: 2 },
    ],
  },
  {
    id: '2',
    name: 'Work Tasks',
    color: '#4ECDC4',
    order: 1,
    items: [
      { id: '2-1', text: 'Review PR', completed: false, order: 0 },
      { id: '2-2', text: 'Team meeting', completed: true, order: 1 },
    ],
  },
  {
    id: '3',
    name: 'Personal',
    color: '#95E1D3',
    order: 2,
    items: [
      { id: '3-1', text: 'Call mom', completed: false, order: 0 },
    ],
  },
];

export function ListProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useLocalStorage<List[]>('listary-lists', INITIAL_LISTS);
  const [defaultListId, setDefaultListId] = useLocalStorage<string | null>('listary-default-list', null);
  const [newListPlacement, setNewListPlacement] = useLocalStorage<PlacementPosition>('listary-new-list-placement', 'bottom');
  const [newItemPlacement, setNewItemPlacement] = useLocalStorage<PlacementPosition>('listary-new-item-placement', 'bottom');

  const addList = (name: string) => {
    // Assign a random color from the palette
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#FF6B6B";
    const newList: List = {
      id: Date.now().toString(),
      name,
      color: randomColor,
      order: newListPlacement === 'top' ? 0 : lists.length,
      items: [],
    };

    if (newListPlacement === 'top') {
      // Add to top and reorder existing lists
      const updatedLists = lists.map(list => ({ ...list, order: list.order + 1 }));
      setLists([newList, ...updatedLists]);
    } else {
      // Add to bottom (default behavior)
      setLists([...lists, newList]);
    }
  };

  const deleteList = (id: string) => {
    setLists(lists.filter(list => list.id !== id));
  };

  const deleteLists = (ids: string[]) => {
    setLists(prevLists => prevLists.filter(list => !ids.includes(list.id)));
  };

  const updateList = (id: string, updates: Partial<List>) => {
    setLists(lists.map(list => (list.id === id ? { ...list, ...updates } : list)));
  };

  const reorderLists = (newLists: List[]) => {
    setLists(newLists.map((list, index) => ({ ...list, order: index })));
  };

  const addItem = (listId: string, text: string) => {
    setLists(prevLists =>
      prevLists.map(list => {
        if (list.id === listId) {
          // Use timestamp + random string to ensure unique IDs
          const uniqueId = `${listId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          const newItem: ListItem = {
            id: uniqueId,
            text,
            completed: false,
            order: newItemPlacement === 'top' ? 0 : list.items.length,
          };

          if (newItemPlacement === 'top') {
            // Add to top and reorder existing items
            const updatedItems = list.items.map(item => ({ ...item, order: item.order + 1 }));
            return { ...list, items: [newItem, ...updatedItems] };
          } else {
            // Add to bottom (default behavior)
            return { ...list, items: [...list.items, newItem] };
          }
        }
        return list;
      })
    );
  };

  const addItems = (listId: string, texts: string[]) => {
    setLists(prevLists =>
      prevLists.map(list => {
        if (list.id === listId) {
          const newItems: ListItem[] = texts.map((text, index) => ({
            id: `${listId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            text,
            completed: false,
            order: newItemPlacement === 'top' ? index : list.items.length + index,
          }));

          if (newItemPlacement === 'top') {
            // Add to top and reorder existing items
            const updatedItems = list.items.map(item => ({
              ...item,
              order: item.order + newItems.length
            }));
            return { ...list, items: [...newItems, ...updatedItems] };
          } else {
            // Add to bottom (default behavior)
            return { ...list, items: [...list.items, ...newItems] };
          }
        }
        return list;
      })
    );
  };

  const deleteItem = (listId: string, itemId: string) => {
    setLists(
      lists.map(list => {
        if (list.id === listId) {
          return { ...list, items: list.items.filter(item => item.id !== itemId) };
        }
        return list;
      })
    );
  };

  const deleteItems = (listId: string, itemIds: string[]) => {
    setLists(prevLists =>
      prevLists.map(list => {
        if (list.id === listId) {
          return { ...list, items: list.items.filter(item => !itemIds.includes(item.id)) };
        }
        return list;
      })
    );
  };

  const toggleItem = (listId: string, itemId: string) => {
    setLists(
      lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.map(item =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
          };
        }
        return list;
      })
    );
  };

  const updateItem = (listId: string, itemId: string, updates: Partial<ListItem>) => {
    setLists(prevLists =>
      prevLists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          };
        }
        return list;
      })
    );
  };

  const updateItems = (listId: string, itemIds: string[], updates: Partial<ListItem>) => {
    setLists(prevLists =>
      prevLists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.map(item =>
              itemIds.includes(item.id) ? { ...item, ...updates } : item
            ),
          };
        }
        return list;
      })
    );
  };

  const reorderItems = (listId: string, newItems: ListItem[]) => {
    setLists(
      lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            items: newItems.map((item, index) => ({ ...item, order: index })),
          };
        }
        return list;
      })
    );
  };

  const moveItems = (fromListId: string, toListId: string, itemIds: string[]) => {
    setLists(prevLists => {
      const fromList = prevLists.find(list => list.id === fromListId);
      const toList = prevLists.find(list => list.id === toListId);

      if (!fromList || !toList) return prevLists;

      // Get the items to move
      const itemsToMove = fromList.items.filter(item => itemIds.includes(item.id));

      // Create new items with new IDs for the target list
      const newItems: ListItem[] = itemsToMove.map((item, index) => ({
        ...item,
        id: `${toListId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        order: newItemPlacement === 'top' ? index : toList.items.length + index,
      }));

      return prevLists.map(list => {
        if (list.id === fromListId) {
          // Remove items from source list
          return {
            ...list,
            items: list.items.filter(item => !itemIds.includes(item.id)),
          };
        }
        if (list.id === toListId) {
          if (newItemPlacement === 'top') {
            // Add to top and reorder existing items
            const updatedItems = list.items.map(item => ({
              ...item,
              order: item.order + newItems.length
            }));
            return {
              ...list,
              items: [...newItems, ...updatedItems],
            };
          } else {
            // Add to bottom (default behavior)
            return {
              ...list,
              items: [...list.items, ...newItems],
            };
          }
        }
        return list;
      });
    });
  };

  return (
    <ListContext.Provider
      value={{
        lists,
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
