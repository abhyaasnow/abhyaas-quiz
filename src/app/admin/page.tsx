'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Image as ImageIcon,
  CreditCard,
  MessageSquare,
  Plus,
  Trash2,
  FileSpreadsheet,
  Upload,
  Sparkles,
  ShieldCheck,
  Search,
  Eye,
  Download,
  CheckCircle,
  CheckCircle2,
  Clock,
  Layers,
  Save,
  Mail,
  Send,
  UserCheck,
  AlertCircle,
  FileText
} from 'lucide-react';

interface QuestionItem {
  id: string;
  subject: string;
  topic: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOption: number;
}

interface PaymentRecord {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  rollNo: string;
  olympiadTier: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  tokenGenerated: boolean;
}

interface SupportTicket {
  id: string;
  candidateName: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'OPEN' | 'RESOLVED';
  replyText?: string;
}

const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: 'q-101',
    subject: 'polity',
    topic: 'Constitutional Framework & Preamble',
    questionEn: 'Which Article of the Constitution guarantees the Right to Constitutional Remedies?',
    questionHi: 'संविधान का कौन सा अनुच्छेद संवैधानिक उपचारों के अधिकार की गारंटी देता है?',
    optionsEn: ['Article 14', 'Article 19', 'Article 21', 'Article 32'],
    optionsHi: ['अनुच्छेद 14', 'अनुच्छेद 19', 'अनुच्छेद 21', 'अनुच्छेद 32'],
    correctOption: 3,
  },
  {
    id: 'q-102',
    subject: 'history',
    topic: 'Modern Freedom Struggle',
    questionEn: 'In which year did the historic Champaran Satyagraha take place?',
    questionHi: 'ऐतिहासिक चंपारण सत्याग्रह किस वर्ष में हुआ था?',
    optionsEn: ['1915', '1917', '1919', '1922'],
    optionsHi: ['1915', '1917', '1919', '1922'],
    correctOption: 1,
  }
];

