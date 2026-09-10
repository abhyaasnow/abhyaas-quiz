import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc, 
  Timestamp, writeBatch, query, where, limit as firestoreLimit
} from 'firebase/firestore';

export { Timestamp };

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

// ==================== STRICT ATTACHMENT & MEDIA DETECTOR ====================
export type AttachmentType = 'IMAGE' | 'PDF' | '3D' | 'GDRIVE' | 'NONE';

export interface ParsedAttachment {
  type: AttachmentType;
  rawUrl: string;
  directUrl: string;
  previewUrl?: string;
  isDrive: boolean;
}

export function parseAttachment(url: string | null | undefined): ParsedAttachment {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { type: 'NONE', rawUrl: '', directUrl: '', isDrive: false };
  }

  const clean = url.trim();

  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/)([a-zA-Z0-9_-]{25,})/;
  const match = clean.match(driveRegex);
  if (match && match[1]) {
    const fileId = match[1];
    return {
      type: 'GDRIVE',
      rawUrl: clean,
      directUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      isDrive: true
    };
  }

  if (clean.startsWith('data:image/')) {
    return { type: 'IMAGE', rawUrl: clean, directUrl: clean, isDrive: false };
  }
  if (clean.startsWith('data:application/pdf')) {
    return { type: 'PDF', rawUrl: clean, directUrl: clean, isDrive: false };
  }

  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return { type: 'NONE', rawUrl: clean, directUrl: '', isDrive: false };
  }

  const lower = clean.toLowerCase().split('?')[0];
  if (lower.endsWith('.pdf')) {
    return { type: 'PDF', rawUrl: clean, directUrl: clean, isDrive: false };
  }
  if (lower.endsWith('.mol') || lower.endsWith('.pdb') || lower.endsWith('.gltf') || lower.endsWith('.obj')) {
    return { type: '3D', rawUrl: clean, directUrl: clean, isDrive: false };
  }

  const imageExts = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.bmp', '.ico'];
  const hasImageExt = imageExts.some(ext => lower.endsWith(ext));
  const isKnownImageHost = clean.includes('images.unsplash.com') || clean.includes('wikimedia.org') || clean.includes('imgur.com') || clean.includes('cloudinary.com') || clean.includes('googleusercontent.com');

  if (hasImageExt || isKnownImageHost || clean.includes('/image')) {
    return { type: 'IMAGE', rawUrl: clean, directUrl: clean, isDrive: false };
  }

  return { type: 'NONE', rawUrl: clean, directUrl: '', isDrive: false };
}

