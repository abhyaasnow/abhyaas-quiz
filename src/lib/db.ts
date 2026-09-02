import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc, 
  updateDoc, Timestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ==================== 1. SITE SETTINGS & CMS ====================
// bannerGraphicUrl aur baki fields ko string | null | undefined teeno ke liye open kiya gaya hai
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

// ==================== 2. TAXONOMY / HIERARCHY ====================
export type TaxonomyLevel = 'DOMAIN' | 'EXAM' | 'SUBJECT' | 'TOPIC';

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

// ==================== 3. CATEGORIES ====================
export interface CategoryConfig {
  id: string;
  name: string;
  [key: string]: any;
}

export async function getCustomCategories(): Promise<CategoryConfig[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CategoryConfig));
  } catch (err) {
    return [];
  }
}

export async function saveCustomCategory(cat: CategoryConfig): Promise<void> {
  await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
}

export async function deleteCustomCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', id));
}

// ==================== 4. QUESTIONS ENGINE ====================
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

export async function updateQuestionStatus(id: string, status: ApprovalStatus): Promise<void> {
  const docRef = doc(db, 'questions', id);
  await updateDoc(docRef, { approvalStatus: status });
}

// ==================== 5. OLYMPIADS ====================
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
  } catch (err) {
    return [];
  }
}

export async function saveCustomOlympiad(o: OlympiadConfig): Promise<void> {
  await setDoc(doc(db, 'olympiads', o.id), o, { merge: true });
}

export async function deleteCustomOlympiad(id: string): Promise<void> {
  await deleteDoc(doc(db, 'olympiads', id));
}

// ==================== 6. PAYMENTS ENGINE (FIXES PROFILE & OLYMPIAD) ====================
// Sabhi fields ko strict string / number dekar profile page ke 'undefined' error ko jad se khatam kiya gaya hai
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
        studentName: data.studentName || data.candidateName || '',
        candidateName: data.candidateName || data.studentName || '',
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

// ==================== 7. SUPPORT TICKETS ====================
export interface SupportTicket {
  id: string;
  subject?: string;
  message?: string;
  status: string;
  [key: string]: any;
}

export async function getAllSupportTickets(): Promise<SupportTicket[]> { return []; }
export async function resolveSupportTicket(id: string): Promise<void> {}