import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc, 
  Timestamp, writeBatch, query, orderBy 
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

  // 1. Google Drive Links
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/(?:document|presentation|spreadsheets)\/d\/)([a-zA-Z0-9_-]{25,})/;
  const match = clean.match(driveRegex);
  if (match && match[1]) {
    const fileId = match[1];
    return {
      type: 'GDRIVE',
      rawUrl: clean,
      directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      isDrive: true
    };
  }

  // 2. Base64 Data URIs
  if (clean.startsWith('data:image/')) {
    return { type: 'IMAGE', rawUrl: clean, directUrl: clean, isDrive: false };
  }
  if (clean.startsWith('data:application/pdf')) {
    return { type: 'PDF', rawUrl: clean, directUrl: clean, isDrive: false };
  }

  // 3. Strict Web URL check
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return { type: 'NONE', rawUrl: clean, directUrl: '', isDrive: false };
  }

  // 4. File extension detection
  const lower = clean.toLowerCase().split('?')[0];
  if (lower.endsWith('.pdf')) {
    return { type: 'PDF', rawUrl: clean, directUrl: clean, isDrive: false };
  }
  if (lower.endsWith('.mol') || lower.endsWith('.pdb') || lower.endsWith('.gltf') || lower.endsWith('.obj')) {
    return { type: '3D', rawUrl: clean, directUrl: clean, isDrive: false };
  }

  // 5. Valid Web Image
  const imageExts = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.bmp', '.ico'];
  const hasImageExt = imageExts.some(ext => lower.endsWith(ext));
  const isKnownImageHost = clean.includes('images.unsplash.com') || clean.includes('wikimedia.org') || clean.includes('imgur.com') || clean.includes('cloudinary.com') || clean.includes('googleusercontent.com');

  if (hasImageExt || isKnownImageHost || clean.includes('/image')) {
    return { type: 'IMAGE', rawUrl: clean, directUrl: clean, isDrive: false };
  }

  return { type: 'NONE', rawUrl: clean, directUrl: '', isDrive: false };
}

// ==================== UNIVERSAL SCIENTIFIC & LATEX ENGINE ====================
const SUB_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋'
};

const SUP_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻'
};

const GREEK_LATEX_MAP: Record<string, string> = {
  '\\sigma': 'σ',
  '\\pi': 'π',
  '\\Delta': 'Δ',
  '\\delta': 'δ',
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\theta': 'θ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\omega': 'ω',
  '\\Omega': 'Ω',
  '\\times': '×',
  '\\pm': '±',
  '\\neq': '≠',
  '\\leq': '≤',
  '\\le': '≤',
  '\\geq': '≥',
  '\\ge': '≥',
  '\\approx': '≈',
  '\\infty': '∞',
  '\\rightarrow': '→',
  '\\to': '→',
  '\\rightleftharpoons': '⇌'
};

const ELEMENTS = "He|Li|Be|Ne|Na|Mg|Al|Si|Cl|Ar|Ca|Sc|Ti|Cr|Mn|Fe|Co|Ni|Cu|Zn|Ga|Ge|As|Se|Br|Kr|Rb|Sr|Zr|Nb|Mo|Tc|Ru|Rh|Pd|Ag|Cd|In|Sn|Sb|Te|Xe|Cs|Ba|La|Ce|Pr|Nd|Pm|Sm|Eu|Gd|Tb|Dy|Ho|Er|Tm|Yb|Lu|Hf|Ta|Re|Os|Ir|Pt|Au|Hg|Tl|Pb|Bi|Po|At|Rn|Fr|Ra|Ac|Th|Pa|Np|Pu|Am|Cm|Bk|Cf|Es|Fm|Md|No|Lr|H|B|C|N|O|F|P|S|K|V|Y|I|W|U";

export function formatScientific(text: string): string {
  if (!text || typeof text !== 'string') return text || '';

  let res = text;

  Object.keys(GREEK_LATEX_MAP).forEach(k => {
    const escaped = k.replace(/\\/g, '\\\\');
    res = res.replace(new RegExp(escaped, 'g'), GREEK_LATEX_MAP[k]);
  });

  res = res.replace(/\\text\{([^}]+)\}/g, '$1');

  res = res.replace(/\^\{?([0-9+-]+)\}?/g, (_, digits) => {
    return digits.split('').map((d: string) => SUP_MAP[d] || d).join('');
  });

  res = res.replace(/_\{?([0-9+-]+)\}?/g, (_, digits) => {
    return digits.split('').map((d: string) => SUB_MAP[d] || d).join('');
  });

  res = res.replace(/\$([^\$]+)\$/g, '$1');
  res = res.replace(/\$/g, '');

  const formulaRegex = new RegExp(`\\b(?:\\d+)?(?:(?:${ELEMENTS})\\d*)+(?:[+-])?\\b`, 'g');
  const elemRegex = new RegExp(`(${ELEMENTS})(\\d+)`, 'g');

  res = res.replace(formulaRegex, (token) => {
    if (!/\d/.test(token)) return token;
    return token.replace(elemRegex, (_, elem, digits) => {
      const subDigits = digits.split('').map((d: string) => SUB_MAP[d] || d).join('');
      return elem + subDigits;
    });
  });

  res = res.replace(/->/g, '→').replace(/<->/g, '⇌').replace(/<=/g, '≤').replace(/>=/g, '≥');

  return res;
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
  const payload: any = {
    ...q,
    updatedAt: Timestamp.now()
  };
  if (q.questionEn) payload.questionEn = formatScientific(q.questionEn);
  if (q.questionHi) payload.questionHi = formatScientific(q.questionHi);
  if (q.optionsEn) payload.optionsEn = q.optionsEn.map(o => formatScientific(o));
  if (q.optionsHi) payload.optionsHi = q.optionsHi.map(o => formatScientific(o));
  if (q.optionsDiagrams) payload.optionsDiagrams = q.optionsDiagrams;
  if (q.explanationEn) payload.explanationEn = formatScientific(q.explanationEn);
  if (q.explanationHi) payload.explanationHi = formatScientific(q.explanationHi);
  if (q.examName) payload.category = q.examName;
  if (q.subjectName) payload.subject = q.subjectName;

  await setDoc(docRef, payload, { merge: true });
}

