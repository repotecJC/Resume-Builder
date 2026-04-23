import { useState, useEffect, useRef } from 'react';
import { ResumeData } from '../types';
import { DEFAULT_RESUME } from '../data/defaultResume';
import { PERSONAL_TEMPLATE_BACKUP } from '../data/personalBackup';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const APP_STORAGE_KEY = 'elegant_resume_app_data';
const OLD_STORAGE_KEY = 'elegant_resume_data';

export interface ProfileMeta {
  id: string;
  name: string;
  data: ResumeData;
}

export interface AppState {
  activeProfileId: string;
  profiles: Record<string, ProfileMeta>;
}

export function useResume() {
  const sanitizeHtml = (str: string, maxLength: number = 2000) => {
    if (typeof str !== 'string') return str;
    if (str.startsWith('data:image/')) return str; // Allow full data URLs
    let sanitized = str.replace(/<\/?(script|iframe|object|embed)[^>]*>/gi, '');
    return sanitized.substring(0, maxLength);
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') return sanitizeHtml(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = sanitizeObject(value);
      }
      return newObj;
    }
    return obj;
  };

  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState<AppState>(() => {
    // Initial local load to show something quickly before Firestore syncs
    const savedApp = localStorage.getItem(APP_STORAGE_KEY);
    if (savedApp) {
      try {
        const parsed = JSON.parse(savedApp);
        if (parsed.activeProfileId && parsed.profiles) {
          return parsed;
        }
      } catch (e) {}
    }
    return {
      activeProfileId: 'main',
      profiles: {
        'main': { id: 'main', name: 'Main profile', data: DEFAULT_RESUME }
      }
    };
  });

  const isInitialMount = useRef(true);
  // Using a ref to track if remote initialization has settled (either loaded or confirmed no auth)
  const isRemoteReady = useRef(false);

  // 1. Sync from Firestore on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'userState', 'state');
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const remoteData = snap.data();
            if (remoteData.activeProfileId && remoteData.profiles) {
              setAppState(remoteData as AppState);
              localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(remoteData));
            }
          }
        } catch (error) {
          console.error("Failed to load user state from Firestore:", error);
        }
      }
      // Regardless of logged in or logged out, the first resolution marks remote as "ready"
      // to avoid race conditions overriding remote data with empty local data on mount.
      isRemoteReady.current = true;
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync to local storage & Firestore on data change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));

    // Do NOT push local state to firestore if we haven't resolved our initial auth check yet!
    if (!isRemoteReady.current) {
      return;
    }

    const syncToFirestore = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'userState', 'state');
          // Include updatedAt to handle conflicts and future-proofing
          await setDoc(docRef, {
             ...appState,
             updatedAt: Date.now()
          });
        } catch (error) {
          console.error("Failed to save state to Firestore:", error);
        }
      }
    };

    const timeoutId = setTimeout(syncToFirestore, 1500); // 1.5s debounce
    return () => clearTimeout(timeoutId);
  }, [appState]);

  const data = appState.profiles[appState.activeProfileId]?.data || DEFAULT_RESUME;

  const updateProfileData = (updater: (prev: ResumeData) => ResumeData) => {
    setAppState(prev => {
      const activeData = prev.profiles[prev.activeProfileId].data;
      const updatedData = sanitizeObject(updater(activeData));
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [prev.activeProfileId]: {
            ...prev.profiles[prev.activeProfileId],
            data: updatedData
          }
        }
      };
    });
  };

  const setData = updateProfileData;

  const switchProfile = (id: string) => {
    if (appState.profiles[id]) {
      setAppState(prev => ({ ...prev, activeProfileId: id }));
    }
  };

  const importResumeProfile = (name: string, parsedData: any) => {
    const newId = `profile-${Date.now()}`;
    const mainData = appState.profiles['main']?.data || DEFAULT_RESUME;
    
    // Create new data starting from mainData defaults but with imported content
    const newData: ResumeData = {
        ...mainData,
        profile: {
            ...mainData.profile,
            ...(parsedData.profile || {}),
            contactItems: [] // clear contacts as they aren't parsed by AI reliably yet
        },
        blocks: {},
        blockOrder: []
    };

    if (parsedData.experience && parsedData.experience.length > 0) {
        const bId = `exp-${Date.now()}`;
        newData.blocks[bId] = {
            id: bId,
            type: 'list',
            title: 'Experience',
            items: parsedData.experience.map((i: any) => ({ ...i, id: Math.random().toString(36).substr(2, 9) }))
        };
        newData.blockOrder.push(bId);
    }
    
    if (parsedData.education && parsedData.education.length > 0) {
        const bId = `edu-${Date.now()}`;
        newData.blocks[bId] = {
            id: bId,
            type: 'list',
            title: 'Education',
            items: parsedData.education.map((i: any) => ({ ...i, id: Math.random().toString(36).substr(2, 9) }))
        };
        newData.blockOrder.push(bId);
    }
    
    if (parsedData.skills && parsedData.skills.length > 0) {
        const bId = `skills-${Date.now()}`;
        newData.blocks[bId] = {
            id: bId,
            type: 'tags',
            title: 'Skills',
            items: parsedData.skills.map((t: string) => ({ id: Math.random().toString(36).substr(2, 9), text: t }))
        };
        newData.blockOrder.push(bId);
    }

    setAppState(prev => ({
        activeProfileId: newId,
        profiles: {
            ...prev.profiles,
            [newId]: { id: newId, name, data: sanitizeObject(newData) }
        }
    }));
  };

  const createProfile = (name: string) => {
    const mainData = appState.profiles['main'].data;
    const newId = `profile-${Date.now()}`;
    const newData = JSON.parse(JSON.stringify(mainData));
    
    setAppState(prev => ({
      activeProfileId: newId,
      profiles: {
        ...prev.profiles,
        [newId]: { id: newId, name, data: newData }
      }
    }));
  };

  const renameProfile = (id: string, newName: string) => {
    setAppState(prev => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [id]: { ...prev.profiles[id], name: newName }
      }
    }));
  };

  const deleteProfile = (id: string) => {
    setAppState(prev => {
      if (Object.keys(prev.profiles).length <= 1) return prev;
      const newProfiles = { ...prev.profiles };
      delete newProfiles[id];
      const newActiveId = prev.activeProfileId === id ? Object.keys(newProfiles)[0] : prev.activeProfileId;
      return {
        activeProfileId: newActiveId,
        profiles: newProfiles
      };
    });
  };

  const toggleAnimation = () => {
    setData(prev => ({ ...prev, enableAnimation: !prev.enableAnimation }));
  };

  const updateProfile = (field: keyof ResumeData['profile'], value: any) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }));
  };

  const addContactItem = () => {
    setData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        contactItems: [
          ...(prev.profile.contactItems || []),
          { id: `c-${Date.now()}`, icon: 'Link', text: 'New Link', url: '' }
        ]
      }
    }));
  };

  const updateContactItem = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        contactItems: prev.profile.contactItems?.map(item => 
          item.id === id ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const removeContactItem = (id: string) => {
    setData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        contactItems: prev.profile.contactItems?.filter(item => item.id !== id)
      }
    }));
  };

  const updateThemeColor = (color: string) => {
    setData(prev => ({ ...prev, themeColor: color }));
  };

  const reorderBlocks = (startIndex: number, endIndex: number) => {
    setData(prev => {
      const newOrder = Array.from(prev.blockOrder);
      const [removed] = newOrder.splice(startIndex, 1);
      newOrder.splice(endIndex, 0, removed);
      return { ...prev, blockOrder: newOrder };
    });
  };

  const reorderListItems = (blockId: string, startIndex: number, endIndex: number) => {
    setData(prev => {
      const block = prev.blocks[blockId];
      if (!block || block.type !== 'list') return prev;
      const newItems = Array.from(block.items);
      const [removed] = newItems.splice(startIndex, 1);
      newItems.splice(endIndex, 0, removed);
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: { ...block, items: newItems }
        }
      };
    });
  };

  const reorderTagItems = (blockId: string, startIndex: number, endIndex: number) => {
    setData(prev => {
      const block = prev.blocks[blockId];
      if (!block || block.type !== 'tags') return prev;
      const newItems = Array.from(block.items);
      const [removed] = newItems.splice(startIndex, 1);
      newItems.splice(endIndex, 0, removed);
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: { ...block, items: newItems }
        }
      };
    });
  };

  const updateBlockTitle = (blockId: string, title: string) => {
    setData(prev => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [blockId]: { ...prev.blocks[blockId], title }
      }
    }));
  };

  const addListItem = (blockId: string) => {
    setData(prev => {
      const block = prev.blocks[blockId];
      const newItem = { id: Math.random().toString(36).substr(2, 9), title: '', subtitle: '', period: '', description: '' };
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: { ...block, items: [...block.items, newItem] }
        }
      };
    });
  };

  const updateListItem = (blockId: string, itemId: string, field: string, value: string) => {
    setData(prev => {
      const block = prev.blocks[blockId];
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: {
            ...block,
            items: block.items.map((item: any) => item.id === itemId ? { ...item, [field]: value } : item)
          }
        }
      };
    });
  };

  const removeListItem = (blockId: string, itemId: string) => {
    setData(prev => {
      const block = prev.blocks[blockId];
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: {
            ...block,
            items: block.items.filter((item: any) => item.id !== itemId)
          }
        }
      };
    });
  };

  const addTagItem = (blockId: string, text: string) => {
    if (!text.trim()) return;
    setData(prev => {
      const block = prev.blocks[blockId];
      const newItem = { id: Math.random().toString(36).substr(2, 9), text: text.trim() };
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: { ...block, items: [...block.items, newItem] }
        }
      };
    });
  };

  const removeTagItem = (blockId: string, itemId: string) => {
    setData(prev => {
      const block = prev.blocks[blockId];
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: {
            ...block,
            items: block.items.filter((item: any) => item.id !== itemId)
          }
        }
      };
    });
  };

  const updateTagItem = (blockId: string, itemId: string, text: string) => {
    setData(prev => {
      const block = prev.blocks[blockId];
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [blockId]: {
            ...block,
            items: block.items.map((item: any) => item.id === itemId ? { ...item, text } : item)
          }
        }
      };
    });
  };

  const addBlock = (type: 'list' | 'tags') => {
    const id = `block-${Date.now()}`;
    setData(prev => ({
      ...prev,
      blocks: {
        ...prev.blocks,
        [id]: {
          id,
          type,
          title: type === 'list' ? 'New Section' : 'Skills',
          items: []
        }
      },
      blockOrder: [...prev.blockOrder, id]
    }));
    return id;
  };

  const removeBlock = (blockId: string) => {
    setData(prev => {
      const newBlocks = { ...prev.blocks };
      delete newBlocks[blockId];
      return {
        ...prev,
        blocks: newBlocks,
        blockOrder: prev.blockOrder.filter(id => id !== blockId)
      };
    });
  };

  const resetToDefault = () => {
    localStorage.removeItem(APP_STORAGE_KEY);
    localStorage.removeItem(OLD_STORAGE_KEY);
    setAppState({
      activeProfileId: 'main',
      profiles: {
        'main': { id: 'main', name: 'Main profile', data: DEFAULT_RESUME }
      }
    });
  };

  const loadPersonalBackup = () => {
    const backupId = `backup-${Date.now()}`;
    setAppState(prev => ({
      ...prev,
      activeProfileId: backupId,
      profiles: {
        ...prev.profiles,
        [backupId]: { id: backupId, name: 'Personal Backup', data: PERSONAL_TEMPLATE_BACKUP }
      }
    }));
  };

  return {
    loading,
    appState,
    switchProfile,
    createProfile,
    importResumeProfile,
    renameProfile,
    deleteProfile,
    data,
    updateProfile,
    updateThemeColor,
    toggleAnimation,
    reorderBlocks,
    reorderListItems,
    reorderTagItems,
    updateBlockTitle,
    addListItem,
    updateListItem,
    removeListItem,
    addTagItem,
    removeTagItem,
    updateTagItem,
    addBlock,
    removeBlock,
    addContactItem,
    updateContactItem,
    removeContactItem,
    updateProfileData,
    resetToDefault,
    loadPersonalBackup
  };
}
