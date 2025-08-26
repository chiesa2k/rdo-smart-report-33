import { get, set } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

// We need to get the RDOFormData interface.
// For now, I will define a simplified version here.
// I might move the interface to a shared types file later if needed.
export interface RDOFormData {
  id: string; // Unique ID for each RDO
  userId: string;
  reportNumber: string;
  date: string;
  serviceOrderNumber: string;
  attendanceTime: string;
  customer: string;
  vessel: string;
  location: string;
  requestor: string;
  purpose: string;
  equipment: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  teamMembers: { register: string; worker: string; position: string; signature: string }[];
  serviceReport: string;
  photos: File[];
  finalLocation: string;
  finalDate: string;
  technicianSignature: string;
  serviceCompleted: boolean;
  // Timestamps for tracking
  createdAt: number;
  updatedAt: number;
}


const getStorageKey = (userId: string) => `rdo-drafts-${userId}`;

/**
 * Retrieves all RDO drafts for a given user.
 */
export const getRdoDrafts = async (userId: string): Promise<RDOFormData[]> => {
  return (await get(getStorageKey(userId))) || [];
};

/**
 * Saves or updates an RDO draft.
 * If the draft has an ID, it updates the existing one.
 * If it doesn't have an ID, it creates a new one.
 */
export const saveRdoDraft = async (userId: string, draftData: Omit<RDOFormData, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'photos'> & { id?: string, photos: File[] }): Promise<RDOFormData> => {
  const drafts = await getRdoDrafts(userId);
  const now = Date.now();

  let draftToSave: RDOFormData;

  if (draftData.id && drafts.some(d => d.id === draftData.id)) {
    // Update existing draft
    draftToSave = drafts.find(d => d.id === draftData.id)!;
    Object.assign(draftToSave, draftData, { updatedAt: now });
  } else {
    // Create new draft
    draftToSave = {
      ...draftData,
      id: uuidv4(),
      userId,
      createdAt: now,
      updatedAt: now,
    };
    drafts.push(draftToSave);
  }

  await set(getStorageKey(userId), drafts);
  return draftToSave;
};

/**
 * Deletes an RDO draft.
 */
export const deleteRdoDraft = async (userId: string, draftId: string): Promise<void> => {
  let drafts = await getRdoDrafts(userId);
  drafts = drafts.filter(d => d.id !== draftId);
  await set(getStorageKey(userId), drafts);
};

/**

 * Gets a single RDO draft by its ID.
 */
export const getRdoDraftById = async (userId: string, draftId: string): Promise<RDOFormData | undefined> => {
    const drafts = await getRdoDrafts(userId);
    return drafts.find(d => d.id === draftId);
}

/**
 * (For Admin Simulation)
 * Retrieves all RDO drafts from all users.
 * NOTE: This is for demonstration purposes and would be a secured API call in a real app.
 */
import { keys } from 'idb-keyval';

export const getAllRdoDrafts = async (): Promise<RDOFormData[]> => {
  const allKeys = await keys();
  const rdoKeys = allKeys.filter(key => typeof key === 'string' && key.startsWith('rdo-drafts-'));

  let allDrafts: RDOFormData[] = [];
  for (const key of rdoKeys) {
    const userDrafts = await get<RDOFormData[]>(key);
    if (userDrafts) {
      allDrafts = allDrafts.concat(userDrafts);
    }
  }
  return allDrafts;
};
