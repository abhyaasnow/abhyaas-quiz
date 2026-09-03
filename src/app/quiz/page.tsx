'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, 
  RotateCcw, Sparkles, Languages, Award, Share2, HelpCircle 
} from 'lucide-react';

import { getAllQuestions, QuestionData } from '@/lib/db';

export interface QuestionItem {
  id: string;
  category: string;
  subject: string;
  topic: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOption: number;
  diagramUrl?: string | null;
  explanationEn: string;
  explanationHi: string;
}

// Scientific Formula & Chemical Equation Formatter
function FormattedScientificText({ text }: { text: string }) {
  if (!text) return null;

  // Format common chemical formulas (e.g. CO2 -> CO₂, H2O -> H₂O, LiFePO4 -> LiFePO₄)
  // and math powers (x^2 -> x²)
  const formatted = text
    .replace(/\bCO2\b/g, 'CO₂')
    .replace(/\bH2O\b/g, 'H₂O')
    .replace(/\bO2\b/g, 'O₂')
    .replace(/\bN2\b/g, 'N₂')
    .replace(/\bLiFePO4\b/g, 'LiFePO₄')
    .replace(/\bSO4\b/g, 'SO₄')
    .replace(/\bNO3\b/g, 'NO₃')
    .replace(/\bx\^2\b/g, 'x²')
    .replace(/\bx\^3\b/g, 'x³');

  return <span>{formatted}</span>;
}

