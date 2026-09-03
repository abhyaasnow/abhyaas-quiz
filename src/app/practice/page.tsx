'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Filter, ChevronRight, ArrowRight,
  FolderOpen, Lock, Clock
} from 'lucide-react';

import { 
  getTaxonomyNodes, getAllQuestions, 
  TaxonomyNode, QuestionData 
} from '@/lib/db';

const MIN_TEST_THRESHOLD = 10; // Eligibility: 10 Questions per Test

export default function DynamicPracticeBank() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [taxonomy, setTaxonomy] = useState<TaxonomyNode[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);

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

        // Practice & PYQ questions only
        const practiceOnly = safeQs.filter(q => q.segment === 'PRACTICE' || q.segment === 'PYQ' || !q.segment);

        setTaxonomy(safeTax);
        setQuestions(practiceOnly);

        // Auto-extract Classes
        const allClasses = Array.from(new Set([
          ...safeTax.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN').map(t => t.nameEn),
          ...practiceOnly.map(q => q.className)
        ])).filter(Boolean);

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

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-700 font-extrabold text-xs tracking-wide">
          Loading Practice Tests...
        </p>
      </div>
    );
  }

  // Extract Classes
  const availableClasses = Array.from(new Set([
    ...taxonomy.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN').map(t => t.nameEn),
    ...questions.map(q => q.className)
  ])).filter(Boolean);

  const activeClass = selectedClass || availableClasses[0] || 'General';

  // Extract Exams for Active Class
  const classQuestions = questions.filter(q => q.className === activeClass);
  const activeClassNode = taxonomy.find(t => (t.level === 'CLASS' || t.level === 'DOMAIN') && t.nameEn === activeClass);
  
  const availableExams = Array.from(new Set([
    ...taxonomy.filter(t => t.level === 'EXAM' && (!activeClassNode || t.parentId === activeClassNode.id)).map(t => t.nameEn),
    ...classQuestions.map(q => q.examName)
  ])).filter(Boolean);

  const activeExam = selectedExam || availableExams[0] || '';

  // Extract Subjects for Active Exam
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
            Topic-Wise Practice Drills
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium">
            Select your class and target examination to access standardized chapter practice tests.
          </p>
        </div>

        {/* 1. Class Selection Bar */}
        {availableClasses.length > 0 && (
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
        )}

        {/* 2. Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Target Exams (Span 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="px-2 text-xs font-black uppercase text-slate-400 flex items-center justify-between">
              <span>Target Examinations</span>
              <Filter className="w-3.5 h-3.5" />
            </div>

            {availableExams.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No Examinations Available</p>
              </div>
            ) : (
              availableExams.map(exam => {
                const isSelected = activeExam === exam;

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
                    <p className="font-extrabold text-sm text-slate-900">{exam}</p>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Subjects & Tests (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            {activeExam ? (
              <div className="space-y-6">
                
                {/* Active Exam Header */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{activeExam}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Stream: <span className="font-bold text-slate-700">{activeClass}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black rounded-xl border border-blue-200 w-fit">
                    Full-Length Tests
                  </span>
                </div>

                {/* Subjects List */}
                {availableSubjects.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-2">
                    <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-slate-800 font-extrabold text-sm">No Subjects Available Yet</p>
                  </div>
                ) : (
                  availableSubjects.map(subj => {
                    const subjectQs = examQuestions.filter(q => q.subjectName === subj);
                    const topics = Array.from(new Set(subjectQs.map(q => q.topicName || 'General'))).filter(Boolean);

                    return (
                      <div key={subj} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                        
                        {/* Subject Title */}
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="font-black text-base text-slate-900">{subj}</h3>
                        </div>

                        {/* Topics & Test Cards */}
                        <div className="space-y-4">
                          {topics.map(topic => {
                            const topicQs = subjectQs.filter(q => (q.topicName || 'General') === topic);
                            const totalCount = topicQs.length;
                            const unlockedCount = Math.floor(totalCount / MIN_TEST_THRESHOLD);

                            return (
                              <div key={topic} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                                
                                {/* Topic Header */}
                                <div className="flex items-center justify-between">
                                  <h4 className="font-extrabold text-sm text-slate-900">{topic}</h4>
                                  <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                                    Chapter Test
                                  </span>
                                </div>

                                {/* Test Cards: Clean & Pure UI */}
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {unlockedCount === 0 ? (
                                    /* LOCKED STATE: Clean, Professional, Zero Backend Notes */
                                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                                      <div>
                                        <p className="font-bold text-xs text-slate-800">Practice Test 1</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">10 Questions • 15 Mins</p>
                                      </div>
                                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold border border-slate-200">
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>Test Locked</span>
                                      </div>
                                    </div>
                                  ) : (
                                    /* UNLOCKED STATE */
                                    Array.from({ length: unlockedCount }).map((_, testIdx) => {
                                      const testNum = testIdx + 1;
                                      const testUrl = `/quiz?exam=${encodeURIComponent(activeExam)}&subject=${encodeURIComponent(subj)}&topic=${encodeURIComponent(topic)}&set=${testNum}`;

                                      return (
                                        <div key={testNum} className="bg-white border border-slate-200 hover:border-blue-500 p-4 rounded-xl flex items-center justify-between shadow-sm transition">
                                          <div>
                                            <p className="font-bold text-xs text-slate-900">Practice Test {testNum}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                                              <Clock className="w-3 h-3 text-blue-600" /> 10 Questions • 15 Mins
                                            </p>
                                          </div>
                                          <Link
                                            href={testUrl}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition"
                                          >
                                            Start Test <ArrowRight className="w-3 h-3" />
                                          </Link>
                                        </div>
                                      );
                                    })
                                  )}
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
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-medium text-sm">
                Select an examination from the left panel to explore practice tests.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}