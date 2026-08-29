'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Trophy, Award, Calendar, Clock, 
  Users, CheckCircle2, ShieldAlert, ArrowRight, 
  Sparkles, Lock, GraduationCap, Plane, AlertTriangle, ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import OlympiadModal from '../components/OlympiadModal';

interface OlympiadTier {
  id: string;
  tierType: 'weekly' | 'monthly' | 'quarterly' | 'six_months' | 'annual';
  badgeHi: string;
  badgeEn: string;
  titleHi: string;
  titleEn: string;
  highlightReward: string;
  specialPerk?: string;
  eligibilityCriteria?: string;
  date: string;
  time: string;
  fee: number;
  duration: string;
  questions: number;
  registeredCount: number;
  maxSlots: number;
  featured?: boolean;
  vipTier?: boolean;
}

const olympiadCatalog: OlympiadTier[] = [
  {
    id: 'oly-weekly-1',
    tierType: 'weekly',
    badgeHi: 'साप्ताहिक विषय टेस्ट',
    badgeEn: 'WEEKLY SUBJECT DRILL',
    titleHi: 'राष्ट्रीय राजव्यवस्था ओलंपियाड: संवैधानिक ढांचा',
    titleEn: 'National Polity Olympiad: Constitutional Framework',
    highlightReward: '₹50,000 Academic Grants Pool',
    date: 'Upcoming Sunday',
    time: '11:00 AM IST',
    fee: 49,
    duration: '45 Mins',
    questions: 50,
    registeredCount: 380,
    maxSlots: 500,
  },
  {
    id: 'oly-monthly-1',
    tierType: 'monthly',
    badgeHi: 'मासिक प्रीलिम्स चैंपियनशिप',
    badgeEn: 'MONTHLY GRAND CHAMPIONSHIP',
    titleHi: 'अखिल भारतीय प्रीलिम्स मेगा मॉक (GS Paper 1 Full Syllabus)',
    titleEn: 'All-India Prelims Grand Mock (GS Paper 1 Full Syllabus)',
    highlightReward: '₹1,50,000 Grants Pool + Silver Medals',
    date: 'Last Sunday of Month',
    time: '10:00 AM - 11:30 AM',
    fee: 99,
    duration: '90 Mins',
    questions: 100,
    registeredCount: 1420,
    maxSlots: 2000,
  },
  {
    id: 'oly-quarterly-1',
    tierType: 'quarterly',
    badgeHi: 'त्रैमासिक राष्ट्रीय मूल्यांकन',
    badgeEn: 'QUARTERLY NATIONAL BENCHMARK',
    titleHi: 'राष्ट्रीय सिविल सेवा त्रैमासिक प्रीलिम्स असेसमेंट',
    titleEn: 'National Civil Services Quarterly Prelims Assessment',
    highlightReward: '₹3,50,000 Grants + Mentorship Cohort',
    date: 'End of Q2 (June 2026)',
    time: '09:30 AM - 11:30 AM',
    fee: 199,
    duration: '120 Mins',
    questions: 100,
    registeredCount: 3100,
    maxSlots: 5000,
  },
  {
    id: 'oly-sixmonths-fellowship',
    tierType: 'six_months',
    badgeHi: '6-महीने का ग्लोबल स्कॉलरशिप टेस्ट',
    badgeEn: '6-MONTHS GLOBAL FELLOWSHIP',
    titleHi: 'अभ्यास ग्लोबल स्कॉलर फेलोशिप परीक्षा (100% Sponsored)',
    titleEn: 'Abhyaas Global Scholar Fellowship (100% Course Sponsorship)',
    highlightReward: 'Full 100% Institution Sponsorship + ₹2,00,000 Research Grant',
    specialPerk: '🎓 Rank 1: Full Course fees funded at Premier Indian/Global Institution by Abhyaas',
    eligibilityCriteria: 'Eligibility: Minimum 3 previous weekly/monthly Olympiads with ≥70% score, or verified academic credentials.',
    date: 'Semi-Annual Special (July 2026)',
    time: '10:00 AM - 12:30 PM',
    fee: 399,
    duration: '150 Mins',
    questions: 120,
    registeredCount: 6800,
    maxSlots: 10000,
    featured: true,
    vipTier: true,
  },
  {
    id: 'oly-annual-mega',
    tierType: 'annual',
    badgeHi: 'वार्षिक भारत महा-चैंपियनशिप',
    badgeEn: 'ANNUAL BHARAT MEGA CHAMPIONSHIP',
    titleHi: 'अखिल भारतीय महा-परीक्षा (The Grand Annual Examination)',
    titleEn: 'All-India Grand Annual Civil Services Championship',
    highlightReward: '₹10,00,000 Mega Grant Pool + National Felicitation',
    specialPerk: '🏆 Top 10 Scholars: National Media Recognition + Annual Preparation Stipend',
    date: 'Annual Grand Day (December 2026)',
    time: '10:00 AM - 01:00 PM',
    fee: 499,
    duration: '180 Mins',
    questions: 150,
    registeredCount: 14500,
    maxSlots: 25000,
    featured: true,
  },
];

