import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc, 
  updateDoc, Timestamp, writeBatch 
} from 'firebase/firestore';

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

// ==================== 1. TAXONOMY / HIERARCHY (SECTION A) ====================
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

// ==================== 2. QUESTION BANK & RECYCLE BIN ENGINE (SECTION B) ====================
export type QuestionSegment = 'PRACTICE' | 'PYQ' | 'OLYMPIAD';

export interface QuestionData {
  id: string;
  className: string;
  examName: string;
  subjectName: string;
  topicName: string;
  segment: QuestionSegment;
  pyqYear?: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOption: number;
  explanationEn?: string;
  explanationHi?: string;
  diagramUrl?: string | null;
  // Two-Stage Deletion & Recycle Bin Controls
  isArchived?: boolean;
  status?: 'ACTIVE' | 'ARCHIVED';
  // Guaranteed string aliases for frontend compatibility
  subject: string;
  category: string;
  class: string;
  topic: string;
  approvalStatus?: string;
  timesUsedInOlympiad?: number;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

export async function getAllQuestions(): Promise<QuestionData[]> {
  try {
    const snap = await getDocs(collection(db, 'questions'));
    return snap.docs.map(d => {
      const data = d.data();
      const safeClass = String(data.className || data.class || 'Civil Services / Competitive');
      const safeExam = String(data.examName || data.category || data.exam || 'UPSC Civil Services (Prelims)');
      const safeSubject = String(data.subjectName || data.subject || 'General Studies / Geography');
      const safeTopic = String(data.topicName || data.topic || 'General');
      const safeSegment: QuestionSegment = (data.segment as QuestionSegment) || (data.approvalStatus === 'APPROVED_OLYMPIAD' ? 'OLYMPIAD' : 'PRACTICE');
      const isArchived = Boolean(data.isArchived || data.status === 'ARCHIVED');

      return {
        id: d.id,
        className: safeClass,
        examName: safeExam,
        subjectName: safeSubject,
        topicName: safeTopic,
        class: safeClass,
        category: safeExam,
        subject: safeSubject,
        topic: safeTopic,
        segment: safeSegment,
        isArchived: isArchived,
        status: isArchived ? 'ARCHIVED' : 'ACTIVE',
        pyqYear: data.pyqYear || '',
        questionEn: String(data.questionEn || data.question || 'Untitled Question'),
        questionHi: String(data.questionHi || ''),
        optionsEn: Array.isArray(data.optionsEn) ? data.optionsEn : (Array.isArray(data.options) ? data.options : ['', '', '', '']),
        optionsHi: Array.isArray(data.optionsHi) ? data.optionsHi : ['', '', '', ''],
        correctOption: typeof data.correctOption === 'number' ? data.correctOption : 0,
        explanationEn: data.explanationEn || '',
        explanationHi: data.explanationHi || '',
        diagramUrl: data.diagramUrl || null,
        timesUsedInOlympiad: data.timesUsedInOlympiad || 0,
        createdAt: data.createdAt || null,
        ...data
      } as QuestionData;
    });
  } catch (err) {
    console.error("Error fetching questions:", err);
    return [];
  }
}

export async function createQuestion(q: QuestionData): Promise<void> {
  const docRef = doc(db, 'questions', q.id);
  const payload = {
    ...q,
    category: q.examName,
    subject: q.subjectName,
    class: q.className,
    topic: q.topicName,
    isArchived: false,
    status: 'ACTIVE',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  await setDoc(docRef, payload, { merge: true });
}

export async function updateQuestion(id: string, q: Partial<QuestionData>): Promise<void> {
  const docRef = doc(db, 'questions', id);
  const payload = {
    ...q,
    category: q.examName || q.category,
    subject: q.subjectName || q.subject,
    class: q.className || q.class,
    topic: q.topicName || q.topic,
    updatedAt: Timestamp.now()
  };
  await updateDoc(docRef, payload);
}

// Stage 1 Delete: Moves question to Recycle Bin / Archived
export async function archiveQuestion(id: string): Promise<void> {
  const docRef = doc(db, 'questions', id);
  await updateDoc(docRef, {
    isArchived: true,
    status: 'ARCHIVED',
    archivedAt: Timestamp.now()
  });
}

// Restore: Brings question back from Recycle Bin to Active Bank
export async function restoreQuestion(id: string): Promise<void> {
  const docRef = doc(db, 'questions', id);
  await updateDoc(docRef, {
    isArchived: false,
    status: 'ACTIVE',
    updatedAt: Timestamp.now()
  });
}

// Stage 2 Delete: Permanently wipes question from database forever
export async function permanentlyDeleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(db, 'questions', id));
}

export async function bulkUploadQuestions(questions: QuestionData[]): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;
  questions.forEach(q => {
    const ref = doc(db, 'questions', q.id);
    batch.set(ref, {
      ...q,
      category: q.examName,
      subject: q.subjectName,
      class: q.className,
      topic: q.topicName,
      isArchived: false,
      status: 'ACTIVE',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });
    count++;
  });
  await batch.commit();
  return count;
}

export async function autoPushOlympiadQuestions(
  examOrSubject: string, 
  targetSegment: 'PRACTICE' | 'PYQ', 
  pyqYear: string = '2026'
): Promise<number> {
  const questions = await getAllQuestions();
  const batch = writeBatch(db);
  let updatedCount = 0;

  questions.forEach(q => {
    const matchesExam = q.examName === examOrSubject || q.subjectName === examOrSubject;
    if (matchesExam && q.segment === 'OLYMPIAD' && !q.isArchived) {
      const ref = doc(db, 'questions', q.id);
      batch.update(ref, {
        segment: targetSegment,
        pyqYear: targetSegment === 'PYQ' ? pyqYear : (q.pyqYear || ''),
        timesUsedInOlympiad: (q.timesUsedInOlympiad || 0) + 1,
        updatedAt: Timestamp.now()
      });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
  }
  return updatedCount;
}

// ==================== 3. SITE SETTINGS & CMS ====================
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
    if (!snap.empty) return snap.docs[0].data() as SiteSettings;
  } catch (err) {
    console.error("Error fetching settings:", err);
  }
  return {
    bannerTitleHi: 'अखिल भारतीय छात्रवृत्ति परीक्षा 2026',
    bannerTitleEn: 'All India Mega Olympiad 2026',
    scholarshipPool: '₹2,50,000',
    assessmentFee: '₹49'
  };
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const docRef = doc(db, 'settings', 'global');
  await setDoc(docRef, settings, { merge: true });
}

// ==================== 4. PAYMENTS & PROFILES ====================
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
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRecord));
  } catch {
    return [];
  }
}

// Compatibility Placeholders
export interface CategoryConfig { id: string; name: string; [key: string]: any; }
export async function getCustomCategories(): Promise<CategoryConfig[]> { return []; }
export async function saveCustomCategory(cat: any): Promise<void> {}
export async function deleteCustomCategory(id: string): Promise<void> {}
export async function getCustomOlympiads(): Promise<any[]> { return []; }
export async function saveCustomOlympiad(o: any): Promise<void> {}
export async function deleteCustomOlympiad(id: string): Promise<void> {}
export async function getAllSupportTickets(): Promise<any[]> { return []; }
export async function resolveSupportTicket(id: string): Promise<void> {}