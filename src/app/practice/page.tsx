'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Layers, Filter, ChevronRight, ArrowRight,
  FolderOpen, Lock, CheckCircle2, Clock, AlertCircle, Sparkles
} from 'lucide-react';

import { 
  getTaxonomyNodes, getAllQuestions, 
  TaxonomyNode, QuestionData 
} from '@/lib/db';

// Enterprise Test Packaging Constant
const MIN_TEST_THRESHOLD = 10; // 10 Questions required per Test Set

export default function DynamicPracticeBank() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [taxonomy, setTaxonomy] = useState<TaxonomyNode[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  // Navigation State
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');

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

        // Filter only practice/PYQ questions
        const practiceOnly = safeQs.filter(q => q.segment === 'PRACTICE' || q.segment === 'PYQ' || !q.segment);

        setTaxonomy(safeTax);
        setQuestions(practiceOnly);

        // Auto-detect Classes from both taxonomy & questions
        const allClasses = Array.from(new Set([
          ...safeTax.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN').map(t => t.nameEn),
          ...practiceOnly.map(q => q.className)
        ])).filter(Boolean);

        if (allClasses.length > 0) {
          setSelectedClass(allClasses[0]);
        }
      } catch (err) {
        console.error("Practice bank safe-loader:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLiveData();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-700 font-extrabold text-xs tracking-wide">
          Synchronizing Practice Repositories & Test Modules...
        </p>
      </div>
    );
  }

  // ==================== 1. DYNAMIC CATEGORY MAPPING ====================
  // Extract All Classes
  const availableClasses = Array.from(new Set([
    ...taxonomy.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN').map(t => t.nameEn),
    ...questions.map(q => q.className)
  ])).filter(Boolean);

  const activeClass = selectedClass || availableClasses[0] || 'General';

  // Extract Exams linked to Active Class
  const classQuestions = questions.filter(q => q.className === activeClass);
  const activeClassNode = taxonomy.find(t => (t.level === 'CLASS' || t.level === 'DOMAIN') && t.nameEn === activeClass);
  
  const availableExams = Array.from(new Set([
    ...taxonomy.filter(t => t.level === 'EXAM' && (!activeClassNode || t.parentId === activeClassNode.id)).map(t => t.nameEn),
    ...classQuestions.map(q => q.examName)
  ])).filter(Boolean);

  const activeExam = selectedExam || availableExams[0] || '';

  // Extract Subjects linked to Active Exam
  const examQuestions = classQuestions.filter(q => q.examName === activeExam);
  const activeExamNode = taxonomy.find(t => t.level === 'EXAM' && t.nameEn === activeExam);

  const availableSubjects = Array.from(new Set([
    ...taxonomy.filter(t => t.level === 'SUBJECT' && (!activeExamNode || t.parentId === activeExamNode.id)).map(t => t.nameEn),
    ...examQuestions.map(q => q.subjectName)
  ])).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Intro */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
            <BookOpen className="w-3.5 h-3.5" />
            STANDARDIZED PRACTICE SUITE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            High-Yield Speed Drills & Tests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium">
            Tests are structured in standardized 10-question batches with real exam timers and instant bilingual solutions.
          </p>
        </div>

        {/* 1. Dynamic Class Bar */}
        {availableClasses.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
            {availableClasses.map(cls => (
              <button
                key={cls}
                onClick={() => { setSelectedClass(cls); setSelectedExam(''); }}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                  activeClass === cls 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-800">
            No Classes created yet in Admin.
          </div>
        )}

        {/* 2. Main Dual-Column Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Target Examinations (Span 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="px-2 text-xs font-black uppercase text-slate-400 flex items-center justify-between">
              <span>Target Examinations</span>
              <Filter className="w-3.5 h-3.5" />
            </div>

            {availableExams.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No Examinations Found</p>
              </div>
            ) : (
              availableExams.map(exam => {
                const isSelected = activeExam === exam;
                const totalQs = classQuestions.filter(q => q.examName === exam).length;

                return (
                  <button
                    key={exam}
                    onClick={() => setSelectedExam(exam)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-sm text-slate-900">{exam}</p>
                      <p className="text-[11px] text-slate-500 font-bold mt-0.5">{totalQs} Questions Ingested</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Subjects & 10-Question Test Modules (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            {activeExam ? (
              <div className="space-y-6">
                
                {/* Active Exam Banner */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{activeExam}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Stream: <span className="font-bold text-slate-700">{activeClass}</span> • Active Test Modules
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-xl border border-blue-200 w-fit">
                    10 Qs / Test Algorithm Active
                  </span>
                </div>

                {/* Subject Modules */}
                {availableSubjects.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-2">
                    <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-slate-800 font-extrabold text-sm">No Subjects Linked Yet</p>
                  </div>
                ) : (
                  availableSubjects.map(subj => {
                    const subjectQs = examQuestions.filter(q => q.subjectName === subj);
                    
                    // Group questions by Topic
                    const topics = Array.from(new Set(subjectQs.map(q => q.topicName || 'General'))).filter(Boolean);

                    return (
                      <div key={subj} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                        
                        {/* Subject Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <h3 className="font-black text-base text-slate-900">{subj}</h3>
                            <p className="text-xs text-slate-500">{subjectQs.length} Questions in Repository</p>
                          </div>
                          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            {topics.length} Chapters
                          </span>
                        </div>

                        {/* Topics & Packaged Tests */}
                        <div className="space-y-4">
                          {topics.map(topic => {
                            const topicQs = subjectQs.filter(q => (q.topicName || 'General') === topic);
                            const totalCount = topicQs.length;

                            // ==================== ALGORITHM: 10-QUESTION BATCHING ====================
                            const completeTestsCount = Math.floor(totalCount / MIN_TEST_THRESHOLD);
                            const pendingCount = totalCount % MIN_TEST_THRESHOLD;

                            return (
                              <div key={topic} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                  <div>
                                    <h4 className="font-extrabold text-sm text-slate-900">{topic}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      Total Questions: <strong>{totalCount}</strong> • Complete 10-Q Tests: <strong>{completeTestsCount}</strong>
                                    </p>
                                  </div>

                                  {/* Compilation Status Pill */}
                                  {completeTestsCount === 0 ? (
                                    <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit">
                                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                                      Under Compilation ({totalCount}/{MIN_TEST_THRESHOLD} Qs)
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      {completeTestsCount} Test{completeTestsCount > 1 ? 's' : ''} Ready
                                    </span>
                                  )}
                                </div>

                                {/* Render Packaged Tests Or Under-Construction State */}
                                {completeTestsCount === 0 ? (
                                  <div className="p-4 bg-white border border-dashed border-amber-200 rounded-xl flex items-center justify-between text-xs">
                                    <div className="space-y-0.5">
                                      <p className="font-bold text-amber-900">
                                        Test Set 1 Locked (Needs {MIN_TEST_THRESHOLD - totalCount} more questions)
                                      </p>
                                      <p className="text-[11px] text-slate-400">
                                        छात्रों के लिए टेस्ट तभी लाइव होगा जब पूरे {MIN_TEST_THRESHOLD} प्रश्न पूरे होंगे।
                                      </p>
                                    </div>
                                    <span className="px-3 py-1.5 bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed">
                                      Locked
                                    </span>
                                  </div>
                                ) : (
                                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                                    {Array.from({ length: completeTestsCount }).map((_, testIdx) => {
                                      const testNumber = testIdx + 1;
                                      const testUrl = `/quiz?exam=${encodeURIComponent(activeExam)}&subject=${encodeURIComponent(subj)}&topic=${encodeURIComponent(topic)}&set=${testNumber}`;

                                      return (
                                        <div key={testNumber} className="bg-white border border-slate-200 hover:border-blue-500 p-4 rounded-xl flex items-center justify-between shadow-sm transition">
                                          <div>
                                            <p className="font-black text-xs text-slate-900">
                                              Practice Test {testNumber}
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                              <Clock className="w-3 h-3 text-blue-600" /> 10 Questions • 15 Mins
                                            </p>
                                          </div>
                                          <Link
                                            href={testUrl}
                                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition"
                                          >
                                            Start <ArrowRight className="w-3 h-3" />
                                          </Link>
                                        </div>
                                      );
                                    })}

                                    {/* If some extra questions exist towards the next test */}
                                    {pendingCount > 0 && (
                                      <div className="bg-slate-100/70 border border-dashed border-slate-300 p-4 rounded-xl flex items-center justify-between text-xs opacity-75">
                                        <div>
                                          <p className="font-bold text-slate-700">Test {completeTestsCount + 1} (Compiling)</p>
                                          <p className="text-[10px] text-slate-500">{pendingCount}/{MIN_TEST_THRESHOLD} questions added</p>
                                        </div>
                                        <Lock className="w-4 h-4 text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                )}

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
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-medium text-sm">
                Select an examination from the left panel to explore standardized drills.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}