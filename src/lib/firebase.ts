import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { Post, Professor, PlacementExperience, InternshipExperience, SurvivalTip, Comment, ProfessorReview, ModerationRecord, AuditLog } from "../types";

const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const auth = getAuth(app);
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || "(default)");

// ----------------------------------------------------------------------------
// ERROR HANDLER & TYPES AS SPECIFIED IN THE INTEGRATION SKILL
// ----------------------------------------------------------------------------

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const originalMessage = error instanceof Error ? error.message : String(error);
  
  // Distinguish permissions vs network/other errors with descriptive indicators
  let descriptiveError = originalMessage;
  const isPermissionError = originalMessage.toLowerCase().includes("permission") || 
                            originalMessage.toLowerCase().includes("insufficient") ||
                            originalMessage.toLowerCase().includes("restricted");

  const isNetworkError = originalMessage.toLowerCase().includes("offline") || 
                         originalMessage.toLowerCase().includes("network") || 
                         originalMessage.toLowerCase().includes("failed to connect") ||
                         originalMessage.toLowerCase().includes("websocket") ||
                         originalMessage.toLowerCase().includes("unavailable");

  if (isPermissionError) {
    descriptiveError = `Rule-based Access Denied (PERMISSION_DENIED): The requested operation '${operationType}' on path '${path}' was blocked by Firestore Security Rules. Public read/write should be enabled in the development environment rules.`;
  } else if (isNetworkError) {
    descriptiveError = `Network Connectivity Failure (OFFLINE): Firestore is unable to reach the server. Please check your internet connection, proxy settings, or firewall rules.`;
  } else {
    descriptiveError = `Firestore Operation Error: ${originalMessage}`;
  }

  const errInfo: FirestoreErrorInfo = {
    error: descriptiveError,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error('[FIREBASE DETAIL ERROR LOG]:', JSON.stringify(errInfo, null, 2));
  
  // Throwing stringified JSON so the calling developer/environment can easily parse
  throw new Error(JSON.stringify(errInfo));
}

// Utility to clean objects of any properties that have undefined values
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined || data === null) {
    return null as any;
  }
  return JSON.parse(JSON.stringify(data)) as T;
}