// ==================== UNIVERSAL SCIENTIFIC & LATEX PRESERVER ====================
export function formatScientific(text: string): string {
  if (!text || typeof text !== 'string') return text || '';
  return text
    .replace(/\\le\s+ft/g, '\\left')
    .replace(/\\ri\s+ght/g, '\\right')
    .replace(/→/g, '\\to ')
    .replace(/←/g, '\\leftarrow ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/±/g, '\\pm ')
    .replace(/≠/g, '\\ne ')
    .replace(/∞/g, '\\infty ');
}

// ==================== 1. TAXONOMY / HIERARCHY ====================
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
        ...data,
        id: d.id,
        level: safeLevel,
        nameEn: data.nameEn || data.name || 'Untitled Node',
        nameHi: data.nameHi || '',
        parentId: data.parentId || undefined
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

// ==================== 2. QUESTION VAULT & RECYCLE BIN ====================
export type QuestionSegment = 'PRACTICE' | 'PYQ' | 'OLYMPIAD';

export interface QuestionData {
  id: string;
  docId: string;
  altId?: string;
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
  optionsDiagrams?: string[];
  correctOption: number;
  explanationEn?: string;
  explanationHi?: string;
  diagramUrl?: string | null;
  attachmentType?: AttachmentType;
  isArchived: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
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
      const isArchived = Boolean(data.isArchived === true || data.status === 'ARCHIVED');
      
      const safeClass = String(data.className || data.class || 'Civil Services / Competitive');
      const safeExam = String(data.examName || data.category || data.exam || 'UPSC Civil Services (Prelims)');
      const safeSubject = String(data.subjectName || data.subject || 'General Studies / Science');
      const safeTopic = String(data.topicName || data.topic || 'General');
      const safeSegment: QuestionSegment = (data.segment as QuestionSegment) || (data.approvalStatus === 'APPROVED_OLYMPIAD' ? 'OLYMPIAD' : 'PRACTICE');

      return {
        ...data,
        id: d.id,
        docId: d.id,
        altId: data.id || undefined,
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
        optionsDiagrams: Array.isArray(data.optionsDiagrams) ? data.optionsDiagrams : ['', '', '', ''],
        correctOption: typeof data.correctOption === 'number' ? data.correctOption : 0,
        explanationEn: data.explanationEn || '',
        explanationHi: data.explanationHi || '',
        diagramUrl: data.diagramUrl || null,
        timesUsedInOlympiad: data.timesUsedInOlympiad || 0,
        createdAt: data.createdAt || null
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
    questionEn: formatScientific(q.questionEn),
    questionHi: formatScientific(q.questionHi),
    optionsEn: q.optionsEn.map(o => formatScientific(o)),
    optionsHi: q.optionsHi.map(o => formatScientific(o)),
    optionsDiagrams: Array.isArray(q.optionsDiagrams) ? q.optionsDiagrams : ['', '', '', ''],
    explanationEn: formatScientific(q.explanationEn || ''),
    explanationHi: formatScientific(q.explanationHi || ''),
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
  const payload: any = { ...q, updatedAt: Timestamp.now() };
  if (q.questionEn !== undefined) payload.questionEn = formatScientific(q.questionEn);
  if (q.questionHi !== undefined) payload.questionHi = formatScientific(q.questionHi);
  if (q.optionsEn) payload.optionsEn = q.optionsEn.map(o => formatScientific(o));
  if (q.optionsHi) payload.optionsHi = q.optionsHi.map(o => formatScientific(o));
  if (q.optionsDiagrams) payload.optionsDiagrams = q.optionsDiagrams;
  if (q.explanationEn !== undefined) payload.explanationEn = formatScientific(q.explanationEn);
  if (q.explanationHi !== undefined) payload.explanationHi = formatScientific(q.explanationHi);
  if (q.examName) payload.category = q.examName;
  if (q.subjectName) payload.subject = q.subjectName;

  await setDoc(docRef, payload, { merge: true });
}

export async function archiveQuestion(id: string): Promise<void> {
  const docRef = doc(db, 'questions', id);
  await setDoc(docRef, { isArchived: true, status: 'ARCHIVED', archivedAt: Timestamp.now() }, { merge: true });
}

export async function restoreQuestion(id: string): Promise<void> {
  const docRef = doc(db, 'questions', id);
  await setDoc(docRef, { isArchived: false, status: 'ACTIVE', restoredAt: Timestamp.now() }, { merge: true });
}

export async function permanentlyDeleteQuestion(id: string, altId?: string): Promise<void> {
  await deleteDoc(doc(db, 'questions', id));
  if (altId && altId !== id) {
    try {
      await deleteDoc(doc(db, 'questions', altId));
    } catch {}
  }
}

export async function wipeAllRecycleBin(): Promise<number> {
  const questions = await getAllQuestions();
  const archived = questions.filter(q => q.isArchived);
  const batch = writeBatch(db);

  archived.forEach(q => {
    batch.delete(doc(db, 'questions', q.id));
    if (q.altId && q.altId !== q.id) {
      batch.delete(doc(db, 'questions', q.altId));
    }
  });

  if (archived.length > 0) {
    await batch.commit();
  }
  return archived.length;
}

export async function bulkUploadQuestions(questions: QuestionData[]): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;
  questions.forEach(q => {
    const ref = doc(db, 'questions', q.id);
    batch.set(ref, {
      ...q,
      questionEn: formatScientific(q.questionEn),
      questionHi: formatScientific(q.questionHi),
      optionsEn: q.optionsEn.map(o => formatScientific(o)),
      optionsHi: q.optionsHi.map(o => formatScientific(o)),
      optionsDiagrams: Array.isArray(q.optionsDiagrams) ? q.optionsDiagrams : ['', '', '', ''],
      explanationEn: formatScientific(q.explanationEn || ''),
      explanationHi: formatScientific(q.explanationHi || ''),
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

// ==================== 3. OLYMPIAD TOURNAMENT & PARTICIPANTS ENGINE ====================
export type OlympiadStatus = 'UPCOMING' | 'LIVE' | 'EVALUATING' | 'COMPLETED' | 'CANCELLED';

export interface OlympiadTournament {
  id: string;
  title: string;
  titleHi?: string;
  descriptionEn?: string;
  fee: number;
  totalGrantPool: string;
  totalSlots: number;
  bookedSlots: number;
  durationMinutes: number;
  questionsCount: number;
  targetClass: string;
  targetExam: string;
  targetSubject: string;
  topicName?: string;
  categorySection: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'GRAND' | 'SPECIAL';
  streamType: 'UPSC_PSC' | 'ENGINEERING' | 'MEDICAL' | 'SSC_BANKING' | 'LAW' | 'FOUNDATION' | 'GENERAL';
  startDateTime: string;
  scheduleText?: string;
  rules: string[];
  syllabus: { subject: string; questions: number; topics?: string }[];
  status: OlympiadStatus;
  createdAt: any;
  [key: string]: any;
}

export interface OlympiadParticipant {
  id: string;
  rollNo: string;
  candidateName: string;
  email: string;
  phone: string;
  olympiadTier: string;
  amount: number;
  paymentMethod: string;
  writtenScore?: number;
  tabSwitchCount?: number;
  vivaStatus?: 'PENDING' | 'PASSED' | 'FAILED' | 'DISQUALIFIED';
  grantAmountWon?: number;
  submittedAt?: any;
  createdAt?: any;
  [key: string]: any;
}

export interface PaymentRecord {
  id: string;
  rollNo: string;
  candidateName: string;
  email: string;
  phone: string;
  olympiadTier: string;
  tierTitle: string;
  examSlot: string;
  amount: number;
  paymentMethod: string;
  status: string;
  date: string;
  transactionId?: string;
  createdAt: any;
  [key: string]: any;
}

export async function getAllOlympiads(): Promise<OlympiadTournament[]> {
  try {
    const snap = await getDocs(collection(db, 'olympiads'));
    if (snap.empty) {
      return [];
    }
    return snap.docs.map(d => ({
      ...d.data(),
      id: d.id
    } as OlympiadTournament));
  } catch (err) {
    console.error("Error fetching olympiads:", err);
    return [];
  }
}

export async function saveOlympiadTournament(o: OlympiadTournament): Promise<void> {
  const docRef = doc(db, 'olympiads', o.id);
  await setDoc(docRef, { ...o, updatedAt: Timestamp.now() }, { merge: true });
}

export async function deleteOlympiadTournament(id: string): Promise<void> {
  await deleteDoc(doc(db, 'olympiads', id));
}

// Payment record creation (Plug-and-play architecture for future Razorpay / Cashfree webhook)
export async function createPaymentRecord(r: {
  candidateName: string;
  email: string;
  phone: string;
  olympiadTier: string;
  amount: number;
  paymentMethod?: string;
  transactionId?: string;
}): Promise<{ success: boolean; rollNo: string; participantId: string }> {
  try {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const rollNo = `ABH-2026-${randomSuffix}`;
    const newId = `part-${Date.now()}`;
    const txId = r.transactionId || `TXN-DEMO-${Date.now()}`;

    const participantRef = doc(db, 'olympiad_participants', newId);
    await setDoc(participantRef, {
      ...r,
      id: newId,
      rollNo,
      transactionId: txId,
      paymentMethod: r.paymentMethod || (r.amount === 0 ? 'Institutional Fellowship Grant' : 'Verified Gateway Checkout'),
      writtenScore: 0,
      tabSwitchCount: 0,
      vivaStatus: 'PENDING',
      isSubmitted: false,
      createdAt: Timestamp.now()
    });

    return { success: true, rollNo, participantId: newId };
  } catch (err) {
    console.error("Error creating participant record:", err);
    return { success: false, rollNo: '', participantId: '' };
  }
}

export async function getAllOlympiadParticipants(): Promise<OlympiadParticipant[]> {
  try {
    const snap = await getDocs(collection(db, 'olympiad_participants'));
    return snap.docs.map(d => ({
      ...d.data(),
      id: d.id
    } as OlympiadParticipant));
  } catch (err) {
    console.error("Error fetching participants:", err);
    return [];
  }
}

export async function updateParticipantViva(
  id: string, 
  vivaStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'DISQUALIFIED',
  grantAmountWon: number = 0
): Promise<void> {
  const docRef = doc(db, 'olympiad_participants', id);
  await setDoc(docRef, {
    vivaStatus,
    grantAmountWon,
    vivaVerifiedAt: Timestamp.now()
  }, { merge: true });
}

export async function getAllPayments(): Promise<PaymentRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'olympiad_participants'));
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        rollNo: String(data.rollNo || ''),
        candidateName: String(data.candidateName || ''),
        email: String(data.email || ''),
        phone: String(data.phone || ''),
        olympiadTier: String(data.olympiadTier || ''),
        tierTitle: String(data.tierTitle || data.olympiadTier || 'Academic Olympiad'),
        examSlot: String(data.examSlot || 'Sunday Synchronized Slot'),
        amount: typeof data.amount === 'number' ? data.amount : 0,
        paymentMethod: String(data.paymentMethod || 'Online Verified'),
        status: String(data.status || 'PAID'),
        date: String(data.date || new Date().toLocaleDateString('en-IN')),
        transactionId: String(data.transactionId || ''),
        createdAt: data.createdAt || null,
        ...data
      } as PaymentRecord;
    });
  } catch (err) {
    console.error("Error fetching payments:", err);
    return [];
  }
}

