import { useState } from 'react';
import { RDOForm } from "@/components/RDOForm";
import { SavedRDOsList } from '@/components/SavedRDOsList';
import { RDOFormData } from '@/services/rdo-storage';

const Index = () => {
  // This state will hold the draft that the user wants to edit.
  const [activeDraft, setActiveDraft] = useState<RDOFormData | undefined>(undefined);

  // This state is used to trigger a refresh of the SavedRDOsList
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOpenDraft = (draft: RDOFormData) => {
    setActiveDraft(draft);
  };

  const handleSave = () => {
    // When the form saves, we increment the trigger to refresh the list
    setRefreshTrigger(prev => prev + 1);
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* The key prop is crucial here. It tells React to create a new instance of RDOForm
          when the activeDraft changes, which is how we "load" a new draft.
          If no draft is active, we use the key 'new' to render a blank form. */}
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