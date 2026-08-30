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
  where, 
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
  createdAt?: any;
}

export interface SiteSettings {
  headerLogoUrl?: string | null;
  footerLogoUrl?: string | null;
  bannerTitleHi: string;
  bannerTitleEn: string;
  bannerGraphicUrl?: string | null;
  scholarshipPool: string;
  assessmentFee: string;
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
  paymentMethod: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  tokenGenerated: boolean;
  createdAt?: any;
}

export interface SupportTicket {
  id?: string;
  candidateName: string;
  email: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'RESOLVED';
  replyText?: string;
  createdAt?: any;
}

// ================= 1. QUESTIONS CRUD =================

export async function createQuestion(question: Omit<QuestionData, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'questions'), {
      ...question,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating question:', error);
    return { success: false, error };
  }
}

export async function getAllQuestions(): Promise<QuestionData[]> {
  try {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as QuestionData));
  } catch (error) {
    console.error('Error fetching questions:', error);
    return [];
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
    await deleteDoc(doc(db, 'questions', id));
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
    // Generate Standard National Roll Number format: ABH-2026-XXXX
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