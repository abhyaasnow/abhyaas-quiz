'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  Globe, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Check,
  Award,
  Loader2
} from 'lucide-react';
import { getAllQuestions, QuestionData } from '@/lib/db';

interface QuizQuestion {
  id: string;
  subject: string;
  topic: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOption: number;
}

const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    subject: 'polity',
    topic: 'Preamble & Philosophy',
    questionEn: 'Which of the following ideals in the Preamble of the Indian Constitution emphasizes economic and political empowerment alongside social equality?',
    questionHi: 'भारतीय संविधान की प्रस्तावना में निम्नलिखित में से कौन सा आदर्श सामाजिक समानता के साथ-साथ आर्थिक और राजनीतिक सशक्तिकरण पर बल देता है?',
    optionsEn: [
      'Liberty of thought and expression',
      'Justice: Social, Economic and Political',
      'Fraternity assuring the dignity of the individual',
      'Equality of status and of opportunity'
    ],
    optionsHi: [
      'विचार और अभिव्यक्ति की स्वतंत्रता',
      'न्याय: सामाजिक, आर्थिक और राजनीतिक',
      'व्यक्ति की गरिमा सुनिश्चित करने वाली बंधुता',
      'प्रतिष्ठा और अवसर की समता'
    ],
    correctOption: 1
  },
  {
    id: 'q2',
    subject: 'polity',
    topic: 'Fundamental Rights',
    questionEn: 'Under which Article of the Constitution of India is the Right to Privacy declared as an intrinsic part of the Right to Life and Personal Liberty?',
    questionHi: 'भारत के संविधान के किस अनुच्छेद के तहत निजता के अधिकार को जीवन और व्यक्तिगत स्वतंत्रता के अधिकार का एक अभिन्न अंग घोषित किया गया है?',
    optionsEn: [
      'Article 14',
      'Article 19',
      'Article 21',
      'Article 25'
    ],
    optionsHi: [
      'अनुच्छेद 14',
      'अनुच्छेद 19',
      'अनुच्छेद 21',
      'अनुच्छेद 25'
    ],
    correctOption: 2
  },
  {
    id: 'q3',
    subject: 'polity',
    topic: 'Panchayati Raj & 73rd Amendment',
    questionEn: 'Which Schedule was added to the Constitution of India by the 73rd Constitutional Amendment Act, 1992 relating to Panchayati Raj Institutions?',
    questionHi: '73वें संविधान संशोधन अधिनियम, 1992 द्वारा पंचायती राज संस्थाओं से संबंधित कौन सी अनुसूची भारतीय संविधान में जोड़ी गई थी?',
    optionsEn: [
      '10th Schedule',
      '11th Schedule',
      '12th Schedule',
      '9th Schedule'
    ],
    optionsHi: [
      '10वीं अनुसूची',
      '11वीं अनुसूची',
      '12वीं अनुसूची',
      '9वीं अनुसूची'
    ],
    correctOption: 1
  },
  {
    id: 'q4',
    subject: 'polity',
    topic: 'Constitutional Amendments',
    questionEn: 'The Delimitation Commission in India is constituted under Article 82 and Article 170. Which Amendment Act froze the delimitation of parliamentary constituencies until the first census after 2026?',
    questionHi: 'भारत में परिसीमन आयोग का गठन अनुच्छेद 82 और अनुच्छेद 170 के तहत किया जाता है। किस संशोधन अधिनियम ने 2026 के बाद की पहली जनगणना तक संसदीय निर्वाचन क्षेत्रों के परिसीमन पर रोक लगा दी थी?',
    optionsEn: [
      '42nd Constitutional Amendment Act',
      '84th Constitutional Amendment Act',
      '86th Constitutional Amendment Act',
      '91st Constitutional Amendment Act'
    ],
    optionsHi: [
      '42वां संविधान संशोधन अधिनियम',
      '84वां संविधान संशोधन अधिनियम',
      '86वां संविधान संशोधन अधिनियम',
      '91वां संविधान संशोधन अधिनियम'
    ],
    correctOption: 1
  },
  {
    id: 'q5',
    subject: 'history',
    topic: 'Modern History',
    questionEn: 'Who among the following presided over the historic 1929 Lahore Session of the Indian National Congress where the "Purna Swaraj" resolution was adopted?',
    questionHi: 'भारतीय राष्ट्रीय कांग्रेस के ऐतिहासिक 1929 के लाहौर अधिवेशन की अध्यक्षता निम्नलिखित में से किसने की थी, जहाँ "पूर्ण स्वराज" का प्रस्ताव पारित किया गया था?',
    optionsEn: [
      'Mahatma Gandhi',
      'Jawaharlal Nehru',
      'Subhash Chandra Bose',
      'Sardar Vallabhbhai Patel'
    ],
    optionsHi: [
      'महात्मा गांधी',
      'जवाहरलाल नेहरू',
      'सुभाष चंद्र बोस',
      'सरदार वल्लभभाई पटेल'
    ],
    correctOption: 1
  }
];

