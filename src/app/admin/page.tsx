'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Edit3, Eye, LogOut, KeyRound,
  Layers, ChevronDown, Check, X,
  FolderTree, BookOpen, FileSpreadsheet, Upload, Download, RefreshCw,
  Search, AlertTriangle, Image as ImageIcon, ClipboardCheck,
  RotateCcw, ShieldAlert, Copy, Atom, UploadCloud, FileText, ExternalLink,
  Trophy, Users, Video, Award, CheckCircle2, Calendar, Clock, AlertOctagon
} from 'lucide-react';

import { 
  getTaxonomyNodes, saveTaxonomyNode, deleteTaxonomyNode, 
  getAllQuestions, createQuestion, updateQuestion,
  archiveQuestion, restoreQuestion, permanentlyDeleteQuestion, wipeAllRecycleBin,
  bulkUploadQuestions, autoPushOlympiadQuestions, formatScientific, parseAttachment,
  getAllOlympiads, saveOlympiadTournament, deleteOlympiadTournament,
  getAllOlympiadParticipants, updateParticipantViva,
  TaxonomyNode, TaxonomyLevel, QuestionData, QuestionSegment,
  OlympiadTournament, OlympiadParticipant, Timestamp
} from '@/lib/db';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';

const PRESETS: Record<TaxonomyLevel, { en: string; hi: string }[]> = {
  CLASS: [
    { en: 'Civil Services / Competitive', hi: 'प्रतियोगी परीक्षा / सिविल सेवा' },
    { en: 'Class 11th - 12th (Senior Secondary)', hi: 'कक्षा 11-12' },
    { en: 'Engineering & Technology (JEE / B.Tech)', hi: 'इंजीनियरिंग प्रवेश परीक्षा' },
    { en: 'Medical & Dental (NEET / MBBS)', hi: 'मेडिकल प्रवेश परीक्षा' },
    { en: 'Graduate Aptitude (SSC / Banking / CGL)', hi: 'स्नातक प्रतियोगी परीक्षा' }
  ],
  EXAM: [
    { en: 'UPSC Civil Services (Prelims)', hi: 'संघ लोक सेवा आयोग सिविल सेवा' },
    { en: 'IIT JEE (Advanced / Mains)', hi: 'आईआईटी जेईई' },
    { en: 'NEET UG (Medical Entrance)', hi: 'नीट यूजी' },
    { en: 'SSC CGL & Banking Mains', hi: 'एसएससी सीजीएल एवं बैंकिंग' }
  ],
  SUBJECT: [
    { en: 'General Studies / Geography', hi: 'सामान्य अध्ययन / भूगोल' },
    { en: 'General Studies / Polity', hi: 'सामान्य अध्ययन / राजव्यवस्था' },
    { en: 'Organic Chemistry', hi: 'कार्बनिक रसायन' },
    { en: 'Physics & Mechanics', hi: 'भौतिकी' },
    { en: 'Quantitative Aptitude & CSAT', hi: 'गणित एवं तार्किक योग्यता' }
  ],
  TOPIC: [
    { en: 'Global Mineral Resources & EV Transition', hi: 'खनिज संसाधन एवं ईवी' },
    { en: 'Preamble & Fundamental Rights', hi: 'प्रस्तावना एवं मौलिक अधिकार' },
    { en: 'Chemical Bonding & Polycyclic Compounds', hi: 'रासायनिक आबंधन' }
  ],
  DOMAIN: []
};

const DEFAULT_RULES = [
  "Strict Per-Question Timer (e.g. 50s limit with No Backtracking) to prevent AI-relay exploits.",
  "Full-Screen Browser Lock: Tab-switching or minimizing prompts a penalty; 2 warnings leads to immediate auto-submission.",
  "Front Camera & Microphone verification authorization required prior to entering the arena.",
  "Mandatory 1-on-1 Recorded Video Viva within 24 hours for top rankers (must answer 3 out of 5 questions correctly).",
  "Minimum written test cutoff of 75% marks required to be eligible for academic grants.",
  "Disqualification of any candidate immediately cascades the fellowship to the next eligible merit ranker.",
  "Zero-Tolerance Blacklist: Cheating or proxy use permanently blacklists Name, Phone, UPI ID, and Government KYC verification across Abhyaas."
];

