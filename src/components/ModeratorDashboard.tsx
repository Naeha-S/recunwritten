import React from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  Mail, 
  Lock, 
  Unlock, 
  MessageSquare,
  Search,
  History,
  CornerDownRight,
  FileText,
  Bookmark,
  GraduationCap,
  Award,
  Compass
} from 'lucide-react';
import { ModerationRecord, AuditLog } from '../types';

interface ModeratorDashboardProps {
  records: ModerationRecord[];
  onDecision: (
    recordId: string, 
    decision: 'approved' | 'rejected_appeal' | 'dismissed_report' | 'removed_post', 
    notes: string
  ) => Promise<void>;
  studentEmail?: string;
}

export default function ModeratorDashboard({ 
  records, 
  onDecision, 
  studentEmail 
}: ModeratorDashboardProps) {
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'appealed' | 'blocked' | 'approved' | 'rejected_appeal' | 'reported'>('reported');
  const [selectedRecordId, setSelectedRecordId] = React.useState<string | null>(null);
  const [modNotes, setModNotes] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [showDemoPassInfo, setShowDemoPassInfo] = React.useState(true);

  // Selected Record
  const selectedRecord = React.useMemo(() => {
    return records.find(r => r.id === selectedRecordId) || null;
  }, [records, selectedRecordId]);

  // Set default selected record on tab change or initial mount
  React.useEffect(() => {
    const filtered = records.filter(r => {
      if (activeFilter === 'all') return true;
      return r.status === activeFilter;
    });
    if (filtered.length > 0 && !filtered.some(f => f.id === selectedRecordId)) {
      setSelectedRecordId(filtered[0].id);
    } else if (filtered.length === 0) {
      setSelectedRecordId(null);
    }
  }, [activeFilter, records]);

  // Metrics calculating
  const metrics = React.useMemo(() => {
    return {
      appealed: records.filter(r => r.status === 'appealed').length,
      blocked: records.filter(r => r.status === 'blocked').length,
      approved: records.filter(r => r.status === 'approved' || r.status === 'dismissed_report').length,
      rejected: records.filter(r => r.status === 'rejected_appeal' || r.status === 'removed_post').length,
      reported: records.filter(r => r.status === 'reported').length,
      total: records.length
    };
  }, [records]);

  // Filtered Records
  const filteredRecords = React.useMemo(() => {
    return records.filter(r => {
      const matchFilter = activeFilter === 'all' || r.status === activeFilter;
      const cleanSearch = searchQuery.toLowerCase().trim();
      const matchSearch = !cleanSearch || 
        r.title.toLowerCase().includes(cleanSearch) ||
        r.content.toLowerCase().includes(cleanSearch) ||
        r.studentEmail.toLowerCase().includes(cleanSearch) ||
        r.contentType.toLowerCase().includes(cleanSearch);
      return matchFilter && matchSearch;
    });
  }, [records, activeFilter, searchQuery]);

  const handleExecuteDecision = async (decision: 'approved' | 'rejected_appeal' | 'dismissed_report' | 'removed_post') => {
    if (!selectedRecord) return;
    setActionLoading(true);
    try {
      await onDecision(selectedRecord.id, decision, modNotes);
      setModNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageSquare className="w-3.5 h-3.5 text-violet-600" />;
      case 'review': return <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />;
      case 'placement': return <Award className="w-3.5 h-3.5 text-amber-600" />;
      case 'internship': return <FileText className="w-3.5 h-3.5 text-teal-600" />;
      case 'survival': return <Compass className="w-3.5 h-3.5 text-sky-600" />;
      default: return <MessageSquare className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const currentOperator = studentEmail || "naeha.s.2024.it@rajalakshmi.edu.in";

  return (
    <div className="space-y-6 animate-fade-in" id="moderator-dashboard-container">
      
      {/* Intro Bannered Card */}
      <div className="bg-gradient-to-br from-violet-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg space-y-4 relative overflow-hidden" id="moderator-banner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-650/15 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-400 text-violet-950 p-1 rounded-lg">
                <ShieldCheck className="w-5 h-5 font-black" />
              </div>
              <h1 className="font-sans font-black text-white text-xl uppercase tracking-tight">
                Senior Moderation Circle <span className="text-yellow-400">&</span> Decision Room
              </h1>
            </div>
            <p className="text-slate-350 text-xs font-normal max-w-2xl font-sans leading-relaxed">
              Human review center for the unofficial <strong>Unwritten REC campus guild</strong>. Overrule false positives, audit appeal requests, and block repeat spammers or low-effort submissions of Rajalakshmi Engineering College.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 text-right self-start md:self-auto">
            <div className="text-[10px] uppercase font-mono tracking-widest text-slate-300">Logged Operator</div>
            <div className="text-xs font-black text-yellow-300 flex items-center gap-1 mt-0.5">
              <User className="w-3 h-3 text-yellow-300" />
              {currentOperator}
            </div>
          </div>
        </div>

        {showDemoPassInfo && (
          <div className="bg-yellow-400/10 border border-yellow-400/20 p-3 rounded-2xl flex items-start gap-2.5 text-yellow-100 text-xs">
            <Unlock className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Staff Override Access Granted (Demo Mode)</span>
              <p className="text-[11px] leading-relaxed text-yellow-200/90">
                You currently have full moderation authority to audit blocked posts. As a panel moderator, you can leave custom notes, reject appeals, or <strong>Approve & Overrule Decision</strong>, which will immediately publish and write the post to live student feeds.
              </p>
            </div>
            <button 
              onClick={() => setShowDemoPassInfo(false)}
              className="text-yellow-400 hover:text-white font-bold ml-auto pl-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Grid of counters/metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3" id="moderator-metrics-grid">
        <button
          onClick={() => setActiveFilter('reported')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'reported'
              ? 'bg-red-50 border-red-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2 text-red-600 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold font-sans">Student Reported</span>
          </div>
          <span className="text-2xl font-black text-red-700">{metrics.reported}</span>
        </button>

        <button
          onClick={() => setActiveFilter('appealed')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'appealed'
              ? 'bg-amber-50 border-amber-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2 text-amber-600 mb-1">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Appeals Pending</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{metrics.appealed}</span>
        </button>

        <button
          onClick={() => setActiveFilter('blocked')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'blocked'
              ? 'bg-rose-50 border-rose-200 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2 text-rose-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold font-sans">AI Blocked Entries</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{metrics.blocked}</span>
        </button>

        <button
          onClick={() => setActiveFilter('approved')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'approved'
              ? 'bg-emerald-50 border-emerald-200 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2 text-emerald-600 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold font-sans">Overridden / Passed</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{metrics.approved}</span>
        </button>

        <button
          onClick={() => setActiveFilter('rejected_appeal')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'rejected_appeal'
              ? 'bg-slate-55 border-slate-300 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2 text-slate-500 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold font-sans">Appeals Closed</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{metrics.rejected}</span>
        </button>

        <button
          onClick={() => setActiveFilter('all')}
          className={`p-4 rounded-2xl border text-left col-span-2 lg:col-span-1 transition-all ${
            activeFilter === 'all'
              ? 'bg-violet-50 border-violet-200 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center space-x-2 text-violet-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold font-sans">All Moderation Items</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{metrics.total}</span>
        </button>
      </div>

      {/* Main split work bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="moderator-workbench">
        
        {/* Left Col: Records List */}
        <div className="lg:col-span-5 space-y-4 flex flex-col h-[600px]" id="moderator-records-pane">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center space-x-2 shadow-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student email, title or text..."
              className="w-full bg-transparent focus:outline-none text-xs text-slate-800"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 flex-1 overflow-y-auto divide-y divide-slate-100 shadow-xs" id="moderator-scrollable-list">
            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2 select-none h-full flex flex-col justify-center items-center">
                <ShieldCheck className="w-8 h-8 text-slate-200" />
                <span className="text-xs font-semibold">No moderation records matching this filter</span>
                <p className="text-[10.5px] text-slate-400">Everything is clean or search constraints yielded zero rows.</p>
              </div>
            ) : (
              filteredRecords.map((rec) => {
                const isActive = rec.id === selectedRecordId;
                return (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRecordId(rec.id)}
                    className={`w-full text-left p-4 hover:bg-slate-50/50 transition-all flex flex-col gap-2 cursor-pointer ${
                      isActive ? 'bg-violet-50/40 border-l-4 border-violet-700' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between w-full font-mono text-[9px]">
                      <div className="flex items-center space-x-1.5 font-semibold text-slate-500">
                        {getContentTypeIcon(rec.contentType)}
                        <span className="uppercase tracking-tight bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                          {rec.contentType}
                        </span>
                      </div>
                      
                      {rec.status === 'appealed' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-tight flex items-center gap-0.5">
                          ⏳ Appeal Filed
                        </span>
                      )}
                      {rec.status === 'reported' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-red-105 text-red-700 font-bold uppercase tracking-tight flex items-center gap-0.5 animate-pulse">
                          ⚠️ Reported
                        </span>
                      )}
                      {rec.status === 'blocked' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold uppercase tracking-tight">
                          🚫 blocked
                        </span>
                      )}
                      {rec.status === 'approved' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-tight">
                          ✅ Passed
                        </span>
                      )}
                      {rec.status === 'dismissed_report' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-850 font-bold uppercase tracking-tight">
                          🛡️ Report Closed
                        </span>
                      )}
                      {rec.status === 'removed_post' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold uppercase tracking-tight">
                          🗑️ Post Removed
                        </span>
                      )}
                      {rec.status === 'rejected_appeal' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase tracking-tight">
                          ❌ Appeal Denied
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-semibold text-xs text-slate-900 line-clamp-1 font-sans">{rec.title || "Untitled Submission"}</h4>
                      <p className="text-slate-500 text-[10.5px] line-clamp-2 leading-relaxed font-sans font-normal">{rec.content}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono font-normal">
                      <span className="truncate max-w-[150px]" title={rec.studentEmail}>{rec.studentEmail.split('@')[0]}</span>
                      <span>{new Date(rec.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Inspection details */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col h-[600px]" id="moderator-detail-inspector">
          {selectedRecord ? (
            <div className="flex flex-col h-full divide-y divide-slate-100">
              
              {/* Box Header */}
              <div className="p-5 bg-slate-50/50 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-violet-100 text-violet-800 rounded">
                      Case: {selectedRecord.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(selectedRecord.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-sans font-black text-slate-950 text-base leading-tight">
                    {selectedRecord.title || "Untitled Submission"}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Author</span>
                  <span className="text-xs font-bold text-slate-700 font-sans block">
                    {selectedRecord.authorName} {selectedRecord.isAnonymous && <span className="text-[10px] text-rose-500 font-normal italic">(Anon)</span>}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono italic truncate max-w-[180px] block" title={selectedRecord.studentEmail}>
                    {selectedRecord.studentEmail}
                  </span>
                </div>
              </div>

              {/* Box Body: Content & AI Flags & Appeals */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                {/* Proposed Content */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-sans block">SUBMITTED INTEL CONTENT</span>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap select-text">
                    {selectedRecord.content}
                  </div>
                </div>

                {/* AI Block Reason */}
                <div className="bg-rose-50 border border-rose-250/50 rounded-2xl p-4 flex gap-3 text-xs text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-black text-rose-900 uppercase text-[10px] block tracking-tight font-sans">AI Flagging Policy Triggered</span>
                    <p className="font-normal font-sans text-rose-800 leading-relaxed">
                      {selectedRecord.blockedReason}
                    </p>
                  </div>
                </div>

                {/* Appeal Reason (If submitted) */}
                {selectedRecord.status === 'appealed' || selectedRecord.appealText ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs text-amber-900">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 text-amber-700" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-black text-amber-900 uppercase text-[10px] tracking-tight font-sans">STUDENT HUMAN REVIEW APPEAL</span>
                        {selectedRecord.appealCreatedAt && (
                          <span className="text-[9px] text-amber-750 font-normal font-mono">
                            Filed: {new Date(selectedRecord.appealCreatedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="font-normal italic text-slate-700 leading-relaxed font-sans p-2 bg-white/70 border border-amber-100 rounded-xl mt-1 select-text">
                        "{selectedRecord.appealText || "I want to request an official review for this blocked post."}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-[11px]">
                    No appeal filed yet for this item by the student.
                  </div>
                )}

                {/* Audit Trail History */}
                {selectedRecord.auditHistory && selectedRecord.auditHistory.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 font-sans block flex items-center gap-1">
                      <History className="w-3 h-3 text-slate-400" /> Case Audit Trail
                    </span>
                    <div className="space-y-3 pl-3 border-l border-slate-200">
                      {selectedRecord.auditHistory.map((log, index) => (
                        <div key={index} className="relative text-[11px] space-y-0.5">
                          {/* Anchor dot */}
                          <div className="absolute -left-[16px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                          
                          <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                            <span className="font-bold uppercase text-slate-600 font-sans tracking-tight">
                              {log.action === 'blocked' ? 'AI Block' :
                               log.action === 'submitted_appeal' ? 'Appeal Filed' :
                               log.action === 'approved' ? 'Override Passed' : log.action}
                            </span>
                            <span className="text-slate-400/80">•</span>
                            <span className="text-slate-400">{log.operator}</span>
                            <span className="text-slate-400/80">•</span>
                            <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-600 font-sans font-normal leading-relaxed pl-3 italic">
                            {log.notes}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Action and Decision Form */}
              {selectedRecord.status === 'reported' ? (
                <div className="p-5 bg-slate-50/50 space-y-4 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-sans">
                      MODERATOR REPORT AUDIT NOTES
                    </label>
                    <textarea
                      value={modNotes}
                      onChange={(e) => setModNotes(e.target.value)}
                      placeholder="Enter details on why the report is dismissed or why the post is being taken down..."
                      className="w-full text-xs font-sans p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-violet-500 focus:outline-none placeholder-slate-400 text-slate-800"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleExecuteDecision('dismissed_report')}
                      disabled={actionLoading}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer text-center h-10 flex items-center justify-center"
                    >
                      {actionLoading ? 'Saving...' : '🛡️ Dismiss Report (Keep Live)'}
                    </button>
                    
                    <button
                      onClick={() => handleExecuteDecision('removed_post')}
                      disabled={actionLoading}
                      className="flex-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer text-center h-10 flex items-center justify-center"
                    >
                      {actionLoading ? 'Saving...' : '🗑️ Remove Post from Feed'}
                    </button>
                  </div>
                </div>
              ) : selectedRecord.status === 'appealed' || selectedRecord.status === 'blocked' ? (
                <div className="p-5 bg-slate-50/50 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-sans">
                      MODERATOR DECISION AUDIT NOTES
                    </label>
                    <textarea
                      value={modNotes}
                      onChange={(e) => setModNotes(e.target.value)}
                      placeholder="Enter details on why you are overriding this AI decision, or explanation for why the appeal was rejected..."
                      className="w-full text-xs font-sans p-3 bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-violet-500 focus:outline-none placeholder-slate-400 text-slate-800"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleExecuteDecision('approved')}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer text-center"
                    >
                      {actionLoading ? 'Saving...' : '✅ Approve & Override (Deploy Content)'}
                    </button>
                    
                    <button
                      onClick={() => handleExecuteDecision('rejected_appeal')}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-center"
                    >
                      {actionLoading ? 'Saving...' : '❌ Deny appeal'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 text-center select-none text-[11px] text-slate-500 font-medium">
                  This decision has been finalized. Status is currently: 
                  <strong className="uppercase ml-1 text-violet-750">{selectedRecord.status}</strong>.
                  {selectedRecord.moderatorNotes && (
                    <p className="mt-1 text-slate-600 italic">"Notes: {selectedRecord.moderatorNotes}"</p>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2 select-none">
              <ShieldCheck className="w-12 h-12 text-slate-100 animate-pulse" />
              <span className="text-xs font-bold text-slate-500">No Case Record Inspected</span>
              <p className="text-[10.5px] text-slate-400 max-w-sm font-sans font-normal lead-relaxed">
                Choose a moderation log entry from the list panel to retrieve details, read filed student appeals, review AI moderation blocks, and execute human overrides.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
