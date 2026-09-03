import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc, 
  updateDoc, Timestamp 
} from 'firebase/firestore';

// Prerender-safe Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDummyKeyForBuildProcess12345',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'abhyaas-quiz.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'abhyaas-quiz',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'abhyaas-quiz.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1234567890:web:abcdef'
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ==================== 1. CATEGORY & HIERARCHY (STEP A) ====================
export type TaxonomyLevel = 'CLASS' | 'EXAM' | 'SUBJECT' | 'TOPIC' | 'DOMAIN';

export interface TaxonomyNode {
  id: string;
  level: TaxonomyLevel;
  nameEn: string;
  nameHi?: string;
  parentId?: string;
  orderIndex?: number;
  [key: string]: any;
}

export async function getTaxonomyNodes(): Promise<TaxonomyNode[]> {
  try {
    const snap = await getDocs(collection(db, 'taxonomy'));
    return snap.docs.map(d => {
      const data = d.data();
      let safeLevel: TaxonomyLevel = data.level || 'CLASS';
      if (safeLevel === 'DOMAIN') safeLevel = 'CLASS';
      return {
        id: d.id,
        level: safeLevel,
        nameEn: data.nameEn || data.name || 'Untitled Node',
        nameHi: data.nameHi || '',
        parentId: data.parentId || undefined,
        ...data
      } as TaxonomyNode;
    });
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

// ==================== 2. SITE SETTINGS & CMS (FIX FOR BANNER) ====================
export interface SiteSettings {
  headerLogoUrl?: string | null | any;
  footerLogoUrl?: string | null | any;
  bannerTitleHi?: string | null | any;
  bannerTitleEn?: string | null | any;
  scholarshipPool?: string | null | any;
  assessmentFee?: string | null | any;
  bannerGraphicUrl?: string | null | any;
  [key: string]: any;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDocs(collection(db, 'settings'));
    if (!snap.empty) {
      return snap.docs[0].data() as SiteSettings;
    }
  } catch (err) {
    console.error("Error fetching settings:", err);
  }
  return {
    bannerTitleHi: 'अखिल भारतीय छात्रवृत्ति परीक्षा 2026',
    bannerTitleEn: 'All India Mega Olympiad 2026',
    scholarshipPool: '₹2,50,000',
    assessmentFee: '₹49',
    bannerGraphicUrl: null,
    headerLogoUrl: null,
    footerLogoUrl: null
  };
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const docRef = doc(db, 'settings', 'global');
  await setDoc(docRef, settings, { merge: true });
}

// ==================== 3. PAYMENTS & PROFILES (FIX FOR PROFILE) ====================
export interface PaymentRecord {
  id: string;
  studentName: string;
  candidateName: string;
  email: string;
  phone: string;
  amount: string | number;
  status: string;
  token: string;
  rollNo: string;
  olympiadTier: string;
  paymentMethod: string;
  name: string;
  date: string;
  examDate: string;
  createdAt: any;
  [key: string]: any;
}

export async function createPaymentRecord(record: any): Promise<{ success: boolean; rollNo: string; id: string; [key: string]: any }> {
  const id = record?.id || `pay-${Date.now()}`;
  const rollNo = record?.rollNo || `ABH-${Math.floor(100000 + Math.random() * 900000)}`;
  const docRef = doc(db, 'payments', id);
  const paymentData = {
    ...record,
    id,
    rollNo,
    status: record?.status || 'SUCCESS',
    createdAt: Timestamp.now()
  };
  await setDoc(docRef, paymentData, { merge: true });
  return { success: true, rollNo, id };
}

export async function getAllPayments(): Promise<PaymentRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'payments'));
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        studentName: data.studentName || data.candidateName || 'Student',
        candidateName: data.candidateName || data.studentName || 'Student',
        email: data.email || '',
        phone: data.phone || '',
        amount: data.amount || 0,
        status: data.status || 'SUCCESS',
        token: data.token || '',
        rollNo: data.rollNo || '',
        olympiadTier: data.olympiadTier || '',
        paymentMethod: data.paymentMethod || '',
        name: data.name || '',
        date: data.date || '',
        examDate: data.examDate || '',
        createdAt: data.createdAt || null,
        ...data
      } as PaymentRecord;
    });
  } catch (err) {
    return [];
  }
}

export async function approvePaymentToken(id: string): Promise<void> {
  const docRef = doc(db, 'payments', id);
  await updateDoc(docRef, { status: 'APPROVED' });
}

// ==================== 4. LEGACY CATEGORIES & COMPATIBILITY ====================
export interface CategoryConfig {
  id: string;
  name: string;
  [key: string]: any;
}

export async function getCustomCategories(): Promise<CategoryConfig[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    return snap.docs.map(d => ({ id: d.id, name: d.data().name || 'General', ...d.data() } as CategoryConfig));
  } catch {
    return [];
  }
}

export async function saveCustomCategory(cat: CategoryConfig): Promise<void> {
  await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
}

export async function deleteCustomCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

// ==================== 5. QUESTIONS & OLYMPIADS COMPATIBILITY ====================
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
  [key: string]: any;
}

export async function getAllQuestions(): Promise<QuestionData[]> {
  try {
    const snap = await getDocs(collection(db, 'questions'));
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        subject: data.subject || 'General',
        topic: data.topic || 'General',
        questionEn: data.questionEn || data.question || 'Untitled Question',
        questionHi: data.questionHi || '',
        optionsEn: Array.isArray(data.optionsEn) ? data.optionsEn : (Array.isArray(data.options) ? data.options : ['', '', '', '']),
        optionsHi: Array.isArray(data.optionsHi) ? data.optionsHi : ['', '', '', ''],
        correctOption: typeof data.correctOption === 'number' ? data.correctOption : 0,
        approvalStatus: data.approvalStatus || 'APPROVED_PRACTICE',
        timesUsedInOlympiad: data.timesUsedInOlympiad || 0,
        explanationEn: data.explanationEn || '',
        explanationHi: data.explanationHi || '',
        ...data
      } as QuestionData;
    });
  } catch {
    return [];
  }
}

export async function createQuestion(q: QuestionData): Promise<void> {
  await setDoc(doc(db, 'questions', q.id), { ...q, createdAt: Timestamp.now() }, { merge: true });
}

export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, 'questions', id));
}

export async function updateQuestionStatus(id: string, status: ApprovalStatus): Promise<void> {
  const docRef = doc(db, 'questions', id);
  await updateDoc(docRef, { approvalStatus: status });
}

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
  [key: string]: any;
}

export async function getCustomOlympiads(): Promise<OlympiadConfig[]> {
  try {
    const snap = await getDocs(collection(db, 'olympiads'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as OlympiadConfig));
  } catch {
    return [];
  }
}

export async function saveCustomOlympiad(o: OlympiadConfig): Promise<void> {
  await setDoc(doc(db, 'olympiads', o.id), o, { merge: true });
}

export async function deleteCustomOlympiad(id: string): Promise<void> {
  await deleteDoc(doc(db, 'olympiads', id));
}

export interface SupportTicket {
  id: string;
  subject?: string;
  message?: string;
  status: string;
  [key: string]: any;
}

export async function getAllSupportTickets(): Promise<SupportTicket[]> { return []; }
export async function resolveSupportTicket(id: string): Promise<void> {}