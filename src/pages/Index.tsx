import { useState } from 'react';
import { RDOForm } from "@/components/RDOForm";
import { SavedRDOsList } from '@/components/SavedRDOsList';
import { RDOFormData } from '@/services/rdo-storage';

const Index = () => {
  const [activeDraft, setActiveDraft] = useState<RDOFormData | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenDraft = (draft: RDOFormData) => {
    setActiveDraft(draft);
  };

  const handleSave = () => {
    setRefreshTrigger(prev => prev + 1);
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <RDOForm
        key={activeDraft ? activeDraft.id : 'new'}
        initialData={activeDraft}
        onSave={handleSave}
      />
      <SavedRDOsList
        onOpenDraft={handleOpenDraft}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
};

export default Index;
