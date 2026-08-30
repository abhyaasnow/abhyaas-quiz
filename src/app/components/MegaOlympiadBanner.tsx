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
  School,
  Layers
} from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/db';

type CategoryTab = 'classes' | 'exams' | 'subjects' | 'topics';

export default function MegaOlympiadBanner() {
  const [currentLang, setCurrentLang] = useState<'hi' | 'en'>('hi');
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('classes');
  const [activeFilterItem, setActiveFilterItem] = useState('Class 11th - 12th');

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

  // 1. CLASS (1st to 12th) Categories
  const classCategories = [
    { id: 'c-all', nameHi: 'सभी कक्षाएं', nameEn: 'All Classes', featured: false },
    { id: 'c-1-5', nameHi: 'कक्षा 01 - 05वीं (Primary)', nameEn: 'Class 01st - 05th (Primary)', featured: false },
    { id: 'c-6-8', nameHi: 'कक्षा 06 - 08वीं (Middle)', nameEn: 'Class 06th - 08th (Middle)', featured: false },
    { id: 'c-9-10', nameHi: 'कक्षा 09 - 10वीं (Secondary)', nameEn: 'Class 09th - 10th (Secondary)', featured: true },
    { id: 'c-11-12', nameHi: 'कक्षा 11 - 12वीं (Sr. Secondary)', nameEn: 'Class 11th - 12th (Sr. Secondary)', featured: true },
  ];

  // 2. EXAM Categories
  const examCategories = [
    { id: 'e-all', nameHi: 'सभी परीक्षाएं', nameEn: 'All Exams', featured: false },
    { id: 'e-upsc', nameHi: 'UPSC CSE (IAS/IPS)', nameEn: 'UPSC CSE', featured: true },
    { id: 'e-pcs', nameHi: 'State PSC (UP/BPSC)', nameEn: 'State PSC', featured: false },
    { id: 'e-ssc', nameHi: 'SSC CGL / CHSL', nameEn: 'SSC CGL', featured: false },
    { id: 'e-bank', nameHi: 'Banking & CSAT', nameEn: 'Banking & CSAT', featured: false }
  ];

  // 3. SUBJECT Categories
  const subjectCategories = [
    { id: 's-all', nameHi: 'सभी विषय', nameEn: 'All Subjects', featured: false },
    { id: 's-polity', nameHi: 'भारतीय राजव्यवस्था (Polity)', nameEn: 'Polity & Constitution', featured: true },
    { id: 's-hist', nameHi: 'भारतीय इतिहास (History)', nameEn: 'Modern History', featured: false },
    { id: 's-eco', nameHi: 'अर्थव्यवस्था (Economy)', nameEn: 'Indian Economy', featured: false },
    { id: 's-geo', nameHi: 'भूगोल एवं पर्यावरण (Geography)', nameEn: 'Geography & Ecology', featured: false },
  ];

  // 4. TOPIC Categories
  const topicCategories = [
    { id: 't-preamble', nameHi: 'प्रस्तावना एवं ढांचा', nameEn: 'Preamble & Framework', featured: true },
    { id: 't-fr', nameHi: 'मौलिक अधिकार (Art 12-35)', nameEn: 'Fundamental Rights', featured: true },
    { id: 't-panchayat', nameHi: 'पंचायती राज (73rd Amend)', nameEn: 'Panchayati Raj & 73rd', featured: false },
    { id: 't-freedom', nameHi: '1857 - 1947 स्वतंत्रता संग्राम', nameEn: 'Freedom Movement', featured: false },
  ];

  const currentCategoryList = 
    activeCategory === 'classes' ? classCategories :
    activeCategory === 'exams' ? examCategories :
    activeCategory === 'subjects' ? subjectCategories : topicCategories;

  return (
    <div className="w-full bg-slate-100 border-b border-slate-200">
      
      {/* Category Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          
          {/* 4 Main Segment Tabs: Classes / Exams / Subjects / Topics */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm text-xs font-bold overflow-x-auto">
            
            <button
              onClick={() => {
                setActiveCategory('classes');
                setActiveFilterItem('Class 11th - 12th (Sr. Secondary)');
              }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'classes' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>कक्षाएं (Classes 1-12)</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('exams');
                setActiveFilterItem('UPSC CSE');
              }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'exams' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>परीक्षाएं (Exams)</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('subjects');
                setActiveFilterItem('Polity & Constitution');
              }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'subjects' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>विषय (Subjects)</span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('topics');
                setActiveFilterItem('Preamble & Framework');
              }}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeCategory === 'topics' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>टॉपिक्स (Topics)</span>
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

        {/* Dynamic Badges Filter Stream */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto pb-2 scrollbar-none">
          {currentCategoryList.map((cat) => {
            const isSelected = activeFilterItem === cat.nameEn || activeFilterItem === cat.nameHi;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilterItem(currentLang === 'hi' ? cat.nameHi : cat.nameEn)}
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
                ALL-INDIA OLYMPIAD &amp; ASSESSMENT
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
                School (Class 1-12) &amp; Competitive Exam अखिल भारतीय मूल्यांकन परीक्षा • All-India Rank, Weakness Heatmap &amp; Merit Academic Fellowships.
              </p>
            </div>

            {/* Registration Progress */}
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  380 / 500 Candidates Registered (पंजीकृत)
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

              {/* Action Button */}
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