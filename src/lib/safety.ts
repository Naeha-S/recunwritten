/**
 * Utility functions for protecting against XSS, SQL Injection patterns,
 * and filtering out inappropriate non-academic content (like crush/love confessions, 
 * internet pranks, and malicious rumors for REC student community).
 */

// Common keywords indicating romantic confessions, crush posts, or juvenile pranks
const REJECTED_WORDS = [
  /\bcrush\b/i,
  /\bcrush on\b/i,
  /\bsecret admirer\b/i,
  /\blove letter\b/i,
  /\bproposal\b/i,
  /\bproposing\b/i,
  /\bconfess my love\b/i,
  /\bso cute\b/i,
  /\bhot boy\b/i,
  /\bhot girl\b/i,
  /\bmy boyfriend\b/i,
  /\bmy girlfriend\b/i,
  /\bdating\b/i,
  /\bmarriage\b/i,
  /\bmarry\b/i,
  /\bhe is looking so\b/i,
  /\bshe is looking so\b/i,
  /\bloves him\b/i,
  /\bloves her\b/i,
  /\bgossip about\b/i,
  /\brumor says\b/i,
  /\bpranked\b/i,
  /\bdo a prank\b/i,
  /\bapril fool\b/i,
  /\bmade fun of\b/i,
  /\bwhatsapp group link\b/i,
  /\bspam chat\b/i,
  /\bsexy\b/i,
  /\bcutie\b/i,
  /\badmirer\b/i,
  /\bconfession\b/i,
  /\bconfessions\b/i,
  /\bmatchmaking\b/i,
  /\bmatch-make\b/i,
  /\btroll\b/i,
  /\btrolling\b/i,
  /\bdare you to\b/i,
  /\btruth or dare\b/i,
];

/**
 * Escapes characters that are commonly exploited in SQL Injection vectors
 * and sanitizes other dangerous character payloads.
 */
