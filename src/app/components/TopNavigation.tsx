'use client';

import React from 'react';
import { BookOpen, GraduationCap, Layers, Star, Globe } from 'lucide-react';

interface TopNavigationProps {
  currentLang: 'hi' | 'en';
  onLangChange: (lang: 'hi' | 'en') => void;
  activeExam: string;
  onExamChange: (exam: string) => void;
}

export default function TopNavigation({
  currentLang,
  onLangChange,
  activeExam,
  onExamChange,
}: TopNavigationProps) {
  const [activeMainTab, setActiveMainTab] = React.useState<'SUBJECTS' | 'EXAMINATIONS' | 'TOPICS'>('EXAMINATIONS');

  const mainTabs = [
    { id: 'SUBJECTS', labelEn: 'SUBJECTS', labelHi: 'विषय (Subjects)', icon: BookOpen },
    { id: 'EXAMINATIONS', labelEn: 'EXAMS', labelHi: 'परीक्षाएं (Exams)', fullLabel: 'EXAMINATIONS', icon: GraduationCap },
    { id: 'TOPICS', labelEn: 'TOPICS', labelHi: 'टॉपिक्स (Topics)', icon: Layers },
  ] as const;

  const exams = ['All Exams', 'UPSC CSE', 'State PCS', 'SSC CGL', 'Defence / CDS'];

  return (
    <div className="w-full bg-white border-b border-slate-200/80 py-3 sm:py-4 shadow-xs overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3">
        
        {/* Top Row: Main Tabs + Prominent Language Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
          
          {/* Three Main Academic Tabs */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 w-full sm:flex-1 bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`flex items-center justify-center gap-1 sm:gap-2 py-2 px-1.5 rounded-lg sm:rounded-xl font-black text-[11px] sm:text-xs tracking-tight transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{currentLang === 'hi' ? tab.labelHi : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Medium Selector (ENG | हिन्दी) */}
          <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 p-1 rounded-xl flex-shrink-0">
            <span className="text-[10px] font-black text-blue-900 px-2 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-600" />
              {currentLang === 'hi' ? 'माध्यम:' : 'Medium:'}
            </span>
            <button
              onClick={() => onLangChange('hi')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                currentLang === 'hi'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => onLangChange('en')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                currentLang === 'en'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

        </div>

        {/* Exam Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 -mx-3 sm:mx-0 sm:justify-center px-3 sm:px-0">
          {exams.map((exam) => {
            const isSelected = activeExam === exam;
            return (
              <button
                key={exam}
                onClick={() => onExamChange(exam)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {isSelected && <Star className="w-3 h-3 fill-amber-500 text-amber-500 flex-shrink-0" />}
                <span className="whitespace-nowrap">{exam}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}