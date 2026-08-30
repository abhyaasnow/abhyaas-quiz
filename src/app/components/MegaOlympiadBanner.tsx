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
  ChevronRight
} from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/db';

type MainTab = 'exams' | 'topics' | 'subjects';

interface SubCategory {
  id: string;
  name: string;
  icon: any;
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

  // 1. EXAMS Subcategories
  const examSubCategories: SubCategory[] = [
    { id: 'civil', name: 'Civil Services', icon: Landmark },
    { id: 'ssc', name: 'SSC Exams', icon: Briefcase },
    { id: 'banking', name: 'Banking Exams', icon: Building2 },
    { id: 'teaching', name: 'Teaching Exams', icon: UserCheck },
    { id: 'railway', name: 'Railway Exams', icon: Train },
    { id: 'defense', name: 'Defense & Police', icon: Shield },
  ];

  // 2. TOPICS Subcategories
  const topicSubCategories: SubCategory[] = [
    { id: 'preamble', name: 'Preamble & Philosophy', icon: BookMarked },
    { id: 'fr', name: 'Fundamental Rights (Art 12-35)', icon: ShieldCheck },
    { id: 'panchayat', name: 'Panchayati Raj (73rd Amend)', icon: Landmark },
    { id: 'dpsp', name: 'DPSP & Fundamental Duties', icon: Layers },
    { id: 'parliament', name: 'Parliament & Legislation', icon: Building2 },
  ];

  // 3. SUBJECTS Subcategories
  const subjectSubCategories: SubCategory[] = [
    { id: 'polity', name: 'Indian Polity & Constitution', icon: Landmark },
    { id: 'history', name: 'Modern Indian History', icon: BookMarked },
    { id: 'economy', name: 'Economy & Budget', icon: Building2 },
    { id: 'geography', name: 'Geography & Ecology', icon: Layers },
    { id: 'csat', name: 'CSAT Aptitude & Logic', icon: Zap },
  ];

  const currentSubCategories = 
    activeTab === 'exams' ? examSubCategories :
    activeTab === 'topics' ? topicSubCategories : subjectSubCategories;

  return (
    <div className="w-full bg-white border-b border-slate-200">
      
      {/* ================= 1. CLEAN SEGMENTED TAB SWITCHER (EXAMS / TOPICS / SUBJECTS) ================= */}
      <div className="border-b border-slate-100 bg-slate-50/70 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* 3 Balanced Pill Buttons */}
          <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-bold">
            
            {/* Tab 1: Exams */}
            <button
              onClick={() => {
                setActiveTab('exams');
                setActiveSubCat('Civil Services');
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Exams</span>
            </button>

            {/* Tab 2: Topics */}
            <button
              onClick={() => {
                setActiveTab('topics');
                setActiveSubCat('Preamble & Philosophy');
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
                activeTab === 'topics'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>Topics</span>
            </button>

            {/* Tab 3: Subjects */}
            <button
              onClick={() => {
                setActiveTab('subjects');
                setActiveSubCat('Indian Polity & Constitution');
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-all duration-150 cursor-pointer ${
                activeTab === 'subjects'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="font-serif font-black text-sm leading-none">अ</span>
              <span>Subjects</span>
            </button>
          </div>

          <div className="text-[11px] font-semibold text-slate-500 hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Domain: <strong className="text-slate-800">{activeSubCat}</strong></span>
          </div>

        </div>
      </div>

      {/* ================= 2. CLEAN SUBCATEGORIES CAPSULE STREAM ================= */}
      <div className="py-3 px-4 sm:px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          {currentSubCategories.map((sub) => {
            const isSelected = activeSubCat === sub.name;
            const IconComponent = sub.icon;

            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubCat(sub.name)}
                className={`flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border border-blue-600 text-blue-700 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  <IconComponent className="w-3 h-3" />
                </div>
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 3. CLEAN WHITE & BRAND-COLORED HERO SHOWCASE ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
          
          {/* Top Info Row: Badges & Synchronized Timer */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                All-India Assessment
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                <Award className="w-4 h-4 text-blue-600" />
                {settings.scholarshipPool} Merit Fellowship Grant
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Proctored Evaluation
              </span>
            </div>

            {/* Countdown Box */}
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl self-start md:self-auto">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-500">STARTS IN:</span>
              <div className="font-mono font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span className="text-slate-400">:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span className="text-slate-400">:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-amber-600">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          </div>

          {/* Titles & Description */}
          <div className="space-y-2 max-w-4xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              {settings.bannerTitleHi}
            </h1>
            <p className="text-base sm:text-xl font-bold text-blue-600">
              {settings.bannerTitleEn}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
              अखिल भारतीय मेधावी मूल्यांकन परीक्षा • Selected Track: <strong className="text-slate-900 font-bold">{activeSubCat}</strong>. Test readiness against aspirants nationwide with national percentile ranks and weak-area analytics.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                380 / 500 Candidates Registered
              </span>
              <span className="text-amber-600 font-bold">76% Slots Filled</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-amber-500 w-[76%] rounded-full" />
            </div>
          </div>

          {/* ================= 3 REFINED BRAND-COLORED ACTION CARDS ================= */}
          <div className="pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Register Slot (Amber/Gold Accent) */}
              <Link
                href="/olympiad"
                className="group p-5 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-200 hover:border-amber-300 transition-all duration-150 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-sm">
                    <Zap className="w-5 h-5 fill-slate-950" />
                  </div>
                  <span className="text-xs font-black text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                    Fee: {settings.assessmentFee}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 group-hover:text-amber-700 flex items-center gap-1 transition-colors">
                    <span>Register Examination Slot</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    प्रवेश पंजीकरण एवं रोल नंबर (Instant Digital Admit Card)
                  </p>
                </div>
              </Link>

              {/* Card 2: Daily Free Speed Drill (Royal Blue Accent) */}
              <Link
                href="/quiz"
                className="group p-5 rounded-2xl bg-blue-50/60 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-150 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-black text-blue-900 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                    100% Free
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 group-hover:text-blue-700 flex items-center gap-1 transition-colors">
                    <span>Daily Practice Speed Drill</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    24x7 निशुल्क स्पीड टेस्ट (Real-time Solutions &amp; Keys)
                  </p>
                </div>
              </Link>

              {/* Card 3: Rankings & Merit Board (Neutral Slate/Emerald Accent) */}
              <Link
                href="/leaderboard"
                className="group p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 transition-all duration-150 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center shadow-sm">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                    Audited
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                    <span>Rankings &amp; Merit Board</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-700 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    राष्ट्रीय मेधा सूची एवं छात्रवृत्ति विवरण (Top 20 Fellowships)
                  </p>
                </div>
              </Link>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}