'use client';

import React, { useState } from 'react';
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
  BookOpen
} from 'lucide-react';

interface OlympiadTier {
  id: string;
  name: string;
  nameHi: string;
  fee: number;
  totalGrantPool: string;
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
    id: 'weekly-sprint',
    name: 'Weekly Speed Sprint',
    nameHi: 'साप्ताहिक स्पीड स्प्रिंट',
    fee: 49,
    totalGrantPool: '₹15,000',
    durationMinutes: 45,
    questionsCount: 50,
    markingScheme: '+2.00 Correct | -0.66 Negative',
    scheduleText: 'Every Sunday at 11:00 AM IST',
    targetCategory: 'UPSC CSE & State PSC Prelims GS',
    syllabus: [
      { subject: 'Indian Polity & Constitution (भारतीय राजव्यवस्था)', questions: 15 },
      { subject: 'Modern Indian History (आधुनिक भारत का इतिहास)', questions: 15 },
      { subject: 'Indian Economy & Macroeconomics (अर्थव्यवस्था)', questions: 10 },
      { subject: 'Current Affairs & National Events (समसामयिकी)', questions: 10 },
    ],
    rewardMatrix: [
      { rank: 'Rank 1', grant: '₹5,000 Direct Fellowship', perk: 'National Merit Certificate + 1-on-1 Mentorship' },
      { rank: 'Rank 2 – 5', grant: '₹1,500 Book & Prep Grant', perk: 'Certificate of Academic Excellence' },
      { rank: 'Rank 6 – 20', grant: '₹500 Subject Module Grant', perk: 'Merit Performance Badge' },
      { rank: 'All Participants', grant: 'AI Diagnostic Report', perk: 'Personalized Weak-Area Analysis & Solutions' },
    ],
  },
  {
    id: 'monthly-mega',
    name: 'Monthly Mega Assessment',
    nameHi: 'मासिक मेगा ओलंपियाड',
    fee: 199,
    totalGrantPool: '₹1,00,000',
    durationMinutes: 90,
    questionsCount: 100,
    markingScheme: '+2.00 Correct | -0.66 Negative',
    scheduleText: 'Last Sunday of the Month (10:00 AM IST)',
    targetCategory: 'All-India General Studies & CSAT',
    syllabus: [
      { subject: 'General Studies Paper-1 Comprehensive', questions: 60 },
      { subject: 'Quantitative Aptitude & CSAT Logic', questions: 25 },
      { subject: 'Annual Current Affairs & Budget/Survey', questions: 15 },
    ],
    rewardMatrix: [
      { rank: 'Rank 1', grant: '₹25,000 Research Fellowship', perk: 'National Gold Medal + Hardcopy Certificate' },
      { rank: 'Rank 2 – 3', grant: '₹10,000 Academic Grant', perk: 'Silver Merit Medal + Test Series Access' },
      { rank: 'Rank 4 – 10', grant: '₹3,000 Educational Grant', perk: 'Certificate of National Distinction' },
      { rank: 'Rank 11 – 50', grant: '₹1,000 Preparation Voucher', perk: 'Merit Honor Roll Listing' },
    ],
  },
  {
    id: 'quarterly-talent',
    name: 'Quarterly Talent Search',
    nameHi: 'त्रैमासिक मेधा खोज',
    fee: 399,
    totalGrantPool: '₹2,50,000',
    durationMinutes: 120,
    questionsCount: 120,
    markingScheme: '+2.00 Correct | -0.66 Negative',
    scheduleText: 'Quarterly Mega Window (Live Synchronized)',
    targetCategory: 'National Aspirant Fellowship Grant',
    syllabus: [
      { subject: 'Complete GS Syllabus (Polity, History, Geo, Eco, Env)', questions: 80 },
      { subject: 'Advanced CSAT & Critical Reasoning', questions: 40 },
    ],
    rewardMatrix: [
      { rank: 'Rank 1', grant: '₹50,000 Grand Fellowship', perk: 'National Trophy + Annual Coaching Sponsorship' },
      { rank: 'Rank 2 – 5', grant: '₹20,000 Academic Fellowship', perk: 'National Silver Honor + Resource Pack' },
      { rank: 'Rank 6 – 25', grant: '₹5,000 Subject Grant', perk: 'Certificate of Distinction' },
      { rank: 'Rank 26 – 100', grant: '₹1,000 Prep Assistance', perk: 'Merit Roll of Honor' },
    ],
  },
];

