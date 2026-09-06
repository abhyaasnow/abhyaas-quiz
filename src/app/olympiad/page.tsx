'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, CheckCircle2, ShieldCheck,
  BookOpen, Download, Loader2, User, Mail, Phone,
  ArrowRight, X, AlertOctagon, Filter, Search,
  FileText, GraduationCap, ChevronRight, Tag,
  Layers, Sparkles, Plus, Compass
} from 'lucide-react';
import { getAllOlympiads, createPaymentRecord, OlympiadTournament } from '@/lib/db';

// Fallback seed tournaments if database is fresh
const SEED_TOURNAMENTS: OlympiadTournament[] = [
  {
    id: 'abh-oly-upsc-prelims',
    title: 'All-India UPSC General Studies Preliminary Evaluation',
    titleHi: 'अखिल भारतीय यूपीएससी सामान्य अध्ययन प्रारंभिक मूल्यांकन',
    descriptionEn: 'Rigorous national assessment aligned with UPSC CSE Preliminary standards. Tests conceptual depth across Indian Polity, Modern History, and Macroeconomic trends.',
    fee: 49,
    totalGrantPool: '₹15,000 Study Fellowship',
    totalSlots: 500,
    bookedSlots: 362,
    durationMinutes: 45,
    questionsCount: 50,
    targetClass: 'Civil Services & Graduate Aspirants',
    targetExam: 'UPSC Civil Services',
    targetSubject: 'Indian Polity & Governance',
    categorySection: 'WEEKLY',
    streamType: 'UPSC_PSC',
    startDateTime: '2026-09-13T10:00',
    scheduleText: 'Sunday at 10:00 AM IST',
    rules: [
      "Strict Per-Question Timer (50 seconds per MCQ, No Backtracking).",
      "Full-Screen Lock: Exiting full-screen twice triggers automatic script submission.",
      "Front camera and environment telemetry logged for integrity verification.",
      "Top merit candidates must defend their solutions in a 1-on-1 Academic Viva (minimum 60% passing score).",
      "Minimum written baseline cutoff of 75% marks required for study grant sanction."
    ],
    syllabus: [
      { subject: 'Indian Polity & Constitution', questions: 20, topics: 'Preamble, Fundamental Rights, Parliament, Judiciary' },
      { subject: 'Modern Indian History', questions: 15, topics: '1857 Revolt to 1947, Constitutional Reforms' },
      { subject: 'Indian Economy & Macroeconomics', questions: 15, topics: 'Banking, Fiscal Deficit, Monetary Policy, Inflation' }
    ],
    status: 'UPCOMING',
    createdAt: null
  },
  {
    id: 'abh-oly-jee-physics',
    title: 'National Advanced Mechanics & Electrodynamics Olympiad',
    titleHi: 'राष्ट्रीय उच्च भौतिकी एवं यांत्रिकी ओलंपियाड',
    descriptionEn: 'Championship level assessment covering rotational dynamics, electrostatic potential, and classical mechanics for engineering aspirants.',
    fee: 99,
    totalGrantPool: '₹25,000 Study Fellowship',
    totalSlots: 500,
    bookedSlots: 290,
    durationMinutes: 60,
    questionsCount: 60,
    targetClass: 'Class 11th - 12th',
    targetExam: 'IIT-JEE (Advanced / Mains)',
    targetSubject: 'Physics & Mechanics',
    categorySection: 'WEEKLY',
    streamType: 'ENGINEERING',
    startDateTime: '2026-09-13T14:00',
    scheduleText: 'Sunday at 02:00 PM IST',
    rules: [
      "Per-question time-lock enforced.",
      "Screen switching restricted with 2 warnings maximum.",
      "Subject experts conduct recorded Viva Voce prior to study grant award."
    ],
    syllabus: [
      { subject: 'Rotational Motion & Gravitation', questions: 30, topics: 'Moment of Inertia, Torque, Planetary Motion' },
      { subject: 'Electrostatics & Current Electricity', questions: 30, topics: 'Gauss Law, Capacitance, Kirchhoff Circuit Laws' }
    ],
    status: 'UPCOMING',
    createdAt: null
  },
  {
    id: 'abh-oly-foundation-stem',
    title: 'National Junior Science & Mathematics Foundation Drill',
    titleHi: 'राष्ट्रीय जूनियर विज्ञान एवं गणित बुनियादी परीक्षा',
    descriptionEn: 'Open diagnostic examination for high school learners to assess core fundamentals in algebra, biology, and chemical change.',
    fee: 0,
    totalGrantPool: 'National Merit Certificate & Honor Roll',
    totalSlots: 1000,
    bookedSlots: 740,
    durationMinutes: 30,
    questionsCount: 30,
    targetClass: 'Class 9th - 10th',
    targetExam: 'Senior Secondary Foundation',
    targetSubject: 'Mathematics & General Science',
    categorySection: 'WEEKLY',
    streamType: 'FOUNDATION',
    startDateTime: '2026-09-13T16:00',
    scheduleText: 'Sunday at 04:00 PM IST',
    rules: [
      "Application fee exempted under institutional academic merit sponsorship.",
      "Detailed diagnostic scorecard and solution key provided immediately.",
      "Full-screen lock active during assessment."
    ],
    syllabus: [
      { subject: 'Algebra & Number Systems', questions: 15, topics: 'Polynomials, Linear Equations, Real Numbers' },
      { subject: 'Chemical Reactions & Life Processes', questions: 15, topics: 'Oxidation, Cellular Respiration, Acids & Bases' }
    ],
    status: 'UPCOMING',
    createdAt: null
  },
  {
    id: 'abh-oly-monthly-mega-ssc',
    title: 'All-India Monthly Quantitative Aptitude & CSAT Logic Arena',
    titleHi: 'मासिक अखिल भारतीय संख्यात्मक अभिरुचि एवं सीसैट टेस्ट',
    descriptionEn: 'High-speed national evaluation testing data interpretation, critical decision making, and quantitative aptitude.',
    fee: 99,
    totalGrantPool: '₹40,000 Study Fellowship',
    totalSlots: 600,
    bookedSlots: 410,
    durationMinutes: 60,
    questionsCount: 75,
    targetClass: 'Civil Services & Graduate Aspirants',
    targetExam: 'SSC CGL & Banking',
    targetSubject: 'Quantitative Aptitude & CSAT',
    categorySection: 'MONTHLY',
    streamType: 'SSC_BANKING',
    startDateTime: '2026-09-29T10:00',
    scheduleText: 'Last Tuesday of Month at 10:00 AM IST',
    rules: [
      "Timed examination session with zero backtrack policy.",
      "Screen telemetry verification mandatory.",
      "Viva Voce verification conducted within 24 hours of provisional rank declaration."
    ],
    syllabus: [
      { subject: 'Quantitative Aptitude', questions: 40, topics: 'Arithmetic, Percentages, Ratio-Proportion, Data Interpretation' },
      { subject: 'Analytical & Critical Reasoning', questions: 35, topics: 'Syllogisms, Seating Arrangement, Logical Deductions' }
    ],
    status: 'UPCOMING',
    createdAt: null
  }
];

