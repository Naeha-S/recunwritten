export interface Comment {
  id: string;
  authorName: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
  upvotes: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  department: string; // IT, CSE, AIML, AIDS, CSBS, ECE, EEE, Mech, Robotics, general etc.
  category: 'discussion' | 'notes' | 'elective' | 'announcement' | 'Tips' | 'News' | 'Announcements' | 'Misc' | 'Question';
  upvotes: number;
  commentsCount: number;
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
  tags: string[];
  comments: Comment[];
  quality?: 'Helpful' | 'Generic/Low-effort';
  isAiVerified?: boolean;
  authorRole?: 'Senior' | 'Alumni' | 'Faculty' | 'Student';
}

export interface ProfessorReview {
  id: string;
  content: string;
  teaching: number; // 1-5
  strictness: number; // 1-5 (where 1: Chill, 5: Jailor)
  attendance: number; // 1-5 (where 1: 75% ignored, 5: strict margin)
  ease: number; // 1-5 (easy marks/grades)
  upvotes: number;
  isAnonymous: boolean;
  authorName: string;
  createdAt: string;
}

export interface Professor {
  id: string;
  name: string;
  department: string;
  reviews: ProfessorReview[];
}

export interface PlacementExperience {
  id: string;
  title: string;
  company: string;
  role: string;
  ctc: string; // package e.g. "12 LPA"
  rounds: string; // OA, Tech round, HR round
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tips: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
  upvotes: number;
}

export interface InternshipExperience {
  id: string;
  title: string;
  company: string;
  stipend: string;
  applicationProcess: string;
  referralTips: string;
  warning: string; // scam or work culture warning
  skillsRequired: string[];
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
  upvotes: number;
  department?: string; // Associated department (e.g. "IT", "CSE", "ECE", etc)
}

export interface SurvivalTip {
  id: string;
  category: 'printing' | 'food' | 'transport' | 'hostel' | 'hacks' | 'spots' | 'resources';
  title: string;
  description: string;
  upvotes: number;
  authorName: string;
  isAnonymous: boolean;
}

export interface AuditLog {
  timestamp: string;
  action: string;
  notes: string;
  operator: string;
}

export interface ModerationRecord {
  id: string;
  contentType: 'post' | 'review' | 'placement' | 'internship' | 'survival' | 'comment';
  title: string;
  content: string;
  authorName: string;
  isAnonymous: boolean;
  studentEmail: string;
  createdAt: string;
  blockedReason: string;
  status: 'blocked' | 'appealed' | 'approved' | 'rejected_appeal' | 'reported' | 'dismissed_report' | 'removed_post';
  originalData: any; // Entire payload for redeploy upon review approval
  appealText?: string;
  appealCreatedAt?: string;
  moderatorNotes?: string;
  auditHistory: AuditLog[];
}

