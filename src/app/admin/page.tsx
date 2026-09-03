'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Edit3, Eye, LogOut, KeyRound,
  ArrowRight, Layers, ChevronDown, Check, X,
  FolderTree, BookOpen, Sparkles, AlertCircle,
  FileSpreadsheet, Upload, Download, RefreshCw,
  Filter, Search, Award, HelpCircle, ArrowDownCircle,
  AlertTriangle, CheckCircle2
} from 'lucide-react';

import { 
  getTaxonomyNodes, saveTaxonomyNode, deleteTaxonomyNode, 
  getAllQuestions, createQuestion, updateQuestion, deleteQuestion,
  bulkUploadQuestions, autoPushOlympiadQuestions,
  TaxonomyNode, TaxonomyLevel, QuestionData, QuestionSegment
} from '@/lib/db';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';

// Standard Presets for Hierarchy
const PRESETS: Record<TaxonomyLevel, { en: string; hi: string }[]> = {
  CLASS: [
    { en: 'Class 6th (Middle School)', hi: 'कक्षा 6' },
    { en: 'Class 9th (Secondary Entrance)', hi: 'कक्षा 9' },
    { en: 'Class 1st - 5th (Primary)', hi: 'प्राथमिक स्तर (कक्षा 1-5)' },
    { en: 'Class 10th (Board / Foundation)', hi: 'कक्षा 10 बोर्ड' },
    { en: 'Class 11th - 12th (Senior Secondary)', hi: 'कक्षा 11-12' },
    { en: 'Civil Services / Competitive', hi: 'प्रतियोगी परीक्षा / सिविल सेवा' }
  ],
  EXAM: [
    { en: 'JNVST (Navodaya Entrance Exam)', hi: 'जवाहर नवोदय विद्यालय प्रवेश परीक्षा' },
    { en: 'AISSEE (All India Sainik School Exam)', hi: 'अखिल भारतीय सैनिक स्कूल परीक्षा' },
    { en: 'All India Mega Olympiad 2026', hi: 'अखिल भारतीय छात्रवृत्ति ओलंपियाड 2026' },
    { en: 'National Science Olympiad (NSO)', hi: 'राष्ट्रीय विज्ञान ओलंपियाड' },
    { en: 'UPSC Civil Services (Prelims)', hi: 'संघ लोक सेवा आयोग सिविल सेवा' }
  ],
  SUBJECT: [
    { en: 'Mathematics', hi: 'गणित' },
    { en: 'Science (EVS & Physics/Chem/Bio)', hi: 'विज्ञान एवं पर्यावरण' },
    { en: 'Mental Ability & Reasoning', hi: 'मानसिक योग्यता एवं तर्कशक्ति' },
    { en: 'Language Test (Hindi)', hi: 'भाषा परीक्षा (हिंदी)' },
    { en: 'Language Test (English)', hi: 'भाषा परीक्षा (अंग्रेजी)' },
    { en: 'General Studies / Indian Polity', hi: 'सामान्य अध्ययन / भारतीय राजव्यवस्था' }
  ],
  TOPIC: [
    { en: 'Number System & Place Value', hi: 'संख्या पद्धति एवं स्थानीय मान' },
    { en: 'Fractions & Decimals', hi: 'भिन्न एवं दशमलव' },
    { en: 'LCM and HCF', hi: 'लघुत्तम समापवर्त्य एवं महत्तम समापवर्तक' },
    { en: 'Pattern Completion & Analogy', hi: 'चित्र मिलान एवं सादृश्यता' },
    { en: 'Preamble & Fundamental Rights', hi: 'प्रस्तावना एवं मौलिक अधिकार' }
  ],
  DOMAIN: []
};