// Data validation utility checking if all required fields are present and not undefined
export function validateFirestoreDocument(collectionName: string, data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    errors.push("Document data must be a non-null object.");
    return { valid: false, errors };
  }

  // Base field checking
  if (data.id === undefined) {
    errors.push("Missing required field: 'id'");
  }

  if (collectionName === "posts") {
    const requiredFields = ['title', 'content', 'department', 'category', 'authorName', 'isAnonymous', 'createdAt'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        errors.push(`Post is missing required field or it is undefined: '${field}'`);
      }
    }
  } else if (collectionName === "survivalTips") {
    const requiredFields = ['category', 'title', 'description', 'authorName', 'isAnonymous'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        errors.push(`SurvivalTip is missing required field or it is undefined: '${field}'`);
      }
    }
  } else if (collectionName === "professors") {
    const requiredFields = ['name', 'department', 'reviews'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        errors.push(`Professor is missing required field or it is undefined: '${field}'`);
      }
    }
  } else if (collectionName === "placementExperiences") {
    const requiredFields = ['title', 'company', 'role', 'rounds', 'tips', 'authorName', 'isAnonymous', 'createdAt'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        errors.push(`PlacementExperience is missing required field or it is undefined: '${field}'`);
      }
    }
  } else if (collectionName === "internshipExperiences") {
    const requiredFields = ['title', 'company', 'applicationProcess', 'authorName', 'isAnonymous', 'createdAt'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        errors.push(`InternshipExperience is missing required field or it is undefined: '${field}'`);
      }
    }
  } else if (collectionName === "moderationRecords") {
    const requiredFields = ['contentType', 'title', 'content', 'authorName', 'isAnonymous', 'studentEmail', 'createdAt', 'blockedReason', 'status', 'originalData', 'auditHistory'];
    for (const field of requiredFields) {
      if (data[field] === undefined) {
        errors.push(`ModerationRecord is missing required field or it is undefined: '${field}'`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ----------------------------------------------------------------------------
// INTERACTIVE FIRESTORE SERVICES WITH RETRY & DESCRIPTIVE FAILURES
// ----------------------------------------------------------------------------

// 1. Generic Fetcher with local fallbacks, retry logic and detailed error parsing
export async function fetchCollectionFromFirestore<T>(collectionName: string): Promise<T[]> {
  const maxRetries = 3;
  let attempt = 0;
  let lastError: any = null;

  while (attempt < maxRetries) {
    try {
      const colRef = collection(db, collectionName);
      const snap = await getDocs(colRef);
      const items: any[] = [];
      snap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      return items as T[];
    } catch (err: any) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      
      const isPermissionOrAuthError = errMsg.toLowerCase().includes("permission") || 
                                      errMsg.toLowerCase().includes("insufficient") ||
                                      errMsg.toLowerCase().includes("restricted");

      // Stop retrying immediately if it's a security/permission failure
      if (isPermissionOrAuthError) {
        break;
      }
      
      attempt++;
      if (attempt < maxRetries) {
        console.warn(`[FIREBASE RETRY] Attempt ${attempt}/${maxRetries} for collection '${collectionName}' failed. Retrying in ${attempt * 500}ms...`, err);
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }

  handleFirestoreError(lastError, OperationType.LIST, collectionName);
}

// 2. Generic Creator
export async function writeDocumentToFirestore<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  console.log(`[FIREBASE DIAGNOSTIC] Pre-write diagnostic log for collection '${collectionName}' with id '${item?.id}':`, JSON.stringify(item, null, 2));
  try {
    const sanitized = sanitizeForFirestore(item);
    const docRef = doc(db, collectionName, sanitized.id);
    await setDoc(docRef, sanitized);
    console.log(`[FIREBASE] Saved document to ${collectionName}/${sanitized.id} successfully!`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

// 2.5 Document Deleter
export async function deleteDocumentFromFirestore(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log(`[FIREBASE] Deleted document ${collectionName}/${docId} successfully!`);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}

// 3. Upvoter (supports undo/decrement)
export async function incrementDocUpvotesFirestore(collectionName: string, docId: string, currentUpvotes: number, isUndo?: boolean): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      upvotes: isUndo ? Math.max(0, currentUpvotes - 1) : currentUpvotes + 1
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${docId}`);
  }
}

// 4. Update core post with comments
export async function updatePostCommentsFirestore(postId: string, comments: Comment[]): Promise<void> {
  try {
    const sanitizedComments = sanitizeForFirestore(comments);
    const docRef = doc(db, "posts", postId);
    await updateDoc(docRef, {
      comments: sanitizedComments,
      commentsCount: sanitizedComments.length
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
  }
}

// 5. Update professor reviews list
export async function updateProfessorReviewsFirestore(profId: string, reviews: ProfessorReview[]): Promise<void> {
  try {
    const docRef = doc(db, "professors", profId);
    await updateDoc(docRef, {
      reviews: sanitizeForFirestore(reviews)
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `professors/${profId}`);
  }
}

// 6. Update single moderation record
export async function updateModerationRecordFirestore(recordId: string, updatedFields: Partial<ModerationRecord>): Promise<void> {
  try {
    const docRef = doc(db, "moderationRecords", recordId);
    await updateDoc(docRef, sanitizeForFirestore(updatedFields) as any);
    console.log(`[FIREBASE] Updated moderation record ${recordId} successfully!`);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `moderationRecords/${recordId}`);
  }
}

// Seeder Utility to auto-populate empty Firestore collections
export async function seedFirestoreDatabaseIfNecessary(
  initialPosts: Post[],
  initialProfessors: Professor[],
  initialPlacements: PlacementExperience[],
  initialInternships: InternshipExperience[],
  initialTips: SurvivalTip[]
): Promise<void> {
  try {
    // Seed core posts if empty
    const postsCol = collection(db, "posts");
    const postsSnap = await getDocs(postsCol);
    if (postsSnap.empty) {
      console.log("[FIREBASE] Seed data is empty. Seeding Core Firestore collections...");
      
      // Seed posts
      for (const p of initialPosts) {
        await setDoc(doc(db, "posts", p.id), sanitizeForFirestore(p));
      }
      // Seed professors
      for (const pr of initialProfessors) {
        await setDoc(doc(db, "professors", pr.id), sanitizeForFirestore(pr));
      }
      // Seed placementExperiences
      for (const pl of initialPlacements) {
        await setDoc(doc(db, "placementExperiences", pl.id), sanitizeForFirestore(pl));
      }
      // Seed internshipExperiences
      for (const it of initialInternships) {
        await setDoc(doc(db, "internshipExperiences", it.id), sanitizeForFirestore(it));
      }
      // Seed survivalTips
      for (const t of initialTips) {
        await setDoc(doc(db, "survivalTips", t.id), sanitizeForFirestore(t));
      }
    }

    // Seed moderation records if empty
    const modCol = collection(db, "moderationRecords");
    const modSnap = await getDocs(modCol);
    if (modSnap.empty) {
      console.log("[FIREBASE] Moderation records empty. Seeding default demo moderation records...");
      
      const seedRecords: ModerationRecord[] = [
        {
          id: "mod-rec-1",
          contentType: "post",
          title: "IT Dept HOD Secret Prank Plan",
          content: "Hey guys let's all put superglue on HOD's office keys tomorrow morning to see if he screams. Who's in? Keep it secret from the juniors.",
          authorName: "Junior IT Student",
          isAnonymous: true,
          studentEmail: "prankster.2025.it@rajalakshmi.edu.in",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          blockedReason: "AI safety filter trigger: Contamination / physical prank plans targeting college HOD/Staff.",
          status: "appealed",
          appealText: "Please approve this post, it is completely a joke or a hypothetical meme post. We are not actually putting superglue. It's just funny peer discussion.",
          appealCreatedAt: new Date(Date.now() - 1800000).toISOString(),
          originalData: {
            title: "IT Dept HOD Secret Prank Plan",
            content: "Hey guys let's all put superglue on HOD's office keys tomorrow morning to see if he screams. Who's in? Keep it secret from the juniors.",
            department: "IT",
            category: "discussion",
            tags: ["prank", "humor"],
            authorName: "Junior IT Student",
            isAnonymous: true
          },
          auditHistory: [
            {
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              action: "blocked",
              notes: "AI safety check rejected automatically.",
              operator: "System AI"
            },
            {
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              action: "appealed",
              notes: "Please approve this post, it is completely a joke or a hypothetical meme post. We are not actually putting superglue. It's just funny peer discussion.",
              operator: "prankster.2025.it@rajalakshmi.edu.in"
            }
          ]
        },
        {
          id: "mod-rec-2",
          contentType: "post",
          title: "Chemistry Lab Assistant is bad",
          content: "Don't ever talk to that lab assistant, they hate IT department students. We should throw waste water on them next week.",
          authorName: "Anonymous Senior",
          isAnonymous: true,
          studentEmail: "vengeful.2023.it@rajalakshmi.edu.in",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          blockedReason: "AI safety filter trigger: Intolerable hostility and offensive call for retaliation or violence against lab team.",
          status: "blocked",
          originalData: {
            title: "Chemistry Lab Assistant is bad",
            content: "Don't ever talk to that lab assistant, they hate IT department students. We should throw waste water on them next week.",
            department: "chemistry",
            category: "discussion",
            tags: ["complaint"],
            authorName: "Anonymous Senior",
            isAnonymous: true
          },
          auditHistory: [
            {
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              action: "blocked",
              notes: "AI safety check flagged hostile plans.",
              operator: "System AI"
            }
          ]
        },
        {
          id: "mod-rec-3",
          contentType: "post",
          title: "Is EEE department pass percentage really low?",
          content: "I heard from our seniors that CSE pass rate is 90% but EEE is like 50%? Is the curriculum super tough or standard?",
          authorName: "Sanjay Kumar",
          isAnonymous: false,
          studentEmail: "sanjay.2024.eee@rajalakshmi.edu.in",
          createdAt: new Date(Date.now() - 14400000).toISOString(),
          blockedReason: "AI safety filter trigger: Flagged for high-precision review on potential unverified college statistical claims.",
          status: "approved",
          appealText: "This is a genuine academic query! I am trying to choose which courses to dedicate extra study hours to. This is not rumor-mongering.",
          appealCreatedAt: new Date(Date.now() - 12000000).toISOString(),
          moderatorNotes: "Legitimate academic pass rates query. Overridden by moderator.",
          originalData: {
            title: "Is EEE department pass percentage really low?",
            content: "I heard from our seniors that CSE pass rate is 90% but EEE is like 50%? Is the curriculum super tough or standard?",
            department: "EEE",
            category: "discussion",
            tags: ["academics", "exams"],
            authorName: "Sanjay Kumar",
            isAnonymous: false
          },
          auditHistory: [
            {
              timestamp: new Date(Date.now() - 14400000).toISOString(),
              action: "blocked",
              notes: "Automatic system block.",
              operator: "System AI"
            },
            {
              timestamp: new Date(Date.now() - 12000000).toISOString(),
              action: "appealed",
              notes: "This is a genuine academic query! I am trying to choose which courses to dedicate extra study hours to. This is not rumor-mongering.",
              operator: "sanjay.2024.eee@rajalakshmi.edu.in"
            },
            {
              timestamp: new Date(Date.now() - 10000000).toISOString(),
              action: "approved",
              notes: "Approved. Legitimate academic pass rates query. Overridden by moderator.",
              operator: "naeha.s.2024.it@rajalakshmi.edu.in"
            }
          ]
        }
      ];

      for (const rec of seedRecords) {
        await setDoc(doc(db, "moderationRecords", rec.id), sanitizeForFirestore(rec));
      }
      console.log("[FIREBASE] Seeded default moderation records successfully!");
    } else {
      console.log("[FIREBASE] Moderation records collection already exists, skipped seeding.");
    }
  } catch (err) {
    console.warn("[FIREBASE] Error during seeding:", err);
  }
}
