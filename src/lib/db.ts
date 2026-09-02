import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc, 
  updateDoc, query, orderBy, Timestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ==================== 1. TAXONOMY / HIERARCHY ====================
export type TaxonomyLevel = 'DOMAIN' | 'EXAM' | 'SUBJECT' | 'TOPIC';

export interface TaxonomyNode {
  id: string;
  level: TaxonomyLevel;
  nameEn: string;
  nameHi?: string;
  parentId?: string; // Links e.g. Topic -> Subject -> Exam -> Domain
  orderIndex?: number;
}

export async function getTaxonomyNodes(): Promise<TaxonomyNode[]> {
  try {
    const snap = await getDocs(collection(db, 'taxonomy'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as TaxonomyNode));
  } catch (err) {
    console.error("Error fetching taxonomy:", err);
    return [];
  }
}

export async function saveTaxonomyNode(node: TaxonomyNode): Promise<void> {
  const docRef = doc(db, 'taxonomy', node.id);
  await setDoc(docRef, { ...node, updatedAt: Timestamp.now() }, { merge: true });
}

export async function deleteTaxonomyNode(id: string): Promise<void> {
  await deleteDoc(doc(db, 'taxonomy', id));
}

// ==================== 2. QUESTIONS ====================
export type ApprovalStatus = 'APPROVED_PRACTICE' | 'APPROVED_OLYMPIAD' | 'PENDING' | 'REJECTED';

export interface QuestionData {
  id: string;
  subject: string;
  topic: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOption: number;
  approvalStatus: ApprovalStatus;
  timesUsedInOlympiad?: number;
  diagramUrl?: string | null;
  explanationEn?: string;
  explanationHi?: string;
}

export async function getAllQuestions(): Promise<QuestionData[]> {
  try {
    const snap = await getDocs(collection(db, 'questions'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionData));
  } catch (err) {
    console.error("Error fetching questions:", err);
    return [];
  }
}

export async function createQuestion(q: QuestionData): Promise<void> {
  await setDoc(doc(db, 'questions', q.id), { ...q, createdAt: Timestamp.now() });
}

export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, 'questions', id));
}

// ==================== 3. OLYMPIADS & COMMERCE ====================
export interface OlympiadConfig {
  id: string;
  titleEn: string;
  titleHi: string;
  category: string;
  description: string;
  assessmentFee: string;
  scholarshipPool: string;
  examDate: string;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
}

export async function getCustomOlympiads(): Promise<OlympiadConfig[]> {
  try {
    const snap = await getDocs(collection(db, 'olympiads'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as OlympiadConfig));
  } catch (err) {
    return [];
  }
}

export async function saveCustomOlympiad(o: OlympiadConfig): Promise<void> {
  await setDoc(doc(db, 'olympiads', o.id), o, { merge: true });
}

// ==================== 4. SETTINGS, PAYMENTS & SUPPORT ====================
export interface PaymentRecord {
  id: string;
  studentName?: string;
  email?: string;
  amount?: string;
  status: string;
  token?: string;
}

export interface SupportTicket {
  id: string;
  subject?: string;
  message?: string;
  status: string;
}

export async function getSiteSettings(): Promise<any> {
  return {};
}

export async function updateSiteSettings(settings: any): Promise<void> {}
export async function getAllPayments(): Promise<PaymentRecord[]> { return []; }
export async function approvePaymentToken(id: string): Promise<void> {}
export async function getAllSupportTickets(): Promise<SupportTicket[]> { return []; }
export async function resolveSupportTicket(id: string): Promise<void> {}