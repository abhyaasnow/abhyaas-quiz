'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Image as ImageIcon,
  CreditCard,
  MessageSquare,
  Upload,
  ShieldCheck,
  Eye,
  CheckCircle,
  Save,
  Layers,
  Award,
  Star,
  Plus,
  Trash2,
  Sparkles,
  Search,
  FileSpreadsheet,
  Download,
  Loader2
} from 'lucide-react';
import { 
  createQuestion, 
  getAllQuestions, 
  updateQuestionStatus, 
  deleteQuestion,
  getSiteSettings,
  updateSiteSettings,
  getAllPayments,
  approvePaymentToken,
  getAllSupportTickets,
  resolveSupportTicket,
  QuestionData,
  ApprovalStatus,
  PaymentRecord,
  SupportTicket
} from '@/lib/db';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'media' | 'questions' | 'payments' | 'support'>('media');
  const [mediaSubTab, setMediaSubTab] = useState<'brand' | 'banners'>('brand');
  const [loading, setLoading] = useState(false);

  // ================= 1. BRAND & BANNER STATE =================
  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | null>(null);
  const [footerEmblemUrl, setFooterEmblemUrl] = useState<string | null>(null);
  const [bannerTitleHi, setBannerTitleHi] = useState('राष्ट्रीय राज्यव्यवस्था ओलंपियाड : संवैधानिक ढांचा');
  const [bannerTitleEn, setBannerTitleEn] = useState('National Polity Olympiad : Constitutional Framework & Preamble');
  const [bannerScholarship, setBannerScholarship] = useState('₹50,000');
  const [bannerFee, setBannerFee] = useState('₹49');
  const [bannerGraphicUrl, setBannerGraphicUrl] = useState<string | null>(null);
  const [bannerSavedSuccess, setBannerSavedSuccess] = useState(false);

  // ================= 2. QUESTIONS STATE =================
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [selectedSubject, setSelectedSubject] = useState('polity');
  const [topicName, setTopicName] = useState('');
  const [questionEn, setQuestionEn] = useState('');
  const [questionHi, setQuestionHi] = useState('');
  const [optEn, setOptEn] = useState(['', '', '', '']);
  const [optHi, setOptHi] = useState(['', '', '', '']);
  const [correctOpt, setCorrectOpt] = useState<number>(0);
  const [formApprovalStatus, setFormApprovalStatus] = useState<ApprovalStatus>('APPROVED_OLYMPIAD');

  // ================= 3. PAYMENTS & SUPPORT STATE =================
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const headerLogoRef = useRef<HTMLInputElement | null>(null);
  const footerLogoRef = useRef<HTMLInputElement | null>(null);
  const bannerGraphicRef = useRef<HTMLInputElement | null>(null);

  // Load Real Data from Firebase on First Render
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [settings, questions, payments, tickets] = await Promise.all([
          getSiteSettings(),
          getAllQuestions(),
          getAllPayments(),
          getAllSupportTickets(),
        ]);

        if (settings) {
          if (settings.headerLogoUrl) setHeaderLogoUrl(settings.headerLogoUrl);
          if (settings.footerLogoUrl) setFooterEmblemUrl(settings.footerLogoUrl);
          if (settings.bannerTitleHi) setBannerTitleHi(settings.bannerTitleHi);
          if (settings.bannerTitleEn) setBannerTitleEn(settings.bannerTitleEn);
          if (settings.scholarshipPool) setBannerScholarship(settings.scholarshipPool);
          if (settings.assessmentFee) setBannerFee(settings.assessmentFee);
          if (settings.bannerGraphicUrl) setBannerGraphicUrl(settings.bannerGraphicUrl);
        }

        if (questions && questions.length > 0) setQuestionsList(questions);
        if (payments && payments.length > 0) setPaymentsList(payments);
        if (tickets && tickets.length > 0) setTicketsList(tickets);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Save Brand Assets to Firebase
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateSiteSettings({
      headerLogoUrl,
      footerLogoUrl: footerEmblemUrl,
    });
    setLoading(false);
    setBannerSavedSuccess(true);
    setTimeout(() => setBannerSavedSuccess(false), 3000);
    alert('Brand assets saved to Firebase Cloud!');
  };

  // Save Homepage Banner to Firebase
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateSiteSettings({
      bannerTitleHi,
      bannerTitleEn,
      scholarshipPool: bannerScholarship,
      assessmentFee: bannerFee,
      bannerGraphicUrl,
    });
    setLoading(false);
    setBannerSavedSuccess(true);
    setTimeout(() => setBannerSavedSuccess(false), 3000);
    alert('Live Homepage Banner updated on Cloud!');
  };

  // File Upload Handlers (Base64)
  const handleHeaderLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setHeaderLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFooterLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFooterEmblemUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerGraphicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerGraphicUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Question Creation in Cloud
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionEn.trim() || !questionHi.trim()) {
      alert('Kripya English aur Hindi dono statements bharein.');
      return;
    }

    setLoading(true);
    const newQuestionData: Omit<QuestionData, 'id'> = {
      subject: selectedSubject,
      topic: topicName || 'General Topic',
      questionEn,
      questionHi,
      optionsEn: [...optEn],
      optionsHi: [...optHi],
      correctOption: correctOpt,
      approvalStatus: formApprovalStatus,
      timesUsedInOlympiad: 0,
      diagramUrl: null,
    };

    const res = await createQuestion(newQuestionData);
    setLoading(false);

    if (res.success) {
      setQuestionsList([{ id: res.id, ...newQuestionData }, ...questionsList]);
      setShowAddForm(false);
      setTopicName('');
      setQuestionEn('');
      setQuestionHi('');
      setOptEn(['', '', '', '']);
      setOptHi(['', '', '', '']);
      setCorrectOpt(0);
      alert('Question permanent Cloud Vault mein save ho gaya!');
    } else {
      alert('Error saving question to database.');
    }
  };

  // Inline Status Change in Cloud
  const handleStatusUpdate = async (id: string, newStatus: ApprovalStatus) => {
    await updateQuestionStatus(id, newStatus);
    setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, approvalStatus: newStatus } : q));
  };

  // Delete Question in Cloud
  const handleDeleteQ = async (id: string) => {
    if (confirm('Kya aap is question ko Cloud Vault se delete karna chahte hain?')) {
      await deleteQuestion(id);
      setQuestionsList(prev => prev.filter(q => q.id !== id));
    }
  };

  // Approve Payment Token
  const handleApprovePay = async (id: string) => {
    await approvePaymentToken(id);
    setPaymentsList(prev => prev.map(p => p.id === id ? { ...p, status: 'SUCCESS', tokenGenerated: true } : p));
    alert('Candidate slot token approved & released!');
  };

  // Resolve Ticket
  const handleResolveTicket = async (ticketId: string) => {
    const reply = replyDrafts[ticketId];
    if (!reply || !reply.trim()) {
      alert('Kripya reply likhein.');
      return;
    }

    await resolveSupportTicket(ticketId, reply);
    setTicketsList(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED', replyText: reply } : t));
    setReplyDrafts(prev => ({ ...prev, [ticketId]: '' }));
    alert('Ticket resolved and response saved!');
  };

  const filteredQuestions = questionsList.filter(q => 
    q.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.questionHi.includes(searchQuery) ||
    q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Admin Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
              A
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base leading-none text-white">
                Abhyaas Master Control Center
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Connected to Firebase Cloud Database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Live Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'media'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media &amp; Banner Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Question Vault ({questionsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments &amp; Registrations ({paymentsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'support'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support Inbox ({ticketsList.filter(t => t.status === 'OPEN').length} Open)</span>
          </button>
        </div>

        {/* ================= TAB 1: MEDIA & BANNER HUB ================= */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setMediaSubTab('brand')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  mediaSubTab === 'brand' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>1. Brand Logos &amp; Core Icons</span>
              </button>

              <button
                onClick={() => setMediaSubTab('banners')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  mediaSubTab === 'banners' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>2. Live Homepage Hero &amp; Fee Controls</span>
              </button>
            </div>

            {mediaSubTab === 'brand' && (
              <form onSubmit={handleSaveBrand} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-base text-slate-900">Brand Identity &amp; Target Slots</h3>
                  {bannerSavedSuccess && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Cloud Updated!</span>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block uppercase">Header Navbar Logo Slot</span>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      {headerLogoUrl ? (
                        <img src={headerLogoUrl} alt="Header Logo" className="h-8 max-w-[140px] object-contain" />
                      ) : (
                        <span className="font-black text-slate-900 text-base">ABHYAAS.</span>
                      )}
                      <button type="button" onClick={() => headerLogoRef.current?.click()} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">Change</button>
                      <input type="file" accept="image/*" ref={headerLogoRef} onChange={handleHeaderLogoChange} className="hidden" />
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block uppercase">Dark Footer Emblem Slot</span>
                    <div className="p-4 bg-[#080e1a] rounded-xl border border-slate-800 flex items-center justify-between">
                      {footerEmblemUrl ? (
                        <img src={footerEmblemUrl} alt="Footer Logo" className="h-8 max-w-[140px] object-contain" />
                      ) : (
                        <span className="font-black text-white text-base">ABHYAAS</span>
                      )}
                      <button type="button" onClick={() => footerLogoRef.current?.click()} className="px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl">Change</button>
                      <input type="file" accept="image/*" ref={footerLogoRef} onChange={handleFooterLogoChange} className="hidden" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md">
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Saving...' : 'Save Brand Assets to Cloud'}</span>
                </button>
              </form>
            )}

            {mediaSubTab === 'banners' && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleSaveBanner} className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-black text-base text-slate-900">Live Homepage Banner Settings</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Olympiad Hindi Headline</label>
                      <input type="text" value={bannerTitleHi} onChange={(e) => setBannerTitleHi(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Olympiad English Title</label>
                      <input type="text" value={bannerTitleEn} onChange={(e) => setBannerTitleEn(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Scholarship Pool Amount</label>
                        <input type="text" value={bannerScholarship} onChange={(e) => setBannerScholarship(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Fee (₹)</label>
                        <input type="text" value={bannerFee} onChange={(e) => setBannerFee(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600" required />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md">
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Updating Cloud...' : 'Update Live Homepage on Cloud'}</span>
                  </button>
                </form>

                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">LIVE PREVIEW</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-600/30 text-blue-300 block">Scholarship: {bannerScholarship}</span>
                  <h4 className="text-base font-black text-amber-400 leading-tight">{bannerTitleHi}</h4>
                  <p className="text-xs font-bold text-slate-300">{bannerTitleEn}</p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Fee: {bannerFee}</span>
                    <span className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-[11px]">REGISTER • {bannerFee}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: QUESTIONS VAULT ================= */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search questions in cloud vault..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" />
              </div>
              <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>{showAddForm ? 'Close Form' : 'Add New Question'}</span>
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleCreateQuestion} className="bg-white border-2 border-blue-600 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    New Question Studio
                  </h3>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600">
                      <option value="polity">Indian Polity &amp; Constitution</option>
                      <option value="history">Modern Indian History</option>
                      <option value="economy">Indian Economy &amp; Banking</option>
                      <option value="geography">Geography &amp; Environment</option>
                      <option value="csat">CSAT &amp; Quantitative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Sub-Chapter</label>
                    <input type="text" placeholder="e.g. Fundamental Rights" value={topicName} onChange={(e) => setTopicName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Approval Destination</label>
                    <select value={formApprovalStatus} onChange={(e) => setFormApprovalStatus(e.target.value as ApprovalStatus)} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-emerald-700 bg-emerald-50/40 focus:outline-none focus:border-emerald-600">
                      <option value="APPROVED_OLYMPIAD">🛡️ Approve for Olympiad Vault</option>
                      <option value="APPROVED_PRACTICE">📘 Approve for Practice Bank</option>
                      <option value="PENDING">⏳ Keep as Draft (Pending)</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Question Statement in English</label>
                    <textarea rows={3} placeholder="Type statement in English..." value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Question Statement in Hindi (हिन्दी)</label>
                    <textarea rows={3} placeholder="यहाँ प्रश्न हिन्दी में लिखें..." value={questionHi} onChange={(e) => setQuestionHi(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" required />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-900 uppercase">Options &amp; Correct Answer Selection</label>
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-1 flex items-center justify-center">
                        <input type="radio" name="optRadio" checked={correctOpt === idx} onChange={() => setCorrectOpt(idx)} className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="sm:col-span-1 text-xs font-black text-slate-500">Option {String.fromCharCode(65 + idx)}</div>
                      <div className="sm:col-span-5">
                        <input type="text" placeholder={`Option ${String.fromCharCode(65 + idx)} in English`} value={optEn[idx]} onChange={(e) => { const copy = [...optEn]; copy[idx] = e.target.value; setOptEn(copy); }} className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs" required />
                      </div>
                      <div className="sm:col-span-5">
                        <input type="text" placeholder={`विकल्प ${String.fromCharCode(65 + idx)} हिन्दी में`} value={optHi[idx]} onChange={(e) => { const copy = [...optHi]; copy[idx] = e.target.value; setOptHi(copy); }} className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs" required />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md">
                    {loading ? 'Publishing to Cloud...' : 'Publish Question to Cloud Vault'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div key={q.id || idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2.5 py-0.5 bg-slate-900 text-white rounded-md uppercase">{q.subject}</span>
                      <span className="text-xs font-bold text-slate-500">{q.topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={q.approvalStatus} onChange={(e) => q.id && handleStatusUpdate(q.id, e.target.value as ApprovalStatus)} className="text-xs font-bold px-2.5 py-1 rounded-xl border bg-slate-50">
                        <option value="APPROVED_OLYMPIAD">🛡️ Olympiad Vault</option>
                        <option value="APPROVED_PRACTICE">📘 Practice Bank</option>
                        <option value="PENDING">⏳ Pending Review</option>
                      </select>
                      <button onClick={() => q.id && handleDeleteQ(q.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900">#{idx + 1}. {q.questionEn}</p>
                  <p className="text-xs text-slate-500">{q.questionHi}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PAYMENTS ================= */}
        {activeTab === 'payments' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900">Live Razorpay Registrations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Candidate &amp; Roll No</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Admit Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentsList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{p.candidateName}</p>
                        <p className="text-[11px] text-blue-600 font-mono">{p.rollNo}</p>
                      </td>
                      <td className="p-3 font-semibold">{p.olympiadTier}</td>
                      <td className="p-3 font-black">₹{p.amount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{p.status}</span>
                      </td>
                      <td className="p-3 text-right">
                        {p.tokenGenerated ? <span className="text-emerald-600 font-bold text-xs">Issued</span> : <button onClick={() => p.id && handleApprovePay(p.id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">Approve</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SUPPORT INBOX ================= */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            {ticketsList.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-sm text-slate-900">{t.candidateName} ({t.email})</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'OPEN' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{t.status}</span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl">&quot;{t.message}&quot;</p>
                {t.status === 'OPEN' && (
                  <div className="space-y-2">
                    <textarea rows={2} placeholder="Reply to aspirant..." value={replyDrafts[t.id || ''] || ''} onChange={(e) => setReplyDrafts({ ...replyDrafts, [t.id || '']: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" />
                    <button onClick={() => t.id && handleResolveTicket(t.id)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Send Response</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}