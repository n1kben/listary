import { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { List, ListItem } from '@/types';

interface ListContextType {
  lists: List[];
  defaultListId: string | null;
  setDefaultListId: (id: string | null) => void;
  addList: (name: string) => void;
  deleteList: (id: string) => void;
  updateList: (id: string, updates: Partial<List>) => void;
  reorderLists: (lists: List[]) => void;
  addItem: (listId: string, text: string) => void;
  addItems: (listId: string, texts: string[]) => void;
  deleteItem: (listId: string, itemId: string) => void;
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

  const addList = (name: string) => {
    // Assign a random color from the palette
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#FF6B6B";
    const newList: List = {
      id: Date.now().toString(),
      name,
      color: randomColor,
      order: lists.length,
      items: [],
    };
    setLists([...lists, newList]);
  };

  const deleteList = (id: string) => {
    setLists(lists.filter(list => list.id !== id));
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
            order: list.items.length,
          };
          return { ...list, items: [...list.items, newItem] };
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
            order: list.items.length + index,
          }));
          return { ...list, items: [...list.items, ...newItems] };
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
      const newItems: ListItem[] = itemsToMove.map(item => ({
        ...item,
        id: `${toListId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        order: toList.items.length + itemsToMove.indexOf(item),
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
          // Add items to target list
          return {
            ...list,
            items: [...list.items, ...newItems],
          };
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
        addList,
        deleteList,
        updateList,
        reorderLists,
        addItem,
        addItems,
        deleteItem,
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

export function useLists() {
  const context = useContext(ListContext);
  if (context === undefined) {
    throw new Error('useLists must be used within a ListProvider');
  }
  return context;
}
