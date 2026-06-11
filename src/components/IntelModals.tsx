import React from 'react';
import { Sparkles, Trash2, ShieldAlert, X, HelpCircle, Star } from 'lucide-react';
import { Post, Professor, PlacementExperience, InternshipExperience, SurvivalTip } from '../types';

interface AddIntelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<Post, 'id' | 'upvotes' | 'commentsCount' | 'comments' | 'createdAt'>) => void;
  defaultDept?: string;
  studentDept?: string;
}

export function AddIntelModal({ isOpen, onClose, onSubmit, defaultDept = 'general', studentDept }: AddIntelModalProps) {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [department, setDepartment] = React.useState(defaultDept);
  const [category, setCategory] = React.useState<Post['category']>('News');
  const [tagsInput, setTagsInput] = React.useState('');
  const [authorName, setAuthorName] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(true);
  const [authorRole, setAuthorRole] = React.useState<'Senior' | 'Alumni' | 'Faculty' | 'Student'>('Student');

  React.useEffect(() => {
    if (isOpen) {
      if (defaultDept && defaultDept !== 'general') {
        setDepartment(defaultDept);
      } else if (studentDept && studentDept !== 'Other' && studentDept !== 'general') {
        setDepartment(studentDept);
      } else {
        setDepartment('general');
      }
    }
  }, [isOpen, defaultDept, studentDept]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      department,
      category,
      tags,
      authorName: isAnonymous ? 'Anonymous Student' : (authorName.trim() || 'REC Student'),
      isAnonymous,
      authorRole
    });

    // Reset Form
    setTitle('');
    setContent('');
    setTagsInput('');
    setAuthorName('');
    setIsAnonymous(true);
    setAuthorRole('Student');
    onClose();
  };

  const DEPARTMENTS = ['general', 'IT', 'CSE', 'AIML', 'AIDS', 'CSBS', 'ECE', 'EEE', 'Mechanical', 'Robotics', 'Other'];

  const allowedDepartments = React.useMemo(() => {
    if (!studentDept || studentDept === 'Other' || studentDept === 'general') {
      return DEPARTMENTS;
    }
    // Only allow general and their respective department
    return DEPARTMENTS.filter(d => d.toLowerCase() === 'general' || d.toLowerCase() === studentDept.toLowerCase());
  }, [studentDept]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-violet-50/50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-violet-700 font-extrabold" />
            <h3 className="font-sans font-bold text-slate-850">Post Code-Orange Student Guide</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-medium text-slate-700 flex-1 overflow-y-auto">
          {/* Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-start space-x-2">
            <span className="font-bold shrink-0">ℹ️ Anonymous Protection</span>
            <p className="text-[10.5px] leading-relaxed font-sans font-normal">
              Your real identity is never saved in our client logs. Choose "Post anonymously" to post safely without administrators or external authorities checking your backlogs or attendance record.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Catchy Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., How to pass CAT-1 math paper with copies from 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal focus:ring-2 focus:ring-violet-500 focus:outline-none focus:bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Target Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-normal text-slate-800 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                {allowedDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'general' ? '🏫 General / Everyone' : `${dept} Department`}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Intel Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-normal text-slate-800 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                <option value="Tips">💡 Tips & Tricks</option>
                <option value="News">📰 Campus News</option>
                <option value="Announcements">📢 Announcements</option>
                <option value="Misc">📦 Miscellaneous</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Your Academic/Contributor Role *</label>
            <select
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-normal text-slate-800 focus:ring-2 focus:ring-violet-500 focus:outline-none"
            >
              <option value="Student">🎓 Student (Regular / Junior)</option>
              <option value="Senior">🧑‍💻 Senior Student</option>
              <option value="Alumni">🎓 Alumni / Passed-out Graduate</option>
              <option value="Faculty">🧑‍🏫 Faculty / Professor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">What is the secret or recommendation? *</label>
            <textarea
              required
              rows={4}
              placeholder="Write detailed recommendations or survival tips about lab logs, exams, bus routes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal focus:ring-2 focus:ring-violet-500 focus:outline-none text-slate-800 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g., notes, placement, Muffins, ECE2026"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal focus:ring-2 focus:ring-violet-500 text-slate-800"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">Stay Anonymous</span>
              </label>
              <span className="text-[10px] text-slate-400">Perfect for strict secrets!</span>
            </div>

            {!isAnonymous && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Alias/Name to display</label>
                <input
                  type="text"
                  placeholder="e.g., Sanjay_IT_Senior"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal focus:ring-2 focus:ring-violet-500 text-slate-800"
                />
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-700 hover:bg-violet-850 text-white rounded-lg text-xs font-bold shadow-sm border-b-2 border-violet-900"
            >
              Publish Anonymously
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PROFESSOR REVIEW MODAL
interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  professors: Professor[];
  onSubmit: (profId: string, newProfName: string, department: string, review: {
    content: string;
    teaching: number;
    strictness: number;
    attendance: number;
    ease: number;
    isAnonymous: boolean;
    authorName: string;
  }) => void;
}

export function AddReviewModal({ isOpen, onClose, professors, onSubmit }: AddReviewModalProps) {
  const [profId, setProfId] = React.useState('new');
  const [newProfName, setNewProfName] = React.useState('');
  const [department, setDepartment] = React.useState('CSE');
  const [content, setContent] = React.useState('');
  
  // 1-5 metrics
  const [teaching, setTeaching] = React.useState(4);
  const [strictness, setStrictness] = React.useState(3);
  const [attendance, setAttendance] = React.useState(3);
  const [ease, setEase] = React.useState(4);

  const [authorName, setAuthorName] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (profId === 'new' && !newProfName.trim()) return;

    onSubmit(profId, newProfName.trim(), department, {
      content: content.trim(),
      teaching,
      strictness,
      attendance,
      ease,
      isAnonymous,
      authorName: isAnonymous ? 'Anonymous Student' : (authorName.trim() || 'RECian')
    });

    // Reset Form
    setProfId('new');
    setNewProfName('');
    setContent('');
    setTeaching(4);
    setStrictness(3);
    setAttendance(3);
    setEase(4);
    setAuthorName('');
    setIsAnonymous(true);
    onClose();
  };

  const DEPARTMENTS = ['CSE', 'IT', 'AIML', 'AIDS', 'CSBS', 'ECE', 'EEE', 'Mechanical', 'Robotics', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-violet-50/50">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-sans font-bold text-slate-850">Submit Anonymous Professor Review</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-medium text-slate-700 flex-1 overflow-y-auto">
          {/* Professor Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Professor *</label>
            <select
              value={profId}
              onChange={(e) => setProfId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-normal text-slate-850"
            >
              <option value="new">+ Review a New Professor (Not listed yet)</option>
              {professors.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.department})</option>
              ))}
            </select>
          </div>

          {profId === 'new' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Professor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dr. R. Subramanian"
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-xs font-normal focus:outline-none focus:bg-white text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Professor Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-md bg-white text-xs font-normal text-slate-800"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Ratings grid */}
          <div className="space-y-3 p-4 bg-violet-50/30 rounded-lg border border-violet-100/60">
            <h4 className="text-xs font-extrabold text-violet-800 uppercase tracking-widest mb-1">RATING SCALES</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex justify-between font-bold text-slate-600 text-[11px] mb-1">
                  <span>Teaching Quality</span>
                  <span className="text-violet-700 font-mono">{teaching}/5</span>
                </label>
                <input
                  type="range" min="1" max="5" value={teaching}
                  onChange={(e) => setTeaching(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <p className="text-[9.5px] text-slate-400 mt-0.5">1: Terrible, 5: Best conceptual tutor</p>
              </div>

              <div>
                <label className="flex justify-between font-bold text-slate-600 text-[11px] mb-1">
                  <span>Strictness Level</span>
                  <span className="text-violet-700 font-mono">{strictness}/5</span>
                </label>
                <input
                  type="range" min="1" max="5" value={strictness}
                  onChange={(e) => setStrictness(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <p className="text-[9.5px] text-slate-400 mt-0.5">1: Sells jokes, 5: Prison warden</p>
              </div>

              <div>
                <label className="flex justify-between font-bold text-slate-600 text-[11px] mb-1">
                  <span>Attendance Margin</span>
                  <span className="text-violet-700 font-mono">{attendance}/5</span>
                </label>
                <input
                  type="range" min="1" max="5" value={attendance}
                  onChange={(e) => setAttendance(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <p className="text-[9.5px] text-slate-400 mt-0.5">1: Ignores 75%, 5: Logs absent down to second</p>
              </div>

              <div>
                <label className="flex justify-between font-bold text-slate-600 text-[11px] mb-1">
                  <span>Easiness (Grades/Internal)</span>
                  <span className="text-violet-700 font-mono">{ease}/5</span>
                </label>
                <input
                  type="range" min="1" max="5" value={ease}
                  onChange={(e) => setEase(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <p className="text-[9.5px] text-slate-400 mt-0.5">1: Very dry grader, 5: Distributes marks like sweets</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-750 mb-1">Anonymous Student Testimony *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide comments on how to handle assignments, CAT question papers, exams, lab marks..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal focus:ring-2 focus:ring-violet-500 block text-slate-800"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-violet-605 focus:ring-violet-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">Stay Anonymous (Highly Recommended)</span>
              </label>
            </div>

            {!isAnonymous && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Display Alias</label>
                <input
                  type="text"
                  placeholder="e.g., Anon_ECE_Junior"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal focus:ring-2 focus:ring-violet-500 text-slate-800"
                />
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-700 hover:bg-violet-850 text-white rounded-lg text-xs font-bold shadow-sm border-b-2 border-violet-900"
            >
              Post Testimony Safely
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PLACEMENT EXPERIENCE MODAL
interface AddPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (experience: Omit<PlacementExperience, 'id' | 'upvotes' | 'createdAt'>) => void;
}

export function AddPlacementModal({ isOpen, onClose, onSubmit }: AddPlacementModalProps) {
  const [title, setTitle] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [role, setRole] = React.useState('');
  const [ctc, setCtc] = React.useState('');
  const [rounds, setRounds] = React.useState('');
  const [difficulty, setDifficulty] = React.useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [tips, setTips] = React.useState('');
  const [authorName, setAuthorName] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !rounds.trim()) return;

    onSubmit({
      title: title.trim(),
      company: company.trim(),
      role: role.trim() || 'Software Engineer',
      ctc: ctc.trim() || 'Unknown',
      rounds: rounds.trim(),
      difficulty,
      tips: tips.trim(),
      authorName: isAnonymous ? 'Anonymous Graduate' : (authorName.trim() || 'REC Alum'),
      isAnonymous
    });

    // Reset Form
    setTitle('');
    setCompany('');
    setRole('');
    setCtc('');
    setRounds('');
    setDifficulty('Medium');
    setTips('');
    setAuthorName('');
    setIsAnonymous(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-violet-50/50">
          <div className="flex items-center space-x-2">
            <h3 className="font-sans font-bold text-slate-850">Share Placement Interview Experience</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-medium text-slate-700 flex-1 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-650 mb-1">Company Name *</label>
            <input
              type="text" required placeholder="e.g., Zoho, Amazon Chennai, Kaar Technologies"
              value={company} onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-650 mb-1">Role / Profile *</label>
              <input
                type="text" required placeholder="e.g., Associate ERP Consultant"
                value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-650 mb-1">CTC Proposed (LPA) *</label>
              <input
                type="text" required placeholder="e.g., 8.5 LPA"
                value={ctc} onChange={(e) => setCtc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-650 mb-1">Brief Title *</label>
            <input
              type="text" required placeholder="e.g., Zoho Developer Off-campus experience"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-650 mb-1">Rounds Description (Detailed Stages) *</label>
            <textarea
              required rows={3} placeholder="Explain what questions they asked in Round 1 (Online exam), Round 2 (Coding) and HR interviews..."
              value={rounds} onChange={(e) => setRounds(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Difficulty level</label>
              <select
                value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-650 mb-1">Specific Tips / Materials to study</label>
            <textarea
              rows={2} placeholder="Which books or LeetCode lists should be revised?"
              value={tips} onChange={(e) => setTips(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700">Submit Anonymously</span>
            </label>

            {!isAnonymous && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Your Alias</label>
                <input
                  type="text" placeholder="e.g., CSE_Placed_2025"
                  value={authorName} onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-700 hover:bg-violet-850 text-white rounded-lg text-xs font-bold"
            >
              Post Experience
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// INTERNSHIP POST MODAL
interface AddInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (intern: Omit<InternshipExperience, 'id' | 'upvotes' | 'createdAt'>) => void;
}

export function AddInternshipModal({ isOpen, onClose, onSubmit }: AddInternshipModalProps) {
  const [title, setTitle] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [stipend, setStipend] = React.useState('');
  const [department, setDepartment] = React.useState('IT');
  const [applicationProcess, setApplicationProcess] = React.useState('');
  const [referralTips, setReferralTips] = React.useState('');
  const [warning, setWarning] = React.useState('');
  const [skillsStr, setSkillsStr] = React.useState('');
  const [authorName, setAuthorName] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    const skillsRequired = skillsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onSubmit({
      title: title.trim(),
      company: company.trim(),
      stipend: stipend.trim() || 'Negotiable / Unpaid',
      applicationProcess: applicationProcess.trim(),
      referralTips: referralTips.trim(),
      warning: warning.trim(),
      skillsRequired,
      authorName: isAnonymous ? 'Anonymous Student' : (authorName.trim() || 'REC Student'),
      isAnonymous,
      department
    });

    // Reset Form
    setTitle('');
    setCompany('');
    setStipend('');
    setDepartment('IT');
    setApplicationProcess('');
    setReferralTips('');
    setWarning('');
    setSkillsStr('');
    setAuthorName('');
    setIsAnonymous(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-violet-50/50">
          <div className="flex items-center space-x-2">
            <h3 className="font-sans font-bold text-slate-850">Submit Internship Board Listing</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-medium text-slate-700 flex-1 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-650 mb-1">Internship Title *</label>
            <input
              type="text" required placeholder="e.g., Backend Developer Intern Experience"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-650 mb-1">Company Name *</label>
              <input
                type="text" required placeholder="e.g., Credence Startup"
                value={company} onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-650 mb-1">Monthly Stipend *</label>
              <input
                type="text" required placeholder="e.g., 15k / Month or Unpaid but great culture"
                value={stipend} onChange={(e) => setStipend(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-650 mb-1">Associated Department Circle *</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-800"
            >
              <option value="IT">Information Technology (IT)</option>
              <option value="CSE">Computer Science (CSE)</option>
              <option value="AIML">Artificial Intelligence & ML (AIML)</option>
              <option value="AIDS">Artificial Intelligence & DS (AIDS)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="EEE">Electrical & Electronics (EEE)</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Robotics">Robotics & Automation</option>
              <option value="CSBS">Computer Science & Business (CSBS)</option>
              <option value="Other">General / Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-650 mb-1">How did you apply? (Process details) *</label>
            <textarea
              required rows={2} placeholder="Describe the application process (LinkedIn, alumni referral, internship portal)..."
              value={applicationProcess} onChange={(e) => setApplicationProcess(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-650 mb-1">Scam Warnings / Dislikes</label>
            <input
              type="text" placeholder="e.g., Avoid training institutes asking for fees! / Heavy night shifts."
              value={warning} onChange={(e) => setWarning(e.target.value)}
              className="w-full px-3 py-2 border border-red-250 bg-red-50/20 text-red-700 placeholder-red-400 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-650 mb-1">Alumni Referral / Networking Tips</label>
              <input
                type="text" placeholder="e.g., Contact Mr. Ganesh (IT batch 23)"
                value={referralTips} onChange={(e) => setReferralTips(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-650 mb-1">Core Skills (Comma separated)</label>
              <input
                type="text" placeholder="e.g., AWS, React, Python, Node"
                value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700">Post Anonymously</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-700 hover:bg-violet-850 text-white rounded-lg text-xs font-bold"
            >
              Publish Intern Intel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// CAMPUS SURVIVAL GUIDE MODAL
interface AddSurvivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tip: Omit<SurvivalTip, 'id' | 'upvotes'>) => void;
}

export function AddSurvivalModal({ isOpen, onClose, onSubmit }: AddSurvivalModalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState<'printing' | 'food' | 'transport' | 'hostel' | 'hacks' | 'spots' | 'resources'>('food');
  const [authorName, setAuthorName] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      authorName: isAnonymous ? 'Anonymous Student' : (authorName.trim() || 'REC Student'),
      isAnonymous
    });

    setTitle('');
    setDescription('');
    setCategory('food');
    setAuthorName('');
    setIsAnonymous(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-100 max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-violet-50/50">
          <div className="flex items-center space-x-2">
            <h3 className="font-sans font-bold text-slate-850">Add Survival Hack / Camp Recommendation</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-medium text-slate-700 flex-1 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-650 mb-1">Survival Tip Title *</label>
            <input
              type="text" required placeholder="e.g., Hidden shortcut print shop behind Thandalam bus stop"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-normal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-65) mb-1">Select Category *</label>
            <select
              value={category} onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs"
            >
              <option value="food">🍱 Food & Snacks (Muffins, Green cabin, CCD)</option>
              <option value="printing">🖨️ Cheap Printing Shops & Bindings</option>
              <option value="transport">🚌 Bus Routes & Highway Hacks</option>
              <option value="hostel">🏠 Hostel & Day-scholar Survival</option>
              <option value="spots">🌳 Quiet Study & Laptop Spots</option>
              <option value="hacks">🔥 Attendance, OD & Lab Record Hacks</option>
              <option value="resources">📚 Semester Question Banks</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-650 mb-1">Detailed Hack Description *</label>
            <textarea
              required rows={4} placeholder="Write instructions, prices, locations, or warnings..."
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs leading-relaxed"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700">Submit Anonymously</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-violet-700 hover:bg-violet-850 text-white rounded-lg text-xs font-bold"
            >
              Add Survival Instinct
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