export default function ProctoredQuizArenaPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(FALLBACK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60); // 45 Minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Anti-Cheat Warnings
  const [proctorWarnings, setProctorWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // 1. Fetch Cloud Questions
  useEffect(() => {
    async function loadQuestions() {
      try {
        const cloudData = await getAllQuestions();
        if (cloudData && cloudData.length > 0) {
          const mapped: QuizQuestion[] = cloudData.map((q, idx) => ({
            id: q.id || `q_${idx}`,
            subject: q.subject,
            topic: q.topic,
            questionEn: q.questionEn,
            questionHi: q.questionHi,
            optionsEn: q.optionsEn,
            optionsHi: q.optionsHi,
            correctOption: q.correctOption,
          }));
          setQuestions(mapped);
        }
      } catch (err) {
        console.error('Using fallback practice questions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  // 2. Submit Handler
  const handleFinalSubmit = useCallback(() => {
    setIsSubmitted(true);
  }, []);

  // 3. Live Timer
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, handleFinalSubmit]);

  // 4. Anti-Cheat Visibility / Tab Switching Listener
  useEffect(() => {
    if (isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setProctorWarnings((prev) => {
          const next = prev + 1;
          setShowWarningModal(true);
          if (next >= 3) {
            handleFinalSubmit();
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted, handleFinalSubmit]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Option selection
  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const toggleMarkReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const clearCurrentResponse = () => {
    const copy = { ...selectedAnswers };
    delete copy[currentIndex];
    setSelectedAnswers(copy);
  };

  // Calculation for Result
  const totalQuestions = questions.length;
  const attemptedCount = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  let incorrectCount = 0;

  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] !== undefined) {
      if (selectedAnswers[idx] === q.correctOption) {
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }
    }
  });

  const rawScore = (correctCount * 2 - incorrectCount * 0.66).toFixed(2);
  const accuracyPercent = attemptedCount > 0 ? ((correctCount / attemptedCount) * 100).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Loading Proctored Assessment Environment...
        </p>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: FINAL DIAGNOSTIC SCORECARD
  // =========================================================================
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Assessment Concluded &amp; Audited
              </h1>
              <p className="text-xs text-slate-400">
                All-India Proctored Performance &amp; Sectional Diagnostic Summary
              </p>
            </div>

            {/* 4 Core Score Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Raw Score (+2 / -0.66)</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">{rawScore}</span>
              </div>
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Accuracy Rate</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">{accuracyPercent}%</span>
              </div>
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Correct / Attempted</span>
                <span className="text-xl sm:text-2xl font-black text-blue-400 mt-1 block">{correctCount} / {attemptedCount}</span>
              </div>
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Proctor Warnings</span>
                <span className={`text-xl sm:text-2xl font-black mt-1 block ${proctorWarnings > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {proctorWarnings} / 3
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <Link
                href="/leaderboard"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Trophy className="w-4 h-4" />
                <span>View All-India Merit Standings</span>
              </Link>
              <Link
                href="/practice"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>Return to Practice Bank</span>
              </Link>
            </div>
          </div>

          {/* Step-by-Step Question Keys */}
          <div className="space-y-4">
            <h3 className="font-black text-lg text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Detailed Solutions &amp; Verified Answer Keys
            </h3>

            {questions.map((q, idx) => {
              const userChoice = selectedAnswers[idx];
              const isCorrect = userChoice === q.correctOption;
              const isAttempted = userChoice !== undefined;

              return (
                <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-bold text-slate-400">Question #{idx + 1} • {q.topic}</span>
                    {isAttempted ? (
                      isCorrect ? (
                        <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-bold text-[11px] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> +2.00 Correct
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md font-bold text-[11px] flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> -0.66 Incorrect
                        </span>
                      )
                    ) : (
                      <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 rounded-md font-bold text-[11px]">
                        Unattempted (0.00)
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-sm text-white">{q.questionEn}</p>
                  <p className="text-xs text-slate-400">{q.questionHi}</p>

                  <div className="grid sm:grid-cols-2 gap-2 pt-2">
                    {q.optionsEn.map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === q.correctOption;
                      const isOptionSelected = oIdx === userChoice;

                      let badgeClass = 'bg-slate-800/60 border-slate-800 text-slate-300';
                      if (isOptionCorrect) {
                        badgeClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        badgeClass = 'bg-rose-500/20 border-rose-500 text-rose-300';
                      }

                      return (
                        <div key={oIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${badgeClass}`}>
                          <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                          {isOptionCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE PROCTORED TEST ARENA
  // =========================================================================
  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Test Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
            A
          </div>
          <div>
            <h2 className="font-black text-xs sm:text-sm text-white">
              Abhyaas Proctored Assessment Arena
            </h2>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Anti-Cheat Proctoring Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'hi' ? 'हिन्दी (Active)' : 'English (Active)'}</span>
          </button>

          {/* Countdown Clock */}
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-black text-xs sm:text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={handleFinalSubmit}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition shadow-md cursor-pointer"
          >
            Submit Paper
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Question Canvas (Span 8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-600/30 text-blue-300 font-bold uppercase text-[10px]">
                {currentQ.subject}
              </span>
              <span className="text-slate-400 font-semibold">{currentQ.topic}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Marking:</span>
              <span className="text-emerald-400 font-bold">+2.00</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400 font-bold">-0.66</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <span className="font-black text-blue-400 text-sm sm:text-base">Q.{currentIndex + 1}</span>
              <p className="font-bold text-sm sm:text-base text-white leading-relaxed">
                {lang === 'hi' ? currentQ.questionHi : currentQ.questionEn}
              </p>
            </div>
            <p className="text-xs text-slate-400 pl-6 leading-relaxed">
              {lang === 'hi' ? currentQ.questionEn : currentQ.questionHi}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {(lang === 'hi' ? currentQ.optionsHi : currentQ.optionsEn).map((opt, oIdx) => {
              const isSelected = selectedAnswers[currentIndex] === oIdx;

              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-1 ring-blue-500'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="text-xs sm:text-sm">{opt}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMarkReview}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  markedForReview[currentIndex]
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{markedForReview[currentIndex] ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>

              <button
                onClick={clearCurrentResponse}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold transition cursor-pointer"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={currentIndex === totalQuestions - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-xs font-black transition flex items-center gap-1 cursor-pointer shadow-md"
              >
                <span>Save &amp; Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right: Question Palette (Span 4) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          
          <div className="space-y-1 pb-3 border-b border-slate-800">
            <h3 className="font-black text-sm text-white">Question Navigation Palette</h3>
            <p className="text-[11px] text-slate-400">Total: {totalQuestions} Questions</p>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
            {questions.map((_, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isFlagged = markedForReview[idx];
              const isCurrent = currentIndex === idx;

              let btnStyle = 'bg-slate-800 text-slate-400 border-slate-700';
              if (isCurrent) {
                btnStyle = 'bg-blue-600 text-white font-black ring-2 ring-blue-400';
              } else if (isFlagged) {
                btnStyle = 'bg-purple-600 text-white font-bold';
              } else if (isAnswered) {
                btnStyle = 'bg-emerald-600 text-white font-bold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl text-xs flex items-center justify-center transition cursor-pointer border ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span>Answered ({Object.keys(selectedAnswers).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600" />
              <span>Marked Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Current</span>
            </div>
          </div>

        </div>

      </div>

      {/* Anti-Cheat Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-rose-400">Proctor Security Warning #{proctorWarnings}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tab switching or minimizing the examination window is strictly prohibited under the Academic Integrity Code.
              </p>
            </div>

            <p className="text-[11px] text-amber-400 font-bold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
              {3 - proctorWarnings} warnings remaining before automatic disqualification &amp; paper submission.
            </p>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition cursor-pointer"
            >
              I Understand &amp; Return to Exam
            </button>
          </div>
        </div>
      )}

    </div>
  );
}