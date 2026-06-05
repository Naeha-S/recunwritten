import React from 'react';
import { Post } from '../types';
import PostCard from './PostCard';
import { 
  MessageSquare, 
  HelpCircle, 
  Send, 
  Sparkles, 
  Filter, 
  ArrowUp, 
  Users, 
  CheckCircle, 
  AlertCircle,
  HelpCircle as QuestionIcon,
  PlusCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface ForumPageProps {
  posts: Post[];
  studentEmail?: string;
  studentDept?: string;
  searchQuery: string;
  onPostUpvote: (id: string) => void;
  onAddComment: (postId: string, commentAuthor: string, isAnonymous: boolean, content: string) => void;
  bookmarkedPosts: string[];
  onToggleBookmark: (id: string) => void;
  onSubmitQuestion: (title: string, content: string, department: string, tags: string[], isAnonymous: boolean, authorName: string, authorRole: 'Senior' | 'Alumni' | 'Faculty' | 'Student') => Promise<void>;
}

export default function ForumPage({
  posts,
  studentEmail = '',
  studentDept = 'general',
  searchQuery,
  onPostUpvote,
  onAddComment,
  bookmarkedPosts,
  onToggleBookmark,
  onSubmitQuestion
}: ForumPageProps) {
  // Question Composer States
  const [showComposer, setShowComposer] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [department, setDepartment] = React.useState(studentDept !== 'Other' ? studentDept : 'general');
  const [tagsInput, setTagsInput] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(true);
  const [authorName, setAuthorName] = React.useState('');
  const [authorRole, setAuthorRole] = React.useState<'Senior' | 'Alumni' | 'Faculty' | 'Student'>('Student');
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [successText, setSuccessText] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Filter & Sort States
  const [selectedDeptFilter, setSelectedDeptFilter] = React.useState<string>('All');
  const [sortBy, setSortBy] = React.useState<'newest' | 'upvotes' | 'discussed'>('newest');

  // Sync state defaults when tab opens or updates
  React.useEffect(() => {
    if (studentDept && studentDept !== 'Other') {
      setDepartment(studentDept);
    } else {
      setDepartment('general');
    }
  }, [studentDept]);

  // Handle Question Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    const titleTrimmed = title.trim();
    const contentTrimmed = content.trim();

    if (!titleTrimmed) {
      setErrorText('Please provide a descriptive question title.');
      return;
    }
    if (!contentTrimmed) {
      setErrorText('Please explain details about your question.');
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const actualAuthorName = isAnonymous 
        ? 'Anonymous Student' 
        : (authorName.trim() || 'RECian Student');

      await onSubmitQuestion(
        titleTrimmed,
        contentTrimmed,
        department,
        tags,
        isAnonymous,
        actualAuthorName,
        authorRole
      );

      // Reset form on success
      setTitle('');
      setContent('');
      setTagsInput('');
      setAuthorName('');
      setIsAnonymous(true);
      setAuthorRole('Student');
      setSuccessText('Your Reddit-style Q&A thread was dynamically posted! Students can now upvote and reply.');
      setShowComposer(false);
      
      // Auto-clear success message
      setTimeout(() => setSuccessText(null), 5000);
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to publish question. Code-moderation violation?');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort core mechanics
  const filteredAndSortedQuestions = React.useMemo(() => {
    // 1. Get all questions (category: 'Question')
    let qPosts = posts.filter(p => p.category === 'Question');

    // 2. Filter by selected department dropdown
    if (selectedDeptFilter !== 'All') {
      qPosts = qPosts.filter(p => p.department.toLowerCase() === selectedDeptFilter.toLowerCase());
    }

    // 3. Apply global search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      qPosts = qPosts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) || 
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // 4. Sort results
    if (sortBy === 'upvotes') {
      return [...qPosts].sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === 'discussed') {
      return [...qPosts].sort((a, b) => b.comments.length - a.comments.length);
    } else {
      return [...qPosts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  }, [posts, selectedDeptFilter, searchQuery, sortBy]);

  const DEPARTMENTS = ['general', 'IT', 'CSE', 'AIML', 'AIDS', 'CSBS', 'ECE', 'EEE', 'Mechanical', 'Robotics', 'Other'];

  return (
    <div className="space-y-6 animate-fadeIn" id="forum-page-root">
      {/* Platform Welcome Jumbotron banner with reddit accent */}
      <div className="bg-gradient-to-r from-orange-600 via-rose-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden select-none" id="forum-banner">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 scale-150">
          <MessageSquare className="w-64 h-64" />
        </div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-white/10" id="forum-accent-badge">
            <span className="animate-pulse text-amber-300">●</span>
            <span>r/unwritten_rec Q&A forum</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-none font-sans">
            The Anonymous Q&A Circle
          </h1>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans font-normal">
            Ask any questions regarding autonomous exam corrections, sneaky OD form approvals, laboratory credit shortcuts, bunk margins, or upcoming recruitment drives. Upvote helpful queries and thread your replies.
          </p>
        </div>
      </div>

      {successText && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-2.5 animate-fadeIn" id="forum-success-bar">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold leading-normal">{successText}</p>
        </div>
      )}

      {/* Main Forum Split Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Questions list & Composer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ask a Question Quick-access Bar */}
          {!showComposer ? (
            <div 
              onClick={() => setShowComposer(true)}
              className="bg-white border border-slate-200 hover:border-violet-300 rounded-2xl p-4 shadow-2xs hover:shadow-sm cursor-pointer flex items-center space-x-3 transition-all active:scale-[0.995]"
              id="forum-compose-trigger-bar"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                💬
              </div>
              <input 
                type="text"
                readOnly
                placeholder="What is your question? Ask r/unwritten_rec anonymously..."
                className="flex-1 bg-slate-50 border border-slate-100 hover:bg-slate-100/50 rounded-lg px-4 py-2 text-xs font-normal text-slate-700 cursor-pointer focus:outline-none"
              />
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs px-4 py-2 rounded-lg transition-colors shadow-2xs shrink-0 flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs"
              id="forum-compose-panel"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-sans font-black text-slate-900 text-sm flex items-center gap-2">
                  <QuestionIcon className="w-5 h-5 text-orange-600" />
                  <span>Draft your anonymous question</span>
                </h3>
                <button 
                  onClick={() => setShowComposer(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-bold leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-600">Question Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Any tips on how strict Dr. Ramesh evaluates CAT-1 Python papers?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal focus:ring-2 focus:ring-orange-500 focus:outline-none text-slate-800 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600">Target Department Circle *</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-normal text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>
                          {d === 'general' ? '🏫 General Campus Circle' : `r/${d.toLowerCase()} community`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600">Your Converted Contributor Role *</label>
                    <select
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-normal text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="Student">🎓 Regular Student</option>
                      <option value="Senior">🧑‍💻 Senior Student</option>
                      <option value="Alumni">🎓 Passed out Graduate / Alumni</option>
                      <option value="Faculty">🧑‍🏫 Faculty Representative</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600">Details / Background Context *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide depth, list professor names, mention the dates, or add details so other students can write accurate replies."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal focus:ring-2 focus:ring-orange-500 focus:outline-none text-slate-855 leading-relaxed bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., Python, CAT1, counseling, arrear, general"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal focus:ring-2 focus:ring-orange-500 text-slate-800 bg-white"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-700">Stay fully anonymous</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Guarantees safety under backup logs!</span>
                  </div>

                  {!isAnonymous && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <label className="block font-bold text-slate-600">Choose custom display name</label>
                      <input
                        type="text"
                        placeholder="e.g., CodeNinja_2027"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal focus:ring-2 focus:ring-orange-500 text-slate-800 bg-white"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-55 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Discard Draft
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-lg text-xs shadow-2xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Drafting...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Question</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Filtering controls line */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg">
                <Filter className="w-3.5 h-3.5 text-slate-450" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Circle:</span>
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="bg-transparent border-0 text-xs font-bold text-orange-600 uppercase focus:ring-0 focus:outline-none p-0 cursor-pointer pr-1"
                >
                  <option value="All" className="text-slate-800 font-sans font-semibold">👥 All Circles</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d} className="text-slate-800 font-sans font-semibold">r/{d.toLowerCase()}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-lg">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-0 text-xs font-bold text-violet-700 uppercase focus:ring-0 focus:outline-none p-0 cursor-pointer pr-1"
                >
                  <option value="newest" className="text-slate-800 font-sans font-semibold">⏰ Fresh Questions</option>
                  <option value="upvotes" className="text-slate-800 font-sans font-semibold">🔥 Top Voted</option>
                  <option value="discussed" className="text-slate-800 font-sans font-semibold">💬 Most Discussed</option>
                </select>
              </div>
            </div>

            <span className="text-[10.5px] font-mono text-slate-400 font-medium self-end sm:self-auto">
              Found {filteredAndSortedQuestions.length} threads
            </span>
          </div>

          {/* Q&A List */}
          <div className="space-y-4">
            {filteredAndSortedQuestions.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-xs font-bold text-slate-600">No matching Q&As reported yet</h3>
                <p className="text-[11.5px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Be the very first node to post a question under r/unwritten_rec! Let others help you clear up doubtful college protocols.
                </p>
                <button
                  onClick={() => setShowComposer(true)}
                  className="mt-2 text-xs font-black text-orange-600 hover:text-orange-700 underline"
                >
                  Click here to post first question →
                </button>
              </div>
            ) : (
              filteredAndSortedQuestions.map((post) => (
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

        </div>

        {/* RIGHT COLUMN: Sidebar widgets and rules */}
        <div className="space-y-6">
          
          {/* Rules widget */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-2xs">
            <h3 className="font-sans font-extrabold text-xs uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span>Forum Posting Rules</span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal font-sans font-normal">
              Unlike private group links, standard post rules are moderated to prevent toxic spam and preserve administrative safety labels.
            </p>
            <ul className="space-y-2 text-slate-600 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">1.</span>
                <span><strong>No names context:</strong> Do not attack junior students, faculty names, or class representatives personally.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">2.</span>
                <span><strong>Maintain Academic Focus:</strong> Questions should pertain to exams, projects, schedules, or placement advice. No gossip.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">3.</span>
                <span><strong>Anonymity Safeguard:</strong> We never audit student portal logs or capture real identities. Feel safe to write!</span>
              </li>
            </ul>
          </div>

          {/* Quick FAQ widget */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3.5 shadow-2xs">
            <h3 className="font-sans font-extrabold text-xs uppercase tracking-widest text-slate-400">
              ⚡ Q&A Quick FAQ
            </h3>
            
            <div className="space-y-2.5">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">Is this really anonymous?</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-normal">
                  Yes. By checking "Stay fully anonymous," neither your email nor identity is archived in standard collection databases.
                </p>
              </div>

              <div className="space-y-1 border-t border-slate-100 pt-2.5">
                <h4 className="text-xs font-bold text-slate-800">Can professors read this?</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-normal">
                  This platform is officially blocked on standard campus Wi-Fi routers. This makes it a secure safehaven for real student-built reviews.
                </p>
              </div>

              <div className="space-y-1 border-t border-slate-100 pt-2.5">
                <h4 className="text-xs font-bold text-slate-800">What are upvotes for?</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-normal">
                  Higher upvotes push critical questions to the top list, alerting seniors and alumni who can write accurate answers.
                </p>
              </div>
            </div>
          </div>

          {/* Prompt banner to explore departments */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-800 p-5 rounded-2xl text-white space-y-2 shadow-xs">
            <h4 className="text-xs font-black uppercase text-yellow-300 tracking-wider">
              Department Circles
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-100">
              Have department-specific questions like lab logs or CAT syllabus hints? Toggle standard department circles on the sidebar to get community help.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
