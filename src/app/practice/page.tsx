'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Filter, ChevronRight, ArrowRight,
  FolderOpen, Clock, Sparkles, Search, Layers,
  Compass, CheckCircle2
} from 'lucide-react';

import { 
  getTaxonomyNodes, getAllQuestions, 
  TaxonomyNode, QuestionData, formatScientific 
} from '@/lib/db';

export default function DynamicPracticeBank() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [taxonomy, setTaxonomy] = useState<TaxonomyNode[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    async function loadLiveData() {
      try {
        const [taxRes, qsRes] = await Promise.allSettled([
          getTaxonomyNodes(),
          getAllQuestions()
        ]);

        const safeTax = taxRes.status === 'fulfilled' && Array.isArray(taxRes.value) ? taxRes.value : [];
        const safeQs = qsRes.status === 'fulfilled' && Array.isArray(qsRes.value) ? qsRes.value : [];

        // Isolate active, non-archived PRACTICE and PYQ questions
        const practiceOnly = safeQs.filter(q => 
          !q.isArchived && 
          (q.segment === 'PRACTICE' || q.segment === 'PYQ' || !q.segment)
        );

        setTaxonomy(safeTax);
        setQuestions(practiceOnly);

        // Normalize and extract all Classes
        const allClasses = Array.from(new Set([
          ...safeTax.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN').map(t => t.nameEn),
          ...practiceOnly.map(q => q.className || q.class)
        ])).filter(Boolean) as string[];

        if (allClasses.length > 0) {
          setSelectedClass(allClasses[0]);
        }
      } catch (err) {
        console.error("Practice loader error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveData();
  }, []);

  // 1. Normalized Classes
  const availableClasses = useMemo(() => {
    return Array.from(new Set([
      ...taxonomy.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN').map(t => t.nameEn),
      ...questions.map(q => q.className || q.class)
    ])).filter(Boolean) as string[];
  }, [taxonomy, questions]);

  const activeClass = selectedClass || availableClasses[0] || 'General';

  // 2. Questions belonging to Active Class
  const classQuestions = useMemo(() => {
    return questions.filter(q => (q.className || q.class) === activeClass);
  }, [questions, activeClass]);

  const activeClassNode = useMemo(() => {
    return taxonomy.find(t => (t.level === 'CLASS' || t.level === 'DOMAIN') && t.nameEn === activeClass);
  }, [taxonomy, activeClass]);

  // 3. Normalized Target Exams under Active Class
  const availableExams = useMemo(() => {
    return Array.from(new Set([
      ...taxonomy.filter(t => t.level === 'EXAM' && (!activeClassNode || t.parentId === activeClassNode.id)).map(t => t.nameEn),
      ...classQuestions.map(q => q.examName || q.category)
    ])).filter(Boolean) as string[];
  }, [taxonomy, activeClassNode, classQuestions]);

  const activeExam = selectedExam || availableExams[0] || '';

  // 4. Questions belonging to Active Exam
  const examQuestions = useMemo(() => {
    return classQuestions.filter(q => (q.examName || q.category) === activeExam);
  }, [classQuestions, activeExam]);

  const activeExamNode = useMemo(() => {
    return taxonomy.find(t => t.level === 'EXAM' && t.nameEn === activeExam);
  }, [taxonomy, activeExam]);

  // 5. Normalized Subjects under Active Exam
  const availableSubjects = useMemo(() => {
    return Array.from(new Set([
      ...taxonomy.filter(t => t.level === 'SUBJECT' && (!activeExamNode || t.parentId === activeExamNode.id)).map(t => t.nameEn),
      ...examQuestions.map(q => q.subjectName || q.subject)
    ])).filter(Boolean) as string[];
  }, [taxonomy, activeExamNode, examQuestions]);

  // 6. Global stats calculation
  const totalExamQuestionsCount = examQuestions.length;
  const totalTopicsCount = useMemo(() => {
    return new Set(examQuestions.map(q => q.topicName || q.topic || 'General')).size;
  }, [examQuestions]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3 shadow-sm" />
        <p className="text-slate-800 font-black text-xs uppercase tracking-widest">
          Synchronizing Practice Vault...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-32 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Banner & Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                ABHYAAS ALL-INDIA MERIT REPOSITORY
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Standardized Practice Drills
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium">
                High-yield conceptual question sets curated for competitive precision, board foundations, and civil services.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
              <div className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                <p className="text-[10px] font-black uppercase text-slate-400">Total Drills</p>
                <p className="text-sm font-black text-slate-900">{totalExamQuestionsCount} Qs</p>
              </div>
              <div className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                <p className="text-[10px] font-black uppercase text-slate-400">Chapters</p>
                <p className="text-sm font-black text-blue-600">{totalTopicsCount}</p>
              </div>
            </div>
          </div>

          {/* 1. Class Selection Horizontal Bar */}
          {availableClasses.length > 0 && (
            <div className="pt-2">
              <p className="text-[11px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Select Academic Stream / Class
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                {availableClasses.map(cls => {
                  const isSelected = activeClass === cls;
                  return (
                    <button
                      key={cls}
                      onClick={() => { setSelectedClass(cls); setSelectedExam(''); }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 border ${
                        isSelected 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span>{cls}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Target Examinations (Col Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Target Examinations</h2>
                    <p className="text-[10px] text-slate-400 font-bold">{availableExams.length} Programs Under {activeClass}</p>
                  </div>
                </div>
              </div>

              {availableExams.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl space-y-2">
                  <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No Exams Configured</p>
                  <p className="text-[10px] text-slate-400">Add questions in admin for this stream.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableExams.map(exam => {
                    const isSelected = activeExam === exam;
                    const count = classQuestions.filter(q => (q.examName || q.category) === exam).length;

                    return (
                      <button
                        key={exam}
                        onClick={() => setSelectedExam(exam)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="space-y-1 pr-2">
                          <p className={`font-black text-xs leading-snug transition ${isSelected ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>
                            {exam}
                          </p>
                          <p className={`text-[10px] font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {count} Practice {count === 1 ? 'Question' : 'Questions'}
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-slate-300 group-hover:text-slate-600'}`} />
                      </button>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Quality Standard Notice Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Free Open Knowledge Moat</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Practice drills feature complete detailed step-by-step solutions, vector molecular diagrams, and scientific notation rendering.
              </p>
            </div>
          </div>

          {/* Right Panel: Subjects, Topics & Adaptive Test Sets (Col Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeExam ? (
              <div className="space-y-6">
                
                {/* Active Exam Summary Bar & Live Search */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-md border border-blue-200 uppercase">
                        Active Exam Track
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">{activeClass}</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-1">{activeExam}</h2>
                  </div>

                  {/* Search input for instant topic filtering */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Filter chapter or topic..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Subjects & Topics Matrix */}
                {availableSubjects.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-2">
                    <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-slate-800 font-black text-sm">No Subjects Available</p>
                    <p className="text-xs text-slate-400">Questions are being added for this examination track.</p>
                  </div>
                ) : (
                  availableSubjects.map(subj => {
                    const subjectQs = examQuestions.filter(q => (q.subjectName || q.subject) === subj);
                    
                    const allTopics = Array.from(new Set(subjectQs.map(q => q.topicName || q.topic || 'General'))).filter(Boolean) as string[];
                    const filteredTopics = allTopics.filter(t => 
                      t.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      subj.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    if (filteredTopics.length === 0 && searchQuery) return null;

                    return (
                      <div key={subj} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                        
                        {/* Subject Title */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-black text-base text-slate-900">
                                {formatScientific(subj)}
                              </h3>
                              <p className="text-[11px] text-slate-400 font-bold">
                                {subjectQs.length} Questions across {allTopics.length} Chapters
                              </p>
                            </div>
                          </div>
                          
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 font-black text-[10px] rounded-lg uppercase">
                            Official Module
                          </span>
                        </div>

                        {/* Topics Loop */}
                        <div className="space-y-4">
                          {filteredTopics.map(topic => {
                            const topicQs = subjectQs.filter(q => (q.topicName || q.topic || 'General') === topic);
                            const totalCount = topicQs.length;

                            // Adaptive Test Partitioning: 
                            // Every 10 questions creates a dedicated test. If fewer than 10, creates 1 active drill.
                            const testCount = Math.max(1, Math.ceil(totalCount / 10));

                            return (
                              <div key={topic} className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-4">
                                
                                {/* Topic Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <h4 className="font-black text-sm text-slate-900 leading-snug">
                                      {formatScientific(topic)}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                      Active Question Bank: <strong className="text-slate-800">{totalCount} Questions</strong> Available
                                    </p>
                                  </div>
                                  
                                  <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg w-fit">
                                    Topic Assessment
                                  </span>
                                </div>

                                {/* Dynamic Test Cards Grid */}
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {Array.from({ length: testCount }).map((_, testIdx) => {
                                    const testNum = testIdx + 1;
                                    const startQ = testIdx * 10 + 1;
                                    const endQ = Math.min((testIdx + 1) * 10, totalCount);
                                    
                                    // Dual compatible parameters for guaranteed quiz routing
                                    const testUrl = `/quiz?category=${encodeURIComponent(activeExam)}&exam=${encodeURIComponent(activeExam)}&subject=${encodeURIComponent(subj)}&topic=${encodeURIComponent(topic)}&set=${testNum}`;

                                    return (
                                      <div 
                                        key={testNum} 
                                        className="bg-white border border-slate-200 hover:border-blue-500 p-4 rounded-xl flex items-center justify-between shadow-xs transition group"
                                      >
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-1.5">
                                            <p className="font-black text-xs text-slate-900 group-hover:text-blue-600 transition">
                                              Practice Test {testNum}
                                            </p>
                                            {testNum === 1 && totalCount >= 10 && (
                                              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded border border-emerald-200">
                                                STANDARD
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                                            <Clock className="w-3 h-3 text-blue-600" />
                                            {totalCount < 10 ? `${totalCount} Questions • 15 Mins` : `Questions ${startQ}-${endQ} • 15 Mins`}
                                          </p>
                                        </div>

                                        <Link
                                          href={testUrl}
                                          className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition group-hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                          Start Drill <ArrowRight className="w-3.5 h-3.5" />
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
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-bold text-xs space-y-2">
                <Compass className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Select an examination track from the left panel to begin drills.</p>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}