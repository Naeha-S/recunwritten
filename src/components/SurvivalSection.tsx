import React from 'react';
import { SurvivalTip } from '../types';
import { 
  Coffee, 
  Printer, 
  Bus, 
  Home, 
  Compass, 
  HelpCircle, 
  BookOpen, 
  ArrowUp,
  MapPin,
  Sparkles,
  Bookmark
} from 'lucide-react';

interface SurvivalSectionProps {
  tips: SurvivalTip[];
  onUpvoteTip: (id: string) => void;
  openAddSurvivalModal: () => void;
  bookmarkedTipIds?: string[];
  onToggleTipBookmark?: (id: string) => void;
}

export default function SurvivalSection({ 
  tips, 
  onUpvoteTip, 
  openAddSurvivalModal, 
  bookmarkedTipIds = [], 
  onToggleTipBookmark 
}: SurvivalSectionProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Intel', icon: Compass },
    { id: 'food', label: 'Food & Snacks', icon: Coffee },
    { id: 'printing', label: 'Cheap Printing', icon: Printer },
    { id: 'transport', label: 'Bus & Commute', icon: Bus },
    { id: 'hostel', label: 'Hostel Secrets', icon: Home },
    { id: 'spots', label: 'Quiet Study Spots', icon: MapPin },
    { id: 'hacks', label: 'Attendance & CATs', icon: Sparkles },
    { id: 'resources', label: 'Exam Banks', icon: BookOpen }
  ];

  const filteredTips = selectedCategory === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === selectedCategory);

  const getCatColor = (cat: string) => {
    switch (cat) {
      case 'food': return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'printing': return 'bg-indigo-100 text-indigo-950 border-indigo-200';
      case 'transport': return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'hostel': return 'bg-rose-100 text-rose-950 border-rose-200';
      case 'spots': return 'bg-green-100 text-green-950 border-green-200';
      case 'hacks': return 'bg-violet-100 text-violet-950 border-violet-200';
      case 'resources': return 'bg-yellow-100 text-amber-950 border-yellow-200';
      default: return 'bg-slate-100 text-slate-900 border-slate-200';
    }
  };

  return (
    <div className="space-y-6" id="survival-section font-sans select-none">
      
      {/* Intro Banner */}
      <div className="bg-violet-50/70 border border-violet-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="font-sans font-black text-slate-900 text-lg flex items-center gap-2">
            <Compass className="w-5 h-5 text-violet-750" />
            <span>Thandalam Campus Survival Atlas</span>
          </h2>
          <p className="text-slate-500 text-xs font-normal">
            Every trick, cheap xerox, best transport route, and snack recommendations passed down through student generations.
          </p>
        </div>
        <button
          onClick={openAddSurvivalModal}
          className="px-4 py-2 bg-violet-750 hover:bg-violet-850 text-white rounded-lg text-xs font-bold shadow-sm border-b-2 border-violet-900 transition-all focus:ring-1 shrink-0"
        >
          + Add Anonymous Guide
        </button>
      </div>

      {/* Category selector row */}
      <div className="flex flex-wrap gap-2 pb-2" id="survival-cats">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-violet-750 text-white shadow-sm font-bold'
                  : 'bg-white border border-slate-200/70 text-slate-600 hover:border-slate-350 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tips Container Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTips.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400 italic">No survival guides listed on this category yet. Be the first to share your senior hack!</p>
          </div>
        ) : (
          filteredTips.map((tip) => (
            <div 
              key={tip.id} 
              className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between"
              id={`tip-card-${tip.id}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {/* Category badging */}
                  <span className={`px-2 py-0.5 border text-[10px] font-extrabold uppercase tracking-widest rounded ${getCatColor(tip.category)}`}>
                    {tip.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    By {tip.isAnonymous ? 'Anonymous Senior' : tip.authorName}
                  </span>
                </div>

                <h3 className="font-sans font-extrabold text-slate-900 text-sm leading-snug">
                  {tip.title}
                </h3>
                
                <p className="text-slate-600 text-xs leading-relaxed font-normal">
                  {tip.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onUpvoteTip(tip.id)}
                  className="flex items-center space-x-1.5 px-3 py-1 bg-slate-50 hover:bg-violet-100 text-slate-605 hover:text-violet-750 font-bold border border-slate-200/50 rounded-lg text-xs transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Accurate Advice ({tip.upvotes})</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleTipBookmark && onToggleTipBookmark(tip.id)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition-all text-xs font-bold ${
                      bookmarkedTipIds.includes(tip.id)
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-slate-50 border-slate-200/50 text-slate-500 hover:bg-amber-50 hover:text-amber-800'
                    }`}
                    title="Save for Later"
                  >
                    <Bookmark className={`w-3.5 h-3.5 mr-1 ${bookmarkedTipIds.includes(tip.id) ? 'fill-amber-450 text-amber-500' : ''}`} />
                    <span>{bookmarkedTipIds.includes(tip.id) ? 'Saved' : 'Save'}</span>
                  </button>
                  <span className="text-[10px] font-mono text-violet-750 bg-violet-50/70 px-1 py-0.5 rounded">
                    ★ Validated Tip
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