export default function AbhyaasMasterTower() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Tab Navigation: Step A vs Step B
  const [adminTab, setAdminTab] = useState<'hierarchy' | 'questions'>('questions');

  // Master Data States
  const [taxonomyList, setTaxonomyList] = useState<TaxonomyNode[]>([]);
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(false);

  // ==================== STEP A: TAXONOMY FORM STATE ====================
  const [activeLevel, setActiveLevel] = useState<TaxonomyLevel>('CLASS');
  const [presetChoice, setPresetChoice] = useState<string>('');
  const [manualNameEn, setManualNameEn] = useState('');
  const [manualNameHi, setManualNameHi] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  // ==================== STEP B: QUESTION STUDIO STATE ====================
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isAutoPushModalOpen, setIsAutoPushModalOpen] = useState(false);
  
  // Filter Bar State
  const [searchFilter, setSearchFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | QuestionSegment>('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Anti-Duplicate Warning
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Cascading Question Form
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
  const [qCorrectOpt, setQCorrectOpt] = useState(0);
  const [qExplanationEn, setQExplanationEn] = useState('');
  const [qExplanationHi, setQExplanationHi] = useState('');

  // Auto-Push Pipeline State
  const [pushTargetExam, setPushTargetExam] = useState('');
  const [pushTargetSegment, setPushTargetSegment] = useState<'PRACTICE' | 'PYQ'>('PRACTICE');
  const [pushPyqYear, setPushPyqYear] = useState('2026');

  const csvInputRef = useRef<HTMLInputElement | null>(null);

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
      const [taxNodes, questions] = await Promise.all([getTaxonomyNodes(), getAllQuestions()]);
      setTaxonomyList(taxNodes || []);
      setQuestionsList(questions || []);

      // Set initial cascade defaults
      const classes = (taxNodes || []).filter(t => t.level === 'CLASS');
      if (classes.length > 0 && !qClass) {
        setQClass(classes[0].nameEn);
      }
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

  // ==================== STEP A: TAXONOMY ACTIONS ====================
  const handlePresetChange = (val: string) => {
    setPresetChoice(val);
    if (val === 'OTHER') {
      setManualNameEn('');
      setManualNameHi('');
    } else if (val) {
      const found = PRESETS[activeLevel]?.find(p => p.en === val);
      if (found) {
        setManualNameEn(found.en);
        setManualNameHi(found.hi);
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
    setManualNameEn('');
    setManualNameHi('');
    setPresetChoice('');
    await saveTaxonomyNode(newNode);
    alert(`Saved "${finalEn}" to ${activeLevel}!`);
  };

  const handleDeleteTaxonomy = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from ${activeLevel}?`)) return;
    setTaxonomyList(prev => prev.filter(t => t.id !== id));
    await deleteTaxonomyNode(id);
  };

  // ==================== STEP B: QUESTION ACTIONS ====================
  const cleanStr = (s: any) => String(s || '').toLowerCase().replace(/[^a-z0-9]/gi, '');

  const checkDuplicates = (text: string) => {
    const target = cleanStr(text);
    if (!target || target.length < 5) {
      setDuplicateWarning(null);
      return;
    }

    const exact = questionsList.find(q => {
      if (editingQuestionId && q.id === editingQuestionId) return false;
      return cleanStr(q.questionEn) === target || cleanStr(q.questionHi) === target;
    });

    if (exact) {
      setDuplicateWarning(`🚨 HARD DUPLICATE DETECTED: This exact question already exists in [${exact.segment}] (ID: ${exact.id})!`);
      return;
    }

    const semantic = questionsList.find(q => {
      if (editingQuestionId && q.id === editingQuestionId) return false;
      const en = cleanStr(q.questionEn);
      return target.length > 15 && en.includes(target.slice(0, 15));
    });

    if (semantic) {
      setDuplicateWarning(`⚠️ SEMANTIC MIRROR ALERT: High similarity found with question: "${semantic.questionEn.slice(0, 45)}...". Please verify if this is an inverted variation.`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const openCreateQuestionModal = () => {
    setEditingQuestionId(null);
    setDuplicateWarning(null);
    setQStatementEn('');
    setQStatementHi('');
    setQOptionsEn(['', '', '', '']);
    setQOptionsHi(['', '', '', '']);
    setQCorrectOpt(0);
    setQExplanationEn('');
    setQExplanationHi('');
    setQSegment('PRACTICE');
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: QuestionData) => {
    setEditingQuestionId(q.id);
    setDuplicateWarning(null);
    setQClass(q.className || '');
    setQExam(q.examName || '');
    setQSubject(q.subjectName || '');
    setQTopic(q.topicName || '');
    setQSegment(q.segment || 'PRACTICE');
    setQPyqYear(q.pyqYear || '2024');
    setQStatementEn(q.questionEn || '');
    setQStatementHi(q.questionHi || '');
    setQOptionsEn([...(q.optionsEn || ['', '', '', ''])]);
    setQOptionsHi([...(q.optionsHi || ['', '', '', ''])]);
    setQCorrectOpt(q.correctOption || 0);
    setQExplanationEn(q.explanationEn || '');
    setQExplanationHi(q.explanationHi || '');
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

    const questionPayload: QuestionData = {
      id: editingQuestionId || `q-${Date.now()}`,
      className: finalClass,
      examName: finalExam,
      subjectName: finalSubject,
      topicName: finalTopic || 'General',
      segment: qSegment,
      pyqYear: qSegment === 'PYQ' ? qPyqYear : '',
      questionEn: qStatementEn.trim(),
      questionHi: qStatementHi.trim() || qStatementEn.trim(),
      optionsEn: qOptionsEn,
      optionsHi: qOptionsHi,
      correctOption: qCorrectOpt,
      explanationEn: qExplanationEn.trim(),
      explanationHi: qExplanationHi.trim(),
      timesUsedInOlympiad: 0
    };

    if (editingQuestionId) {
      setQuestionsList(prev => prev.map(item => item.id === editingQuestionId ? questionPayload : item));
      await updateQuestion(editingQuestionId, questionPayload);
      alert("Question updated successfully!");
    } else {
      setQuestionsList(prev => [questionPayload, ...prev]);
      await createQuestion(questionPayload);
      alert(`Question created and saved to [${qSegment}]!`);
    }

    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    setQuestionsList(prev => prev.filter(q => q.id !== id));
    await deleteQuestion(id);
  };

  // Bulk CSV Upload Handler
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) return alert("Empty CSV file.");

      const parsed: QuestionData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        const clean = (val: string) => val ? val.replace(/^"|"$/g, '').trim() : '';
        if (row.length >= 7) {
          const seg = clean(row[0]).toUpperCase();
          const validSegment: QuestionSegment = (seg === 'PYQ' || seg === 'OLYMPIAD') ? seg : 'PRACTICE';

          parsed.push({
            id: `q-csv-${Date.now()}-${i}`,
            segment: validSegment,
            className: clean(row[1]) || 'Class 6th',
            examName: clean(row[2]) || 'JNVST',
            subjectName: clean(row[3]) || 'Mathematics',
            topicName: clean(row[4]) || 'General',
            pyqYear: clean(row[5]) || '2024',
            questionEn: clean(row[6]),
            questionHi: clean(row[7]) || clean(row[6]),
            optionsEn: [clean(row[8]), clean(row[9]), clean(row[10]), clean(row[11])],
            optionsHi: [clean(row[12]) || clean(row[8]), clean(row[13]) || clean(row[9]), clean(row[14]) || clean(row[10]), clean(row[15]) || clean(row[11])],
            correctOption: (parseInt(clean(row[16])) - 1) >= 0 ? parseInt(clean(row[16])) - 1 : 0,
            explanationEn: clean(row[17]) || '',
            explanationHi: clean(row[18]) || '',
            timesUsedInOlympiad: 0
          });
        }
      }

      const uploadedCount = await bulkUploadQuestions(parsed);
      setQuestionsList(prev => [...parsed, ...prev]);
      setIsCsvModalOpen(false);
      alert(`🎉 Successfully uploaded ${uploadedCount} questions in bulk!`);
    } catch (err) {
      alert("Error parsing CSV file. Please use the provided template.");
    }
  };

  // Download Sample CSV Template
  const downloadSampleCsv = () => {
    const header = "Segment(PRACTICE/PYQ/OLYMPIAD),Class,Exam,Subject,Topic,PYQYear,QuestionEn,QuestionHi,Opt1_En,Opt2_En,Opt3_En,Opt4_En,Opt1_Hi,Opt2_Hi,Opt3_Hi,Opt4_Hi,CorrectOpt(1-4),ExplanationEn,ExplanationHi\n";
    const sample = 'PRACTICE,Class 6th,JNVST,Mathematics,Number System,2024,"What is the smallest prime number?","सबसे छोटी अभाज्य संख्या कौन सी है?","1","2","3","4","1","2","3","4",2,"2 is the only even prime number.","2 एकमात्र सम अभाज्य संख्या है।"\n';
    const blob = new Blob([header + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Abhyaas_Question_Bulk_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-Push Pipeline Execution
  const handleExecuteAutoPush = async () => {
    if (!pushTargetExam) return alert("Select an Exam or Subject to transfer.");
    if (!confirm(`Are you sure you want to push all Olympiad questions in "${pushTargetExam}" to ${pushTargetSegment}?`)) return;

    const count = await autoPushOlympiadQuestions(pushTargetExam, pushTargetSegment, pushPyqYear);
    if (count === 0) {
      alert(`No Olympiad questions found under "${pushTargetExam}".`);
    } else {
      alert(`🚀 Success! Transferred ${count} questions from Olympiad to ${pushTargetSegment}.`);
      loadAllData();
      setIsAutoPushModalOpen(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-mono">
        Initializing Abhyaas Command Center...
      </div>
    );
  }

  // Auth Screen
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

  // Cascading Helpers
  const classes = taxonomyList.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN');
  const currentClassNode = classes.find(c => c.nameEn === qClass);
  const availableExams = taxonomyList.filter(t => t.level === 'EXAM' && (!currentClassNode || t.parentId === currentClassNode.id));
  const currentExamNode = availableExams.find(e => e.nameEn === qExam);
  const availableSubjects = taxonomyList.filter(t => t.level === 'SUBJECT' && (!currentExamNode || t.parentId === currentExamNode.id));
  const currentSubjectNode = availableSubjects.find(s => s.nameEn === qSubject);
  const availableTopics = taxonomyList.filter(t => t.level === 'TOPIC' && (!currentSubjectNode || t.parentId === currentSubjectNode.id));

  // Filtered Question List for Display
  const filteredQuestions = questionsList.filter(q => {
    const matchesSearch = cleanStr(q.questionEn).includes(cleanStr(searchFilter)) || cleanStr(q.questionHi).includes(cleanStr(searchFilter)) || cleanStr(q.subjectName).includes(cleanStr(searchFilter));
    const matchesSegment = segmentFilter === 'ALL' || q.segment === segmentFilter;
    const matchesClass = selectedClassFilter === 'ALL' || q.className === selectedClassFilter;
    return matchesSearch && matchesSegment && matchesClass;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-base shadow-sm">A</div>
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-wide flex items-center gap-2">
                ABHYAAS O.S. <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] rounded font-mono uppercase">Unified Controller</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/practice" target="_blank" className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <Eye className="w-4 h-4 text-emerald-400"/> Live Storefront
            </Link>
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 bg-slate-800 p-2 rounded-xl">
              <LogOut className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">

        {/* Master Navigation Tabs: Step A vs Step B */}
        <div className="bg-white p-2 border border-slate-200 rounded-3xl shadow-sm flex gap-2">
          <button
            onClick={() => setAdminTab('questions')}
            className={`flex-1 py-3.5 px-5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              adminTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 2. Question Bank & Vault ({questionsList.length})
          </button>
          <button
            onClick={() => setAdminTab('hierarchy')}
            className={`flex-1 py-3.5 px-5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              adminTab === 'hierarchy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderTree className="w-4 h-4" /> 1. Category & Hierarchy ({taxonomyList.length})
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: STEP A - CATEGORY & HIERARCHY MANAGEMENT (PRESERVED 100%) */}
        {/* ========================================================================= */}
        {adminTab === 'hierarchy' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Level Selector Tabs */}
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

            {/* Hierarchy Form */}
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
                    className="w-full h-11 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 appearance-none outline-none cursor-pointer"
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
                      <option value="">-- Select Parent Entity (Optional) --</option>
                      {activeLevel === 'EXAM' && classes.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                      {activeLevel === 'SUBJECT' && taxonomyList.filter(t => t.level === 'EXAM').map(e => <option key={e.id} value={e.id}>{e.nameEn}</option>)}
                      {activeLevel === 'TOPIC' && taxonomyList.filter(t => t.level === 'SUBJECT').map(s => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-blue-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}

                <button type="submit" className="px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Save {activeLevel} Node
                </button>
              </form>
            </div>

            {/* Current Nodes List */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase">Active {activeLevel} Nodes</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {taxonomyList.filter(t => t.level === activeLevel).map(item => (
                  <div key={item.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-extrabold text-sm text-slate-900">{item.nameEn}</p>
                      {item.nameHi && <p className="text-xs text-slate-500">{item.nameHi}</p>}
                    </div>
                    <button onClick={() => handleDeleteTaxonomy(item.id, item.nameEn)} className="text-rose-400 hover:text-rose-600 p-2 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STEP B - QUESTION BANK MANAGEMENT STUDIO & VAULT */}
        {/* ========================================================================= */}
        {adminTab === 'questions' && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Top Command Toolbar */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Question Bank & Quarantine Vault
                  </h2>
                  <p className="text-xs text-slate-500">Manage Practice Sets, PYQs, and Live Olympiad Question Banks.</p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={openCreateQuestionModal}
                    className="px-4 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" /> Single Question Studio
                  </button>
                  <button
                    onClick={() => setIsCsvModalOpen(true)}
                    className="px-4 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Bulk CSV Upload
                  </button>
                  <button
                    onClick={() => setIsAutoPushModalOpen(true)}
                    className="px-4 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <RefreshCw className="w-4 h-4" /> Push Olympiad ➔ PYQ/Practice
                  </button>
                </div>
              </div>

              {/* Segment & Search Filter Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                
                {/* Segment Badges */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-black w-full sm:w-auto">
                  {(['ALL', 'PRACTICE', 'PYQ', 'OLYMPIAD'] as const).map(seg => (
                    <button
                      key={seg}
                      onClick={() => setSegmentFilter(seg)}
                      className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition ${
                        segmentFilter === seg 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {seg === 'ALL' ? `All (${questionsList.length})` :
                       seg === 'PRACTICE' ? `Practice Sets (${questionsList.filter(q=>q.segment==='PRACTICE').length})` :
                       seg === 'PYQ' ? `PYQ Archive (${questionsList.filter(q=>q.segment==='PYQ').length})` :
                       `🛡️ Olympiad (${questionsList.filter(q=>q.segment==='OLYMPIAD').length})`}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search question, subject, topic..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                  />
                </div>

              </div>
            </div>

            {/* Questions Table / List */}
            <div className="space-y-3">
              {filteredQuestions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-extrabold text-sm text-slate-800">No Questions Found</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Click on <strong>Single Question Studio</strong> or <strong>Bulk CSV Upload</strong> to add your questions.
                  </p>
                </div>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="bg-white border border-slate-200 hover:border-blue-300 p-5 rounded-2xl shadow-sm transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Segment Badge */}
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          q.segment === 'OLYMPIAD' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          q.segment === 'PYQ' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                          'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {q.segment === 'OLYMPIAD' ? '🛡️ Live Olympiad Only' :
                           q.segment === 'PYQ' ? `📜 PYQ (${q.pyqYear || 'Exam'})` :
                           '📘 Free Practice Drill'}
                        </span>

                        {/* Hierarchy Tagging */}
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {q.className} ➔ {q.examName} ➔ {q.subjectName}
                        </span>

                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Topic: {q.topicName}
                        </span>
                      </div>

                      {/* Edit & Delete Controls */}
                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <button
                          onClick={() => openEditQuestionModal(q)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div>
                      <p className="font-bold text-sm text-slate-900">{q.questionEn}</p>
                      {q.questionHi && <p className="text-xs text-slate-600 mt-0.5">{q.questionHi}</p>}
                    </div>

                    {/* Options Preview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      {q.optionsEn?.map((opt, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                            q.correctOption === i
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                            q.correctOption === i ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                          }`}>
                            {i + 1}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>
                      ))}
                    </div>

                    {/* Explanation Snippet */}
                    {(q.explanationEn || q.explanationHi) && (
                      <div className="p-2.5 bg-blue-50/60 rounded-xl text-[11px] text-blue-900 border border-blue-100 flex items-start gap-1.5">
                        <span className="font-black shrink-0">💡 Explanation:</span>
                        <span>{q.explanationEn || q.explanationHi}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SINGLE QUESTION STUDIO (CASCADING + BILINGUAL + ANTI-DUPLICATE) */}
      {/* ========================================================================= */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingQuestionId ? 'Edit Question Entry' : 'Add Question to Bank'}
                </h3>
                <p className="text-xs text-slate-500">Configure hierarchy cascade, bilingual statements, and correct key.</p>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-5">
              
              {/* Anti-Duplicate Warning Banner */}
              {duplicateWarning && (
                <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${
                  duplicateWarning.includes('HARD') 
                    ? 'bg-rose-50 border-rose-300 text-rose-800' 
                    : 'bg-amber-50 border-amber-300 text-amber-800'
                }`}>
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              {/* Segment / Vault Selector */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-black uppercase text-slate-500">
                  Target Vault / Segment*
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { id: 'PRACTICE', title: '📘 Free Practice Drill', desc: 'Instant student practice access' },
                    { id: 'PYQ', title: '📜 Previous Year (PYQ)', desc: 'Official past year repository' },
                    { id: 'OLYMPIAD', title: '🛡️ Live Olympiad Vault', desc: 'Quarantine lock until contest' },
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
                      placeholder="e.g. 2024"
                      className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold w-32 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 4-Tier Cascading Hierarchy */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* 1. Class Cascading Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. Class / Tier*</label>
                  <div className="relative">
                    <select
                      value={qClass}
                      onChange={e => setQClass(e.target.value)}
                      className="w-full h-11 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map(c => <option key={c.id} value={c.nameEn}>{c.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {qClass === 'OTHER' && (
                    <input
                      type="text"
                      placeholder="Enter custom Class name"
                      value={qClassCustom}
                      onChange={e => setQClassCustom(e.target.value)}
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs outline-none"
                      required
                    />
                  )}
                </div>

                {/* 2. Exam Cascading Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Target Examination*</label>
                  <div className="relative">
                    <select
                      value={qExam}
                      onChange={e => setQExam(e.target.value)}
                      className="w-full h-11 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Exam --</option>
                      {availableExams.map(e => <option key={e.id} value={e.nameEn}>{e.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {qExam === 'OTHER' && (
                    <input
                      type="text"
                      placeholder="Enter custom Exam name"
                      value={qExamCustom}
                      onChange={e => setQExamCustom(e.target.value)}
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs outline-none"
                      required
                    />
                  )}
                </div>

                {/* 3. Subject Cascading Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">3. Subject*</label>
                  <div className="relative">
                    <select
                      value={qSubject}
                      onChange={e => setQSubject(e.target.value)}
                      className="w-full h-11 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Subject --</option>
                      {availableSubjects.map(s => <option key={s.id} value={s.nameEn}>{s.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {qSubject === 'OTHER' && (
                    <input
                      type="text"
                      placeholder="Enter custom Subject name"
                      value={qSubjectCustom}
                      onChange={e => setQSubjectCustom(e.target.value)}
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs outline-none"
                      required
                    />
                  )}
                </div>

                {/* 4. Topic Cascading Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">4. Topic / Chapter</label>
                  <div className="relative">
                    <select
                      value={qTopic}
                      onChange={e => setQTopic(e.target.value)}
                      className="w-full h-11 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Topic --</option>
                      {availableTopics.map(t => <option key={t.id} value={t.nameEn}>{t.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {qTopic === 'OTHER' && (
                    <input
                      type="text"
                      placeholder="Enter custom Topic name"
                      value={qTopicCustom}
                      onChange={e => setQTopicCustom(e.target.value)}
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs outline-none"
                    />
                  )}
                </div>

              </div>

              {/* Bilingual Question Statements */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Question Statement in English*
                  </label>
                  <textarea
                    rows={2}
                    value={qStatementEn}
                    onChange={e => { setQStatementEn(e.target.value); checkDuplicates(e.target.value); }}
                    placeholder="Enter English question text..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    प्रश्न विवरण हिंदी में (Hindi Statement)
                  </label>
                  <textarea
                    rows={2}
                    value={qStatementHi}
                    onChange={e => setQStatementHi(e.target.value)}
                    placeholder="हिंदी में प्रश्न दर्ज करें..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 4 Bilingual Options & Correct Answer Radio */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-black uppercase text-slate-500">
                  Options & Correct Answer Key*
                </label>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctKey"
                      checked={qCorrectOpt === i}
                      onChange={() => setQCorrectOpt(i)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="text-xs font-black w-6 text-slate-600">Opt {i + 1}</span>
                    <input
                      type="text"
                      placeholder={`Option ${i + 1} English`}
                      value={qOptionsEn[i]}
                      onChange={e => { const o = [...qOptionsEn]; o[i] = e.target.value; setQOptionsEn(o); }}
                      className="flex-1 h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder={`विकल्प ${i + 1} हिंदी`}
                      value={qOptionsHi[i]}
                      onChange={e => { const o = [...qOptionsHi]; o[i] = e.target.value; setQOptionsHi(o); }}
                      className="flex-1 h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Bilingual Explanations */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Explanation (English)</label>
                  <textarea
                    rows={2}
                    value={qExplanationEn}
                    onChange={e => setQExplanationEn(e.target.value)}
                    placeholder="Explain why the answer is correct..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">उत्तर का स्पष्टीकरण (Hindi)</label>
                  <textarea
                    rows={2}
                    value={qExplanationHi}
                    onChange={e => setQExplanationHi(e.target.value)}
                    placeholder="विस्तृत समाधान यहाँ लिखें..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingQuestionId ? 'Update & Commit Changes' : 'Save Question to Selected Vault'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BULK CSV UPLOAD */}
      {/* ========================================================================= */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Bulk Question Flat-File Upload
              </h3>
              <button onClick={() => setIsCsvModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Upload hundreds of questions formatted with Segment, Class, Exam, Subject, Topic, Bilingual Options, and Correct Keys via a single CSV.
              </p>

              <button
                type="button"
                onClick={downloadSampleCsv}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" /> Download Official Sample CSV Template
              </button>

              <div
                onClick={() => csvInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50 cursor-pointer transition"
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-800">Click to Select or Drop CSV File</p>
                <p className="text-[11px] text-slate-400 mt-1">UTF-8 Encoded .CSV files supported</p>
                <input
                  type="file"
                  accept=".csv"
                  ref={csvInputRef}
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AUTO-PUSH OLYMPIAD ➔ PYQ / PRACTICE PIPELINE */}
      {/* ========================================================================= */}
      {isAutoPushModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                Auto-Push Pipeline
              </h3>
              <button onClick={() => setIsAutoPushModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Once an Olympiad contest completes, automatically transfer quarantined Olympiad questions into the Free Practice Bank or official PYQ Archive.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Examination or Subject:</label>
                <div className="relative">
                  <select
                    value={pushTargetExam}
                    onChange={e => setPushTargetExam(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold appearance-none outline-none cursor-pointer"
                  >
                    <option value="">-- Choose Exam or Subject --</option>
                    {taxonomyList.filter(t => t.level === 'EXAM' || t.level === 'SUBJECT').map(item => (
                      <option key={item.id} value={item.nameEn}>{item.nameEn} ({item.level})</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Destination:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPushTargetSegment('PRACTICE')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      pushTargetSegment === 'PRACTICE' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Free Practice Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPushTargetSegment('PYQ')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      pushTargetSegment === 'PYQ' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    PYQ Archive
                  </button>
                </div>
              </div>

              {pushTargetSegment === 'PYQ' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign PYQ Year:</label>
                  <input
                    type="text"
                    value={pushPyqYear}
                    onChange={e => setPushPyqYear(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    placeholder="e.g. 2026"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleExecuteAutoPush}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Execute Transfer Now
            </button>

          </div>
        </div>
      )}

    </div>
  );
}