function QuizEngine() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const subjectParam = searchParams.get('subject') || '';
  const topicParam = searchParams.get('topic') || '';

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [useHindi, setUseHindi] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    async function loadTestQuestions() {
      try {
        const all = await getAllQuestions();
        
        // Only active questions (exclude recycle bin and quarantined Olympiad)
        let filtered = all.filter(q => q.segment !== 'OLYMPIAD' && !q.isArchived);

        if (categoryParam) {
          const matchExam = filtered.filter(q => 
            q.examName.toLowerCase() === categoryParam.toLowerCase() || 
            q.category.toLowerCase() === categoryParam.toLowerCase()
          );
          if (matchExam.length > 0) filtered = matchExam;
        }

        if (subjectParam) {
          const matchSubj = filtered.filter(q => 
            q.subjectName.toLowerCase() === subjectParam.toLowerCase() || 
            q.subject.toLowerCase() === subjectParam.toLowerCase()
          );
          if (matchSubj.length > 0) filtered = matchSubj;
        }

        if (topicParam && topicParam !== 'All') {
          const matchTopic = filtered.filter(q => 
            q.topicName.toLowerCase() === topicParam.toLowerCase() || 
            q.topic.toLowerCase() === topicParam.toLowerCase()
          );
          if (matchTopic.length > 0) filtered = matchTopic;
        }

        const sourceList = filtered.length > 0 ? filtered : all.filter(q => !q.isArchived);

        const mappedItems: QuestionItem[] = sourceList.map(q => ({
          id: String(q.id),
          category: String(q.examName || q.category || 'General Studies'),
          subject: String(q.subjectName || q.subject || 'General Studies'),
          topic: String(q.topicName || q.topic || 'General'),
          questionEn: String(q.questionEn || 'Question text missing'),
          questionHi: String(q.questionHi || q.questionEn || ''),
          optionsEn: Array.isArray(q.optionsEn) ? q.optionsEn : ['', '', '', ''],
          optionsHi: Array.isArray(q.optionsHi) ? q.optionsHi : ['', '', '', ''],
          correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
          diagramUrl: q.diagramUrl || null,
          explanationEn: String(q.explanationEn || ''),
          explanationHi: String(q.explanationHi || q.explanationEn || '')
        }));

        setQuestions(mappedItems);
        setTimeLeft(Math.max(mappedItems.length * 60, 300));
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTestQuestions();
  }, [categoryParam, subjectParam, topicParam]);

  useEffect(() => {
    if (isSubmitted || timeLeft <= 0 || loading) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, loading]);

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    let wrong = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (selected !== undefined) {
        if (selected === q.correctOption) correct++;
        else wrong++;
      }
    });
    const rawMarks = (correct * 2) - (wrong * 0.66);
    return {
      correct,
      wrong,
      unattempted: questions.length - (correct + wrong),
      marks: Math.max(0, parseFloat(rawMarks.toFixed(2)))
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-600 font-bold text-xs">Preparing Speed Drill...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-200 p-8 rounded-3xl space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">No Questions In This Topic Yet</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please add questions for this exam stream from the Admin Command Center.
          </p>
          <Link href="/practice" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
            Back to Practice Streams
          </Link>
        </div>
      </div>
    );
  }

  const scoreStats = calculateScore();
  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/practice" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Exit Drill
          </Link>

          <div className="text-center hidden sm:block">
            <p className="text-xs font-black text-slate-900">{categoryParam || currentQ.category}</p>
            <p className="text-[10px] text-slate-500 font-bold">{subjectParam || currentQ.subject}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseHindi(!useHindi)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-lg border border-slate-300 flex items-center gap-1 transition"
            >
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              {useHindi ? 'हिंदी Active' : 'English Active'}
            </button>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-black ${
              timeLeft < 120 ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {isSubmitted && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black rounded uppercase">
                  Drill Completed
                </span>
                <h2 className="text-2xl font-black mt-2">Performance Assessment</h2>
                <p className="text-xs text-slate-400">Civil Services Marking Standard (+2.00 / -0.66)</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-emerald-400">{scoreStats.marks} <span className="text-xs text-slate-400 font-normal">/ {questions.length * 2}</span></p>
                <p className="text-xs text-slate-400 mt-0.5">Total Score</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <p className="text-slate-400">Correct</p>
                <p className="text-xl font-black text-emerald-400 mt-1">{scoreStats.correct}</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <p className="text-slate-400">Incorrect</p>
                <p className="text-xl font-black text-rose-400 mt-1">{scoreStats.wrong}</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <p className="text-slate-400">Skipped</p>
                <p className="text-xl font-black text-slate-400 mt-1">{scoreStats.unattempted}</p>
              </div>
            </div>
          </div>
        )}

        {/* Question Numbers Strip */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {questions.map((_, i) => {
            const isAnswered = selectedAnswers[i] !== undefined;
            const isCurrent = currentIndex === i;
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-9 h-9 shrink-0 rounded-xl text-xs font-black transition flex items-center justify-center border ${
                  isCurrent ? 'ring-2 ring-blue-600 shadow-sm' : ''
                } ${
                  isSubmitted
                    ? selectedAnswers[i] === questions[i].correctOption
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : selectedAnswers[i] !== undefined
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-200 text-slate-600'
                    : isAnswered
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Question Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Guaranteed Category Header Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {currentQ.category}
              </span>
              <span className="text-xs font-bold text-slate-600">
                {currentQ.subject} {currentQ.topic ? `• ${currentQ.topic}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400">
                Q.{currentIndex + 1} / {questions.length}
              </span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                +2.00 / -0.66
              </span>
            </div>
          </div>

          {/* Statement */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              <FormattedScientificText text={useHindi && currentQ.questionHi ? currentQ.questionHi : currentQ.questionEn} />
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              <FormattedScientificText text={useHindi ? currentQ.questionEn : currentQ.questionHi} />
            </p>
          </div>

          {/* Diagram / Map */}
          {currentQ.diagramUrl && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl w-fit max-w-full">
              <img src={currentQ.diagramUrl} alt="Diagram" className="max-h-64 object-contain rounded-xl" />
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {[0, 1, 2, 3].map(optIdx => {
              const optText = useHindi && currentQ.optionsHi?.[optIdx] ? currentQ.optionsHi[optIdx] : currentQ.optionsEn[optIdx];
              const optAltText = useHindi ? currentQ.optionsEn?.[optIdx] : currentQ.optionsHi?.[optIdx];
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              const isCorrectAnswer = currentQ.correctOption === optIdx;

              let cardStyle = 'bg-white border-slate-200 hover:border-slate-300';
              if (isSubmitted) {
                if (isCorrectAnswer) cardStyle = 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950 font-bold';
                else if (isSelected && !isCorrectAnswer) cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
              } else if (isSelected) {
                cardStyle = 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 text-blue-950 font-bold';
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentIndex, optIdx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        <FormattedScientificText text={optText || `Option ${optIdx + 1}`} />
                      </p>
                      {optAltText && optAltText !== optText && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          <FormattedScientificText text={optAltText} />
                        </p>
                      )}
                    </div>
                  </div>
                  {isSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isSubmitted && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Solution Analysis */}
          {isSubmitted && (
            <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 text-xs leading-relaxed animate-in fade-in">
              <div className="flex items-center gap-1.5 text-blue-950 font-black">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>विस्तृत समाधान / DETAILED SOLUTION:</span>
              </div>
              <p className="text-slate-800 font-medium">
                <FormattedScientificText text={useHindi && currentQ.explanationHi ? currentQ.explanationHi : currentQ.explanationEn} />
              </p>
              {currentQ.explanationHi && currentQ.explanationEn && (
                <p className="text-slate-500 pt-1 border-t border-blue-200/60">
                  <FormattedScientificText text={useHindi ? currentQ.explanationEn : currentQ.explanationHi} />
                </p>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Next
              </button>
            ) : !isSubmitted ? (
              <button
                onClick={() => setIsSubmitted(true)}
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition"
              >
                Submit Drill
              </button>
            ) : (
              <button
                onClick={() => { setIsSubmitted(false); setSelectedAnswers({}); setCurrentIndex(0); }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
              >
                <RotateCcw className="w-4 h-4" /> Retake Drill
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono">Loading Drill...</div>}>
      <QuizEngine />
    </Suspense>
  );
}