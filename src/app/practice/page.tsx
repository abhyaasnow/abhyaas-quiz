'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Filter, ArrowRight,
  FolderOpen, Clock, Search, Layers,
  Compass, CheckCircle2, GraduationCap,
  Check, Tag, ShieldCheck, Sparkles, FileText, Archive
} from 'lucide-react';

import { 
  getTaxonomyNodes, getAllQuestions, 
  TaxonomyNode, QuestionData 
} from '@/lib/db';
import MathRenderer from '@/components/MathRenderer';

export default function DynamicPracticeBank() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [taxonomy, setTaxonomy] = useState<TaxonomyNode[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  // LEVEL 1: Academic Dimension
  const [selectedDimension, setSelectedDimension] = useState<'ALL' | 'EXAM' | 'CLASS' | 'SUBJECT' | 'TOPIC'>('ALL');

  // LEVEL 2: Dynamic Sub-Category (Loaded purely from database)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('ALL');

  // LEVEL 3: Mode Filter (Practice Drills vs Past Olympiad Archive)
  const [selectedSegment, setSelectedSegment] = useState<'ALL' | 'PRACTICE' | 'PYQ'>('ALL');

  // Search Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    async function loadLivePracticeData() {
      try {
        const [taxRes, qsRes] = await Promise.allSettled([
          getTaxonomyNodes(),
          getAllQuestions()
        ]);

        const safeTax = taxRes.status === 'fulfilled' && Array.isArray(taxRes.value) ? taxRes.value : [];
        const safeQs = qsRes.status === 'fulfilled' && Array.isArray(qsRes.value) ? qsRes.value : [];

        // Isolate active, non-archived questions (Practice & Completed Olympiad Archive only)
        const practiceOnly = safeQs.filter(q => 
          !q.isArchived && 
          (q.segment === 'PRACTICE' || q.segment === 'PYQ' || !q.segment)
        );

        setTaxonomy(safeTax);
        setQuestions(practiceOnly);
      } catch (err) {
        console.error("Practice repository loader error:", err);
        setTaxonomy([]);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    loadLivePracticeData();
  }, []);

  // 1. DYNAMIC SUB-CATEGORIES
  const subCategoryOptions = useMemo(() => {
    if (selectedDimension === 'ALL') return [];

    const itemsSet = new Set<string>();

    taxonomy.forEach(node => {
      if (selectedDimension === 'EXAM' && node.level === 'EXAM') itemsSet.add(node.nameEn);
      if (selectedDimension === 'CLASS' && (node.level === 'CLASS' || node.level === 'DOMAIN')) itemsSet.add(node.nameEn);
      if (selectedDimension === 'SUBJECT' && node.level === 'SUBJECT') itemsSet.add(node.nameEn);
      if (selectedDimension === 'TOPIC' && node.level === 'TOPIC') itemsSet.add(node.nameEn);
    });

    questions.forEach(q => {
      if (selectedDimension === 'EXAM' && (q.examName || q.category)) itemsSet.add(q.examName || q.category);
      if (selectedDimension === 'CLASS' && (q.className || q.class)) itemsSet.add(q.className || q.class);
      if (selectedDimension === 'SUBJECT' && (q.subjectName || q.subject)) itemsSet.add(q.subjectName || q.subject);
      if (selectedDimension === 'TOPIC' && (q.topicName || q.topic)) itemsSet.add(q.topicName || q.topic);
    });

    return Array.from(itemsSet).filter(Boolean);
  }, [selectedDimension, taxonomy, questions]);

  // 2. FILTERED QUESTIONS ENGINE
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (selectedSegment !== 'ALL' && q.segment !== selectedSegment) {
        return false;
      }

      if (selectedDimension !== 'ALL' && selectedSubCategory !== 'ALL') {
        const target = selectedSubCategory.toLowerCase();
        let matched = false;

        if (selectedDimension === 'EXAM') {
          matched = (q.examName || q.category || '').toLowerCase().includes(target);
        } else if (selectedDimension === 'CLASS') {
          matched = (q.className || q.class || '').toLowerCase().includes(target);
        } else if (selectedDimension === 'SUBJECT') {
          matched = (q.subjectName || q.subject || '').toLowerCase().includes(target);
        } else if (selectedDimension === 'TOPIC') {
          matched = (q.topicName || q.topic || '').toLowerCase().includes(target);
        }

        if (!matched) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesStatement = (q.questionEn || '').toLowerCase().includes(query) || (q.questionHi || '').toLowerCase().includes(query);
        const matchesSubject = (q.subjectName || q.subject || '').toLowerCase().includes(query);
        const matchesTopic = (q.topicName || q.topic || '').toLowerCase().includes(query);
        const matchesExam = (q.examName || q.category || '').toLowerCase().includes(query);
        if (!matchesStatement && !matchesSubject && !matchesTopic && !matchesExam) return false;
      }

      return true;
    });
  }, [questions, selectedSegment, selectedDimension, selectedSubCategory, searchQuery]);

  // 3. GROUP BY SUBJECT AND TOPIC
  const groupedModules = useMemo(() => {
    const subjectsMap: Record<string, Record<string, QuestionData[]>> = {};

    filteredQuestions.forEach(q => {
      const subj = q.subjectName || q.subject || 'General Studies';
      const top = q.topicName || q.topic || 'General Chapter';

      if (!subjectsMap[subj]) subjectsMap[subj] = {};
      if (!subjectsMap[subj][top]) subjectsMap[subj][top] = [];

      subjectsMap[subj][top].push(q);
    });

    return subjectsMap;
  }, [filteredQuestions]);

  const totalFilteredQuestionsCount = filteredQuestions.length;
  const totalTopicsCount = useMemo(() => {
    let count = 0;
    Object.values(groupedModules).forEach(topics => {
      count += Object.keys(topics).length;
    });
    return count;
  }, [groupedModules]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mb-3 shadow-xs" />
        <p className="text-slate-800 font-bold text-xs uppercase tracking-widest">
          Synchronizing Knowledge Repository...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-32 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* Official Academic Charter Notice */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2.5 shadow-sm flex items-center justify-center gap-2 text-xs font-medium text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-white font-bold">ABHYAAS OPEN KNOWLEDGE REPOSITORY:</strong> All conceptual practice drills and retrospective past Olympiad archives are completely open-access with verified step-by-step solutions.
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>Chapter-Wise Conceptual Mastery & Past Olympiad Archives</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Standardized Practice Drills
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Precision-Curated Questions • Past Olympiad Retrospective Vault • Bilingual Step-by-Step Solutions
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl shrink-0">
              <div className="text-center px-3 border-r border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Questions</p>
                <p className="text-xl font-black text-slate-900">{totalFilteredQuestionsCount}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Modules</p>
                <p className="text-xl font-black text-blue-600">{totalTopicsCount}</p>
              </div>
            </div>
          </div>

          {/* LEVEL 1: ACADEMIC DIMENSION SELECTOR */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Choose Category Dimension</span>
              </span>
              {selectedDimension !== 'ALL' && (
                <button
                  onClick={() => {
                    setSelectedDimension('ALL');
                    setSelectedSubCategory('ALL');
                  }}
                  className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  View All Questions
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'ALL', label: 'All Categories', desc: 'Browse full question bank' },
                { id: 'EXAM', label: 'Examinations', desc: 'UPSC, SSC, JEE, NEET...' },
                { id: 'CLASS', label: 'Classes & Grades', desc: 'Class 6–8, 9–10, 11–12...' },
                { id: 'SUBJECT', label: 'Subjects', desc: 'Polity, Physics, Maths...' },
                { id: 'TOPIC', label: 'Topics & Chapters', desc: 'Chapter-wise modules...' }
              ].map(dim => {
                const isSelected = selectedDimension === dim.id;
                return (
                  <button
                    key={dim.id}
                    onClick={() => {
                      setSelectedDimension(dim.id as any);
                      setSelectedSubCategory('ALL');
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-600'
                        : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <p className="font-black text-xs">{dim.label}</p>
                    <p className={`text-[10px] mt-1 font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {dim.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LEVEL 2: DYNAMIC SUB-CATEGORIES */}
          {selectedDimension !== 'ALL' && (
            <div className="pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>
                    Select {selectedDimension === 'EXAM' ? 'Target Examination' :
                           selectedDimension === 'CLASS' ? 'Target Class / Standard' :
                           selectedDimension === 'SUBJECT' ? 'Subject Discipline' : 'Topic / Chapter'}
                  </span>
                </span>
                {selectedSubCategory !== 'ALL' && (
                  <button
                    onClick={() => setSelectedSubCategory('ALL')}
                    className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {subCategoryOptions.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
                  No {selectedDimension.toLowerCase()} items found in the database.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSubCategory('ALL')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      selectedSubCategory === 'ALL'
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Available ({subCategoryOptions.length})
                  </button>

                  {subCategoryOptions.map(sub => {
                    const isSelected = selectedSubCategory === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubCategory(sub)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <MathRenderer text={sub} />
                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* LEVEL 3: DRILL MODE TOGGLE (PRACTICE VS PAST OLYMPIAD ARCHIVE) & SEARCH */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-fit">
              <button
                onClick={() => setSelectedSegment('ALL')}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedSegment === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Question Sets
              </button>
              <button
                onClick={() => setSelectedSegment('PRACTICE')}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedSegment === 'PRACTICE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📘 Conceptual Practice
              </button>
              <button
                onClick={() => setSelectedSegment('PYQ')}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                  selectedSegment === 'PYQ' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏛️ Past Olympiad Archive
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search within question bank..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-800 focus:bg-white transition"
              />
            </div>
          </div>

        </div>
      </div>

      {/* LEVEL 4: STRUCTURED PRACTICE DRILL MODULES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {totalFilteredQuestionsCount === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3 shadow-xs">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">No Questions Found in Repository</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              There are currently no active questions matching this selection in the database. Questions uploaded via the Admin Question Studio or completed Olympiads will populate here automatically.
            </p>
          </div>
        ) : (
          Object.keys(groupedModules).map(subject => {
            const topicGroups = groupedModules[subject];
            const subjectQuestionsCount = Object.values(topicGroups).reduce((acc, qs) => acc + qs.length, 0);

            return (
              <div key={subject} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                
                {/* Subject Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">
                        <MathRenderer text={subject} />
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {subjectQuestionsCount} Question{subjectQuestionsCount === 1 ? '' : 's'} across {Object.keys(topicGroups).length} Topic{Object.keys(topicGroups).length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-lg uppercase">
                    Subject Module
                  </span>
                </div>

                {/* Topics & 10-Question Test Drill Sets */}
                <div className="space-y-4">
                  {Object.keys(topicGroups).map(topic => {
                    const topicQs = topicGroups[topic];
                    const totalCount = topicQs.length;
                    const testCount = Math.max(1, Math.ceil(totalCount / 10));

                    return (
                      <div key={topic} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                        
                        {/* Topic Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 leading-snug">
                              <MathRenderer text={topic} />
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Available Questions: <strong className="text-slate-800">{totalCount}</strong>
                            </p>
                          </div>
                          
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg w-fit">
                            Chapter Mastery
                          </span>
                        </div>

                        {/* Partitioned Test Sets */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Array.from({ length: testCount }).map((_, testIdx) => {
                            const testNum = testIdx + 1;
                            const startQ = testIdx * 10 + 1;
                            const endQ = Math.min((testIdx + 1) * 10, totalCount);
                            
                            const testUrl = `/quiz?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}&set=${testNum}&segment=${selectedSegment}`;

                            return (
                              <div 
                                key={testNum} 
                                className="bg-white border border-slate-200 hover:border-slate-400 p-4 rounded-xl flex items-center justify-between shadow-xs transition group"
                              >
                                <div className="space-y-0.5">
                                  <p className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition">
                                    {selectedSegment === 'PYQ' ? `Olympiad Archive Drill ${testNum}` : `Practice Drill Set ${testNum}`}
                                  </p>
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {totalCount < 10 ? `${totalCount} Questions • 15 Mins` : `Questions ${startQ}–${endQ} • 15 Mins`}
                                  </p>
                                </div>

                                <Link
                                  href={testUrl}
                                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                                >
                                  Start <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}