const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_98234710',
    candidateName: 'Rahul Sharma',
    email: 'rahul.ias2026@gmail.com',
    phone: '+91 98765 43210',
    rollNo: 'ABH-2026-0891',
    olympiadTier: 'Weekly Speed Sprint',
    amount: 49,
    date: 'Today, 02:45 PM',
    paymentMethod: 'UPI (GPay)',
    status: 'SUCCESS',
    tokenGenerated: true,
  },
  {
    id: 'pay_98234711',
    candidateName: 'Priya Verma',
    email: 'priya.upsc@gmail.com',
    phone: '+91 98111 22334',
    rollNo: 'ABH-2026-0892',
    olympiadTier: 'Monthly Mega Assessment',
    amount: 199,
    date: 'Today, 01:15 PM',
    paymentMethod: 'UPI (PhonePe)',
    status: 'SUCCESS',
    tokenGenerated: true,
  },
  {
    id: 'pay_98234712',
    candidateName: 'Amit Patel',
    email: 'amit.patel@gmail.com',
    phone: '+91 97234 56789',
    rollNo: 'ABH-2026-0893',
    olympiadTier: 'Weekly Speed Sprint',
    amount: 49,
    date: 'Yesterday',
    paymentMethod: 'Net Banking',
    status: 'PENDING',
    tokenGenerated: false,
  }
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-401',
    candidateName: 'Aakash Dwivedi',
    email: 'aakash.d@gmail.com',
    subject: 'Olympiad Slot Timing Confirmation',
    message: 'Sir, Maine Sunday 11 AM sprint ke liye ₹49 pay kar diya hai. Slot admit card token kab email par aayega?',
    date: 'Today, 11:30 AM',
    status: 'OPEN'
  },
  {
    id: 'tkt-402',
    candidateName: 'Sunita Meena',
    email: 'sunita.m@gmail.com',
    subject: 'Bilingual Hindi Font Query in CSAT',
    message: 'Hindi medium ke questions standard font mein clear rahenge ya font size increase kar sakte hain test ke dauran?',
    date: 'Yesterday',
    status: 'RESOLVED',
    replyText: 'Namaste Sunita ji, Test interface mein font auto-scalable aur crystal-clear bilingual rendering ke saath optimize hai.'
  }
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'questions' | 'media' | 'payments' | 'support'>('questions');

  // ================= 1. QUESTION STUDIO STATE =================
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>(INITIAL_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // New Question Form Fields
  const [selectedSubject, setSelectedSubject] = useState('polity');
  const [topicName, setTopicName] = useState('');
  const [questionEn, setQuestionEn] = useState('');
  const [questionHi, setQuestionHi] = useState('');
  const [optEn, setOptEn] = useState(['', '', '', '']);
  const [optHi, setOptHi] = useState(['', '', '', '']);
  const [correctOpt, setCorrectOpt] = useState<number>(0);

  // ================= 2. MEDIA & BANNER STATE =================
  const [bannerTitleHi, setBannerTitleHi] = useState('राष्ट्रीय राज्यव्यवस्था ओलंपियाड : संवैधानिक ढांचा');
  const [bannerTitleEn, setBannerTitleEn] = useState('National Polity Olympiad : Constitutional Framework & Preamble');
  const [bannerScholarship, setBannerScholarship] = useState('₹50,000');
  const [bannerFee, setBannerFee] = useState('₹49');
  const [bannerSavedSuccess, setBannerSavedSuccess] = useState(false);
  const [uploadedBannerPreview, setUploadedBannerPreview] = useState<string | null>(null);

  // ================= 3. PAYMENTS STATE =================
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [paymentSearch, setPaymentSearch] = useState('');

  // ================= 4. SUPPORT CRM STATE =================
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  // Question Form Submission
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionEn.trim() || !questionHi.trim()) {
      alert('Kripya English aur Hindi dono statements bharein.');
      return;
    }

    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      subject: selectedSubject,
      topic: topicName || 'General Topic',
      questionEn,
      questionHi,
      optionsEn: [...optEn],
      optionsHi: [...optHi],
      correctOption: correctOpt,
    };

    setQuestionsList([newQ, ...questionsList]);
    setShowAddForm(false);
    
    // Reset
    setTopicName('');
    setQuestionEn('');
    setQuestionHi('');
    setOptEn(['', '', '', '']);
    setOptHi(['', '', '', '']);
    setCorrectOpt(0);
    alert('Question successfully add ho gaya!');
  };

  // CSV Import
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      const parsedQuestions: QuestionItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 11) {
          parsedQuestions.push({
            id: `q-csv-${Date.now()}-${i}`,
            subject: cols[0] || 'polity',
            topic: cols[1] || 'General Chapter',
            questionEn: cols[2],
            questionHi: cols[3],
            optionsEn: [cols[4], cols[5], cols[6], cols[7]],
            optionsHi: [cols[8], cols[9], cols[10], cols[11]],
            correctOption: parseInt(cols[12] || '0', 10) || 0
          });
        }
      }

      if (parsedQuestions.length > 0) {
        setQuestionsList([...parsedQuestions, ...questionsList]);
        setShowCsvModal(false);
        alert(`Badhai! ${parsedQuestions.length} Questions successfully upload ho gaye.`);
      } else {
        alert('CSV format match nahi hua. Kripya Sample Template download karke check karein.');
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Subject,Topic,Question_EN,Question_HI,OptA_EN,OptB_EN,OptC_EN,OptD_EN,OptA_HI,OptB_HI,OptC_HI,OptD_HI,CorrectOptionIndex(0-3)\n' +
      'polity,Preamble,What is the Preamble?,प्रस्तावना क्या है?,Introduction,Law,Article,None,परिचय,कानून,अनुच्छेद,कोई नहीं,0\n' +
      'history,1857 Revolt,Where did revolt start?,1857 विद्रोह कहाँ शुरू हुआ?,Meerut,Delhi,Kanpur,Jhansi,मेरठ,दिल्ली,कानपुर,झांसी,0';
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'abhyaas_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedBannerPreview(imageUrl);
    }
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSavedSuccess(true);
    setTimeout(() => setBannerSavedSuccess(false), 3000);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Kya aap is question ko delete karna chahte hain?')) {
      setQuestionsList(questionsList.filter(q => q.id !== id));
    }
  };

  // Payment Approval Toggle
  const handleApprovePayment = (id: string) => {
    setPaymentsList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'SUCCESS', tokenGenerated: true };
      }
      return p;
    }));
    alert('Candidate registration verify aur Admit Slot Token release ho gaya!');
  };

  // Ticket Response
  const handleSendTicketReply = (ticketId: string) => {
    const text = replyDrafts[ticketId];
    if (!text || !text.trim()) {
      alert('Kripya reply message likhein.');
      return;
    }

    setTicketsList(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'RESOLVED', replyText: text };
      }
      return t;
    }));

    setReplyDrafts(prev => ({ ...prev, [ticketId]: '' }));
    alert('Aspirant ko reply email bhej diya gaya aur ticket Resolved mark ho gaya!');
  };

  const filteredQuestions = questionsList.filter(q => 
    q.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.questionHi.includes(searchQuery) ||
    q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayments = paymentsList.filter(p =>
    p.candidateName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.rollNo.toLowerCase().includes(paymentSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(paymentSearch.toLowerCase())
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
                <ShieldCheck className="w-3 h-3" /> Visual Admin Panel (No Coding Mode)
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Website</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Question Bank Studio ({questionsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'media'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media &amp; Banner Manager</span>
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
            <span>Support &amp; Student Inbox ({ticketsList.filter(t => t.status === 'OPEN').length} Open)</span>
          </button>
        </div>

        {/* ================= TAB 1: QUESTION BANK STUDIO ================= */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions by text or chapter topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCsvModal(true)}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Bulk Excel / CSV</span>
                </button>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddForm ? 'Close Form' : 'Add New Question'}</span>
                </button>
              </div>
            </div>

            {/* CSV Import Modal */}
            {showCsvModal && (
              <div className="bg-emerald-950 text-white border border-emerald-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-sm sm:text-base">Upload Bulk Questions Sheet (.CSV)</h3>
                  </div>
                  <button
                    onClick={() => setShowCsvModal(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕ Close
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Aap ek hi click mein 50 ya 100 questions upload kar sakte hain. Pehle hamara template download karein aur usme questions fill karke upload karein.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={downloadSampleCsv}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Sample Template</span>
                  </button>

                  <input
                    type="file"
                    accept=".csv"
                    ref={csvInputRef}
                    onChange={handleCsvUpload}
                    className="hidden"
                  />

                  <button
                    onClick={() => csvInputRef.current?.click()}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select &amp; Upload CSV File</span>
                  </button>
                </div>
              </div>
            )}

            {/* Single Question Entry Form */}
            {showAddForm && (
              <form onSubmit={handleCreateQuestion} className="bg-white border-2 border-blue-600 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    New Question Studio
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">Bilingual (Hindi + English)</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    >
                      <option value="polity">Indian Polity &amp; Constitution</option>
                      <option value="history">Modern Indian History</option>
                      <option value="economy">Indian Economy &amp; Banking</option>
                      <option value="geography">Geography &amp; Environment</option>
                      <option value="csat">CSAT &amp; Logical Reasoning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Chapter Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Fundamental Rights, RBI Monetary Policy"
                      value={topicName}
                      onChange={(e) => setTopicName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Question in English</label>
                    <textarea
                      rows={3}
                      placeholder="Type the question statement in English..."
                      value={questionEn}
                      onChange={(e) => setQuestionEn(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Question in Hindi (प्रश्न हिन्दी में)</label>
                    <textarea
                      rows={3}
                      placeholder="यहाँ प्रश्न हिन्दी में लिखें..."
                      value={questionHi}
                      onChange={(e) => setQuestionHi(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Options &amp; Correct Answer Selection
                  </label>
                  
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl grid sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-1 flex items-center justify-center">
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={correctOpt === idx}
                          onChange={() => setCorrectOpt(idx)}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                      </div>
                      <div className="sm:col-span-1 text-xs font-black text-slate-500">
                        Option {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + idx)} in English`}
                          value={optEn[idx]}
                          onChange={(e) => {
                            const copy = [...optEn];
                            copy[idx] = e.target.value;
                            setOptEn(copy);
                          }}
                          className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs"
                          required
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          placeholder={`विकल्प ${String.fromCharCode(65 + idx)} हिन्दी में`}
                          value={optHi[idx]}
                          onChange={(e) => {
                            const copy = [...optHi];
                            copy[idx] = e.target.value;
                            setOptHi(copy);
                          }}
                          className="w-full p-2 rounded-xl bg-white border border-slate-200 text-xs"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    Publish Question to Live Bank
                  </button>
                </div>
              </form>
            )}

            {/* Questions Table List */}
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2.5 py-0.5 bg-slate-900 text-white rounded-md uppercase">
                        {q.subject}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {q.topic}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="font-bold text-xs sm:text-sm text-slate-900">
                      #{idx + 1}. {q.questionEn}
                    </p>
                    <p className="text-xs text-slate-500">
                      {q.questionHi}
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-2 pt-1">
                    {q.optionsEn.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2 rounded-xl text-[11px] border ${
                          oIdx === q.correctOption
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="font-black mr-1">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB 2: MEDIA & BANNER CONTROLLER ================= */}
        {activeTab === 'media' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Banner Form */}
            <form onSubmit={handleSaveBanner} className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h3 className="font-black text-base text-slate-900">Homepage Live Banner Settings</h3>
                </div>
                {bannerSavedSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Live Changes Saved!
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Custom Banner Graphic (PNG / JPEG / SVG)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Click to upload new banner/logo image</p>
                  <p className="text-[11px] text-slate-400">Supports JPG, PNG, WebP up to 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Olympiad Hindi Headline</label>
                  <input
                    type="text"
                    value={bannerTitleHi}
                    onChange={(e) => setBannerTitleHi(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Olympiad English Title</label>
                  <input
                    type="text"
                    value={bannerTitleEn}
                    onChange={(e) => setBannerTitleEn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Scholarship Pool Amount</label>
                    <input
                      type="text"
                      value={bannerScholarship}
                      onChange={(e) => setBannerScholarship(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Fee (₹)</label>
                    <input
                      type="text"
                      value={bannerFee}
                      onChange={(e) => setBannerFee(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Live Homepage Banner</span>
                </button>
              </div>
            </form>

            {/* Right: Live Preview Card */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">
                  LIVE HOMEPAGE PREVIEW
                </span>
                <Clock className="w-4 h-4 text-slate-500" />
              </div>

              {uploadedBannerPreview && (
                <div className="rounded-2xl overflow-hidden border border-slate-700">
                  <img src={uploadedBannerPreview} alt="Uploaded Graphic" className="w-full h-32 object-cover" />
                </div>
              )}

              <div className="space-y-2">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30">
                  Scholarship: {bannerScholarship}
                </span>
                <h4 className="text-base font-black text-amber-400 leading-tight pt-1">
                  {bannerTitleHi}
                </h4>
                <p className="text-xs font-bold text-slate-300">
                  {bannerTitleEn}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Fee: {bannerFee}</span>
                <span className="px-3 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-[11px]">
                  REGISTER • {bannerFee}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: PAYMENTS & REGISTRATIONS ================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            
            {/* Payment Summary Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Registrations</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{paymentsList.length} Candidates</h3>
                <span className="text-[10px] text-emerald-600 font-bold">100% Verified Slots</span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Fees Collected (Pool)</p>
                <h3 className="text-2xl font-black text-blue-600 mt-1">
                  ₹{paymentsList.filter(p => p.status === 'SUCCESS').reduce((acc, curr) => acc + curr.amount, 0)}
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">Auto-synced with Razorpay</span>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Admit Tokens Issued</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {paymentsList.filter(p => p.tokenGenerated).length} / {paymentsList.length}
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">Ready for Proctored Test</span>
              </div>
            </div>

            {/* Search Filter Bar */}
            <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by candidate name, Roll No or Payment ID..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <span className="text-xs font-bold text-slate-500">
                Showing {filteredPayments.length} records
              </span>
            </div>

            {/* Payments Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Candidate &amp; Roll No</th>
                      <th className="p-4">Olympiad Tier</th>
                      <th className="p-4">Fee Paid</th>
                      <th className="p-4">Method &amp; Time</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Admit Card Token</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{p.candidateName}</p>
                          <p className="text-[11px] text-blue-600 font-mono font-bold">{p.rollNo}</p>
                          <p className="text-[10px] text-slate-400">{p.email} • {p.phone}</p>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          {p.olympiadTier}
                        </td>
                        <td className="p-4 font-black text-slate-900">
                          ₹{p.amount}
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-800">{p.paymentMethod}</p>
                          <p className="text-[10px] text-slate-400">{p.date}</p>
                        </td>
                        <td className="p-4">
                          {p.status === 'SUCCESS' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Paid &amp; Active
                            </span>
                          )}
                          {p.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                              <AlertCircle className="w-3 h-3" /> Verifying
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {p.tokenGenerated ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                              <UserCheck className="w-3.5 h-3.5" /> Token Issued
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApprovePayment(p.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] transition shadow-sm cursor-pointer"
                            >
                              Approve &amp; Release
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 4: SUPPORT & STUDENT INBOX ================= */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
              <div>
                <h3 className="font-black text-base text-slate-900">Aspirant Support &amp; Query Desk</h3>
                <p className="text-xs text-slate-500">Incoming inquiries from /contact form with one-click response tool</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
                {ticketsList.filter(t => t.status === 'OPEN').length} Pending Responses
              </span>
            </div>

            {/* Tickets Stream */}
            <div className="space-y-4">
              {ticketsList.map((t) => (
                <div
                  key={t.id}
                  className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 transition-all ${
                    t.status === 'OPEN' ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                        {t.candidateName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{t.candidateName}</h4>
                        <p className="text-[11px] text-slate-400">{t.email} • {t.date}</p>
                      </div>
                    </div>

                    <div>
                      {t.status === 'OPEN' ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-black uppercase">
                          Action Required
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question / Inquiry Text */}
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Subject: {t.subject}
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
                      &quot;{t.message}&quot;
                    </p>
                  </div>

                  {/* Previous Reply Display if Resolved */}
                  {t.replyText && (
                    <div className="bg-emerald-50/60 border border-emerald-200 p-3.5 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Sent Official Response:
                      </span>
                      <p className="text-xs text-emerald-950 font-medium">
                        {t.replyText}
                      </p>
                    </div>
                  )}

                  {/* Reply Input Box for Open Tickets */}
                  {t.status === 'OPEN' && (
                    <div className="space-y-2 pt-2">
                      <textarea
                        rows={2}
                        placeholder={`Type your reply to ${t.candidateName} (${t.email})...`}
                        value={replyDrafts[t.id] || ''}
                        onChange={(e) => setReplyDrafts({ ...replyDrafts, [t.id]: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleSendTicketReply(t.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Response to Aspirant</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}