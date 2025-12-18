import type { List, PlacementPosition } from '@/types';
import type { Theme } from '@/hooks/useSupabasePreferences';

export interface LocalStorageData {
  lists: List[];
  defaultListId: string | null;
  theme: Theme;
  newListPlacement: PlacementPosition;
  newItemPlacement: PlacementPosition;
}

/**
 * Check if there's any localStorage data to migrate
 */
export function hasLocalStorageData(): boolean {
  try {
    const lists = localStorage.getItem('listary-lists');
    return lists !== null && lists !== '[]';
  } catch (error) {
    console.error('Error checking localStorage:', error);
    return false;
  }
}

/**
 * Get all localStorage data for migration
 */
export function getLocalStorageData(): LocalStorageData | null {
  try {
    const listsStr = localStorage.getItem('listary-lists');
    const defaultListId = localStorage.getItem('listary-default-list');
    const theme = localStorage.getItem('listary-theme');
    const newListPlacement = localStorage.getItem('listary-new-list-placement');
    const newItemPlacement = localStorage.getItem('listary-new-item-placement');

    if (!listsStr) {
      return null;
    }

    const lists = JSON.parse(listsStr) as List[];

    if (lists.length === 0) {
      return null;
    }

    return {
      lists,
      defaultListId: defaultListId ? JSON.parse(defaultListId) : null,
      theme: (theme as Theme) || 'system',
      newListPlacement: (newListPlacement as PlacementPosition) || 'bottom',
      newItemPlacement: (newItemPlacement as PlacementPosition) || 'bottom',
    };
  } catch (error) {
    console.error('Error reading localStorage data:', error);
    return null;
  }
}

/**
 * Clear all localStorage data after successful migration
 */
export function clearLocalStorageData(): void {
  try {
    localStorage.removeItem('listary-lists');
    localStorage.removeItem('listary-default-list');
    localStorage.removeItem('listary-theme');
    localStorage.removeItem('listary-new-list-placement');
    localStorage.removeItem('listary-new-item-placement');
    console.log('LocalStorage data cleared after migration');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