// ==================== 4. LIVE EXAM HALL CONNECTOR & RESULT SAVER ====================
export async function getOlympiadQuestionsForCandidate(
  targetSubjectOrExam: string = '', 
  questionLimit: number = 10
): Promise<QuestionData[]> {
  try {
    const all = await getAllQuestions();
    const olympiadPool = all.filter(q => q.segment === 'OLYMPIAD' && !q.isArchived);

    if (olympiadPool.length === 0) {
      // Fallback to active practice bank if olympiad vault is empty
      return all.filter(q => !q.isArchived).slice(0, questionLimit);
    }

    if (!targetSubjectOrExam.trim()) {
      return olympiadPool.slice(0, questionLimit);
    }

    const filtered = olympiadPool.filter(q => 
      q.examName.toLowerCase().includes(targetSubjectOrExam.toLowerCase()) ||
      q.subjectName.toLowerCase().includes(targetSubjectOrExam.toLowerCase()) ||
      q.topicName.toLowerCase().includes(targetSubjectOrExam.toLowerCase())
    );

    return (filtered.length >= questionLimit ? filtered : olympiadPool).slice(0, questionLimit);
  } catch (err) {
    console.error("Error fetching Olympiad questions for exam hall:", err);
    return [];
  }
}

export async function submitOlympiadResult(
  rollNo: string, 
  writtenScorePercent: number, 
  tabSwitchCount: number = 0
): Promise<{ success: boolean; vivaEligible: boolean }> {
  try {
    const snap = await getDocs(query(collection(db, 'olympiad_participants'), where('rollNo', '==', rollNo), firestoreLimit(1)));
    if (snap.empty) {
      return { success: false, vivaEligible: false };
    }

    const participantDoc = snap.docs[0];
    const isVivaEligible = writtenScorePercent >= 75 && tabSwitchCount <= 2;

    await setDoc(doc(db, 'olympiad_participants', participantDoc.id), {
      writtenScore: writtenScorePercent,
      tabSwitchCount,
      isSubmitted: true,
      vivaStatus: isVivaEligible ? 'PENDING' : 'DISQUALIFIED',
      submittedAt: Timestamp.now()
    }, { merge: true });

    return { success: true, vivaEligible: isVivaEligible };
  } catch (err) {
    console.error("Error submitting Olympiad result:", err);
    return { success: false, vivaEligible: false };
  }
}