// Presets for the 4 primary taxonomy dimensions
const TAXONOMY_PRESETS = {
  EXAM: [
    'UPSC Civil Services',
    'State PSC (UPPSC / BPSC / MPPCS)',
    'IIT-JEE (Advanced / Mains)',
    'NEET-UG (Medical)',
    'SSC CGL & Banking',
    'CLAT & Judicial Services',
    'Senior Secondary Foundation',
    'Navodaya & Sainik Entrance'
  ],
  CLASS: [
    'Class 6th - 8th (Middle School)',
    'Class 9th - 10th (Secondary)',
    'Class 11th - 12th (Senior Secondary)',
    'Civil Services & Graduate Aspirants',
    'Engineering & Technology (B.Tech / JEE)',
    'Medical & Dental (MBBS / NEET)'
  ],
  SUBJECT: [
    'Indian Polity & Governance',
    'Modern Indian History',
    'Indian Economy & Macroeconomics',
    'Physical & Human Geography',
    'Physics & Mechanics',
    'Chemistry (Organic & Physical)',
    'Mathematics & Quantitative Calculus',
    'Quantitative Aptitude & CSAT',
    'Biology & Life Sciences',
    'English Language & Comprehension'
  ],
  TOPIC: [
    'Preamble & Fundamental Rights',
    'Modern History: 1857 to 1947',
    'Macroeconomic Policy & Budget',
    'Rotational Dynamics & Gravity',
    'Chemical Bonding & Hybridization',
    'Differential Equations & Vectors',
    'Data Interpretation & Reasoning',
    'Cellular Biology & Genetics'
  ]
};

