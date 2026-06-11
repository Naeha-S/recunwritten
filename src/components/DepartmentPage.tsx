import React, { useEffect } from 'react';
import { Post, InternshipExperience } from '../types';
import PostCard from './PostCard';
import { 
  Users, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle,
  Mail,
  Send,
  Loader2,
  Lock
} from 'lucide-react';

export const DEPARTMENTS_MOCKUP = [
  {
    code: 'IT',
    dbCode: 'IT',
    name: 'Information Technology',
    students: '1,240 students',
    gradient: 'from-[#a855f7] to-[#e0aaff]', // Purple Gradient
  },
  {
    code: 'CSE',
    dbCode: 'CSE',
    name: 'Computer Science & Engineering',
    students: '1,820 students',
    gradient: 'from-[#6366f1] to-[#a5b4fc]', // Violet/Blueish-purple
  },
  {
    code: 'AIML',
    dbCode: 'AIML',
    name: 'AI & Machine Learning',
    students: '640 students',
    gradient: 'from-[#f97316] to-[#fdba74]', // Orange/Yellow-orange
  },
  {
    code: 'AIDS',
    dbCode: 'AIDS',
    name: 'AI & Data Science',
    students: '580 students',
    gradient: 'from-[#ec4899] to-[#f472b6]', // Pink/magenta
  },
  {
    code: 'CSBS',
    dbCode: 'CSBS',
    name: 'CS & Business Systems',
    students: '320 students',
    gradient: 'from-[#0d9488] to-[#2dd4bf]', // Greenish Teal
  },
  {
    code: 'ECE',
    dbCode: 'ECE',
    name: 'Electronics & Communication',
    students: '980 students',
    gradient: 'from-[#0ea5e9] to-[#38bdf8]', // Cyan Sky-Blue
  },
  {
    code: 'EEE',
    dbCode: 'EEE',
    name: 'Electrical & Electronics',
    students: '540 students',
    gradient: 'from-[#f59e0b] to-[#fcd34d]', // Yellow Amber
  },
  {
    code: 'MECH',
    dbCode: 'Mechanical',
    name: 'Mechanical Engineering',
    students: '620 students',
    gradient: 'from-[#475569] to-[#94a3b8]', // Dark Slate / Gray
  },
  {
    code: 'ROBO',
    dbCode: 'Robotics',
    name: 'Robotics & Automation',
    students: '210 students',
    gradient: 'from-[#d946ef] to-[#f472b6]', // Hot Pink / Purple Spark
  },
  {
    code: 'OTHER',
    dbCode: 'Other',
    name: 'Other Departments',
    students: 'Various core & allied students',
    gradient: 'from-[#6b7280] to-[#9ca3af]', // Neutral Gray
  }
];

interface DepartmentPageProps {
  posts: Post[];
  internships: InternshipExperience[];
  studentEmail?: string;
  searchQuery: string;
  selectedDept: string | null;
  setSelectedDept: (dept: string | null) => void;
  onPostUpvote: (id: string) => void;
  onAddComment: (postId: string, commentAuthor: string, commentAnonymous: boolean, content: string) => void;
  bookmarkedPosts: string[];
  onToggleBookmark: (id: string) => void;
  setIsAddIntelOpen: (open: boolean) => void;
  studentDept?: string;
}

