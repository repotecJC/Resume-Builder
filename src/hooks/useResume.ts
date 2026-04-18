import { useState, useEffect } from 'react';
import { ResumeData } from '../types';
import { DEFAULT_RESUME } from '../data/defaultResume';

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
  const [appState, setAppState] = useState<AppState>(() => {
    const savedApp = localStorage.getItem(APP_STORAGE_KEY);
    if (savedApp) {
      try {
        const parsed = JSON.parse(savedApp);
        if (parsed.activeProfileId && parsed.profiles) {
          // Migration check for missing contactItems or enableAnimation
          Object.keys(parsed.profiles).forEach(key => {
            const profileData = parsed.profiles[key].data;
            if (!profileData.profile.contactItems) {
              profileData.profile.contactItems = [
                { id: "c1", icon: "MapPin", text: profileData.profile.location || "", url: "" },
                { id: "c2", icon: "Mail", text: profileData.profile.email || "", url: profileData.profile.email ? `mailto:${profileData.profile.email}` : "" }
              ];
            }
            if (profileData.enableAnimation === undefined) {
              profileData.enableAnimation = true;
            }
          });
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse app data', e);
      }
    }

    // Fallback to old storage migration or default
    const savedOld = localStorage.getItem(OLD_STORAGE_KEY);
    let initialData = DEFAULT_RESUME;
    if (savedOld) {
      try {
        const parsedOld = JSON.parse(savedOld);
        if (!parsedOld.profile.contactItems) {
          parsedOld.profile.contactItems = [
            { id: "c1", icon: "MapPin", text: parsedOld.profile.location || "", url: "" },
            { id: "c2", icon: "Mail", text: parsedOld.profile.email || "", url: parsedOld.profile.email ? `mailto:${parsedOld.profile.email}` : "" }
          ];
        }
        if (parsedOld.enableAnimation === undefined) parsedOld.enableAnimation = true;
        initialData = parsedOld;
      } catch (e) {}
    }
    
    return {
      activeProfileId: 'main',
      profiles: {
        'main': { id: 'main', name: 'Main profile', data: initialData }
      }
    };
  });

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  const data = appState.profiles[appState.activeProfileId]?.data || DEFAULT_RESUME;

  const updateProfileData = (updater: (prev: ResumeData) => ResumeData) => {
    setAppState(prev => {
      const activeData = prev.profiles[prev.activeProfileId].data;
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [prev.activeProfileId]: {
            ...prev.profiles[prev.activeProfileId],
            data: updater(activeData)
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

  const createProfile = (name: string) => {
    const mainData = appState.profiles['main'].data;
    const newId = `profile-${Date.now()}`;
    // Deep clone main data
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
    if (id === 'main') return; // Cannot delete main
    setAppState(prev => {
      const newProfiles = { ...prev.profiles };
      delete newProfiles[id];
      const newActiveId = prev.activeProfileId === id ? 'main' : prev.activeProfileId;
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
    const newId = `block-${Date.now()}`;
    setData(prev => {
      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [newId]: {
            id: newId,
            type,
            title: type === 'list' ? 'New Section' : 'New Tags',
            items: []
          }
        },
        blockOrder: [...prev.blockOrder, newId]
      };
    });
    return newId;
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

  return {
    appState,
    switchProfile,
    createProfile,
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
    updateProfileData
  };
}
