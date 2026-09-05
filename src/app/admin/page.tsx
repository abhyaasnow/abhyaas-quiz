'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Edit3, Eye, LogOut, KeyRound,
  Layers, ChevronDown, Check, X,
  FolderTree, BookOpen, FileSpreadsheet, Upload, Download, RefreshCw,
  Search, AlertTriangle, Image as ImageIcon, ClipboardCheck,
  RotateCcw, ShieldAlert, Copy, Atom, UploadCloud, FileText, ExternalLink,
  Trophy, Users, Video, Award, CheckCircle2, XCircle
} from 'lucide-react';

import { 
  getTaxonomyNodes, saveTaxonomyNode, deleteTaxonomyNode, 
  getAllQuestions, createQuestion, updateQuestion,
  archiveQuestion, restoreQuestion, permanentlyDeleteQuestion, wipeAllRecycleBin,
  bulkUploadQuestions, autoPushOlympiadQuestions, formatScientific, parseAttachment,
  getAllOlympiads, saveOlympiadTournament, deleteOlympiadTournament,
  getAllOlympiadParticipants, updateParticipantViva,
  TaxonomyNode, TaxonomyLevel, QuestionData, QuestionSegment,
  OlympiadTournament, OlympiadParticipant
} from '@/lib/db';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';

const PRESETS: Record<TaxonomyLevel, { en: string; hi: string }[]> = {
  CLASS: [
    { en: 'Civil Services / Competitive', hi: 'प्रतियोगी परीक्षा / सिविल सेवा' },
    { en: 'Class 6th (Middle School)', hi: 'कक्षा 6' },
    { en: 'Class 9th (Secondary Entrance)', hi: 'कक्षा 9' },
    { en: 'Class 10th (Board / Foundation)', hi: 'कक्षा 10 बोर्ड' },
    { en: 'Class 11th - 12th (Senior Secondary)', hi: 'कक्षा 11-12' }
  ],
  EXAM: [
    { en: 'UPSC Civil Services (Prelims)', hi: 'संघ लोक सेवा आयोग सिविल सेवा' },
    { en: 'JNVST (Navodaya Entrance Exam)', hi: 'जवाहर नवोदय विद्यालय प्रवेश परीक्षा' },
    { en: 'AISSEE (All India Sainik School Exam)', hi: 'अखिल भारतीय सैनिक स्कूल परीक्षा' },
    { en: 'All India Mega Olympiad 2026', hi: 'अखिल भारतीय छात्रवृत्ति ओलंपियाड 2026' }
  ],
  SUBJECT: [
    { en: 'General Studies / Geography', hi: 'सामान्य अध्ययन / भूगोल' },
    { en: 'General Studies / Science', hi: 'सामान्य अध्ययन / विज्ञान' },
    { en: 'General Studies / Economy', hi: 'सामान्य अध्ययन / अर्थव्यवस्था' },
    { en: 'Mathematics', hi: 'गणित' },
    { en: 'Science (Physics/Chem/Bio)', hi: 'विज्ञान' },
    { en: 'Mental Ability & Reasoning', hi: 'मानसिक योग्यता एवं तर्कशक्ति' }
  ],
  TOPIC: [
    { en: 'Global Mineral Resources & EV Transition', hi: 'वैश्विक खनिज संसाधन एवं ईवी संक्रमण' },
    { en: 'Number System & Place Value', hi: 'संख्या पद्धति एवं स्थानीय मान' },
    { en: 'Preamble & Fundamental Rights', hi: 'प्रस्तावना एवं मौलिक अधिकार' },
    { en: 'Chemical Bonding & Polycyclic Compounds', hi: 'रासायनिक आबंधन एवं बहुचक्रीय यौगिक' }
  ],
  DOMAIN: []
};

function parseCSVProperly(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) rows.push(currentRow);
  }
  return rows;
}

