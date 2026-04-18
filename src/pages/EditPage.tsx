import { useState, KeyboardEvent, CSSProperties, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import * as LucideIcons from 'lucide-react';
import { useResume } from '../hooks/useResume';
import { ListItem, TagItem } from '../types';
import { Link } from 'react-router-dom';

const ICONS: Record<string, any> = {
  info: LucideIcons.User,
  experience: LucideIcons.Briefcase,
  education: LucideIcons.GraduationCap,
  skills: LucideIcons.Code,
  languages: LucideIcons.Globe
};

const THEME_COLORS = [
  '#e5e5e5', // Default White
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
];

const AVAILABLE_ICONS = ['MapPin', 'Mail', 'Phone', 'Link', 'Github', 'Linkedin', 'Twitter', 'Globe'];

export default function EditPage() {
  const { 
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
  } = useResume();

  const [activeTab, setActiveTab] = useState('info');
  const [direction, setDirection] = useState(0);
  const [newTags, setNewTags] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const allTabs = ['info', ...data.blockOrder];

  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeElement = tabsContainerRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (!allTabs.includes(activeTab)) {
      setActiveTab('info');
    }
  }, [data.blockOrder, activeTab]);

  const handleTabClick = (tabId: string) => {
    const currentIndex = allTabs.indexOf(activeTab);
    const newIndex = allTabs.indexOf(tabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(tabId);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;

    if (type === 'tabs') {
      reorderBlocks(source.index, destination.index);
    } else if (type === 'list-items') {
      reorderListItems(source.droppableId, source.index, destination.index);
    } else if (type === 'tag-items') {
      reorderTagItems(source.droppableId, source.index, destination.index);
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>, blockId: string) => {
    if (e.key === 'Enter') {
      addTagItem(blockId, newTags[blockId] || '');
      setNewTags(prev => ({ ...prev, [blockId]: '' }));
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/view?shared=true`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const activeBlock = data.blocks[activeTab];

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div 
        className="min-h-screen relative p-6 md:p-12 lg:p-24 overflow-x-hidden flex flex-col"
        style={{ '--theme-accent': data.themeColor } as CSSProperties}
      >
        <div className={`depth-bg ${data.enableAnimation ? 'animated' : ''}`} />

        {blockToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass p-8 rounded-2xl max-w-md w-full flex flex-col items-center text-center border border-white/10 shadow-2xl">
              <LucideIcons.AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">Delete Section?</h3>
              <p className="text-text-secondary mb-8">
                Are you sure you want to delete "{data.blocks[blockToDelete]?.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setBlockToDelete(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    removeBlock(blockToDelete);
                    if (activeTab === blockToDelete) setActiveTab('info');
                    setBlockToDelete(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-500/80 hover:bg-red-500 transition-colors text-white font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Bar - Separated into rows */}
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 mb-16 relative z-10">
          
          {/* Row 1: Colors */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="glass px-6 py-3 rounded-full flex items-center gap-4">
              <LucideIcons.Palette className="w-4 h-4 text-text-secondary" />
              <div className="flex gap-2">
                {THEME_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => updateThemeColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${data.themeColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input 
                  type="color" 
                  value={data.themeColor}
                  onChange={(e) => updateThemeColor(e.target.value)}
                  className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border-0 p-0"
                />
              </div>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <button
                onClick={toggleAnimation}
                className={`flex items-center gap-2 text-xs uppercase tracking-widest transition-colors ${data.enableAnimation ? 'text-accent' : 'text-text-secondary hover:text-white'}`}
                title="Toggle Background Animation"
              >
                {data.enableAnimation ? <LucideIcons.Sparkles className="w-4 h-4" /> : <LucideIcons.Sparkles className="w-4 h-4 opacity-50" />}
              </button>
            </div>
          </motion.div>

          {/* Row 2: Tabs & Add Block */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-center justify-between gap-2 bg-white/5 p-2 rounded-3xl backdrop-blur-md border border-white/10 xl:w-[1310px] xl:-ml-[100px] w-full"
          >
            {/* Info Tab (Fixed) */}
            <button
              onClick={() => handleTabClick('info')}
              data-active={activeTab === 'info'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all whitespace-nowrap hover-glow shrink-0 ${
                activeTab === 'info' 
                  ? 'bg-accent text-bg font-medium shadow-[0_0_15px_var(--theme-accent)]' 
                  : 'text-text-secondary hover:text-accent hover:bg-white/5'
              }`}
            >
              <LucideIcons.User className="w-4 h-4" />
              <span className="text-sm tracking-widest uppercase">Info</span>
            </button>

            {/* Draggable Tabs */}
            <Droppable droppableId="tabs" direction="horizontal" type="tabs">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={(el) => {
                    provided.innerRef(el);
                    // @ts-ignore
                    tabsContainerRef.current = el;
                  }}
                  className="flex gap-2 items-center overflow-x-auto glass-scrollbar flex-1 px-2 overscroll-x-contain"
                >
                  {data.blockOrder.map((blockId, index) => {
                    const block = data.blocks[blockId];
                    if (!block) return null;
                    const Icon = ICONS[blockId] || LucideIcons.Briefcase;
                    const isActive = activeTab === blockId;

                    return (
                      // @ts-expect-error key is valid in React
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            data-active={isActive}
                            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full transition-all whitespace-nowrap hover-glow shrink-0 group ${snapshot.isDragging ? 'z-50 shadow-2xl' : ''} ${
                              isActive 
                                ? 'bg-accent text-bg font-medium shadow-[0_0_15px_var(--theme-accent)]' 
                                : 'text-text-secondary hover:text-accent hover:bg-white/5'
                            }`}
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100"
                            >
                              <LucideIcons.GripVertical className="w-4 h-4" />
                            </div>
                            <button onClick={() => handleTabClick(blockId)} className="flex items-center gap-2 px-2">
                              <Icon className="w-4 h-4" />
                              <span className="text-sm tracking-widest uppercase">{block.title}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBlockToDelete(blockId);
                              }}
                              className="w-6 h-6 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 bg-white/10 text-white hover:bg-white/20"
                              title="Delete Section"
                            >
                              <LucideIcons.X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add Block Buttons */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10 shrink-0">
              <button
                onClick={() => {
                  const newId = addBlock('list');
                  handleTabClick(newId);
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-xs uppercase tracking-widest text-text-secondary hover:text-accent hover:bg-white/5 transition-colors hover-glow whitespace-nowrap"
              >
                <LucideIcons.Plus className="w-3 h-3" /> List
              </button>
              <button
                onClick={() => {
                  const newId = addBlock('tags');
                  handleTabClick(newId);
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-xs uppercase tracking-widest text-text-secondary hover:text-accent hover:bg-white/5 transition-colors hover-glow whitespace-nowrap"
              >
                <LucideIcons.Plus className="w-3 h-3" /> Tags
              </button>
            </div>
          </motion.div>

          {/* Row 3: Share & View */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex justify-center gap-4"
          >
            <button
              onClick={handleCopyLink}
              className="glass px-8 py-3 rounded-full flex items-center justify-center gap-2 text-sm uppercase tracking-widest hover:bg-white/10 transition-colors text-text-secondary hover:text-accent hover-glow whitespace-nowrap"
            >
              {copied ? <LucideIcons.Check className="w-4 h-4 text-green-400" /> : <LucideIcons.Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share Link'}
            </button>
            <Link
              to="/view"
              className="glass px-8 py-3 rounded-full flex items-center justify-center gap-2 text-sm uppercase tracking-widest hover:bg-white/10 transition-colors text-accent hover-glow whitespace-nowrap"
            >
              <LucideIcons.Eye className="w-4 h-4" /> View Showcase
            </Link>
          </motion.div>
        </div>

        <main className="max-w-4xl mx-auto w-full flex-1 relative">
          <AnimatePresence mode="wait" custom={direction}>
            {activeTab === 'info' ? (
              <motion.div 
                key="info"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center space-y-12 py-12"
              >
                <div className="w-full flex flex-col items-center">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateProfile('name', e.currentTarget.textContent || '')}
                    className="font-serif text-6xl md:text-8xl font-light leading-none text-accent mb-6 outline-none focus:border-b focus:border-accent/50 border-b border-transparent transition-colors min-w-[100px] hover-glow text-center"
                  >
                    {data.profile.name}
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateProfile('title', e.currentTarget.textContent || '')}
                    className="text-lg md:text-xl tracking-[0.4em] uppercase text-text-secondary outline-none focus:border-b focus:border-accent/50 border-b border-transparent transition-colors min-w-[100px] hover-glow-text text-center font-['Georgia']"
                  >
                    {data.profile.title}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 w-full max-w-2xl">
                  {data.profile.contactItems?.map((item) => {
                    const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Link;
                    return (
                      <div key={item.id} className="flex items-center gap-3 w-full group relative">
                        <div className="relative">
                          <select
                            value={item.icon}
                            onChange={(e) => updateContactItem(item.id, 'icon', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full"
                          >
                            {AVAILABLE_ICONS.map(iconName => (
                              <option key={iconName} value={iconName}>{iconName}</option>
                            ))}
                          </select>
                          <Icon className="w-5 h-5 text-accent hover:text-white transition-colors cursor-pointer" />
                        </div>
                        <input
                          value={item.text}
                          onChange={(e) => updateContactItem(item.id, 'text', e.target.value)}
                          placeholder="Display Text"
                          className="flex-1 bg-transparent border-b border-white/20 focus:border-accent outline-none text-lg transition-colors hover-glow-text font-['Georgia']"
                        />
                        <input
                          value={item.url || ''}
                          onChange={(e) => updateContactItem(item.id, 'url', e.target.value)}
                          placeholder="URL (optional)"
                          className="flex-1 bg-transparent border-b border-white/20 focus:border-accent outline-none text-sm text-text-secondary transition-colors"
                        />
                        <button 
                          onClick={() => removeContactItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 transition-all"
                        >
                          <LucideIcons.X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={addContactItem}
                    className="mt-2 flex items-center gap-2 text-xs uppercase tracking-widest text-text-secondary hover:text-accent transition-colors"
                  >
                    <LucideIcons.Plus className="w-3 h-3" /> Add Link
                  </button>
                </div>

                <div className="max-w-4xl w-full px-4 flex flex-col items-center group relative">
                  {/* Controls - Moved to bottom to avoid overlapping Add Link button */}
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all glass px-4 py-2 rounded-full z-20 pointer-events-none group-hover:pointer-events-auto shadow-xl">
                    <div className="flex items-center gap-1 border-r border-white/10 pr-4">
                      {['left', 'center', 'right', 'justify'].map(align => (
                        <button
                          key={align}
                          onClick={() => updateProfile('summaryAlign', align)}
                          className={`p-1.5 rounded-md transition-colors ${data.profile.summaryAlign === align || (!data.profile.summaryAlign && align === 'center') ? 'bg-white/20 text-white' : 'text-text-secondary hover:bg-white/10'}`}
                          title={`Align ${align}`}
                        >
                          {align === 'left' && <LucideIcons.AlignLeft className="w-4 h-4" />}
                          {align === 'center' && <LucideIcons.AlignCenter className="w-4 h-4" />}
                          {align === 'right' && <LucideIcons.AlignRight className="w-4 h-4" />}
                          {align === 'justify' && <LucideIcons.AlignJustify className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pl-2">
                      <LucideIcons.Maximize2 className="w-4 h-4 text-text-secondary" />
                      <input
                        type="range"
                        min="40"
                        max="100"
                        value={data.profile.summaryWidth || 100}
                        onChange={(e) => updateProfile('summaryWidth', parseInt(e.target.value))}
                        className="w-24 accent-accent"
                      />
                      <span className="text-xs text-text-secondary w-8">{data.profile.summaryWidth || 100}%</span>
                    </div>
                  </div>

                  <div style={{ width: `${data.profile.summaryWidth || 100}%` }} className="relative transition-all duration-300">
                    <span className="absolute -left-8 top-0 text-3xl font-serif italic text-text-secondary">"</span>
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateProfile('summary', e.currentTarget.textContent || '')}
                      className="italic text-2xl leading-relaxed text-text-secondary outline-none focus:bg-white/5 p-4 -m-4 rounded-xl transition-colors min-h-[100px] hover-glow-text font-['Georgia']"
                      style={{ textAlign: (data.profile.summaryAlign as any) || 'center' }}
                    >
                      {data.profile.summary}
                    </div>
                    <span className="absolute -right-8 bottom-0 text-3xl font-serif italic text-text-secondary">"</span>
                  </div>
                </div>
              </motion.div>
            ) : activeBlock ? (
              <motion.div
                key={activeBlock.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="py-8"
              >
                <div className="flex items-center justify-between mb-12">
                  <input
                    value={activeBlock.title}
                    onChange={e => updateBlockTitle(activeBlock.id, e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-accent outline-none text-sm font-bold uppercase tracking-[0.2em] text-text-secondary pb-1 transition-colors hover-glow-text"
                    placeholder="Section Title"
                  />
                </div>

                {activeBlock.type === 'list' && (
                  <Droppable droppableId={activeBlock.id} type="list-items">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                        {activeBlock.items.map((item: ListItem, index: number) => (
                          // @ts-expect-error key is valid in React
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`glass p-6 rounded-2xl space-y-4 relative group ${snapshot.isDragging ? 'z-50 shadow-2xl' : ''}`}
                              >
                                <div 
                                  {...provided.dragHandleProps}
                                  className="absolute left-4 top-4 text-white/20 hover:text-accent cursor-grab active:cursor-grabbing transition-colors"
                                >
                                  <LucideIcons.GripVertical className="w-5 h-5" />
                                </div>
                                <button 
                                  onClick={() => removeListItem(activeBlock.id, item.id)} 
                                  className="absolute top-4 right-4 text-text-secondary hover:text-red-400 transition-colors"
                                >
                                  <LucideIcons.X className="w-4 h-4" />
                                </button>
                                <div className="pl-8">
                                  <input
                                    value={item.title}
                                    onChange={e => updateListItem(activeBlock.id, item.id, 'title', e.target.value)}
                                    className="w-full bg-transparent border-b border-white/20 focus:border-accent outline-none font-serif text-2xl pb-1 transition-colors hover-glow"
                                    placeholder="Role / Degree"
                                  />
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <input
                                      value={item.subtitle}
                                      onChange={e => updateListItem(activeBlock.id, item.id, 'subtitle', e.target.value)}
                                      className="w-full bg-transparent border-b border-white/20 focus:border-accent outline-none text-xs tracking-widest uppercase pb-1 transition-colors hover-glow-text"
                                      placeholder="Company / Institution"
                                    />
                                    <input
                                      value={item.period}
                                      onChange={e => updateListItem(activeBlock.id, item.id, 'period', e.target.value)}
                                      className="w-full bg-transparent border-b border-white/20 focus:border-accent outline-none text-xs tracking-widest uppercase pb-1 transition-colors hover-glow-text"
                                      placeholder="Period (e.g. 2021 - Present)"
                                    />
                                  </div>
                                  <textarea
                                    value={item.description}
                                    onChange={e => updateListItem(activeBlock.id, item.id, 'description', e.target.value)}
                                    className="w-full mt-4 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-accent/50 outline-none resize-none transition-colors hover-glow-text"
                                    rows={3}
                                    placeholder="Description..."
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <button
                          onClick={() => addListItem(activeBlock.id)}
                          className="w-full glass py-4 rounded-2xl flex items-center justify-center gap-2 text-text-secondary hover:text-accent hover:bg-white/5 transition-all hover-glow"
                        >
                          <LucideIcons.Plus className="w-4 h-4" />
                          <span className="text-xs tracking-widest uppercase">Add Item</span>
                        </button>
                      </div>
                    )}
                  </Droppable>
                )}

                {activeBlock.type === 'tags' && (
                  <Droppable droppableId={activeBlock.id} type="tag-items" direction="horizontal">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-3">
                        {activeBlock.items.map((item: TagItem, index: number) => (
                          // @ts-expect-error key is valid in React
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`glass px-4 py-2 rounded-full flex items-center gap-2 border-accent/20 ${snapshot.isDragging ? 'z-50 shadow-2xl' : ''} hover-glow`}
                              >
                                <div 
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing text-white/40 hover:text-accent"
                                >
                                  <LucideIcons.GripVertical className="w-3 h-3" />
                                </div>
                                <input
                                  value={item.text}
                                  onChange={e => updateTagItem(activeBlock.id, item.id, e.target.value)}
                                  size={Math.max(item.text.length, 3)}
                                  className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-accent outline-none text-sm tracking-widest uppercase text-accent/90 transition-colors"
                                />
                                <button onClick={() => removeTagItem(activeBlock.id, item.id)} className="hover:text-red-400 transition-colors">
                                  <LucideIcons.X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <input
                          value={newTags[activeBlock.id] || ''}
                          onChange={e => setNewTags(prev => ({ ...prev, [activeBlock.id]: e.target.value }))}
                          onKeyDown={e => handleTagKeyDown(e, activeBlock.id)}
                          placeholder="+ Add (Press Enter)"
                          className="bg-transparent border-b border-white/20 focus:border-accent outline-none text-xs tracking-widest uppercase px-2 w-48 transition-colors"
                        />
                      </div>
                    )}
                  </Droppable>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>
    </DragDropContext>
  );
}
