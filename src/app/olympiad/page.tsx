'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Trophy,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Info,
  X,
  Zap,
  BookOpen,
  Download,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Phone,
  QrCode,
  Video,
  ShieldAlert,
  Percent,
  Check
} from 'lucide-react';
import { createPaymentRecord } from '@/lib/db';

interface OlympiadTier {
  id: string;
  name: string;
  nameHi: string;
  fee: number;
  totalGrantPool: string;
  totalSlots: number;
  bookedSlots: number;
  durationMinutes: number;
  questionsCount: number;
  markingScheme: string;
  scheduleText: string;
  targetCategory: string;
  syllabus: { subject: string; questions: number }[];
  rewardMatrix: { rank: string; grant: string; perk: string }[];
}

const OLYMPIAD_TIERS: OlympiadTier[] = [
  {
    id: 'weekly-starter',
    name: 'Weekly Speed Sprint',
    nameHi: 'साप्ताहिक स्पीड स्प्रिंट',
    fee: 49,
    totalGrantPool: '₹15,000',
    totalSlots: 500,
    bookedSlots: 362,
    durationMinutes: 45,
    questionsCount: 50,
    markingScheme: '+2.00 Correct | -0.66 Negative',
    scheduleText: 'Sunday at 10:00 AM IST',
    targetCategory: 'UPSC CSE & State PSC Prelims GS',
    syllabus: [
      { subject: 'Indian Polity & Constitution (भारतीय राजव्यवस्था)', questions: 15 },
      { subject: 'Modern Indian History (आधुनिक भारत का इतिहास)', questions: 15 },
      { subject: 'Physical & Economic Geography (भूगोल)', questions: 10 },
      { subject: 'Current Affairs & National Events (समसामयिकी)', questions: 10 },
    ],
    rewardMatrix: [
      { rank: 'Rank 1', grant: '₹5,000 Academic Fellowship', perk: '1-on-1 Viva Verified • Merit Certificate' },
      { rank: 'Rank 2 – 5', grant: '₹1,500 Preparation Grant', perk: 'National Excellence Roll of Honor' },
      { rank: 'Rank 6 – 20', grant: '₹500 Subject Module Grant', perk: 'Standard Practice Access Credit' },
      { rank: 'All Participants', grant: 'AI Diagnostic Scorecard', perk: 'Detailed Step-by-Step Solutions' },
    ],
  },
  {
    id: 'weekly-advanced',
    name: 'Foundation Master Sprint',
    nameHi: 'फाउंडेशन मास्टर स्प्रिंट',
    fee: 99,
    totalGrantPool: '₹40,000',
    totalSlots: 500,
    bookedSlots: 290,
    durationMinutes: 60,
    questionsCount: 60,
    markingScheme: '+2.00 Correct | -0.66 Negative',
    scheduleText: 'Sunday at 01:00 PM IST',
    targetCategory: 'Advanced Prelims & Analytical CSAT',
    syllabus: [
      { subject: 'Comprehensive General Studies Paper-1', questions: 40 },
      { subject: 'Logical Reasoning & Analytical Aptitude', questions: 20 },
    ],
    rewardMatrix: [
      { rank: 'Rank 1', grant: '₹12,000 Direct Fellowship', perk: 'Delhi Office Honor + Gold Citation' },
      { rank: 'Rank 2 – 3', grant: '₹5,000 Academic Grant', perk: 'Silver Merit Medal + Verification Record' },
      { rank: 'Rank 4 – 10', grant: '₹2,000 Book & Prep Grant', perk: 'Certificate of Academic Distinction' },
      { rank: 'Rank 11 – 25', grant: '₹600 Preparation Voucher', perk: 'National Percentile Honor Roll' },
    ],
  },
  {
    id: 'monthly-mega',
    name: 'Monthly Mega Fellowship',
    nameHi: 'मासिक मेगा ओलंपियाड',
    fee: 199,
    totalGrantPool: '₹1,00,000',
    totalSlots: 600,
    bookedSlots: 412,
    durationMinutes: 90,
    questionsCount: 100,
    markingScheme: '+2.00 Correct | -0.66 Negative',
    scheduleText: 'Last Tuesday of the Month (10:00 AM IST)',
    targetCategory: 'All-India General Studies Paper-1 & 2',
    syllabus: [
      { subject: 'Complete GS Core (Polity, History, Geo, Eco, Science)', questions: 70 },
      { subject: 'Quantitative CSAT & Critical Decision Making', questions: 30 },
    ],
    rewardMatrix: [
      { rank: 'Rank 1', grant: '₹35,000 Research Fellowship', perk: 'Physical Delhi Office Honor + Trophy' },
      { rank: 'Rank 2 – 3', grant: '₹15,000 Academic Fellowship', perk: 'Official Felicitation + TDS Certificate' },
      { rank: 'Rank 4 – 10', grant: '₹4,000 Educational Grant', perk: 'Certificate of National Distinction' },
      { rank: 'Rank 11 – 50', grant: '₹1,000 Prep Assistance', perk: 'Institutional Honor Roll Listing' },
    ],
  },
  {
    id: 'subject-deepdive',
    name: 'Subject Specialist Championship',
    nameHi: 'विषय विशेषज्ञ चैंपियनशिप',
    fee: 249,
    totalGrantPool: '₹1,50,000',
    totalSlots: 700,
    bookedSlots: 485,
    durationMinutes: 90,
    questionsCount: 100,
    markingScheme: '+2.00 Correct | -0.66 Negative',
    scheduleText: 'Bi-Monthly Dedicated Stream Window',
    targetCategory: 'Optional / Higher Science & Humanities',
    syllabus: [
      { subject: 'Organic, Inorganic & Physical Chemistry / Paper II', questions: 60 },
      { subject: 'Reaction Mechanisms & Spectroscopy Problem Solving', questions: 40 },
    ],
    rewardMatrix: [
      { rank: 'Rank 1', grant: '₹50,000 Specialization Fellowship', perk: 'In-Person Institutional Award + Memento' },
      { rank: 'Rank 2 – 5', grant: '₹15,000 Research Assistance', perk: 'TDS Certified Bank Transfer' },
      { rank: 'Rank 6 – 20', grant: '₹3,500 Advanced Study Grant', perk: 'Certificate of Scientific Excellence' },
      { rank: 'Rank 21 – 50', grant: '₹1,000 Resource Fellowship', perk: 'Merit List Publication' },
    ],
  },
  {
    id: 'quarterly-national',
    name: 'Quarterly National Talent Search',
    nameHi: 'त्रैमासिक राष्ट्रीय मेधा खोज',
    fee: 499,
    totalGrantPool: '₹3,00,000',
    totalSlots: 800,
    bookedSlots: 540,
    durationMinutes: 120,
    questionsCount: 120,
    markingScheme: '+2.00 Correct | -0.66 Negative',
    scheduleText: 'Quarterly Synchronized National Arena',
    targetCategory: 'National Aspirant Fellowship Cohort',
    syllabus: [
      { subject: 'Complete GS (Polity, History, Geo, Environment, Sci-Tech)', questions: 80 },
      { subject: 'Advanced Critical CSAT & Comprehension', questions: 40 },
    ],
    rewardMatrix: [
      { rank: 'Rank 1', grant: '₹1,00,000 Grand Fellowship', perk: 'Delhi HQ Honor + Year-Round Sponsorship' },
      { rank: 'Rank 2 – 5', grant: '₹25,000 Academic Fellowship', perk: 'National Trophy + Formal Video Feature' },
      { rank: 'Rank 6 – 25', grant: '₹5,000 Subject Fellowship', perk: 'Certificate of National Standing' },
      { rank: 'Rank 26 – 100', grant: '₹1,500 Preparation Assistance', perk: 'Abhyaas Fellowship Roll' },
    ],
  },
  {
    id: 'super-grand-yearly',
    name: 'Super Grand Independence/Republic Cup',
    nameHi: 'महा-ओलंपियाड राष्ट्रीय छात्रवृत्ति',
    fee: 1999,
    totalGrantPool: '₹25,00,000',
    totalSlots: 1500,
    bookedSlots: 920,
    durationMinutes: 150,
    questionsCount: 150,
    markingScheme: '+2.00 Correct | -0.66 Negative',
    scheduleText: '15th August & 26th January Synchronized Mega Arena',
    targetCategory: 'All-India Grand Educational Grant Arena',
    syllabus: [
      { subject: 'Full General Studies Civil Services Standard', questions: 100 },
      { subject: 'Advanced Quantitative Aptitude & Analytical Reasoning', questions: 50 },
    ],
    rewardMatrix: [
      { rank: 'Rank 1', grant: '₹10,00,000 Lifetime Study Grant', perk: 'Grand Delhi Convocation + Full Media Feature' },
      { rank: 'Rank 2 – 3', grant: '₹3,00,000 Research Fellowship', perk: 'National Gold Medallion + Legal Certificate' },
      { rank: 'Rank 4 – 10', grant: '₹50,000 Educational Grant', perk: 'TDS Verified Disbursal + Silver Plaque' },
      { rank: 'Rank 11 – 50', grant: '₹15,000 Preparation Assistance', perk: 'Direct Verified Bank Disbursal' },
      { rank: 'Rank 51 – 150', grant: '₹5,000 Merit Fellowship', perk: 'Merit Honor Certificate' },
    ],
  },
];

