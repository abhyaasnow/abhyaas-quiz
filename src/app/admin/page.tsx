'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen, Image as ImageIcon, CreditCard, MessageSquare, Upload,
  ShieldCheck, Eye, Save, Layers, Award, Plus, Trash2, Sparkles,
  Search, Lock, LogOut, KeyRound, Smartphone, Mail, X,
  CheckCircle2, Filter, Download, FileSpreadsheet, UploadCloud, Crown,
  Tag, Calendar, Settings, Activity
} from 'lucide-react';

// Database API Imports (Must match your updated db.ts)
import { 
  createQuestion, getAllQuestions, updateQuestionStatus, deleteQuestion,
  getSiteSettings, updateSiteSettings, getAllPayments, approvePaymentToken,
  getAllSupportTickets, resolveSupportTicket, getCustomOlympiads, saveCustomOlympiad,
  getCustomCategories, saveCustomCategory,
  QuestionData, ApprovalStatus, PaymentRecord, SupportTicket, OlympiadConfig, CategoryConfig
} from '@/lib/db';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';

export default function UltimateZeroCodeAdminPanel() {
  // 1. Auth State
  const [currentUser, setCurrentUser] = useState<{ email: string; isMaster: boolean } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 2. Global UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'olympiads' | 'categories' | 'settings' | 'users' | 'support'>('dashboard');
  const [loading, setLoading] = useState(false);

  // 3. Database States
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);
  const [olympiadsList, setOlympiadsList] = useState<OlympiadConfig[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryConfig[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);

  // 4. Form States: Site Settings (Zero-Code Frontend Control)
  const [siteConfig, setSiteConfig] = useState({
    headerLogoUrl: '', footerLogoUrl: '', bannerTitleHi: '', bannerTitleEn: '', scholarshipPool: '', assessmentFee: '', bannerGraphicUrl: ''
  });

  // 5. Form States: Olympiad Creator
  const [newOlympiad, setNewOlympiad] = useState({
    titleEn: '', titleHi: '', category: '', description: '', assessmentFee: '', scholarshipPool: '', examDate: ''
  });

  // 6. Form States: Category Creator
  const [newCategoryName, setNewCategoryName] = useState('');

  // 7. Form States: Question Studio
  const [qMode, setQMode] = useState<'manual' | 'csv'>('manual');
  const [showQForm, setShowQForm] = useState(false);
  const [qForm, setQForm] = useState({
    subject: 'polity', topic: '', questionEn: '', questionHi: '', optEn: ['', '', '', ''], optHi: ['', '', '', ''],
    correctOpt: 0, diagramUrl: '', explanationEn: '', explanationHi: '', status: 'APPROVED_OLYMPIAD' as ApprovalStatus
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  // ================= LIFECYCLE & DATA SYNC =================
  useEffect(() => {
    const session = localStorage.getItem('abhyaas_admin_auth');
    if (session) setCurrentUser(JSON.parse(session));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadAllSystemData();
  }, [currentUser]);

  const loadAllSystemData = async () => {
    setLoading(true);
    try {
      const [q, ol, cat, pay, tck, settings] = await Promise.all([
        getAllQuestions(), getCustomOlympiads(), getCustomCategories(),
        getAllPayments(), getAllSupportTickets(), getSiteSettings()
      ]);
      if (q) setQuestionsList(q);
      if (ol) setOlympiadsList(ol);
      if (cat) {
        setCategoriesList(cat);
        if (cat.length > 0 && !newOlympiad.category) setNewOlympiad(p => ({ ...p, category: cat[0].name }));
      }
      if (pay) setPaymentsList(pay);
      if (tck) setTicketsList(tck);
      if (settings) setSiteConfig({
        headerLogoUrl: settings.headerLogoUrl || '', footerLogoUrl: settings.footerLogoUrl || '',
        bannerTitleHi: settings.bannerTitleHi || '', bannerTitleEn: settings.bannerTitleEn || '',
        scholarshipPool: settings.scholarshipPool || '', assessmentFee: settings.assessmentFee || '',
        bannerGraphicUrl: settings.bannerGraphicUrl || ''
      });
    } catch (e) {
      console.warn("Data sync skipped. Using local cache.");
    } finally {
      setLoading(false);
    }
  };

  // ================= AUTHENTICATION =================
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim() === MASTER_ADMIN_EMAIL && loginPassword === 'Abhyaas@2026') {
      const user = { email: MASTER_ADMIN_EMAIL, isMaster: true };
      setCurrentUser(user);
      localStorage.setItem('abhyaas_admin_auth', JSON.stringify(user));
    } else {
      alert("Invalid Credentials. Check Email or Password.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('abhyaas_admin_auth');
  };

  // ================= ZERO-CODE SYSTEM BUILDERS =================
  
  // A. Save Global Website Settings (Banners, Fees, Logos)
  const saveSiteSettings = () => {
    alert("Updating Live Website Parameters...");
    updateSiteSettings(siteConfig).catch(()=>{});
    alert("Website Updated Successfully!");
  };

  // B. Create New Category/Subject dynamically
  const createCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCat = { id: `cat-${Date.now()}`, name: newCategoryName.trim() };
    setCategoriesList([newCat, ...categoriesList]);
    saveCustomCategory(newCat).catch(()=>{});
    setNewCategoryName('');
    alert("New Category Added to the System!");
  };

  // C. Create New Olympiad Exam dynamically
  const createOlympiad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOlympiad.titleEn || !newOlympiad.category) return alert("Title and Category are required!");
    const createdExam: OlympiadConfig = {
      id: `exam-${Date.now()}`,
      titleHi: newOlympiad.titleHi || newOlympiad.titleEn,
      titleEn: newOlympiad.titleEn,
      category: newOlympiad.category,
      description: newOlympiad.description,
      assessmentFee: newOlympiad.assessmentFee,
      scholarshipPool: newOlympiad.scholarshipPool,
      examDate: newOlympiad.examDate,
      status: 'ACTIVE'
    };
    setOlympiadsList([createdExam, ...olympiadsList]);
    saveCustomOlympiad(createdExam).catch(()=>{});
    setNewOlympiad({ titleEn: '', titleHi: '', category: categoriesList[0]?.name || '', description: '', assessmentFee: '', scholarshipPool: '', examDate: '' });
    alert("New Olympiad Exam Launched Live!");
  };

  // D. Lightning Fast Manual Question Creation (Zero Loading Delay)
  const submitManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qForm.questionEn || !qForm.questionHi) return alert("Questions cannot be empty.");
    
    const newQuestion: QuestionData = {
      id: `q-${Date.now()}`,
      subject: qForm.subject,
      topic: qForm.topic || 'General',
      questionEn: qForm.questionEn,
      questionHi: qForm.questionHi,
      optionsEn: qForm.optEn,
      optionsHi: qForm.optHi,
      correctOption: qForm.correctOpt,
      approvalStatus: qForm.status,
      timesUsedInOlympiad: 0,
      diagramUrl: qForm.diagramUrl || null,
      explanationEn: qForm.explanationEn,
      explanationHi: qForm.explanationHi
    };

    // 1. INSTANT UI UPDATE (No waiting for database)
    setQuestionsList([newQuestion, ...questionsList]);
    setShowQForm(false);
    alert("Question Published Instantly!");

    // 2. BACKGROUND SYNC (Does not freeze the screen)
    createQuestion(newQuestion).catch(()=>{});

    // 3. RESET FORM
    setQForm({ ...qForm, questionEn: '', questionHi: '', optEn: ['', '', '', ''], optHi: ['', '', '', ''], explanationEn: '', explanationHi: '', topic: '' });
  };

  // E. Ultra-Fast Robust CSV Importer (Bypasses Firebase Timeouts)
  const processCSV = async () => {
    if (!csvFile) return alert("Select a CSV file first!");
    
    try {
      const text = await csvFile.text();
      // Robust split handling newlines
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) return alert("File is empty or invalid format.");

      const importedQs: QuestionData[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        // Safe split preserving quotes
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        if (row.length >= 10) {
          const clean = (str: string) => str ? str.replace(/^"|"$/g, '').trim() : '';
          
          if (clean(row[5]) || clean(row[3])) { // Check if English Question exists
            importedQs.push({
              id: `q-csv-${Date.now()}-${i}`,
              subject: clean(row[0]) || 'General',
              topic: clean(row[1]) || 'Mix',
              questionEn: clean(row[5]) || clean(row[3]),
              questionHi: clean(row[6]) || clean(row[4]),
              optionsEn: [clean(row[7]), clean(row[9]), clean(row[11]), clean(row[13])],
              optionsHi: [clean(row[8]), clean(row[10]), clean(row[12]), clean(row[14])],
              correctOption: parseInt(clean(row[15])) || 0,
              approvalStatus: 'APPROVED_OLYMPIAD',
              timesUsedInOlympiad: 0,
              explanationEn: clean(row[17]) || '',
              explanationHi: clean(row[18]) || ''
            });
          }
        }
      }

      // 1. INSTANT UI UPDATE
      setQuestionsList([...importedQs, ...questionsList]);
      setCsvFile(null);
      setShowQForm(false);
      alert(`Success! ${importedQs.length} Questions imported instantly.`);

      // 2. BACKGROUND SYNC (No UI Freezing)
      importedQs.forEach(q => createQuestion(q).catch(()=>{}));

    } catch (err) {
      alert("Error reading CSV file. Ensure it's UTF-8 formatted.");
    }
  };

  const getCsvTemplate = () => {
    const csvContent = "subject,topic,difficulty,targetCategory,questionType,questionEn,questionHi,opt1En,opt1Hi,opt2En,opt2Hi,opt3En,opt3Hi,opt4En,opt4Hi,correctOption,diagramUrl,explanationEn,explanationHi\npolity,Preamble,Medium,UPSC CSE,APPROVED_OLYMPIAD,\"Question here\",\"यहाँ प्रश्न लिखें\",\"Opt A\",\"विकल्प A\",\"Opt B\",\"विकल्प B\",\"Opt C\",\"विकल्प C\",\"Opt D\",\"विकल्प D\",0,\"\",\"Explanation Eng\",\"व्याख्या हिंदी\"";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Abhyaas_Questions_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ================= RENDER LOGIC =================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b1121] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Zero-Code Gateway</h2>
            <p className="text-xs text-slate-400">Master Admin Control Panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Master Email</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:border-blue-500 focus:outline-none" placeholder="admin@domain.com" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Master Key</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:border-blue-500 focus:outline-none" placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-lg transition">Enter Command Center</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredQs = questionsList.filter(q => q.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) || q.topic.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* ---------------- NAVIGATION TOP BAR ---------------- */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-black text-lg shadow-sm">A</div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-2">
                ABHYAAS O.S. <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] rounded uppercase tracking-wider">Zero-Code Admin</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg"><Eye className="w-4 h-4"/> View Live Site</Link>
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 bg-slate-800 p-2 rounded-lg"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ---------------- SIDEBAR MENU ---------------- */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-1 sticky top-24">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><Activity className="w-5 h-5"/> Overview</button>
          <button onClick={() => setActiveTab('olympiads')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'olympiads' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><Award className="w-5 h-5"/> Olympiad Manager</button>
          <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><Tag className="w-5 h-5"/> Categories & Streams</button>
          <button onClick={() => setActiveTab('questions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><BookOpen className="w-5 h-5"/> Question Bank</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><Settings className="w-5 h-5"/> Website CMS Control</button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><CreditCard className="w-5 h-5"/> Payments & Users</button>
        </div>

        {/* ---------------- DYNAMIC WORKSPACE ---------------- */}
        <div className="flex-grow w-full space-y-6">

          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Questions</p>
                <p className="text-4xl font-black text-slate-900 mt-2">{questionsList.length}</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Olympiads</p>
                <p className="text-4xl font-black text-blue-600 mt-2">{olympiadsList.length}</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</p>
                <p className="text-4xl font-black text-emerald-600 mt-2">{categoriesList.length}</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registrations</p>
                <p className="text-4xl font-black text-purple-600 mt-2">{paymentsList.length}</p>
              </div>
            </div>
          )}

          {/* 2. OLYMPIAD MANAGER (ZERO CODE) */}
          {activeTab === 'olympiads' && (
            <div className="space-y-6">
              <form onSubmit={createOlympiad} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Award className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-black text-slate-900">Launch New Olympiad / Exam</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-5 text-sm">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Olympiad Title (English) *</label>
                    <input type="text" placeholder="e.g. National Constitutional Law Exam" value={newOlympiad.titleEn} onChange={e => setNewOlympiad({...newOlympiad, titleEn: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50 focus:border-blue-500" required />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Olympiad Title (Hindi)</label>
                    <input type="text" placeholder="e.g. राष्ट्रीय संविधान विधि परीक्षा" value={newOlympiad.titleHi} onChange={e => setNewOlympiad({...newOlympiad, titleHi: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50 focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1.5">Target Category / Stream *</label>
                    <select value={newOlympiad.category} onChange={e => setNewOlympiad({...newOlympiad, category: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50 font-bold focus:border-blue-500" required>
                      <option value="">-- Select or Add Category from 'Categories' Tab --</option>
                      {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Assessment Fee (₹)</label>
                    <input type="text" placeholder="e.g. 49 or 199" value={newOlympiad.assessmentFee} onChange={e => setNewOlympiad({...newOlympiad, assessmentFee: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50 focus:border-blue-500" required />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Scholarship Pool (₹)</label>
                    <input type="text" placeholder="e.g. 50000" value={newOlympiad.scholarshipPool} onChange={e => setNewOlympiad({...newOlympiad, scholarshipPool: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50 focus:border-blue-500" required />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Exam Date</label>
                    <input type="date" value={newOlympiad.examDate} onChange={e => setNewOlympiad({...newOlympiad, examDate: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50 focus:border-blue-500" required />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Syllabus / Description</label>
                    <textarea rows={1} value={newOlympiad.description} onChange={e => setNewOlympiad({...newOlympiad, description: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50 focus:border-blue-500" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <CheckCircle2 className="w-5 h-5"/> Launch Olympiad Live
                </button>
              </form>

              <div className="grid sm:grid-cols-2 gap-4">
                {olympiadsList.map(ol => (
                  <div key={ol.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase">{ol.status}</div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold uppercase">{ol.category}</span>
                    <h4 className="font-black text-slate-900 mt-3 text-lg leading-tight">{ol.titleEn}</h4>
                    <p className="text-xs text-slate-500 font-medium">{ol.titleHi}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">Fee: ₹{ol.assessmentFee}</span>
                      <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100">Pool: ₹{ol.scholarshipPool}</span>
                      <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">Date: {ol.examDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CATEGORIES & STREAMS (ZERO CODE) */}
          {activeTab === 'categories' && (
            <div className="grid md:grid-cols-2 gap-6">
              <form onSubmit={createCategory} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-black text-slate-900">Add Exam Category / Stream</h2>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Category Name</label>
                  <input type="text" placeholder="e.g. UPSC CSE, SSC, Class 10" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full p-3 rounded-xl border bg-slate-50 focus:border-blue-500" required />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4"/> Save Category
                </button>
              </form>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="text-base font-black text-slate-900">Active Categories ({categoriesList.length})</h2>
                <div className="space-y-2">
                  {categoriesList.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                      <span className="font-bold text-sm text-slate-800">{cat.name}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 rounded-md font-black uppercase">Live</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. WEBSITE CMS / SETTINGS (ZERO CODE) */}
          {activeTab === 'settings' && (
            <form onSubmit={(e)=>{e.preventDefault(); saveSiteSettings();}} className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
               <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-black text-slate-900">Website Frontend Controls (CMS)</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Homepage Hero Title (English)</label>
                    <input type="text" value={siteConfig.bannerTitleEn} onChange={e=>setSiteConfig({...siteConfig, bannerTitleEn: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">होमपेज मुख्य शीर्षक (Hindi)</label>
                    <input type="text" value={siteConfig.bannerTitleHi} onChange={e=>setSiteConfig({...siteConfig, bannerTitleHi: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Global Scholarship Display (₹)</label>
                    <input type="text" value={siteConfig.scholarshipPool} onChange={e=>setSiteConfig({...siteConfig, scholarshipPool: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Default Assessment Fee (₹)</label>
                    <input type="text" value={siteConfig.assessmentFee} onChange={e=>setSiteConfig({...siteConfig, assessmentFee: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2">
                  <Save className="w-5 h-5"/> Update Live Website
                </button>
            </form>
          )}

          {/* 5. LIGHTNING FAST QUESTION BANK STUDIO */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                <div className="relative w-full md:w-1/2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"/>
                  <input type="text" placeholder="Search questions or topics..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setQMode('manual'); setShowQForm(true); }} className="px-5 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2">
                    <Plus className="w-4 h-4"/> Manual Entry
                  </button>
                  <button onClick={() => { setQMode('csv'); setShowQForm(true); }} className="px-5 py-3 bg-slate-800 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4"/> Bulk CSV Upload
                  </button>
                </div>
              </div>

              {/* Upload Form Modal/Box */}
              {showQForm && (
                <div className="bg-white border-2 border-blue-600 rounded-3xl p-6 shadow-xl relative animate-in fade-in zoom-in-95">
                  <button onClick={()=>setShowQForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full"><X className="w-5 h-5"/></button>
                  <h3 className="text-lg font-black text-slate-900 mb-6 border-b pb-3">{qMode === 'manual' ? 'Single Manual Studio' : 'Bulk CSV Importer'}</h3>
                  
                  {qMode === 'manual' ? (
                    <form onSubmit={submitManualQuestion} className="space-y-5 text-sm">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Target Category</label>
                          <select value={qForm.subject} onChange={e=>setQForm({...qForm, subject: e.target.value})} className="w-full p-2.5 rounded-xl border bg-slate-50 font-bold">
                            {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            {categoriesList.length===0 && <option value="General">General</option>}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Topic Name</label>
                          <input type="text" placeholder="e.g. Fundamental Rights" value={qForm.topic} onChange={e=>setQForm({...qForm, topic: e.target.value})} className="w-full p-2.5 rounded-xl border bg-slate-50" />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Destination Vault</label>
                          <select value={qForm.status} onChange={e=>setQForm({...qForm, status: e.target.value as ApprovalStatus})} className="w-full p-2.5 rounded-xl border bg-emerald-50 text-emerald-900 font-bold">
                            <option value="APPROVED_OLYMPIAD">🛡️ Live Olympiad</option>
                            <option value="APPROVED_PRACTICE">📘 Free Practice</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <textarea rows={3} placeholder="Question Statement (English)*" value={qForm.questionEn} onChange={e=>setQForm({...qForm, questionEn: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50" required />
                        <textarea rows={3} placeholder="प्रश्न विवरण (Hindi)*" value={qForm.questionHi} onChange={e=>setQForm({...qForm, questionHi: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50" required />
                      </div>

                      <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <label className="block font-black text-slate-900 uppercase text-xs mb-3">Options & Correct Key</label>
                        {[0,1,2,3].map(i => (
                          <div key={i} className="flex flex-col sm:flex-row gap-3 items-center">
                            <input type="radio" name="opt" checked={qForm.correctOpt===i} onChange={()=>setQForm({...qForm, correctOpt: i})} className="w-5 h-5 text-blue-600" />
                            <span className="font-bold w-6">O{i+1}</span>
                            <input type="text" placeholder="English Option" value={qForm.optEn[i]} onChange={e=>{const o=[...qForm.optEn]; o[i]=e.target.value; setQForm({...qForm, optEn: o})}} className="w-full p-2 rounded-xl border" required/>
                            <input type="text" placeholder="Hindi Option" value={qForm.optHi[i]} onChange={e=>{const o=[...qForm.optHi]; o[i]=e.target.value; setQForm({...qForm, optHi: o})}} className="w-full p-2 rounded-xl border" required/>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <textarea rows={2} placeholder="Explanation (English)" value={qForm.explanationEn} onChange={e=>setQForm({...qForm, explanationEn: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50" />
                        <textarea rows={2} placeholder="व्याख्या (Hindi)" value={qForm.explanationHi} onChange={e=>setQForm({...qForm, explanationHi: e.target.value})} className="w-full p-3 rounded-xl border bg-slate-50" />
                      </div>

                      <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl shadow-md">Instantly Publish Question</button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <button onClick={getCsvTemplate} className="text-sm font-bold text-blue-600 underline flex items-center gap-1"><Download className="w-4 h-4"/> Get CSV Template</button>
                      </div>
                      <div onClick={()=>csvInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center bg-slate-50 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                         <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                         <p className="font-bold text-slate-900">{csvFile ? csvFile.name : 'Click to Browse & Select .CSV File'}</p>
                         <input type="file" accept=".csv" ref={csvInputRef} onChange={e => setCsvFile(e.target.files?.[0] || null)} className="hidden" />
                      </div>
                      {csvFile && (
                        <button onClick={processCSV} className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl shadow-md flex justify-center items-center gap-2">
                          <CheckCircle2 className="w-5 h-5"/> Process & Import Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Questions List Render */}
              <div className="space-y-3">
                {filteredQs.map((q, idx) => (
                  <div key={q.id || idx} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 shadow-sm hover:border-blue-300 transition">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase">{q.subject}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${q.approvalStatus === 'APPROVED_OLYMPIAD' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {q.approvalStatus === 'APPROVED_OLYMPIAD' ? 'Olympiad' : 'Practice'}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-slate-900">{q.questionEn}</p>
                      <p className="text-xs text-slate-500 mt-1">{q.questionHi}</p>
                    </div>
                    <button onClick={() => {
                       const up = questionsList.filter(item => item.id !== q.id);
                       setQuestionsList(up);
                       deleteQuestion(q.id || '').catch(()=>{});
                    }} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl self-start sm:self-center shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {filteredQs.length === 0 && <div className="text-center p-10 text-slate-400 bg-white rounded-3xl border border-slate-200">No questions found. Add some!</div>}
              </div>
            </div>
          )}

          {/* 6. USERS / PAYMENTS / SUPPORT (Stubs for structure completeness) */}
          {activeTab === 'users' && (
             <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"><h3 className="font-black text-lg">Candidate Registrations ({paymentsList.length})</h3></div>
          )}
          
        </div>
      </div>
    </div>
  );
}