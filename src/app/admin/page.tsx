'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Layers, Plus, Trash2, Tag, BookOpen, Eye, LogOut, KeyRound,
  CheckCircle2, FolderTree, ArrowRight, Activity, ChevronRight,
  Sparkles, Award, CreditCard, Settings, ShieldAlert, FileSpreadsheet,
  UploadCloud, Search, AlertTriangle, Truck, DollarSign, FileText,
  Clock, Shield, RefreshCw, X, HelpCircle
} from 'lucide-react';

import { 
  getTaxonomyNodes, saveTaxonomyNode, deleteTaxonomyNode, 
  getAllQuestions, createQuestion, deleteQuestion,
  getCustomOlympiads, saveCustomOlympiad, deleteCustomOlympiad,
  getSiteSettings, updateSiteSettings, getAllPayments,
  TaxonomyNode, TaxonomyLevel, QuestionData, OlympiadConfig, PaymentRecord, SiteSettings
} from '@/lib/db';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';

export default function AbhyaasEnterpriseAdminTower() {
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'taxonomy' | 'questions' | 'olympiad' | 'fulfillment' | 'cms'>('overview');
  const [loading, setLoading] = useState(false);

  // Master Data States (Always Initialized Safely)
  const [taxonomyList, setTaxonomyList] = useState<TaxonomyNode[]>([]);
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);
  const [olympiadsList, setOlympiadsList] = useState<OlympiadConfig[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [siteSettings, setSiteSettingsState] = useState<SiteSettings>({});

  // Taxonomy Module State
  const [taxLevel, setTaxLevel] = useState<TaxonomyLevel>('DOMAIN');
  const [taxNameEn, setTaxNameEn] = useState('');
  const [taxNameHi, setTaxNameHi] = useState('');
  const [taxParentId, setTaxParentId] = useState('');

  // Question Studio State
  const [qSearch, setQSearch] = useState('');
  const [qModalOpen, setQModalOpen] = useState(false);
  const [qMode, setQMode] = useState<'manual' | 'csv'>('manual');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [qForm, setQForm] = useState({
    subject: '', topic: '', questionEn: '', questionHi: '',
    optEn: ['', '', '', ''], optHi: ['', '', '', ''],
    correctOpt: 0, explanationEn: '', explanationHi: '',
    status: 'APPROVED_OLYMPIAD' as any
  });
  const [csvTargetCategory, setCsvTargetCategory] = useState('');
  const csvFileRef = useRef<HTMLInputElement | null>(null);

  // Olympiad Lifecycle State
  const [oForm, setOForm] = useState({
    titleEn: '', titleHi: '', category: '', description: '',
    assessmentFee: '49', scholarshipPool: '2,50,000', examDate: '',
    durationMinutes: '60', prepBufferMinutes: '5',
    slotStartTime: '10:00', slotEndTime: '10:30',
    antiCheatFullscreen: true, antiCheatTabSwitchLock: true,
    cadence: 'Monthly'
  });

  // Fulfillment State
  const [dbtFilter, setDbtFilter] = useState<'ALL' | 'PENDING' | 'DISPATCHED'>('ALL');

  // CMS & Policies State
  const [policies, setPolicies] = useState({
    headerLogoUrl: '',
    bannerTitleEn: 'All India Mega Olympiad 2026',
    bannerTitleHi: 'अखिल भारतीय छात्रवृत्ति परीक्षा 2026',
    termsAndConditions: 'Standard Olympiad Terms...',
    privacyPolicy: 'Standard Privacy Norms...',
    refundPolicy: 'Non-refundable once slot begins...',
    antiCheatRules: 'Full screen mandatory. 3 strikes result in disqualification.'
  });

  useEffect(() => {
    try {
      const session = localStorage.getItem('abhyaas_admin_auth');
      if (session) setCurrentUser(JSON.parse(session));
    } catch (e) {
      localStorage.removeItem('abhyaas_admin_auth');
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadMasterData();
  }, [currentUser]);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [tax, qs, oly, pay, set] = await Promise.allSettled([
        getTaxonomyNodes(), getAllQuestions(), getCustomOlympiads(),
        getAllPayments(), getSiteSettings()
      ]);

      const safeTax = tax.status === 'fulfilled' && Array.isArray(tax.value) ? tax.value : [];
      const safeQs = qs.status === 'fulfilled' && Array.isArray(qs.value) ? qs.value : [];
      const safeOly = oly.status === 'fulfilled' && Array.isArray(oly.value) ? oly.value : [];
      const safePay = pay.status === 'fulfilled' && Array.isArray(pay.value) ? pay.value : [];

      setTaxonomyList(safeTax);
      setQuestionsList(safeQs);
      setOlympiadsList(safeOly);
      setPaymentsList(safePay);

      if (set.status === 'fulfilled' && set.value) {
        setSiteSettingsState(set.value);
        setPolicies(p => ({ ...p, ...set.value }));
      }

      if (safeTax.length > 0) {
        const firstDomain = safeTax.find(t => t && t.level === 'DOMAIN') || safeTax[0];
        const safeName = firstDomain?.nameEn || (firstDomain as any)?.name || 'General';
        setQForm(f => ({ ...f, subject: safeName }));
        setCsvTargetCategory(safeName);
        setOForm(f => ({ ...f, category: safeName }));
      }
    } catch (e) {
      console.error("Master data load error caught safely:", e);
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

  // ================= 1. TAXONOMY HANDLERS =================
  const handleAddTaxonomy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxNameEn.trim()) return alert("English Name is required.");
    const newNode: TaxonomyNode = {
      id: `tax-${Date.now()}`,
      level: taxLevel,
      nameEn: taxNameEn.trim(),
      nameHi: taxNameHi.trim() || taxNameEn.trim(),
      parentId: taxParentId || undefined
    };
    setTaxonomyList(prev => [newNode, ...prev]);
    setTaxNameEn('');
    setTaxNameHi('');
    await saveTaxonomyNode(newNode);
  };

  const handleDeleteTaxonomy = async (id: string) => {
    if (!confirm("Delete this hierarchy entity?")) return;
    setTaxonomyList(prev => prev.filter(t => t && t.id !== id));
    await deleteTaxonomyNode(id);
  };

  // ================= 2. BULLETPROOF ANTI-DUPLICATE =================
  const cleanStr = (s: any) => (typeof s === 'string' ? s.toLowerCase().replace(/[^a-z0-9]/gi, '') : '');

  const checkDuplicates = (questionText: string, currentSubject: string) => {
    const target = cleanStr(questionText);
    if (!target) {
      setDuplicateWarning(null);
      return;
    }

    const exactMatch = questionsList.find(q => {
      const en = cleanStr(q?.questionEn || (q as any)?.question);
      const hi = cleanStr(q?.questionHi);
      return (en && en === target) || (hi && hi === target);
    });

    if (exactMatch) {
      setDuplicateWarning(`🚨 HARD DUPLICATE DETECTED: This exact question already exists in Database (ID: ${exactMatch.id || 'N/A'})!`);
      return;
    }

    const semanticMatch = questionsList.find(q => {
      const en = cleanStr(q?.questionEn || (q as any)?.question);
      const hasWordOverlap = target.length > 15 && en.includes(target.slice(0, 15));
      const isSameSubject = (q?.subject || '') === currentSubject;
      return hasWordOverlap && isSameSubject;
    });

    if (semanticMatch) {
      const snippet = (semanticMatch.questionEn || (semanticMatch as any).question || '').slice(0, 40);
      setDuplicateWarning(`⚠️ SEMANTIC MIRROR ALERT: High similarity found with: "${snippet}...". Verify if this is an inverted variation.`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qForm.questionEn.trim() || !qForm.subject) return alert("Question and Subject are required.");

    const newQ: QuestionData = {
      id: `q-${Date.now()}`,
      subject: qForm.subject,
      topic: qForm.topic || 'General',
      questionEn: qForm.questionEn,
      questionHi: qForm.questionHi || qForm.questionEn,
      optionsEn: qForm.optEn,
      optionsHi: qForm.optHi,
      correctOption: qForm.correctOpt,
      approvalStatus: qForm.status,
      explanationEn: qForm.explanationEn,
      explanationHi: qForm.explanationHi,
      timesUsedInOlympiad: 0
    };

    setQuestionsList(prev => [newQ, ...prev]);
    setQModalOpen(false);
    setDuplicateWarning(null);
    setQForm({
      ...qForm, questionEn: '', questionHi: '',
      optEn: ['', '', '', ''], optHi: ['', '', '', ''],
      explanationEn: '', explanationHi: '', topic: ''
    });
    await createQuestion(newQ);
  };

  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) return alert("Empty CSV file.");
      
      const imported: QuestionData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        if (row.length >= 6) {
          const clean = (str: string) => str ? str.replace(/^"|"$/g, '').trim() : '';
          imported.push({
            id: `q-csv-${Date.now()}-${i}`,
            subject: csvTargetCategory || 'General',
            topic: clean(row[1]) || 'General',
            questionEn: clean(row[2]) || 'Sample Question',
            questionHi: clean(row[3]) || clean(row[2]),
            optionsEn: [clean(row[4]), clean(row[5]), clean(row[6]), clean(row[7])],
            optionsHi: [clean(row[4]), clean(row[5]), clean(row[6]), clean(row[7])],
            correctOption: parseInt(clean(row[8])) || 0,
            approvalStatus: 'APPROVED_OLYMPIAD',
            timesUsedInOlympiad: 0
          });
        }
      }
      setQuestionsList(prev => [...imported, ...prev]);
      setQModalOpen(false);
      alert(`Successfully ingested ${imported.length} questions into "${csvTargetCategory}".`);
      imported.forEach(q => createQuestion(q).catch(()=>{}));
    } catch (err) {
      alert("Error reading CSV.");
    }
  };

  // ================= 3. OLYMPIAD LIFECYCLE =================
  const handleCreateOlympiad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oForm.titleEn || !oForm.category) return alert("Title and Category required!");
    
    const newOly: OlympiadConfig = {
      id: `oly-${Date.now()}`,
      titleEn: oForm.titleEn,
      titleHi: oForm.titleHi || oForm.titleEn,
      category: oForm.category,
      description: oForm.description,
      assessmentFee: oForm.assessmentFee,
      scholarshipPool: oForm.scholarshipPool,
      examDate: oForm.examDate || 'Upcoming',
      durationMinutes: oForm.durationMinutes,
      prepBufferMinutes: oForm.prepBufferMinutes,
      slotStartTime: oForm.slotStartTime,
      slotEndTime: oForm.slotEndTime,
      antiCheatFullscreen: oForm.antiCheatFullscreen,
      antiCheatTabSwitchLock: oForm.antiCheatTabSwitchLock,
      cadence: oForm.cadence,
      status: 'ACTIVE'
    };

    setOlympiadsList(prev => [newOly, ...prev]);
    await saveCustomOlympiad(newOly);
    alert("Live Olympiad Scheduled & Launched!");
  };

  const handleAutoPushToPractice = async (categoryName: string) => {
    if (!confirm(`Push all Olympiad questions in "${categoryName}" to Free Practice & PYQ Bank?`)) return;
    const updated = questionsList.map(q => {
      if ((q?.subject === categoryName) && q?.approvalStatus === 'APPROVED_OLYMPIAD') {
        createQuestion({ ...q, approvalStatus: 'APPROVED_PRACTICE', timesUsedInOlympiad: 1 });
        return { ...q, approvalStatus: 'APPROVED_PRACTICE' as any, timesUsedInOlympiad: 1 };
      }
      return q;
    });
    setQuestionsList(updated);
    alert(`Success! Questions in "${categoryName}" are now live in Free Practice Bank.`);
  };

  const handleSaveCMS = async () => {
    await updateSiteSettings(policies);
    alert("Website Policies, Banners & Branding Updated Globally!");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b1121] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">Abhyaas Master Tower</h2>
            <p className="text-xs text-slate-400">Enterprise Operations Gateway</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm" placeholder="admin@domain.com" required />
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm" placeholder="••••••••" required />
            <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition">Enter Command Center</button>
          </form>
        </div>
      </div>
    );
  }

  // Safe Filtered Queries
  const domains = taxonomyList.filter(t => t && t.level === 'DOMAIN');
  const exams = taxonomyList.filter(t => t && t.level === 'EXAM');
  const subjects = taxonomyList.filter(t => t && t.level === 'SUBJECT');
  const topics = taxonomyList.filter(t => t && t.level === 'TOPIC');

  const filteredQs = questionsList.filter(q => {
    const qText = (q?.questionEn || (q as any)?.question || '').toLowerCase();
    const qSubj = (q?.subject || '').toLowerCase();
    const qTop = (q?.topic || '').toLowerCase();
    const search = (qSearch || '').toLowerCase();
    return qText.includes(search) || qSubj.includes(search) || qTop.includes(search);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Top Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-base shadow-sm">A</div>
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-wide flex items-center gap-2">
                ABHYAAS O.S. <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] rounded uppercase font-black">Enterprise Controller</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/practice" target="_blank" className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <Eye className="w-4 h-4 text-emerald-400"/> View Storefront
            </Link>
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 bg-slate-800 p-2 rounded-lg"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
      </header>

      {/* Main Command Workspace */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-1.5 sticky top-24 shrink-0">
          <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">Enterprise Modules</div>

          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Activity className="w-4 h-4"/> 1. Overview & Health
          </button>

          <button onClick={() => setActiveTab('taxonomy')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'taxonomy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <FolderTree className="w-4 h-4"/> 2. Master Taxonomy
          </button>

          <button onClick={() => setActiveTab('questions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <BookOpen className="w-4 h-4"/> 3. Question Vault ({questionsList.length})
          </button>

          <button onClick={() => setActiveTab('olympiad')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'olympiad' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Award className="w-4 h-4"/> 4. Olympiad Engine
          </button>

          <button onClick={() => setActiveTab('fulfillment')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'fulfillment' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Truck className="w-4 h-4"/> 5. DBT & Logistics
          </button>

          <button onClick={() => setActiveTab('cms')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'cms' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Settings className="w-4 h-4"/> 6. Storefront & Policies
          </button>

          <div className="pt-4 border-t border-slate-100 px-3">
            <div className="text-[10px] font-black text-slate-400 uppercase">Live Metrics</div>
            <div className="mt-2 space-y-1 text-xs font-bold text-slate-600">
              <div className="flex justify-between"><span>Taxonomy Nodes:</span> <span className="text-blue-600">{taxonomyList.length}</span></div>
              <div className="flex justify-between"><span>Active Olympiads:</span> <span className="text-emerald-600">{olympiadsList.length}</span></div>
              <div className="flex justify-between"><span>Total Registrations:</span> <span className="text-amber-600">{paymentsList.length}</span></div>
            </div>
          </div>
        </div>

        {/* Dynamic Studio Panels */}
        <div className="flex-grow w-full space-y-6">

          {/* ================= MODULE 1: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Questions</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{questionsList.length}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">Cloud Synced</span>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase">Hierarchy Nodes</p>
                  <p className="text-3xl font-black text-blue-600 mt-2">{taxonomyList.length}</p>
                  <span className="text-[10px] text-slate-500 font-bold">{domains.length} Domains • {exams.length} Exams</span>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase">Active Contests</p>
                  <p className="text-3xl font-black text-emerald-600 mt-2">{olympiadsList.length}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">Scheduled & Live</span>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase">Candidates / Orders</p>
                  <p className="text-3xl font-black text-amber-600 mt-2">{paymentsList.length}</p>
                  <span className="text-[10px] text-amber-600 font-bold">Verified Ledger</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" /> Enterprise Health Status
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your platform is operating in <strong>Zero-Code Enterprise Mode</strong>. Any changes made in Taxonomy, Question Bank, or Olympiad engine instantly reflect on the student storefront with zero deployment latency.
                </p>
              </div>
            </div>
          )}

          {/* ================= MODULE 2: TAXONOMY ================= */}
          {activeTab === 'taxonomy' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <FolderTree className="w-6 h-6 text-blue-600" /> Master Taxonomy Studio
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Configure your 4-level data tree: Domain ➔ Exam ➔ Subject ➔ Topic.</p>
                  </div>
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-black">
                    {(['DOMAIN', 'EXAM', 'SUBJECT', 'TOPIC'] as TaxonomyLevel[]).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => { setTaxLevel(lvl); setTaxParentId(''); }}
                        className={`px-3.5 py-2 rounded-xl transition ${taxLevel === lvl ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        {lvl === 'DOMAIN' ? '1. Domain' : lvl === 'EXAM' ? '2. Exam' : lvl === 'SUBJECT' ? '3. Subject' : '4. Topic'}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddTaxonomy} className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Name (English)*</label>
                      <input 
                        type="text" 
                        placeholder={taxLevel === 'DOMAIN' ? "e.g. School Entrance" : taxLevel === 'EXAM' ? "e.g. JNV NVS Class VI" : taxLevel === 'SUBJECT' ? "e.g. Mathematics" : "e.g. Number System"} 
                        value={taxNameEn} 
                        onChange={e => setTaxNameEn(e.target.value)} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-500" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">नाम (Hindi)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. नवोदय विद्यालय कक्षा 6" 
                        value={taxNameHi} 
                        onChange={e => setTaxNameHi(e.target.value)} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" 
                      />
                    </div>
                    {taxLevel !== 'DOMAIN' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Parent {taxLevel === 'EXAM' ? 'Domain' : taxLevel === 'SUBJECT' ? 'Exam' : 'Subject'}
                        </label>
                        <select 
                          value={taxParentId} 
                          onChange={e => setTaxParentId(e.target.value)} 
                          className="w-full p-3 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl text-sm"
                        >
                          <option value="">-- None (Root Node) --</option>
                          {taxLevel === 'EXAM' && domains.map((d, i) => <option key={d?.id || i} value={d?.id}>{d?.nameEn || 'Domain'}</option>)}
                          {taxLevel === 'SUBJECT' && exams.map((e, i) => <option key={e?.id || i} value={e?.id}>{e?.nameEn || 'Exam'}</option>)}
                          {taxLevel === 'TOPIC' && subjects.map((s, i) => <option key={s?.id || i} value={s?.id}>{s?.nameEn || 'Subject'}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                  <button type="submit" className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md flex items-center gap-2">
                    <Plus className="w-4 h-4"/> Add Node to Live System
                  </button>
                </form>
              </div>

              {/* Taxonomy Nodes List */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase">Active {taxLevel} Nodes ({taxonomyList.filter(t => t && t.level === taxLevel).length})</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {taxonomyList.filter(t => t && t.level === taxLevel).map((node, i) => (
                    <div key={node?.id || i} className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <p className="font-extrabold text-sm text-slate-900">{node?.nameEn || 'Untitled Node'}</p>
                        {node?.nameHi && <p className="text-xs text-slate-500">{node.nameHi}</p>}
                      </div>
                      <button onClick={() => handleDeleteTaxonomy(node.id)} className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= MODULE 3: QUESTION BANK & DEDUPLICATION ================= */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search questions, subjects..." value={qSearch} onChange={e=>setQSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setQMode('manual'); setQModalOpen(true); }} className="px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Plus className="w-4 h-4"/> Manual Studio
                  </button>
                  <button onClick={() => { setQMode('csv'); setQModalOpen(true); }} className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm">
                    <FileSpreadsheet className="w-4 h-4"/> Bulk CSV Upload
                  </button>
                </div>
              </div>

              {qModalOpen && (
                <div className="bg-white border-2 border-blue-600 rounded-3xl p-6 shadow-xl space-y-6 relative animate-in fade-in">
                  <button onClick={()=>setQModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full"><X className="w-4 h-4"/></button>
                  <h3 className="text-base font-black text-slate-900 border-b pb-3">{qMode === 'manual' ? 'Smart Question Ingestion Studio' : 'Bulk CSV Flat-File Importer'}</h3>

                  {qMode === 'manual' ? (
                    <form onSubmit={handleSaveQuestion} className="space-y-4">
                      
                      {duplicateWarning && (
                        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 ${duplicateWarning.includes('HARD') ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <span>{duplicateWarning}</span>
                        </div>
                      )}

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Target Category / Stream*</label>
                          <select value={qForm.subject} onChange={e=>setQForm({...qForm, subject: e.target.value})} className="w-full p-2.5 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl text-xs">
                            {taxonomyList.map((t, i) => <option key={t?.id || i} value={t?.nameEn || (t as any)?.name || 'General'}>{t?.nameEn || (t as any)?.name || 'General'} ({t?.level || 'NODE'})</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Chapter Name</label>
                          <input type="text" placeholder="e.g. Fundamental Rights" value={qForm.topic} onChange={e=>setQForm({...qForm, topic: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Initial Vault</label>
                          <select value={qForm.status} onChange={e=>setQForm({...qForm, status: e.target.value as any})} className="w-full p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold rounded-xl text-xs">
                            <option value="APPROVED_OLYMPIAD">🛡️ Live Olympiad Only (Quarantine)</option>
                            <option value="APPROVED_PRACTICE">📘 Free Practice Bank</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Question Statement (English)*</label>
                          <textarea rows={3} placeholder="Type question statement..." value={qForm.questionEn} onChange={e=>{setQForm({...qForm, questionEn: e.target.value}); checkDuplicates(e.target.value, qForm.subject);}} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">प्रश्न विवरण (Hindi)</label>
                          <textarea rows={3} placeholder="यहाँ हिंदी अनुवाद दर्ज करें..." value={qForm.questionHi} onChange={e=>setQForm({...qForm, questionHi: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                        </div>
                      </div>

                      {/* Options */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <label className="block text-[11px] font-black uppercase text-slate-400">Options & Correct Key</label>
                        {[0,1,2,3].map(i => (
                          <div key={i} className="flex gap-2 items-center">
                            <input type="radio" name="correctOpt" checked={qForm.correctOpt === i} onChange={()=>setQForm({...qForm, correctOpt: i})} className="w-4 h-4 text-blue-600" />
                            <span className="font-bold text-xs w-5">O{i+1}</span>
                            <input type="text" placeholder="English Option" value={qForm.optEn[i]} onChange={e=>{const o=[...qForm.optEn]; o[i]=e.target.value; setQForm({...qForm, optEn: o});}} className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs" required />
                            <input type="text" placeholder="हिंदी विकल्प" value={qForm.optHi[i]} onChange={e=>{const o=[...qForm.optHi]; o[i]=e.target.value; setQForm({...qForm, optHi: o});}} className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs" />
                          </div>
                        ))}
                      </div>

                      <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md">
                        Save Question to Item Bank
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Target Stream for Batch:</label>
                        <select value={csvTargetCategory} onChange={e=>setCsvTargetCategory(e.target.value)} className="w-full p-3 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl text-xs">
                          {taxonomyList.map((t, i) => <option key={t?.id || i} value={t?.nameEn || (t as any)?.name || 'General'}>{t?.nameEn || (t as any)?.name || 'General'}</option>)}
                        </select>
                      </div>
                      <div onClick={()=>csvFileRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 cursor-pointer hover:border-blue-500">
                        <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-800">Click to Select CSV Flat-File</p>
                        <input type="file" accept=".csv" ref={csvFileRef} onChange={handleCsvFile} className="hidden" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Safe Questions List */}
              <div className="space-y-2">
                {filteredQs.map((q, idx) => (
                  <div key={q?.id || idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <div className="flex gap-2 items-center">
                        <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase">{q?.subject || 'General'}</span>
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{q?.topic || 'General'}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${q?.approvalStatus === 'APPROVED_OLYMPIAD' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {q?.approvalStatus === 'APPROVED_OLYMPIAD' ? 'Olympiad Only' : 'Practice Bank'}
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-900">{q?.questionEn || (q as any)?.question || 'Untitled Question'}</p>
                      {q?.questionHi && <p className="text-[11px] text-slate-500">{q.questionHi}</p>}
                    </div>
                    <button onClick={()=>{setQuestionsList(prev => prev.filter(item=>item.id!==q.id)); deleteQuestion(q.id);}} className="text-rose-400 hover:text-rose-600 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= MODULE 4: OLYMPIAD ENGINE ================= */}
          {activeTab === 'olympiad' && (
            <div className="space-y-6">
              
              <form onSubmit={handleCreateOlympiad} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-600" /> Olympiad Commercials & Slot Scheduling
                    </h2>
                    <p className="text-xs text-slate-500">Configure contest rules, proctoring locks, registration fees, and scholarship pools.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Olympiad Title (English)*</label>
                    <input type="text" placeholder="e.g. All India Mega Olympiad" value={oForm.titleEn} onChange={e=>setOForm({...oForm, titleEn: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" required />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Category / Stream*</label>
                    <select value={oForm.category} onChange={e=>setOForm({...oForm, category: e.target.value})} className="w-full p-2.5 bg-blue-50 border border-blue-200 font-bold rounded-xl text-blue-900">
                      {taxonomyList.map((t, i) => <option key={t?.id || i} value={t?.nameEn || (t as any)?.name || 'General'}>{t?.nameEn || (t as any)?.name || 'General'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cadence / Frequency</label>
                    <select value={oForm.cadence} onChange={e=>setOForm({...oForm, cadence: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl">
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Special">Special Occasion</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assessment Fee (₹)</label>
                    <input type="text" value={oForm.assessmentFee} onChange={e=>setOForm({...oForm, assessmentFee: e.target.value})} className="w-full p-2 bg-white border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Scholarship Pool (₹)</label>
                    <input type="text" value={oForm.scholarshipPool} onChange={e=>setOForm({...oForm, scholarshipPool: e.target.value})} className="w-full p-2 bg-white border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Exam Duration (Min)</label>
                    <input type="text" value={oForm.durationMinutes} onChange={e=>setOForm({...oForm, durationMinutes: e.target.value})} className="w-full p-2 bg-white border rounded-xl" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Buffer Prep Window</label>
                    <input type="text" value={oForm.prepBufferMinutes} onChange={e=>setOForm({...oForm, prepBufferMinutes: e.target.value})} className="w-full p-2 bg-white border rounded-xl" />
                  </div>
                </div>

                <div className="flex gap-6 items-center bg-blue-50 p-4 rounded-2xl border border-blue-200 text-xs font-bold text-blue-900">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={oForm.antiCheatFullscreen} onChange={e=>setOForm({...oForm, antiCheatFullscreen: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                    Force Fullscreen & Window Lockdown
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={oForm.antiCheatTabSwitchLock} onChange={e=>setOForm({...oForm, antiCheatTabSwitchLock: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                    Block Tab Switch (3 Strikes Auto-Submit)
                  </label>
                </div>

                <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md">
                  Publish Olympiad to Live Storefront
                </button>
              </form>

              {/* Safe Olympiads List */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase">Live Scheduled Olympiads</h3>
                {olympiadsList.map((o, i) => (
                  <div key={o?.id || i} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded">{o?.category || 'General'}</span>
                        <span className="text-xs font-black text-slate-900">{o?.titleEn || (o as any)?.title || 'Olympiad'}</span>
                      </div>
                      <p className="text-xs text-slate-500">Fee: ₹{o?.assessmentFee || 0} • Pool: ₹{o?.scholarshipPool || 0} • Date: {o?.examDate || 'Upcoming'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>handleAutoPushToPractice(o.category)} className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5"/> Auto-Push to Practice Bank
                      </button>
                      <button onClick={()=>{setOlympiadsList(prev => prev.filter(item=>item.id!==o.id)); deleteCustomOlympiad(o.id);}} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ================= MODULE 5: FULFILLMENT & DBT ================= */}
          {activeTab === 'fulfillment' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Scholarship DBT & Physical Reward Dispatch</h3>
                    <p className="text-xs text-slate-500">Track candidate bank account transfers and physical certificate courier tracking.</p>
                  </div>
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button onClick={()=>setDbtFilter('ALL')} className={`px-3 py-1 rounded-lg ${dbtFilter==='ALL'?'bg-white shadow-sm':''}`}>All ({paymentsList.length})</button>
                    <button onClick={()=>setDbtFilter('PENDING')} className={`px-3 py-1 rounded-lg ${dbtFilter==='PENDING'?'bg-white shadow-sm':''}`}>Pending Grants</button>
                  </div>
                </div>

                {paymentsList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No candidate transaction records found yet.</div>
                ) : (
                  <div className="space-y-2">
                    {paymentsList.map((p, idx) => (
                      <div key={p?.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{p?.candidateName || p?.studentName || 'Student'} <span className="text-[10px] text-slate-400 font-mono">({p?.rollNo || p?.id || 'N/A'})</span></p>
                          <p className="text-[11px] text-slate-500">{p?.email || 'No Email'} • {p?.phone || 'No Phone'}</p>
                        </div>
                        <div className="flex gap-3 items-center">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md font-black text-[10px]">PAID ₹{p?.amount || 49}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-bold text-[10px]">DBT Verified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= MODULE 6: CMS & POLICIES ================= */}
          {activeTab === 'cms' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Website CMS, Branding & Legal Policies</h3>
                  <p className="text-xs text-slate-500">Edit logos, hero headlines, terms, refund rules, and anti-cheat policies without coding.</p>
                </div>
                <button onClick={handleSaveCMS} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm">
                  Publish to Live Site
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hero Banner Title (English)</label>
                  <input type="text" value={policies.bannerTitleEn} onChange={e=>setPolicies({...policies, bannerTitleEn: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hero Banner Title (Hindi)</label>
                  <input type="text" value={policies.bannerTitleHi} onChange={e=>setPolicies({...policies, bannerTitleHi: e.target.value})} className="w-full p-2.5 bg-slate-50 border rounded-xl" />
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Terms & Conditions</label>
                  <textarea rows={3} value={policies.termsAndConditions} onChange={e=>setPolicies({...policies, termsAndConditions: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Anti-Cheat & Disqualification Policy</label>
                  <textarea rows={3} value={policies.antiCheatRules} onChange={e=>setPolicies({...policies, antiCheatRules: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}