export function sanitizeSqlInjection(text: string): string {
  if (!text) return "";
  
  let cleaned = text;

  // 1. Break standard inline comment strings used to terminate SQL queries
  cleaned = cleaned.replace(/--/g, "—"); // Replace SQL comment mark with safe dash
  cleaned = cleaned.replace(/\/\*/g, "/⚿"); // Break open comment / *
  cleaned = cleaned.replace(/\*\//g, "⚿/"); // Break close comment * /

  // 2. Escape single/double quotes to keep inputs parameterized and structured
  // In typical setups this prevents raw quotation breakout in mock queries
  cleaned = cleaned.replace(/'/g, "’"); // Replace single quote with typographic quote
  cleaned = cleaned.replace(/"/g, "”"); // Replace double quote with typographic quote

  // 3. De-activate suspicious query constructs block (e.g. UNION SELECT, OR 1=1, DROP TABLE)
  cleaned = cleaned.replace(/\bUNION\s+SELECT\b/i, "[Injected Union-Select Blocked]");
  cleaned = cleaned.replace(/\bDROP\s+TABLE\b/i, "[Injected Drop-Table Blocked]");
  cleaned = cleaned.replace(/\bINSERT\s+INTO\b/i, "[Injected Insert-Into Blocked]");
  cleaned = cleaned.replace(/\bDELETE\s+FROM\b/i, "[Injected Delete-From Blocked]");
  cleaned = cleaned.replace(/\bOR\s+1\s*=\s*1\b/i, "[Injected tautology Blocked]");

  return cleaned;
}

/**
 * Helper to escape and clean up XSS code injection sequences.
 */
export function sanitizeXss(text: string): string {
  if (!text) return "";
  
  let safe = text;

  // 1. Remove dangerous script elements or standard HTML injection markers
  safe = safe.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[Script-Injection-Blocked]");
  
  // 2. Neutralize HTML brackets to prevent browser rendering malicious event handlers
  safe = safe.replace(/</g, "&lt;");
  safe = safe.replace(/>/g, "&gt;");

  // 3. Neutralize classic JavaScript protocol handles & dynamic events
  safe = safe.replace(/javascript:/gi, "disabled-protocol:");
  safe = safe.replace(/\bon(?:click|load|error|mouseover|focus|blur|change|submit)\b/gi, "disabled-handler");

  return safe;
}

/**
 * Perform global input sanitization for user interfaces.
 */
export function sanitizeInputText(text: string): string {
  if (!text) return "";
  // Step 1: SQL Injection Protection
  let step1 = sanitizeSqlInjection(text);
  // Step 2: XSS Script Protection
  let step2 = sanitizeXss(step1);
  return step2.trim();
}

/**
 * Verifies if the text falls under non-valid / unnecessary teenage gossip, 
 * love notes, or prank messages.
 */
export function checkTeenagersLoveOrPrank(text: string): { blocked: boolean; reason: string | null } {
  if (!text) return { blocked: false, reason: null };

  const normalizedText = text.toLowerCase();

  for (const pattern of REJECTED_WORDS) {
    if (pattern.test(normalizedText)) {
      return {
        blocked: true,
        reason: "Posts and reviews about crushes, secret admirers, romantic proposals, dating, confessions, marriages, or childhood pranks are strictly forbidden. Unwritten REC is dedicated to pure academic guidance, courses, labs, and interview-readiness (CAT, placement, internships, survival hacks)."
      };
    }
  }

  // Additional rule: Block lists of names for matchmaking
  if ((normalizedText.includes("love") || normalizedText.includes("relationship") || normalizedText.includes("cute")) && 
      (normalizedText.includes("department") || normalizedText.includes("year") || normalizedText.includes("branch"))) {
    return {
      blocked: true,
      reason: "Confession, romance, or gossiping about departments/years is not allowed. Keep all posts academic and career-focused."
    };
  }

  return { blocked: false, reason: null };
}

/**
 * Interface representing the details parsed from a Rajalakshmi student email
 */
export interface ParsedStudentEmail {
  isJunior: boolean; // 1st / 2nd year students (dot-notation structure)
  isRollNumber: boolean; // 3rd / 4th year students (numeric roll-number based)
  name?: string;
  initial?: string;
  batch?: string; // entry year, e.g. 2024
  dept?: string;  // IT, CSE, AIML, etc.
}

/**
 * Parses Rec student campusemail to extract batch, initial and department
 */
export function parseStudentEmail(email: string): ParsedStudentEmail {
  const cleanEmail = (email || '').trim().toLowerCase();
  
  if (!cleanEmail.endsWith('@rajalakshmi.edu.in')) {
    return { isJunior: false, isRollNumber: false };
  }
  
  const username = cleanEmail.split('@')[0];
  
  // If the username is entirely digits (e.g., 210701100), it's a 3rd/4th year student
  if (/^\d+$/.test(username)) {
    return { isJunior: false, isRollNumber: true };
  }
  
  const parts = username.split('.');
  
  // Find a 4-digit number (batch year) e.g., 2024, 2025
  const batchIdx = parts.findIndex(part => /^\d{4}$/.test(part));
  if (batchIdx !== -1) {
    const batch = parts[batchIdx];
    const rawDeptSuffix = parts[batchIdx + 1] || '';
    
    // Map email department suffixes to standard dbCode
    let dept = 'Other';
    const s = rawDeptSuffix.toLowerCase();
    if (s === 'it') dept = 'IT';
    else if (s === 'cse' || s === 'cs') dept = 'CSE';
    else if (s === 'aiml' || s === 'ai') dept = 'AIML';
    else if (s === 'aids' || s === 'ad') dept = 'AIDS';
    else if (s === 'csbs' || s === 'cb') dept = 'CSBS';
    else if (s === 'ece' || s === 'ec') dept = 'ECE';
    else if (s === 'eee' || s === 'ee') dept = 'EEE';
    else if (s === 'mech' || s === 'mechanical') dept = 'Mechanical';
    else if (s === 'robo' || s === 'robotics' || s === 'ra') dept = 'Robotics';
    
    // Grab name and initial
    let name = '';
    let initial = '';
    if (batchIdx >= 2) {
      initial = parts[batchIdx - 1]?.toUpperCase() || '';
      name = parts.slice(0, batchIdx - 1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || '';
    } else if (batchIdx === 1) {
      name = parts[0]?.charAt(0).toUpperCase() + parts[0]?.slice(1) || '';
    }
    
    return {
      isJunior: true,
      isRollNumber: false,
      name,
      initial,
      batch,
      dept
    };
  }
  
  return {
    isJunior: false,
    isRollNumber: false
  };
}

/**
 * Maps the post's database category to the four high-level feed categories:
 * - 'Tips', 'News', 'Announcements', 'Misc'
 */
export function getPostCategoryGroup(category: string): 'Tips' | 'News' | 'Announcements' | 'Misc' {
  if (!category) return 'Misc';
  const catLower = category.toLowerCase();
  if (catLower === 'tips' || catLower === 'notes' || catLower === 'elective') {
    return 'Tips';
  }
  if (catLower === 'news' || catLower === 'discussion') {
    return 'News';
  }
  if (catLower === 'announcements' || catLower === 'announcement') {
    return 'Announcements';
  }
  return 'Misc';
}
