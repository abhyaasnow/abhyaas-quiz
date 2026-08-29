'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

interface Chapter {
  titleHi: string;
  titleEn: string;
  questions: number;
}

interface Subject {
  id: string;
  nameHi: string;
  nameEn: string;
  totalChapters: number;
  accuracy: number;
  chapters: Chapter[];
}

const subjectsData: Subject[] = [
  {
    id: 'polity',
    nameHi: 'भारतीय राजव्यवस्था एवं शासन',
    nameEn: 'Indian Polity & Governance',
    totalChapters: 18,
    accuracy: 82,
    chapters: [
      { titleHi: 'प्रस्तावना एवं मुख्य विशेषताएं', titleEn: 'Preamble & Salient Features', questions: 45 },
      { titleHi: 'मौलिक अधिकार एवं कर्तव्य', titleEn: 'Fundamental Rights & Duties', questions: 70 },
      { titleHi: 'राज्य के नीति निर्देशक तत्व', titleEn: 'Directive Principles (DPSP)', questions: 40 },
    ],
  },
  {
    id: 'history',
    nameHi: 'आधुनिक भारत का इतिहास',
    nameEn: 'Modern Indian History',
    totalChapters: 24,
    accuracy: 75,
    chapters: [
      { titleHi: '1857 की क्रांति और स्वतंत्रता संग्राम', titleEn: '1857 Revolt & Freedom Struggle', questions: 50 },
      { titleHi: 'राष्ट्रीय आंदोलन (1905-1919)', titleEn: 'National Movement (1905-1919)', questions: 65 },
      { titleHi: 'गांधी युग और स्वतंत्रता', titleEn: 'Gandhian Era & Independence', questions: 85 },
    ],
  },
  {
    id: 'economy',
    nameHi: 'भारतीय अर्थव्यवस्था एवं बजट',
    nameEn: 'Indian Economy & Budget',
    totalChapters: 15,
    accuracy: 68,
    chapters: [
      { titleHi: 'मौद्रिक नीति एवं बैंकिंग प्रणाली', titleEn: 'Monetary Policy & Banking', questions: 55 },
      { titleHi: 'राजकोषीय नीति एवं केंद्रीय बजट', titleEn: 'Fiscal Policy & Union Budget', questions: 40 },
      { titleHi: 'मुद्रास्फीति एवं राष्ट्रीय आय', titleEn: 'Inflation & National Income', questions: 50 },
    ],
  },
];

export default function SubjectMastery() {
  const [expandedSubject, setExpandedSubject] = useState<string | null>('polity');

  const toggleExpand = (id: string) => {
    setExpandedSubject(expandedSubject === id ? null : id);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-8 sm:mt-10">
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black tracking-wide text-slate-900 uppercase">
            विषयवार टॉपिक अभ्यास <span className="text-blue-700 font-bold">| Subject Mastery</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Chapter-wise PYQ practice & accuracy analysis • अध्यायवार प्रश्नोत्तरी
          </p>
        </div>
        <button className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1">
          Explore All (सभी विषय) <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subjectsData.map((subject) => {
          const isExpanded = expandedSubject === subject.id;

          return (
            <div
              key={subject.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Title & Chapter Count */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
                      {subject.nameHi}
                    </h4>
                    <span className="text-xs font-semibold text-slate-500 block">
                      {subject.nameEn}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0">
                    {subject.totalChapters} Chs / अध्याय
                  </span>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    सरल (Easy)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    मध्यम (PYQ)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    उन्नत (Advanced)
                  </span>
                </div>

                {/* Chapters Accordion */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div
                    onClick={() => toggleExpand(subject.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      पाठ्यक्रम विवरण (Syllabus Breakdown)
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="space-y-1.5 pl-1 pt-1">
                      {subject.chapters.map((ch, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1.5 px-2 rounded-md hover:bg-blue-50/50 text-slate-700 cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 min-w-0 pr-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-slate-800">{ch.titleHi}</span>
                              <span className="text-[11px] text-slate-500 block truncate">({ch.titleEn})</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                            {ch.questions} Qs
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Topic Mastery Progress & Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>सटीकता (Topic Mastery)</span>
                  <span className="text-blue-700 font-extrabold">{subject.accuracy}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${subject.accuracy}%` }}
                  />
                </div>

                <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5">
                  <span>अभ्यास प्रारंभ करें • Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}