import { CSSProperties, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { useResume } from '../hooks/useResume';
import { ListItem, TagItem } from '../types';
import { Link, useSearchParams } from 'react-router-dom';

const ICONS: Record<string, any> = {
  info: LucideIcons.User,
  experience: LucideIcons.Briefcase,
  education: LucideIcons.GraduationCap,
  skills: LucideIcons.Code,
  languages: LucideIcons.Globe
};

export default function ViewPage() {
  const { data } = useResume();
  const [activeTab, setActiveTab] = useState('info');
  const [direction, setDirection] = useState(0);
  const [searchParams] = useSearchParams();
  const isShared = searchParams.get('shared') === 'true';
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
    <div 
      className="min-h-screen relative p-6 md:p-12 lg:p-24 overflow-x-hidden flex flex-col"
      style={{ '--theme-accent': data.themeColor } as CSSProperties}
    >
      <div className={`depth-bg ${data.enableAnimation ? 'animated' : ''}`} />

      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto w-full flex flex-col xl:flex-row justify-between items-center gap-6 mb-16 relative z-10"
      >
        <div className="flex-1 hidden xl:block"></div>

        {/* Tabs */}
        <div 
          ref={tabsContainerRef}
          className="flex items-center justify-between gap-2 bg-white/5 py-2 px-[15px] rounded-3xl backdrop-blur-md border border-white/10 xl:w-[1310px] h-[70px] xl:-ml-[100px] xl:-mr-[5px] text-center text-[#fcfcfc] text-base font-normal leading-6 no-underline overflow-x-auto glass-scrollbar overscroll-x-contain w-full"
        >
          {allTabs.map((blockId) => {
            const isInfo = blockId === 'info';
            const block = isInfo ? { id: 'info', title: 'Info' } : data.blocks[blockId];
            if (!block) return null;
            const Icon = ICONS[blockId] || LucideIcons.Briefcase;
            const isActive = activeTab === blockId;

            return (
              <button
                key={block.id}
                onClick={() => handleTabClick(blockId)}
                data-active={isActive}
                className={`flex items-center justify-center gap-2 w-[150px] h-[45px] rounded-full transition-all whitespace-nowrap hover-glow shrink-0 ${
                  isActive 
                    ? 'bg-accent text-bg font-medium shadow-[0_0_15px_var(--theme-accent)]' 
                    : 'text-text-secondary hover:text-accent hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm tracking-widest uppercase">{block.title}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex justify-end w-full xl:w-auto">
          {!isShared && (
            <Link
              to="/edit"
              className="glass px-6 py-3 rounded-full flex items-center justify-center gap-2 text-sm uppercase tracking-widest hover:bg-white/10 transition-colors text-text-secondary hover:text-accent hover-glow whitespace-nowrap"
            >
              <LucideIcons.Edit2 className="w-4 h-4" /> Edit Profile
            </Link>
          )}
        </div>
      </motion.div>

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
              <div>
                <h1 className="font-serif text-6xl md:text-8xl font-light leading-none text-accent mb-6 hover-glow cursor-default">{data.profile.name}</h1>
                <p className="text-lg md:text-xl tracking-[0.4em] uppercase text-text-secondary hover-glow-text cursor-default font-['Georgia']">{data.profile.title}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-text-secondary">
                {data.profile.contactItems?.map(item => {
                  const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Link;
                  return (
                    <div key={item.id} className="flex items-center gap-3 hover-glow-text cursor-default">
                      <Icon className="w-5 h-5 text-accent" />
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-lg hover:text-accent transition-colors font-['Georgia'] font-bold">
                          {item.text}
                        </a>
                      ) : (
                        <span className="text-lg font-['Georgia']">{item.text}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="max-w-[900px] w-full px-4 flex justify-center">
                <div style={{ width: `${data.profile.summaryWidth || 100}%` }} className="relative">
                  <span className="absolute -left-8 top-0 text-3xl font-serif italic text-text-secondary">"</span>
                  <div 
                    className="italic text-2xl leading-relaxed text-text-secondary hover-glow-text cursor-default font-['Georgia'] w-full md:w-[900px]"
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
              {activeBlock.type === 'list' && (
                <div className="space-y-12">
                  {activeBlock.items.map((item: ListItem) => (
                    <div 
                      key={item.id} 
                      className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-white/10"
                    >
                      <div className="absolute left-[-4px] top-2.5 w-2 h-2 rounded-full bg-accent hover-glow" />
                      <div className="group">
                        <h3 className="font-serif text-3xl mb-2 group-hover:text-accent transition-colors hover-glow cursor-default">{item.title}</h3>
                        <div className="text-xs tracking-widest uppercase text-text-secondary mb-4 hover-glow-text cursor-default">
                          <span className="text-white/80">{item.subtitle}</span> • {item.period}
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap hover-glow-text cursor-default">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeBlock.type === 'tags' && (
                <div className="flex flex-wrap gap-3">
                  {activeBlock.items.map((item: TagItem) => (
                    <div 
                      key={item.id} 
                      className="glass px-6 py-3 rounded-full flex items-center gap-2 border-accent/20 hover-glow cursor-default"
                    >
                      <span className="text-sm tracking-widest uppercase text-accent/90">{item.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
