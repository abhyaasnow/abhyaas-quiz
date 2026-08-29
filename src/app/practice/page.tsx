'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Layers, CheckCircle2, 
  HelpCircle, ArrowRight, Filter, Sparkles, Zap 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';

interface Chapter {
  id: string;
  titleHi: string;
  titleEn: string;
  questionsCount: number;
  completed: boolean;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
}

const subjectsCatalog = [
  {
    id: 'polity',
    nameHi: 'भारतीय राजव्यवस्था',
    nameEn: 'Indian Polity & Governance',
    totalQs: 900,
    chapters: [
      { id: 'pol-1', titleHi: 'संविधान की प्रस्तावना एवं विशेषताएं', titleEn: 'Preamble & Salient Features', questionsCount: 45, completed: true, difficulty: 'Easy' },
      { id: 'pol-2', titleHi: 'मौलिक अधिकार (अनुच्छेद 12-35)', titleEn: 'Fundamental Rights (Art 12-35)', questionsCount: 70, completed: false, difficulty: 'Moderate' },
      { id: 'pol-3', titleHi: 'राज्य के नीति निर्देशक तत्व (DPSP)', titleEn: 'Directive Principles of State Policy', questionsCount: 40, completed: false, difficulty: 'Easy' },
      { id: 'pol-4', titleHi: 'संघीय कार्यपालिका एवं राष्ट्रपति', titleEn: 'Union Executive & President', questionsCount: 60, completed: false, difficulty: 'Advanced' },
      { id: 'pol-5', titleHi: 'संसद एवं विधायी प्रक्रिया', titleEn: 'Parliament & Legislative Procedure', questionsCount: 85, completed: false, difficulty: 'Moderate' },
    ]
  },
  {
    id: 'history',
    nameHi: 'आधुनिक भारत का इतिहास',
    nameEn: 'Modern Indian History',
    totalQs: 1200,
    chapters: [
      { id: 'his-1', titleHi: '1857 का विद्रोह एवं नेता', titleEn: '1857 Revolt & Leaders', questionsCount: 50, completed: true, difficulty: 'Easy' },
      { id: 'his-2', titleHi: 'भारतीय राष्ट्रीय कांग्रेस एवं उदारवादी युग', titleEn: 'INC & Moderate Phase (1885-1905)', questionsCount: 45, completed: false, difficulty: 'Moderate' },
      { id: 'his-3', titleHi: 'गांधीवादी युग एवं स्वतंत्रता आंदोलन', titleEn: 'Gandhian Era & Mass Movements', questionsCount: 85, completed: false, difficulty: 'Advanced' },
    ]
  },
  {
    id: 'economy',
    nameHi: 'भारतीय अर्थव्यवस्था',
    nameEn: 'Indian Economy',
    totalQs: 750,
    chapters: [
      { id: 'eco-1', titleHi: 'मौद्रिक नीति एवं बैंकिंग सुधार', titleEn: 'Monetary Policy & Banking Reforms', questionsCount: 55, completed: false, difficulty: 'Moderate' },
      { id: 'eco-2', titleHi: 'राजकोषीय नीति एवं बजट', titleEn: 'Fiscal Policy & Union Budget', questionsCount: 40, completed: false, difficulty: 'Advanced' },
      { id: 'eco-3', titleHi: 'मुद्रास्फीति एवं राष्ट्रीय आय', titleEn: 'Inflation & National Income', questionsCount: 50, completed: false, difficulty: 'Easy' },
    ]
  }
];

export default function PracticeCatalog() {
  const [selectedSubject, setSelectedSubject] = useState('polity');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Easy' | 'Moderate' | 'Advanced'>('All');

  const activeSubjectData = subjectsCatalog.find(s => s.id === selectedSubject) || subjectsCatalog[0];

  const filteredChapters = activeSubjectData.chapters.filter(ch => {
    if (selectedFilter === 'All') return true;
    return ch.difficulty === selectedFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* 1. Header Navbar */}
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Header & Breadcrumb */}
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
              अभ्यास केंद्र <span className="text-blue-700">| Practice & PYQ Bank</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a subject and practice chapter-wise verified MCQs 24x7.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-2xl w-fit">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-blue-900">Earn +20 XP per completed chapter</span>
          </div>
        </div>

        {/* 2. Horizontal Subject Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {subjectsCatalog.map((subj) => {
            const isSelected = selectedSubject === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => setSelectedSubject(subj.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{subj.nameHi}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {subj.totalQs} Qs
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Difficulty Level Filter Badges */}
        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Filter Level:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['All', 'Easy', 'Moderate', 'Advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedFilter(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  selectedFilter === lvl
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl === 'All' ? 'All Questions' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Chapter-wise Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredChapters.map((chapter, idx) => (
            <div
              key={chapter.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Chapter {idx + 1}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    chapter.difficulty === 'Easy'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : chapter.difficulty === 'Moderate'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {chapter.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {chapter.titleHi}
                </h3>
                <span className="text-xs text-slate-500 font-medium block mt-0.5">
                  {chapter.titleEn}
                </span>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-3">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                    {chapter.questionsCount} MCQs Available
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold">100% Free</span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/quiz?subject=${selectedSubject}&ch=${chapter.id}`}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Start Chapter Drill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

      </main>

      {/* 5. Footer & Bottom Bar */}
      <Footer />
      <BottomNav />

    </div>
  );
}