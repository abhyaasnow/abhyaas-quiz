import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// ================= TYPES =================
export type ApprovalStatus = 'PENDING' | 'APPROVED_PRACTICE' | 'APPROVED_OLYMPIAD';

export interface QuestionData {
  id?: string;
  subject: string;
  topic: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOption: number;
  diagramUrl?: string | null;
  approvalStatus: ApprovalStatus;
  timesUsedInOlympiad: number;
  explanationEn?: string;
  explanationHi?: string;
  difficulty?: string;
  targetCategory?: string;
  createdAt?: any;
}

export interface SiteSettings {
  headerLogoUrl?: string | null;
  footerLogoUrl?: string | null;
  bannerTitleHi?: string;
  bannerTitleEn?: string;
  bannerGraphicUrl?: string | null;
  scholarshipPool?: string;
  assessmentFee?: string;
  examDate?: string;
}

export interface PaymentRecord {
  id?: string;
  candidateName: string;
  email: string;
  phone: string;
  rollNo: string;
  olympiadTier: string;
  amount: number;
  paymentMethod?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  tokenGenerated: boolean;
  createdAt?: any;
}

export interface SupportTicket {
  id?: string;
  candidateName: string;
  email: string;
  subject?: string;
  message: string;
  status: 'OPEN' | 'RESOLVED';
  replyText?: string;
  createdAt?: any;
}

// ---------------- TYPES FOR OLYMPIADS & CATEGORIES ----------------
export interface OlympiadConfig {
  id?: string;
  titleHi: string;
  titleEn: string;
  category: string;
  description: string;
  assessmentFee: string;
  scholarshipPool: string;
  examDate: string;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
  createdAt?: any;
}

export interface CategoryConfig {
  id?: string;
  name: string;
  description?: string;
  createdAt?: any;
}

// ================= FALLBACK DATA =================
const getFallbackCategories = (): CategoryConfig[] => [
  { id: 'cat-1', name: 'UPSC Civil Services (IAS / IPS)' },
  { id: 'cat-2', name: 'State PSC (UPPSC / BPSC / MPPCS)' },
  { id: 'cat-3', name: 'SSC CGL / Banking PO' },
  { id: 'cat-4', name: 'School Olympiad (Class 6-12)' }
];

const getFallbackOlympiads = (): OlympiadConfig[] => [
  { 
    id: 'ol-1', 
    titleHi: 'राष्ट्रीय राज्यव्यवस्था ओलंपियाड', 
    titleEn: 'National Polity Olympiad', 
    category: 'UPSC Civil Services (IAS / IPS)', 
    description: 'Comprehensive Indian Polity test.', 
    assessmentFee: '49', 
    scholarshipPool: '50000', 
    examDate: '2026-06-30', 
    status: 'ACTIVE' 
  }
];

// ================= 1. QUESTIONS CRUD =================

export async function createQuestion(question: Omit<QuestionData, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'questions'), {
      ...question,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating question in Firestore:', error);
    return { success: false, error };
  }
}

export async function getAllQuestions(): Promise<QuestionData[]> {
  try {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return []; // Return empty array instead of mock questions
    }
    
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuestionData));
  } catch (error) {
    console.warn('Firestore questions fetch error:', error);
    return []; // Return empty array on error
  }
}

export async function updateQuestionStatus(id: string, approvalStatus: ApprovalStatus) {
  try {
    const ref = doc(db, 'questions', id);
    await updateDoc(ref, { approvalStatus });
    return { success: true };
  } catch (error) {
    console.error('Error updating question status:', error);
    return { success: false, error };
  }
}

export async function deleteQuestion(id: string) {
  try {
    const ref = doc(db, 'questions', id);
    await deleteDoc(ref);
    return { success: true };
  } catch (error) {
    console.error('Error deleting question:', error);
    return { success: false, error };
  }
}

// ================= 2. SITE SETTINGS & BRAND MEDIA =================

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const ref = doc(db, 'settings', 'global_config');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }
    return null;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  try {
    const ref = doc(db, 'settings', 'global_config');
    await setDoc(ref, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating site settings:', error);
    return { success: false, error };
  }
}

// ================= 3. PAYMENTS & REGISTRATIONS =================

export async function createPaymentRecord(data: Omit<PaymentRecord, 'id' | 'rollNo' | 'createdAt' | 'tokenGenerated' | 'status'>) {
  try {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const rollNo = `ABH-2026-${randomDigits}`;

    const docRef = await addDoc(collection(db, 'payments'), {
      ...data,
      rollNo,
      status: 'SUCCESS',
      tokenGenerated: true,
      createdAt: serverTimestamp(),
    });

    return { 
      success: true, 
      id: docRef.id, 
      rollNo 
    };
  } catch (error) {
    console.error('Error creating payment record:', error);
    return { success: false, error };
  }
}

export async function getAllPayments(): Promise<PaymentRecord[]> {
  try {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRecord));
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

export const getPaymentRecords = getAllPayments;

export async function approvePaymentToken(paymentId: string) {
  try {
    const ref = doc(db, 'payments', paymentId);
    await updateDoc(ref, {
      status: 'SUCCESS',
      tokenGenerated: true,
      approvedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error approving payment:', error);
    return { success: false, error };
  }
}

// ================= 4. SUPPORT CRM TICKETS =================

export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  try {
    const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket));
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return [];
  }
}

export async function resolveSupportTicket(ticketId: string, replyText: string) {
  try {
    const ref = doc(db, 'support_tickets', ticketId);
    await updateDoc(ref, {
      status: 'RESOLVED',
      replyText,
      resolvedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error resolving support ticket:', error);
    return { success: false, error };
  }
}

// ================= 5. OLYMPIAD MANAGER =================

export async function saveCustomOlympiad(olympiad: Omit<OlympiadConfig, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'olympiads'), {
      ...olympiad,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving olympiad:', error);
    return { success: false, error };
  }
}

export async function getCustomOlympiads(): Promise<OlympiadConfig[]> {
  try {
    const q = query(collection(db, 'olympiads'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getFallbackOlympiads();
    }
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as OlympiadConfig));
  } catch (error) {
    console.warn('Error fetching Olympiads, using fallback:', error);
    return getFallbackOlympiads();
  }
}

// ================= 6. CATEGORY & STRUCTURE BUILDER =================

export async function saveCustomCategory(category: Omit<CategoryConfig, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...category,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving category:', error);
    return { success: false, error };
  }
}

export async function getCustomCategories(): Promise<CategoryConfig[]> {
  try {
    const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getFallbackCategories();
    }
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CategoryConfig));
  } catch (error) {
    console.warn('Error fetching Categories, using fallback:', error);
    return getFallbackCategories();
  }
}