export default function OlympiadPage() {
  const [selectedTierId, setSelectedTierId] = useState('weekly-sprint');
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);

  const activeTier = OLYMPIAD_TIERS.find((t) => t.id === selectedTierId) || OLYMPIAD_TIERS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white pb-24">
      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Award className="w-4 h-4 text-amber-600" />
                <span>National Academic Merit Assessment Program</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                All-India Scholarship Olympiads
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                अखिल भारतीय मेधा छात्रवृत्ति ओलंपियाड • 100% Pure Academic Skill
              </p>
              <p className="mt-3 text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Test your competitive exam readiness against thousands of serious aspirants nationwide under strict proctoring. Secure national percentile ranks and direct academic research fellowship grants.
              </p>
            </div>

            {/* Quick Trust Cards */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Live Sprint</p>
                <p className="text-sm sm:text-base font-black text-blue-600 mt-0.5">Sunday 11 AM</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">● Registrations Open</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Grants Distributed</p>
                <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">₹10 Lakhs+</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Direct Bank / UPI</p>
              </div>
            </div>
          </div>

          {/* Tier Tabs */}
          <div className="mt-10 grid sm:grid-cols-3 gap-3">
            {OLYMPIAD_TIERS.map((tier) => {
              const isSelected = tier.id === selectedTierId;
              return (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`p-4 sm:p-5 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 ring-2 ring-blue-600'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      Processing Fee: ₹{tier.fee}
                    </span>
                    <Trophy className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`} />
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base">{tier.name}</h3>
                  <p className={`text-xs mt-0.5 font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {tier.nameHi}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100/20 flex items-center justify-between text-xs font-semibold">
                    <span className={isSelected ? 'text-blue-100' : 'text-slate-500'}>Grant Pool:</span>
                    <span className={`font-black ${isSelected ? 'text-white text-sm' : 'text-slate-900'}`}>{tier.totalGrantPool}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Details of Active Tier */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Test Overview & Transparent Reward Matrix (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Active Tier Overview Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md uppercase tracking-wide">
                    {activeTier.targetCategory}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                    {activeTier.name} ({activeTier.nameHi})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{activeTier.scheduleText}</span>
                  </p>
                </div>

                <button
                  onClick={() => setShowBlueprintModal(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Syllabus Blueprint</span>
                </button>
              </div>

              {/* Quick Specs 4-Box Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Questions</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{activeTier.questionsCount} MCQs</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Duration</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{activeTier.durationMinutes} Minutes</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Marking</p>
                  <p className="text-xs font-black text-slate-900 mt-0.5">+2.00 / -0.66</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Medium</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">Bilingual</p>
                </div>
              </div>
            </div>

            {/* Transparent Reward & Fellowship Matrix Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Transparent Academic Grant Matrix
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fixed merit allocations disbursed directly to verified candidate accounts.
                  </p>
                </div>
                <Link
                  href="/scholarship-rules"
                  className="text-xs text-blue-600 font-semibold hover:underline hidden sm:block"
                >
                  Tie-Breaker Rules →
                </Link>
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
                      <tr key={idx} className={idx === 0 ? 'bg-amber-50/50' : 'hover:bg-slate-50/60'}>
                        <td className="py-3.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                          {idx === 0 && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                          {row.rank}
                        </td>
                        <td className="py-3.5 px-3 font-black text-blue-600 text-xs sm:text-sm">
                          {row.grant}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {row.perk}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 100% Value Guarantee Card (Crucial Legal & Conversion Anchor) */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Guaranteed Educational Value for Every Participant
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Even if you do not secure a top scholarship rank, your registration fee covers real analytical service: you receive a comprehensive <strong>AI Sectional Diagnostic Report</strong> (accuracy %, time spent per question, weak topics) and <strong>full step-by-step Hindi/English question solutions</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Registration CTA & Anti-Cheat Notice (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Slot Booking Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-xs text-slate-400 font-semibold uppercase">Assessment Processing Fee</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-900">₹{activeTier.fee}</span>
                  <span className="text-xs text-slate-400">per candidate</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Includes cloud testing slot, evaluation &amp; scorecard.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Synchronized All-India live window</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Automated AI anti-cheat monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Instant provisional scorecard release</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href={`/quiz?tier=${activeTier.id}`}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Register Examination Slot (₹{activeTier.fee})</span>
                </Link>

                <Link
                  href="/quiz"
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>Try Free Practice Drill First</span>
                </Link>
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-tight">
                Non-refundable once exam starts. Powered by RBI-approved 256-bit encrypted gateways.
              </p>
            </div>

            {/* Anti-Cheating & Fair Play Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Anti-Cheat Integrity Code
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                The test environment continuously monitors tab-switching, devtools inspection, and copy-paste shortcuts. Candidates exceeding 3 security warnings are auto-submitted and forfeited from scholarship claims.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus Blueprint Modal */}
      {showBlueprintModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                  Examination Blueprint
                </span>
                <h3 className="font-black text-lg text-slate-900 mt-1">{activeTier.name}</h3>
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
                Subject-wise question allocation for this assessment:
              </p>
              <div className="space-y-2">
                {activeTier.syllabus.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.subject}</span>
                    <span className="font-black text-blue-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                      {item.questions} Qs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <p className="font-bold">Marking Scheme Rule:</p>
              <p className="text-[11px] leading-relaxed">
                +2.00 marks for correct answers. -0.66 marks deducted for incorrect attempts. 0 marks for unattempted questions.
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