import React from 'react';
import { Post } from '../types';
import { 
  Sparkles, 
  Users, 
  GraduationCap, 
  Award, 
  FileText, 
  Compass, 
  HelpCircle,
  Clock,
  MapPin,
  Bookmark,
  ShieldCheck,
  MessageSquare,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedDept: string | null;
  setSelectedDept: (dept: string | null) => void;
  posts: Post[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab,
  selectedDept,
  setSelectedDept,
  posts,
  isOpenMobile = false,
  onCloseMobile
}: SidebarProps) {
  const menuItems = [
    { id: 'feed', label: 'Home Feed', icon: Sparkles },
    { id: 'forum', label: 'Reddit Q&A Forum', icon: MessageSquare },
    { id: 'departments', label: 'Department Circles', icon: Users },
    { id: 'professors', label: 'Professor Vault', icon: GraduationCap },
    { id: 'placements', label: 'Placement Hub', icon: Award },
    { id: 'internships', label: 'Internship Board', icon: FileText },
    { id: 'survival', label: 'Campus Survival Guide', icon: Compass },
    { id: 'bookmarks', label: 'Saved Library', icon: Bookmark },
    { id: 'moderator', label: 'Moderator Dashboard', icon: ShieldCheck },
    { id: 'freshers', label: 'Freshers Starter Pack', icon: HelpCircle },
  ];

  const DEPARTMENTS = [
    'IT', 'CSE', 'AIML', 'AIDS', 'CSBS', 'ECE', 'EEE', 'Mechanical', 'Robotics', 'Other'
  ];

  // Dynamically calculate the top 3 most discussed tags
  const trendingTags = React.useMemo(() => {
    const tagCounts: { [tag: string]: number } = {};
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach(tag => {
          if (tag && tag.trim()) {
            const cleanTag = tag.trim();
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [posts]);

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-45 bg-slate-900/40 backdrop-blur-[1px] md:hidden transition-opacity duration-300" 
          onClick={onCloseMobile}
          id="sidebar-backdrop"
        />
      )}

      <aside className={`
        w-64 border-r border-slate-200 bg-slate-50 select-none flex flex-col justify-between h-full
        fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-[calc(100vh-64px)] md:overflow-y-auto md:flex md:z-auto
      `} id="sidebar-container">
        <div className="p-5 flex-1" id="sidebar-nav-content">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Navigation</h3>
            {isOpenMobile && (
              <button 
                onClick={onCloseMobile}
                className="p-1 text-slate-400 hover:text-slate-750 bg-slate-100 hover:bg-slate-200 rounded-lg md:hidden transition-colors cursor-pointer"
                id="mobile-sidebar-close-btn"
                title="Close Navigation"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (item.id !== 'departments') {
                    setSelectedDept(null);
                  }
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-white text-violet-700 font-bold shadow-sm border border-violet-150' 
                    : 'text-slate-500 hover:bg-white/80 hover:text-slate-800'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-yellow-400' : 'bg-transparent'}`}></div>
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'freshers' && (
                  <span className="ml-auto text-[9px] uppercase font-bold px-1.5 py-0.5 bg-yellow-150 text-violet-950 rounded-full">
                    REC 101
                  </span>
                )}

              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-2">Your Depts</h3>
          <div className="flex flex-wrap gap-1.5 px-1">
            {DEPARTMENTS.map((dept) => {
              const isSelected = currentTab === 'departments' && selectedDept === dept;
              return (
                <button
                  key={dept}
                  id={`sidebar-dept-${dept}`}
                  onClick={() => {
                    setCurrentTab('departments');
                    setSelectedDept(dept);
                    onCloseMobile?.();
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    isSelected
                      ? 'bg-violet-100 text-violet-700 font-bold border border-violet-200/50'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {dept}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Trending Topics Widget */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-500 animate-pulse" />
            <span>Trending Topics</span>
          </h3>
          <div className="space-y-1.5 px-1">
            {trendingTags.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">No trending tags calculated.</p>
            ) : (
              trendingTags.map((tag) => (
                <div 
                  key={tag.name}
                  className="flex items-center justify-between text-xs p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 group transition-all"
                >
                  <span className="font-mono text-slate-600 font-medium truncate">
                    #{tag.name}
                  </span>
                  <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full group-hover:bg-violet-100 transition-all font-mono shrink-0">
                    {tag.count} posts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info card mimicking the custom box from the HTML layout */}
        <div className="mt-8 bg-violet-700 p-4 rounded-xl text-white space-y-2">
          <p className="text-[11px] font-bold leading-tight italic">
            "The repository every Rajalakshmi student wishes existed on day one."
          </p>
          <div className="text-[9px] opacity-70 flex justify-between items-center font-mono">
            <span>v1.04 Student-built</span>
            <span>2026 Batch</span>
          </div>
        </div>
      </div>
    </aside>
  </>
);
}
