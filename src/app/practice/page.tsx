'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  HelpCircle,
  Landmark,
  Scroll,
  TrendingUp,
  Globe2,
  BrainCircuit,
  Filter
} from 'lucide-react';

interface SubjectTopic {
  id: string;
  nameEn: string;
  nameHi: string;
  questionsCount: number;
  durationMinutes: number;
  isPopular?: boolean;
}

interface SubjectModule {
  id: string;
  nameEn: string;
  nameHi: string;
  icon: React.ElementType;
  color: string;
  topics: SubjectTopic[];
}

const SUBJECT_MODULES: SubjectModule[] = [
  {
    id: 'polity',
    nameEn: 'Indian Polity & Constitution',
    nameHi: 'भारतीय राज्यव्यवस्था एवं संविधान',
    icon: Landmark,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    topics: [
      { id: 'pol-1', nameEn: 'Constitutional Framework & Preamble', nameHi: 'संवैधानिक ढांचा एवं प्रस्तावना', questionsCount: 25, durationMinutes: 20, isPopular: true },
      { id: 'pol-2', nameEn: 'Fundamental Rights & Duties (Art 12-51A)', nameHi: 'मौलिक अधिकार एवं कर्तव्य', questionsCount: 30, durationMinutes: 25, isPopular: true },
      { id: 'pol-3', nameEn: 'Union Executive & Parliament', nameHi: 'संघीय कार्यपालिका एवं संसद', questionsCount: 35, durationMinutes: 30 },
      { id: 'pol-4', nameEn: 'Judiciary & Supreme Court Writs', nameHi: 'न्यायपालिका एवं रिट क्षेत्राधिकार', questionsCount: 20, durationMinutes: 15 },
      { id: 'pol-5', nameEn: 'Panchayati Raj & 73rd/74th Amendment', nameHi: 'पंचायती राज एवं स्थानीय शासन', questionsCount: 20, durationMinutes: 15 }
    ]
  },
  {
    id: 'history',
    nameEn: 'Modern Indian History',
    nameHi: 'आधुनिक भारत का इतिहास',
    icon: Scroll,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    topics: [
      { id: 'his-1', nameEn: 'Indian National Movement (1885-1947)', nameHi: 'भारतीय राष्ट्रीय आंदोलन', questionsCount: 40, durationMinutes: 35, isPopular: true },
      { id: 'his-2', nameEn: 'Governor-Generals & British Acts', nameHi: 'ब्रिटिश अधिनियम एवं नीतियां', questionsCount: 25, durationMinutes: 20 },
      { id: 'his-3', nameEn: 'Socio-Religious Reform Movements', nameHi: 'सामाजिक एवं धार्मिक सुधार आंदोलन', questionsCount: 20, durationMinutes: 15 }
    ]
  },
  {
    id: 'economy',
    nameEn: 'Indian Economy & Banking',
    nameHi: 'भारतीय अर्थव्यवस्था एवं बैंकिंग',
    icon: TrendingUp,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    topics: [
      { id: 'eco-1', nameEn: 'Monetary Policy & RBI Framework', nameHi: 'मौद्रिक नीति एवं रिज़र्व बैंक', questionsCount: 25, durationMinutes: 20, isPopular: true },
      { id: 'eco-2', nameEn: 'Fiscal Policy, Budget & Tax Structure', nameHi: 'राजकोषीय नीति एवं बजट', questionsCount: 30, durationMinutes: 25 },
      { id: 'eco-3', nameEn: 'Inflation, Banking NPA & Financial Markets', nameHi: 'मुद्रास्फीति एवं बैंकिंग प्रणाली', questionsCount: 25, durationMinutes: 20 }
    ]
  },
  {
    id: 'geography',
    nameEn: 'Geography & State Studies',
    nameHi: 'भूगोल एवं राज्य अध्ययन',
    icon: Globe2,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
    topics: [
      { id: 'geo-1', nameEn: 'Physical Geography & Indian Rivers', nameHi: 'भौतिक भूगोल एवं भारतीय नदियां', questionsCount: 30, durationMinutes: 25, isPopular: true },
      { id: 'geo-2', nameEn: 'Climate, Monsoons & Agriculture', nameHi: 'जलवायु, मानसून एवं कृषि', questionsCount: 25, durationMinutes: 20 }
    ]
  },
  {
    id: 'csat',
    nameEn: 'CSAT & Logical Reasoning',
    nameHi: 'सीसैट एवं तार्किक अभियोग्यता',
    icon: BrainCircuit,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    topics: [
      { id: 'csat-1', nameEn: 'Deductive Logic & Syllogism', nameHi: 'न्याय वाक्य एवं तार्किक विश्लेषण', questionsCount: 20, durationMinutes: 20, isPopular: true },
      { id: 'csat-2', nameEn: 'Quantitative Aptitude & Data Interpretation', nameHi: 'संख्यात्मक अभियोग्यता', questionsCount: 25, durationMinutes: 25 }
    ]
  }
];

export default function PracticeBankPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState('polity');
  const activeModule = SUBJECT_MODULES.find(m => m.id === selectedSubjectId) || SUBJECT_MODULES[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Page Title & Intro */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            TOPIC-WISE DRILLS &amp; PYQ BANK
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            High-Yield Subject Practice Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Select a subject and initiate chapter-wise speed drills with standard civil services marking (+2.00 / -0.66) and bilingual explanations.
          </p>
        </div>

        {/* 2-Column Practice Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Subject Selector List (Span 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Select Subject</span>
              <Filter className="w-3.5 h-3.5" />
            </div>

            {SUBJECT_MODULES.map((subject) => {
              const Icon = subject.icon;
              const isSelected = subject.id === selectedSubjectId;

              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-1 ring-blue-600'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${subject.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                        {subject.nameEn}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {subject.nameHi}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    {subject.topics.length} Drills
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Topic Drill Cards (Span 8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {activeModule.nameEn}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeModule.nameHi} • Available Chapter Tests
                </p>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
                {activeModule.topics.length} Chapters
              </span>
            </div>

            <div className="space-y-3">
              {activeModule.topics.map((topic, index) => (
                <div
                  key={topic.id}
                  className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Chapter #{index + 1}
                      </span>
                      {topic.isPopular && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          High Weightage
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {topic.nameEn}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {topic.nameHi}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {topic.questionsCount} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {topic.durationMinutes} Minutes
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/quiz?subject=${activeModule.id}`}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Start Drill</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}