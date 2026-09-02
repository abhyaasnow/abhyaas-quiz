'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Sparkles, ArrowRight, Filter, 
  FolderOpen, ChevronRight, Layers, HelpCircle, AlertCircle
} from 'lucide-react';

import { 
  getTaxonomyNodes, getAllQuestions, getCustomCategories, 
  TaxonomyNode, QuestionData, CategoryConfig 
} from '@/lib/db';

export default function DynamicPracticeBank() {
  const [loading, setLoading] = useState(true);
  const [taxonomy, setTaxonomy] = useState<TaxonomyNode[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [legacyCategories, setLegacyCategories] = useState<CategoryConfig[]>([]);
  
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    async function loadLivePractice() {
      try {
        const [taxRes, qsRes, catsRes] = await Promise.allSettled([
          getTaxonomyNodes(),
          getAllQuestions(),
          getCustomCategories()
        ]);

        if (!isMounted) return;

        const safeTax = taxRes.status === 'fulfilled' && Array.isArray(taxRes.value) ? taxRes.value : [];
        const safeQs = qsRes.status === 'fulfilled' && Array.isArray(qsRes.value) ? qsRes.value : [];
        const safeCats = catsRes.status === 'fulfilled' && Array.isArray(catsRes.value) ? catsRes.value : [];

        setTaxonomy(safeTax);
        setQuestions(safeQs);
        setLegacyCategories(safeCats);

        // Auto-select first domain safely
        const domains = safeTax.filter(t => t && t.level === 'DOMAIN');
        if (domains.length > 0 && domains[0]?.id) {
          setSelectedDomainId(domains[0].id);
        }
      } catch (err) {
        console.error("Practice bank safe-loader caught:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLivePractice();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-700 font-extrabold text-sm tracking-wide animate-pulse">
          Connecting to Abhyaas Question Vault...
        </p>
      </div>
    );
  }

  // Safe Taxonomy Extraction
  const domains = taxonomy.filter(t => t && t.level === 'DOMAIN');
  const availableExams = taxonomy.filter(t => t && t.level === 'EXAM' && (!t.parentId || t.parentId === selectedDomainId));
  
  const currentExam = availableExams.find(e => e?.id === selectedExamId) || (availableExams.length > 0 ? availableExams[0] : null);
  const subjects = currentExam ? taxonomy.filter(t => t && t.level === 'SUBJECT' && t.parentId === currentExam.id) : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Intro */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
            <BookOpen className="w-3.5 h-3.5" />
            TOPIC-WISE DRILLS & PYQ BANK
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            High-Yield Subject Practice Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium">
            Select an exam stream and initiate chapter-wise speed drills with standard marking schemes and bilingual explanations.
          </p>
        </div>

        {/* Domain Bar (Classes / Streams) */}
        {domains.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
            {domains.map(dom => (
              <button
                key={dom.id}
                onClick={() => { setSelectedDomainId(dom.id); setSelectedExamId(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  selectedDomainId === dom.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {dom.nameEn || 'Domain'}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900">Taxonomy is ready. Add your first Domain/Class from the Admin Panel.</span>
            </div>
            <Link href="/admin" className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
              Open Admin
            </Link>
          </div>
        )}

        {/* Main Workspace */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Target Exams (Span 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="px-2 text-xs font-black uppercase text-slate-400 flex items-center justify-between">
              <span>Target Exams</span>
              <Filter className="w-3.5 h-3.5" />
            </div>

            {availableExams.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No Exams linked yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Admin पैनल में इस Domain के अंदर Exam जोड़ें।</p>
              </div>
            ) : (
              availableExams.map(exam => {
                const isSelected = currentExam?.id === exam.id;
                return (
                  <button
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-sm text-slate-900">{exam.nameEn || 'Exam'}</p>
                      {exam.nameHi && <p className="text-xs text-slate-500 font-medium">{exam.nameHi}</p>}
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Subjects & Chapter Cards (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            {currentExam ? (
              <div className="space-y-4">
                
                {/* Active Exam Header Bar */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{currentExam.nameEn}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentExam.nameHi ? `${currentExam.nameHi} • ` : ''}Available Live Practice Modules
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl border border-emerald-200 w-fit">
                    Live Cloud Sync
                  </span>
                </div>

                {/* Subject Modules */}
                {subjects.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-2">
                    <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-slate-800 font-extrabold text-sm">No Subjects Added Yet</p>
                    <p className="text-xs text-slate-400">Admin Panel के Taxonomy Studio में जाकर इस Exam के लिए Subject जोड़ें।</p>
                  </div>
                ) : (
                  subjects.map(subj => {
                    const topicsUnderSubject = taxonomy.filter(t => t && t.level === 'TOPIC' && t.parentId === subj.id);
                    return (
                      <div key={subj.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <h3 className="font-black text-base text-slate-900">{subj.nameEn}</h3>
                            {subj.nameHi && <p className="text-xs text-slate-500 font-medium">{subj.nameHi}</p>}
                          </div>
                          <span className="text-xs font-bold text-slate-400">{topicsUnderSubject.length} Chapters</span>
                        </div>

                        {topicsUnderSubject.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No chapters added under this subject yet.</p>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {topicsUnderSubject.map(top => (
                              <div key={top.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center hover:border-blue-400 transition">
                                <div>
                                  <p className="font-bold text-xs text-slate-900">{top.nameEn}</p>
                                  {top.nameHi && <p className="text-[11px] text-slate-500">{top.nameHi}</p>}
                                </div>
                                <Link 
                                  href={`/quiz?category=${encodeURIComponent(currentExam.nameEn || 'General')}&topic=${encodeURIComponent(top.nameEn || 'All')}`} 
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition"
                                >
                                  Drill <ArrowRight className="w-3 h-3" />
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-medium text-sm">
                Select an exam from the left panel to view drills.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}