export default function OlympiadPage() {
  const [selectedTierId, setSelectedTierId] = useState('weekly-starter');
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Countdown timer simulation for next Sunday 10:00 AM
  const [timeLeft, setTimeLeft] = useState({ hours: 42, minutes: 18, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Form Fields
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [targetExam, setTargetExam] = useState('UPSC Civil Services (Prelims)');
  const [acceptIntegrityCode, setAcceptIntegrityCode] = useState(true);
  const [loading, setLoading] = useState(false);

  // Confirmed Admit Card State
  const [confirmedRegistration, setConfirmedRegistration] = useState<{
    rollNo: string;
    candidateName: string;
    tierTitle: string;
    examSlot: string;
    amount: number;
    paymentMethod: string;
  } | null>(null);

  const activeTier = OLYMPIAD_TIERS.find((t) => t.id === selectedTierId) || OLYMPIAD_TIERS[0];
  const fillPercentage = Math.round((activeTier.bookedSlots / activeTier.totalSlots) * 100);
  const isThresholdMet = fillPercentage >= 50;

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateEmail.trim() || candidatePhone.trim().length < 10) {
      alert('कृपया मान्य Name, Email और 10-अंकों का Mobile Number दर्ज करें।');
      return;
    }
    if (!acceptIntegrityCode) {
      alert('कृपया Mandatory Viva Verification एवं Academic Integrity Code स्वीकार करें।');
      return;
    }

    setLoading(true);

    try {
      const res = await createPaymentRecord({
        candidateName: candidateName.trim(),
        email: candidateEmail.trim().toLowerCase(),
        phone: candidatePhone.trim(),
        olympiadTier: activeTier.name,
        amount: activeTier.fee,
        paymentMethod: 'Razorpay UPI/Card',
      });

      if (res && res.success && res.rollNo) {
        setConfirmedRegistration({
          rollNo: res.rollNo,
          candidateName: candidateName.trim(),
          tierTitle: activeTier.name,
          examSlot: activeTier.scheduleText,
          amount: activeTier.fee,
          paymentMethod: 'Online Verified',
        });
        setShowRegisterModal(false);
      } else {
        alert('पंजीकरण सुरक्षित करने में समस्या आई। कृपया पुनः प्रयास करें।');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('सर्वर त्रुटि। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-blue-600 selection:text-white pb-28 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-50 text-amber-900 border border-amber-300/80 rounded-full text-[11px] font-black uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>National Merit Assessment &amp; Fellowship Arena</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                All-India Scholarship Olympiads
              </h1>
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                100% Pure Game of Skill • Merit Grant Disbursals • Mandatory 1-on-1 Viva Verification
              </p>
              <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Test your academic preparation against thousands of serious aspirants nationwide under strict anti-cheat proctoring. Secure national ranks, eliminate your educational financial burden, and earn verified study fellowships.
              </p>
            </div>

            {/* Countdown & Trust Matrix */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 text-center min-w-[170px] shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Next Arena Starts In</p>
                <div className="flex items-center justify-center gap-1.5 font-mono text-lg font-black mt-1 text-white">
                  <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
                  <span>:</span>
                  <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
                  <span>:</span>
                  <span className="text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                </div>
                <p className="text-[10px] text-emerald-400 font-bold mt-1">● Sunday Synchronized Slot</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center min-w-[160px] shadow-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Grants Awarded</p>
                <p className="text-lg font-black text-slate-900 mt-1">₹12.5 Lakhs+</p>
                <p className="text-[10px] text-blue-600 font-bold mt-1">Direct Bank / TDS Cleared</p>
              </div>
            </div>
          </div>

          {/* Tier Selection Pills */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-black uppercase text-slate-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Choose Assessment Tier &amp; Grant Pool
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {OLYMPIAD_TIERS.map((tier) => {
                const isSelected = tier.id === selectedTierId;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          ₹{tier.fee}
                        </span>
                        <Trophy className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
                      </div>
                      <h3 className="font-extrabold text-xs line-clamp-1">{tier.name}</h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100/20">
                      <p className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                        {tier.totalGrantPool}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Confirmed Admit Card Banner (If just registered) */}
        {confirmedRegistration && (
          <div className="max-w-3xl mx-auto bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1.5 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-black text-slate-900">Official Admit Card &amp; Seat Confirmed!</h2>
              <p className="text-xs text-slate-500">
                आपका डिजिटल परीक्षा प्रवेश पत्र (Roll Number) जारी कर दिया गया है।
              </p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Candidate Roll Number</span>
                  <p className="text-lg font-mono font-black text-white tracking-widest">{confirmedRegistration.rollNo}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold">
                  VERIFIED ADMISSION
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Candidate:</span>
                  <span className="font-bold text-white">{confirmedRegistration.candidateName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Tier:</span>
                  <span className="font-bold text-white">{confirmedRegistration.tierTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Slot Time:</span>
                  <span className="font-bold text-amber-400">{confirmedRegistration.examSlot}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Fee Paid:</span>
                  <span className="font-bold text-emerald-400">₹{confirmedRegistration.amount} ({confirmedRegistration.paymentMethod})</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save Admit Card</span>
              </button>

              <Link
                href={`/quiz?mode=olympiad&roll=${encodeURIComponent(confirmedRegistration.rollNo)}`}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Enter Test Arena</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* 50% Cohort Threshold Transparency Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Cohort Threshold Transparency (50% Rule)
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                isThresholdMet ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-800 border border-amber-300'
              }`}>
                {isThresholdMet ? 'THRESHOLD MET • ARENA CONFIRMED' : 'AWAITING 50% THRESHOLD'}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              To preserve academic statistical validity, a tournament requires minimum 50% capacity. If not achieved 2 hours before slot time, <strong>100% of registration fees are automatically refunded</strong> to source accounts.
            </p>
          </div>

          <div className="sm:w-64 shrink-0 space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex justify-between text-xs font-black">
              <span className="text-slate-700">{activeTier.bookedSlots} / {activeTier.totalSlots} Slots</span>
              <span className={fillPercentage >= 50 ? 'text-emerald-600' : 'text-amber-600'}>{fillPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  fillPercentage >= 50 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(fillPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Details, Rules & Reward Matrix (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Active Tier Overview */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md uppercase tracking-wide">
                    {activeTier.targetCategory}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {activeTier.name} ({activeTier.nameHi})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{activeTier.scheduleText}</span>
                  </p>
                </div>

                <button
                  onClick={() => setShowBlueprintModal(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Syllabus Blueprint</span>
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Questions</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{activeTier.questionsCount} MCQs</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Duration</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{activeTier.durationMinutes} Mins</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Marking Rule</p>
                  <p className="text-xs font-black text-slate-900 mt-0.5">+2.00 / -0.66</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Proctoring</p>
                  <p className="text-sm font-black text-blue-600 mt-0.5">Strict Screen-Lock</p>
                </div>
              </div>
            </div>

            {/* Grant & Fellowship Matrix Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Guaranteed Open Fellowship Matrix
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Allocated directly to verified student bank accounts post mandatory viva verification.
                  </p>
                </div>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 w-fit">
                  Gross Pool: {activeTier.totalGrantPool}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3 rounded-l-lg">All-India Rank</th>
                      <th className="py-3 px-3">Merit Grant Amount</th>
                      <th className="py-3 px-3 rounded-r-lg">Institutional Academic Perks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeTier.rewardMatrix.map((row, idx) => (
                      <tr key={idx} className={idx === 0 ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'}>
                        <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                          {idx === 0 && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                          {row.rank}
                        </td>
                        <td className="py-3.5 px-3 font-black text-blue-600 text-xs sm:text-sm">
                          {row.grant}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 font-medium">
                          {row.perk}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Anti-Cheating & 1-on-1 Viva Waterfall Charter */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 text-amber-400 font-black text-sm">
                <Video className="w-5 h-5" />
                <span>The Mandatory 1-on-1 Viva Verification Waterfall</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed font-medium">
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Objective Video Viva (3/5 Pass Rule)
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Within 24 hours of provisional rank declaration, top candidates and grant recipients attend a live 10-minute recorded Google Meet viva. Candidates must correctly answer at least 3 out of 5 conceptual questions drawn from the exam syllabus.
                  </p>
                </div>

                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Cascading &amp; 75% Baseline Cutoff
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    If a provisional ranker fails the viva or is caught using secondary devices, they are immediately disqualified. The grant cascades down to the next eligible rank holder who secured at least 75% in the written exam.
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/60 leading-relaxed">
                *High Grants (&gt;₹10,000): Candidates are invited to the Abhyaas office in Delhi for formal in-person felicitation, photo-identity verification, and grant check presentation. Applicable TDS is deducted under Section 194B/194BA with formal certificates issued.
              </p>
            </div>
          </div>

          {/* Right Column: Slot Registration Box (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Booking Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Assessment Slot Processing Fee</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-900">₹{activeTier.fee}</span>
                  <span className="text-xs text-slate-400 font-bold">per candidate</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Covers synchronized proctoring, live evaluation, and verified AI diagnostic report.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Synchronized All-India live window</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full-Screen lock &amp; DevTools prevention</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% automated refund if &lt;50% seats filled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct Fellowship Disbursal post-Viva</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Book Examination Slot (₹{activeTier.fee})</span>
                </button>

                <Link
                  href="/practice"
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>Practice Free Drills First</span>
                </Link>
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-tight">
                Protected under Article 19(1)(g) Game of Skill doctrine. 256-bit SSL encrypted payment checkout.
              </p>
            </div>

            {/* Circular Content Model Notice */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-3xl p-5 space-y-2 text-xs">
              <h4 className="font-black text-blue-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Circular Content Guarantee
              </h4>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                The 50 questions in this Olympiad are drawn from our secret Quarantined Vault. As soon as the competition window closes, these questions are permanently pushed into the <strong>100% Free Practice Bank</strong> for the entire nation.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL 1: REGISTRATION & ADMIT CARD FORM */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded uppercase">
                  Candidate Slot Booking
                </span>
                <h3 className="font-black text-base text-slate-900 mt-1">
                  {activeTier.name} (Processing Fee: ₹{activeTier.fee})
                </h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name (as on Government Photo ID)*</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email ID (for Official Admit Card &amp; Scorecard)*</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. rahul.sharma@gmail.com"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (for SMS Roll No &amp; Alerts)*</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={candidatePhone}
                    onChange={(e) => setCandidatePhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Target Examination Track</label>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-blue-600 cursor-pointer bg-slate-50"
                >
                  <option value="UPSC Civil Services (Prelims)">UPSC Civil Services (IAS / IPS)</option>
                  <option value="State PSC (UPPSC / BPSC / MPPCS)">State PSC (UPPSC / BPSC / MPPCS)</option>
                  <option value="Higher Chemistry / Science Olympiad">Higher Chemistry / Science Olympiad</option>
                  <option value="Class 11-12 Foundation">Class 11-12 Senior Foundation</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptIntegrityCode}
                    onChange={(e) => setAcceptIntegrityCode(e.target.checked)}
                    className="mt-0.5 text-blue-600 rounded cursor-pointer"
                  />
                  <span className="text-[11px] text-amber-950 font-medium leading-tight">
                    I agree to the <strong>Academic Integrity Code</strong>, acknowledge that grants are subject to clearing the <strong>1-on-1 Video Viva Verification</strong> with ≥75% written cutoff, and verify that my identity details are accurate.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>
                  {loading ? 'Confirming Admission...' : `Confirm Slot & Pay Processing Fee • ₹${activeTier.fee}`}
                </span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted 256-Bit SSL Checkout • Automatic Refund if &lt;50% Seats Filled</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SYLLABUS BLUEPRINT */}
      {showBlueprintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded uppercase">
                  Examination Blueprint
                </span>
                <h3 className="font-black text-base text-slate-900 mt-1">{activeTier.name}</h3>
              </div>
              <button
                onClick={() => setShowBlueprintModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                Official subject-wise question distribution for this assessment:
              </p>
              <div className="space-y-2">
                {activeTier.syllabus.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.subject}</span>
                    <span className="font-black text-blue-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      {item.questions} Qs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1 font-medium">
              <p className="font-black">Standard Marking Scheme:</p>
              <p className="text-[11px] leading-relaxed">
                +2.00 marks for correct answers. -0.66 marks deducted for incorrect attempts. 0 marks for unattempted questions. Top rankers must clear the viva with 3/5 correct answers to claim the grant.
              </p>
            </div>

            <button
              onClick={() => setShowBlueprintModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
            >
              Close Blueprint
            </button>
          </div>
        </div>
      )}

    </div>
  );
}