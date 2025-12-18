import { supabase } from '@/lib/supabase';
import type { LocalStorageData } from '@/utils/migrateLocalStorage';

/**
 * Migrate localStorage data to Supabase for a newly authenticated user
 */
export async function migrateDataToSupabase(
  userId: string,
  localData: LocalStorageData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Starting migration for user:', userId);
    console.log('Migrating', localData.lists.length, 'lists');

    // Step 1: Migrate lists
    const listIdMapping = new Map<string, string>(); // old ID -> new ID

    for (const list of localData.lists) {
      const { data: newList, error: listError } = await supabase
        .from('lists')
        .insert([
          {
            user_id: userId,
            name: list.name,
            color: list.color,
            order: list.order,
          },
        ])
        .select()
        .single();

      if (listError) {
        console.error('Error migrating list:', listError);
        throw new Error(`Failed to migrate list "${list.name}": ${listError.message}`);
      }

      if (newList) {
        listIdMapping.set(list.id, newList.id);

        // Step 2: Migrate items for this list
        if (list.items && list.items.length > 0) {
          const itemsToInsert = list.items.map((item) => ({
            list_id: newList.id,
            text: item.text,
            completed: item.completed,
            order: item.order,
          }));

          const { error: itemsError } = await supabase
            .from('list_items')
            .insert(itemsToInsert);

          if (itemsError) {
            console.error('Error migrating items:', itemsError);
            throw new Error(`Failed to migrate items for list "${list.name}": ${itemsError.message}`);
          }
        }
      }
    }

    // Step 3: Migrate user preferences
    let migratedDefaultListId = localData.defaultListId;

    // Map the old default list ID to the new one
    if (migratedDefaultListId && listIdMapping.has(migratedDefaultListId)) {
      migratedDefaultListId = listIdMapping.get(migratedDefaultListId) || null;
    } else {
      migratedDefaultListId = null; // Old default list doesn't exist anymore
    }

    const { error: prefsError } = await supabase
      .from('user_preferences')
      .insert([
        {
          user_id: userId,
          default_list_id: migratedDefaultListId,
          theme: localData.theme,
          new_list_placement: localData.newListPlacement,
          new_item_placement: localData.newItemPlacement,
        },
      ]);

    if (prefsError) {
      console.error('Error migrating preferences:', prefsError);
      // Don't fail the migration if preferences fail - they'll just use defaults
    }

    console.log('Migration completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