export default function AbhyaasMasterTower() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Primary Navigation (Now includes 'olympiad')
  const [adminTab, setAdminTab] = useState<'questions' | 'olympiad' | 'hierarchy' | 'recycle_bin'>('questions');
  const [taxonomyList, setTaxonomyList] = useState<TaxonomyNode[]>([]);
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);
  const [olympiadsList, setOlympiadsList] = useState<OlympiadTournament[]>([]);
  const [participantsList, setParticipantsList] = useState<OlympiadParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  // Hierarchy Form State
  const [activeLevel, setActiveLevel] = useState<TaxonomyLevel>('CLASS');
  const [presetChoice, setPresetChoice] = useState<string>('');
  const [manualNameEn, setManualNameEn] = useState('');
  const [manualNameHi, setManualNameHi] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  // Question Studio State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAutoPushModalOpen, setIsAutoPushModalOpen] = useState(false);

  // New Tournament Creation Modal State
  const [isOlympiadModalOpen, setIsOlympiadModalOpen] = useState(false);
  const [newOlyTitle, setNewOlyTitle] = useState('');
  const [newOlyFee, setNewOlyFee] = useState(49);
  const [newOlySlots, setNewOlySlots] = useState(500);
  const [newOlyGrantPool, setNewOlyGrantPool] = useState('₹15,000');
  const [newOlySchedule, setNewOlySchedule] = useState('Every Sunday at 10:00 AM IST');
  const [newOlyDuration, setNewOlyDuration] = useState(45);
  const [newOlyQuestions, setNewOlyQuestions] = useState(50);
  const [newOlyClass, setNewOlyClass] = useState('Civil Services / Competitive');
  const [newOlyExam, setNewOlyExam] = useState('UPSC Civil Services (Prelims)');
  const [newOlySubject, setNewOlySubject] = useState('General Studies / Geography');

  const [bulkMode, setBulkMode] = useState<'paste' | 'csv'>('paste');
  const [pasteData, setPasteData] = useState('');
  const [copiedSample, setCopiedSample] = useState(false);

  // Filters
  const [searchFilter, setSearchFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | QuestionSegment>('ALL');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterExam, setFilterExam] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // 4-Tier Cascading Question Form
  const [qClass, setQClass] = useState('');
  const [qClassCustom, setQClassCustom] = useState('');
  const [qExam, setQExam] = useState('');
  const [qExamCustom, setQExamCustom] = useState('');
  const [qSubject, setQSubject] = useState('');
  const [qSubjectCustom, setQSubjectCustom] = useState('');
  const [qTopic, setQTopic] = useState('');
  const [qTopicCustom, setQTopicCustom] = useState('');

  const [qSegment, setQSegment] = useState<QuestionSegment>('PRACTICE');
  const [qPyqYear, setQPyqYear] = useState('2024');

  const [qStatementEn, setQStatementEn] = useState('');
  const [qStatementHi, setQStatementHi] = useState('');
  const [qOptionsEn, setQOptionsEn] = useState(['', '', '', '']);
  const [qOptionsHi, setQOptionsHi] = useState(['', '', '', '']);
  const [qOptionsDiagrams, setQOptionsDiagrams] = useState<string[]>(['', '', '', '']);
  const [qCorrectOpt, setQCorrectOpt] = useState(0);
  const [qExplanationEn, setQExplanationEn] = useState('');
  const [qExplanationHi, setQExplanationHi] = useState('');
  const [qDiagramUrl, setQDiagramUrl] = useState('');

  // Auto-Push Pipeline State
  const [pushTargetExam, setPushTargetExam] = useState('');
  const [pushTargetSegment, setPushTargetSegment] = useState<'PRACTICE' | 'PYQ'>('PRACTICE');
  const [pushPyqYear, setPushPyqYear] = useState('2026');

  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const fileAttachmentRef = useRef<HTMLInputElement | null>(null);
  const opt0FileRef = useRef<HTMLInputElement | null>(null);
  const opt1FileRef = useRef<HTMLInputElement | null>(null);
  const opt2FileRef = useRef<HTMLInputElement | null>(null);
  const opt3FileRef = useRef<HTMLInputElement | null>(null);

  const getOptRef = (index: number) => {
    if (index === 0) return opt0FileRef;
    if (index === 1) return opt1FileRef;
    if (index === 2) return opt2FileRef;
    return opt3FileRef;
  };

  useEffect(() => {
    setMounted(true);
    try {
      const session = localStorage.getItem('abhyaas_admin_auth');
      if (session) setCurrentUser(JSON.parse(session));
    } catch {
      localStorage.removeItem('abhyaas_admin_auth');
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadAllData();
  }, [currentUser]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [taxNodes, questions, olys, parts] = await Promise.all([
        getTaxonomyNodes(), 
        getAllQuestions(),
        getAllOlympiads(),
        getAllOlympiadParticipants()
      ]);
      setTaxonomyList(taxNodes || []);
      setQuestionsList(questions || []);
      setOlympiadsList(olys || []);
      setParticipantsList(parts || []);

      const classes = (taxNodes || []).filter(t => t.level === 'CLASS');
      if (classes.length > 0 && !qClass) setQClass(classes[0].nameEn);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim() === MASTER_ADMIN_EMAIL && loginPassword === 'Abhyaas@2026') {
      const user = { email: MASTER_ADMIN_EMAIL };
      setCurrentUser(user);
      localStorage.setItem('abhyaas_admin_auth', JSON.stringify(user));
    } else {
      alert("Invalid Credentials.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('abhyaas_admin_auth');
  };

  const handleCreateOlympiadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOlyTitle.trim()) return alert("Enter Olympiad Title.");

    const newOly: OlympiadTournament = {
      id: `oly-${Date.now()}`,
      title: newOlyTitle.trim(),
      fee: Number(newOlyFee),
      totalSlots: Number(newOlySlots),
      bookedSlots: 0,
      totalGrantPool: newOlyGrantPool.trim(),
      scheduleText: newOlySchedule.trim(),
      durationMinutes: Number(newOlyDuration),
      questionsCount: Number(newOlyQuestions),
      targetClass: newOlyClass,
      targetExam: newOlyExam,
      targetSubject: newOlySubject,
      status: 'UPCOMING',
      createdAt: Timestamp.now()
    };

    try {
      await saveOlympiadTournament(newOly);
      setOlympiadsList(prev => [newOly, ...prev]);
      setIsOlympiadModalOpen(false);
      setNewOlyTitle('');
      alert("🎉 Olympiad Tournament Created Successfully!");
    } catch (err: any) {
      alert("Error creating tournament: " + err.message);
    }
  };

  const handleVivaAction = async (participantId: string, action: 'PASSED' | 'FAILED', candidateName: string) => {
    const grantWon = action === 'PASSED' ? 5000 : 0;
    const confirmMsg = action === 'PASSED' 
      ? `Approve Viva for ${candidateName} and allocate ₹${grantWon} Grant?` 
      : `Disqualify ${candidateName} and cascade grant to next rank?`;

    if (!confirm(confirmMsg)) return;

    try {
      await updateParticipantViva(participantId, action, grantWon);
      setParticipantsList(prev => prev.map(p => p.id === participantId ? { ...p, vivaStatus: action, grantAmountWon: grantWon } : p));
      alert(`Viva status updated to ${action}!`);
    } catch (err: any) {
      alert("Error updating viva: " + err.message);
    }
  };

  const handlePresetChange = (val: string) => {
    setPresetChoice(val);
    if (val === 'OTHER') {
      setManualNameEn(''); setManualNameHi('');
    } else if (val) {
      const found = PRESETS[activeLevel]?.find(p => p.en === val);
      if (found) {
        setManualNameEn(found.en); setManualNameHi(found.hi);
      }
    }
  };

  const handleSaveTaxonomy = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEn = manualNameEn.trim();
    const finalHi = manualNameHi.trim() || finalEn;
    if (!finalEn) return alert("Please enter entity name.");

    const newNode: TaxonomyNode = {
      id: `tax-${Date.now()}`,
      level: activeLevel,
      nameEn: finalEn,
      nameHi: finalHi,
      parentId: selectedParentId || undefined
    };

    setTaxonomyList(prev => [newNode, ...prev]);
    setManualNameEn(''); setManualNameHi(''); setPresetChoice('');
    await saveTaxonomyNode(newNode);
    alert(`Saved "${finalEn}" to ${activeLevel}!`);
  };

  const handleDeleteTaxonomy = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from ${activeLevel}?`)) return;
    setTaxonomyList(prev => prev.filter(t => t.id !== id));
    await deleteTaxonomyNode(id);
  };

  const insertSymbol = (sym: string) => {
    setQStatementEn(prev => prev + sym);
  };

  const cleanStr = (s: any) => String(s || '').toLowerCase().replace(/[^a-z0-9]/gi, '');

  const checkDuplicates = (text: string) => {
    const target = cleanStr(text);
    if (!target || target.length < 6) {
      setDuplicateWarning(null); return;
    }
    const exact = questionsList.find(q => {
      if (editingQuestionId && q.id === editingQuestionId) return false;
      return cleanStr(q.questionEn) === target || cleanStr(q.questionHi) === target;
    });
    if (exact) {
      setDuplicateWarning(`🚨 HARD DUPLICATE DETECTED: This exact question exists in [${exact.segment}] (ID: ${exact.id})!`);
      return;
    }
    setDuplicateWarning(null);
  };

  const handleLocalFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return alert("File size should be less than 5MB.");
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = (evt.target?.result as string) || '';
      setQDiagramUrl(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleOptionDiagramUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = (evt.target?.result as string) || '';
      const updated = [...qOptionsDiagrams];
      updated[idx] = b64;
      setQOptionsDiagrams(updated);
    };
    reader.readAsDataURL(file);
  };

  const openCreateQuestionModal = () => {
    setEditingQuestionId(null);
    setDuplicateWarning(null);
    setQStatementEn(''); setQStatementHi('');
    setQOptionsEn(['', '', '', '']); setQOptionsHi(['', '', '', '']);
    setQOptionsDiagrams(['', '', '', '']);
    setQCorrectOpt(0); setQExplanationEn(''); setQExplanationHi('');
    setQDiagramUrl(''); setQSegment('PRACTICE');
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: QuestionData) => {
    setEditingQuestionId(q.id);
    setDuplicateWarning(null);
    setQClass(q.className || q.class || '');
    setQExam(q.examName || q.category || '');
    setQSubject(q.subjectName || q.subject || '');
    setQTopic(q.topicName || q.topic || '');
    setQSegment(q.segment || 'PRACTICE');
    setQPyqYear(q.pyqYear || '2024');
    setQStatementEn(q.questionEn || '');
    setQStatementHi(q.questionHi || '');
    setQOptionsEn([...(q.optionsEn || ['', '', '', ''])]);
    setQOptionsHi([...(q.optionsHi || ['', '', '', ''])]);
    setQOptionsDiagrams(Array.isArray(q.optionsDiagrams) ? [...q.optionsDiagrams] : ['', '', '', '']);
    setQCorrectOpt(q.correctOption || 0);
    setQExplanationEn(q.explanationEn || '');
    setQExplanationHi(q.explanationHi || '');
    setQDiagramUrl(q.diagramUrl || '');
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalClass = qClass === 'OTHER' ? qClassCustom.trim() : qClass;
    const finalExam = qExam === 'OTHER' ? qExamCustom.trim() : qExam;
    const finalSubject = qSubject === 'OTHER' ? qSubjectCustom.trim() : qSubject;
    const finalTopic = qTopic === 'OTHER' ? qTopicCustom.trim() : qTopic;

    if (!finalClass || !finalExam || !finalSubject || !qStatementEn.trim()) {
      return alert("Class, Exam, Subject, and English Question Statement are required!");
    }

    const parsedAtt = parseAttachment(qDiagramUrl);

    const payload: QuestionData = {
      id: editingQuestionId || `q-${Date.now()}`,
      docId: editingQuestionId || `q-${Date.now()}`,
      className: finalClass,
      examName: finalExam,
      subjectName: finalSubject,
      topicName: finalTopic || 'General',
      category: finalExam,
      subject: finalSubject,
      class: finalClass,
      topic: finalTopic || 'General',
      segment: qSegment,
      pyqYear: qSegment === 'PYQ' ? qPyqYear : '',
      questionEn: formatScientific(qStatementEn.trim()),
      questionHi: formatScientific(qStatementHi.trim() || qStatementEn.trim()),
      optionsEn: qOptionsEn.map(o => formatScientific(o)),
      optionsHi: qOptionsHi.map(o => formatScientific(o)),
      optionsDiagrams: qOptionsDiagrams,
      correctOption: qCorrectOpt,
      explanationEn: formatScientific(qExplanationEn.trim()),
      explanationHi: formatScientific(qExplanationHi.trim()),
      diagramUrl: qDiagramUrl.trim(),
      attachmentType: parsedAtt.type,
      isArchived: false,
      status: 'ACTIVE',
      timesUsedInOlympiad: 0
    };

    try {
      if (editingQuestionId) {
        setQuestionsList(prev => prev.map(item => item.id === editingQuestionId ? payload : item));
        await updateQuestion(editingQuestionId, payload);
        alert("Question updated successfully!");
      } else {
        setQuestionsList(prev => [payload, ...prev]);
        await createQuestion(payload);
        alert(`Saved question to [${qSegment}]!`);
      }
      setIsQuestionModalOpen(false);
    } catch (err: any) {
      alert("Error saving question: " + err.message);
    }
  };

  const handleMoveToRecycleBin = async (id: string, text: string) => {
    if (!confirm(`Move question "${text.slice(0, 40)}..." to Recycle Bin?`)) return;
    try {
      await archiveQuestion(id);
      setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, isArchived: true, status: 'ARCHIVED' } : q));
    } catch (err: any) {
      alert("Error archiving question: " + err.message);
    }
  };

  const handleRestoreFromRecycleBin = async (id: string) => {
    try {
      await restoreQuestion(id);
      setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, isArchived: false, status: 'ACTIVE' } : q));
      alert("Question restored back to Active Question Bank!");
    } catch (err: any) {
      alert("Error restoring question: " + err.message);
    }
  };

  const handlePermanentDelete = async (q: QuestionData) => {
    if (!confirm("🚨 PERMANENT DELETE: Are you absolutely sure? This will be permanently erased from Firestore!")) return;
    try {
      await permanentlyDeleteQuestion(q.id, q.altId);
      setQuestionsList(prev => prev.filter(item => item.id !== q.id));
      alert("Question permanently erased from database!");
    } catch (err: any) {
      alert("Error deleting from database: " + err.message);
    }
  };

  const handleWipeAllRecycleBin = async () => {
    if (!confirm("🚨 DANGER: Wipe ALL questions currently in the Recycle Bin permanently?")) return;
    try {
      const count = await wipeAllRecycleBin();
      setQuestionsList(prev => prev.filter(q => !q.isArchived));
      alert(`Permanently erased ${count} questions from database!`);
    } catch (err: any) {
      alert("Error wiping recycle bin: " + err.message);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-mono">
        Initializing Abhyaas Command Center...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b1121] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">Abhyaas Admin Gateway</h2>
            <p className="text-xs text-slate-400">Enterprise Operations Console</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full h-12 px-4 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm outline-none" placeholder="admin@domain.com" required />
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full h-12 px-4 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm outline-none" placeholder="••••••••" required />
            <button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const classes = taxonomyList.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN');
  const currentClassNode = classes.find(c => c.nameEn === qClass);
  const availableExams = taxonomyList.filter(t => t.level === 'EXAM' && (!currentClassNode || t.parentId === currentClassNode.id));
  const currentExamNode = availableExams.find(e => e.nameEn === qExam);
  const availableSubjects = taxonomyList.filter(t => t.level === 'SUBJECT' && (!currentExamNode || t.parentId === currentExamNode.id));
  const currentSubjectNode = availableSubjects.find(s => s.nameEn === qSubject);
  const availableTopics = taxonomyList.filter(t => t.level === 'TOPIC' && (!currentSubjectNode || t.parentId === currentSubjectNode.id));

  const activeQuestions = questionsList.filter(q => !q.isArchived);
  const archivedQuestions = questionsList.filter(q => q.isArchived);
  const quarantinedOlympiadQs = questionsList.filter(q => q.segment === 'OLYMPIAD' && !q.isArchived);

  const filteredActiveQuestions = activeQuestions.filter(q => {
    const matchesSearch = cleanStr(q.questionEn).includes(cleanStr(searchFilter)) || cleanStr(q.questionHi).includes(cleanStr(searchFilter)) || cleanStr(q.subjectName || q.subject).includes(cleanStr(searchFilter));
    const matchesSegment = segmentFilter === 'ALL' || q.segment === segmentFilter;
    const matchesClass = filterClass === 'ALL' || q.className === filterClass || q.class === filterClass;
    const matchesExam = filterExam === 'ALL' || q.examName === filterExam || q.category === filterExam;
    const matchesSubject = filterSubject === 'ALL' || q.subjectName === filterSubject || q.subject === filterSubject;
    return matchesSearch && matchesSegment && matchesClass && matchesExam && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-base">A</div>
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-wide flex items-center gap-2">
                ABHYAAS O.S. <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] rounded font-mono uppercase">Master Controller</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/olympiad" target="_blank" className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <Trophy className="w-4 h-4 text-amber-400"/> Live Olympiad Arena
            </Link>
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 bg-slate-800 p-2 rounded-xl">
              <LogOut className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">

        {/* 4-Tab Navigation */}
        <div className="bg-white p-2 border border-slate-200 rounded-3xl shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setAdminTab('questions')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
              adminTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 1. Question Bank ({activeQuestions.length})
          </button>

          <button
            onClick={() => setAdminTab('olympiad')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
              adminTab === 'olympiad' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" /> 2. 🛡️ Olympiad Arena &amp; Viva ({olympiadsList.length})
          </button>

          <button
            onClick={() => setAdminTab('hierarchy')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
              adminTab === 'hierarchy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderTree className="w-4 h-4" /> 3. Category Tree ({taxonomyList.length})
          </button>

          <button
            onClick={() => setAdminTab('recycle_bin')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
              adminTab === 'recycle_bin' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-4 h-4" /> 4. Recycle Bin ({archivedQuestions.length})
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 2: OLYMPIAD ARENA & VIVA VERIFICATION WATERFALL QUEUE */}
        {/* ========================================================================= */}
        {adminTab === 'olympiad' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Header & Controls */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-wider">
                    High Stakes Arena Manager
                  </span>
                  <span className="text-xs font-bold text-slate-500">Quarantined Vault: {quarantinedOlympiadQs.length} Questions</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">Olympiad Tournaments &amp; Viva Verification</h2>
                <p className="text-xs text-slate-500">Monitor 50% cohort thresholds, manage multi-tier grant arenas, and conduct 1-on-1 viva verifications.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsOlympiadModalOpen(true)}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" /> Create New Tournament
                </button>
              </div>
            </div>

            {/* Active Tournaments with 50% Threshold Meter */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Active &amp; Upcoming Tournaments ({olympiadsList.length})</h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {olympiadsList.map(oly => {
                  const fillPercent = Math.round((oly.bookedSlots / oly.totalSlots) * 100);
                  const isThresholdMet = fillPercent >= 50;

                  return (
                    <div key={oly.id} className="bg-white border border-slate-200 hover:border-amber-400 p-5 rounded-3xl shadow-xs space-y-4 transition">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                            Fee: ₹{oly.fee} • {oly.totalGrantPool} Pool
                          </span>
                          <h4 className="font-black text-sm text-slate-900 mt-1.5">{oly.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">{oly.scheduleText}</p>
                        </div>
                        <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                      </div>

                      {/* 50% Threshold Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-black">
                          <span className="text-slate-600">{oly.bookedSlots} / {oly.totalSlots} Slots Booked</span>
                          <span className={isThresholdMet ? 'text-emerald-600' : 'text-amber-600'}>{fillPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isThresholdMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(fillPercent, 100)}%` }}
                          />
                        </div>
                        <p className={`text-[10px] font-black uppercase ${isThresholdMet ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {isThresholdMet ? '✓ 50% Threshold Met (Confirmed)' : '⏳ Awaiting 50% Minimum Cohort'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-500">{oly.questionsCount} Qs • {oly.durationMinutes} Mins</span>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete tournament "${oly.title}"?`)) {
                              await deleteOlympiadTournament(oly.id);
                              setOlympiadsList(prev => prev.filter(item => item.id !== oly.id));
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Candidates & Viva Verification Queue */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-amber-600" />
                    Candidate Verification &amp; 1-on-1 Viva Queue ({participantsList.length})
                  </h3>
                  <p className="text-xs text-slate-500">Verify provisional rankers scoring ≥75% via live 1-on-1 viva (5 questions, 3/5 passing threshold).</p>
                </div>
              </div>

              {participantsList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-bold text-xs">
                  No candidate submissions in verification queue yet. Candidates registering on /olympiad appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3 rounded-l-lg">Roll Number</th>
                        <th className="py-3 px-3">Candidate Details</th>
                        <th className="py-3 px-3">Tournament Tier</th>
                        <th className="py-3 px-3">Written Score</th>
                        <th className="py-3 px-3">Integrity Telemetry</th>
                        <th className="py-3 px-3">Viva Status</th>
                        <th className="py-3 px-3 rounded-r-lg text-right">Verification Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {participantsList.map(p => {
                        const isCutoffPassed = (p.writtenScore || 0) >= 75;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-3 font-mono font-black text-slate-900">
                              {p.rollNo}
                            </td>
                            <td className="py-3 px-3">
                              <p className="font-extrabold text-slate-900">{p.candidateName}</p>
                              <p className="text-[10px] text-slate-400">{p.email} • {p.phone}</p>
                            </td>
                            <td className="py-3 px-3 font-bold text-slate-700">
                              {p.olympiadTier} (₹{p.amount})
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                                isCutoffPassed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}>
                                {p.writtenScore}% {isCutoffPassed ? '(Cutoff Met)' : '(Below 75%)'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[11px] font-bold text-slate-500">
                              {p.tabSwitchCount === 0 ? (
                                <span className="text-emerald-600">✓ 0 Tab Switches</span>
                              ) : (
                                <span className="text-rose-600">⚠ {p.tabSwitchCount} Tab Switches</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                                p.vivaStatus === 'PASSED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                                p.vivaStatus === 'FAILED' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                                'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {p.vivaStatus || 'PENDING'}
                              </span>
                              {p.grantAmountWon ? (
                                <p className="text-[10px] text-emerald-600 font-black mt-0.5">Grant: ₹{p.grantAmountWon}</p>
                              ) : null}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {p.vivaStatus === 'PENDING' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleVivaAction(p.id, 'PASSED', p.candidateName)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition"
                                  >
                                    Pass Viva (Award)
                                  </button>
                                  <button
                                    onClick={() => handleVivaAction(p.id, 'FAILED', p.candidateName)}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg transition"
                                  >
                                    Fail &amp; Cascade
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold">Action Completed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 1: QUESTION BANK */}
        {adminTab === 'questions' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Active Question Vault
                  </h2>
                  <p className="text-xs text-slate-500">Preserved questions with automatic chemical subscripts, formulas, and diagrams.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={openCreateQuestionModal}
                    className="px-4 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" /> Single Question Studio
                  </button>
                  <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="px-4 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Bulk Upload / Excel Paste
                  </button>
                  <button
                    onClick={() => setIsAutoPushModalOpen(true)}
                    className="px-4 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <RefreshCw className="w-4 h-4" /> Push Olympiad ➔ PYQ
                  </button>
                </div>
              </div>

              {/* Multi-Tier Filter Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-black">
                    {(['ALL', 'PRACTICE', 'PYQ', 'OLYMPIAD'] as const).map(seg => (
                      <button
                        key={seg}
                        onClick={() => setSegmentFilter(seg)}
                        className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition ${
                          segmentFilter === seg ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        {seg === 'ALL' ? `All (${activeQuestions.length})` :
                         seg === 'PRACTICE' ? `Practice (${activeQuestions.filter(q=>q.segment==='PRACTICE').length})` :
                         seg === 'PYQ' ? `PYQ (${activeQuestions.filter(q=>q.segment==='PYQ').length})` :
                         `🛡️ Olympiad (${activeQuestions.filter(q=>q.segment==='OLYMPIAD').length})`}
                      </button>
                    ))}
                  </div>

                  <select
                    value={filterClass}
                    onChange={e => setFilterClass(e.target.value)}
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="ALL">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.nameEn}>{c.nameEn}</option>)}
                  </select>

                  <select
                    value={filterExam}
                    onChange={e => setFilterExam(e.target.value)}
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="ALL">All Examinations</option>
                    {taxonomyList.filter(t => t.level === 'EXAM').map(e => (
                      <option key={e.id} value={e.nameEn}>{e.nameEn}</option>
                    ))}
                  </select>

                  <select
                    value={filterSubject}
                    onChange={e => setFilterSubject(e.target.value)}
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="ALL">All Subjects</option>
                    {taxonomyList.filter(t => t.level === 'SUBJECT').map(s => (
                      <option key={s.id} value={s.nameEn}>{s.nameEn}</option>
                    ))}
                  </select>

                  <div className="relative flex-grow min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions or terms..."
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Stream */}
            <div className="space-y-3">
              {filteredActiveQuestions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-extrabold text-sm text-slate-800">No Questions Found Matching Filter</p>
                  <p className="text-xs text-slate-400">Add questions using Single Question Studio or Bulk Excel Paste.</p>
                </div>
              ) : (
                filteredActiveQuestions.map((q, idx) => {
                  const att = parseAttachment(q.diagramUrl);
                  return (
                    <div
                      key={q.id || idx}
                      className="bg-white border border-slate-200 hover:border-blue-300 p-5 rounded-2xl shadow-sm transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            q.segment === 'OLYMPIAD' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            q.segment === 'PYQ' ? `bg-purple-100 text-purple-900 border border-purple-300` :
                            'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {q.segment === 'OLYMPIAD' ? '🛡️ Live Olympiad' :
                             q.segment === 'PYQ' ? `📜 PYQ (${q.pyqYear || 'Past Year'})` :
                             '📘 Free Practice Drill'}
                          </span>

                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                            {q.className || q.class} ➔ {q.examName || q.category} ➔ {q.subjectName || q.subject}
                          </span>

                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                            Topic: {q.topicName || q.topic}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 self-end sm:self-center">
                          <button
                            onClick={() => openEditQuestionModal(q)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Question"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveToRecycleBin(q.id, q.questionEn)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Move to Recycle Bin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Question Statement */}
                      <div>
                        <p className="font-bold text-sm text-slate-900 leading-relaxed">
                          {formatScientific(q.questionEn)}
                        </p>
                        {q.questionHi && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {formatScientific(q.questionHi)}
                          </p>
                        )}
                      </div>

                      {/* Question Media / Attachment */}
                      {att.type !== 'NONE' && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl w-fit max-w-full shadow-xs">
                          {(att.type === 'IMAGE' || (att.type === 'GDRIVE' && !att.rawUrl.includes('.pdf'))) && (
                            <img 
                              src={att.directUrl} 
                              alt="Attached Diagram / Vector" 
                              referrerPolicy="no-referrer"
                              className="max-h-72 w-auto min-w-[280px] max-w-full object-contain rounded-xl bg-white p-2 border" 
                            />
                          )}

                          {(att.type === 'PDF' || (att.type === 'GDRIVE' && att.rawUrl.includes('.pdf'))) && (
                            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 min-w-[280px]">
                              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 font-black">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-xs text-slate-900">Attached Reference Document (.PDF)</p>
                                <p className="text-[10px] text-slate-400">Click below to read / preview</p>
                              </div>
                              <a 
                                href={att.previewUrl || att.directUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
                              >
                                View PDF <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
                        {q.optionsEn?.map((opt, i) => {
                          const optDiag = q.optionsDiagrams?.[i] || '';
                          const optAtt = parseAttachment(optDiag);

                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-2xl border flex flex-col gap-2 transition ${
                                q.correctOption === i
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                                  q.correctOption === i ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                                }`}>
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span className="truncate">{formatScientific(opt)}</span>
                              </div>

                              {optAtt.type === 'IMAGE' && optAtt.directUrl && (
                                <div className="mt-1 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center">
                                  <img 
                                    src={optAtt.directUrl} 
                                    alt={`Option ${i + 1}`}
                                    referrerPolicy="no-referrer"
                                    className="max-h-28 w-auto object-contain rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {(q.explanationEn || q.explanationHi) && (
                        <div className="p-3 bg-blue-50/70 rounded-xl text-[11px] text-blue-900 border border-blue-100 leading-relaxed">
                          <strong className="font-black">💡 Solution:</strong> {formatScientific(q.explanationEn || q.explanationHi || '')}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB 3: HIERARCHY TREE */}
        {adminTab === 'hierarchy' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-2 border border-slate-200 rounded-3xl shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CLASS', title: '1. Classes', count: classes.length },
                { id: 'EXAM', title: '2. Examinations', count: taxonomyList.filter(t => t.level === 'EXAM').length },
                { id: 'SUBJECT', title: '3. Subjects', count: taxonomyList.filter(t => t.level === 'SUBJECT').length },
                { id: 'TOPIC', title: '4. Topics', count: taxonomyList.filter(t => t.level === 'TOPIC').length },
              ].map(lvl => (
                <button
                  key={lvl.id}
                  onClick={() => { 
                    setActiveLevel(lvl.id as TaxonomyLevel); 
                    setPresetChoice(''); setManualNameEn(''); setManualNameHi(''); setSelectedParentId(''); 
                  }}
                  className={`py-3.5 px-4 rounded-2xl text-xs font-black transition flex flex-col items-center gap-1 ${
                    activeLevel === lvl.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{lvl.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeLevel === lvl.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {lvl.count} active
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Add New {activeLevel}
              </h2>
              <form onSubmit={handleSaveTaxonomy} className="space-y-4">
                <div className="relative">
                  <select
                    value={presetChoice}
                    onChange={e => handlePresetChange(e.target.value)}
                    className="w-full h-11 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer"
                  >
                    <option value="">-- Choose from standard presets --</option>
                    {PRESETS[activeLevel]?.map((p, i) => <option key={i} value={p.en}>{p.en} ({p.hi})</option>)}
                    <option value="OTHER" className="font-black text-blue-600">✍️ + Other (Type Manually)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name in English*"
                    value={manualNameEn}
                    onChange={e => { setManualNameEn(e.target.value); setPresetChoice('OTHER'); }}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="नाम हिंदी में (Optional)"
                    value={manualNameHi}
                    onChange={e => setManualNameHi(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>

                {activeLevel !== 'CLASS' && (
                  <div className="relative">
                    <select
                      value={selectedParentId}
                      onChange={e => setSelectedParentId(e.target.value)}
                      className="w-full h-11 px-4 pr-10 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl text-xs appearance-none outline-none cursor-pointer"
                    >
                      <option value="">-- Select Parent Entity (Required for sub-categorization) --</option>
                      {activeLevel === 'EXAM' && classes.map(c => <option key={c.id} value={c.id}>Belongs to Class: {c.nameEn}</option>)}
                      {activeLevel === 'SUBJECT' && taxonomyList.filter(t => t.level === 'EXAM').map(e => <option key={e.id} value={e.id}>Belongs to Exam: {e.nameEn}</option>)}
                      {activeLevel === 'TOPIC' && taxonomyList.filter(t => t.level === 'SUBJECT').map(s => <option key={s.id} value={s.id}>Belongs to Subject: {s.nameEn}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-blue-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}

                <button type="submit" className="px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Save {activeLevel} Node to Tree
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase">Active {activeLevel} Nodes ({taxonomyList.filter(t => t.level === activeLevel).length})</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {taxonomyList.filter(t => t.level === activeLevel).map(item => {
                  const parent = taxonomyList.find(t => t.id === item.parentId);
                  return (
                    <div key={item.id} className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <p className="font-extrabold text-sm text-slate-900">{item.nameEn}</p>
                        {item.nameHi && <p className="text-xs text-slate-500">{item.nameHi}</p>}
                        {parent && (
                          <span className="inline-block mt-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            ↳ Linked to: {parent.nameEn}
                          </span>
                        )}
                      </div>
                      <button onClick={() => handleDeleteTaxonomy(item.id, item.nameEn)} className="text-rose-400 hover:text-rose-600 p-2 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RECYCLE BIN */}
        {adminTab === 'recycle_bin' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-rose-950 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                  Recycle Bin / Archived Questions ({archivedQuestions.length})
                </h2>
                <p className="text-xs text-rose-700 mt-1">
                  Questions deleted from the active bank are held here. Restore them back or permanently wipe them from Firestore.
                </p>
              </div>

              {archivedQuestions.length > 0 && (
                <button
                  onClick={handleWipeAllRecycleBin}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
                >
                  <ShieldAlert className="w-4 h-4" /> Empty Entire Recycle Bin
                </button>
              )}
            </div>

            <div className="space-y-3">
              {archivedQuestions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-bold shadow-sm">
                  Recycle Bin is completely empty. No deleted questions.
                </div>
              ) : (
                archivedQuestions.map(q => (
                  <div key={q.id} className="bg-white border border-rose-200 p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">
                        {q.className} ➔ {q.examName} ➔ {q.subjectName} (ID: <code className="font-mono text-[10px]">{q.id}</code>)
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestoreFromRecycleBin(q.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore to Bank
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(q)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800 line-through opacity-80">{formatScientific(q.questionEn)}</p>
                    {q.questionHi && <p className="text-xs text-slate-500">{formatScientific(q.questionHi)}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: CREATE NEW OLYMPIAD TOURNAMENT */}
      {isOlympiadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  New Tournament Setup
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Configure Olympiad Arena</h3>
              </div>
              <button onClick={() => setIsOlympiadModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOlympiadSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tournament Title*</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Speed Sprint - GS Paper 1"
                  value={newOlyTitle}
                  onChange={e => setNewOlyTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Entry Fee (Tier)*</label>
                  <select
                    value={newOlyFee}
                    onChange={e => {
                      const f = Number(e.target.value);
                      setNewOlyFee(f);
                      if (f === 49) setNewOlyGrantPool('₹15,000');
                      else if (f === 99) setNewOlyGrantPool('₹40,000');
                      else if (f === 199) setNewOlyGrantPool('₹1,00,000');
                      else if (f === 249) setNewOlyGrantPool('₹1,50,000');
                      else if (f === 499) setNewOlyGrantPool('₹3,00,000');
                      else if (f === 1999) setNewOlyGrantPool('₹25,00,000');
                    }}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                  >
                    <option value={49}>₹49 (Weekly Starter)</option>
                    <option value={99}>₹99 (Foundation Master)</option>
                    <option value={199}>₹199 (Monthly Mega)</option>
                    <option value={249}>₹249 (Subject Specialist)</option>
                    <option value={499}>₹499 (Quarterly National)</option>
                    <option value={1999}>₹1,999 (Super Grand Yearly Cup)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Capacity Slots*</label>
                  <input
                    type="number"
                    value={newOlySlots}
                    onChange={e => setNewOlySlots(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gross Grant Pool*</label>
                  <input
                    type="text"
                    value={newOlyGrantPool}
                    onChange={e => setNewOlyGrantPool(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Schedule Timing*</label>
                  <input
                    type="text"
                    value={newOlySchedule}
                    onChange={e => setNewOlySchedule(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Minutes)*</label>
                  <input
                    type="number"
                    value={newOlyDuration}
                    onChange={e => setNewOlyDuration(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Question Count*</label>
                  <input
                    type="number"
                    value={newOlyQuestions}
                    onChange={e => setNewOlyQuestions(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>50% Cohort Rule Enforced:</strong> Tournament will confirm automatically once {Math.ceil(newOlySlots * 0.5)} slots are booked. Questions will be drawn from the Quarantined Olympiad Vault.
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
              >
                <Trophy className="w-4 h-4" /> Save &amp; Publish Tournament
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SINGLE QUESTION STUDIO */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingQuestionId ? 'Edit Question Entry' : 'Smart Question Studio'}
                </h3>
                <p className="text-xs text-slate-500">Configure question statements, formulas, GDrive media, and diagrammatic options (A, B, C, D).</p>
              </div>
              <button onClick={() => setIsQuestionModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-5">
              {duplicateWarning && (
                <div className="p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 bg-rose-50 border-rose-300 text-rose-800">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              {/* Destination */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-black uppercase text-slate-500">
                  Target Destination / Vault*
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { id: 'PRACTICE', title: '📘 Free Practice Drill', desc: 'Instant student drill access' },
                    { id: 'PYQ', title: '📜 Previous Year (PYQ)', desc: 'Official past year archive' },
                    { id: 'OLYMPIAD', title: '🛡️ Live Olympiad Vault', desc: 'Quarantine lock until exam' },
                  ].map(s => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setQSegment(s.id as QuestionSegment)}
                      className={`p-3 rounded-xl border text-left transition ${
                        qSegment === s.id 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-black text-xs">{s.title}</p>
                      <p className={`text-[10px] mt-0.5 ${qSegment === s.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {s.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {qSegment === 'PYQ' && (
                  <div className="pt-2 flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-700">Exam Year (PYQ):</label>
                    <input
                      type="text"
                      value={qPyqYear}
                      onChange={e => setQPyqYear(e.target.value)}
                      placeholder="e.g. 2026"
                      className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold w-32 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Hierarchy Selection */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. Class / Tier*</label>
                  <select
                    value={qClass}
                    onChange={e => { setQClass(e.target.value); setQExam(''); setQSubject(''); setQTopic(''); }}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="">-- Choose Class --</option>
                    {classes.map(c => <option key={c.id} value={c.nameEn}>{c.nameEn}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Target Examination*</label>
                  <select
                    value={qExam}
                    onChange={e => { setQExam(e.target.value); setQSubject(''); setQTopic(''); }}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="">-- Choose Exam --</option>
                    {availableExams.map(e => <option key={e.id} value={e.nameEn}>{e.nameEn}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">3. Subject*</label>
                  <select
                    value={qSubject}
                    onChange={e => { setQSubject(e.target.value); setQTopic(''); }}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="">-- Choose Subject --</option>
                    {availableSubjects.map(s => <option key={s.id} value={s.nameEn}>{s.nameEn}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">4. Topic / Chapter</label>
                  <input
                    type="text"
                    placeholder="Chapter / Topic Name"
                    value={qTopic}
                    onChange={e => setQTopic(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              {/* Question Statements */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Question Statement (English)*</label>
                  <textarea
                    rows={2}
                    value={qStatementEn}
                    onChange={e => { setQStatementEn(e.target.value); checkDuplicates(e.target.value); }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">प्रश्न विवरण (हिंदी में)</label>
                  <textarea
                    rows={2}
                    value={qStatementHi}
                    onChange={e => setQStatementHi(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none"
                  />
                </div>
              </div>

              {/* Question Diagram Slot */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Question Diagram / Media (Optional)
                  </label>
                  <input type="file" accept="image/*,.pdf,.svg" ref={fileAttachmentRef} onChange={handleLocalFileAttachment} className="hidden" />
                  <button type="button" onClick={() => fileAttachmentRef.current?.click()} className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl">
                    Attach from Device
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Or paste image URL / GDrive / Base64..."
                  value={qDiagramUrl}
                  onChange={e => setQDiagramUrl(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none"
                />
              </div>

              {/* Options */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-black uppercase text-slate-700">Options (A, B, C, D) &amp; Correct Key*</label>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correctKey" checked={qCorrectOpt === i} onChange={() => setQCorrectOpt(i)} className="w-4 h-4 text-blue-600 cursor-pointer" />
                    <span className="text-xs font-black text-slate-700 w-14">Opt {String.fromCharCode(65 + i)}</span>
                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + i)} English`}
                      value={qOptionsEn[i]}
                      onChange={e => { const o = [...qOptionsEn]; o[i] = e.target.value; setQOptionsEn(o); }}
                      className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder={`विकल्प ${String.fromCharCode(65 + i)} हिंदी`}
                      value={qOptionsHi[i]}
                      onChange={e => { const o = [...qOptionsHi]; o[i] = e.target.value; setQOptionsHi(o); }}
                      className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Explanations */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Explanation (English)</label>
                  <textarea rows={2} value={qExplanationEn} onChange={e => setQExplanationEn(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">उत्तर का स्पष्टीकरण (Hindi)</label>
                  <textarea rows={2} value={qExplanationHi} onChange={e => setQExplanationHi(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                {editingQuestionId ? 'Update Question' : 'Save Question to Vault'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BULK UPLOAD */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Bulk Question Importer
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={6}
              value={pasteData}
              onChange={e => setPasteData(e.target.value)}
              placeholder="Paste copied cells from Excel here (tab-delimited)..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] outline-none"
            />
            <button
              type="button"
              onClick={async () => {
                if (!pasteData.trim()) return alert("Paste cells first.");
                const lines = pasteData.split(/\r?\n/).filter(l => l.trim().length > 0);
                const parsed: QuestionData[] = [];
                for (let i = 0; i < lines.length; i++) {
                  const row = lines[i].split('\t');
                  if (row.length >= 7) {
                    const newId = `q-paste-${Date.now()}-${i}`;
                    parsed.push({
                      id: newId,
                      docId: newId,
                      segment: (row[0] || 'PRACTICE').toUpperCase() as QuestionSegment,
                      className: row[1] || 'Civil Services / Competitive',
                      examName: row[2] || 'UPSC Civil Services (Prelims)',
                      subjectName: row[3] || 'General Studies / Science',
                      topicName: row[4] || 'General',
                      category: row[2] || 'UPSC Civil Services (Prelims)',
                      subject: row[3] || 'General Studies / Science',
                      class: row[1] || 'Civil Services / Competitive',
                      topic: row[4] || 'General',
                      pyqYear: row[5] || '2024',
                      questionEn: formatScientific(row[6] || ''),
                      questionHi: formatScientific(row[7] || row[6] || ''),
                      optionsEn: [formatScientific(row[8] || ''), formatScientific(row[9] || ''), formatScientific(row[10] || ''), formatScientific(row[11] || '')],
                      optionsHi: [formatScientific(row[12] || row[8] || ''), formatScientific(row[13] || row[9] || ''), formatScientific(row[14] || row[10] || ''), formatScientific(row[15] || row[11] || '')],
                      optionsDiagrams: ['', '', '', ''],
                      correctOption: (parseInt(row[16]) - 1) >= 0 ? parseInt(row[16]) - 1 : 0,
                      explanationEn: formatScientific(row[17] || ''),
                      explanationHi: formatScientific(row[18] || ''),
                      diagramUrl: row[19] || '',
                      isArchived: false,
                      status: 'ACTIVE',
                      timesUsedInOlympiad: 0
                    });
                  }
                }
                const count = await bulkUploadQuestions(parsed);
                setQuestionsList(prev => [...parsed, ...prev]);
                setPasteData('');
                setIsBulkModalOpen(false);
                alert(`Imported ${count} questions!`);
              }}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
            >
              Import Pasted Rows
            </button>
          </div>
        </div>
      )}

    </div>
  );
}