// ==================== 5. ONE-CLICK PRODUCTION SEED: BRICS 10-QUESTION DEMO ====================
export async function seedBricsOlympiadDemo(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Create Official BRICS Olympiad Tournament Session
    const bricsTournament: OlympiadTournament = {
      id: `oly-brics-${Date.now()}`,
      title: 'All-India BRICS Geopolitics & Global Governance Fellowship Evaluation',
      descriptionEn: 'The All-India BRICS Geopolitics & Global Governance Fellowship Evaluation is a standardized, high-rigor merit assessment designed to benchmark advanced analytical aptitude in contemporary international relations, geoeconomics, and multilateral diplomacy. Anchored in the UPSC Civil Services Examination framework, qualifying scholars (≥75%) are shortlisted for an endowed academic research grant, subject to defending their analytical rationale in a mandatory 1-on-1 Faculty Viva Voce.',
      fee: 49,
      totalGrantPool: '₹15,000',
      totalSlots: 500,
      bookedSlots: 0,
      durationMinutes: 10,
      questionsCount: 10,
      categorySection: 'WEEKLY',
      streamType: 'UPSC_PSC',
      targetClass: 'Civil Services / Competitive',
      targetExam: 'UPSC Civil Services (Prelims)',
      targetSubject: 'General Studies / Polity & International Relations',
      topicName: 'BRICS Expansion & Geopolitics',
      startDateTime: '2026-09-13T10:00',
      scheduleText: 'Sunday 10:00 AM (Synchronized Proctored Slot)',
      rules: [
        "Objective Evaluation: Strict per-question clock with forward-only progression to prevent external relay.",
        "Environment Integrity: Screen defocus alert threshold of 2 warnings prior to automatic script finalization.",
        "Faculty Defense: Candidates scoring ≥75% defend analytical reasoning in viva voce before academic grant sanction.",
        "Zero Tolerance: Proxy attempts result in permanent blacklisting from national fellowship registers."
      ],
      syllabus: [
        { subject: 'Institutional Origins & Architecture', questions: 2, topics: 'Goldman Sachs (2001) to Yekaterinburg (2009), Sanya 2011' },
        { subject: 'Multilateral Financial Mechanisms', questions: 3, topics: 'NDB Governance, CRA Liquidity, Local Currency Settlements' },
        { subject: 'Strategic Expansion & Geoeconomics', questions: 3, topics: 'Johannesburg 2023 Accession, Maritime Chokepoints, Kazan 2024' },
        { subject: "India's Strategic Balancing & Initiatives", questions: 2, topics: 'Reformed Multilateralism, BARP Platform, Vaccine R&D' }
      ],
      status: 'UPCOMING',
      createdAt: Timestamp.now()
    };

    await saveOlympiadTournament(bricsTournament);

    // 2. Ten UPSC-Standard Questions (Bilingual + Full Explanations)
    const bricsQuestions: QuestionData[] = [
      {
        id: `q-brics-1`,
        docId: `q-brics-1`,
        className: 'Civil Services / Competitive',
        examName: 'UPSC Civil Services (Prelims)',
        subjectName: 'General Studies / Polity & International Relations',
        topicName: 'BRICS Expansion & Geopolitics',
        category: 'UPSC Civil Services (Prelims)',
        subject: 'General Studies / Polity & International Relations',
        class: 'Civil Services / Competitive',
        topic: 'BRICS Expansion & Geopolitics',
        segment: 'OLYMPIAD',
        questionEn: "With reference to the historical evolution and institutional origin of BRICS, consider the following statements:\n1. The acronym 'BRIC' was originally coined by British economist Jim O'Neill in a 2001 Goldman Sachs policy paper.\n2. South Africa was formally inducted into the group at the 2011 Sanya Summit in China, transforming BRIC into BRICS.\n3. The first formal foreign ministers' meeting of BRIC took place on the sidelines of the UN General Assembly debate in 2006.\n\nWhich of the statements given above are correct?",
        questionHi: "ब्रिक्स (BRICS) के ऐतिहासिक विकास एवं संस्थागत उद्भव के संदर्भ में, निम्नलिखित कथनों पर विचार कीजिए:\n1. 'ब्रिक' (BRIC) शब्द मूल रूप से ब्रिटिश अर्थशास्त्री जिम ओ'नील द्वारा 2001 के गोल्डमैन सैक्स नीति पत्र में गढ़ा गया था।\n2. दक्षिण अफ्रीका को औपचारिक रूप से चीन के सान्या शिखर सम्मेलन (2011) में समूह में शामिल किया गया था, जिससे ब्रिक 'ब्रिक्स' बन गया।\n3. ब्रिक के विदेश मंत्रियों की पहली औपचारिक बैठक 2006 में संयुक्त राष्ट्र महासभा (UNGA) की बहस के इतर आयोजित हुई थी।\n\nउपर्युक्त कथनों में से कौन-से सही हैं?",
        optionsEn: ["1 and 2 only", "2 and 3 only", "1 and 3 only", "1, 2 and 3"],
        optionsHi: ["केवल 1 और 2", "केवल 2 और 3", "केवल 1 और 3", "1, 2 और 3"],
        correctOption: 3,
        explanationEn: "In 2001, Jim O'Neill coined BRIC. Followed by preliminary talks at the UNGA in 2006, the first leaders' summit took place in Yekaterinburg in 2009. South Africa formally attended as a full member in Sanya in 2011.",
        explanationHi: "2001 में जिम ओ'नील ने BRIC शब्द गढ़ा। 2006 में यूएन महासभा के दौरान बैठकों के बाद 2009 में पहला शिखर सम्मेलन हुआ। दक्षिण अफ्रीका ने 2011 के सान्या सम्मेलन में पहली बार पूर्ण सदस्य के रूप में भाग लिया।",
        isArchived: false,
        status: 'ACTIVE'
      },
      {
        id: `q-brics-2`,
        docId: `q-brics-2`,
        className: 'Civil Services / Competitive',
        examName: 'UPSC Civil Services (Prelims)',
        subjectName: 'General Studies / Polity & International Relations',
        topicName: 'BRICS Expansion & Geopolitics',
        category: 'UPSC Civil Services (Prelims)',
        subject: 'General Studies / Polity & International Relations',
        class: 'Civil Services / Competitive',
        topic: 'BRICS Expansion & Geopolitics',
        segment: 'OLYMPIAD',
        questionEn: "With reference to the New Development Bank (NDB), consider the following statements:\n1. The agreement establishing the NDB was signed during the 6th BRICS Summit in Fortaleza (2014).\n2. Voting power in the NDB is strictly proportional to capital subscription with no equal allocation.\n3. Membership in the NDB is legally restricted exclusively to founding BRICS member nations.\n\nWhich of the statements given above is/are correct?",
        questionHi: "न्यू डेवलपमेंट बैंक (NDB) के संदर्भ में, निम्नलिखित कथनों पर विचार कीजिए:\n1. NDB की स्थापना का समझौता 2014 में फोर्टालेजा में आयोजित छठे ब्रिक्स शिखर सम्मेलन के दौरान हस्ताक्षरित हुआ था।\n2. NDB में मतदान शक्ति प्रत्येक सदस्य देश की पूंजी अभिदान के सीधे आनुपातिक है, जिसमें कोई समान आवंटन नहीं है।\n3. NDB की सदस्यता कानूनी रूप से केवल संस्थापक ब्रिक्स देशों तक ही सीमित है।\n\nउपर्युक्त कथनों में से कौन-सा/से सही है/हैं?",
        optionsEn: ["1 only", "1 and 2 only", "2 and 3 only", "1, 2 and 3"],
        optionsHi: ["केवल 1", "केवल 1 और 2", "केवल 2 और 3", "1, 2 और 3"],
        correctOption: 0,
        explanationEn: "The Fortaleza Declaration (2014) established the NDB. Founding members have equal shareholding and equal voting rights (20% each) without veto power. Non-BRICS members (e.g. Egypt, UAE, Bangladesh) are also admitted.",
        explanationHi: "2014 के फोर्टालेजा घोषणा-पत्र के तहत NDB बना। संस्थापक सदस्यों के पास समान 20% शेयर और मतदान अधिकार हैं। NDB की सदस्यता गैर-ब्रिक्स देशों (मिस्र, यूएई, बांग्लादेश) के लिए भी खुली है।",
        isArchived: false,
        status: 'ACTIVE'
      },
      {
        id: `q-brics-3`,
        docId: `q-brics-3`,
        className: 'Civil Services / Competitive',
        examName: 'UPSC Civil Services (Prelims)',
        subjectName: 'General Studies / Polity & International Relations',
        topicName: 'BRICS Expansion & Geopolitics',
        category: 'UPSC Civil Services (Prelims)',
        subject: 'General Studies / Polity & International Relations',
        class: 'Civil Services / Competitive',
        topic: 'BRICS Expansion & Geopolitics',
        segment: 'OLYMPIAD',
        questionEn: "The Contingent Reserve Arrangement (CRA) established by the BRICS framework is primarily designed to:\n(A) Provide zero-interest soft loans for infrastructure projects in Africa.\n(B) Serve as a financial safety net to provide short-term balance-of-payments liquidity during currency crises.\n(C) Directly replace the SWIFT interbank messaging network.\n(D) Regulate bilateral customs tariffs and dispute arbitration.",
        questionHi: "ब्रिक्स रूपरेखा के तहत स्थापित आकस्मिक आरक्षित व्यवस्था (Contingent Reserve Arrangement - CRA) का प्राथमिक उद्देश्य क्या है?",
        optionsEn: [
          "Provide zero-interest soft loans for infrastructure projects in Africa",
          "Serve as a financial safety net to provide short-term balance-of-payments liquidity during currency crises",
          "Directly replace the SWIFT interbank messaging network",
          "Regulate bilateral customs tariffs and dispute arbitration"
        ],
        optionsHi: [
          "अफ्रीका में अवसंरचना परियोजनाओं हेतु शून्य-ब्याज रियायती ऋण प्रदान करना",
          "मुद्रा संकट के दौरान अल्पकालिक भुगतान संतुलन (BoP) तरलता प्रदान करने हेतु वित्तीय सुरक्षा तंत्र के रूप में कार्य करना",
          "स्विफ्ट (SWIFT) इंटरबैंक मैसेजिंग नेटवर्क को सीधे प्रतिस्थापित करना",
          "द्विपक्षीय सीमा शुल्क एवं विवाद मध्यस्थता का नियमन करना"
        ],
        correctOption: 1,
        explanationEn: "The $100 billion Contingent Reserve Arrangement (CRA) provides mutual financial support via short-term liquidity currency swaps to mitigate balance-of-payments (BoP) pressures and exchange rate volatility.",
        explanationHi: "100 बिलियन डॉलर का CRA ढांचा भुगतान संतुलन (BoP) के दबाव और विनिमय दर में भारी उतार-चढ़ाव के समय सदस्य देशों को अल्पकालिक मुद्रा स्वैप तरलता सहायता प्रदान करता है।",
        isArchived: false,
        status: 'ACTIVE'
      },
      {
        id: `q-brics-4`,
        docId: `q-brics-4`,
        className: 'Civil Services / Competitive',
        examName: 'UPSC Civil Services (Prelims)',
        subjectName: 'General Studies / Polity & International Relations',
        topicName: 'BRICS Expansion & Geopolitics',
        category: 'UPSC Civil Services (Prelims)',
        subject: 'General Studies / Polity & International Relations',
        class: 'Civil Services / Competitive',
        topic: 'BRICS Expansion & Geopolitics',
        segment: 'OLYMPIAD',
        questionEn: "At the 15th BRICS Summit held in Johannesburg (2023), which cohort of nations was formally invited to become full members under the historic expansion phase?",
        questionHi: "जोहान्सबर्ग में आयोजित 15वें ब्रिक्स शिखर सम्मेलन (2023) में किस राष्ट्र समूह को ऐतिहासिक विस्तार के तहत पूर्ण सदस्य बनने हेतु आमंत्रित किया गया था?",
        optionsEn: [
          "Argentina, Egypt, Ethiopia, Iran, Saudi Arabia, and the United Arab Emirates",
          "Turkey, Indonesia, Nigeria, Mexico, and Vietnam",
          "Egypt, Singapore, Malaysia, South Africa, and Kazakhstan",
          "Qatar, Bahrain, Kuwait, Oman, and Algeria"
        ],
        optionsHi: [
          "अर्जेंटीना, मिस्र, इथियोपिया, ईरान, सऊदी अरब और संयुक्त अरब अमीरात",
          "तुर्की, इंडोनेशिया, नाइजीरिया, मेक्सिको और वियतनाम",
          "मिस्र, सिंगापुर, मलेशिया, दक्षिण अफ्रीका और कजाकिस्तान",
          "कतर, बहरीन, कुवैत, ओमान और अल्जीरिया"
        ],
        correctOption: 0,
        explanationEn: "The Johannesburg II declaration invited six countries: Argentina, Egypt, Ethiopia, Iran, Saudi Arabia, and UAE. Argentina opted out under a new administration, while Egypt, Ethiopia, Iran, and UAE formally entered as full members.",
        explanationHi: "जोहान्सबर्ग में 6 देशों को निमंत्रण दिया गया था। अर्जेंटीना ने बाद में इनकार कर दिया, जबकि मिस्र, इथियोपिया, ईरान और यूएई औपचारिक रूप से पूर्ण सदस्य के रूप में जुड़े।",
        isArchived: false,
        status: 'ACTIVE'
      },
      {
        id: `q-brics-5`,
        docId: `q-brics-5`,
        className: 'Civil Services / Competitive',
        examName: 'UPSC Civil Services (Prelims)',
        subjectName: 'General Studies / Polity & International Relations',
        topicName: 'BRICS Expansion & Geopolitics',
        category: 'UPSC Civil Services (Prelims)',
        subject: 'General Studies / Polity & International Relations',
        class: 'Civil Services / Competitive',
        topic: 'BRICS Expansion & Geopolitics',
        segment: 'OLYMPIAD',
        questionEn: "Consider the following statements regarding the geopolitical and geoeconomic implications of the expanded BRICS:\n1. The expanded group accounts for over 40% of global crude oil production capacity.\n2. The group commands vital maritime chokepoints, notably the Strait of Hormuz and the Bab-el-Mandeb strait.\n3. Every member state of the expanded BRICS is a signatory and ratified party to the Rome Statute of the International Criminal Court (ICC).\n\nWhich of the statements given above are correct?",
        questionHi: "विस्तारित ब्रिक्स के भू-राजनीतिक एवं भू-आर्थिक प्रभावों के संबंध में, निम्नलिखित कथनों पर विचार कीजिए:\n1. विस्तारित समूह वैश्विक कच्चे तेल उत्पादन क्षमता के 40% से अधिक का प्रतिनिधित्व करता है।\n2. यह समूह महत्वपूर्ण समुद्री चोकपॉइंट्स, विशेष रूप से होर्मुज जलडमरूमध्य और बाब-अल-मंदेब पर भौगोलिक प्रभाव रखता है।\n3. विस्तारित ब्रिक्स का प्रत्येक सदस्य देश अंतर्राष्ट्रीय आपराधिक न्यायालय (ICC) के रोम संविधि का अनुसमर्थित पक्षकार है।\n\nउपर्युक्त कथनों में से कौन-से सही हैं?",
        optionsEn: ["1 and 2 only", "2 and 3 only", "1 and 3 only", "1, 2 and 3"],
        optionsHi: ["केवल 1 और 2", "केवल 2 और 3", "केवल 1 और 3", "1, 2 और 3"],
        correctOption: 0,
        explanationEn: "BRICS accounts for over 42% of global crude oil output and commands Hormuz and Bab-el-Mandeb. Statement 3 is false as India, Russia, China, and Iran are not state parties to the Rome Statute.",
        explanationHi: "कथन 1 और 2 सही हैं। कथन 3 गलत है क्योंकि भारत, चीन, रूस और ईरान ICC के रोम संविधि के पक्षकार देश नहीं हैं।",
        isArchived: false,
        status: 'ACTIVE'
      },
      {
        id: `q-brics-6`,
        docId: `q-brics-6`,
        className: 'Civil Services / Competitive',
        examName: 'UPSC Civil Services (Prelims)',
        subjectName: 'General Studies / Polity & International Relations',
        topicName: 'BRICS Expansion & Geopolitics',
        category: 'UPSC Civil Services (Prelims)',
        subject: 'General Studies / Polity & International Relations',
        class: 'Civil Services / Competitive',
        topic: 'BRICS Expansion & Geopolitics',
        segment: 'OLYMPIAD',
        questionEn: "In the discourse on international economic policy, the term 'De-dollarization' advocated within recent BRICS declarations refers to:",
        questionHi: "अंतर्राष्ट्रीय आर्थिक नीति में, हाल के ब्रिक्स घोषणा-पत्रों में उल्लिखित 'डी-डॉलरीकरण' (De-dollarization) का क्या अर्थ है?",
        optionsEn: [
          "Complete international prohibition of holding United States Treasury securities by central banks",
          "Promoting bilateral trade settlements in domestic sovereign currencies and exploring common multilateral digital payment frameworks to mitigate unilateral sanctions exposure",
          "The immediate adoption of a uniform paper currency circulating physically across all BRICS capital cities",
          "Mandatory pegging of all BRICS national currencies directly to the physical spot price of gold"
        ],
        optionsHi: [
          "केंद्रीय बैंकों द्वारा अमेरिकी ट्रेजरी प्रतिभूतियों को रखने पर पूर्ण प्रतिबंध लगाना",
          "एकपक्षीय प्रतिबंधों के जोखिम को कम करने हेतु राष्ट्रीय मुद्राओं में द्विपक्षीय व्यापार निपटान को बढ़ावा देना एवं बहुपक्षीय डिजिटल भुगतान तंत्र विकसित करना",
          "सभी ब्रिक्स राजधानियों में भौतिक रूप से परिचालित होने वाली एक समान कागजी मुद्रा को लागू करना",
          "ब्रिक्स के सभी सदस्य देशों की मुद्राओं को अनिवार्य रूप से सोने के हाजिर मूल्य से जोड़ना"
        ],
        correctOption: 1,
        explanationEn: "De-dollarization focuses on bilateral local currency settlements (e.g. Rupee-Ruble) and digital payment frameworks (like BRICS Pay) rather than immediate single physical currency creation.",
        explanationHi: "डी-डॉलरीकरण का व्यावहारिक रूप द्विपक्षीय व्यापार का अपनी स्थानीय मुद्राओं में निपटान और डिजिटल भुगतान नेटवर्क विकसित करना है, न कि एकल कागजी मुद्रा छापना।",
        isArchived: false,
        status: 'ACTIVE'
      },
      {
        id: `q-brics-7`,
        docId: `q-brics-7`,
        className: 'Civil Services / Competitive',
        examName: 'UPSC Civil Services (Prelims)',
        subjectName: 'General Studies / Polity & International Relations',
        topicName: 'BRICS Expansion & Geopolitics',
        category: 'UPSC Civil Services (Prelims)',
        subject: 'General Studies / Polity & International Relations',
        class: 'Civil Services / Competitive',
        topic: 'BRICS Expansion & Geopolitics',
        segment: 'OLYMPIAD',
        questionEn: "Which of the following initiatives was launched under India's BRICS Chairmanship in 2021?",
        questionHi: "2021 में भारत की ब्रिक्स अध्यक्षता के दौरान निम्नलिखित में से किन पहलों को औपचारिक रूप से शुरू किया गया था?",
        optionsEn: [
          "BRICS Agricultural Research Platform (BARP) operationalization",
          "BRICS Counter-Terrorism Action Plan",
          "Digital BRICS Task Force on Green Infrastructure",
          "Both A and B"
        ],
        optionsHi: [
          "ब्रिक्स कृषि अनुसंधान मंच (BARP) का संचालन",
          "ब्रिक्स आतंकवाद-विरोधी कार्य योजना",
          "हरित अवसंरचना पर डिजिटल ब्रिक्स टास्क फोर्स",
          "A और B दोनों"
        ],
        correctOption: 3,
        explanationEn: "Under India's 2021 Chairmanship, the BRICS Agricultural Research Platform (BARP) was operationalized in New Delhi, alongside formal adoption of the BRICS Counter-Terrorism Action Plan.",
        explanationHi: "भारत की 2021 अध्यक्षता में नई दिल्ली में 'ब्रिक्स कृषि अनुसंधान मंच' (BARP) और 'ब्रिक्स आतंकवाद-विरोधी कार्य योजना' दोनों को शुरू किया गया था।",
        isArchived: false,
        status: 'ACTIVE'
      },
      {
        id: `q-brics-8`,
        docId: `q-brics-8`,
        className: 'Civil Services / Competitive',
        examName: 'UPSC Civil Services (Prelims)',
        subjectName: 'General Studies / Polity & International Relations',
        topicName: 'BRICS Expansion & Geopolitics',
        category: 'UPSC Civil Services (Prelims)',
        subject: 'General Studies / Polity & International Relations',
        class: 'Civil Services / Competitive',
        topic: 'BRICS Expansion & Geopolitics',
        segment: 'OLYMPIAD',
        questionEn: "With respect to India's strategic balancing policy within BRICS, which statement reflects India's official stance regarding institutional reforms?",
        questionHi: "ब्रिक्स के भीतर भारत की रणनीतिक संतुलन नीति के संबंध में, कौन-सा कथन संस्थागत सुधारों पर भारत के आधिकारिक रुख को दर्शाता है?",
        optionsEn: [
          "India seeks to transform BRICS into an overtly anti-Western geopolitical military pact",
          "India advocates for reforming global governance (UNSC, IMF, World Bank) to reflect multipolarity, while rejecting zero-sum anti-Western alignment",
          "India supports unilateral trade tariff impositions by member states without multilateral consultation",
          "India advocates replacing the UN General Assembly with an expanded BRICS Secretariat"
        ],
        optionsHi: [
          "भारत ब्रिक्स को एक स्पष्ट पश्चिमी-विरोधी भू-राजनीतिक सैन्य गठबंधन में बदलना चाहता है",
          "भारत वैश्विक शासन (UNSC, IMF, विश्व बैंक) में बहुध्रुवीयता लाने हेतु सुधारों का समर्थन करता है, न कि शून्य-योग पश्चिमी-विरोधी गुटबाजी का",
          "भारत बहुपक्षीय विचार-विमर्श के बिना सदस्य देशों द्वारा एकतरफा व्यापार शुल्क थोपने का समर्थन करता है",
          "भारत संयुक्त राष्ट्र महासभा को विस्तारित ब्रिक्स सचिवालय द्वारा प्रतिस्थापित करने की वकालत करता है"
        ],
        correctOption: 1,
        explanationEn: "India approaches BRICS as non-Western rather than anti-Western, championing 'reformed multilateralism' for UNSC and IMF while preserving multi-alignment with Quad and global partners.",
        explanationHi: "भारत ब्रिक्स को 'पश्चिम-विरोधी' नहीं बल्कि 'गैर-पश्चिमी' मंच मानता है और UNSC व IMF में सुधारों की वकालत करते हुए क्वाड (Quad) के साथ भी संतुलित संबंध बनाए रखता है।",
        isArchived: false,
        status: 'ACTIVE'
      },
      {
        id: `q-brics-9`,
        docId: `q-brics-9`,
        className: 'Civil Services / Competitive',
        examName: 'UPSC Civil Services (Prelims)',
        subjectName: 'General Studies / Polity & International Relations',
        topicName: 'BRICS Expansion & Geopolitics',
        category: 'UPSC Civil Services (Prelims)',
        subject: 'General Studies / Polity & International Relations',
        class: 'Civil Services / Competitive',
        topic: 'BRICS Expansion & Geopolitics',
        segment: 'OLYMPIAD',
        questionEn: "Consider the following statements regarding the BRICS Vaccine R&D Centre:\n1. It was officially launched during the 2022 Chinese Chairmanship via a virtual ceremony.\n2. The physical laboratory infrastructure is centralized solely in Moscow, Russia.\n3. It aims to share preclinical and clinical data and facilitate emergency response capabilities among member states.\n\nWhich of the statements given above is/are correct?",
        questionHi: "ब्रिक्स वैक्सीन आर एंड डी केंद्र (BRICS Vaccine R&D Centre) के संबंध में, निम्नलिखित कथनों पर विचार कीजिए:\n1. इसे 2022 में चीन की अध्यक्षता के दौरान आधिकारिक तौर पर शुरू किया गया था।\n2. इसकी भौतिक प्रयोगशाला अवसंरचना केवल मॉस्को, रूस में केंद्रीकृत है।\n3. इसका उद्देश्य प्री-क्लिनिकल और क्लिनिकल डेटा साझा करना और सदस्य देशों में आपातकालीन स्वास्थ्य प्रतिक्रिया क्षमताओं को मजबूत करना है।\n\nउपर्युक्त कथनों में से कौन-सा/से सही है/हैं?",
        optionsEn: ["1 and 2 only", "1 and 3 only", "2 and 3 only", "3 only"],
        optionsHi: ["केवल 1 और 2", "केवल 1 और 3", "केवल 2 और 3", "केवल 3"],
        correctOption: 1,
        explanationEn: "Inaugurated in 2022 under China's chairmanship, it operates on a networked hub-and-spoke model connecting national research centers (including ICMR in India), not a single lab in Moscow.",
        explanationHi: "2022 में शुरू हुआ यह केंद्र एकल मॉस्को प्रयोगशाला नहीं है, बल्कि सभी सदस्य देशों के राष्ट्रीय संस्थानों (जैसे ICMR) का एक नेटवर्क आधारित तंत्र है।",
        isArchived: false,
        status: 'ACTIVE'
      },
      {
        id: `q-brics-10`,
        docId: `q-brics-10`,
        className: 'Civil Services / Competitive',
        examName: 'UPSC Civil Services (Prelims)',
        subjectName: 'General Studies / Polity & International Relations',
        topicName: 'BRICS Expansion & Geopolitics',
        category: 'UPSC Civil Services (Prelims)',
        subject: 'General Studies / Polity & International Relations',
        class: 'Civil Services / Competitive',
        topic: 'BRICS Expansion & Geopolitics',
        segment: 'OLYMPIAD',
        questionEn: "The Kazan Summit (2024) held under Russia's chairmanship focused significantly on establishing which institutional category for prospective aspirant countries?",
        questionHi: "रूस की अध्यक्षता में आयोजित कजान शिखर सम्मेलन (2024) में आकांक्षी देशों के लिए किस नई संस्थागत श्रेणी को स्थापित करने पर मुख्य ध्यान दिया गया?",
        optionsEn: [
          "Non-Aligned Observer Missions",
          "BRICS Partner Countries (Partner State Status)",
          "Associate NATO Liaisons",
          "Permanent Treaty Allies"
        ],
        optionsHi: [
          "गुटनिरपेक्ष पर्यवेक्षक मिशन",
          "ब्रिक्स भागीदार देश (BRICS Partner Country Status)",
          "एसोसिएट नाटो संपर्क",
          "स्थायी संधि सहयोगी"
        ],
        correctOption: 1,
        explanationEn: "The 16th BRICS Summit in Kazan, Russia, formalized the 'BRICS Partner Country' status to accommodate 30+ interested nations without immediately overloading consensus-driven full membership.",
        explanationHi: "कजान शिखर सम्मेलन में 30 से अधिक इच्छुक देशों को शामिल करने हेतु 'ब्रिक्स पार्टनर स्टेट' (भागीदार देश) की श्रेणी बनाई गई ताकि पूर्ण सदस्यता के बिना भी वे नीतिगत कार्यसमूहों में शामिल हो सकें।",
        isArchived: false,
        status: 'ACTIVE'
      }
    ];

    await bulkUploadQuestions(bricsQuestions);

    return { 
      success: true, 
      message: "🎉 Success! Created BRICS Evaluation Session & Uploaded 10 Standardized UPSC Questions to Vault." 
    };
  } catch (err: any) {
    console.error("Error seeding BRICS Demo:", err);
    return { success: false, message: "Error: " + err.message };
  }
}

// ==================== 6. BACKWARD COMPATIBILITY STUBS ====================
export interface SiteSettings { [key: string]: any; }
export async function getSiteSettings(): Promise<any> { return {}; }
export async function updateSiteSettings(settings: any): Promise<void> {}
export interface CategoryConfig { id: string; name: string; [key: string]: any; }
export async function getCustomCategories(): Promise<any[]> { return []; }
export async function saveCustomCategory(cat: any): Promise<void> {}
export async function deleteCustomCategory(id: string): Promise<void> {}
export async function getCustomOlympiads(): Promise<any[]> { return []; }
export async function saveCustomOlympiad(o: any): Promise<void> {}
export async function deleteCustomOlympiad(id: string): Promise<void> {}
export async function getAllSupportTickets(): Promise<any[]> { return []; }
export async function resolveSupportTicket(id: string): Promise<void> {}