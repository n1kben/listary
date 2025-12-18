import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { List } from '@/types';

export function useSupabaseLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch lists and their items
  const fetchLists = useCallback(async () => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch lists
      const { data: listsData, error: listsError } = await supabase
        .from('lists')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true });

      if (listsError) throw listsError;

      if (!listsData || listsData.length === 0) {
        setLists([]);
        setLoading(false);
        return;
      }

      // Fetch all items for these lists
      const listIds = listsData.map((list) => list.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('list_items')
        .select('*')
        .in('list_id', listIds)
        .order('order', { ascending: true });

      if (itemsError) throw itemsError;

      // Combine lists with their items
      const listsWithItems: List[] = listsData.map((list) => ({
        id: list.id,
        name: list.name,
        color: list.color,
        order: list.order,
        items: (itemsData || [])
          .filter((item) => item.list_id === list.id)
          .map((item) => ({
            id: item.id,
            text: item.text,
            completed: item.completed,
            order: item.order,
          })),
      }));

      setLists(listsWithItems);
    } catch (err) {
      console.error('Error fetching lists:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLists();

    // Subscribe to real-time changes
    const listsChannel = supabase
      .channel('lists-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lists',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchLists();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_items',
        },
        () => {
          fetchLists();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(listsChannel);
    };
  }, [user?.id, fetchLists]);

  // Add a new list
  const addList = async (name: string, color: string, order: number) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('lists')
      .insert([{ user_id: user.id, name, color, order }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Update a list
  const updateList = async (id: string, updates: Partial<{ name: string; color: string; order: number }>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  // Delete a list
  const deleteList = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  // Delete multiple lists
  const deleteLists = async (ids: string[]) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('lists')
      .delete()
      .in('id', ids)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  // Reorder lists
  const reorderLists = async (reorderedLists: { id: string; order: number }[]) => {
    if (!user) throw new Error('User not authenticated');

    const updates = reorderedLists.map((list) =>
      supabase
        .from('lists')
        .update({ order: list.order })
        .eq('id', list.id)
        .eq('user_id', user.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error).map((r) => r.error);
    if (errors.length > 0) throw errors[0];
  };

  // Add an item to a list
  const addItem = async (listId: string, text: string, order: number) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('list_items')
      .insert([{ list_id: listId, text, order, completed: false }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Add multiple items to a list
  const addItems = async (listId: string, items: { text: string; order: number }[]) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('list_items')
      .insert(items.map((item) => ({ list_id: listId, text: item.text, order: item.order, completed: false })))
      .select();

    if (error) throw error;
    return data;
  };

  // Update an item
  const updateItem = async (id: string, updates: Partial<{ text: string; completed: boolean; order: number }>) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('list_items')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  };

  // Update multiple items
  const updateItems = async (updates: { id: string; completed?: boolean; order?: number }[]) => {
    if (!user) throw new Error('User not authenticated');

    const promises = updates.map((update) =>
      supabase
        .from('list_items')
        .update(update)
        .eq('id', update.id)
    );

    const results = await Promise.all(promises);
    const errors = results.filter((r) => r.error).map((r) => r.error);
    if (errors.length > 0) throw errors[0];
  };

  // Toggle an item's completed status
  const toggleItem = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    // First get the current item
    const { data: currentItem, error: fetchError } = await supabase
      .from('list_items')
      .select('completed')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Then update it
    const { error } = await supabase
      .from('list_items')
      .update({ completed: !currentItem.completed })
      .eq('id', id);

    if (error) throw error;
  };

  // Delete an item
  const deleteItem = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  // Delete multiple items
  const deleteItems = async (ids: string[]) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('list_items')
      .delete()
      .in('id', ids);

    if (error) throw error;
  };

  // Reorder items
  const reorderItems = async (reorderedItems: { id: string; order: number }[]) => {
    if (!user) throw new Error('User not authenticated');

    const updates = reorderedItems.map((item) =>
      supabase
        .from('list_items')
        .update({ order: item.order })
        .eq('id', item.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error).map((r) => r.error);
    if (errors.length > 0) throw errors[0];
  };

  // Move items to another list
  const moveItems = async (itemIds: string[], targetListId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('list_items')
      .update({ list_id: targetListId })
      .in('id', itemIds);

    if (error) throw error;
  };

  return {
    lists,
    loading,
    error,
    addList,
    updateList,
    deleteList,
    deleteLists,
    reorderLists,
    addItem,
    addItems,
    updateItem,
    updateItems,
    toggleItem,
    deleteItem,
    deleteItems,
    reorderItems,
    moveItems,
    refetch: fetchLists,
  };
}
