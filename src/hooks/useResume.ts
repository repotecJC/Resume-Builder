import { useState, useEffect } from 'react';
import { ResumeData } from '../types';
import { DEFAULT_RESUME } from '../data/defaultResume';

const STORAGE_KEY = 'elegant_resume_data';

export function useResume() {
  const [data, setData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: add contactItems if missing
        if (!parsed.profile.contactItems) {
          parsed.profile.contactItems = [
            { id: "c1", icon: "MapPin", text: parsed.profile.location || "", url: "" },
            { id: "c2", icon: "Mail", text: parsed.profile.email || "", url: parsed.profile.email ? `mailto:${parsed.profile.email}` : "" }
          ];
        }
        // Migration: add enableAnimation if missing
        if (parsed.enableAnimation === undefined) {
          parsed.enableAnimation = true;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse resume data', e);
      }
    }
    return DEFAULT_RESUME;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

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
    removeContactItem
  };
}
