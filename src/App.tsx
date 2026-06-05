import React from 'react';
import { 
  getSavedPosts, savePosts,
  getSavedProfessors, saveProfessors,
  getSavedPlacements, savePlacements,
  getSavedInternships, saveInternships,
  getSavedSurvivalTips, saveSurvivalTips
} from './data/seedData';
import { 
  fetchCollectionFromFirestore, 
  writeDocumentToFirestore, 
  incrementDocUpvotesFirestore, 
  updatePostCommentsFirestore, 
  updateProfessorReviewsFirestore, 
  seedFirestoreDatabaseIfNecessary,
  updateModerationRecordFirestore,
  deleteDocumentFromFirestore
} from './lib/firebase';
import { Post, Professor, PlacementExperience, InternshipExperience, SurvivalTip, Comment, ModerationRecord } from './types';
import Header from './components/Header';
import { sanitizeInputText, checkTeenagersLoveOrPrank, parseStudentEmail, getPostCategoryGroup } from './lib/safety';
import Sidebar from './components/Sidebar';
import PostCard from './components/PostCard';
import FreshersPack from './components/FreshersPack';
import SurvivalSection from './components/SurvivalSection';
import ModeratorDashboard from './components/ModeratorDashboard';
import { verifyRateAndSpamLimit } from './lib/moderation';
import { 
  AddIntelModal, 
  AddReviewModal, 
  AddPlacementModal, 
  AddInternshipModal, 
  AddSurvivalModal 
} from './components/IntelModals';
import { 
  Star, 
  GraduationCap, 
  Sparkles, 
  MessageSquare, 
  ArrowUpRight, 
  BookOpen, 
  Plus, 
  MapPin, 
  Compass, 
  AlertTriangle, 
  TrendingUp,
  Award,
  Users,
  Search,
  CheckCircle,
  Clock,
  Heart,
  Bookmark,
  ShieldCheck,
  Lock,
  Mail,
  Key,
  Copy,
  Loader2,
  LogOut,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';
import DepartmentPage, { DEPARTMENTS_MOCKUP } from './components/DepartmentPage';
import ForumPage from './components/ForumPage';

export default function App() {
  // User Session Authentication State
  const [studentSession, setStudentSession] = React.useState<{ email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('rec_student_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Bookmarks Storage States (Personal Reading Library)
  const [bookmarkedPosts, setBookmarkedPosts] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rec_bookmarked_posts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedTips, setBookmarkedTips] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rec_bookmarked_tips');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Verification Gate Processing States
  const [authEmail, setAuthEmail] = React.useState('naeha.s.2024.it@rajalakshmi.edu.in'); // Prepopulated dynamically matching student context
  const [authOtp, setAuthOtp] = React.useState('');
  const [authStep, setAuthStep] = React.useState<'email' | 'otp'>('email');
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [sentOtp, setSentOtp] = React.useState<string | null>(null);
  const [authResendDetails, setAuthResendDetails] = React.useState<string | null>(null);
  const [authResendDispatched, setAuthResendDispatched] = React.useState<boolean | null>(null);

  // AI Moderation, Appeals & Rate Limiting States
  const [isModerating, setIsModerating] = React.useState(false);
  const [moderationAlert, setModerationAlert] = React.useState<{ id: string; title: string; reason: string; contentType: string } | null>(null);
  const [moderationRecords, setModerationRecords] = React.useState<ModerationRecord[]>([]);
  const [isAppealing, setIsAppealing] = React.useState(false);
  const [appealExplanationText, setAppealExplanationText] = React.useState("");
  const [appealSuccessTrigger, setAppealSuccessTrigger] = React.useState(false);
  const [rateLimitWarningText, setRateLimitWarningText] = React.useState<string | null>(null);

  // Resend Integration Playground States
  const [resendSubTab, setResendSubTab] = React.useState<'saved' | 'resend'>('saved');
  const [resendTestKey, setResendTestKey] = React.useState('');
  const [resendTestRecipient, setResendTestRecipient] = React.useState('naevaspam@gmail.com');
  const [resendTestSubject, setResendTestSubject] = React.useState('Hello World');
  const [resendTestHtml, setResendTestHtml] = React.useState('<p>Congrats on sending your <strong>first email</strong>!</p>');
  const [resendTestLoading, setResendTestLoading] = React.useState(false);
  const [resendTestResult, setResendTestResult] = React.useState<{ success: boolean; message: string; data?: any; error?: string } | null>(null);
  const [copiedCellId, setCopiedCellId] = React.useState<string | null>(null);

  // Primary States
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [professors, setProfessors] = React.useState<Professor[]>([]);
  const [placements, setPlacements] = React.useState<PlacementExperience[]>([]);
  const [internships, setInternships] = React.useState<InternshipExperience[]>([]);
  const [survivalTips, setSurvivalTips] = React.useState<SurvivalTip[]>([]);

  // Navigation / UI States
  const [currentTab, setCurrentTab] = React.useState<string>('feed');
  const [selectedDept, setSelectedDept] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  
  // Category filter state for Home Feed ('All', 'Tips', 'News', 'Announcements', 'Misc')
  const [feedCategoryFilter, setFeedCategoryFilter] = React.useState<string>('All');

  // Author's Role filter state for Home Feed ('All', 'Senior', 'Alumni', 'Faculty', 'Student')
  const [authorRoleFilter, setAuthorRoleFilter] = React.useState<string>('All');

  // Global theme state ('light' | 'midnight')
  const [theme, setTheme] = React.useState<'light' | 'midnight'>(() => {
    try {
      const saved = localStorage.getItem('rec_theme');
      return saved === 'midnight' ? 'midnight' : 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'midnight' ? 'light' : 'midnight';
    setTheme(nextTheme);
    try {
      localStorage.setItem('rec_theme', nextTheme);
    } catch (e) {
      console.warn("Could not save theme to localStorage:", e);
    }
  };

  React.useEffect(() => {
    if (theme === 'midnight') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  // Parse Student Email details
  const parsedEmailInfo = React.useMemo(() => {
    if (!studentSession?.email) return null;
    return parseStudentEmail(studentSession.email);
  }, [studentSession?.email]);

  const isRollNumber = parsedEmailInfo ? parsedEmailInfo.isRollNumber : false;

  const studentDept = React.useMemo(() => {
    if (!parsedEmailInfo) return undefined;
    if (parsedEmailInfo.isJunior && parsedEmailInfo.dept) {
      return parsedEmailInfo.dept;
    }
    // For seniors, fetch manual selection or fallback to 'Other'
    return studentSession?.manualDept || 'Other';
  }, [parsedEmailInfo, studentSession]);

  const handleUpdateManualDept = (newDept: string) => {
    if (studentSession) {
      setStudentSession({
        ...studentSession,
        manualDept: newDept
      });
    }
  };

  // Modals Open/Close States
  const [isAddIntelOpen, setIsAddIntelOpen] = React.useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = React.useState(false);
  const [isAddPlacementOpen, setIsAddPlacementOpen] = React.useState(false);
  const [isAddInternshipOpen, setIsAddInternshipOpen] = React.useState(false);
  const [isAddSurvivalOpen, setIsAddSurvivalOpen] = React.useState(false);

  // Load state on mount
  React.useEffect(() => {
    async function initFirebaseAndSync() {
      try {
        const initialP = getSavedPosts();
        const initialPr = getSavedProfessors();
        const initialPl = getSavedPlacements();
        const initialIt = getSavedInternships();
        const initialS_Tips = getSavedSurvivalTips();

        // Seed empty Firestore
        await seedFirestoreDatabaseIfNecessary(
          initialP,
          initialPr,
          initialPl,
          initialIt,
          initialS_Tips
        );

        // Load database sets
        const dbPosts = await fetchCollectionFromFirestore<Post>("posts");

        // Sync and ensure mock feed posts are decorated with appropriate authorRole values
        for (let post of dbPosts) {
          const match = initialP.find(p => p.id === post.id);
          if (match && !post.authorRole) {
            post.authorRole = match.authorRole;
            try {
              await writeDocumentToFirestore("posts", post);
            } catch (syncErr) {
              console.warn(`[FIREBASE SYNC] Failed to self-heal role for post ${post.id}:`, syncErr);
            }
          }
        }
        const dbProfessors = await fetchCollectionFromFirestore<Professor>("professors");
        const dbPlacements = await fetchCollectionFromFirestore<PlacementExperience>("placementExperiences");
        const dbInternships = await fetchCollectionFromFirestore<InternshipExperience>("internshipExperiences");
        const dbTips = await fetchCollectionFromFirestore<SurvivalTip>("survivalTips");
        let dbMod: ModerationRecord[] = [];
        try {
          dbMod = await fetchCollectionFromFirestore<ModerationRecord>("moderationRecords");
        } catch (e) {
          console.warn("Could not retrieve moderation records on mount.", e);
        }

        const sortedPosts = [...dbPosts].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const sortedPlacements = [...dbPlacements].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const sortedInternships = [...dbInternships].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const sortedMod = [...dbMod].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setPosts(sortedPosts);
        setProfessors(dbProfessors);
        setPlacements(sortedPlacements);
        setInternships(sortedInternships);
        setSurvivalTips(dbTips);
        setModerationRecords(sortedMod);
      } catch (err) {
        console.warn("[FIREBASE SYNC FALLBACK] Loaded fallback state.", err);
        setPosts(getSavedPosts());
        setProfessors(getSavedProfessors());
        setPlacements(getSavedPlacements());
        setInternships(getSavedInternships());
        setSurvivalTips(getSavedSurvivalTips());
        setModerationRecords([]);
      }
    }
    initFirebaseAndSync();
  }, []);

  // Globally track and synchronize URL hash/paths for true bookmarked link compatibility
  React.useEffect(() => {
    const syncURLRouteWithState = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (hash.startsWith('#/departments/')) {
        const routeCode = hash.replace('#/departments/', '').toUpperCase();
        const match = DEPARTMENTS_MOCKUP.find(
          d => d.code === routeCode || d.dbCode.toUpperCase() === routeCode
        );
        if (match) {
          setCurrentTab('departments');
          setSelectedDept(match.dbCode);
        }
      } else if (path.startsWith('/departments/')) {
        const routeCode = path.replace('/departments/', '').toUpperCase();
        const match = DEPARTMENTS_MOCKUP.find(
          d => d.code === routeCode || d.dbCode.toUpperCase() === routeCode
        );
        if (match) {
          setCurrentTab('departments');
          setSelectedDept(match.dbCode);
        }
      } else if (hash === '#/departments' || hash === '#departments' || path === '/departments') {
        setCurrentTab('departments');
        setSelectedDept(null);
      } else if (hash.startsWith('#/')) {
        const tabName = hash.replace('#/', '');
        const validTabs = ['feed', 'forum', 'professors', 'placements', 'internships', 'survival', 'bookmarks', 'freshers'];
        if (validTabs.includes(tabName)) {
          setCurrentTab(tabName);
        }
      }
    };

    window.addEventListener('hashchange', syncURLRouteWithState);
    syncURLRouteWithState(); // Run parse on initial browser mount

    return () => {
      window.removeEventListener('hashchange', syncURLRouteWithState);
    };
  }, []);

  // Sync state back to hash routes so bookmarks stay fresh
  React.useEffect(() => {
    if (currentTab === 'departments') {
      if (selectedDept) {
        const target = DEPARTMENTS_MOCKUP.find(d => d.dbCode === selectedDept);
        const urlCode = target ? target.code.toLowerCase() : selectedDept.toLowerCase();
        const targetHash = `#/departments/${urlCode}`;
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
      } else {
        if (window.location.hash !== '#/departments') {
          window.location.hash = `#/departments`;
        }
      }
    } else {
      const targetHash = `#/${currentTab}`;
      if (currentTab === 'feed') {
        if (window.location.hash.startsWith('#/')) {
          window.location.hash = '';
        }
      } else if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }
  }, [currentTab, selectedDept]);

  // Update localStorage when state changes
  const updatePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    savePosts(newPosts);
  };

  const updateProfessors = (newProfs: Professor[]) => {
    setProfessors(newProfs);
    saveProfessors(newProfs);
  };

  const updatePlacements = (newPlacements: PlacementExperience[]) => {
    setPlacements(newPlacements);
    savePlacements(newPlacements);
  };

  const updateInternships = (newInternships: InternshipExperience[]) => {
    setInternships(newInternships);
    saveInternships(newInternships);
  };

  const updateSurvivalTips = (newTips: SurvivalTip[]) => {
    setSurvivalTips(newTips);
    saveSurvivalTips(newTips);
  };

  // Synchronize dynamic student state changes to local storage
  React.useEffect(() => {
    if (studentSession) {
      localStorage.setItem('rec_student_session', JSON.stringify(studentSession));
    } else {
      localStorage.removeItem('rec_student_session');
    }
  }, [studentSession]);

  React.useEffect(() => {
    localStorage.setItem('rec_bookmarked_posts', JSON.stringify(bookmarkedPosts));
  }, [bookmarkedPosts]);

  React.useEffect(() => {
    localStorage.setItem('rec_bookmarked_tips', JSON.stringify(bookmarkedTips));
  }, [bookmarkedTips]);

  // Bookmarks Toggle Actions (Save for Later features)
  const handleTogglePostBookmark = (id: string) => {
    setBookmarkedPosts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleToggleTipBookmark = (id: string) => {
    setBookmarkedTips(prev => 
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  // Content Moderation API Checker via Gemini Endpoint
  const checkContentModeration = async (contentType: string, title: string, content: string): Promise<{ approved: boolean; quality?: 'Helpful' | 'Generic/Low-effort'; reason?: string }> => {
    setIsModerating(true);

    // 1. Client-side Check for Teenager Love / Pranks / Confessions
    const loveCheckTitle = checkTeenagersLoveOrPrank(title);
    if (loveCheckTitle.blocked) {
      setIsModerating(false);
      return { approved: false, reason: loveCheckTitle.reason || "Content flagged under teenager prank / love guidelines." };
    }
    const loveCheckContent = checkTeenagersLoveOrPrank(content);
    if (loveCheckContent.blocked) {
      setIsModerating(false);
      return { approved: false, reason: loveCheckContent.reason || "Content flagged under teenager prank / love guidelines." };
    }

    // 2. Client-side Fast Sanitization (SQL injection and XSS neutralization)
    const cleanTitle = sanitizeInputText(title);
    const cleanContent = sanitizeInputText(content);

    try {
      const res = await fetch('/api/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contentType, title: cleanTitle, content: cleanContent })
      });
      const data = await res.json();
      setIsModerating(false);
      if (data.success) {
        if (!data.approved) {
          return { approved: false, reason: data.reason || "Flagged content standards." }; // Rejected
        }
        return { approved: true, quality: data.quality };
      }
      return { approved: true, quality: "Generic/Low-effort" }; // Approved fallback
    } catch (err: any) {
      console.warn("Moderation API communication exception. Falling open for robust preview.", err);
      setIsModerating(false);
      return { approved: true, quality: "Generic/Low-effort" }; // Fall open with local parameters
    }
  };

  // Handle blocked submission logging and state triggering
  const handleBlockedSubmission = async (
    contentType: 'post' | 'review' | 'placement' | 'internship' | 'survival' | 'comment',
    title: string,
    content: string,
    authorName: string,
    isAnonymous: boolean,
    originalData: any,
    reason: string
  ) => {
    const recordId = `mod-rec-${Date.now()}`;
    const studentEmail = studentSession?.email || "student.demo@rajalakshmi.edu.in";
    const record: ModerationRecord = {
      id: recordId,
      contentType,
      title,
      content,
      authorName,
      isAnonymous,
      studentEmail,
      createdAt: new Date().toISOString(),
      blockedReason: reason || "Flagged by AI safety engine criteria.",
      status: 'blocked',
      originalData,
      auditHistory: [
        {
          timestamp: new Date().toISOString(),
          action: 'blocked',
          notes: `Content blocked by AI safety policies. Trigger: ${reason}`,
          operator: 'System AI'
        }
      ]
    };

    try {
      await writeDocumentToFirestore("moderationRecords", record);
      setModerationRecords(prev => [record, ...prev]);
    } catch (err) {
      console.warn("Failed to persistently write moderation log to firestore:", err);
    }

    setModerationAlert({
      id: recordId,
      title,
      reason: reason || "Flagged by AI policies.",
      contentType
    });
  };

  // Submit human appeal log changes
  const handleSubmitAppeal = async (recordId: string, appealText: string) => {
    if (!appealText.trim()) return;
    setIsAppealing(true);
    try {
      const dbMod = await fetchCollectionFromFirestore<ModerationRecord>("moderationRecords");
      const record = dbMod.find(r => r.id === recordId) || moderationRecords.find(r => r.id === recordId);
      if (record) {
        const updatedRecord: ModerationRecord = {
          ...record,
          status: 'appealed',
          appealText,
          appealCreatedAt: new Date().toISOString(),
          auditHistory: [
            ...record.auditHistory,
            {
              timestamp: new Date().toISOString(),
              action: 'submitted_appeal',
              notes: appealText,
              operator: studentSession?.email || "student.demo@rajalakshmi.edu.in"
            }
          ]
        };
        await updateModerationRecordFirestore(recordId, {
          status: 'appealed',
          appealText,
          appealCreatedAt: updatedRecord.appealCreatedAt,
          auditHistory: updatedRecord.auditHistory
        });
        
        setModerationRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r));
        setAppealSuccessTrigger(true);
      }
    } catch (err) {
      console.error("[APPEAL ERROR] Failure sending appeal audit log.", err);
    } finally {
      setIsAppealing(false);
    }
  };

  // Human Review Decision Dispatch (For Moderator Dashboard Overrides)
  const handleModeratorDecision = async (
    recordId: string,
    decision: 'approved' | 'rejected_appeal' | 'dismissed_report' | 'removed_post',
    modNotes: string
  ): Promise<void> => {
    const operator = studentSession?.email || "naeha.s.2024.it@rajalakshmi.edu.in";
    const record = moderationRecords.find(r => r.id === recordId);
    if (!record) return;

    const timestamp = new Date().toISOString();
    const updatedRecord: ModerationRecord = {
      ...record,
      status: decision,
      moderatorNotes: modNotes,
      auditHistory: [
        ...record.auditHistory,
        {
          timestamp,
          action: decision,
          notes: modNotes || (
            decision === 'approved' ? "Approved by moderator human review." : 
            decision === 'removed_post' ? "Removed offensive/inappropriate student intel." :
            decision === 'dismissed_report' ? "Report dismissed. Content remains active." :
            "Appeal closed by moderator."
          ),
          operator
        }
      ]
    };

    try {
      // 1. Update record in firestore
      await updateModerationRecordFirestore(recordId, {
        status: decision,
        moderatorNotes: modNotes,
        auditHistory: updatedRecord.auditHistory
      });

      // 2. Handle removal or approving of live report cases
      if (decision === 'removed_post') {
        const postId = record.originalData?.postId;
        if (postId) {
          setPosts(prev => prev.filter(p => p.id !== postId));
          await deleteDocumentFromFirestore("posts", postId);
        }
      }

      // 3. If APPROVED: insert original data in respective live databases & react layers
      if (decision === 'approved') {
        const oData = record.originalData;
        if (record.contentType === 'post') {
          const newPost: Post = {
            id: `post-${Date.now()}`,
            title: oData.title,
            content: oData.content,
            department: oData.department || 'general',
            category: oData.category || 'discussion',
            upvotes: 1,
            commentsCount: 0,
            authorName: oData.authorName,
            isAnonymous: oData.isAnonymous || false,
            createdAt: timestamp,
            tags: oData.tags || [],
            comments: [],
            quality: 'Helpful',
            isAiVerified: true
          };
          (newPost as any).studentEmail = record.studentEmail;
          setPosts(prev => [newPost, ...prev]);
          await writeDocumentToFirestore("posts", newPost);

        } else if (record.contentType === 'comment') {
          const postId = oData.postId;
          const post = posts.find(p => p.id === postId);
          if (post) {
            const newCommentObj: Comment = {
              id: `comm-${Date.now()}-${Math.random()}`,
              authorName: oData.authorName,
              isAnonymous: oData.isAnonymous || false,
              content: oData.content,
              createdAt: timestamp,
              upvotes: 0
            };
            const nextComments = [...post.comments, newCommentObj];
            setPosts(prev => prev.map(p => {
              if (p.id === postId) {
                return { ...p, comments: nextComments, commentsCount: nextComments.length };
              }
              return p;
            }));
            await updatePostCommentsFirestore(postId, nextComments);
          }

        } else if (record.contentType === 'review') {
          const profId = oData.profId;
          const newReview = {
            id: `rev-${Date.now()}`,
            content: oData.content,
            teaching: oData.teaching || 3,
            strictness: oData.strictness || 3,
            attendance: oData.attendance || 3,
            ease: oData.ease || 3,
            upvotes: 1,
            isAnonymous: oData.isAnonymous || false,
            authorName: oData.authorName,
            createdAt: timestamp
          };

          if (profId === 'new') {
            const parentId = `prof-${Date.now()}`;
            const newProf: Professor = {
              id: parentId,
              name: oData.profName || "Professor",
              department: oData.department || "Other",
              reviews: [newReview]
            };
            setProfessors(prev => [newProf, ...prev]);
            await writeDocumentToFirestore("professors", newProf);
          } else {
            const prof = professors.find(p => p.id === profId);
            if (prof) {
              const nextReviewsList = [newReview, ...prof.reviews];
              setProfessors(prev => prev.map(p => {
                if (p.id === profId) {
                  return { ...p, reviews: nextReviewsList };
                }
                return p;
              }));
              await updateProfessorReviewsFirestore(profId, nextReviewsList);
            }
          }

        } else if (record.contentType === 'placement') {
          const newPl: PlacementExperience = {
            id: `pl-${Date.now()}`,
            title: oData.title,
            company: oData.company,
            role: oData.role,
            ctc: oData.ctc || "",
            rounds: oData.rounds,
            difficulty: oData.difficulty || 'Medium',
            tips: oData.tips,
            authorName: oData.authorName,
            isAnonymous: oData.isAnonymous || false,
            createdAt: timestamp,
            upvotes: 1
          };
          (newPl as any).studentEmail = record.studentEmail;
          setPlacements(prev => [newPl, ...prev]);
          await writeDocumentToFirestore("placementExperiences", newPl);

        } else if (record.contentType === 'internship') {
          const newIt: InternshipExperience = {
            id: `it-${Date.now()}`,
            title: oData.title,
            company: oData.company,
            stipend: oData.stipend || "",
            applicationProcess: oData.applicationProcess,
            referralTips: oData.referralTips || "",
            warning: oData.warning || "",
            skillsRequired: oData.skillsRequired || [],
            authorName: oData.authorName,
            isAnonymous: oData.isAnonymous || false,
            createdAt: timestamp,
            upvotes: 1,
            department: oData.department
          };
          (newIt as any).studentEmail = record.studentEmail;
          setInternships(prev => [newIt, ...prev]);
          await writeDocumentToFirestore("internshipExperiences", newIt);

        } else if (record.contentType === 'survival') {
          const newTip: SurvivalTip = {
            id: `tip-${Date.now()}`,
            category: oData.category || 'hacks',
            title: oData.title,
            description: oData.content,
            upvotes: 1,
            authorName: oData.authorName,
            isAnonymous: oData.isAnonymous || false
          };
          (newTip as any).studentEmail = record.studentEmail;
          setSurvivalTips(prev => [newTip, ...prev]);
          await writeDocumentToFirestore("survivalTips", newTip);
        }
      }

      setModerationRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r));

    } catch (err) {
      console.error("[DECISION ERR] Executing moderator decision crashed.", err);
    }
  };

  // Upvote logic for posts
  const handlePostUpvote = (id: string) => {
    const post = posts.find(p => p.id === id);
    const currentUpvotes = post ? post.upvotes : 0;
    const updated = posts.map(post => {
      if (post.id === id) {
        return { ...post, upvotes: post.upvotes + 1 };
      }
      return post;
    });
    updatePosts(updated);
    incrementDocUpvotesFirestore("posts", id, currentUpvotes).catch(console.error);
  };

  // Submit raw student report
  const handleReportPost = async (postId: string, flagReason: string): Promise<void> => {
    const post = posts.find(p => p.id === postId);
    if (!post) {
      console.warn("Post not found for reporting:", postId);
      return;
    }

    const studentEmail = studentSession?.email || "anonymous.reporter@rajalakshmi.edu.in";
    const recordId = `mod-rec-report-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record: ModerationRecord = {
      id: recordId,
      contentType: 'post',
      title: post.title,
      content: post.content,
      authorName: post.authorName,
      isAnonymous: post.isAnonymous,
      studentEmail: studentEmail,
      createdAt: new Date().toISOString(),
      blockedReason: flagReason,
      status: 'reported',
      originalData: { postId },
      auditHistory: [
        {
          timestamp: new Date().toISOString(),
          action: 'reported',
          notes: `Flagged by Student: ${flagReason}`,
          operator: studentEmail
        }
      ]
    };

    try {
      await writeDocumentToFirestore("moderationRecords", record);
      setModerationRecords(prev => [record, ...prev]);
    } catch (err) {
      console.warn("Failed to persistently write report moderation log to firestore:", err);
    }
  };

  // Comment submittal link
  const handleAddComment = async (postId: string, commentAuthor: string, commentAnonymous: boolean, content: string) => {
    const cleanCommentAuthor = sanitizeInputText(commentAuthor);
    const cleanContent = sanitizeInputText(content);

    // Rate limiting & spam check
    const targetEmail = studentSession?.email || "anonymous@rajalakshmi.edu.in";
    const limitCheck = await verifyRateAndSpamLimit(targetEmail, `Comment on post ${postId}`, cleanContent);
    if (!limitCheck.allowed) {
      setRateLimitWarningText(limitCheck.reason || "Posting limit reached.");
      return;
    }

    const result = await checkContentModeration('comment', `Comment by ${cleanCommentAuthor || 'Student'}`, cleanContent);
    if (!result.approved) {
      await handleBlockedSubmission(
        'comment',
        `Comment on post`,
        cleanContent,
        cleanCommentAuthor,
        commentAnonymous,
        { postId, authorName: cleanCommentAuthor, content: cleanContent, isAnonymous: commentAnonymous },
        result.reason || "Flagged by AI policies."
      );
      return;
    }

    const newCommentObj: Comment = {
      id: `comm-${Date.now()}-${Math.random()}`,
      authorName: cleanCommentAuthor,
      isAnonymous: commentAnonymous,
      content: cleanContent,
      createdAt: new Date().toISOString(),
      upvotes: 0
    };

    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const nextComments = [...post.comments, newCommentObj];

    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: nextComments,
          commentsCount: nextComments.length
        };
      }
      return p;
    });
    updatePosts(updated);
    updatePostCommentsFirestore(postId, nextComments).catch(console.error);
  };

  // Upvote tip
  const handleUpvoteTip = (id: string) => {
    const tip = survivalTips.find(t => t.id === id);
    const currentUpvotes = tip ? tip.upvotes : 0;
    const updated = survivalTips.map(tip => {
      if (tip.id === id) {
        return { ...tip, upvotes: tip.upvotes + 1 };
      }
      return tip;
    });
    updateSurvivalTips(updated);
    incrementDocUpvotesFirestore("survivalTips", id, currentUpvotes).catch(console.error);
  };

  // Upvote placements
  const handleUpvotePlacement = (id: string) => {
    const pl = placements.find(p => p.id === id);
    const currentUpvotes = pl ? pl.upvotes : 0;
    const updated = placements.map(pl => {
      if (pl.id === id) {
        return { ...pl, upvotes: pl.upvotes + 1 };
      }
      return pl;
    });
    updatePlacements(updated);
    incrementDocUpvotesFirestore("placementExperiences", id, currentUpvotes).catch(console.error);
  };

  // Upvote internships
  const handleUpvoteInternship = (id: string) => {
    const it = internships.find(i => i.id === id);
    const currentUpvotes = it ? it.upvotes : 0;
    const updated = internships.map(it => {
      if (it.id === id) {
        return { ...it, upvotes: it.upvotes + 1 };
      }
      return it;
    });
    updateInternships(updated);
    incrementDocUpvotesFirestore("internshipExperiences", id, currentUpvotes).catch(console.error);
  };

  // Upvote professor review comments
  const handleReviewUpvote = (profId: string, reviewId: string) => {
    const prof = professors.find(p => p.id === profId);
    if (!prof) return;
    const nextReviews = prof.reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, upvotes: r.upvotes + 1 };
      }
      return r;
    });
    const updated = professors.map(prof => {
      if (prof.id === profId) {
        return {
          ...prof,
          reviews: nextReviews
        };
      }
      return prof;
    });
    updateProfessors(updated);
    updateProfessorReviewsFirestore(profId, nextReviews).catch(console.error);
  };

  // SUBMIT HANDLERS
  const handleAddIntelSubmit = async (newPostData: Omit<Post, 'id' | 'upvotes' | 'commentsCount' | 'comments' | 'createdAt'>) => {
    const cleanTitle = sanitizeInputText(newPostData.title);
    const cleanContent = sanitizeInputText(newPostData.content);
    const cleanAuthor = sanitizeInputText(newPostData.authorName);

    // Rate limiting & spam checks
    const targetEmail = studentSession?.email || "anonymous@rajalakshmi.edu.in";
    const limitCheck = await verifyRateAndSpamLimit(targetEmail, cleanTitle, cleanContent);
    if (!limitCheck.allowed) {
      setRateLimitWarningText(limitCheck.reason || "Posting limit reached.");
      return;
    }

    const result = await checkContentModeration('post', cleanTitle, cleanContent);
    if (!result.approved) {
      await handleBlockedSubmission(
        'post',
        cleanTitle,
        cleanContent,
        cleanAuthor,
        newPostData.isAnonymous || false,
        newPostData,
        result.reason || "Flagged by AI policies."
      );
      return;
    }

    const newPost: Post = {
      ...newPostData,
      title: cleanTitle,
      content: cleanContent,
      authorName: cleanAuthor,
      id: `post-${Date.now()}`,
      upvotes: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      comments: [],
      quality: result.quality || "Generic/Low-effort",
      isAiVerified: result.quality === "Helpful"
    };
    // Include studentEmail/authorEmail metadata for rate checks
    (newPost as any).studentEmail = targetEmail;

    updatePosts([newPost, ...posts]);
    writeDocumentToFirestore("posts", newPost).catch(console.error);
  };

  const handleAskQuestionSubmit = async (
    title: string,
    content: string,
    department: string,
    tags: string[],
    isAnonymous: boolean,
    authorName: string,
    authorRole: 'Senior' | 'Alumni' | 'Faculty' | 'Student'
  ) => {
    const cleanTitle = sanitizeInputText(title);
    const cleanContent = sanitizeInputText(content);
    const cleanAuthor = sanitizeInputText(authorName);

    // Rate limiting & spam checks
    const targetEmail = studentSession?.email || "anonymous@rajalakshmi.edu.in";
    const limitCheck = await verifyRateAndSpamLimit(targetEmail, cleanTitle, cleanContent);
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.reason || "Posting limit reached.");
    }

    const result = await checkContentModeration('post', cleanTitle, cleanContent);
    if (!result.approved) {
      const pData: any = {
        title: cleanTitle,
        content: cleanContent,
        department,
        category: 'Question',
        tags,
        isAnonymous,
        authorName: cleanAuthor,
        authorRole
      };
      await handleBlockedSubmission(
        'post',
        cleanTitle,
        cleanContent,
        cleanAuthor,
        isAnonymous,
        pData,
        result.reason || "Flagged by AI policies."
      );
      throw new Error(result.reason || "Flagged by AI policies.");
    }

    const newPost: Post = {
      title: cleanTitle,
      content: cleanContent,
      department,
      category: 'Question',
      tags,
      isAnonymous,
      authorName: cleanAuthor,
      authorRole,
      id: `post-${Date.now()}`,
      upvotes: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      comments: [],
      quality: result.quality || "Generic/Low-effort",
      isAiVerified: result.quality === "Helpful"
    };

    (newPost as any).studentEmail = targetEmail;

    updatePosts([newPost, ...posts]);
    await writeDocumentToFirestore("posts", newPost);
  };

  const handleAddReviewSubmit = async (
    profId: string, 
    newProfName: string, 
    department: string, 
    review: { content: string; teaching: number; strictness: number; attendance: number; ease: number; isAnonymous: boolean; authorName: string; }
  ) => {
    const cleanProfName = sanitizeInputText(newProfName);
    const cleanContent = sanitizeInputText(review.content);
    const cleanAuthor = sanitizeInputText(review.authorName);

    // Rate limiting & spam check
    const targetEmail = studentSession?.email || "anonymous@rajalakshmi.edu.in";
    const limitCheck = await verifyRateAndSpamLimit(targetEmail, `Review of ${cleanProfName || 'Professor'}`, cleanContent);
    if (!limitCheck.allowed) {
      setRateLimitWarningText(limitCheck.reason || "Posting limit reached.");
      return;
    }

    const result = await checkContentModeration('review', `Review of ${cleanProfName || 'Professor'}`, cleanContent);
    if (!result.approved) {
      await handleBlockedSubmission(
        'review',
        `Review of ${cleanProfName || 'Professor'}`,
        cleanContent,
        cleanAuthor,
        review.isAnonymous || false,
        { profId, profName: cleanProfName, department, ...review },
        result.reason || "Flagged by AI policies."
      );
      return;
    }

    const newReview = {
      ...review,
      content: cleanContent,
      authorName: cleanAuthor,
      id: `rev-${Date.now()}`,
      upvotes: 1,
      createdAt: new Date().toISOString()
    };

    if (profId === 'new') {
      const parentId = `prof-${Date.now()}`;
      const newProf: Professor = {
        id: parentId,
        name: cleanProfName,
        department,
        reviews: [newReview]
      };
      updateProfessors([newProf, ...professors]);
      writeDocumentToFirestore("professors", newProf).catch(console.error);
    } else {
      const prof = professors.find(p => p.id === profId);
      if (!prof) return;
      const nextReviewsList = [newReview, ...prof.reviews];
      const updated = professors.map(p => {
        if (p.id === profId) {
          return {
            ...p,
            reviews: nextReviewsList
          };
        }
        return p;
      });
      updateProfessors(updated);
      updateProfessorReviewsFirestore(profId, nextReviewsList).catch(console.error);
    }
  };

  const handleAddPlacementSubmit = async (newPlData: Omit<PlacementExperience, 'id' | 'upvotes' | 'createdAt'>) => {
    const cleanTitle = sanitizeInputText(newPlData.title);
    const cleanCompany = sanitizeInputText(newPlData.company);
    const cleanRole = sanitizeInputText(newPlData.role);
    const cleanRounds = sanitizeInputText(newPlData.rounds);
    const cleanTips = sanitizeInputText(newPlData.tips);
    const cleanAuthor = sanitizeInputText(newPlData.authorName);

    // Rate limiting & spam check
    const targetEmail = studentSession?.email || "anonymous@rajalakshmi.edu.in";
    const limitCheck = await verifyRateAndSpamLimit(targetEmail, cleanTitle, `${cleanRounds} ${cleanTips}`);
    if (!limitCheck.allowed) {
      setRateLimitWarningText(limitCheck.reason || "Posting limit reached.");
      return;
    }

    const result = await checkContentModeration('placement', cleanTitle, `${cleanRounds} \n\nTips: ${cleanTips}`);
    if (!result.approved) {
      await handleBlockedSubmission(
        'placement',
        cleanTitle,
        `${cleanRounds} \n\nTips: ${cleanTips}`,
        cleanAuthor,
        newPlData.isAnonymous || false,
        newPlData,
        result.reason || "Flagged by AI policies."
      );
      return;
    }

    const newPl: PlacementExperience = {
      ...newPlData,
      title: cleanTitle,
      company: cleanCompany,
      role: cleanRole,
      rounds: cleanRounds,
      tips: cleanTips,
      authorName: cleanAuthor,
      id: `pl-${Date.now()}`,
      upvotes: 1,
      createdAt: new Date().toISOString()
    };
    (newPl as any).studentEmail = targetEmail;

    updatePlacements([newPl, ...placements]);
    writeDocumentToFirestore("placementExperiences", newPl).catch(console.error);
  };

  const handleAddInternshipSubmit = async (newItData: Omit<InternshipExperience, 'id' | 'upvotes' | 'createdAt'>) => {
    const cleanTitle = sanitizeInputText(newItData.title);
    const cleanCompany = sanitizeInputText(newItData.company);
    const cleanStipend = sanitizeInputText(newItData.stipend);
    const cleanAppProcess = sanitizeInputText(newItData.applicationProcess);
    const cleanTips = sanitizeInputText(newItData.referralTips || "");
    const cleanWarning = sanitizeInputText(newItData.warning || "");
    const cleanAuthor = sanitizeInputText(newItData.authorName);

    // Rate limiting & spam check
    const targetEmail = studentSession?.email || "anonymous@rajalakshmi.edu.in";
    const limitCheck = await verifyRateAndSpamLimit(targetEmail, cleanTitle, `${cleanAppProcess} ${cleanWarning}`);
    if (!limitCheck.allowed) {
      setRateLimitWarningText(limitCheck.reason || "Posting limit reached.");
      return;
    }

    const result = await checkContentModeration('internship', cleanTitle, `${cleanAppProcess} \n\nWarning: ${cleanWarning}`);
    if (!result.approved) {
      await handleBlockedSubmission(
        'internship',
        cleanTitle,
        `${cleanAppProcess} \n\nWarning: ${cleanWarning}`,
        cleanAuthor,
        newItData.isAnonymous || false,
        newItData,
        result.reason || "Flagged by AI policies."
      );
      return;
    }

    const newIt: InternshipExperience = {
      ...newItData,
      title: cleanTitle,
      company: cleanCompany,
      stipend: cleanStipend,
      applicationProcess: cleanAppProcess,
      referralTips: cleanTips,
      warning: cleanWarning,
      authorName: cleanAuthor,
      id: `it-${Date.now()}`,
      upvotes: 1,
      createdAt: new Date().toISOString()
    };
    (newIt as any).studentEmail = targetEmail;

    updateInternships([newIt, ...internships]);
    writeDocumentToFirestore("internshipExperiences", newIt).catch(console.error);
  };

  const handleAddSurvivalSubmit = async (newTipData: Omit<SurvivalTip, 'id' | 'upvotes'>) => {
    const cleanTitle = sanitizeInputText(newTipData.title);
    const cleanDesc = sanitizeInputText(newTipData.description);
    const cleanAuthorName = sanitizeInputText(newTipData.authorName);

    // Rate limiting & spam check
    const targetEmail = studentSession?.email || "anonymous@rajalakshmi.edu.in";
    const limitCheck = await verifyRateAndSpamLimit(targetEmail, cleanTitle, cleanDesc);
    if (!limitCheck.allowed) {
      setRateLimitWarningText(limitCheck.reason || "Posting limit reached.");
      return;
    }

    const result = await checkContentModeration('survival', cleanTitle, cleanDesc);
    if (!result.approved) {
      await handleBlockedSubmission(
        'survival',
        cleanTitle,
        cleanDesc,
        cleanAuthorName,
        newTipData.isAnonymous || false,
        newTipData,
        result.reason || "Flagged by AI policies."
      );
      return;
    }

    const newTip: SurvivalTip = {
      ...newTipData,
      title: cleanTitle,
      description: cleanDesc,
      authorName: cleanAuthorName,
      id: `tip-${Date.now()}`,
      upvotes: 1
    };
    (newTip as any).studentEmail = targetEmail;

    updateSurvivalTips([newTip, ...survivalTips]);
    writeDocumentToFirestore("survivalTips", newTip).catch(console.error);
  };

  const handleResendTestEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendTestRecipient.trim()) return;
    setResendTestLoading(true);
    setResendTestResult(null);
    try {
      const response = await fetch('/api/resend/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: resendTestRecipient,
          subject: resendTestSubject,
          html: resendTestHtml,
          apiKey: resendTestKey
        })
      });
      const data = await response.json();
      setResendTestLoading(false);
      if (data.success) {
        setResendTestResult({
          success: true,
          message: data.message,
          data: data.data
        });
      } else {
        setResendTestResult({
          success: false,
          message: data.error || "Failed to dispatch email testing transmission."
        });
      }
    } catch (err: any) {
      setResendTestLoading(false);
      setResendTestResult({
        success: false,
        message: "Failed to communicate with Resend testing endpoint. Check connection or backend logs."
      });
    }
  };

  // Helper calculation for average ratings
  const getProfAggregates = (prof: Professor) => {
    if (prof.reviews.length === 0) return { teaching: 0, strictness: 0, attendance: 0, ease: 0 };
    const count = prof.reviews.length;
    const sums = prof.reviews.reduce((acc, r) => {
      acc.teaching += r.teaching;
      acc.strictness += r.strictness;
      acc.attendance += r.attendance;
      acc.ease += r.ease;
      return acc;
    }, { teaching: 0, strictness: 0, attendance: 0, ease: 0 });

    return {
      teaching: Math.round((sums.teaching / count) * 10) / 10,
      strictness: Math.round((sums.strictness / count) * 10) / 10,
      attendance: Math.round((sums.attendance / count) * 10) / 10,
      ease: Math.round((sums.ease / count) * 10) / 10
    };
  };

  // GLOBAL SEARCH & TAB FILTER LOGIC
  const getFilteredPosts = () => {
    let result = posts;
    if (currentTab === 'departments' && selectedDept) {
      result = result.filter(p => p.department.toLowerCase() === selectedDept.toLowerCase());
    }
    if (currentTab === 'feed' && feedCategoryFilter !== 'All') {
      if (feedCategoryFilter === 'AI-Verified') {
        result = result.filter(p => p.quality === 'Helpful' || p.isAiVerified);
      } else {
        result = result.filter(p => getPostCategoryGroup(p.category).toLowerCase() === feedCategoryFilter.toLowerCase());
      }
    }
    if (currentTab === 'feed' && authorRoleFilter !== 'All') {
      result = result.filter(p => p.authorRole === authorRoleFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) || 
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  };

  const getFilteredProfessors = () => {
    let result = professors;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(prof => 
        prof.name.toLowerCase().includes(q) || 
        prof.department.toLowerCase().includes(q) ||
        prof.reviews.some(r => r.content.toLowerCase().includes(q))
      );
    }
    return result;
  };

  const getFilteredPlacements = () => {
    let result = placements;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(pl => 
        pl.company.toLowerCase().includes(q) || 
        pl.role.toLowerCase().includes(q) || 
        pl.rounds.toLowerCase().includes(q) || 
        pl.tips.toLowerCase().includes(q)
      );
    }
    return result;
  };

  const getFilteredInternships = () => {
    let result = internships;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(it => 
        it.company.toLowerCase().includes(q) || 
        it.title.toLowerCase().includes(q) || 
        it.skillsRequired.some(s => s.toLowerCase().includes(q)) || 
        it.warning.toLowerCase().includes(q)
      );
    }
    return result;
  };

  // Trigger correct modal depending on selected view for intuitive UX
  const handleAnonymouslyPostIntelAction = () => {
    if (currentTab === 'professors') {
      setIsAddReviewOpen(true);
    } else if (currentTab === 'placements') {
      setIsAddPlacementOpen(true);
    } else if (currentTab === 'internships') {
      setIsAddInternshipOpen(true);
    } else if (currentTab === 'survival') {
      setIsAddSurvivalOpen(true);
    } else {
      setIsAddIntelOpen(true);
    }
  };

  // Verification Gate Check
  if (!studentSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-violet-500 selection:text-white" id="rajalakshmi-gate">
        <div className="max-w-md w-full bg-slate-850 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col">
          
          {/* Accent Glow Effects */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>

          {/* Logo Heading */}
          <div className="text-center space-y-3 relative z-10">
            <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-violet-900/40">
              <Lock className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-black text-white uppercase tracking-tight font-sans">
                Unwritten <span className="text-yellow-300 font-bold">REC</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Thandalam Student Gateway
              </p>
            </div>
          </div>

          <div className="my-6 border-t border-slate-800"></div>

          {/* Core flow message */}
          <div className="space-y-4 text-xs font-semibold text-slate-300">
            <div className="p-3.5 bg-slate-800/60 border border-slate-755 rounded-2xl space-y-1.5">
              <span className="text-white font-extrabold flex items-center text-xs">
                <ShieldCheck className="w-4 h-4 text-violet-400 mr-1.5" />
                Rajalakshmi Domain Gateway
              </span>
              <p className="text-[11px] leading-relaxed text-slate-400 font-sans font-normal">
                Access is strictly restricted to active students. Email address verification ending with <strong className="text-slate-200">@rajalakshmi.edu.in</strong> is required to decrypt unwritten advice.
              </p>
            </div>

            {authStep === 'email' ? (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!authEmail.trim()) return;
                  setAuthLoading(true);
                  setAuthError(null);
                  try {
                    const res = await fetch('/api/auth/send-otp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: authEmail })
                    });
                    const data = await res.json();
                    setAuthLoading(false);
                    if (data.success) {
                      setSentOtp(data.developmentOtp);
                      setAuthResendDispatched(data.resendDispatched);
                      setAuthResendDetails(data.resendDetails);
                      setAuthStep('otp');
                    } else {
                      setAuthError(data.error);
                    }
                  } catch (err: any) {
                    setAuthLoading(false);
                    setAuthError("Failed to communicate with authentication server. Check your connection.");
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Campus Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="naeha.s.2024.it@rajalakshmi.edu.in"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-normal transition-all text-slate-200"
                    />
                  </div>
                </div>

                {authError && (
                  <p className="text-red-300 text-[11px] leading-normal font-sans font-normal p-2.5 rounded-xl border border-rose-950 bg-rose-950/25">
                    ⚠️ {authError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-750 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending PIN...</span>
                    </>
                  ) : (
                    <span>Request Verification PIN</span>
                  )}
                </button>
              </form>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!authOtp.trim()) return;
                  setAuthLoading(true);
                  setAuthError(null);
                  try {
                    const res = await fetch('/api/auth/verify-otp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: authEmail, code: authOtp })
                    });
                    const data = await res.json();
                    setAuthLoading(false);
                    if (data.success && data.verified) {
                      setStudentSession({ email: data.email });
                    } else {
                      setAuthError(data.error);
                    }
                  } catch (err: any) {
                    setAuthLoading(false);
                    setAuthError("Failed to verify PIN. Please try again.");
                  }
                }}
                className="space-y-4"
              >
                {/* Simulated PIN code indicator inside sandbox */}
                {sentOtp && (
                  <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl space-y-2.5 text-[11px]" id="auth-sandbox-decryptor-panel">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold flex items-center text-amber-400">
                        <Key className="w-3.5 h-3.5 mr-1 animate-pulse" />
                        Sandbox PIN Decryptor
                      </p>
                      <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                        Mock / Live
                      </span>
                    </div>
                    <p className="font-normal font-sans leading-relaxed text-slate-300">
                      We generated an access code. If you are a reviewer, log in using this PIN: <strong className="text-white bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-xs">{sentOtp}</strong>
                    </p>

                    {/* Resend Status Box */}
                    <div className="pt-2 border-t border-slate-750 space-y-1">
                      <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wide">
                        Resend SMTP Delivery Node:
                      </span>
                      {authResendDispatched ? (
                        <p className="text-emerald-400 font-medium font-sans leading-relaxed text-[10.5px]">
                          ✓ Mail Sent: {authResendDetails || "Standard routing completed."}
                        </p>
                      ) : (
                        <p className="text-rose-300 font-normal font-sans leading-relaxed text-[10.5px]">
                          ⚠️ Sandbox Alert: {authResendDetails || "Resend API restricted. Using simulator."}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    6-Digit Verification PIN
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="PIN Code (e.g., 123456)"
                      value={authOtp}
                      onChange={(e) => setAuthOtp(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono tracking-widest font-normal text-center focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-200"
                    />
                  </div>
                </div>

                {authError && (
                  <p className="text-red-300 text-[11px] leading-normal font-sans font-normal p-2.5 rounded-xl border border-rose-950 bg-rose-950/25">
                    ⚠️ {authError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('email');
                      setAuthOtp('');
                    }}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-xs border border-slate-705 cursor-pointer text-center"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer text-xs"
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <span>Complete Access</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-600 font-mono tracking-wide uppercase">
            DECIMAL DECRYPTED END-TO-END VIA REC SENIOR CIRCLES
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="applet-viewport">
      {/* HEADER COMPONENT */}
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        openAddModal={handleAnonymouslyPostIntelAction}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        studentEmail={studentSession?.email}
        onLogOut={() => setStudentSession(null)}
        studentDept={studentDept}
        isRollNumber={isRollNumber}
        onUpdateManualDept={handleUpdateManualDept}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Dynamic scan blocking status indicator overlay */}
      {isModerating && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-auto select-none">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center max-w-xs text-center space-y-3.5 shadow-2xl text-xs font-semibold">
            <Loader2 className="w-8 h-8 text-yellow-300 animate-spin" />
            <div className="space-y-1">
              <p className="text-white font-extrabold text-sm font-sans">Reviewing Intel...</p>
              <p className="text-slate-400 text-[10.5px] font-normal leading-relaxed font-sans">
                Our server-side AI content moderation engine is scanning your submission for compliance with REC community standards.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Flagged moderation response popup with interactive appeal form */}
      {moderationAlert && (
        <div className="fixed inset-0 z-55 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden" id="ai-block-modal-panel">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-amber-500"></div>
            
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-rose-950/40 text-rose-505 border border-rose-800/30 rounded-2xl flex items-center justify-center shrink-0 text-xl">
                ⚠️
              </div>
              <div className="space-y-0.5 flex-1">
                <h3 className="text-white font-black text-sm font-sans uppercase tracking-tight">AI Moderation Policy Block</h3>
                <span className="text-[9.5px] font-mono text-slate-400">Record ref ID: {moderationAlert.id}</span>
              </div>
              <button 
                onClick={() => {
                  setModerationAlert(null);
                  setAppealExplanationText("");
                  setAppealSuccessTrigger(false);
                }} 
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block mb-1">Your Submission Title</span>
                <p className="text-white font-semibold leading-relaxed font-sans">{moderationAlert.title}</p>
              </div>

              <div className="bg-rose-955/20 border border-rose-900/35 text-rose-350 p-3.5 rounded-xl text-left">
                <span className="font-extrabold text-[10px] uppercase block text-rose-400 mb-1">AI Classification Reason</span>
                <p className="font-sans font-normal leading-relaxed text-[11px]">{moderationAlert.reason}</p>
              </div>
            </div>

            {appealSuccessTrigger ? (
              <div className="bg-emerald-450/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2 text-center text-xs text-emerald-100 animate-scale-up" id="appeal-success-box">
                <span className="text-xl">✅</span>
                <p className="font-bold">Appeal Submitted Successfully!</p>
                <p className="text-[10px] text-emerald-350/90 leading-relaxed font-sans font-normal">
                  Our professional student manual panel and staff circles have been alerted. Your post will undergo review and, if overridden, will immediately deploy to the main feed channels.
                </p>
                <button
                  onClick={() => {
                    setModerationAlert(null);
                    setAppealExplanationText("");
                    setAppealSuccessTrigger(false);
                  }}
                  className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                >
                  Ok, Return to circles
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 text-xs border-t border-slate-800" id="appeal-form-box">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-amber-400 font-sans tracking-tight">
                      Request Human Circle Override
                    </label>
                    <span className="text-[9px] text-slate-400">Optional</span>
                  </div>
                  <textarea
                    value={appealExplanationText}
                    onChange={(e) => setAppealExplanationText(e.target.value)}
                    placeholder="Provide comments explaining why your submission complies with local REC student policies..."
                    className="w-full text-xs font-sans p-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none placeholder-slate-500 text-slate-350"
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleSubmitAppeal(moderationAlert.id, appealExplanationText)}
                    disabled={isAppealing || !appealExplanationText.trim()}
                    className="flex-1 py-12px bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-[11px] font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-40 cursor-pointer text-center"
                  >
                    {isAppealing ? 'Submitting...' : '⏳ Submit Human Appeal'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setModerationAlert(null);
                      setAppealExplanationText("");
                      setAppealSuccessTrigger(false);
                    }}
                    className="py-12px px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rate limit / Spam Similarity Warning Dialog */}
      {rateLimitWarningText && (
        <div className="fixed inset-0 z-55 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl relative text-center">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-500"></div>
            <div className="w-12 h-12 bg-yellow-950/40 text-yellow-500 border border-yellow-805/20 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
              🛡️
            </div>
            
            <div className="space-y-1">
              <h3 className="text-white font-black text-sm font-sans uppercase tracking-tight text-yellow-400">Rate Limit Guard</h3>
              <p className="text-[11px] text-slate-400 font-sans font-normal leading-relaxed">
                Your submission request has been blocked by the unofficial student anti-spam guard.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-left text-xs text-amber-200 font-sans leading-relaxed">
              {rateLimitWarningText}
            </div>

            <button
              onClick={() => setRateLimitWarningText(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-705 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Understand & Go Back
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto flex" id="main-content-layout">
        {/* SIDEBAR COMPONENT */}
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          posts={posts}
        />

        {/* MAIN BODY AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-64px)]" id="main-scroll-pane">
          {/* Active Global Search Indicator */}
          {searchQuery && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-amber-900 flex justify-between items-center select-none">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-amber-500" />
                <span>Showing results for search matching query "<strong>{searchQuery}</strong>" in current view.</span>
              </div>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-amber-700 bg-amber-100 hover:bg-amber-200 font-bold px-2 py-0.5 rounded"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* RENDERING SECTIONS */}

          {/* SECTION 1: HOME FEED */}
          {currentTab === 'feed' && (
            <div className="space-y-6" id="feed-screen">
              {/* College Intro Banner (Newbie Essential Styling) */}
              <div className="bg-yellow-400 rounded-2xl p-6 relative overflow-hidden group shadow-sm border border-yellow-350">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-yellow-300 rounded-full opacity-55 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="space-y-2 max-w-2xl">
                    <span className="bg-violet-700 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      ★ NEWBIE ESSENTIAL
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-violet-950 leading-tight font-display">
                      Everything You Need to Survive Rajalakshmi Engineering College
                    </h2>
                    <p className="text-violet-900 text-xs md:text-sm font-medium opacity-90 max-w-xl">
                      Unofficially compiled Thandalam campus insights: Find the easiest elective marks, avoid strict CAT-marking lecturers, download local bus hacks, and access anonymous placement tips.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => setCurrentTab('freshers')}
                      className="bg-violet-700 hover:bg-violet-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs shadow-md transition-all text-center flex items-center justify-between gap-1.5"
                    >
                      <span>Explore Freshers Pack</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-yellow-300" />
                    </button>
                    <button
                      onClick={() => setIsAddIntelOpen(true)}
                      className="bg-white hover:bg-slate-50 text-violet-950 font-bold px-5 py-2.5 rounded-lg text-xs shadow-sm transition-all text-center border border-violet-100"
                    >
                      ✍️ Post Anonymous Warning
                    </button>
                  </div>
                </div>
              </div>

              {/* Feed Grid on Large Screens */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Posts Column */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-sans font-extrabold text-slate-950 text-base" id="feed-title">
                        Trending Intel Feed
                      </h2>
                      
                      {/* Premium Category Filter Dropdown */}
                      <div className="flex items-center space-x-1.5 bg-slate-100/85 hover:bg-slate-200/60 border border-slate-250 py-1 px-2.5 rounded-lg transition-colors" id="feed-category-filter-wrapper">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Category:</span>
                        <select
                          value={feedCategoryFilter}
                          onChange={(e) => setFeedCategoryFilter(e.target.value)}
                          className="bg-transparent border-0 text-xs font-bold text-violet-700 uppercase focus:ring-0 focus:outline-none p-0 cursor-pointer pr-1"
                        >
                          <option value="All" className="text-slate-800 font-sans font-semibold">⚡ All Content</option>
                          <option value="Tips" className="text-slate-800 font-sans font-semibold">💡 Tips & Advice</option>
                          <option value="News" className="text-slate-800 font-sans font-semibold">📰 Campus News</option>
                          <option value="Announcements" className="text-slate-800 font-sans font-semibold">📢 Announcements</option>
                          <option value="Misc" className="text-slate-800 font-sans font-semibold">📦 Miscellaneous</option>
                          <option value="AI-Verified" className="text-emerald-700 font-sans font-extrabold font-semibold">✨ AI-Verified (High Quality)</option>
                        </select>
                      </div>

                      {/* Author's Role Filter Toggle */}
                      <div className="flex items-center space-x-1.5 bg-slate-100/85 hover:bg-slate-200/60 border border-slate-250 py-1 px-2.5 rounded-lg transition-colors" id="feed-author-role-filter-wrapper">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Author Role:</span>
                        <select
                          value={authorRoleFilter}
                          onChange={(e) => setAuthorRoleFilter(e.target.value)}
                          className="bg-transparent border-0 text-xs font-bold text-indigo-700 uppercase focus:ring-0 focus:outline-none p-0 cursor-pointer pr-1"
                        >
                          <option value="All" className="text-slate-800 font-sans font-semibold">👥 All Roles</option>
                          <option value="Senior" className="text-slate-800 font-sans font-semibold">💪 Seniors</option>
                          <option value="Alumni" className="text-slate-800 font-sans font-semibold">🎓 Alumni</option>
                          <option value="Faculty" className="text-slate-800 font-sans font-semibold">🧑‍🏫 Faculty</option>
                          <option value="Student" className="text-slate-800 font-sans font-semibold">🎓 Students</option>
                        </select>
                      </div>
                    </div>
                    
                    <span className="text-[11px] font-mono text-slate-400 font-medium" id="feed-count-indicator">
                      {getFilteredPosts().length} posts listed
                    </span>
                  </div>

                  {getFilteredPosts().length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 italic">No student posts match your query. Be the first to share details!</p>
                    </div>
                  ) : (
                    getFilteredPosts().map((post) => (
                      <PostCard 
                        key={post.id} 
                        post={post} 
                        onUpvote={handlePostUpvote}
                        onAddComment={handleAddComment}
                        isBookmarked={bookmarkedPosts.includes(post.id)}
                        onToggleBookmark={handleTogglePostBookmark}
                        onReportPost={handleReportPost}
                      />
                    ))
                  )}
                </div>

                {/* Right side bento widgets */}
                <div className="space-y-5">
                  
                  {/* Popular Resources widget */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                    <h3 className="font-sans font-extrabold text-xs text-slate-900 uppercase tracking-widest flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-violet-600" />
                      <span>Popular Resources</span>
                    </h3>
                    <div className="divide-y divide-slate-100">
                      <a href="#survival" onClick={() => setCurrentTab('survival')} className="py-2.5 block hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold text-slate-800">Thandalam Bus route 42 vs Route 60 timetable</p>
                        <span className="text-[10px] text-slate-400">Survival Guide • Bus Routes</span>
                      </a>
                      <a href="#survival" onClick={() => setCurrentTab('survival')} className="py-2.5 block hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold text-slate-800">Where is the cheapest printing shop near campus?</p>
                        <span className="text-[10px] text-slate-400">Survival Guide • Xerox & Manuals</span>
                      </a>
                      <a href="#professors" onClick={() => setCurrentTab('professors')} className="py-2.5 block hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold text-slate-800">Math Operations Research Dr. Senthamarai rating</p>
                        <span className="text-[10px] text-slate-400">Professor Vault</span>
                      </a>
                    </div>
                  </div>

                  {/* Anti-Scam Notice Card */}
                  <div className="bg-rose-50 border border-rose-200 text-rose-950 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-extrabold text-rose-800 uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Alumni Scam Warning!</span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-normal">
                      Some fake training academies operating near Guindy or Vadapalani reach out to RECians pretending to provide guaranteed internal jobs in exchange for registration fees. Always verify via the Placement Cell first. Never pay any money!
                    </p>
                  </div>

                  {/* Quick REC Stats */}
                  <div className="p-4 bg-slate-100/55 rounded-2xl text-[11px] text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700">Rajalakshmi Engineering College (Autonomous)</p>
                    <p>Affiliated to Anna University. Chennai Highway, Thandalam.</p>
                    <div className="pt-2 flex items-center space-x-1 text-violet-700 font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-violet-600" />
                      <span>Unofficially Compiled for 2026 batches</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* SECTION 1.5: REDDIT Q&A FORUM */}
          {currentTab === 'forum' && (
            <ForumPage
              posts={posts}
              studentEmail={studentSession?.email}
              studentDept={studentDept}
              searchQuery={searchQuery}
              onPostUpvote={handlePostUpvote}
              onAddComment={handleAddComment}
              bookmarkedPosts={bookmarkedPosts}
              onToggleBookmark={handleTogglePostBookmark}
              onSubmitQuestion={handleAskQuestionSubmit}
            />
          )}

          {/* SECTION 2: DEPARTMENT COMMUNITIES */}
          {currentTab === 'departments' && (
            <DepartmentPage
              posts={posts}
              internships={internships}
              studentEmail={studentSession?.email}
              searchQuery={searchQuery}
              selectedDept={selectedDept}
              setSelectedDept={setSelectedDept}
              onPostUpvote={handlePostUpvote}
              onAddComment={handleAddComment}
              bookmarkedPosts={bookmarkedPosts}
              onToggleBookmark={handleTogglePostBookmark}
              setIsAddIntelOpen={setIsAddIntelOpen}
              studentDept={studentDept}
            />
          )}



          {/* SECTION 3: PROFESSOR VAULT */}
          {currentTab === 'professors' && (
            <div className="space-y-6" id="professors-screen">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-sans font-black text-slate-900 text-base flex items-center gap-1.5">
                    <GraduationCap className="w-5 h-5 text-violet-700" />
                    <span>The Unofficial Professor Vault</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Review lecturing styles, strictness margins, and how easily they award marks. Built so you don\'t choose the wrong elective section!
                  </p>
                </div>
                <button
                  onClick={() => setIsAddReviewOpen(true)}
                  className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded-lg text-xs font-bold shadow-sm shrink-0"
                >
                  + Review a Professor
                </button>
              </div>

              {/* Professor Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredProfessors().length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 italic">No professor matches your search. Use "Review a Professor" to launch a new entry anonymously!</p>
                  </div>
                ) : (
                  getFilteredProfessors().map((prof) => {
                    const stats = getProfAggregates(prof);
                    return (
                      <div 
                        key={prof.id} 
                        className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                        id={`prof-card-${prof.id}`}
                      >
                        <div className="space-y-3">
                          {/* Title and Dept badge */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-sans font-black text-slate-900 text-sm">
                                {prof.name}
                              </h3>
                              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded">
                                Dept: {prof.department}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10.5px] text-slate-400 block font-normal">Teaching Quality</span>
                              <div className="flex items-center text-amber-500 font-black font-mono text-sm">
                                <span>{stats.teaching ? stats.teaching : 'N/A'}</span>
                                <span className="text-xs ml-0.5 font-normal">/ 5</span>
                              </div>
                            </div>
                          </div>

                          {/* Aggregate ratings sliders visual */}
                          <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/60 text-[10.5px]">
                            <div className="space-y-0.5 text-center">
                              <span className="text-slate-400 block font-normal">Strictness</span>
                              <span className={`font-bold font-mono ${stats.strictness > 3.8 ? 'text-red-650' : 'text-slate-700'}`}>
                                {stats.strictness ? `${stats.strictness} / 5` : 'N/A'}
                              </span>
                            </div>
                            <div className="space-y-0.5 text-center border-x border-slate-205">
                              <span className="text-slate-400 block font-normal">Attendance</span>
                              <span className="font-bold font-mono text-slate-700">
                                {stats.attendance ? `${stats.attendance} / 5` : 'N/A'}
                              </span>
                            </div>
                            <div className="space-y-0.5 text-center">
                              <span className="text-slate-400 block font-normal">Easy Marks</span>
                              <span className="font-bold text-emerald-700 font-mono">
                                {stats.ease ? `${stats.ease} / 5` : 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Testimony thread */}
                          <div className="space-y-2">
                            <h4 className="text-[10.5px] font-extrabold text-slate-500 uppercase tracking-widest">
                              Student Testimonies ({prof.reviews.length})
                            </h4>
                            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                              {prof.reviews.map((rev) => (
                                <div key={rev.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100/80 text-xs space-y-1 relative">
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span className="font-semibold text-slate-600">
                                      {rev.isAnonymous ? 'Anonymous Student' : rev.authorName}
                                    </span>
                                    <span>
                                      {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 leading-relaxed font-normal">{rev.content}</p>

                                  {/* Upvote review */}
                                  <div className="flex justify-end pt-1">
                                    <button
                                      onClick={() => handleReviewUpvote(prof.id, rev.id)}
                                      className="flex items-center space-x-1 text-[9.5px] text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 px-1.5 py-0.5 rounded font-bold"
                                    >
                                      <span>Helpful Testimony ({rev.upvotes})</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 select-none">
                          <span>Verified against Thandalam syllabus</span>
                          <span className="text-amber-500 font-bold font-mono">✦ Anonymous Vault</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: PLACEMENT HUB */}
          {currentTab === 'placements' && (
            <div className="space-y-6" id="placements-screen">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-sans font-black text-slate-900 text-base flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-violet-700" />
                    <span>Placement Hub & OA Secret</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Discover exact Online Assessment questions, campus placement timelines, Zoho loops patterns, and interview stages shared by graduates.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddPlacementOpen(true)}
                  className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded-lg text-xs font-bold shadow-sm shrink-0"
                >
                  + Add Interview Story
                </button>
              </div>

              {/* Placements Cards */}
              <div className="space-y-4">
                {getFilteredPlacements().length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 italic">No placement experience written yet. Click "Add Interview Story" to document Zoho or Cisco hiring!</p>
                  </div>
                ) : (
                  getFilteredPlacements().map((pl) => (
                    <div 
                      key={pl.id} 
                      className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:border-slate-200 transition-all space-y-4"
                      id={`placement-card-${pl.id}`}
                    >
                      {/* Top badging */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-900 font-black text-[10.5px]">
                            {pl.ctc} CTC Offer
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            pl.difficulty === 'Hard' ? 'bg-red-50 text-red-750' : pl.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                          }`}>
                            Diff: {pl.difficulty}
                          </span>
                        </div>
                        <span>Contributed on {new Date(pl.createdAt).toLocaleDateString()} by {pl.isAnonymous ? 'Anonymous Alum' : pl.authorName}</span>
                      </div>

                      {/* Header title */}
                      <div>
                        <h3 className="font-sans font-black text-slate-900 text-base">
                          {pl.company} - {pl.role}
                        </h3>
                        <p className="text-violet-700 font-sans font-bold text-xs">{pl.title}</p>
                      </div>

                      {/* Details structure */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-normal">
                        <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100/80">
                          <p className="font-bold text-slate-700">Detailed Stages & Questions</p>
                          <p className="text-slate-600 leading-relaxed font-sans">{pl.rounds}</p>
                        </div>
                        <div className="space-y-1.5 p-3 rounded-lg bg-violet-50/20 border border-violet-100/50">
                          <p className="font-bold text-violet-800">Prep Tips & Suggestion Materials</p>
                          <p className="text-slate-650 leading-relaxed font-sans">{pl.tips}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <button
                          onClick={() => handleUpvotePlacement(pl.id)}
                          className="flex items-center space-x-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-violet-750 font-bold border border-slate-200 rounded-lg text-xs transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4 text-violet-700" />
                          <span>Helpful preparation log ({pl.upvotes})</span>
                        </button>
                        <span className="text-[10px] text-slate-400 italic">Verified off-campus or in-drive</span>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: INTERNSHIP BOARD */}
          {currentTab === 'internships' && (
            <div className="space-y-6" id="internships-screen">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-sans font-black text-slate-900 text-base flex items-center gap-1.5">
                    <BookOpen className="w-5 h-5 text-violet-700" />
                    <span>Internship Intelligence Board</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-normal">
                    Search stipends, application guidelines, skill priorities, and avoid scam local academy traps.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddInternshipOpen(true)}
                  className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded-lg text-xs font-bold shadow-sm shrink-0"
                >
                  + Add Internship experience
                </button>
              </div>

              {/* Internships Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredInternships().length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-400 italic">No internship postings match your queries. Click "+ Add Internship experience" to post details!</p>
                  </div>
                ) : (
                  getFilteredInternships().map((it) => (
                    <div 
                      key={it.id} 
                      className="bg-white border border-slate-400/25 shadow-xs rounded-2xl p-5 hover:border-slate-350 transition-all flex flex-col justify-between"
                      id={`internship-card-${it.id}`}
                    >
                      <div className="space-y-3">
                        {/* Title and stipend */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-violet-700 font-bold block uppercase tracking-wider">Internship Experience</span>
                            <h3 className="font-sans font-black text-slate-900 text-sm">{it.company}</h3>
                            <p className="text-xs text-slate-600 font-semibold">{it.title}</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border-none font-bold text-[10px]">
                            Stipend: {it.stipend}
                          </span>
                        </div>

                        {/* Application logistics */}
                        <div className="space-y-1 font-normal text-xs">
                          <p className="font-bold text-slate-700">How I Applied / Interview Setup</p>
                          <p className="text-slate-600 leading-relaxed font-sans">{it.applicationProcess}</p>
                        </div>

                        {/* Skills required tag list */}
                        {it.skillsRequired && it.skillsRequired.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {it.skillsRequired.map(skill => (
                              <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-mono border-none">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Referral advice */}
                        {it.referralTips && (
                          <div className="p-2.5 rounded-lg bg-violet-50 text-violet-950 text-xs border border-violet-100 font-normal">
                            <span className="font-bold block text-violet-800 text-[10px] uppercase">Senior Networking Hint</span>
                            <p className="text-[11px]">{it.referralTips}</p>
                          </div>
                        )}

                        {/* Scam or negative indicators */}
                        {it.warning && (
                          <div className="p-2.5 rounded-lg bg-red-50 text-red-950 text-xs border border-red-100 font-normal flex items-start space-x-1.5">
                            <div className="shrink-0 text-red-500 font-bold">⚠️</div>
                            <div>
                              <span className="font-bold text-red-800 text-[10px] uppercase">WARNING / DISLIKES</span>
                              <p className="text-[11px] leading-relaxed mt-0.5">{it.warning}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleUpvoteInternship(it.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-slate-50 hover:bg-violet-100 text-slate-600 hover:text-violet-700 font-bold border border-slate-200/50 rounded-lg"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Helpful Details ({it.upvotes})</span>
                        </button>
                        <span className="text-[10px] text-slate-400">By {it.isAnonymous ? 'Anonymous' : it.authorName}</span>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SECTION 6: SURVIVAL GUIDE */}
          {currentTab === 'survival' && (
            <SurvivalSection 
              tips={survivalTips} 
              onUpvoteTip={handleUpvoteTip} 
              openAddSurvivalModal={() => setIsAddSurvivalOpen(true)}
              bookmarkedTipIds={bookmarkedTips}
              onToggleTipBookmark={handleToggleTipBookmark}
            />
          )}

          {/* SECTION 8: BOOKMARKS (SAVED LIBRARY) */}
          {currentTab === 'bookmarks' && (
            <div className="space-y-6 animate-fade-in" id="bookmarks-screen">
              {/* Header section with double-tab navigation */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Bookmark className="w-5 h-5 text-violet-700" />
                      <h2 className="font-sans font-black text-slate-900 text-lg">
                        Developer Hub & Personal Vault
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 font-normal max-w-2xl font-sans">
                      Inspect your saved offline-friendly campus notes or manage the server-side Resend SMTP API configurations and domain verification DNS records here.
                    </p>
                  </div>

                  {/* Sub-Tabs Selector */}
                  <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto" id="bookmarks-sub-tabs">
                    <button
                      onClick={() => setResendSubTab('saved')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 cursor-pointer ${
                        resendSubTab === 'saved'
                          ? 'bg-white text-violet-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📁 My Saved Intel ({bookmarkedPosts.length + bookmarkedTips.length})
                    </button>
                    <button
                      onClick={() => setResendSubTab('resend')}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 cursor-pointer ${
                        resendSubTab === 'resend'
                          ? 'bg-white text-violet-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>📨 Resend SMTP Center</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-yellow-400 text-slate-900 font-bold uppercase tracking-tight scale-90">
                        Live
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-Tab Content 1: Saved Intel (Bookmarks) */}
              {resendSubTab === 'saved' && (
                <div>
                  {bookmarkedPosts.length === 0 && bookmarkedTips.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xs max-w-xl mx-auto space-y-4">
                      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                        <Bookmark className="w-8 h-8 fill-amber-300 text-amber-400" />
                      </div>
                      <h3 className="font-sans font-black text-slate-900 text-base">Your student library is empty</h3>
                      <p className="text-slate-500 text-xs max-w-sm mx-auto font-normal font-sans">
                        Flick through the <span className="font-semibold text-violet-700">Home Feed</span> or <span className="font-semibold text-violet-700">Campus Survival Guide</span>, and tap "Save" on any post or tip card to keep them handy here!
                      </p>
                      <button 
                        onClick={() => setCurrentTab('feed')}
                        className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white rounded-lg text-xs font-bold font-sans shadow-xs transition-colors cursor-pointer"
                      >
                        Browse Home Feed
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Bookmarked Posts Column */}
                      <div className="lg:col-span-2 space-y-4">
                        <h3 className="font-sans font-black text-xs text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                          <span>🔖 Saved Community Intel ({bookmarkedPosts.length})</span>
                        </h3>
                        
                        {bookmarkedPosts.length === 0 ? (
                          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-205">
                            <p className="text-xs text-slate-400 italic font-sans font-normal">No community posts bookmarked yet.</p>
                          </div>
                        ) : (
                          posts.filter(p => bookmarkedPosts.includes(p.id)).map(post => (
                            <PostCard 
                              key={post.id} 
                              post={post} 
                              onUpvote={handlePostUpvote}
                              onAddComment={handleAddComment}
                              isBookmarked={true}
                              onToggleBookmark={handleTogglePostBookmark}
                              onReportPost={handleReportPost}
                            />
                          ))
                        )}
                      </div>

                      {/* Bookmarked Survival Tips Column */}
                      <div className="space-y-4">
                        <h3 className="font-sans font-black text-xs text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                          <span>🧭 Saved Survival Hacks ({bookmarkedTips.length})</span>
                        </h3>

                        {bookmarkedTips.length === 0 ? (
                          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-205">
                            <p className="text-xs text-slate-400 italic font-sans font-normal">No survival tips bookmarked yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {survivalTips.filter(t => bookmarkedTips.includes(t.id)).map(tip => (
                              <div 
                                key={tip.id} 
                                className="bg-white border border-amber-100 p-5 rounded-2xl shadow-xs space-y-3 relative group hover:border-amber-200 transition-all text-xs font-medium text-slate-700"
                                id={`bookmarked-tip-${tip.id}`}
                              >
                                <div className="space-y-1">
                                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                    {tip.category === 'academic' ? '📚 Academic Cheat-sheet' : 
                                     tip.category === 'commute' ? '🚌 Transit & Commute' :
                                     tip.category === 'social' ? '🍕 Food & Hangout' : '🛡️ Base Hack'}
                                  </span>
                                  <h4 className="font-sans font-extrabold text-slate-900 text-xs">
                                    {tip.title}
                                  </h4>
                                  <p className="text-slate-600 text-[11px] leading-relaxed font-sans font-normal">
                                    {tip.description}
                                  </p>
                                </div>
                                
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                  <button
                                    onClick={() => handleToggleTipBookmark(tip.id)}
                                    className="text-[10px] text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors px-2.5 py-1 rounded font-bold cursor-pointer"
                                  >
                                    ✕ Remove Bookmark
                                  </button>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Advice level {tip.upvotes}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab Content 2: Resend API Developer Suite */}
              {resendSubTab === 'resend' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in" id="resend-developer-suite">
                  {/* Left columns: DNS Tables & Verification parameters */}
                  <div className="xl:col-span-2 space-y-6">
                    {/* Intro card */}
                    <div className="bg-violet-950 text-white p-6 rounded-2xl border border-violet-900 shadow-lg space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl"></div>
                      <h3 className="font-sans font-black text-sm uppercase tracking-wider text-yellow-300">
                        Resend SMTP & Delivery Server Config
                      </h3>
                      <p className="text-[11.5px] leading-relaxed text-violet-100 font-sans font-normal">
                        Your Resend implementation is integrated into the secure <strong>Thandalam Verification Gateway</strong>. It dynamically emails verification access keys to students at <strong>@rajalakshmi.edu.in</strong> end-to-end. To prevent delivery issues, check that the following DKIM, SPF, and DMARC DNS credentials are correct inside your registrar settings panel (e.g. GoDaddy, Cloudflare, Namecheap).
                      </p>
                    </div>

                    {/* DNS Records Table */}
                    <div className="bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-xs">
                      <div className="bg-slate-50 border-b border-slate-100 p-4">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Required DNS verification records (DKIM, SPF, DMARC)
                        </h4>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                              <th className="p-4 w-16">Type</th>
                              <th className="p-4 w-40">Host/Name</th>
                              <th className="p-4">Value</th>
                              <th className="p-4 w-20 text-center">Priority</th>
                              <th className="p-4 w-28 text-right">Requirement</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans font-normal">
                            {/* DKIM Record */}
                            <tr className="hover:bg-slate-50/40 transition-colors">
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-violet-50 text-violet-700 font-mono font-bold rounded">
                                  TXT
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-1">
                                  <code className="bg-slate-100 p-1 rounded text-[10.5px] text-slate-700 font-mono">
                                    resend._domainkey
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("resend._domainkey");
                                      setCopiedCellId("host-dkim");
                                      setTimeout(() => setCopiedCellId(null), 1500);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    title="Copy Host"
                                  >
                                    {copiedCellId === 'host-dkim' ? (
                                      <span className="text-[9px] text-emerald-600 font-mono font-bold">Copied!</span>
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-start space-x-1.5 max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
                                  <div className="bg-slate-100 p-1 rounded font-mono text-[10px] text-slate-600 break-all truncate max-h-16 overflow-y-auto block pr-2">
                                    p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC2sXP+CERehkkEjDGOtpgicps7HlG5ZR8bq7CBfBwDjR/9+bFD+u66+8gIpcNK76x4YL7CJ1m6AHLxcv1dD+6ttdX6wiaKooeaMzmmgWc2+V+vwiFiU5x1EpugdSv0fdnZAbzqWv2NxwW661SytScpyFCyZFrfK/a3zK/3hkw2MQIDAQAB
                                  </div>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC2sXP+CERehkkEjDGOtpgicps7HlG5ZR8bq7CBfBwDjR/9+bFD+u66+8gIpcNK76x4YL7CJ1m6AHLxcv1dD+6ttdX6wiaKooeaMzmmgWc2+V+vwiFiU5x1EpugdSv0fdnZAbzqWv2NxwW661SytScpyFCyZFrfK/a3zK/3hkw2MQIDAQAB");
                                      setCopiedCellId("val-dkim");
                                      setTimeout(() => setCopiedCellId(null), 1500);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                                    title="Copy Value"
                                  >
                                    {copiedCellId === 'val-dkim' ? (
                                      <span className="text-[9px] text-emerald-600 font-mono font-bold">Copied!</span>
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 text-center text-slate-400 font-mono">-</td>
                              <td className="p-4 text-right">
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-50 text-red-700 font-bold uppercase tracking-wider">
                                  Required (DKIM)
                                </span>
                              </td>
                            </tr>

                            {/* MX Record */}
                            <tr className="hover:bg-slate-50/40 transition-colors">
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-mono font-bold rounded">
                                  MX
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-1">
                                  <code className="bg-slate-100 p-1 rounded text-[10.5px] text-slate-700 font-mono">
                                    send
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("send");
                                      setCopiedCellId("host-mx");
                                      setTimeout(() => setCopiedCellId(null), 1500);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    title="Copy Host"
                                  >
                                    {copiedCellId === 'host-mx' ? (
                                      <span className="text-[9px] text-emerald-600 font-mono font-bold">Copied!</span>
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-between">
                                  <code className="bg-slate-100 p-1 rounded font-mono text-[10px] text-slate-600 truncate">
                                    feedback-smtp.ap-northeast-1.amazonses.com
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("feedback-smtp.ap-northeast-1.amazonses.com");
                                      setCopiedCellId("val-mx");
                                      setTimeout(() => setCopiedCellId(null), 1500);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    title="Copy Value"
                                  >
                                    {copiedCellId === 'val-mx' ? (
                                      <span className="text-[9px] text-emerald-600 font-mono font-bold">Copied!</span>
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 text-center font-mono font-bold text-slate-705">10</td>
                              <td className="p-4 text-right">
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-50 text-red-700 font-bold uppercase tracking-wider">
                                  Required (SPF)
                                </span>
                              </td>
                            </tr>

                            {/* SPF Record */}
                            <tr className="hover:bg-slate-50/40 transition-colors">
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-violet-50 text-violet-700 font-mono font-bold rounded">
                                  TXT
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-1">
                                  <code className="bg-slate-100 p-1 rounded text-[10.5px] text-slate-700 font-mono">
                                    send
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("send");
                                      setCopiedCellId("host-spf");
                                      setTimeout(() => setCopiedCellId(null), 1500);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    title="Copy Host"
                                  >
                                    {copiedCellId === 'host-spf' ? (
                                      <span className="text-[9px] text-emerald-600 font-mono font-bold">Copied!</span>
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-between">
                                  <code className="bg-slate-100 p-1 rounded font-mono text-[10px] text-slate-600 truncate">
                                    v=spf1 include:amazonses.com ~all
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("v=spf1 include:amazonses.com ~all");
                                      setCopiedCellId("val-spf");
                                      setTimeout(() => setCopiedCellId(null), 1500);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    title="Copy Value"
                                  >
                                    {copiedCellId === 'val-spf' ? (
                                      <span className="text-[9px] text-emerald-600 font-mono font-bold">Copied!</span>
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 text-center text-slate-400 font-mono">-</td>
                              <td className="p-4 text-right">
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-50 text-red-700 font-bold uppercase tracking-wider">
                                  Required (SPF)
                                </span>
                              </td>
                            </tr>

                            {/* DMARC Record */}
                            <tr className="hover:bg-slate-50/40 transition-colors">
                              <td className="p-4">
                                <span className="px-2 py-0.5 bg-violet-50 text-violet-700 font-mono font-bold rounded">
                                  TXT
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-1">
                                  <code className="bg-slate-100 p-1 rounded text-[10.5px] text-slate-700 font-mono">
                                    _dmarc
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("_dmarc");
                                      setCopiedCellId("host-dmarc");
                                      setTimeout(() => setCopiedCellId(null), 1500);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    title="Copy Host"
                                  >
                                    {copiedCellId === 'host-dmarc' ? (
                                      <span className="text-[9px] text-emerald-600 font-mono font-bold">Copied!</span>
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-between">
                                  <code className="bg-slate-100 p-1 rounded font-mono text-[10px] text-slate-600 truncate">
                                    v=DMARC1; p=none;
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText("v=DMARC1; p=none;");
                                      setCopiedCellId("val-dmarc");
                                      setTimeout(() => setCopiedCellId(null), 1500);
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                    title="Copy Value"
                                  >
                                    {copiedCellId === 'val-dmarc' ? (
                                      <span className="text-[9px] text-emerald-600 font-mono font-bold">Copied!</span>
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 text-center text-slate-400 font-mono">-</td>
                              <td className="p-4 text-right">
                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-blue-50 text-blue-700 font-bold uppercase tracking-wider">
                                  Recommended
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Email Dispatch Testing Playground */}
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-205 p-5 rounded-2xl shadow-xs space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                          <span>Resend Dispatch Playground</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 font-normal leading-normal">
                          Test actual Resend SMTP integration using your custom API Key or Sandbox fallback. 
                        </p>
                      </div>

                      <form onSubmit={handleResendTestEmailSubmit} className="space-y-3.5 text-xs">
                        {/* API Key overrides */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">
                            Resend API Key Override
                          </label>
                          <input
                            type="password"
                            placeholder="Using key: re_eUa7ZZ1x_Gc9E8iw5K72df8zLp..."
                            value={resendTestKey}
                            onChange={(e) => setResendTestKey(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-[11px] p-2 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-800"
                          />
                          <p className="text-[9px] text-slate-450 italic">
                            Leave empty to use active key provided or process.env.RESEND_API_KEY.
                          </p>
                        </div>

                        {/* Recipient Input */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">
                            Recipient Address (To)
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="naevaspam@gmail.com"
                            value={resendTestRecipient}
                            onChange={(e) => setResendTestRecipient(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-[11px] p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-sans text-slate-800"
                          />
                        </div>

                        {/* Subject Line */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">
                            Email Subject
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Hello World"
                            value={resendTestSubject}
                            onChange={(e) => setResendTestSubject(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-[11px] p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-sans font-medium text-slate-800"
                          />
                        </div>

                        {/* HTML Body */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">
                            HTML Email Body
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={resendTestHtml}
                            onChange={(e) => setResendTestHtml(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-[11px] p-2 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-800 leading-normal"
                          />
                        </div>

                        {/* Dispatch Button */}
                        <button
                          type="submit"
                          disabled={resendTestLoading}
                          className="w-full py-2.5 bg-violet-750 hover:bg-violet-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-sans shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
                        >
                          {resendTestLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              <span>Delivering via Resend API...</span>
                            </>
                          ) : (
                            <span>Send Live Test Email</span>
                          )}
                        </button>
                      </form>

                      {/* Display response status feedback */}
                      {resendTestResult && (
                        <div className={`p-3 rounded-xl text-[11px] border leading-normal font-sans text-left space-y-1 ${
                          resendTestResult.success 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                          <p className="font-extrabold flex items-center">
                            {resendTestResult.success ? '✓ Dispatch Succeeded:' : '⚠️ Dispatch Rejected:'}
                          </p>
                          <p className="font-normal">{resendTestResult.message}</p>
                          {resendTestResult.data && (
                            <pre className="mt-1.5 p-1.5 rounded bg-slate-900 border border-slate-800 text-[9.5px] font-mono text-slate-300 overflow-x-auto select-all max-h-24">
                              {JSON.stringify(resendTestResult.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>

                    {/* API Key configuration instruction notes */}
                    <div className="bg-slate-50 border border-slate-205/60 p-4 rounded-xl text-[10.5px] text-slate-500 leading-relaxed space-y-1.5">
                      <p className="font-extrabold text-slate-700">How to update Resend API Key permanently:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-[10px] font-normal">
                        <li>Go to <strong>Settings</strong> button in the top right header of the AI Studio workspace.</li>
                        <li>Find the <strong>Secrets Panel</strong> area.</li>
                        <li>Bind key <code className="bg-white px-1 py-0.5 rounded border text-slate-800 font-mono">RESEND_API_KEY</code> to your real API key token (e.g. <code className="font-mono text-slate-800">re_eUa7ZZ1x_Gc9E8iw5K...</code>).</li>
                      </ol>
                      <p className="text-[10px] italic">
                        The applet will automatically pick up your environment secrets immediately!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 10: MODERATOR CONSOLE */}
          {currentTab === 'moderator' && (
            <ModeratorDashboard 
              records={moderationRecords}
              onDecision={handleModeratorDecision}
              studentEmail={studentSession?.email}
            />
          )}

          {/* SECTION 7: FRESHERS STARTER PACK */}
          {currentTab === 'freshers' && <FreshersPack />}

        </main>
      </div>

      {/* OVERLAY MODAL FORMS POPUPS */}
      <AddIntelModal 
        isOpen={isAddIntelOpen} 
        onClose={() => setIsAddIntelOpen(false)} 
        onSubmit={handleAddIntelSubmit}
        defaultDept={selectedDept || 'general'}
        studentDept={studentDept}
      />

      <AddReviewModal 
        isOpen={isAddReviewOpen} 
        onClose={() => setIsAddReviewOpen(false)} 
        professors={professors} 
        onSubmit={handleAddReviewSubmit}
      />

      <AddPlacementModal 
        isOpen={isAddPlacementOpen} 
        onClose={() => setIsAddPlacementOpen(false)} 
        onSubmit={handleAddPlacementSubmit}
      />

      <AddInternshipModal 
        isOpen={isAddInternshipOpen} 
        onClose={() => setIsAddInternshipOpen(false)} 
        onSubmit={handleAddInternshipSubmit}
      />

      <AddSurvivalModal 
        isOpen={isAddSurvivalOpen} 
        onClose={() => setIsAddSurvivalOpen(false)} 
        onSubmit={handleAddSurvivalSubmit}
      />

      {/* Bottom Footer block */}
      <footer className="bg-white border-t border-slate-150 py-6 text-center text-xs text-slate-400 mt-auto select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 Unwritten REC. Developed unofficially by seniors for the wellness of Rajalakshmi Engineering College juniors.</p>
          <div className="flex items-center space-x-1.5 text-[11px]">
            <Heart className="w-3.5 h-3.5 text-violet-600 fill-violet-600" />
            <span>Built autonomously for Thandalam campuses</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
