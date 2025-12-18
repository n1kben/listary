import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { PlacementPosition } from '@/types';

export type Theme = 'light' | 'dark' | 'system';

interface UserPreferences {
  defaultListId: string | null;
  theme: Theme;
  newListPlacement: PlacementPosition;
  newItemPlacement: PlacementPosition;
}

export function useSupabasePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultListId: null,
    theme: 'system',
    newListPlacement: 'bottom',
    newItemPlacement: 'bottom',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences({
        defaultListId: null,
        theme: 'system',
        newListPlacement: 'bottom',
        newItemPlacement: 'bottom',
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw fetchError;
      }

      if (data) {
        setPreferences({
          defaultListId: data.default_list_id,
          theme: data.theme as Theme,
          newListPlacement: data.new_list_placement as PlacementPosition,
          newItemPlacement: data.new_item_placement as PlacementPosition,
        });
      } else {
        // Create default preferences if they don't exist
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert([
            {
              user_id: user.id,
              default_list_id: null,
              theme: 'system',
              new_list_placement: 'bottom',
              new_item_placement: 'bottom',
            },
          ]);

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('preferences-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchPreferences();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchPreferences]);

  // Update preferences
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) throw new Error('User not authenticated');

    const dbUpdates: {
      default_list_id?: string | null;
      theme?: string;
      new_list_placement?: string;
      new_item_placement?: string;
    } = {};
    if (updates.defaultListId !== undefined) dbUpdates['default_list_id'] = updates.defaultListId;
    if (updates.theme !== undefined) dbUpdates['theme'] = updates.theme;
    if (updates.newListPlacement !== undefined) dbUpdates['new_list_placement'] = updates.newListPlacement;
    if (updates.newItemPlacement !== undefined) dbUpdates['new_item_placement'] = updates.newItemPlacement;

    const { error: updateError } = await supabase
      .from('user_preferences')
      .update(dbUpdates)
      .eq('user_id', user.id);

    if (updateError) throw updateError;
  };

  const setDefaultListId = async (listId: string | null) => {
    await updatePreferences({ defaultListId: listId });
  };

  const setTheme = async (theme: Theme) => {
    await updatePreferences({ theme });
  };

  const setNewListPlacement = async (placement: PlacementPosition) => {
    await updatePreferences({ newListPlacement: placement });
  };

  const setNewItemPlacement = async (placement: PlacementPosition) => {
    await updatePreferences({ newItemPlacement: placement });
  };

  return {
    ...preferences,
    loading,
    error,
    setDefaultListId,
    setTheme,
    setNewListPlacement,
    setNewItemPlacement,
    refetch: fetchPreferences,
  };
}