export async function archiveQuestion(id: string): Promise<void> {
  const docRef = doc(db, 'questions', id);
  await setDoc(docRef, {
    isArchived: true,
    status: 'ARCHIVED',
    archivedAt: Timestamp.now()
  }, { merge: true });
}

export async function restoreQuestion(id: string): Promise<void> {
  const docRef = doc(db, 'questions', id);
  await setDoc(docRef, {
    isArchived: false,
    status: 'ACTIVE',
    restoredAt: Timestamp.now()
  }, { merge: true });
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
  fee: number;                      // 49 | 99 | 199 | 249 | 499 | 1499 | 1999
  totalGrantPool: string;           // "₹15,000", "₹1,00,000", etc.
  totalSlots: number;               // e.g. 500
  bookedSlots: number;              // Current bookings
  durationMinutes: number;          // e.g. 45
  questionsCount: number;           // e.g. 50
  targetClass: string;
  targetExam: string;
  targetSubject: string;
  scheduleText: string;             // "Every Sunday at 10:00 AM IST"
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
  createdAt?: any;
  [key: string]: any;
}

// Default Presets to populate if DB has no tournaments yet
const DEFAULT_OLYMPIADS: OlympiadTournament[] = [
  {
    id: 'oly-weekly-49',
    title: 'Weekly Speed Sprint',
    titleHi: 'साप्ताहिक स्पीड स्प्रिंट',
    fee: 49,
    totalGrantPool: '₹15,000',
    totalSlots: 500,
    bookedSlots: 362,
    durationMinutes: 45,
    questionsCount: 50,
    targetClass: 'Civil Services / Competitive',
    targetExam: 'UPSC Civil Services (Prelims)',
    targetSubject: 'General Studies / Geography',
    scheduleText: 'Every Sunday at 10:00 AM IST',
    status: 'UPCOMING',
    createdAt: null
  },
  {
    id: 'oly-monthly-199',
    title: 'Monthly Mega Assessment',
    titleHi: 'मासिक मेगा ओलंपियाड',
    fee: 199,
    totalGrantPool: '₹1,00,000',
    totalSlots: 600,
    bookedSlots: 412,
    durationMinutes: 90,
    questionsCount: 100,
    targetClass: 'Civil Services / Competitive',
    targetExam: 'UPSC Civil Services (Prelims)',
    targetSubject: 'Chemistry Optional Paper II',
    scheduleText: 'Last Tuesday of Month at 10:00 AM IST',
    status: 'UPCOMING',
    createdAt: null
  }
];

export async function getAllOlympiads(): Promise<OlympiadTournament[]> {
  try {
    const snap = await getDocs(collection(db, 'olympiads'));
    if (snap.empty) {
      return DEFAULT_OLYMPIADS;
    }
    return snap.docs.map(d => ({
      ...d.data(),
      id: d.id
    } as OlympiadTournament));
  } catch (err) {
    console.error("Error fetching olympiads:", err);
    return DEFAULT_OLYMPIADS;
  }
}

export async function saveOlympiadTournament(o: OlympiadTournament): Promise<void> {
  const docRef = doc(db, 'olympiads', o.id);
  await setDoc(docRef, { ...o, updatedAt: Timestamp.now() }, { merge: true });
}

export async function deleteOlympiadTournament(id: string): Promise<void> {
  await deleteDoc(doc(db, 'olympiads', id));
}

// Student slot registration / payment
export async function createPaymentRecord(r: any): Promise<{ success: boolean; rollNo: string }> {
  try {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const rollNo = `ABH-2026-${randomSuffix}`;
    const newId = `part-${Date.now()}`;

    const participantRef = doc(db, 'olympiad_participants', newId);
    await setDoc(participantRef, {
      ...r,
      id: newId,
      rollNo,
      writtenScore: Math.floor(75 + Math.random() * 20), // Simulated initial high score for testing
      tabSwitchCount: 0,
      vivaStatus: 'PENDING',
      createdAt: Timestamp.now()
    });

    return { success: true, rollNo };
  } catch (err) {
    console.error("Error creating participant record:", err);
    return { success: false, rollNo: '' };
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

// Dummy Stubs for backward compatibility
export interface SiteSettings { [key: string]: any; }
export async function getSiteSettings(): Promise<any> { return {}; }
export async function updateSiteSettings(settings: any): Promise<void> {}
export async function getAllPayments(): Promise<any[]> { return []; }
export interface CategoryConfig { id: string; name: string; [key: string]: any; }
export async function getCustomCategories(): Promise<any[]> { return []; }
export async function saveCustomCategory(cat: any): Promise<void> {}
export async function deleteCustomCategory(id: string): Promise<void> {}
export async function getCustomOlympiads(): Promise<any[]> { return []; }
export async function saveCustomOlympiad(o: any): Promise<void> {}
export async function deleteCustomOlympiad(id: string): Promise<void> {}
export async function getAllSupportTickets(): Promise<any[]> { return []; }
export async function resolveSupportTicket(id: string): Promise<void> {}