import { get, set, del, keys } from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

export interface RDOFormData {
  id: string;
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
  createdAt: number;
  updatedAt: number;
}

const getStorageKey = (userId: string) => `rdo-drafts-${userId}`;

export const getRdoDrafts = async (userId: string): Promise<RDOFormData[]> => {
  return (await get(getStorageKey(userId))) || [];
};

export const saveRdoDraft = async (userId: string, draftData: Partial<Omit<RDOFormData, 'userId' | 'createdAt' | 'updatedAt'>>): Promise<RDOFormData> => {
  const drafts = await getRdoDrafts(userId);
  const now = Date.now();

  const existingIndex = draftData.id ? drafts.findIndex(d => d.id === draftData.id) : -1;

  if (existingIndex !== -1) {
    // Update existing draft
    const updatedDraft = { ...drafts[existingIndex], ...draftData, updatedAt: now };
    drafts[existingIndex] = updatedDraft;
    await set(getStorageKey(userId), drafts);
    return updatedDraft;
  } else {
    // Create new draft
    const newDraft: RDOFormData = {
      reportNumber: '', date: '', serviceOrderNumber: '', attendanceTime: '', customer: '',
      vessel: '', location: '', requestor: '', purpose: '', equipment: '', manufacturer: '',
      model: '', serialNumber: '', teamMembers: [], serviceReport: '', photos: [],
      finalLocation: '', finalDate: '', technicianSignature: '', serviceCompleted: false,
      ...draftData,
      id: uuidv4(),
      userId,
      createdAt: now,
      updatedAt: now,
    };
    drafts.push(newDraft);
    await set(getStorageKey(userId), drafts);
    return newDraft;
  }
};

export const deleteRdoDraft = async (userId: string, draftId: string): Promise<void> => {
  let drafts = await getRdoDrafts(userId);
  drafts = drafts.filter(d => d.id !== draftId);
  await set(getStorageKey(userId), drafts);
};

export const getRdoDraftById = async (userId: string, draftId: string): Promise<RDOFormData | undefined> => {
    const drafts = await getRdoDrafts(userId);
    return drafts.find(d => d.id === draftId);
}

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
