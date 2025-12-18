import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MigrationDialog } from '@/components/MigrationDialog';
import { hasLocalStorageData } from '@/utils/migrateLocalStorage';

/**
 * Component that handles showing the migration dialog when a user logs in
 * with existing localStorage data
 */
export function MigrationHandler() {
  const { user } = useAuth();
  const [showMigration, setShowMigration] = useState(false);
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);

  useEffect(() => {
    // When user changes, check if we need to show migration
    if (user && user.id !== checkedUserId) {
      const hasData = hasLocalStorageData();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowMigration(hasData);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckedUserId(user.id);
    } else if (!user) {
      // Reset when user logs out
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckedUserId(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowMigration(false);
    }
  }, [user, checkedUserId]);

  return (
    <MigrationDialog
      open={showMigration}
      onComplete={() => setShowMigration(false)}
    />
  );
}
