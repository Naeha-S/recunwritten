import React from 'react';
import { Search, Flame, ShieldAlert, Award, Menu, X, Sparkles, BookOpen, GraduationCap, MapPin, Coffee, LogOut, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openAddModal: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  studentEmail?: string;
  onLogOut?: () => void;
  studentDept?: string;
  isRollNumber?: boolean;
  onUpdateManualDept?: (dept: string) => void;
  theme: 'light' | 'midnight';
  onToggleTheme: () => void;
}

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  openAddModal, 
  currentTab, 
  setCurrentTab,
  studentEmail,
  onLogOut,
  studentDept,
  isRollNumber,
  onUpdateManualDept,
  theme,
  onToggleTheme
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const mobileTabs = [
    { id: 'feed', label: 'Feed' },
    { id: 'forum', label: 'Forum' },
    { id: 'departments', label: 'Depts' },
    { id: 'professors', label: 'Profs' },
    { id: 'placements', label: 'Placements' },
    { id: 'internships', label: 'Internships' },
    { id: 'survival', label: 'Survival' },
    { id: 'bookmarks', label: 'Saved' },
    { id: 'freshers', label: 'Freshers' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('feed')} id="logo-branding-container">
            <div className="bg-violet-700 text-yellow-400 font-black p-2 rounded-lg text-lg tracking-tighter leading-none shadow-sm flex items-center justify-center w-9 h-9">
              UN
            </div>
            <div>
              <div className="flex items-center space-x-2 leading-none">
                <h1 className="text-xl font-black uppercase tracking-tight text-violet-700 font-display">
                  Unwritten <span className="text-slate-400 font-light font-display">REC</span>
                </h1>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-yellow-400 text-violet-950 rounded-full font-sans">
                  UNOFFICIAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">STUDENT INTEL REPOSITORY • CHENNAI</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6 hidden sm:block" id="header-search-wrapper">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for professors, departments, companies, tips..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs transition-all focus:outline-none focus:ring-2 focus:ring-violet-700/20 focus:border-violet-500 focus:bg-white text-slate-800 font-sans"
                id="header-global-search-input"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3" id="header-actions-area">
            {studentEmail && (
              <div 
                className="hidden md:flex items-center space-x-2 p-1 bg-violet-50 border border-violet-150 rounded-full pl-3 pr-1 text-[11px] font-sans font-normal shadow-2xs"
                id="header-verified-session-pill"
              >
                <span className="font-extrabold text-violet-950 tracking-tight pl-1" title={studentEmail}>
                  {studentEmail.split('@')[0]}
                </span>
                
                {isRollNumber ? (
                  <div className="flex items-center space-x-1 bg-white border border-violet-200 rounded-full px-2 py-0.5" id="senior-circle-select">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Sr</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Circle:</span>
                    <select
                      value={studentDept || 'Other'}
                      onChange={(e) => onUpdateManualDept?.(e.target.value)}
                      className="bg-transparent border-0 text-[10px] font-extrabold text-violet-700 uppercase focus:ring-x focus:outline-none p-0 cursor-pointer pr-1"
                      title="Select your current Department Circle"
                    >
                      {['IT', 'CSE', 'AIML', 'AIDS', 'CSBS', 'ECE', 'EEE', 'Mechanical', 'Robotics', 'Other'].map(d => (
                        <option key={d} value={d} className="font-sans font-bold text-slate-800">{d}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-violet-700 text-white font-mono uppercase font-black tracking-wider" id="junior-circle-badge">
                    Circ: {studentDept || 'Other'}
                  </span>
                )}

                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-slate-250 text-slate-600 font-mono uppercase font-bold tracking-tight">
                  Verified REC
                </span>
                <button
                  onClick={onLogOut}
                  className="p-1 hover:bg-violet-100 rounded-full text-violet-600 hover:text-violet-900 transition-colors cursor-pointer"
                  title="Sign out of student portal session"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Global Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              id="header-theme-toggle-btn"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-all active:scale-95 cursor-pointer flex items-center justify-center border border-slate-200/50"
              title={theme === 'midnight' ? "Switch to Sunny Light theme" : "Switch to Midnight dark theme"}
            >
              {theme === 'midnight' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400 font-bold" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-700 font-bold" />
              )}
            </button>

            <button
              onClick={openAddModal}
              id="header-add-intel-btn"
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-violet-900 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-800 animate-pulse" />
              <span>Contribute Intel</span>
            </button>

            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1 rounded-md text-slate-600 hover:bg-slate-50"
              id="mobile-drawer-trigger"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Global Search for Mobile */}
        <div className="pb-3 block sm:hidden" id="mobile-search-area">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects, companies, placement..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800"
              id="mobile-search-input"
            />
          </div>
        </div>

      </div>

      {/* Mobile view sub-tabs layout */}
      <div className="overflow-x-auto bg-slate-50/80 border-t border-slate-100 flex py-2 px-3 space-x-1 md:hidden scrollbar-none" id="mobile-subtabs-nav">
        {mobileTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-violet-700 text-white font-semibold' 
                  : 'bg-white text-slate-600 border border-slate-200/60'
              }`}
              id={`mobile-tab-btn-${tab.id}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-[104px] left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-50 p-4 block sm:hidden" id="mobile-drawer-container">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Platform Navigation</h4>
          <div className="grid grid-cols-2 gap-2">
            {mobileTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentTab === tab.id ? 'bg-violet-50 text-violet-700 font-bold' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.label === 'Feed' ? '🔥 Home Feed' : 
                 tab.label === 'Depts' ? '👥 Departments' : 
                 tab.label === 'Profs' ? '🎓 Prof Vault' : 
                 tab.label === 'Placements' ? '💼 Placement Hub' : 
                 tab.label === 'Internships' ? '📄 Internship Board' : 
                 tab.label === 'Survival' ? '🧭 Campus Guide' : 
                 tab.label === 'Saved' ? '🔖 Saved Library' : '⭐ Freshers Pack'}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 bg-violet-50/50 p-3 rounded-lg text-[11px] text-slate-500">
            <span className="font-bold text-violet-800">Unwritten REC is autonomous batch-compiled.</span>
            <p className="mt-1">All secrets, printing tips, free canteen spots, and exam papers are anonymously verified by real seniors of Rajalakshmi Engineering College.</p>
          </div>
        </div>
      )}
    </header>
  );
}
