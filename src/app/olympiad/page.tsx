'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Award, Calendar, Clock, CheckCircle2, ShieldCheck,
  BookOpen, Download, Loader2, User, Mail, Phone,
  ArrowRight, X, AlertOctagon, Filter, Search,
  Layers, FileText, Check, GraduationCap
} from 'lucide-react';
import { getAllOlympiads, createPaymentRecord, OlympiadTournament } from '@/lib/db';

const FALLBACK_ACADEMIC_OLYMPIADS: OlympiadTournament[] = [
  {
    id: 'abh-oly-upsc-prelims',
    title: 'All-India General Studies Evaluation & Fellowship Assessment',
    titleHi: 'अखिल भारतीय सामान्य अध्ययन मूल्यांकन एवं शोध छात्रवृत्ति परीक्षा',
    descriptionEn: 'Rigorous national evaluation bench-marked against UPSC Civil Services Preliminary Examination standards. Covers Indian Polity, Modern History, and Macroeconomic Policy.',
    fee: 49,
    totalGrantPool: '₹15,000 Study Fellowship',
    totalSlots: 500,
    bookedSlots: 362,
    durationMinutes: 45,
    questionsCount: 50,
    targetClass: 'Civil Services & State PSC Aspirants',
    targetExam: 'UPSC Civil Services (Prelims)',
    targetSubject: 'General Studies Paper I',
    categorySection: 'WEEKLY',
    streamType: 'UPSC_PSC',
    startDateTime: '2026-09-13T10:00',
    scheduleText: 'Scheduled Sunday at 10:00 AM IST',
    rules: [
      "Strict Per-Question Timer (50 seconds per question, No Backtracking) to ensure independent analytical readiness.",
      "Full-Screen Examination Lock: Navigating away from the evaluation environment prompts an immediate penalty; 2 warnings results in permanent auto-submission.",
      "Integrity & Camera Telemetry: Candidate environment telemetry is recorded for post-examination audit.",
      "Mandatory 1-on-1 Academic Viva: Provisional top merit rankers must clear a 10-minute conceptual viva (minimum 60% passing threshold) before fellowship sanction.",
      "Academic Baseline Cutoff: A minimum written score of 75% marks is mandatory to qualify for research fellowship disbursals.",
      "Disqualification & Ethics Policy: Impersonation, proxy assistance, or generative AI usage results in immediate cancellation and permanent identity blacklisting."
    ],
    syllabus: [
      { subject: 'Indian Polity & Constitutional Governance', questions: 20, topics: 'Preamble, Fundamental Rights, Directive Principles, Parliamentary Procedures' },
      { subject: 'Modern Indian History & National Movement', questions: 15, topics: 'Socio-religious reforms, 1857 to 1947, Constitutional evolution' },
      { subject: 'Indian Economy & Fiscal Dynamics', questions: 15, topics: 'Macroeconomic indicators, Monetary Policy, Union Budget, Inflation targets' }
    ],
    status: 'UPCOMING',
    createdAt: null
  },
  {
    id: 'abh-oly-stem-foundation',
    title: 'National Senior Secondary Foundation Diagnostic Assessment',
    titleHi: 'राष्ट्रीय उच्चतर माध्यमिक बुनियादी मूल्यांकन परीक्षा',
    descriptionEn: 'National benchmark examination designed to evaluate core conceptual rigor in advanced physical sciences, structural chemistry, and quantitative calculus.',
    fee: 0,
    totalGrantPool: 'National Merit Citation & Certificate',
    totalSlots: 1000,
    bookedSlots: 780,
    durationMinutes: 40,
    questionsCount: 40,
    targetClass: 'Senior Secondary (Class 11th - 12th)',
    targetExam: 'Senior Secondary Foundation',
    targetSubject: 'Physics & Chemistry Core',
    categorySection: 'WEEKLY',
    streamType: 'FOUNDATION',
    startDateTime: '2026-09-13T12:00',
    scheduleText: 'Scheduled Sunday at 12:00 PM IST',
    rules: [
      "Application fee exempted under institutional academic merit sponsorship.",
      "Sectional diagnostic analytical report and verified solution schemes issued post-assessment.",
      "Full-screen lock enforced throughout the examination window."
    ],
    syllabus: [
      { subject: 'Classical Mechanics & Dynamics', questions: 20, topics: 'Conservation laws, Rotational dynamics, Gravitation, Simple harmonic motion' },
      { subject: 'Chemical Structure & Bonding', questions: 20, topics: 'Hybridization, Molecular Orbital Theory, Thermodynamic principles' }
    ],
    status: 'UPCOMING',
    createdAt: null
  },
  {
    id: 'abh-oly-monthly-advanced',
    title: 'Monthly All-India Advanced Academic Fellowship Examination',
    titleHi: 'मासिक अखिल भारतीय उच्च अध्ययन छात्रवृत्ति परीक्षा',
    descriptionEn: 'Comprehensive multi-disciplinary assessment evaluating integrated conceptual problem-solving, advanced logic, and analytical synthesis across disciplines.',
    fee: 199,
    totalGrantPool: '₹1,00,000 Study Fellowship Allocation',
    totalSlots: 600,
    bookedSlots: 410,
    durationMinutes: 90,
    questionsCount: 90,
    targetClass: 'Higher Competitive & University Level',
    targetExam: 'Integrated Graduate Assessment',
    targetSubject: 'Comprehensive Core Studies',
    categorySection: 'MONTHLY',
    streamType: 'UPSC_PSC',
    startDateTime: '2026-09-29T10:00',
    scheduleText: 'Last Tuesday of the Month at 10:00 AM IST',
    rules: [
      "Strict timed environment with dual-stage verification protocols.",
      "Merit rank 1 allocated ₹35,000 Research Fellowship post successful Viva Voce defense.",
      "Disqualified attempts automatically cascade to subsequent qualifying candidates achieving >=75% baseline cutoff."
    ],
    syllabus: [
      { subject: 'Section A: Analytical Foundations', questions: 30, topics: 'Structural governance, Macroeconomic policy, Environmental science' },
      { subject: 'Section B: Quantitative & Logical Aptitude', questions: 30, topics: 'Statistical inference, Critical reasoning, Analytical problem solving' },
      { subject: 'Section C: Contemporary Developments', questions: 30, topics: 'Science & technology policy, International institutional frameworks' }
    ],
    status: 'UPCOMING',
    createdAt: null
  }
];

