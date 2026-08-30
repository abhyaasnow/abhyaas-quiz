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
  Globe,
  Landmark,
  Briefcase,
  Building2,
  UserCheck,
  Train,
  Shield,
  BookOpen,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { getSiteSettings, SiteSettings } from '@/lib/db';

type TabType = 'exams' | 'topics' | 'subjects';

interface DomainItem {
  id: string;
  nameHi: string;
  nameEn: string;
  queryParam: string;
  icon: any;
}

export default function MegaOlympiadBanner() {
  const [currentLang, setCurrentLang] = useState<'hi' | 'en'>('hi');
  const [activeTab, setActiveTab] = useState<TabType>('exams');
  const [selectedDomainId, setSelectedDomainId] = useState('civil');

  const [settings, setSettings] = useState<SiteSettings>({
    bannerTitleHi: 'अखिल भारतीय राज्यव्यवस्था ओलंपियाड',
    bannerTitleEn: 'National Polity & Governance Olympiad 2026',
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
        }));
      }
    }
    fetchBannerConfig();
  }, []);

  // Synchronized countdown
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

  // Structured Domains
  const EXAMS_LIST: DomainItem[] = [
    { id: 'civil', nameHi: 'सिविल सर्विसेज (IAS / IPS)', nameEn: 'Civil Services (IAS/IPS)', queryParam: 'polity', icon: Landmark },
    { id: 'ssc', nameHi: 'एसएससी (CGL / CHSL)', nameEn: 'SSC (CGL/CHSL)', queryParam: 'csat', icon: Briefcase },
    { id: 'banking', nameHi: 'बैंकिंग (SBI / IBPS)', nameEn: 'Banking (SBI/IBPS)', queryParam: 'economy', icon: Building2 },
    { id: 'teaching', nameHi: 'शिक्षक पात्रता (TET / CTET)', nameEn: 'Teaching (TET/CTET)', queryParam: 'history', icon: UserCheck },
    { id: 'railway', nameHi: 'रेलवे भर्ती (RRB NTPC)', nameEn: 'Railways (RRB NTPC)', queryParam: 'geography', icon: Train },
  ];

  const TOPICS_LIST: DomainItem[] = [
    { id: 'preamble', nameHi: 'प्रस्तावना एवं संविधान ढांचा', nameEn: 'Preamble & Framework', queryParam: 'polity', icon: BookOpen },
    { id: 'fr', nameHi: 'मौलिक अधिकार (Art 12-35)', nameEn: 'Fundamental Rights (12-35)', queryParam: 'polity', icon: ShieldCheck },
    { id: 'panchayat', nameHi: 'पंचायती राज (73वां संशोधन)', nameEn: 'Panchayati Raj & 73rd', queryParam: 'polity', icon: Landmark },
    { id: 'freedom', nameHi: '1857-1947 स्वतंत्रता संग्राम', nameEn: 'Freedom Movement (1857-47)', queryParam: 'history', icon: Layers },
  ];

  const SUBJECTS_LIST: DomainItem[] = [
    { id: 'polity', nameHi: 'भारतीय राजव्यवस्था (Polity)', nameEn: 'Indian Polity & Governance', queryParam: 'polity', icon: Landmark },
    { id: 'history', nameHi: 'आधुनिक इतिहास (History)', nameEn: 'Modern Indian History', queryParam: 'history', icon: BookOpen },
    { id: 'economy', nameHi: 'भारतीय अर्थव्यवस्था (Economy)', nameEn: 'Indian Economy & Macro', queryParam: 'economy', icon: Building2 },
    { id: 'csat', nameHi: 'सीसैट एवं लॉजिक (CSAT)', nameEn: 'CSAT Quantitative & Logic', queryParam: 'csat', icon: Zap },
  ];

  const currentList = 
    activeTab === 'exams' ? EXAMS_LIST :
    activeTab === 'topics' ? TOPICS_LIST : SUBJECTS_LIST;

  const currentItem = currentList.find(item => item.id === selectedDomainId) || currentList[0];

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800">
      
      {/* 1. Header Segment Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          
          {/* 3 Main View Switchers */}
          <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <button
              onClick={() => {
                setActiveTab('exams');
                setSelectedDomainId('civil');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'exams'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Exams (परीक्षाएं)
            </button>
            <button
              onClick={() => {
                setActiveTab('topics');
                setSelectedDomainId('preamble');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'topics'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Topics (टॉपिक्स)
            </button>
            <button
              onClick={() => {
                setActiveTab('subjects');
                setSelectedDomainId('polity');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'subjects'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Subjects (विषय)
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Language:</span>
            <button
              onClick={() => setCurrentLang('hi')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                currentLang === 'hi' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setCurrentLang('en')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                currentLang === 'en' ? 'bg-blue-600 text-white font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

        </div>

        {/* 2. Interactive Domain Capsule Stream */}
        <div className="flex items-center gap-2 py-3.5 overflow-x-auto scrollbar-none">
          {currentList.map(item => {
            const isSelected = selectedDomainId === item.id;
            const Icon = item.icon;
            const label = currentLang === 'hi' ? item.nameHi : item.nameEn;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedDomainId(item.id)}
                className={`flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/40'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-white text-blue-600' : 'bg-slate-900 text-amber-400'
                }`}>
                  <Icon className="w-3 h-3" />
                </div>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Hero Card Arena */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-10">
        <div className="bg-gradient-to-b from-[#0e172e] via-[#0b1329] to-[#070b16] border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden space-y-8">
          
          {/* Subtle Ambient Lighting */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Live Timer & Verified Badges */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                ALL-INDIA OLYMPIAD 2026
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                {settings.scholarshipPool} Merit Fellowship Grant
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                AI-Proctored Skill Standard
              </span>
            </div>

            {/* Countdown Box */}
            <div className="inline-flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl self-start md:self-auto shadow-inner">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-400">STARTS IN:</span>
              <div className="font-mono font-bold text-xs sm:text-sm flex items-center gap-1 text-slate-100">
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span className="text-amber-400">:</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span className="text-amber-400">:</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          </div>

          {/* Dynamic Titles */}
          <div className="relative z-10 space-y-2.5 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {currentLang === 'hi' ? settings.bannerTitleHi : settings.bannerTitleEn}
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-400 leading-relaxed">
              Domain Track: <strong className="text-amber-400 font-semibold">{currentLang === 'hi' ? currentItem.nameHi : currentItem.nameEn}</strong>. 
              Compete against aspirants nationwide for All-India Percentile Standings, Weak-Area Heatmaps &amp; Direct Merit Scholarships.
            </p>
          </div>

          {/* Registration Meter */}
          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                380 / 500 Confirmed Candidates
              </span>
              <span className="text-amber-400 font-bold">76% Allocated</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-blue-500 to-amber-500 w-[76%] rounded-full shadow-sm" />
            </div>
          </div>

          {/* 4. Action Cards Grid */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Book Slot */}
              <Link
                href="/olympiad"
                className="group p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold transition-all duration-150 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-950/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 fill-slate-950" />
                  </div>
                  <span className="text-xs font-black bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full">
                    Fee: {settings.assessmentFee}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1">
                    <span>Register Olympiad Slot</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-[11px] text-slate-900/80 font-normal mt-0.5">
                    प्रवेश पंजीकरण एवं रोल नंबर (Instant Digital Admit Card)
                  </p>
                </div>
              </Link>

              {/* Card 2: Speed Drill (Dynamically loads selected subject) */}
              <Link
                href={`/quiz?subject=${currentItem.queryParam}`}
                className="group p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 hover:border-blue-500 transition-all duration-150 flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    24x7 Free Drill
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                    <span>Launch {currentItem.nameEn.split(' ')[0]} Drill</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                    निशुल्क विषयवार स्पीड टेस्ट (Instant Solution Keys)
                  </p>
                </div>
              </Link>

              {/* Card 3: Rankings */}
              <Link
                href="/leaderboard"
                className="group p-5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-700/80 hover:border-amber-500 transition-all duration-150 flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                    All-India Ranks
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-amber-400 flex items-center gap-1 transition-colors">
                    <span>Rankings &amp; Fellowships</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                    राष्ट्रीय मेधा सूची एवं छात्रवृत्ति विवरण (Top 20 Grants)
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