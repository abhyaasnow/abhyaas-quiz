'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Award, 
  ArrowRight, 
  Clock, 
  Sparkles,
  Users,
  Trophy,
  Zap,
  ShieldCheck,
  FileCheck2,
  BookMarked,
  Landmark,
  Building2,
  Briefcase,
  UserCheck,
  Train,
  Shield,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/db';

type MainTab = 'exams' | 'topics' | 'subjects';

interface SubCategory {
  id: string;
  name: string;
  icon: any;
  colorBg?: string;
}

export default function MegaOlympiadBanner() {
  const [activeTab, setActiveTab] = useState<MainTab>('exams');
  const [activeSubCat, setActiveSubCat] = useState('Civil Services');

  // Dynamic Settings from Firebase
  const [settings, setSettings] = useState<SiteSettings>({
    bannerTitleHi: 'राष्ट्रीय राज्यव्यवस्था ओलंपियाड : संवैधानिक ढांचा',
    bannerTitleEn: 'National Polity Olympiad : Constitutional Framework & Preamble',
    scholarshipPool: '₹50,000',
    assessmentFee: '₹49',
    bannerGraphicUrl: null,
  });

  useEffect(() => {
    async function fetchBannerConfig() {
      const data = await getSiteSettings();
      if (data) {
        setSettings(prev => ({
          ...prev,
          bannerTitleHi: data.bannerTitleHi || prev.bannerTitleHi,
          bannerTitleEn: data.bannerTitleEn || prev.bannerTitleEn,
          scholarshipPool: data.scholarshipPool || prev.scholarshipPool,
          assessmentFee: data.assessmentFee || prev.assessmentFee,
          bannerGraphicUrl: data.bannerGraphicUrl || null,
        }));
      }
    }
    fetchBannerConfig();
  }, []);

  // Live Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 59, seconds: 58 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. EXAMS Subcategories (Matching Screenshot with circular badges)
  const examSubCategories: SubCategory[] = [
    { id: 'civil', name: 'Civil Services', icon: Landmark, colorBg: 'bg-amber-100 text-amber-800' },
    { id: 'ssc', name: 'SSC Exams', icon: Briefcase, colorBg: 'bg-blue-100 text-blue-800' },
    { id: 'banking', name: 'Banking Exams', icon: Building2, colorBg: 'bg-cyan-100 text-cyan-800' },
    { id: 'teaching', name: 'Teaching Exams', icon: UserCheck, colorBg: 'bg-emerald-100 text-emerald-800' },
    { id: 'railway', name: 'Railway Exams', icon: Train, colorBg: 'bg-indigo-100 text-indigo-800' },
    { id: 'defense', name: 'Defense & Police', icon: Shield, colorBg: 'bg-rose-100 text-rose-800' },
  ];

  // 2. TOPICS Subcategories
  const topicSubCategories: SubCategory[] = [
    { id: 'preamble', name: 'Preamble & Philosophy', icon: BookMarked, colorBg: 'bg-amber-100 text-amber-800' },
    { id: 'fr', name: 'Fundamental Rights (Art 12-35)', icon: ShieldCheck, colorBg: 'bg-blue-100 text-blue-800' },
    { id: 'panchayat', name: 'Panchayati Raj (73rd Amend)', icon: Landmark, colorBg: 'bg-emerald-100 text-emerald-800' },
    { id: 'dpsp', name: 'DPSP & Fundamental Duties', icon: Layers, colorBg: 'bg-purple-100 text-purple-800' },
    { id: 'parliament', name: 'Parliament & Legislation', icon: Building2, colorBg: 'bg-indigo-100 text-indigo-800' },
  ];

  // 3. SUBJECTS Subcategories
  const subjectSubCategories: SubCategory[] = [
    { id: 'polity', name: 'Indian Polity & Constitution', icon: Landmark, colorBg: 'bg-blue-100 text-blue-800' },
    { id: 'history', name: 'Modern Indian History', icon: BookMarked, colorBg: 'bg-amber-100 text-amber-800' },
    { id: 'economy', name: 'Economy & Budget', icon: Building2, colorBg: 'bg-emerald-100 text-emerald-800' },
    { id: 'geography', name: 'Geography & Ecology', icon: Layers, colorBg: 'bg-cyan-100 text-cyan-800' },
    { id: 'csat', name: 'CSAT Aptitude & Logic', icon: Zap, colorBg: 'bg-purple-100 text-purple-800' },
  ];

  const currentSubCategories = 
    activeTab === 'exams' ? examSubCategories :
    activeTab === 'topics' ? topicSubCategories : subjectSubCategories;

  return (
    <div className="w-full">
      
      {/* ================= 1. TOP BLUE BAR WITH 3 BIG BUTTONS ================= */}
      <div className="bg-[#14536f] py-4 px-4 sm:px-6 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3 sm:gap-6 overflow-x-auto scrollbar-none py-1">
          
          {/* BUTTON 1: EXAMS */}
          <button
            onClick={() => {
              setActiveTab('exams');
              setActiveSubCat('Civil Services');
            }}
            className={`flex items-center gap-2.5 sm:gap-3.5 px-6 sm:px-9 py-2.5 sm:py-3.5 rounded-full font-black text-sm sm:text-lg transition-all duration-150 cursor-pointer shadow-lg whitespace-nowrap ${
              activeTab === 'exams'
                ? 'bg-[#0077b6] text-white border-2 border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] scale-105'
                : 'bg-white text-slate-900 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <FileCheck2 className={`w-6 h-6 sm:w-7 sm:h-7 ${activeTab === 'exams' ? 'text-white' : 'text-slate-800'}`} />
            <span>Exams</span>
          </button>

          {/* BUTTON 2: TOPICS */}
          <button
            onClick={() => {
              setActiveTab('topics');
              setActiveSubCat('Preamble & Philosophy');
            }}
            className={`flex items-center gap-2.5 sm:gap-3.5 px-6 sm:px-9 py-2.5 sm:py-3.5 rounded-full font-black text-sm sm:text-lg transition-all duration-150 cursor-pointer shadow-lg whitespace-nowrap ${
              activeTab === 'topics'
                ? 'bg-[#0077b6] text-white border-2 border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] scale-105'
                : 'bg-white text-slate-900 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <div className="flex items-center">
              <BookMarked className={`w-6 h-6 sm:w-7 sm:h-7 ${activeTab === 'topics' ? 'text-white' : 'text-slate-800'}`} />
            </div>
            <span>Topics</span>
          </button>

          {/* BUTTON 3: SUBJECTS */}
          <button
            onClick={() => {
              setActiveTab('subjects');
              setActiveSubCat('Indian Polity & Constitution');
            }}
            className={`flex items-center gap-2.5 sm:gap-3.5 px-6 sm:px-9 py-2.5 sm:py-3.5 rounded-full font-black text-sm sm:text-lg transition-all duration-150 cursor-pointer shadow-lg whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'bg-[#0077b6] text-white border-2 border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] scale-105'
                : 'bg-white text-slate-900 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            <span className={`text-xl sm:text-2xl font-black font-serif leading-none ${activeTab === 'subjects' ? 'text-white' : 'text-slate-900'}`}>
              अ
            </span>
            <span>Subjects</span>
          </button>

        </div>
      </div>

      {/* ================= 2. WHITE SUBCATEGORIES STRIP (PILL BADGES) ================= */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none">
          {currentSubCategories.map((sub) => {
            const isSelected = activeSubCat === sub.name;
            const IconComponent = sub.icon;

            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubCat(sub.name)}
                className={`flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-white border-2 border-blue-600 text-blue-700 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-[#dedede] hover:bg-[#d3d3d3] border border-slate-400 text-slate-800 shadow-sm'
                }`}
              >
                {/* Circular Icon on the Left */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
                }`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 3. MAIN DARK MEGA OLYMPIAD HERO CARD ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10">
        <div className="bg-gradient-to-b from-[#0b1329] via-[#0f172a] to-[#080d1a] border border-slate-700/80 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden space-y-8">
          
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Badges & Live Countdown */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wide">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                ALL-INDIA MERIT OLYMPIAD
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
                <Award className="w-4 h-4" />
                {settings.scholarshipPool} Institutional Fellowship Pool
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                100% Proctored Academic Skill
              </span>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-2xl shadow-inner self-start md:self-auto">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                STARTS IN:
              </span>
              <div className="flex items-center gap-1 font-mono font-black text-sm sm:text-base">
                <span className="text-white px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span className="text-amber-400">:</span>
                <span className="text-white px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span className="text-amber-400">:</span>
                <span className="text-amber-400 px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Titles */}
          <div className="relative z-10 space-y-2.5 max-w-4xl">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-amber-400 leading-tight">
              {settings.bannerTitleHi}
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-slate-200 leading-snug">
              {settings.bannerTitleEn}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed pt-1">
              अखिल भारतीय मेधावी मूल्यांकन परीक्षा • Selected Domain: <strong className="text-white">{activeSubCat}</strong>. All-India Percentile Standings &amp; Verified Academic Research Grants.
            </p>
          </div>

          {/* Registration Progress */}
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                380 / 500 Candidates Registered (पंजीकृत स्लॉट्स)
              </span>
              <span className="text-amber-400 font-bold">76% Filled (Closing Soon)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/50">
              <div className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-amber-500 w-[76%] rounded-full shadow-md" />
            </div>
          </div>

          {/* 3 Main Action Cards */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              
              {/* Button 1: Register Slot */}
              <Link
                href="/olympiad"
                className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-base sm:text-lg">
                  <Zap className="w-5 h-5 text-slate-950 fill-slate-950 group-hover:scale-110 transition-transform" />
                  <span>Register Slot • {settings.assessmentFee}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="text-xs font-extrabold text-slate-900/80">
                  प्रवेश पंजीकरण एवं रोल नंबर (Admit Card)
                </span>
              </Link>

              {/* Button 2: Daily Speed Drill */}
              <Link
                href="/quiz"
                className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-black shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span>Daily Free Speed Drill</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="text-xs font-semibold text-blue-100/90">
                  24x7 निशुल्क स्पीड टेस्ट (All Subjects)
                </span>
              </Link>

              {/* Button 3: Rankings */}
              <Link
                href="/leaderboard"
                className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-black shadow-xl shadow-emerald-600/20 hover:shadow-2xl hover:shadow-emerald-600/40 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-base sm:text-lg">
                  <Trophy className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span>Rankings &amp; Merit Board</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="text-xs font-semibold text-emerald-100/90">
                  राष्ट्रीय मेधा सूची एवं छात्रवृत्ति विवरण
                </span>
              </Link>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}