export default function OlympiadHub() {
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredList = olympiadCatalog.filter((item) => {
    if (selectedTier === 'all') return true;
    return item.tierType === selectedTier;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* 1. Header Navbar */}
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home Feed</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              राष्ट्रीय छात्रवृत्ति ओलंपियाड <span className="text-amber-500">| Olympiad Tiers Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              High-stakes All-India academic examinations with verified Merit Grants & Institutional Sponsorships.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl w-fit">
            <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-900 block">Total Annual Grants</span>
              <span className="text-xs sm:text-sm font-black text-amber-950">₹25,00,000+ Merit Pool</span>
            </div>
          </div>
        </div>

        {/* 2. Strict Examination Proctoring & Integrity Banner */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Strict National Proctoring & Anti-Cheating Protocol (सख्त परीक्षा नियम)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Zero Tolerance Integrity
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Full-Screen Lockdown:</strong>
                <span>Tab switch / Window minimizing triggers automatic submission after 2 warnings.</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">No-Back / Exit Policy:</strong>
                <span>Once the assessment begins, candidates cannot pause or re-enter the live arena.</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Verified e-KYC Disbursement:</strong>
                <span>Scholarships & Grants are disbursed strictly after Aadhaar & Roll No verification.</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Horizontal Tier Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Tiers (सभी टेस्ट)' },
            { id: 'weekly', label: 'Weekly (साप्ताहिक • ₹49)' },
            { id: 'monthly', label: 'Monthly (मासिक • ₹99)' },
            { id: 'quarterly', label: 'Quarterly (त्रैमासिक • ₹199)' },
            { id: 'six_months', label: '🎓 6-Months Global Fellowship' },
            { id: 'annual', label: '👑 Annual Mega (₹499)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTier(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                selectedTier === tab.id
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. Olympiad Cards Grid */}
        <div className="space-y-4">
          {filteredList.map((item) => {
            const fillPct = Math.round((item.registeredCount / item.maxSlots) * 100);

            return (
              <div
                key={item.id}
                className={`rounded-3xl p-5 sm:p-7 border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden ${
                  item.vipTier
                    ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border-purple-800/60 shadow-xl ring-2 ring-purple-500/20'
                    : item.featured
                    ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border-blue-900 shadow-lg'
                    : 'bg-white text-slate-900 border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Glow for VIP Tier */}
                {item.vipTier && (
                  <div className="absolute -right-16 -top-16 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
                )}

                {/* Left Column: Details */}
                <div className="space-y-3 flex-1 relative z-10">
                  
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.vipTier
                        ? 'bg-gradient-to-r from-purple-500 to-amber-400 text-slate-950 font-black'
                        : item.featured
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {item.badgeEn} | {item.badgeHi}
                    </span>

                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.featured || item.vipTier
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      <Award className="w-3 h-3" />
                      {item.highlightReward}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-base sm:text-xl font-black leading-snug">
                      {item.titleHi}
                    </h2>
                    <p className={`text-xs sm:text-sm font-semibold mt-0.5 ${
                      item.featured || item.vipTier ? 'text-blue-200/90' : 'text-slate-500'
                    }`}>
                      {item.titleEn}
                    </p>
                  </div>

                  {/* Special Perk for 6-Month Global Fellowship */}
                  {item.specialPerk && (
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-1">
                      <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                        <span>{item.specialPerk}</span>
                      </div>
                      {item.eligibilityCriteria && (
                        <p className="text-[11px] text-purple-200 font-medium">
                          {item.eligibilityCriteria}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Exam Schedule & Pattern */}
                  <div className={`flex flex-wrap items-center gap-3 sm:gap-4 text-xs ${
                    item.featured || item.vipTier ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {item.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {item.time}
                    </span>
                    <span>•</span>
                    <span>{item.questions} MCQs ({item.duration})</span>
                  </div>

                  {/* Slot Progress */}
                  <div className="space-y-1 max-w-sm pt-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className={item.featured || item.vipTier ? 'text-blue-300' : 'text-slate-600'}>
                        <Users className="w-3 h-3 inline mr-1" />
                        {item.registeredCount.toLocaleString()} / {item.maxSlots.toLocaleString()} Seats Reserved
                      </span>
                      <span className="text-amber-400">{fillPct}% Filled</span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                      item.featured || item.vipTier ? 'bg-slate-950/60' : 'bg-slate-100'
                    }`}>
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Right Column: Fee & Registration Button */}
                <div className={`flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 p-4 rounded-2xl w-full lg:w-60 flex-shrink-0 relative z-10 ${
                  item.featured || item.vipTier ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'
                }`}>
                  <div className="text-left lg:text-center">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                      Assessment Registration
                    </span>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl sm:text-3xl font-black">₹{item.fee}</span>
                      <span className="text-[10px] text-slate-400">One-time</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 lg:w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>RESERVE SEAT • पंजीयन</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[10px] text-slate-400 text-center block">
                    Limited Seats • Strict Entry
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* 5. Footer & Bottom Bar */}
      <Footer />
      <BottomNav />

      {/* Registration Modal */}
      <OlympiadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}