export default function DignifiedOlympiadSuite() {
  const [tournaments, setTournaments] = useState<OlympiadTournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Academic Filters
  const [selectedCadence, setSelectedCadence] = useState<string>('ALL');
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Application
  const [activeTournament, setActiveTournament] = useState<OlympiadTournament | null>(null);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Application Form
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [acceptIntegrityCode, setAcceptIntegrityCode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirmed Admit Card State
  const [confirmedAdmit, setConfirmedAdmit] = useState<{
    rollNo: string;
    candidateName: string;
    tournamentTitle: string;
    examSlot: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    async function loadAcademicTournaments() {
      try {
        const liveList = await getAllOlympiads();
        if (liveList && liveList.length > 0) {
          setTournaments(liveList);
        } else {
          setTournaments(FALLBACK_ACADEMIC_OLYMPIADS);
        }
      } catch (err) {
        console.error("Error loading Olympiad timetable:", err);
        setTournaments(FALLBACK_ACADEMIC_OLYMPIADS);
      } finally {
        setLoading(false);
      }
    }
    loadAcademicTournaments();
  }, []);

  // Academic Filter Engine
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => {
      // 1. Frequency / Cadence Filter
      if (selectedCadence !== 'ALL') {
        const sec = (t.categorySection || '').toUpperCase();
        if (selectedCadence === 'WEEKLY' && sec !== 'WEEKLY') return false;
        if (selectedCadence === 'MONTHLY' && sec !== 'MONTHLY') return false;
        if (selectedCadence === 'QUARTERLY' && sec !== 'QUARTERLY') return false;
        if (selectedCadence === 'HALF_YEARLY' && sec !== 'HALF_YEARLY') return false;
        if (selectedCadence === 'YEARLY' && sec !== 'YEARLY') return false;
        if (selectedCadence === 'GRAND' && sec !== 'GRAND') return false;
        if (selectedCadence === 'SPECIAL' && !['SPECIAL', 'MANUAL', 'CUSTOM'].includes(sec)) return false;
      }

      // 2. Academic Stream Filter
      if (selectedStream !== 'ALL') {
        const str = (t.streamType || '').toUpperCase();
        if (str !== selectedStream) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (t.title || '').toLowerCase().includes(q);
        const matchesSubject = (t.targetSubject || '').toLowerCase().includes(q);
        const matchesExam = (t.targetExam || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject && !matchesExam) return false;
      }

      return true;
    });
  }, [tournaments, selectedCadence, selectedStream, searchQuery]);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTournament) return;
    if (!candidateName.trim() || !candidateEmail.trim() || candidatePhone.trim().length < 10) {
      return alert("Please enter valid legal name, active email, and 10-digit mobile number.");
    }
    if (!acceptIntegrityCode) {
      return alert("Candidate must formally accept the Academic Ethics & Verification Code.");
    }

    setIsSubmitting(true);
    try {
      const res = await createPaymentRecord({
        candidateName: candidateName.trim(),
        email: candidateEmail.trim().toLowerCase(),
        phone: candidatePhone.trim(),
        olympiadTier: activeTournament.title,
        amount: activeTournament.fee,
        paymentMethod: activeTournament.fee === 0 ? 'Exempted (Sponsored)' : 'Verified Online Payment',
      });

      if (res && res.success && res.rollNo) {
        setConfirmedAdmit({
          rollNo: res.rollNo,
          candidateName: candidateName.trim(),
          tournamentTitle: activeTournament.title,
          examSlot: activeTournament.scheduleText || (activeTournament.startDateTime ? new Date(activeTournament.startDateTime).toLocaleString('en-IN') : 'Scheduled Examination Slot'),
          amount: activeTournament.fee,
        });
        setShowRegisterModal(false);
      } else {
        alert("Unable to generate examination admit card. Please retry.");
      }
    } catch (err: any) {
      alert("Application submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-32 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* OFFICIAL INSTITUTIONAL ETHICS CHARTER BANNER */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2.5 shadow-sm flex items-center justify-center gap-2 text-xs font-medium text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-white font-bold">ABHYAAS ACADEMIC ETHICS CHARTER:</strong> Unfair means, unauthorized collaboration, or impersonation leads to immediate disqualification and permanent identity blacklisting across the national verification roll.
        </span>
      </div>

      {/* Header & Program Details */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>All-India Merit Assessment & Academic Fellowship Program</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                All-India Academic Olympiads
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Standardized Competitive Evaluation • Verified Research Grants • Mandatory Academic Viva Voce
              </p>
              <p className="text-slate-600 text-xs sm:text-sm max-w-3xl leading-relaxed">
                National level standardized academic examinations designed to assess conceptual mastery across competitive and foundational disciplines. Top merit rankers qualify for research fellowships and educational study grants administered post verification.
              </p>
            </div>

            {/* Official Statistics Card */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center min-w-[170px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Examinations</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{tournaments.length}</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">● National Examination Schedule</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center min-w-[170px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sanctioned Fellowships</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">Merit Grants</p>
                <p className="text-[10px] text-blue-600 font-bold mt-0.5">Direct Verified Bank Disbursal</p>
              </div>
            </div>
          </div>

          {/* Academic Schedule Filter Tabs */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Cadence Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
              {[
                { id: 'ALL', label: 'All Examinations' },
                { id: 'WEEKLY', label: 'Weekly Assessments' },
                { id: 'MONTHLY', label: 'Monthly Fellowship Series' },
                { id: 'QUARTERLY', label: 'Quarterly Talent Search' },
                { id: 'HALF_YEARLY', label: 'Half-Yearly Assessments' },
                { id: 'YEARLY', label: 'Annual Grand Fellowship' },
                { id: 'GRAND', label: 'National Day Convocation' },
                { id: 'SPECIAL', label: 'Special Subject Drills' },
              ].map(cadence => {
                const isSelected = selectedCadence === cadence.id;
                return (
                  <button
                    key={cadence.id}
                    onClick={() => setSelectedCadence(cadence.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cadence.label}
                  </button>
                );
              })}
            </div>

            {/* Academic Stream Selector & Live Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedStream}
                  onChange={e => setSelectedStream(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer py-1"
                >
                  <option value="ALL">All Academic Streams</option>
                  <option value="UPSC_PSC">Civil Services (UPSC CSE & State PSC)</option>
                  <option value="ENGINEERING">Engineering Sciences (IIT-JEE / B.Tech)</option>
                  <option value="MEDICAL">Medical Sciences (NEET / MBBS)</option>
                  <option value="SSC_BANKING">Government Recruitment (SSC / Banking)</option>
                  <option value="LAW">Legal Jurisprudence (CLAT & Judicial)</option>
                  <option value="FOUNDATION">Senior Secondary Foundation (11th - 12th)</option>
                  <option value="GENERAL">General Scholastic Aptitude</option>
                </select>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search subject, discipline..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-800 transition"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Examination Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Provisional Admit Card Confirmation Banner */}
        {confirmedAdmit && (
          <div className="max-w-3xl mx-auto bg-white border-2 border-emerald-600 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Provisional Examination Admit Card Generated</h2>
              <p className="text-xs text-slate-500">
                Official candidate registration roll number confirmed. Preserve this card for examination login and Viva Voce verification.
              </p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Candidate Roll Number</span>
                  <p className="text-lg font-mono font-black text-emerald-400 tracking-widest">{confirmedAdmit.rollNo}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase">
                  Confirmed Candidate
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Candidate Name:</span>
                  <span className="font-bold text-white">{confirmedAdmit.candidateName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Examination:</span>
                  <span className="font-bold text-white">{confirmedAdmit.tournamentTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Examination Slot:</span>
                  <span className="font-bold text-white">{confirmedAdmit.examSlot}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Application Processing Status:</span>
                  <span className="font-bold text-emerald-400">
                    {confirmedAdmit.amount === 0 ? 'Exempted (Sponsored Entry)' : `₹${confirmedAdmit.amount} (Payment Cleared)`}
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
                <span>Print / Save Admit Card (.PDF)</span>
              </button>

              <Link
                href={`/quiz?mode=olympiad&roll=${encodeURIComponent(confirmedAdmit.rollNo)}`}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Assessment Hall</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Examination List */}
        {loading ? (
          <div className="text-center py-24 space-y-3">
            <Loader2 className="w-9 h-9 text-slate-800 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Synchronizing National Examination Timetable...
            </p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">No Examinations Scheduled</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              No examination sessions match your current filter parameters. Adjust frequency or academic stream selectors above.
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
                    
                    {/* Official Notification Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Notification Ref: ABH/2026/{t.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                          {t.categorySection || 'ASSESSMENT'} • {t.streamType || 'DISCIPLINE'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application Fee</span>
                        <span className={`text-xs font-black ${isFeeExempt ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {isFeeExempt ? 'Nil (Sponsored)' : `₹${t.fee}`}
                        </span>
                      </div>
                    </div>

                    {/* Examination Title & Academic Summary */}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {t.descriptionEn || 'National level academic evaluation bench-marked against official syllabus standards.'}
                      </p>
                    </div>

                    {/* Examination Logistics Card */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" /> Scheduled Window:
                        </span>
                        <strong className="text-slate-900 font-bold">
                          {t.startDateTime ? new Date(t.startDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : (t.scheduleText || 'Sunday Slot')}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-500" /> Scheme:
                        </span>
                        <strong className="text-slate-900 font-bold">
                          {t.questionsCount || 50} Questions • {t.durationMinutes || 45} Mins
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 pt-1.5 border-t border-slate-200">
                        <span className="font-medium text-slate-500">Sanctioned Fellowship:</span>
                        <strong className="text-slate-900 font-bold">
                          {t.totalGrantPool || 'Academic Merit Roll'}
                        </strong>
                      </div>
                    </div>

                    {/* Operational Notice */}
                    <div className="text-[10px] text-slate-500 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/80 leading-relaxed">
                      <strong>Admissions Status:</strong> Registration open. Subject to academic baseline cutoff (&ge;75%) and mandatory 1-on-1 Viva Voce verification prior to award.
                    </div>

                  </div>

                  {/* Application Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => { setActiveTournament(t); setShowRegisterModal(true); }}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{isFeeExempt ? 'Submit Candidate Application (Exempted)' : `Submit Candidate Application (Fee: ₹${t.fee})`}</span>
                    </button>

                    <button
                      onClick={() => { setActiveTournament(t); setShowBlueprintModal(true); }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Examination Scheme, Syllabus & Code</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL 1: FORMAL CANDIDATE APPLICATION FORM */}
      {showRegisterModal && activeTournament && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Official Candidate Registration
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">
                  {activeTournament.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Application Processing Fee: {Number(activeTournament.fee) === 0 ? 'Nil (Merit Sponsored)' : `₹${activeTournament.fee}`}
                </p>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplicationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name (as on Government Photo ID)*</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Candidate Legal Name"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email Address (for Examination Admit Card & Scorecard)*</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="candidate@university.edu / candidate@gmail.com"
                    value={candidateEmail}
                    onChange={e => setCandidateEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Contact Number (for Roll Number SMS & Dispatch Alerts)*</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
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
                    I affirm adherence to the <strong>Abhyaas Academic Ethics Charter</strong>. I understand that evaluations employ strict per-question timing and screen integrity checks (2-warning limit), and that academic research fellowships are strictly contingent upon qualifying the mandatory <strong>1-on-1 Viva Voce defense (minimum 60% viva cutoff)</strong> with baseline score &ge;75%.
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
                    ? 'Confirm Application (Fee Exempted)' 
                    : `Confirm Application & Process Examination Fee (₹${activeTournament.fee})`}
                </span>
              </button>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Examination fees are non-refundable once the test session initiates. Automatic 100% refund initiated if an examination cohort threshold is unfulfilled.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EXAMINATION SCHEME, SYLLABUS & ETHICS CODE */}
      {showBlueprintModal && activeTournament && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Examination Scheme & Regulations
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
                  Standard curriculum syllabus covering core competitive foundations for this discipline.
                </div>
              )}
            </div>

            {/* Examination Conduct Regulations */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-800">
              <h4 className="font-bold uppercase text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Examination Conduct & Verification Protocols:
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
                    <li>• Independent Pacing: Fixed time-per-question limits without backtracking to prevent unauthorized relay.</li>
                    <li>• Environment Integrity: Candidate screen-switch limit of 2 warnings prior to automatic script submission.</li>
                    <li>• Viva Voce Defense: Top merit candidates defend analytical solutions before academic faculty prior to study grant award.</li>
                  </>
                )}
              </ul>
            </div>

            <button onClick={() => setShowBlueprintModal(false)} className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-800 transition">
              Close Examination Regulations
            </button>
          </div>
        </div>
      )}

    </div>
  );
}