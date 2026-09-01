'use client';

import React, { useState, useEffect } from 'react';
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
  Filter,
  Loader2,
  FolderOpen
} from 'lucide-react';

// Live Database Imports
import { getAllQuestions, getCustomCategories, QuestionData, CategoryConfig } from '@/lib/db';

// Dynamic Icons & Colors for newly added categories
const DESIGN_PALETTES = [
  { icon: Landmark, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { icon: Scroll, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { icon: Globe2, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { icon: BrainCircuit, color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

export default function PracticeBankPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  // 1. Fetch Live Data from Cloud Database
  useEffect(() => {
    async function fetchLiveDB() {
      try {
        const [cats, qs] = await Promise.all([
          getCustomCategories(),
          getAllQuestions()
        ]);
        
        setCategories(cats);
        // Only show approved questions
        const liveQs = qs.filter(q => q.approvalStatus !== 'PENDING');
        setQuestions(liveQs);

        // Auto-select the first category if available
        if (cats.length > 0) {
          setSelectedCategoryName(cats[0].name);
        }
      } catch (error) {
        console.error("Error fetching live practice data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLiveDB();
  }, []);

  // 2. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-bold animate-pulse">Syncing Live Practice Drills...</p>
      </div>
    );
  }

  // 3. Process Dynamic Topics for the selected Category
  // We filter questions that belong to the selected category (subject)
  const categoryQuestions = questions.filter(q => q.subject === selectedCategoryName);
  
  // Group questions by 'topic' to create Chapters dynamically
  const topicsMap = new Map<string, QuestionData[]>();
  categoryQuestions.forEach(q => {
    const topic = q.topic || 'General Test';
    if (!topicsMap.has(topic)) {
      topicsMap.set(topic, []);
    }
    topicsMap.get(topic)!.push(q);
  });

  const dynamicChapters = Array.from(topicsMap.entries()).map(([topicName, qs]) => ({
    nameEn: topicName,
    nameHi: 'अभ्यास टेस्ट', // Can be customized later in DB if needed
    questionsCount: qs.length,
    durationMinutes: qs.length * 1, // Estimate 1 min per question
    isPopular: qs.length >= 10 // Highlight if it has many questions
  }));

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

        {categories.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm">
             <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
             <h3 className="text-lg font-bold text-slate-700">No Categories Found</h3>
             <p className="text-slate-500 text-sm mt-1">Please add Categories and Questions from the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Dynamic Subject Selector List (Span 4) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2">
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Select Category</span>
                <Filter className="w-3.5 h-3.5" />
              </div>

              {categories.map((category, index) => {
                const palette = DESIGN_PALETTES[index % DESIGN_PALETTES.length];
                const Icon = palette.icon;
                const isSelected = category.name === selectedCategoryName;
                const countQs = questions.filter(q => q.subject === category.name).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryName(category.name)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${palette.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                          {category.name}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {countQs} Qs
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Dynamic Topic Drill Cards (Span 8) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {selectedCategoryName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Available Live Chapter Tests from Cloud
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold rounded-xl">
                  {dynamicChapters.length} Chapters
                </span>
              </div>

              <div className="space-y-3">
                {dynamicChapters.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center">
                    <p className="text-slate-500 font-medium text-sm">No questions assigned to this category yet.</p>
                  </div>
                ) : (
                  dynamicChapters.map((chapter, index) => (
                    <div
                      key={index}
                      className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            Chapter #{index + 1}
                          </span>
                          {chapter.isPopular && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              High Weightage
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">
                          {chapter.nameEn}
                        </h3>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                            {chapter.questionsCount} Live Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            {chapter.durationMinutes} Minutes
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/quiz?category=${encodeURIComponent(selectedCategoryName)}&topic=${encodeURIComponent(chapter.nameEn)}`}
                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Start Live Drill</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}