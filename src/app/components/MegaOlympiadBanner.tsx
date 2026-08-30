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
  Globe 
} from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/db';

type MainTab = 'exams' | 'topics' | 'subjects';

interface SubCategory {
  id: string;
  nameHi: string;
  nameEn: string;
  icon: any;
}

export default function MegaOlympiadBanner() {
  const [currentLang, setCurrentLang] = useState<'hi' | 'en'>('hi');
  const [activeTab, setActiveTab] = useState<MainTab>('exams');
  const [activeSubCatId, setActiveSubCatId] = useState('civil');

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

  // Live Synchronized Countdown Timer (1h 59m 58s)
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

  // 1. EXAMS Subcategories
  const examSubCategories: SubCategory[] = [
    { id: 'civil', nameHi: 'सिविल सर्विसेज (IAS / IPS)', nameEn: 'Civil Services (IAS/IPS)', icon: Landmark },
    { id: 'ssc', nameHi: 'एसएससी परीक्षाएं (CGL / CHSL)', nameEn: 'SSC Exams (CGL/CHSL)', icon: Briefcase },
    { id: 'banking', nameHi: 'बैंकिंग परीक्षाएं (IBPS / SBI)', nameEn: 'Banking Exams (IBPS/SBI)', icon: Building2 },
    { id: 'teaching', nameHi: 'शिक्षक भर्ती (TET / CTET)', nameEn: 'Teaching Exams (TET/CTET)', icon: UserCheck },
    { id: 'railway', nameHi: 'रेलवे भर्ती (RRB NTPC)', nameEn: 'Railway Exams (RRB NTPC)', icon: Train },
    { id: 'defense', nameHi: 'डिफेंस एवं पुलिस (NDA / CDS)', nameEn: 'Defense & Police', icon: Shield },
  ];

  // 2. TOPICS Subcategories
  const topicSubCategories: SubCategory[] = [
    { id: 'preamble', nameHi: 'प्रस्तावना एवं दार्शनिक ढांचा', nameEn: 'Preamble & Philosophy', icon: BookMarked },
    { id: 'fr', nameHi: 'मौलिक अधिकार (अनुच्छेद 12-35)', nameEn: 'Fundamental Rights (Art 12-35)', icon: ShieldCheck },
    { id: 'panchayat', nameHi: 'पंचायती राज (73वां संशोधन)', nameEn: 'Panchayati Raj (73rd Amend)', icon: Landmark },
    { id: 'dpsp', nameHi: 'नीति निदेशक तत्व एवं कर्तव्य', nameEn: 'DPSP & Fundamental Duties', icon: Layers },
    { id: 'parliament', nameHi: 'संसद एवं विधायी प्रक्रिया', nameEn: 'Parliament & Legislation', icon: Building2 },
  ];

  // 3. SUBJECTS Subcategories
  const subjectSubCategories: SubCategory[] = [
    { id: 'polity', nameHi: 'भारतीय राजव्यवस्था एवं संविधान', nameEn: 'Indian Polity & Constitution', icon: Landmark },
    { id: 'history', nameHi: 'आधुनिक भारत का इतिहास', nameEn: 'Modern Indian History', icon: BookMarked },
    { id: 'economy', nameHi: 'भारतीय अर्थव्यवस्था एवं बजट', nameEn: 'Economy & Union Budget', icon: Building2 },
    { id: 'geography', nameHi: 'भूगोल एवं पर्यावरण पारिस्थितिकी', nameEn: 'Geography & Ecology', icon: Layers },
    { id: 'csat', nameHi: 'सीसैट एवं तार्किक योग्यता', nameEn: 'CSAT Aptitude & Logic', icon: Zap },
  ];

  const currentSubCategories = 
    activeTab === 'exams' ? examSubCategories :
    activeTab === 'topics' ? topicSubCategories : subjectSubCategories;

  const activeSubCatObj = currentSubCategories.find(s => s.id === activeSubCatId) || currentSubCategories[0];

  return (
    <div className="w-full bg-[#080d1a] border-b border-slate-800">
      
      {/* ================= 1. TOP BAR: 3 PILL SWITCHERS + BILINGUAL SWITCHER ================= */}
      <div className="bg-[#0b1329] border-b border-slate-800/80 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* 3 Main Pill Buttons: Exams / Topics / Subjects */}
          <div className="flex items-center gap-2 p-1 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-inner">
            
            {/* Tab 1: Exams */}
            <button
              onClick={() => {
                setActiveTab('exams');
                setActiveSubCatId('civil');
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-1 ring-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Exams</span>
            </button>

            {/* Tab 2: Topics */}
            <button
              onClick={() => {
                setActiveTab('topics');
                setActiveSubCatId('preamble');
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${
                activeTab === 'topics'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-1 ring-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>Topics</span>
            </button>

            {/* Tab 3: Subjects */}
            <button
              onClick={() => {
                setActiveTab('subjects');
                setActiveSubCatId('polity');
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer ${
                activeTab === 'subjects'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-1 ring-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="font-serif font-black text-base leading-none">अ</span>
              <span>Subjects</span>
            </button>

          </div>

          {/* Bilingual Switcher (हिन्दी / English) */}
          <div className="flex items-center gap-2 text-xs font-bold bg-slate-900 border border-slate-700/80 px-3.5 py-1.5 rounded-2xl shadow-inner text-white">
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">माध्यम / Language:</span>
            <button
              onClick={() => setCurrentLang('hi')}
              className={`px-3 py-1 rounded-xl transition cursor-pointer font-black ${
                currentLang === 'hi' 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setCurrentLang('en')}
              className={`px-3 py-1 rounded-xl transition cursor-pointer font-black ${
                currentLang === 'en' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

        </div>
      </div>

      {/* ================= 2. CAPSULE SUBCATEGORIES STREAM ================= */}
      <div className="bg-[#0f172a] border-b border-slate-800 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5 overflow-x-auto scrollbar-none">
          {currentSubCategories.map((sub) => {
            const isSelected = activeSubCatId === sub.id;
            const IconComponent = sub.icon;
            const label = currentLang === 'hi' ? sub.nameHi : sub.nameEn;

            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubCatId(sub.id)}
                className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40 border border-blue-400 ring-2 ring-blue-500/30'
                    : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 border border-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-900 text-amber-400'
                }`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 3. VIBRANT DARK MEGA HERO CARD ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        <div className="bg-gradient-to-b from-[#0e172e] via-[#0b1329] to-[#070b16] border border-slate-700/80 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden space-y-8">
          
          {/* Ambient Lighting Glows */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Info Row: Badges & High-Tech Countdown */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black uppercase tracking-wide shadow-sm">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                ALL-INDIA OLYMPIAD
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-bold shadow-sm">
                <Award className="w-4 h-4 text-blue-400" />
                {settings.scholarshipPool} Fellowships / छात्रवृत्ति
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Proctored Merit Evaluation
              </span>
            </div>

            {/* Glowing Live Timer Box */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-2xl shadow-inner self-start md:self-auto">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                STARTS IN / प्रारंभ:
              </span>
              <div className="flex items-center gap-1.5 font-mono font-black text-sm sm:text-base">
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

          {/* Dynamic Titles & Targeted Domain */}
          <div className="relative z-10 space-y-3 max-w-4xl">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-amber-400 leading-tight drop-shadow-md">
              {currentLang === 'hi' ? settings.bannerTitleHi : settings.bannerTitleEn}
            </h1>
            <p className="text-base sm:text-xl font-bold text-slate-200">
              {currentLang === 'hi' ? settings.bannerTitleEn : settings.bannerTitleHi}
            </p>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed pt-1">
              अखिल भारतीय मेधावी मूल्यांकन परीक्षा • Selected Domain: <strong className="text-amber-400">{currentLang === 'hi' ? activeSubCatObj.nameHi : activeSubCatObj.nameEn}</strong>. Real-time All-India Percentile Standings, Weakness Diagnostic Heatmaps &amp; Verified Institutional Grants.
            </p>
          </div>

          {/* Registration Progress */}
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                380 / 500 Candidates Registered (पंजीकृत स्लॉट्स)
              </span>
              <span className="text-amber-400 font-black">76% Filled (Closing Soon)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-amber-500 w-[76%] rounded-full shadow-lg shadow-amber-500/30" />
            </div>
          </div>

          {/* ================= 4. 3 BIG VIBRANT ACTION BUTTONS ================= */}
          <div className="relative z-10 pt-6 border-t border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              
              {/* BUTTON 1 (GOLD): Register Olympiad Slot */}
              <Link
                href="/olympiad"
                className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/40 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
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

              {/* BUTTON 2 (ROYAL BLUE): 24x7 Daily Free Speed Drill */}
              <Link
                href="/quiz"
                className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-black shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
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

              {/* BUTTON 3 (EMERALD / TEAL): Rankings & Merit Board */}
              <Link
                href="/leaderboard"
                className="group p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white font-black shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:shadow-emerald-600/40 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
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