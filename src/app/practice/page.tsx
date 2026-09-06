'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Filter, ChevronRight, ArrowRight,
  FolderOpen, Clock, Sparkles, Search, Layers,
  Compass, CheckCircle2, FileText, GraduationCap,
  Check, Tag, ShieldCheck, HelpCircle
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

  // Navigation & Hierarchy State
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedSegment, setSelectedSegment] = useState<'ALL' | 'PRACTICE' | 'PYQ'>('ALL');
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

        // Isolate active, non-archived questions (Practice & PYQ only)
        const practiceAndPyq = safeQs.filter(q => 
          !q.isArchived && 
          (q.segment === 'PRACTICE' || q.segment === 'PYQ' || !q.segment)
        );

        setTaxonomy(safeTax);
        setQuestions(practiceAndPyq);

        // Extract all Classes from Taxonomy + Questions
        const allClasses = Array.from(new Set([
          ...safeTax.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN').map(t => t.nameEn),
          ...practiceAndPyq.map(q => q.className || q.class)
        ])).filter(Boolean) as string[];

        if (allClasses.length > 0) {
          setSelectedClass(allClasses[0]);
        }
      } catch (err) {
        console.error("Practice repository loader error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveData();
  }, []);

  // 1. Available Classes
  const availableClasses = useMemo(() => {
    return Array.from(new Set([
      ...taxonomy.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN').map(t => t.nameEn),
      ...questions.map(q => q.className || q.class)
    ])).filter(Boolean) as string[];
  }, [taxonomy, questions]);

  const activeClass = selectedClass || availableClasses[0] || '';

  // 2. Questions belonging to Active Class
  const classQuestions = useMemo(() => {
    if (!activeClass) return [];
    return questions.filter(q => (q.className || q.class) === activeClass);
  }, [questions, activeClass]);

  const activeClassNode = useMemo(() => {
    return taxonomy.find(t => (t.level === 'CLASS' || t.level === 'DOMAIN') && t.nameEn === activeClass);
  }, [taxonomy, activeClass]);

  // 3. Target Examinations under Active Class
  const availableExams = useMemo(() => {
    return Array.from(new Set([
      ...taxonomy.filter(t => t.level === 'EXAM' && (!activeClassNode || t.parentId === activeClassNode.id)).map(t => t.nameEn),
      ...classQuestions.map(q => q.examName || q.category)
    ])).filter(Boolean) as string[];
  }, [taxonomy, activeClassNode, classQuestions]);

  const activeExam = selectedExam || availableExams[0] || '';

  // 4. Questions belonging to Active Exam & Segment Filter
  const examQuestions = useMemo(() => {
    if (!activeExam) return [];
    return classQuestions.filter(q => {
      const matchExam = (q.examName || q.category) === activeExam;
      const matchSegment = selectedSegment === 'ALL' || q.segment === selectedSegment;
      return matchExam && matchSegment;
    });
  }, [classQuestions, activeExam, selectedSegment]);

  const activeExamNode = useMemo(() => {
    return taxonomy.find(t => t.level === 'EXAM' && t.nameEn === activeExam);
  }, [taxonomy, activeExam]);

  // 5. Subjects under Active Exam
  const availableSubjects = useMemo(() => {
    return Array.from(new Set([
      ...taxonomy.filter(t => t.level === 'SUBJECT' && (!activeExamNode || t.parentId === activeExamNode.id)).map(t => t.nameEn),
      ...examQuestions.map(q => q.subjectName || q.subject)
    ])).filter(Boolean) as string[];
  }, [taxonomy, activeExamNode, examQuestions]);

  // 6. Metrics Calculations
  const totalExamQuestionsCount = examQuestions.length;
  const totalTopicsCount = useMemo(() => {
    return new Set(examQuestions.map(q => q.topicName || q.topic || 'General')).size;
  }, [examQuestions]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-slate-800 border-t-transparent rounded-full animate-spin mb-3 shadow-xs" />
        <p className="text-slate-800 font-bold text-xs uppercase tracking-widest">
          Synchronizing Knowledge Repository...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-32 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* Institutional Academic Banner */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2.5 shadow-sm flex items-center justify-center gap-2 text-xs font-medium text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-white font-bold">ABHYAAS OPEN KNOWLEDGE REPOSITORY:</strong> All conceptual practice drills and official past year archives (PYQ) are completely open access with verified solutions.
        </span>
      </div>

      {/* Header & Stream Selection */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-blue-700" />
                <span>Chapter-Wise Conceptual Mastery & PYQ Archives</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Standardized Practice Drills
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">
                Precision-curated question sets categorized by academic disciplines, competitive examinations, and individual chapter modules.
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl shrink-0">
              <div className="text-center px-3 border-r border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Questions</p>
                <p className="text-xl font-black text-slate-900">{totalExamQuestionsCount}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Topics</p>
                <p className="text-xl font-black text-blue-600">{totalTopicsCount}</p>
              </div>
            </div>
          </div>

          {/* Academic Stream / Class Horizontal Bar */}
          {availableClasses.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Select Academic Stream / Grade
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                {availableClasses.map(cls => {
                  const isSelected = activeClass === cls;
                  return (
                    <button
                      key={cls}
                      onClick={() => { setSelectedClass(cls); setSelectedExam(''); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border cursor-pointer ${
                        isSelected 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cls}</span>
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
          
          {/* Left Panel: Examination Tracks (Col Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase text-slate-900 tracking-wider">Target Examination</h2>
                    <p className="text-[10px] text-slate-400 font-medium">{availableExams.length} Programs Configured</p>
                  </div>
                </div>
              </div>

              {availableExams.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl space-y-2">
                  <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No Examinations Found</p>
                  <p className="text-[10px] text-slate-400">Add questions or exams in admin to activate this stream.</p>
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
                        className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <p className="font-bold text-xs leading-snug">
                            {exam}
                          </p>
                          <p className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {count} Question{count === 1 ? '' : 's'} in Bank
                          </p>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-slate-300 group-hover:text-slate-600'}`} />
                      </button>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Quality Charter Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Scientific Solutions</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Every practice module includes detailed explanations, formula formatting, and chemical subscripts.
              </p>
            </div>
          </div>

          {/* Right Panel: Mode Toggle, Search & Chapter-Wise Drills (Col Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeExam ? (
              <div className="space-y-6">
                
                {/* Active Program Bar, Segment Filter & Search */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                        {activeClass}
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-1">{activeExam}</h2>
                    </div>

                    {/* Dual Mode: Practice vs PYQ */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                      <button
                        onClick={() => setSelectedSegment('ALL')}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          selectedSegment === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setSelectedSegment('PRACTICE')}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          selectedSegment === 'PRACTICE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Practice Drills
                      </button>
                      <button
                        onClick={() => setSelectedSegment('PYQ')}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                          selectedSegment === 'PYQ' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Official PYQs
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search within chapter titles or topics..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-800 focus:bg-white transition"
                    />
                  </div>

                </div>

                {/* Subjects & Chapter Modules Loop */}
                {availableSubjects.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-2 shadow-xs">
                    <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="font-bold text-sm text-slate-800">No Questions Found</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      There are currently no active practice questions matching this examination or segment. Upload questions via Admin Question Studio.
                    </p>
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
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-slate-900">
                                {formatScientific(subj)}
                              </h3>
                              <p className="text-[11px] text-slate-400">
                                {subjectQs.length} Question{subjectQs.length === 1 ? '' : 's'} across {allTopics.length} Chapters
                              </p>
                            </div>
                          </div>
                          
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-lg uppercase">
                            Discipline Module
                          </span>
                        </div>

                        {/* Topics & Test Sets Grid */}
                        <div className="space-y-4">
                          {filteredTopics.map(topic => {
                            const topicQs = subjectQs.filter(q => (q.topicName || q.topic || 'General') === topic);
                            const totalCount = topicQs.length;

                            // 10 questions per test drill
                            const testCount = Math.max(1, Math.ceil(totalCount / 10));

                            return (
                              <div key={topic} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                                
                                {/* Topic Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                                      {formatScientific(topic)}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Available Questions: <strong className="text-slate-800">{totalCount}</strong>
                                    </p>
                                  </div>
                                  
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg w-fit">
                                    Chapter Mastery
                                  </span>
                                </div>

                                {/* Partitioned Test Sets */}
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {Array.from({ length: testCount }).map((_, testIdx) => {
                                    const testNum = testIdx + 1;
                                    const startQ = testIdx * 10 + 1;
                                    const endQ = Math.min((testIdx + 1) * 10, totalCount);
                                    
                                    const testUrl = `/quiz?category=${encodeURIComponent(activeExam)}&exam=${encodeURIComponent(activeExam)}&subject=${encodeURIComponent(subj)}&topic=${encodeURIComponent(topic)}&set=${testNum}&segment=${selectedSegment}`;

                                    return (
                                      <div 
                                        key={testNum} 
                                        className="bg-white border border-slate-200 hover:border-slate-400 p-4 rounded-xl flex items-center justify-between shadow-xs transition group"
                                      >
                                        <div className="space-y-0.5">
                                          <p className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition">
                                            Practice Drill Set {testNum}
                                          </p>
                                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {totalCount < 10 ? `${totalCount} Questions • 15 Mins` : `Questions ${startQ}–${endQ} • 15 Mins`}
                                          </p>
                                        </div>

                                        <Link
                                          href={testUrl}
                                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
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
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 font-medium text-xs space-y-2">
                <Compass className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Select an examination track from the left panel to display practice modules.</p>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}