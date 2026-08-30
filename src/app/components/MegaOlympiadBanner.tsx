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
  Sparkles
} from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/db';

export default function MegaOlympiadBanner() {
  const [currentLang, setCurrentLang] = useState<'hi' | 'en'>('hi');
  const [activeCategory, setActiveCategory] = useState<'subjects' | 'exams' | 'topics'>('exams');
  const [activeExam, setActiveExam] = useState('UPSC CSE');

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

  const examCategories = [
    { id: 'all', nameHi: 'सभी परीक्षाएं', nameEn: 'All Exams', featured: false },
    { id: 'upsc', nameHi: 'UPSC CSE', nameEn: 'UPSC CSE', featured: true },
    { id: 'pcs', nameHi: 'State PCS', nameEn: 'State PCS', featured: false },
    { id: 'ssc', nameHi: 'SSC CGL', nameEn: 'SSC CGL', featured: false },
    { id: 'bank', nameHi: 'Banking & PO', nameEn: 'Banking & PO', featured: false }
  ];

  return (
    <div className="w-full bg-slate-100 border-b border-slate-200">
      
      {/* Category Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          
          {/* Tabs: Subjects / Exams / Topics */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-bold">
            <button
              onClick={() => setActiveCategory('subjects')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeCategory === 'subjects' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              विषय (Subjects)
            </button>
            <button
              onClick={() => setActiveCategory('exams')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeCategory === 'exams' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              परीक्षाएं (Exams)
            </button>
            <button
              onClick={() => setActiveCategory('topics')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                activeCategory === 'topics' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              टॉपिक्स (Topics)
            </button>
          </div>

          {/* Bilingual Switcher */}
          <div className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500">माध्यम:</span>
            <button
              onClick={() => setCurrentLang('hi')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                currentLang === 'hi' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setCurrentLang('en')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                currentLang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Exam Badges Filter */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-2 scrollbar-none">
          {examCategories.map((cat) => {
            const isSelected = activeExam === cat.nameEn;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveExam(cat.nameEn)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
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

      {/* Main Dark Mega Olympiad Hero Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-8">
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          
          <div className="relative z-10 space-y-5">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                <GraduationCap className="w-4 h-4" />
                ALL-INDIA WEEKLY OLYMPIAD | साप्ताहिक ओलंपियाड
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                {settings.scholarshipPool} Scholarships / छात्रवृत्ति
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                Bilingual (हिन्दी + English)
              </span>
            </div>

            {/* Dynamic Titles from Cloud */}
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-amber-400 leading-tight">
                {settings.bannerTitleHi}
              </h1>
              <p className="text-base sm:text-lg font-bold text-slate-200">
                {settings.bannerTitleEn}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                UPSC &amp; State PSC अखिल भारतीय मूल्यांकन परीक्षा • All-India Rank, Analysis &amp; Merit Academic Grants.
              </p>
            </div>

            {/* Registration Progress */}
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  380 / 500 Aspirants Registered (पंजीकृत)
                </span>
                <span className="text-amber-400 font-bold">Slots Filling Fast (76%)</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-amber-500 w-[76%] rounded-full" />
              </div>
            </div>

            {/* Live Timer & Registration CTA */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-800/80">
              
              {/* Countdown */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  STARTS IN / प्रारंभ:
                </span>
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-center min-w-[40px]">
                    <span className="text-sm sm:text-base text-white block leading-none">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 font-medium">घंटे / H</span>
                  </div>
                  <span className="text-slate-500 font-bold">:</span>
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-center min-w-[40px]">
                    <span className="text-sm sm:text-base text-white block leading-none">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 font-medium">मिनट / M</span>
                  </div>
                  <span className="text-slate-500 font-bold">:</span>
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-center min-w-[40px]">
                    <span className="text-sm sm:text-base text-amber-400 block leading-none">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[9px] text-slate-400 font-medium">सेकंड / S</span>
                  </div>
                </div>
              </div>

              {/* Action Button with Dynamic Fee */}
              <div className="flex items-center gap-3">
                <Link
                  href="/olympiad"
                  className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>REGISTER • {settings.assessmentFee} | पंजीकरण</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}