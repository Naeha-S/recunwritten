import React from 'react';
import { Post, Comment } from '../types';
import { MessageSquare, ArrowUp, Send, User, ChevronDown, ChevronUp, Share2, CornerDownRight, Bookmark, AlertTriangle } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onUpvote: (id: string) => void;
  onAddComment: (postId: string, commentAuthor: string, isAnonymous: boolean, content: string) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  onReportPost?: (postId: string, reason: string) => Promise<void>;
  key?: string;
}

export default function PostCard({ 
  post, 
  onUpvote, 
  onAddComment, 
  isBookmarked = false, 
  onToggleBookmark,
  onReportPost
}: PostCardProps) {
  const [upvoted, setUpvoted] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const [newComment, setNewComment] = React.useState('');
  const [commentAuthor, setCommentAuthor] = React.useState('');
  const [commentAnonymous, setCommentAnonymous] = React.useState(true);
  const [isCopied, setIsCopied] = React.useState(false);

  // Community Reporting inline drawer states
  const [showReportForm, setShowReportForm] = React.useState(false);
  const [reportReason, setReportReason] = React.useState('');
  const [reportCategory, setReportCategory] = React.useState('Spam');
  const [reportSuccess, setReportSuccess] = React.useState(false);
  const [isReporting, setIsReporting] = React.useState(false);

  const wordCount = (post.title + " " + post.content).trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleUpvote = () => {
    onUpvote(post.id);
    setUpvoted(!upvoted);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const author = commentAnonymous ? 'Anonymous Student' : (commentAuthor ? commentAuthor : 'RECian');
    onAddComment(post.id, author, commentAnonymous, newComment.trim());
    setNewComment('');
  };

  const shareLink = () => {
    const postUrl = `${window.location.origin}/#post-${post.id}`;
    navigator.clipboard.writeText(postUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2050);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setIsReporting(true);
    try {
      if (onReportPost) {
        await onReportPost(post.id, `[${reportCategory}] ${reportReason.trim()}`);
      }
      setReportSuccess(true);
      setReportReason('');
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportForm(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to submit student report", err);
    } finally {
      setIsReporting(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'discussion': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'notes': return 'bg-emerald-55 text-emerald-705 border-emerald-200';
      case 'elective': return 'bg-blue-50 text-blue-707 border-blue-200';
      case 'announcement': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <article 
      className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all space-y-4 relative" 
      id={`post-card-${post.id}`}
    >
      {/* Top information metadata */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className={`px-2 py-0.5 border rounded-full text-[10.5px] font-bold uppercase tracking-wide ${getCategoryColor(post.category)}`}>
          {post.category}
        </span>
        
        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
          {post.department === 'general' ? '🏫 General' : `👥 Dept: ${post.department}`}
        </span>

        {(post.quality === 'Helpful' || post.isAiVerified) && (
          <span className="flex items-center gap-1 bg-emerald-550 border border-emerald-400 text-white font-extrabold text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-2xs">
            ✨ High Quality
          </span>
        )}

        <span className="text-slate-300">•</span>
        <div className="flex items-center space-x-1">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{post.isAnonymous ? 'Anonymously Contributed' : post.authorName}</span>
          {post.authorRole && (
            <span className={`ml-1 inline-flex items-center px-1.5 py-0.1 rounded text-[9.5px] font-extrabold uppercase tracking-tight ${
              post.authorRole === 'Faculty' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              post.authorRole === 'Alumni' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
              post.authorRole === 'Senior' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
              'bg-slate-100 text-slate-700 border border-slate-200/50'
            }`}>
              {post.authorRole === 'Faculty' ? '🧑‍🏫 Faculty' :
               post.authorRole === 'Alumni' ? '🎓 Alumni' :
               post.authorRole === 'Senior' ? '💪 Senior' :
               '🎓 Student'}
            </span>
          )}
        </div>
        <span className="text-slate-300">•</span>
        <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        <span className="text-slate-300">•</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold bg-slate-55 px-1.5 py-0.5 rounded border border-slate-200/30">
          ⏱️ {readingTime} {readingTime === 1 ? 'min' : 'mins'} read
        </span>
      </div>

      {/* Post Title */}
      <div>
        <h3 className="font-sans font-extrabold text-base text-slate-900 leading-snug tracking-tight hover:text-violet-700 transition-colors">
          {post.title}
        </h3>
      </div>

      {/* Post Description / Content */}
      <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-lg border border-slate-100">
        {post.content}
      </div>

      {/* Tags section */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-[11px] bg-slate-100/60 hover:bg-slate-200/50 text-slate-600 px-2 py-0.5 rounded cursor-pointer font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom bar for actions */}
      <div className="flex flex-wrap gap-2 items-center justify-between pt-3 border-t border-slate-100/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Upvote Button with Purple Accent */}
          <button
            onClick={handleUpvote}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              upvoted 
                ? 'bg-violet-700 text-white shadow-sm' 
                : 'bg-slate-50 hover:bg-violet-50 text-slate-700 hover:text-violet-700 border border-slate-200/50'
            }`}
            id={`post-upvote-${post.id}`}
          >
            <ArrowUp className={`w-4 h-4 transition-transform ${upvoted ? 'scale-110' : ''}`} />
            <span>Helpful ({post.upvotes})</span>
          </button>

          {/* Comment triggers */}
          <button
            onClick={() => {
              setShowComments(!showComments);
              setShowReportForm(false);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all bg-slate-50 border border-slate-200/50 text-slate-600 hover:bg-slate-100`}
            id={`post-comment-toggle-${post.id}`}
          >
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>Comments ({post.comments.length})</span>
            {showComments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark && onToggleBookmark(post.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all border ${
              isBookmarked 
                ? 'bg-amber-50 text-amber-900 border-amber-200' 
                : 'bg-slate-50 hover:bg-amber-50 border-slate-200/50 text-slate-600 hover:text-amber-800'
            }`}
            id={`post-bookmark-${post.id}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-450 text-amber-500 animate-pulse' : 'text-slate-400'}`} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-1">
          {/* Report Button */}
          <button 
            onClick={() => {
              setShowReportForm(!showReportForm);
              setShowComments(false);
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-transparent transition-all font-medium ${
              showReportForm 
                ? 'text-rose-600 bg-rose-50/50' 
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>

          {/* Share Button with feedback */}
          <button 
            onClick={shareLink}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50 font-medium"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isCopied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Report Flag panels */}
      {showReportForm && (
        <div className="pt-4 border-t border-rose-100 bg-rose-50/20 p-4 rounded-xl mt-2 animate-fade-in" id={`report-panel-${post.id}`}>
          {reportSuccess ? (
            <div className="text-center py-4 space-y-1.5">
              <span className="text-lg">🛡️</span>
              <p className="text-xs font-bold text-rose-800 font-sans">Report Submitted Successfully!</p>
              <p className="text-[10.5px] text-rose-700/80 leading-relaxed font-sans font-normal max-w-md mx-auto">
                Thank you. We have filed standard case logs and alerted the Rajalakshmi Senior Moderation Circle. The post will be audited for violations immediately.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div className="flex justify-between items-center pb-1">
                <h4 className="text-[10.5px] font-black text-rose-700 uppercase tracking-widest flex items-center space-x-1.5 font-sans">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Flag this intel for Student Review</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-tight block mb-1">Violation Type</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500 focus:outline-none text-slate-700"
                  >
                    <option value="Spam">Spam or Repetitive</option>
                    <option value="Harassment">Harassment / Names</option>
                    <option value="Confession">Confession / Love slop</option>
                    <option value="False Info">False Academics</option>
                    <option value="Offensive">Offensive content</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-tight block mb-1">Detailed Explanation</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Why do you find this entry inappropriate?"
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none text-slate-850"
                    />
                    <button
                      type="submit"
                      disabled={isReporting || !reportReason.trim()}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-all font-sans cursor-pointer whitespace-nowrap"
                    >
                      {isReporting ? 'Submitting...' : 'File Flag'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Expandable comments drawer */}
      {showComments && (
        <div className="pt-4 border-t border-slate-100 space-y-4 bg-slate-5/50 p-4 rounded-xl mt-2" id={`post-comments-container-${post.id}`}>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-1">
            <CornerDownRight className="w-4 h-4 text-violet-500" />
            <span>Discussion Thread ({post.comments.length} comments)</span>
          </h4>

          {/* Comments List */}
          <div className="space-y-3 max-h-76 overflow-y-auto">
            {post.comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 pl-6 font-sans font-normal">No unwritten comments yet. Be the first to contribute anonymously details!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs space-y-1 ml-4 relative">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700 flex items-center space-x-1">
                      <span className="font-mono text-xs text-violet-600 font-black">@</span>
                      <span>{comment.isAnonymous ? 'Anonymous Student' : comment.authorName}</span>
                    </span>
                    <span>{new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed pl-1">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-2 mt-4 pt-3 border-t border-slate-200/55">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder={commentAnonymous ? 'Replying anonymously...' : 'Your custom username...'}
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                disabled={commentAnonymous}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-700 sm:w-1/3"
              />
              
              <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={commentAnonymous}
                  onChange={(e) => setCommentAnonymous(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500 w-3.5 h-3.5"
                />
                <span>Post anonymously</span>
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your constructive reply/warning..."
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs tracking-tight focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-850"
                id={`new-comment-input-${post.id}`}
              />
              <button
                type="submit"
                className="px-3 py-2 bg-violet-750 hover:bg-violet-850 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
