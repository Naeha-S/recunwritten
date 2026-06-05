import { fetchCollectionFromFirestore } from "./firebase";
import { Post, ModerationRecord } from "../types";

/**
 * Checks if a student account is "new" (less than 2 approved active posts in the system).
 */
export async function isNewStudentAccount(email: string): Promise<boolean> {
  try {
    const dbPosts = await fetchCollectionFromFirestore<any>("posts");
    // Filter posts submitted by this specific email
    const studentPosts = dbPosts.filter(p => p.studentEmail === email || p.authorEmail === email);
    return studentPosts.length < 2;
  } catch (err) {
    console.warn("Could not calculate student posts count, falling back to false", err);
    return false;
  }
}

/**
 * Simple spam filter evaluating similarity.
 * Blocks identical titles, identical content, or highly repetitive snippets.
 */
export function detectSpamSimilarity(
  title: string,
  content: string,
  recentUserSubmissions: Array<{ title: string; content: string; createdAt: string }>
): { isSpam: boolean; reason?: string } {
  const normTitle = title.toLowerCase().trim();
  const normContent = content.toLowerCase().trim();

  for (const s of recentUserSubmissions) {
    const sTitle = s.title.toLowerCase().trim();
    const sContent = s.content.toLowerCase().trim();

    if (normTitle === sTitle && normTitle.length > 5) {
      return { 
        isSpam: true, 
        reason: "Duplicate title detected. You have recently posted an item with this identical heading." 
      };
    }
    if (normContent === sContent && normContent.length > 10) {
      return { 
        isSpam: true, 
        reason: "Duplicate content body detected. Please avoid posting repetitive or identical text blocks." 
      };
    }

    // Similarity check: Substring inclusion for substantial text
    if (normContent.includes(sContent) && sContent.length > 30) {
      return {
        isSpam: true,
        reason: "Abuse block: High content overlap with your previous entries."
      };
    }
  }

  return { isSpam: false };
}

/**
 * Enforces rate limiting & spam similarity checks for student submissions.
 */
export async function verifyRateAndSpamLimit(
  email: string,
  title: string,
  content: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // 1. Fetch user post database records
    const dbPosts = await fetchCollectionFromFirestore<any>("posts");
    const dbMod = await fetchCollectionFromFirestore<any>("moderationRecords");

    // Filter relevant user history items
    const userPosts = dbPosts.filter(p => p.studentEmail === email || p.authorEmail === email);
    const userMod = dbMod.filter(m => m.studentEmail === email);

    // Combine history for rate/spam checks
    const history: Array<{ title: string; content: string; createdAt: string; status: string }> = [];
    userPosts.forEach(p => {
      history.push({ title: p.title || "", content: p.content || "", createdAt: p.createdAt, status: "live" });
    });
    userMod.forEach(m => {
      history.push({ title: m.title || "", content: m.content || "", createdAt: m.createdAt, status: m.status });
    });

    // 2. SPAM CHECK: Evaluate similarity against submissions within the last 15 minutes
    const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
    const recentSubmissionsForSpam = history.filter(h => new Date(h.createdAt).getTime() > fifteenMinsAgo);
    const spamCheck = detectSpamSimilarity(title, content, recentSubmissionsForSpam);
    if (spamCheck.isSpam) {
      return { allowed: false, reason: spamCheck.reason };
    }

    // 3. RATE LIMIT CHECK
    const isNew = userPosts.length < 2;
    const nowTime = Date.now();

    if (isNew) {
      // New student accounts rate limit: at most 1 post/submission every 3 minutes
      const threeMinsAgo = nowTime - 3 * 60 * 1000;
      const recentCount = history.filter(h => new Date(h.createdAt).getTime() > threeMinsAgo).length;
      if (recentCount >= 1) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: New student accounts are restricted to 1 contribution every 3 minutes. (Next allowed in ~${Math.round((threeMinsAgo + 3 * 60 * 1000 - nowTime) / 1000)}s)`
        };
      }
    } else {
      // Regular accounts: at most 3 contributions every 5 minutes
      const fiveMinsAgo = nowTime - 5 * 60 * 1000;
      const recentCount = history.filter(h => new Date(h.createdAt).getTime() > fiveMinsAgo).length;
      if (recentCount >= 3) {
        return {
          allowed: false,
          reason: "Rate limit exceeded: Standard student accounts are limited to 3 contributions every 5 minutes."
        };
      }
    }

    return { allowed: true };
  } catch (err) {
    console.warn("Moderation database rate check failed. Falling back open.", err);
    return { allowed: true };
  }
}
