'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, CheckCircle2, ShieldCheck,
  BookOpen, Download, Loader2, User, Mail, Phone,
  ArrowRight, X, Filter, Search, GraduationCap,
  Check, Layers, FolderOpen, Tag, FileText, Compass, Award, Building2
} from 'lucide-react';
import { 
  getAllOlympiads, getTaxonomyNodes, createPaymentRecord, 
  OlympiadTournament, TaxonomyNode 
} from '@/lib/db';

export default function CascadingOlympiadSuite() {
  const [tournaments, setTournaments] = useState<OlympiadTournament[]>([]);
  const [taxonomyNodes, setTaxonomyNodes] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(true);

  // LEVEL 1: Cadence / Frequency
  const [selectedCadence, setSelectedCadence] = useState<string>('ALL');

  // LEVEL 2: Academic Dimension
  const [selectedDimension, setSelectedDimension] = useState<'ALL' | 'EXAM' | 'CLASS' | 'SUBJECT' | 'TOPIC'>('ALL');

  // LEVEL 3: Sub-Category (Purely dynamic from database)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');

  // Live Search Input
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Application States
  const [activeTournament, setActiveTournament] = useState<OlympiadTournament | null>(null);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Form Fields
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [acceptIntegrityCode, setAcceptIntegrityCode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmed Admit Card State (Now strictly bound with tournamentId)
  const [confirmedAdmit, setConfirmedAdmit] = useState<{
    rollNo: string;
    candidateName: string;
    tournamentId: string;
    tournamentTitle: string;
    examSlot: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    async function loadLiveSystemData() {
      try {
        const [liveTournaments, liveTaxonomy] = await Promise.all([
          getAllOlympiads(),
          getTaxonomyNodes()
        ]);

        setTournaments(liveTournaments || []);
        setTaxonomyNodes(liveTaxonomy || []);
      } catch (err) {
        console.error("Error fetching live Olympiad system data:", err);
        setTournaments([]);
        setTaxonomyNodes([]);
      } finally {
        setLoading(false);
      }
    }
    loadLiveSystemData();
  }, []);

  // 1. DYNAMIC CADENCES (Derived strictly from Admin-created evaluations)
  const availableCadences = useMemo(() => {
    const cadencesSet = new Set<string>();

    tournaments.forEach(t => {
      if (t.categorySection) {
        cadencesSet.add(t.categorySection.toUpperCase());
      }
    });

    const list = Array.from(cadencesSet).map(c => {
      let displayLabel = c.replace(/_/g, ' ');
      if (c === 'WEEKLY') displayLabel = 'Weekly Assessment Series';
      else if (c === 'MONTHLY') displayLabel = 'Monthly Scholarship Examination';
      else if (c === 'QUARTERLY') displayLabel = 'Quarterly Talent Evaluation';
      else if (c === 'HALF_YEARLY') displayLabel = 'Half-Yearly Examination';
      else if (c === 'YEARLY') displayLabel = 'Annual Academic Fellowship';
      else if (c === 'GRAND') displayLabel = 'National Merit Convocation';
      
      return { id: c, label: displayLabel };
    });

    return [{ id: 'ALL', label: 'All Scheduled Evaluations' }, ...list];
  }, [tournaments]);

  // 2. DYNAMIC SUB-CATEGORIES
  const subCategoryOptions = useMemo(() => {
    if (selectedDimension === 'ALL') return [];

    const itemsSet = new Set<string>();

    taxonomyNodes.forEach(node => {
      if (selectedDimension === 'EXAM' && node.level === 'EXAM') itemsSet.add(node.nameEn);
      if (selectedDimension === 'CLASS' && (node.level === 'CLASS' || node.level === 'DOMAIN')) itemsSet.add(node.nameEn);
      if (selectedDimension === 'SUBJECT' && node.level === 'SUBJECT') itemsSet.add(node.nameEn);
      if (selectedDimension === 'TOPIC' && node.level === 'TOPIC') itemsSet.add(node.nameEn);
    });

    tournaments.forEach(t => {
      if (selectedDimension === 'EXAM' && t.targetExam) itemsSet.add(t.targetExam);
      if (selectedDimension === 'CLASS' && t.targetClass) itemsSet.add(t.targetClass);
      if (selectedDimension === 'SUBJECT' && t.targetSubject) itemsSet.add(t.targetSubject);
      if (selectedDimension === 'TOPIC' && t.topicName) itemsSet.add(t.topicName);
      if (t.syllabus && Array.isArray(t.syllabus)) {
        t.syllabus.forEach(s => {
          if (selectedDimension === 'SUBJECT' && s.subject) itemsSet.add(s.subject);
          if (selectedDimension === 'TOPIC' && s.topics) itemsSet.add(s.topics);
        });
      }
    });

    return Array.from(itemsSet).filter(Boolean);
  }, [selectedDimension, taxonomyNodes, tournaments]);

  // 3. FILTERED EVALUATIONS
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => {
      if (selectedCadence !== 'ALL') {
        const sec = (t.categorySection || '').toUpperCase();
        if (sec !== selectedCadence.toUpperCase()) return false;
      }

      if (selectedDimension !== 'ALL' && selectedSubCategory !== 'ALL') {
        const target = selectedSubCategory.toLowerCase();
        let matched = false;

        if (selectedDimension === 'EXAM') {
          matched = (t.targetExam || '').toLowerCase().includes(target) || (t.title || '').toLowerCase().includes(target);
        } else if (selectedDimension === 'CLASS') {
          matched = (t.targetClass || '').toLowerCase().includes(target);
        } else if (selectedDimension === 'SUBJECT') {
          matched = (t.targetSubject || '').toLowerCase().includes(target) || 
                    (t.syllabus && t.syllabus.some(s => s.subject.toLowerCase().includes(target)));
        } else if (selectedDimension === 'TOPIC') {
          matched = (t.topicName || '').toLowerCase().includes(target) || 
                    (t.syllabus && t.syllabus.some(s => (s.topics || '').toLowerCase().includes(target)));
        }

        if (!matched) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = (t.title || '').toLowerCase().includes(query);
        const matchesSubject = (t.targetSubject || '').toLowerCase().includes(query);
        const matchesExam = (t.targetExam || '').toLowerCase().includes(query);
        const matchesClass = (t.targetClass || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubject && !matchesExam && !matchesClass) return false;
      }

      return true;
    });
  }, [tournaments, selectedCadence, selectedDimension, selectedSubCategory, searchQuery]);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTournament) return;
    if (!candidateName.trim() || !candidateEmail.trim() || candidatePhone.trim().length < 10) {
      return alert("Please enter valid legal name, active email, and 10-digit mobile number.");
    }
    if (!acceptIntegrityCode) {
      return alert("Candidate must accept the Academic Ethics & Verification Code.");
    }

    setIsSubmitting(true);
    try {
      const res = await createPaymentRecord({
        candidateName: candidateName.trim(),
        email: candidateEmail.trim().toLowerCase(),
        phone: candidatePhone.trim(),
        olympiadId: activeTournament.id,
        olympiadTier: activeTournament.title,
        targetExam: activeTournament.targetExam,
        targetSubject: activeTournament.targetSubject,
        amount: activeTournament.fee,
        paymentMethod: activeTournament.fee === 0 ? 'Exempted Merit Application' : 'Online Evaluation Fee',
      });

      if (res && res.success && res.rollNo) {
        setConfirmedAdmit({
          rollNo: res.rollNo,
          candidateName: candidateName.trim(),
          tournamentId: activeTournament.id,
          tournamentTitle: activeTournament.title,
          examSlot: activeTournament.scheduleText || (activeTournament.startDateTime ? new Date(activeTournament.startDateTime).toLocaleString('en-IN') : 'Scheduled Slot'),
          amount: activeTournament.fee,
        });
        setShowRegisterModal(false);
      } else {
        alert("Failed to confirm registration. Please retry.");
      }
    } catch (err: any) {
      alert("Application submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-32 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* Official Ethics & Compliance Notice */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2.5 shadow-sm flex items-center justify-center gap-2 text-xs font-medium text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-white font-bold">ABHYAAS NATIONAL ACADEMIC CHARTER:</strong> Evaluations operate under strict non-commercial educational fellowship guidelines. Secondary device assistance or proxy attempts lead to permanent disqualification from national academic registers.
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>All-India Merit Evaluation & Research Fellowship Directorate</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                All-India Academic Olympiads
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Independent Standardized Evaluation • Institutional Endowed Fellowships • Mandatory 1-on-1 Faculty Defense
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl shrink-0">
              <div className="text-center px-3 border-r border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Sessions</p>
                <p className="text-xl font-black text-slate-900">{tournaments.length}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtered Sessions</p>
                <p className="text-xl font-black text-blue-600">{filteredTournaments.length}</p>
              </div>
            </div>
          </div>

          {/* LEVEL 1: CADENCE / FREQUENCY SELECTOR */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Select Evaluation Schedule</span>
              </span>
              {selectedCadence !== 'ALL' && (
                <button
                  onClick={() => setSelectedCadence('ALL')}
                  className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  Reset Schedule
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
              {availableCadences.map(c => {
                const isSelected = selectedCadence === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCadence(c.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LEVEL 2: ACADEMIC DIMENSIONS */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Choose Academic Stream</span>
              </span>
              {selectedDimension !== 'ALL' && (
                <button
                  onClick={() => {
                    setSelectedDimension('ALL');
                    setSelectedSubCategory('ALL');
                  }}
                  className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  View All Disciplines
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'ALL', label: 'All Disciplines', desc: 'Comprehensive listing' },
                { id: 'EXAM', label: 'Competitive Exams', desc: 'Civil Services, JEE, Foundation...' },
                { id: 'CLASS', label: 'Academic Standards', desc: 'Class 6–10, 11–12, Graduate...' },
                { id: 'SUBJECT', label: 'Core Subjects', desc: 'Polity, Physics, Chemistry, Maths...' },
                { id: 'TOPIC', label: 'Specialized Topics', desc: 'Focused syllabus modules...' }
              ].map(dim => {
                const isSelected = selectedDimension === dim.id;
                return (
                  <button
                    key={dim.id}
                    onClick={() => {
                      setSelectedDimension(dim.id as any);
                      setSelectedSubCategory('ALL');
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-600'
                        : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <p className="font-black text-xs">{dim.label}</p>
                    <p className={`text-[10px] mt-1 font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {dim.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LEVEL 3: DYNAMIC SUB-CATEGORIES */}
          {selectedDimension !== 'ALL' && (
            <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>
                    Select {selectedDimension === 'EXAM' ? 'Target Examination' :
                           selectedDimension === 'CLASS' ? 'Target Academic Tier' :
                           selectedDimension === 'SUBJECT' ? 'Subject Discipline' : 'Topic / Module'}
                  </span>
                </span>
                {selectedSubCategory !== 'ALL' && (
                  <button
                    onClick={() => setSelectedSubCategory('ALL')}
                    className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {subCategoryOptions.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
                  No registered {selectedDimension.toLowerCase()} records found. Published sessions will populate here automatically.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSubCategory('ALL')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      selectedSubCategory === 'ALL'
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Available ({subCategoryOptions.length})
                  </button>

                  {subCategoryOptions.map(sub => {
                    const isSelected = selectedSubCategory === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{sub}</span>
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* LEVEL 4: SESSIONS LISTING */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Confirmed Admit Card View */}
        {confirmedAdmit && (
          <div className="max-w-3xl mx-auto bg-white border-2 border-emerald-600 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Provisional Examination Admit Card</h2>
              <p className="text-xs text-slate-500">
                Candidate registration verified under the Academic Directorate. Retain this credentials pass for proctored entry and Viva Voce defense.
              </p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Candidate Roll Number</span>
                  <p className="text-lg font-mono font-black text-emerald-400 tracking-widest">{confirmedAdmit.rollNo}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase">
                  Verified Scholar Roll
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Candidate Name:</span>
                  <span className="font-bold text-white">{confirmedAdmit.candidateName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Subject Evaluation:</span>
                  <span className="font-bold text-white">{confirmedAdmit.tournamentTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Scheduled Window:</span>
                  <span className="font-bold text-white">{confirmedAdmit.examSlot}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Proctoring Assessment Fee:</span>
                  <span className="font-bold text-emerald-400">
                    {confirmedAdmit.amount === 0 ? 'Exempted (Institutional Merit Sponsorship)' : `₹${confirmedAdmit.amount} (Account Cleared)`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print Official Admit Card (.PDF)</span>
              </button>

              {/* Explicit Session & Roll Binding */}
              <Link
                href={`/quiz?mode=olympiad&roll=${encodeURIComponent(confirmedAdmit.rollNo)}&olympiadId=${encodeURIComponent(confirmedAdmit.tournamentId)}`}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Enter Proctored Examination Hall</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Section Heading & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Active Examination Rosters ({filteredTournaments.length})
            </h2>
            <p className="text-xs text-slate-500">
              Certified nationwide examinations with established institutional merit fellowship grants.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by subject, syllabus or exam..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-800 transition"
            />
          </div>
        </div>

        {/* Tournaments Grid */}
        {loading ? (
          <div className="text-center py-24 space-y-3">
            <Loader2 className="w-9 h-9 text-slate-800 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Connecting National Examination Rosters...
            </p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3 shadow-xs">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">No Evaluations Scheduled Under Current Filter</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              New official examination sessions notified by the Directorate will synchronize here automatically.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(t => {
              const isFeeExempt = Number(t.fee) === 0;

              return (
                <div 
                  key={t.id}
                  className="bg-white border border-slate-200 hover:border-slate-400 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5 transition"
                >
                  <div className="space-y-4">
                    
                    {/* Header: Ref + Tags */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Notification: ABH/EXAM/{t.id.slice(-6).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {t.categorySection || 'ASSESSMENT'}
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {t.targetClass || 'OPEN'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Evaluation Fee</span>
                        <span className={`text-xs font-black ${isFeeExempt ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {isFeeExempt ? 'Sponsored (Nil)' : `₹${t.fee}`}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                        {t.descriptionEn || 'National level academic evaluation bench-marked against official syllabus standards.'}
                      </p>
                    </div>

                    {/* Logistics Card */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" /> Scheduled Date:
                        </span>
                        <strong className="text-slate-900 font-bold">
                          {t.startDateTime ? new Date(t.startDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : (t.scheduleText || 'Scheduled Slot')}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> Pattern:
                        </span>
                        <strong className="text-slate-900 font-bold">
                          {t.questionsCount || 50} MCQs • {t.durationMinutes || 45} Minutes
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 pt-1.5 border-t border-slate-200">
                        <span className="font-medium text-slate-500">Endowed Fellowship Fund:</span>
                        <strong className="text-blue-900 font-bold">
                          {t.totalGrantPool || 'Academic Merit Grant'}
                        </strong>
                      </div>
                    </div>

                    {/* Status Notice */}
                    <div className="text-[10px] text-slate-600 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                      <strong>Scholarship Governance:</strong> Educational fellowships are granted strictly on merit. Candidates must secure qualifying marks (&ge;75%) and successfully defend their analytical solutions in a mandatory 1-on-1 Viva Voce session.
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => { setActiveTournament(t); setShowRegisterModal(true); }}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{isFeeExempt ? 'Enroll Candidate (Sponsored Entry)' : `Enroll Candidate (Evaluation Fee: ₹${t.fee})`}</span>
                    </button>

                    <button
                      onClick={() => { setActiveTournament(t); setShowBlueprintModal(true); }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Prescribed Syllabus & Regulations</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL 1: CANDIDATE ENROLLMENT FORM */}
      {showRegisterModal && activeTournament && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  National Academic Candidate Enrollment
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">
                  {activeTournament.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Evaluation & Proctoring Cost: {Number(activeTournament.fee) === 0 ? 'Sponsored / Nil' : `₹${activeTournament.fee}`}
                </p>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplicationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name (as recorded on official Government ID)*</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Full Legal Name"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Active Email Address (for Roll Number & Provisional Admit Pass)*</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="candidate@institution.edu / candidate@gmail.com"
                    value={candidateEmail}
                    onChange={e => setCandidateEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Contact (for Examination Proctoring Alerts)*</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="10-digit primary mobile number"
                    value={candidatePhone}
                    onChange={e => setCandidatePhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px] text-slate-700">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptIntegrityCode}
                    onChange={e => setAcceptIntegrityCode(e.target.checked)}
                    className="mt-0.5 rounded cursor-pointer"
                  />
                  <span>
                    I confirm adherence to the <strong>Abhyaas Academic Honor Code</strong>. I acknowledge that evaluations enforce per-question timing without backtracking, browser window monitoring, and that educational grants are awarded strictly upon passing the mandatory <strong>1-on-1 Viva Voce defense (minimum 60% viva cutoff)</strong> following a baseline written score &ge;75%.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>
                  {Number(activeTournament.fee) === 0 
                    ? 'Confirm Enrollment (Sponsored)' 
                    : `Confirm Enrollment & Pay Evaluation Fee (₹${activeTournament.fee})`}
                </span>
              </button>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Evaluation charges cover computational infrastructure and secure digital proctoring. Non-transferable once the examination session begins.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGULATIONS, SYLLABUS & EVALUATION CODE */}
      {showBlueprintModal && activeTournament && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Academic Curriculum & Examination Regulations
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">{activeTournament.title}</h3>
              </div>
              <button onClick={() => setShowBlueprintModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subject-Wise Syllabus Modules */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-700" /> Prescribed Examination Syllabus
              </h4>
              {activeTournament.syllabus && activeTournament.syllabus.length > 0 ? (
                activeTournament.syllabus.map((s, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{s.subject}</span>
                      {s.topics && <p className="text-[11px] text-slate-500 mt-0.5">{s.topics}</p>}
                    </div>
                    <span className="font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {s.questions} Questions
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                  Standard nationwide syllabus matching the competitive framework for this academic tier.
                </div>
              )}
            </div>

            {/* Regulations */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-800">
              <h4 className="font-bold uppercase text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Proctoring & Integrity Protocols:
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
                {activeTournament.rules && activeTournament.rules.length > 0 ? (
                  activeTournament.rules.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>{r}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li>• Objective Evaluation: Strict per-question clock with forward-only progression to prevent external relay.</li>
                    <li>• Environment Integrity: Screen defocus alert threshold of 2 warnings prior to automatic script finalization.</li>
                    <li>• Faculty Defense: Candidates scoring above benchmark defend analytical reasoning in viva voce before academic grant sanction.</li>
                  </>
                )}
              </ul>
            </div>

            <button onClick={() => setShowBlueprintModal(false)} className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-800 transition">
              Close Regulations Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}