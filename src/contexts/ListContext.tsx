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
  deleteItem: (listId: string, itemId: string) => void;
  toggleItem: (listId: string, itemId: string) => void;
  updateItem: (listId: string, itemId: string, updates: Partial<ListItem>) => void;
  reorderItems: (listId: string, items: ListItem[]) => void;
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
    setLists(
      lists.map(list => {
        if (list.id === listId) {
          const newItem: ListItem = {
            id: `${listId}-${Date.now()}`,
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
    setLists(
      lists.map(list => {
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
        deleteItem,
        toggleItem,
        updateItem,
        reorderItems,
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
