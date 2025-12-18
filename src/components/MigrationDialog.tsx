import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalStorageData, clearLocalStorageData } from '@/utils/migrateLocalStorage';
import { migrateDataToSupabase } from '@/services/migrationService';

interface MigrationDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function MigrationDialog({ open, onComplete }: MigrationDialogProps) {
  const { user } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localData = getLocalStorageData();
  const listCount = localData?.lists.length || 0;
  const itemCount = localData?.lists.reduce((sum, list) => sum + list.items.length, 0) || 0;

  const handleMigrate = async () => {
    if (!user || !localData) return;

    setMigrating(true);
    setError(null);

    const result = await migrateDataToSupabase(user.id, localData);

    if (result.success) {
      clearLocalStorageData();
      setMigrating(false);
      onComplete();
    } else {
      setError(result.error || 'Migration failed');
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    // User chose not to migrate - clear localStorage anyway to avoid confusion
    clearLocalStorageData();
    onComplete();
  };

  if (!localData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => !migrating && onComplete()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome! Migrate Your Data?</DialogTitle>
          <DialogDescription className="pt-3 space-y-2">
            <p>We found existing data on this device:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <strong>{listCount}</strong> {listCount === 1 ? 'list' : 'lists'}
              </li>
              <li>
                <strong>{itemCount}</strong> {itemCount === 1 ? 'item' : 'items'}
              </li>
            </ul>
            <p className="pt-2">
              Would you like to migrate this data to your new account? This will sync it across all
              your devices.
            </p>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={migrating}
            className="sm:flex-1"
          >
            Skip Migration
          </Button>
          <Button onClick={handleMigrate} disabled={migrating} className="sm:flex-1">
            {migrating ? 'Migrating...' : 'Migrate Data'}
          </Button>
        </DialogFooter>

        {migrating && (
          <p className="text-xs text-muted-foreground text-center">
            Please wait, this may take a few moments...
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
