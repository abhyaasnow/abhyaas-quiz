'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Award, 
  ArrowRight, 
  Globe, 
  Star, 
  Users, 
  Clock, 
  Sparkles,
  BookOpen,
  Layers,
  Trophy,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/db';

type CategoryTab = 'exams' | 'subjects' | 'topics';

export default function MegaOlympiadBanner() {
  const [currentLang, setCurrentLang] = useState<'hi' | 'en'>('hi');
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('exams');
  const [activeFilterItem, setActiveFilterItem] = useState('UPSC CSE (IAS/IPS)');

  // Dynamic Settings from Firebase
  const [settings, setSettings] = useState<SiteSettings>({
    bannerTitleHi: 'राष्ट्रीय राज्यव्यवस्था ओलंपियाड : संवैधानिक ढांचा',
    bannerTitleEn: 'National Polity Olympiad : Constitutional Framework & Preamble',
    scholarshipPool: '₹50,000',
    assessmentFee: '₹49',
    bannerGraphicUrl: null,
  });

  // Fetch live settings on mount
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

  // 1. EXAM Categories
  const examCategories = [
    { id: 'e-all', nameHi: 'सभी परीक्षाएं', nameEn: 'All Exams', featured: false },
    { id: 'e-upsc', nameHi: 'UPSC CSE (IAS/IPS)', nameEn: 'UPSC CSE (IAS/IPS)', featured: true },
    { id: 'e-pcs', nameHi: 'State PSC (UP/BPSC)', nameEn: 'State PSC (UP/BPSC)', featured: false },
    { id: 'e-ssc', nameHi: 'SSC CGL / CHSL', nameEn: 'SSC CGL / CHSL', featured: false },
    { id: 'e-bank', nameHi: 'Banking & CSAT', nameEn: 'Banking & CSAT', featured: false }
  ];

  // 2. SUBJECT Categories
  const subjectCategories = [
    { id: 's-all', nameHi: 'सभी विषय', nameEn: 'All Subjects', featured: false },
    { id: 's-polity', nameHi: 'भारतीय राजव्यवस्था (Polity)', nameEn: 'Polity & Constitution', featured: true },
    { id: 's-hist', nameHi: 'भारतीय इतिहास (History)', nameEn: 'Modern History', featured: false },
    { id: 's-eco', nameHi: 'अर्थव्यवस्था (Economy)', nameEn: 'Indian Economy', featured: false },
    { id: 's-geo', nameHi: 'भूगोल एवं पर्यावरण (Geography)', nameEn: 'Geography & Ecology', featured: false },
  ];

  // 3. TOPIC Categories
  const topicCategories = [
    { id: 't-preamble', nameHi: 'प्रस्तावना एवं ढांचा', nameEn: 'Preamble & Framework', featured: true },
    { id: 't-fr', nameHi: 'मौलिक अधिकार (Art 12-35)', nameEn: 'Fundamental Rights', featured: true },
    { id: 't-panchayat', nameHi: 'पंचायती राज (73rd Amend)', nameEn: 'Panchayati Raj & 73rd', featured: false },
    { id: 't-freedom', nameHi: '1857 - 1947 स्वतंत्रता संग्राम', nameEn: 'Freedom Movement', featured: false },
  ];

  const currentCategoryList = 
    activeCategory === 'exams' ? examCategories :
    activeCategory === 'subjects' ? subjectCategories : topicCategories;

  return (
    <div className="w-full bg-slate-100 border-b border-slate-200">
      
      {/* Top Filter Stream Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          
          {/* 3 Main Segment Tabs: Exams / Subjects / Topics */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-bold overflow-x-auto">
            <button
              onClick={() => {
                setActiveCategory('exams');
                setActiveFilterItem('UPSC CSE (IAS/IPS)');
              }}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'exams' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>परीक्षाएं (Target Exams)</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('subjects');
                setActiveFilterItem('Polity & Constitution');
              }}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'subjects' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>विषय (Subjects)</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('topics');
                setActiveFilterItem('Preamble & Framework');
              }}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'topics' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>टॉपिक्स (Topics)</span>
            </button>
          </div>

          {/* Bilingual Switcher */}
          <div className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-slate-500">माध्यम:</span>
            <button
              onClick={() => setCurrentLang('hi')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                currentLang === 'hi' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setCurrentLang('en')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                currentLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Dynamic Badges Filter Stream */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-2 scrollbar-none">
          {currentCategoryList.map((cat) => {
            const isSelected = activeFilterItem === cat.nameEn || activeFilterItem === cat.nameHi;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilterItem(currentLang === 'hi' ? cat.nameHi : cat.nameEn)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-sm'
                    : 'bg-white/80 border border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                {cat.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                <span>{currentLang === 'hi' ? cat.nameHi : cat.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= MAIN LARGE HERO CARD ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-10">
        <div className="bg-gradient-to-b from-[#0b1329] via-[#0f172a] to-[#080d1a] border border-slate-700/80 rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl relative overflow-hidden space-y-8">
          
          {/* Subtle Ambient Background Lighting */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Badges & Live Synchronized Clock */}
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

            {/* Prominent High-Tech Countdown Box */}
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

          {/* Titles & Description */}
          <div className="relative z-10 space-y-2.5 max-w-4xl">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-amber-400 leading-tight">
              {settings.bannerTitleHi}
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-slate-200 leading-snug">
              {settings.bannerTitleEn}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed pt-1">
              अखिल भारतीय मेधावी मूल्यांकन परीक्षा • All-India Percentile Standings, Weakness Heatmaps &amp; Verified Academic Research Grants.
            </p>
          </div>

          {/* Registration Progress Bar */}
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

          {/* ================= 3 BIG PREMIUM ACTION BUTTONS (LEFT - MID - RIGHT) ================= */}
          <div className="relative z-10 pt-6 border-t border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              
              {/* BUTTON 1 (LEFT): Gold / Amber Olympiad Slot Booking */}
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

              {/* BUTTON 2 (MIDDLE): Royal Blue Practice & Speed Drill */}
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

              {/* BUTTON 3 (RIGHT): Emerald Green All-India Rankings & Grants */}
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