export default function CascadingOlympiadSuite() {
  const [tournaments, setTournaments] = useState<OlympiadTournament[]>([]);
  const [loading, setLoading] = useState(true);

  // LEVEL 1: Frequency / Cadence
  const [selectedCadence, setSelectedCadence] = useState<string>('ALL');

  // LEVEL 2: Primary Taxonomy Dimension
  const [selectedDimension, setSelectedDimension] = useState<'ALL' | 'EXAM' | 'CLASS' | 'SUBJECT' | 'TOPIC' | 'MANUAL'>('ALL');

  // LEVEL 3: Sub-Category Selection (or Manual Filter String)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');
  const [manualCustomInput, setManualCustomInput] = useState<string>('');

  // Modals & Application States
  const [activeTournament, setActiveTournament] = useState<OlympiadTournament | null>(null);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Candidate Registration Fields
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
    async function loadLiveTournaments() {
      try {
        const liveList = await getAllOlympiads();
        if (liveList && liveList.length > 0) {
          setTournaments(liveList);
        } else {
          setTournaments(SEED_TOURNAMENTS);
        }
      } catch (err) {
        console.error("Error fetching Olympiads:", err);
        setTournaments(SEED_TOURNAMENTS);
      } finally {
        setLoading(false);
      }
    }
    loadLiveTournaments();
  }, []);

  // Compute dynamic sub-categories based on Level 2 Selection + live data
  const subCategoryPills = useMemo(() => {
    if (selectedDimension === 'ALL') return [];

    if (selectedDimension === 'MANUAL') return [];

    const presetList = TAXONOMY_PRESETS[selectedDimension] || [];
    
    // Auto-extract live unique names from current tournaments to ensure admin-created custom items always appear
    const liveValues = new Set<string>();
    tournaments.forEach(t => {
      if (selectedDimension === 'EXAM' && t.targetExam) liveValues.add(t.targetExam);
      if (selectedDimension === 'CLASS' && t.targetClass) liveValues.add(t.targetClass);
      if (selectedDimension === 'SUBJECT' && t.targetSubject) liveValues.add(t.targetSubject);
      if (selectedDimension === 'TOPIC' && t.topicName) liveValues.add(t.topicName);
      if (t.syllabus && Array.isArray(t.syllabus)) {
        t.syllabus.forEach(s => {
          if (selectedDimension === 'SUBJECT' && s.subject) liveValues.add(s.subject);
          if (selectedDimension === 'TOPIC' && s.topics) liveValues.add(s.topics);
        });
      }
    });

    const combined = Array.from(new Set([...presetList, ...Array.from(liveValues)])).filter(Boolean);
    return combined;
  }, [selectedDimension, tournaments]);

  // LEVEL 4: Filter Tournaments based on all active cascading layers
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => {
      // 1. Check Cadence Filter
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

      // 2. Check Dimension & Sub-Category Filter
      if (selectedDimension !== 'ALL') {
        if (selectedDimension === 'MANUAL') {
          if (manualCustomInput.trim()) {
            const query = manualCustomInput.toLowerCase();
            const matchesTitle = (t.title || '').toLowerCase().includes(query);
            const matchesSubject = (t.targetSubject || '').toLowerCase().includes(query);
            const matchesExam = (t.targetExam || '').toLowerCase().includes(query);
            const matchesClass = (t.targetClass || '').toLowerCase().includes(query);
            if (!matchesTitle && !matchesSubject && !matchesExam && !matchesClass) return false;
          }
        } else if (selectedSubCategory !== 'ALL') {
          const subTarget = selectedSubCategory.toLowerCase();
          let matched = false;

          if (selectedDimension === 'EXAM') {
            matched = (t.targetExam || '').toLowerCase().includes(subTarget) || (t.title || '').toLowerCase().includes(subTarget);
          } else if (selectedDimension === 'CLASS') {
            matched = (t.targetClass || '').toLowerCase().includes(subTarget);
          } else if (selectedDimension === 'SUBJECT') {
            matched = (t.targetSubject || '').toLowerCase().includes(subTarget) || 
                      (t.syllabus && t.syllabus.some(s => s.subject.toLowerCase().includes(subTarget)));
          } else if (selectedDimension === 'TOPIC') {
            matched = (t.topicName || '').toLowerCase().includes(subTarget) || 
                      (t.syllabus && t.syllabus.some(s => (s.topics || '').toLowerCase().includes(subTarget)));
          }

          if (!matched) return false;
        }
      }

      return true;
    });
  }, [tournaments, selectedCadence, selectedDimension, selectedSubCategory, manualCustomInput]);

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
        olympiadTier: activeTournament.title,
        amount: activeTournament.fee,
        paymentMethod: activeTournament.fee === 0 ? 'Exempted Entry Pass' : 'Online Verified',
      });

      if (res && res.success && res.rollNo) {
        setConfirmedAdmit({
          rollNo: res.rollNo,
          candidateName: candidateName.trim(),
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
      
      {/* 1. Official Institutional Ethics Charter Banner */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2.5 shadow-sm flex items-center justify-center gap-2 text-xs font-medium text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-white font-bold">ABHYAAS ACADEMIC INTEGRITY CODE:</strong> Secondary device or generative AI relay use leads to immediate disqualification and permanent identity blacklisting across the national verification roll.
        </span>
      </div>

      {/* 2. Top Header & Title */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>All-India Merit Assessment & Academic Fellowship Timetable</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                All-India Academic Olympiads
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Standardized Competitive Evaluation • Verified Research Grants • Mandatory 1-on-1 Viva Voce
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl shrink-0">
              <div className="text-center px-3 border-r border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Sessions</p>
                <p className="text-xl font-black text-slate-900">{tournaments.length}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Filters</p>
                <p className="text-xl font-black text-blue-600">{filteredTournaments.length}</p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LEVEL 1: FREQUENCY / CADENCE SELECTOR */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> 1. Select Frequency / Schedule Cadence
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
              {[
                { id: 'ALL', label: 'All Schedules' },
                { id: 'WEEKLY', label: 'Weekly Sprints (Sundays)' },
                { id: 'MONTHLY', label: 'Monthly Megas' },
                { id: 'QUARTERLY', label: 'Quarterly Talent (3-Month)' },
                { id: 'HALF_YEARLY', label: 'Half-Yearly Assessments' },
                { id: 'YEARLY', label: 'Annual Grand Fellowship' },
                { id: 'GRAND', label: 'National Convocation (15 Aug / 26 Jan)' },
                { id: 'SPECIAL', label: 'Special / Custom Invitations' },
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
          </div>

          {/* ========================================================================= */}
          {/* LEVEL 2: PRIMARY TAXONOMY DIMENSIONS (EXAMS, CLASSES, SUBJECTS, TOPICS) */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" /> 2. Filter by Academic Dimension
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {[
                { id: 'ALL', label: 'All Dimensions', desc: 'Complete catalog' },
                { id: 'EXAM', label: 'Examinations', desc: 'UPSC, JEE, NEET, SSC...' },
                { id: 'CLASS', label: 'Classes / Grades', desc: '6-8, 9-10, 11-12, Graduate' },
                { id: 'SUBJECT', label: 'Subjects', desc: 'Polity, Physics, Maths...' },
                { id: 'TOPIC', label: 'Topics & Chapters', desc: 'Preamble, Mechanics...' },
                { id: 'MANUAL', label: 'Manual Search', desc: 'Type custom category' }
              ].map(dim => {
                const isSelected = selectedDimension === dim.id;
                return (
                  <button
                    key={dim.id}
                    onClick={() => {
                      setSelectedDimension(dim.id as any);
                      setSelectedSubCategory('ALL');
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <p className="font-extrabold text-xs">{dim.label}</p>
                    <p className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {dim.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LEVEL 3: DYNAMIC SUB-CATEGORY PILLS (APPEARS ON CLICKING LEVEL 2) */}
          {/* ========================================================================= */}
          {selectedDimension !== 'ALL' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  3. Select {selectedDimension === 'EXAM' ? 'Target Examination' :
                             selectedDimension === 'CLASS' ? 'Target Class / Grade' :
                             selectedDimension === 'SUBJECT' ? 'Target Subject Discipline' :
                             selectedDimension === 'TOPIC' ? 'Key Topic / Chapter' : 'Custom Filter'}
                </span>
                {selectedSubCategory !== 'ALL' && (
                  <button
                    onClick={() => setSelectedSubCategory('ALL')}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Reset to All
                  </button>
                )}
              </div>

              {selectedDimension === 'MANUAL' ? (
                /* Manual Custom Type Input */
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Type custom exam, subject or category (e.g. Organic, UPPSC, Class 10)..."
                      value={manualCustomInput}
                      onChange={e => setManualCustomInput(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600"
                    />
                  </div>
                  {manualCustomInput && (
                    <button
                      onClick={() => setManualCustomInput('')}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      Clear
                    </button>
                  )}
                </div>
              ) : (
                /* Subcategory Pills Grid */
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSubCategory('ALL')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      selectedSubCategory === 'ALL'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All ({subCategoryPills.length})
                  </button>

                  {subCategoryPills.map(sub => {
                    const isSelected = selectedSubCategory === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
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

      {/* ========================================================================= */}
      {/* LEVEL 4: OLYMPIAD RESULTS CARDS */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Confirmed Admit Card View (If Just Registered) */}
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
                  <span className="text-slate-400 text-[11px] block">Application Fee:</span>
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

        {/* Results Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Matching Examination Sessions ({filteredTournaments.length})
            </h2>
            <p className="text-xs text-slate-500">
              Standardized sessions matching your selected cadence and discipline criteria.
            </p>
          </div>
        </div>

        {/* Tournaments Grid */}
        {loading ? (
          <div className="text-center py-24 space-y-3">
            <Loader2 className="w-9 h-9 text-slate-800 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Synchronizing National Examination Timetable...
            </p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">No Examinations Found for this Combination</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Try switching your frequency selection to &quot;All Schedules&quot; or resetting the category filter to view other available assessments.
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
                          Ref: ABH/2026/{t.id.slice(-6).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {t.categorySection || 'ASSESSMENT'}
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {t.targetClass || 'OPEN'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application Fee</span>
                        <span className={`text-xs font-black ${isFeeExempt ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {isFeeExempt ? 'Nil (Sponsored)' : `₹${t.fee}`}
                        </span>
                      </div>
                    </div>

                    {/* Examination Title & Details */}
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {t.descriptionEn || 'Standardized evaluation assessing core syllabus competencies and analytical reasoning.'}
                      </p>
                    </div>

                    {/* Logistics Card */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" /> Scheduled Date:
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

                    {/* Status Notice */}
                    <div className="text-[10px] text-slate-500 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/80 leading-relaxed">
                      <strong>Candidate Notice:</strong> Registration open. Study grants require qualifying score (&ge;75%) followed by mandatory 1-on-1 Viva Voce defense.
                    </div>

                  </div>

                  {/* Actions */}
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

      {/* MODAL 1: CANDIDATE APPLICATION FORM */}
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
                <label className="block font-bold text-slate-700 mb-1">Official Email Address (for Admit Card & Scorecard)*</label>
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
                <label className="block font-bold text-slate-700 mb-1">Mobile Contact Number (for Roll Number SMS Alerts)*</label>
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
                    I affirm adherence to the <strong>Abhyaas Academic Integrity Charter</strong>. I understand that evaluations employ strict per-question timing and screen integrity checks (2-warning limit), and that academic research fellowships are strictly contingent upon qualifying the mandatory <strong>1-on-1 Viva Voce defense (minimum 60% viva cutoff)</strong> with baseline score &ge;75%.
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

      {/* MODAL 2: EXAMINATION SCHEME & SYLLABUS */}
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

            {/* Regulations */}
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