export default function DepartmentPage({
  posts,
  internships,
  studentEmail = '',
  searchQuery,
  selectedDept,
  setSelectedDept,
  onPostUpvote,
  onAddComment,
  bookmarkedPosts,
  onToggleBookmark,
  setIsAddIntelOpen,
  studentDept
}: DepartmentPageProps) {

  // Weekly Digest Email Circular State Managers
  const [subEmail, setSubEmail] = React.useState(studentEmail || '');
  const [subLoading, setSubLoading] = React.useState(false);
  const [subSuccess, setSubSuccess] = React.useState<string | null>(null);
  const [subError, setSubError] = React.useState<string | null>(null);

  // Sync state if studentEmail prop changes
  useEffect(() => {
    if (studentEmail) {
      setSubEmail(studentEmail);
    }
  }, [studentEmail]);

  const handleSubscribeSummaries = async () => {
    setSubError(null);
    setSubSuccess(null);

    const emailStr = subEmail.trim();
    if (!emailStr) {
      setSubError('Please enter your email to receive weekly updates.');
      return;
    }
    
    if (!emailStr.toLowerCase().endsWith('@rajalakshmi.edu.in')) {
      setSubError('Access restricted to Rajalakshmi Student Emails (@rajalakshmi.edu.in).');
      return;
    }

    if (!selectedDept) {
      setSubError('No active department selected.');
      return;
    }

    setSubLoading(true);

    try {
      // 1. Calculate Top 3 most upvoted posts for current selectedDept
      const deptPosts = posts
        .filter(p => p.department.toLowerCase() === selectedDept.toLowerCase())
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 3);

      // 2. Calculate Newest 2 internships for selectedDept
      const deptInterns = internships
        .filter(i => i.department?.toLowerCase() === selectedDept.toLowerCase())
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 2);

      const res = await fetch('/api/resend/send-weekly-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: emailStr,
          department: selectedDept,
          topPosts: deptPosts,
          newInternships: deptInterns
        })
      });

      const data = await res.json();
      setSubLoading(false);

      if (data.success) {
        setSubSuccess(data.message || `Summary Circular successfully sent to ${emailStr}!`);
        // Save subscription setting locally
        const currentSubsStr = localStorage.getItem('rec_department_subs') || '[]';
        try {
          const currentSubs = JSON.parse(currentSubsStr);
          if (!currentSubs.includes(selectedDept)) {
            currentSubs.push(selectedDept);
            localStorage.setItem('rec_department_subs', JSON.stringify(currentSubs));
          }
        } catch (_) {}
      } else {
        setSubError(data.error || 'Trigger failed: ' + (data.resendDetails || 'Verify API config.'));
      }
    } catch (err: any) {
      setSubLoading(false);
      setSubError('Failed to dispatch summary email: ' + (err?.message || 'Check connection.'));
    }
  };

  // Synchronize department routing via URL Hash change triggers
  useEffect(() => {
    const handleHashRouter = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/departments/')) {
        const routeCode = hash.replace('#/departments/', '').toUpperCase();
        const match = DEPARTMENTS_MOCKUP.find(
          d => d.code === routeCode || d.dbCode.toUpperCase() === routeCode
        );
        if (match && selectedDept !== match.dbCode) {
          setSelectedDept(match.dbCode);
        }
      } else if (hash === '#/departments' || hash === '#departments') {
        setSelectedDept(null);
      }
    };

    window.addEventListener('hashchange', handleHashRouter);
    handleHashRouter(); // Run initial check on load

    return () => {
      window.removeEventListener('hashchange', handleHashRouter);
    };
  }, [selectedDept, setSelectedDept]);

  // Set hash route on local state updates to maintain browser history sanity
  const navigateToDept = (deptDbCode: string | null) => {
    if (deptDbCode) {
      const target = DEPARTMENTS_MOCKUP.find(d => d.dbCode === deptDbCode);
      const urlCode = target ? target.code.toLowerCase() : deptDbCode.toLowerCase();
      window.location.hash = `#/departments/${urlCode}`;
      setSelectedDept(deptDbCode);
    } else {
      window.location.hash = `#/departments`;
      setSelectedDept(null);
    }
  };

  // Helper method to filter department-specific posts & match search string
  const getFilteredDeptPosts = () => {
    if (!selectedDept) return [];
    let deptPosts = posts.filter(p => p.department.toLowerCase() === selectedDept.toLowerCase());
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      deptPosts = deptPosts.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.content.toLowerCase().includes(query) || 
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    return deptPosts;
  };

  const filteredPosts = getFilteredDeptPosts();

  return (
    <div className="space-y-8 animate-fadeIn" id="department-page-root">
      {!selectedDept ? (
        <div className="space-y-6" id="departments-list-view">
          {/* Main heading copy from screenshots review context */}
          <div className="space-y-1.5" id="departments-screenshot-header">
            <h1 className="font-sans font-black text-slate-900 text-3xl sm:text-4xl tracking-tight leading-none">
              Department communities
            </h1>
            <p className="text-slate-500 font-normal text-sm sm:text-[15px] max-w-3xl leading-relaxed">
              Each branch has its own threads: electives, professors, projects, placements and inside jokes.
            </p>
          </div>

          {/* Grid layout with gradient covers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2" id="departments-deck-grid">
            {DEPARTMENTS_MOCKUP.map((dept) => (
              <div
                key={dept.code}
                onClick={() => navigateToDept(dept.dbCode)}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-0.5 group"
                id={`dept-card-container-${dept.code}`}
              >
                {/* Horizontal Top colored cover banner */}
                <div className={`h-28 bg-gradient-to-r ${dept.gradient} px-6 pt-6 flex items-start text-white text-3xl font-sans font-black tracking-tight select-none`}>
                  {dept.code}
                </div>
                {/* Information cards details section */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-sans font-extrabold text-slate-900 text-[15px] leading-snug group-hover:text-violet-750 transition-colors">
                      {dept.name}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-2">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dept.students}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs font-bold text-violet-700 group-hover:text-violet-900 hover:underline transition-colors inline-flex items-center gap-1">
                    Enter r/{dept.code.toLowerCase()} →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6" id="department-explorer-view">
          {/* Breadcrumb controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <button
              onClick={() => navigateToDept(null)}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-violet-755 transition-colors bg-white hover:bg-slate-50 px-4 py-2 border border-slate-200 rounded-full shadow-2xs cursor-pointer"
              id="back-to-dept-communities"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>← Back to Department Communities</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-3 py-1">
                Viewing: r/{selectedDept.toLowerCase()}
              </span>
            </div>
          </div>

          {/* Info Banner details */}
          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-3">
            <h2 className="font-sans font-black text-slate-900 text-xl flex items-center gap-2.5">
              <div className="w-2 h-6 bg-violet-600 rounded-full" />
              <span>{selectedDept} Discussion Circle</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl font-sans font-normal">
              This represents the active, unmoderated container for sharing syllabus strategies, CAT preparation, laboratory hacks, and placement reviews. Share files and notify other students instantly.
            </p>

            {/* Quick switcher buttons list */}
            <div className="pt-3 border-t border-slate-105 flex items-center flex-wrap gap-2">
              <span className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Switch Circle:</span>
              <div className="flex flex-wrap gap-1">
                {DEPARTMENTS_MOCKUP.map((d) => (
                  <button
                    key={d.code}
                    onClick={() => navigateToDept(d.dbCode)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all uppercase cursor-pointer ${
                      selectedDept.toLowerCase() === d.dbCode.toLowerCase()
                        ? 'bg-violet-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    r/{d.code.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Split Feed & Side Panel Grid widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Posts section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-120 pb-2">
                <h3 className="font-sans font-extrabold text-xs uppercase tracking-wider text-violet-750">
                  {selectedDept} Discussion Board
                </h3>
                {selectedDept && (
                  (() => {
                    const isDeptLocked = studentDept && studentDept !== 'Other' && studentDept !== 'general' && studentDept.toLowerCase() !== selectedDept.toLowerCase();
                    return (
                      <button 
                        onClick={() => {
                          if (!isDeptLocked) {
                            setIsAddIntelOpen(true);
                          }
                        }}
                        disabled={!!isDeptLocked}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all shadow-2xs flex items-center gap-1 ${
                          isDeptLocked 
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'text-violet-700 hover:text-white bg-violet-50 hover:bg-violet-750 border-violet-100 cursor-pointer'
                        }`}
                        title={isDeptLocked ? `Locked: Only ${selectedDept} Department members can post.` : undefined}
                      >
                        {isDeptLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>r/{selectedDept.toLowerCase()} Locked</span>
                          </>
                        ) : (
                          <>
                            🚀 Post inside r/{selectedDept.toLowerCase()}
                          </>
                        )}
                      </button>
                    );
                  })()
                )}
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 space-y-1">
                  <p className="text-xs text-slate-500 font-bold">No discussions reported under {selectedDept} yet</p>
                  <p className="text-[11px] text-slate-400">Be the very first node to post syllabus advice, code snippets, or electives review here!</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onUpvote={onPostUpvote}
                    onAddComment={onAddComment}
                    isBookmarked={bookmarkedPosts.includes(post.id)}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))
              )}
            </div>

            {/* Sidebar quick hacks files config block */}
            <div className="space-y-4">
              {/* WEEKLY DIGEST NEWSLETTER TRIGGER / SUBSCRIPTION */}
              <div className="bg-white border text-slate-850 p-5 rounded-2xl border-slate-200/80 space-y-3.5 shadow-2xs animate-fadeIn" id="weekly-digest-subscribe-card">
                <h4 className="font-sans font-extrabold text-[11px] text-violet-750 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-violet-600 animate-pulse" />
                  <span>Weekly summary digest</span>
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-normal">
                  Get the top 3 most upvoted r/{selectedDept.toLowerCase()} posts and 2 new internships matching your department delivered to your inbox every week!
                </p>
                
                {/* Form state fields */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Student email address</label>
                    <input
                      type="email"
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      placeholder="naeha.s.2024.it@rajalakshmi.edu.in"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-850 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  
                  {subError && (
                    <p className="text-[10px] text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100/60 leading-snug">{subError}</p>
                  )}
                  {subSuccess && (
                     <div className="space-y-1 bg-violet-50 p-3 rounded-xl border border-violet-100/70 text-[10.5px] text-purple-950 leading-relaxed font-normal">
                       <p className="font-extrabold text-violet-850 flex items-center gap-1">
                         <CheckCircle className="w-3.5 h-3.5 text-violet-600" />
                         <span>Successfully Circulated!</span>
                       </p>
                       <p>{subSuccess}</p>
                     </div>
                  )}

                  <button
                    onClick={handleSubscribeSummaries}
                    disabled={subLoading}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-violet-700 hover:bg-violet-850 text-white font-black text-xs rounded-xl shadow-2xs hover:shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {subLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Digest...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Send Weekly Digest Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3.5">
                <h4 className="font-sans font-extrabold text-xs text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{selectedDept} Survival Sheet</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {selectedDept === 'IT' && "IT labs are situated in M-Block. The air conditioning is amazing, but the lab assistants check record submissions very strictly. Always format your code directories correctly."}
                  {selectedDept === 'CSE' && "CSE occupies prime floors in M-Block and A-Block. Networking labs have strict firewall restrictions. High CGPA is very important because companies like Zoho prioritizes CSE cutoffs."}
                  {selectedDept === 'ECE' && "ECE labs are very rigorous. Be prepared with clean breadboard layouts. Dr. Ramesh teaches here; do not skip lab reports or arrive late!"}
                  {selectedDept === 'EEE' && "EEE power labs demand proper formal shoes. If you display sports shoes, they send you back. Study electric motor design theories meticulously."}
                  {selectedDept === 'Mechanical' && "M-Block yard hosts Mechanical labs. Muffins bakery is literally 1 minute away, which is a major lifesaver during morning break shortages!"}
                  {selectedDept === 'AIML' && "Shared systems with CSE. Neural network and Python libraries are pre-installed in Lab 5. Keep standard virtual environment setups."}
                  {selectedDept === 'AIDS' && "Shared blocks. Focus on database schemas, SQL normalizations, and data science electives early in semesters."}
                  {!['IT','CSE','ECE','EEE','Mechanical','AIML','AIDS'].includes(selectedDept) && "Autonomous syllabus has specific electives. Ask senior representatives for previous semester question sheets."}
                </p>
              </div>

              <div className="bg-gradient-to-br from-violet-600 to-violet-850 text-white p-5 rounded-2xl space-y-2.5 shadow-sm">
                <h4 className="text-xs font-black uppercase text-yellow-300 tracking-widest flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-yellow-200" />
                  <span>Official Class Circles</span>
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-100">
                  For real-time semester announcements, study kits, and OD coordination, coordinate with your class representative for private group links.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
