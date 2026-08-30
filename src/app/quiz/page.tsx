'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Send,
  Loader2
} from 'lucide-react';
import { getAllQuestions, QuestionData } from '@/lib/db';

const FALLBACK_QUESTIONS: QuestionData[] = [
  {
    id: 'fb-1',
    subject: 'polity',
    topic: 'Constitutional Framework & Preamble',
    questionEn: 'Which Article of the Constitution of India guarantees the Right to Constitutional Remedies?',
    questionHi: 'भारत के संविधान का कौन सा अनुच्छेद संवैधानिक उपचारों के अधिकार की गारंटी देता है?',
    optionsEn: ['Article 14', 'Article 19', 'Article 21', 'Article 32'],
    optionsHi: ['अनुच्छेद 14', 'अनुच्छेद 19', 'अनुच्छेद 21', 'अनुच्छेद 32'],
    correctOption: 3,
    approvalStatus: 'APPROVED_OLYMPIAD',
    timesUsedInOlympiad: 0,
  },
  {
    id: 'fb-2',
    subject: 'polity',
    topic: 'Fundamental Rights',
    questionEn: 'Under Article 21, the right to privacy was declared a Fundamental Right in which landmark judgment?',
    questionHi: 'अनुच्छेद 21 के तहत निजता के अधिकार को किस ऐतिहासिक फैसले में मौलिक अधिकार घोषित किया गया था?',
    optionsEn: ['Kesavananda Bharati Case', 'K.S. Puttaswamy Case', 'Maneka Gandhi Case', 'Minerva Mills Case'],
    optionsHi: ['केशवानंद भारती मामला', 'के.एस. पुट्टास्वामी मामला', 'मेनका गांधी मामला', 'मिनर्वा मिल्स मामला'],
    correctOption: 1,
    approvalStatus: 'APPROVED_OLYMPIAD',
    timesUsedInOlympiad: 0,
  }
];

function QuizArenaContent() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject') || 'polity';

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 Minutes
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Fetch live questions from Firestore Cloud
  useEffect(() => {
    async function loadQuizQuestions() {
      setLoading(true);
      try {
        const cloudQuestions = await getAllQuestions();
        const filtered = cloudQuestions.filter(
          (q) =>
            q.subject === subjectParam &&
            (q.approvalStatus === 'APPROVED_OLYMPIAD' || q.approvalStatus === 'APPROVED_PRACTICE')
        );

        if (filtered.length > 0) {
          setQuestions(filtered);
        } else if (cloudQuestions.length > 0) {
          setQuestions(cloudQuestions);
        } else {
          setQuestions(FALLBACK_QUESTIONS);
        }
      } catch (err) {
        console.error('Error fetching quiz questions:', err);
        setQuestions(FALLBACK_QUESTIONS);
      } finally {
        setLoading(false);
      }
    }

    loadQuizQuestions();
  }, [subjectParam]);

  // 2. Countdown Timer Engine
  useEffect(() => {
    if (isSubmitted || loading) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, loading]);

  const currentQ = questions[currentIndex] || FALLBACK_QUESTIONS[0];

  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleClearResponse = () => {
    if (isSubmitted) return;
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentIndex];
      return copy;
    });
  };

  // Score Calculation (+2.00 / -0.66)
  const calculateResults = () => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === undefined) {
        unattempted++;
      } else if (ans === q.correctOption) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const rawScore = correct * 2.0 - incorrect * 0.66;
    const accuracy = correct + incorrect > 0 ? ((correct / (correct + incorrect)) * 100).toFixed(1) : '0';

    return {
      correct,
      incorrect,
      unattempted,
      score: rawScore.toFixed(2),
      accuracy,
    };
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          Initializing Proctored Test Vault...
        </p>
      </div>
    );
  }

  // ================= SCORECARD SUMMARY VIEW =================
  if (isSubmitted) {
    const results = calculateResults();

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
              <Trophy className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Assessment Completed</h2>
            <p className="text-xs text-slate-400">All-India Provisional Score &amp; Accuracy Report</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Raw Score</span>
              <p className="text-xl font-black text-amber-400 mt-1">{results.score}</p>
              <span className="text-[10px] text-slate-500">Max: {questions.length * 2}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Accuracy</span>
              <p className="text-xl font-black text-emerald-400 mt-1">{results.accuracy}%</p>
              <span className="text-[10px] text-slate-500">Precision Ratio</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Correct</span>
              <p className="text-xl font-black text-blue-400 mt-1">{results.correct} / {questions.length}</p>
              <span className="text-[10px] text-slate-500">+{results.correct * 2} Marks</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setUserAnswers({});
                setIsSubmitted(false);
                setTimeRemaining(1200);
                setCurrentIndex(0);
              }}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Practice Drill</span>
            </button>

            <Link
              href="/leaderboard"
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              <span>View All-India Rankings</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= LIVE PROCTORED TEST VIEW =================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Test Arena Top Control Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs">
              A
            </div>
            <div>
              <h1 className="font-bold text-xs sm:text-sm text-slate-200">
                Abhyaas National Testing Arena
              </h1>
              <span className="text-[10px] text-slate-400">
                Marking: +2.00 / -0.66 • Section: {currentQ.topic}
              </span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-400">
              <Clock className="w-4 h-4" />
              <span>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>

            <button
              onClick={() => {
                if (confirm('Kya aap sach me test submit karna chahte hain?')) {
                  setIsSubmitted(true);
                }
              }}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Test</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main 2-Column Quiz Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-grow grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Dual Bilingual Question Card (Span 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-bold text-amber-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold">
                Bilingual Rendering
              </span>
            </div>

            {/* Bilingual Statements */}
            <div className="space-y-3">
              <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {currentQ.questionEn}
              </p>
              <p className="text-sm sm:text-base font-medium text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
                {currentQ.questionHi}
              </p>
            </div>

            {/* Diagram Image if exists */}
            {currentQ.diagramUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-64 max-w-md">
                <img src={currentQ.diagramUrl} alt="Question Diagram" className="w-full h-full object-contain bg-slate-950" />
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.optionsEn.map((optEn, oIdx) => {
                const isSelected = userAnswers[currentIndex] === oIdx;

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleOptionSelect(oIdx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </div>
                    <div className="space-y-0.5 text-xs sm:text-sm">
                      <p className="font-semibold text-white">{optEn}</p>
                      <p className="text-slate-400 font-medium">{currentQ.optionsHi[oIdx]}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <button
                onClick={handleClearResponse}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition font-bold cursor-pointer"
              >
                Clear Selection
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Question Palette Grid (Span 4) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300">Question Palette</span>
            <span className="text-[11px] text-amber-400 font-bold">
              {Object.keys(userAnswers).length} / {questions.length} Attempted
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, idx) => {
              const isCurrent = currentIndex === idx;
              const isAnswered = userAnswers[idx] !== undefined;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'border-2 border-amber-400 text-white bg-amber-500/20'
                      : isAnswered
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-600" />
              <span>Answered (हल किया)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
              <span>Unattempted (छोड़ा गया)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/20 border-2 border-amber-400" />
              <span>Current Question (वर्तमान प्रश्न)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function QuizArenaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Loading Assessment Arena...
          </p>
        </div>
      }
    >
      <QuizArenaContent />
    </Suspense>
  );
}