export default function AbhyaasMasterTower() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [adminTab, setAdminTab] = useState<'questions' | 'olympiad' | 'hierarchy' | 'recycle_bin'>('olympiad');
  const [taxonomyList, setTaxonomyList] = useState<TaxonomyNode[]>([]);
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);
  const [olympiadsList, setOlympiadsList] = useState<OlympiadTournament[]>([]);
  const [participantsList, setParticipantsList] = useState<OlympiadParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  // Olympiad Creation Modal State (With manual fee, datetime picker, rules, description, syllabus)
  const [isOlympiadModalOpen, setIsOlympiadModalOpen] = useState(false);
  const [newOlyTitle, setNewOlyTitle] = useState('');
  const [newOlyDesc, setNewOlyDesc] = useState('');
  const [newOlyFee, setNewOlyFee] = useState<number>(49);
  const [newOlyGrantPool, setNewOlyGrantPool] = useState('₹15,000');
  const [newOlySlots, setNewOlySlots] = useState<number>(500);
  const [newOlyDuration, setNewOlyDuration] = useState<number>(45);
  const [newOlyQuestions, setNewOlyQuestions] = useState<number>(50);
  const [newOlySection, setNewOlySection] = useState<'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'GRAND' | 'SPECIAL'>('WEEKLY');
  const [newOlyStream, setNewOlyStream] = useState<'UPSC_PSC' | 'ENGINEERING' | 'MEDICAL' | 'SSC_BANKING' | 'LAW' | 'FOUNDATION' | 'GENERAL'>('UPSC_PSC');
  const [newOlyDateTime, setNewOlyDateTime] = useState('2026-09-13T10:00');
  const [newOlyRules, setNewOlyRules] = useState<string[]>(DEFAULT_RULES);
  const [newRuleInput, setNewRuleInput] = useState('');
  
  // Syllabus builder state
  const [newOlySyllabus, setNewOlySyllabus] = useState<{ subject: string; questions: number; topics: string }[]>([
    { subject: 'Indian Polity & Constitution', questions: 20, topics: 'Preamble, Fundamental Rights, Parliament' },
    { subject: 'Modern Indian History', questions: 15, topics: '1857 to 1947, Freedom Struggle' },
    { subject: 'Indian Economy', questions: 15, topics: 'Macroeconomics, Fiscal Policy, Banking' }
  ]);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjQs, setNewSubjQs] = useState(10);
  const [newSubjTopics, setNewSubjTopics] = useState('');

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
  const [bulkMode, setBulkMode] = useState<'paste' | 'csv'>('paste');
  const [pasteData, setPasteData] = useState('');

  // Question Form State
  const [qClass, setQClass] = useState('');
  const [qExam, setQExam] = useState('');
  const [qSubject, setQSubject] = useState('');
  const [qTopic, setQTopic] = useState('');
  const [qSegment, setQSegment] = useState<QuestionSegment>('OLYMPIAD');
  const [qStatementEn, setQStatementEn] = useState('');
  const [qStatementHi, setQStatementHi] = useState('');
  const [qOptionsEn, setQOptionsEn] = useState(['', '', '', '']);
  const [qOptionsHi, setQOptionsHi] = useState(['', '', '', '']);
  const [qCorrectOpt, setQCorrectOpt] = useState(0);
  const [qExplanationEn, setQExplanationEn] = useState('');
  const [qDiagramUrl, setQDiagramUrl] = useState('');

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

  // Add syllabus item to the list
  const handleAddSyllabusItem = () => {
    if (!newSubjName.trim()) return alert("Enter Subject Name");
    setNewOlySyllabus(prev => [
      ...prev,
      { subject: newSubjName.trim(), questions: Number(newSubjQs) || 10, topics: newSubjTopics.trim() }
    ]);
    setNewSubjName('');
    setNewSubjTopics('');
  };

  // Add custom rule
  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setNewOlyRules(prev => [...prev, newRuleInput.trim()]);
    setNewRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    setNewOlyRules(prev => prev.filter((_, i) => i !== index));
  };

  // Save new Olympiad
  const handleCreateOlympiadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOlyTitle.trim()) return alert("Enter Tournament Title");
    if (!newOlyDateTime) return alert("Select start date and time");

    const newOly: OlympiadTournament = {
      id: `oly-${Date.now()}`,
      title: newOlyTitle.trim(),
      descriptionEn: newOlyDesc.trim() || 'All-India National Scholarship Olympiad assessment arena.',
      fee: Number(newOlyFee) >= 0 ? Number(newOlyFee) : 49,
      totalGrantPool: newOlyGrantPool.trim() || '₹15,000',
      totalSlots: Number(newOlySlots) || 500,
      bookedSlots: 0,
      durationMinutes: Number(newOlyDuration) || 45,
      questionsCount: Number(newOlyQuestions) || 50,
      categorySection: newOlySection,
      streamType: newOlyStream,
      targetClass: 'Civil Services & Competitive',
      targetExam: newOlyStream.replace('_', ' '),
      targetSubject: 'Multi-Subject Assessment',
      startDateTime: newOlyDateTime,
      scheduleText: new Date(newOlyDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      rules: newOlyRules,
      syllabus: newOlySyllabus,
      status: 'UPCOMING',
      createdAt: Timestamp.now()
    };

    try {
      await saveOlympiadTournament(newOly);
      setOlympiadsList(prev => [newOly, ...prev]);
      setIsOlympiadModalOpen(false);
      setNewOlyTitle('');
      setNewOlyDesc('');
      alert("🎉 Olympiad Tournament Created! It is now live on the /olympiad page.");
    } catch (err: any) {
      alert("Error creating tournament: " + err.message);
    }
  };

  // Viva status action
  const handleVivaAction = async (participantId: string, action: 'PASSED' | 'FAILED', candidateName: string) => {
    const grantWon = action === 'PASSED' ? 5000 : 0;
    const confirmMsg = action === 'PASSED' 
      ? `Approve Viva for ${candidateName} and allocate ₹${grantWon} Grant?` 
      : `Disqualify ${candidateName} and cascade grant to next rank?`;

    if (!confirm(confirmMsg)) return;

    try {
      await updateParticipantViva(participantId, action, grantWon);
      setParticipantsList(prev => prev.map(p => p.id === participantId ? { ...p, vivaStatus: action, grantAmountWon: grantWon } : p));
      alert(`Candidate Viva marked as ${action}!`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-mono">Loading Abhyaas OS...</div>;
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
            <p className="text-xs text-slate-400">Master Operations Control</p>
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

      {/* Global Blacklist & Anti-Cheating Warning Banner */}
      <div className="bg-rose-600 text-white px-4 py-2.5 shadow-md flex items-center justify-center gap-2 text-xs font-black">
        <AlertOctagon className="w-4 h-4 shrink-0 animate-pulse" />
        <span>ZERO-TOLERANCE SECURITY NOTICE: Screen switching (2 warnings limit) or proxy relay triggers permanent blacklisting of candidate Name, Mobile, UPI ID, and Government KYC Verification.</span>
      </div>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">

        {/* 4-Tab Navigation */}
        <div className="bg-white p-2 border border-slate-200 rounded-3xl shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setAdminTab('olympiad')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
              adminTab === 'olympiad' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" /> 1. Olympiad Tournaments &amp; Viva Queue ({olympiadsList.length})
          </button>

          <button
            onClick={() => setAdminTab('questions')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
              adminTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 2. Question Bank ({questionsList.filter(q => !q.isArchived).length})
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
            <Trash2 className="w-4 h-4" /> 4. Recycle Bin ({questionsList.filter(q => q.isArchived).length})
          </button>
        </div>

        {/* TAB 1: OLYMPIAD MANAGER & VIVA */}
        {adminTab === 'olympiad' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-wider">
                    High Stakes Arena Manager
                  </span>
                  <span className="text-xs font-bold text-slate-500">{olympiadsList.length} Tournaments Live in DB</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">Olympiad Arena Studio &amp; Viva Verification</h2>
                <p className="text-xs text-slate-500">Configure manual fees, exact calendar/clock timestamps up to 2099, custom syllabi, and editable anti-cheat rules.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsOlympiadModalOpen(true)}
                  className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" /> Create Custom Tournament
                </button>
              </div>
            </div>

            {/* Tournaments Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">All Active &amp; Upcoming Olympiads ({olympiadsList.length})</h3>
              
              {olympiadsList.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                  <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">No Olympiads Created Yet</p>
                  <p className="text-xs text-slate-400">Click &quot;Create Custom Tournament&quot; above to publish your first Olympiad.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {olympiadsList.map(oly => {
                    const fillPercent = Math.round(((oly.bookedSlots || 0) / (oly.totalSlots || 500)) * 100);
                    const isThresholdMet = fillPercent >= 50;

                    return (
                      <div key={oly.id} className="bg-white border border-slate-200 hover:border-amber-400 p-5 rounded-3xl shadow-xs space-y-4 transition">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                                Fee: ₹{oly.fee}
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                                {oly.categorySection}
                              </span>
                            </div>
                            <h4 className="font-black text-sm text-slate-900 mt-1.5">{oly.title}</h4>
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-blue-600" />
                              {oly.startDateTime ? new Date(oly.startDateTime).toLocaleString('en-IN') : oly.scheduleText}
                            </p>
                          </div>
                          <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                        </div>

                        {/* 50% Threshold Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-black">
                            <span className="text-slate-600">{oly.bookedSlots || 0} / {oly.totalSlots || 500} Slots</span>
                            <span className={isThresholdMet ? 'text-emerald-600' : 'text-amber-600'}>{fillPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isThresholdMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(fillPercent, 100)}%` }}
                            />
                          </div>
                          <p className={`text-[10px] font-black uppercase ${isThresholdMet ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {isThresholdMet ? '✓ 50% Threshold Met' : '⏳ Awaiting 50% Cohort'}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-600">Pool: <strong className="text-blue-600">{oly.totalGrantPool}</strong></span>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete Olympiad "${oly.title}"?`)) {
                                await deleteOlympiadTournament(oly.id);
                                setOlympiadsList(prev => prev.filter(item => item.id !== oly.id));
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Candidates & Viva Queue */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-600" />
                Live Candidate Verification &amp; Viva Queue ({participantsList.length})
              </h3>
              {participantsList.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold p-6 text-center">No participants in viva verification queue yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3">Roll Number</th>
                        <th className="py-3 px-3">Candidate</th>
                        <th className="py-3 px-3">Score</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {participantsList.map(p => (
                        <tr key={p.id}>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.rollNo}</td>
                          <td className="py-3 px-3">{p.candidateName}</td>
                          <td className="py-3 px-3 font-black text-blue-600">{p.writtenScore}%</td>
                          <td className="py-3 px-3 font-bold">{p.vivaStatus}</td>
                          <td className="py-3 px-3 text-right">
                            <button onClick={() => handleVivaAction(p.id, 'PASSED', p.candidateName)} className="px-2 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded mr-2">Pass</button>
                            <button onClick={() => handleVivaAction(p.id, 'FAILED', p.candidateName)} className="px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded">Fail</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: CREATE CUSTOM OLYMPIAD WITH REAL CALENDAR, MANUAL FEE, SYLLABUS, RULES */}
      {isOlympiadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Custom Tournament Engine
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Create Standardized Olympiad</h3>
              </div>
              <button onClick={() => setIsOlympiadModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOlympiadSubmit} className="space-y-4 text-xs font-medium">
              
              {/* Title & Section */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tournament Title*</label>
                  <input
                    type="text"
                    placeholder="e.g. All-India Sunday Prelims Arena"
                    value={newOlyTitle}
                    onChange={e => setNewOlyTitle(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section / Frequency Category*</label>
                  <select
                    value={newOlySection}
                    onChange={e => setNewOlySection(e.target.value as any)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                  >
                    <option value="WEEKLY">Weekly Sprint (Sundays)</option>
                    <option value="MONTHLY">Monthly Mega Assessment</option>
                    <option value="QUARTERLY">Quarterly Talent Search (3-Month)</option>
                    <option value="GRAND">Super Grand Cup (15 Aug / 26 Jan)</option>
                    <option value="SPECIAL">Special Subject Invitational</option>
                  </select>
                </div>
              </div>

              {/* Stream / Exam Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Examination Stream*</label>
                <select
                  value={newOlyStream}
                  onChange={e => setNewOlyStream(e.target.value as any)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                >
                  <option value="UPSC_PSC">Civil Services (UPSC CSE &amp; State PSC)</option>
                  <option value="ENGINEERING">Engineering &amp; Technology (IIT-JEE / B.Tech)</option>
                  <option value="MEDICAL">Medical &amp; Life Sciences (NEET / MBBS)</option>
                  <option value="SSC_BANKING">Government Exams (SSC CGL &amp; Banking)</option>
                  <option value="LAW">Legal Studies (CLAT &amp; Judicial Services)</option>
                  <option value="FOUNDATION">Senior Secondary (Class 11th - 12th Foundation)</option>
                  <option value="GENERAL">General All-India Knowledge</option>
                </select>
              </div>

              {/* Manual Entry Fee & Gross Grant Pool */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manual Fee (₹)*</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="49"
                    value={newOlyFee}
                    onChange={e => setNewOlyFee(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grant Pool*</label>
                  <input
                    type="text"
                    placeholder="₹15,000"
                    value={newOlyGrantPool}
                    onChange={e => setNewOlyGrantPool(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slots Capacity*</label>
                  <input
                    type="number"
                    min="10"
                    value={newOlySlots}
                    onChange={e => setNewOlySlots(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Mins)*</label>
                  <input
                    type="number"
                    value={newOlyDuration}
                    onChange={e => setNewOlyDuration(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
              </div>

              {/* Real Calendar & Clock Timestamp Picker (Up to 2099) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Scheduled Date &amp; Start Time (Calendar &amp; Clock 2026–2099)*
                </label>
                <input
                  type="datetime-local"
                  min="2026-01-01T00:00"
                  max="2099-12-31T23:59"
                  value={newOlyDateTime}
                  onChange={e => setNewOlyDateTime(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none text-slate-800"
                  required
                />
              </div>

              {/* Description Box */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tournament Detailed Overview / Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe this Olympiad, target audience, and key highlights..."
                  value={newOlyDesc}
                  onChange={e => setNewOlyDesc(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              {/* Syllabus Builder */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block font-black text-xs uppercase text-slate-700">Detailed Syllabus Topics</label>
                <div className="space-y-2">
                  {newOlySyllabus.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <strong className="text-slate-900">{s.subject}</strong>: <span className="text-blue-600 font-bold">{s.questions} Questions</span>
                        {s.topics && <p className="text-[10px] text-slate-400">{s.topics}</p>}
                      </div>
                      <button type="button" onClick={() => setNewOlySyllabus(prev => prev.filter((_, i) => i !== idx))} className="text-rose-500 font-bold">×</button>
                    </div>
                  ))}
                </div>
                <div className="grid sm:grid-cols-3 gap-2 pt-2">
                  <input type="text" placeholder="Subject Name" value={newSubjName} onChange={e => setNewSubjName(e.target.value)} className="h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs" />
                  <input type="number" placeholder="Qs Count" value={newSubjQs} onChange={e => setNewSubjQs(Number(e.target.value))} className="h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs" />
                  <input type="text" placeholder="Key Topics" value={newSubjTopics} onChange={e => setNewSubjTopics(e.target.value)} className="h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs" />
                </div>
                <button type="button" onClick={handleAddSyllabusItem} className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-[11px]">+ Add Subject Module</button>
              </div>

              {/* Editable Security Rules */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <label className="block font-black text-xs uppercase text-amber-900">Custom Editable Anti-Cheat &amp; Assessment Rules</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {newOlyRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 bg-white p-2 rounded-lg border border-amber-200 text-[11px] text-slate-700">
                      <span>• {rule}</span>
                      <button type="button" onClick={() => handleRemoveRule(idx)} className="text-rose-500 font-bold ml-2">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add custom rule (e.g. Webcam snapshot enabled)..."
                    value={newRuleInput}
                    onChange={e => setNewRuleInput(e.target.value)}
                    className="flex-1 h-9 px-2.5 bg-white border border-amber-300 rounded-lg text-xs"
                  />
                  <button type="button" onClick={handleAddRule} className="px-3 bg-amber-600 text-white font-bold rounded-lg text-xs">+ Rule</button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
              >
                <Trophy className="w-4 h-4" /> Save &amp; Publish Olympiad Live
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}