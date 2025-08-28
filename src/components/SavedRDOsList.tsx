import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { RDOFormData, getRdoDrafts, deleteRdoDraft } from '@/services/rdo-storage';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trash2, Edit, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { generatePdfBlob } from '@/services/pdf-generator.tsx';
import { uploadRdo } from '@/services/upload';

interface SavedRDOsListProps {
  onOpenDraft: (draft: RDOFormData) => void;
  refreshTrigger: number;
}

export const SavedRDOsList = ({ onOpenDraft, refreshTrigger }: SavedRDOsListProps) => {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [drafts, setDrafts] = useState<RDOFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDrafts = async () => {
      setIsLoading(true);
      try {
        const userDrafts = await getRdoDrafts(user.id);
        userDrafts.sort((a, b) => b.updatedAt - a.updatedAt);
        setDrafts(userDrafts);
      } catch (error) {
        toast.error("Failed to load drafts.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrafts();
  }, [user, refreshTrigger]);

  const handleDelete = async (draftId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      await deleteRdoDraft(user.id, draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      toast.success("Draft deleted.");
    } catch (error) {
      toast.error("Failed to delete draft.");
    }
  };

  const handleUpload = async (draft: RDOFormData) => {
    if (!isOnline) {
      toast.error("You must be online to upload drafts.");
      return;
    }

    setIsUploading(draft.id);
    toast.info(`Uploading draft ${draft.reportNumber}...`);

    try {
      const pdfBlob = await generatePdfBlob(draft);
      const response = await uploadRdo(draft, pdfBlob);

      if (response.success) {
        toast.success(response.message);
        if (user) {
          await deleteRdoDraft(user.id, draft.id);
          setDrafts(prev => prev.filter(d => d.id !== draft.id));
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(null);
    }
  };

  if (isLoading) {
    return <p>Loading drafts...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Drafts</CardTitle>
      </CardHeader>
      <CardContent>
        {drafts.length === 0 ? (
          <p className="text-muted-foreground">No saved drafts found.</p>
        ) : (
          <ul className="space-y-4">
            {drafts.map((draft) => (
              <li key={draft.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{draft.reportNumber || 'Untitled Draft'}</p>
                  <p className="text-sm text-muted-foreground">
                    Customer: {draft.customer || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last saved: {new Date(draft.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => onOpenDraft(draft)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpload(draft)}
                    disabled={isUploading === draft.id || !isOnline}
                  >
                    {isUploading === draft.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-primary border-transparent" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(draft.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
