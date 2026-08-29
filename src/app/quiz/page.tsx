'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Timer,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  FileText,
  Check,
  Eye,
  Award,
  Sparkles,
  Zap,
  Info,
  X
} from 'lucide-react';

interface Question {
  id: number;
  subject: string;
  topic: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOption: number; // 0-indexed
  explanationEn: string;
  explanationHi: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: 'Indian Polity',
    topic: 'Fundamental Rights',
    questionEn: 'Which of the following Articles of the Indian Constitution guarantees the "Right to Constitutional Remedies" to citizens?',
    questionHi: 'भारतीय संविधान का कौन सा अनुच्छेद नागरिकों को "संवैधानिक उपचारों का अधिकार" प्रदान करता है?',
    optionsEn: ['Article 19', 'Article 21', 'Article 32', 'Article 226'],
    optionsHi: ['अनुच्छेद 19', 'अनुच्छेद 21', 'अनुच्छेद 32', 'अनुच्छेद 226'],
    correctOption: 2,
    explanationEn: 'Article 32 gives the right to individuals to move to the Supreme Court directly for the enforcement of fundamental rights. Dr. B.R. Ambedkar termed it the "Heart and Soul of the Constitution".',
    explanationHi: 'अनुच्छेद 32 नागरिकों को मौलिक अधिकारों के प्रवर्तन के लिए सीधे सर्वोच्च न्यायालय जाने का अधिकार देता है। डॉ. बी.आर. अंबेडकर ने इसे संविधान का "हृदय और आत्मा" कहा था।'
  },
  {
    id: 2,
    subject: 'Indian Polity',
    topic: 'Preamble',
    questionEn: 'By which Constitutional Amendment Act were the words "Socialist", "Secular", and "Integrity" added to the Preamble of the Indian Constitution?',
    questionHi: 'किस संविधान संशोधन अधिनियम द्वारा भारतीय संविधान की प्रस्तावना में "समाजवादी", "पंथनिरपेक्ष" और "अखंडता" शब्द जोड़े गए थे?',
    optionsEn: ['42nd Constitutional Amendment Act, 1976', '44th Constitutional Amendment Act, 1978', '52nd Constitutional Amendment Act, 1985', '86th Constitutional Amendment Act, 2002'],
    optionsHi: ['42वां संविधान संशोधन अधिनियम, 1976', '44वां संविधान संशोधन अधिनियम, 1978', '52वां संविधान संशोधन अधिनियम, 1985', '86वां संविधान संशोधन अधिनियम, 2002'],
    correctOption: 0,
    explanationEn: 'The 42nd Amendment Act of 1976 amended the Preamble to add the words Socialist, Secular, and Integrity during the Emergency period under the Indira Gandhi government.',
    explanationHi: '1976 के 42वें संशोधन अधिनियम द्वारा आपातकाल के दौरान प्रस्तावना में समाजवादी, पंथनिरपेक्ष और अखंडता शब्द शामिल किए गए थे।'
  },
  {
    id: 3,
    subject: 'Modern History',
    topic: 'Gandhian Era',
    questionEn: 'In which year was the Historic "Poona Pact" signed between Mahatma Gandhi and Dr. B.R. Ambedkar?',
    questionHi: 'महात्मा गांधी और डॉ. बी.आर. अंबेडकर के बीच ऐतिहासिक "पूना पैक्ट" पर किस वर्ष हस्ताक्षर किए गए थे?',
    optionsEn: ['1930', '1931', '1932', '1935'],
    optionsHi: ['1930', '1931', '1932', '1935'],
    correctOption: 2,
    explanationEn: 'The Poona Pact was signed on September 24, 1932 at Yerwada Central Jail in Pune, abandoning the separate electorates for the depressed classes in favor of reserved seats.',
    explanationHi: 'पूना समझौता 24 सितंबर 1932 को पुणे की यरवदा जेल में हुआ, जिसके तहत पृथक निर्वाचक मंडल के स्थान पर आरक्षित सीटों की व्यवस्था स्वीकार की गई।'
  },
  {
    id: 4,
    subject: 'Indian Economy',
    topic: 'Monetary Policy',
    questionEn: 'What happens to commercial bank credit availability when the Reserve Bank of India (RBI) increases the Cash Reserve Ratio (CRR)?',
    questionHi: 'जब भारतीय रिजर्व बैंक (RBI) नकद आरक्षित अनुपात (CRR) बढ़ाता है, तो वाणिज्यिक बैंकों की ऋण देने की क्षमता पर क्या प्रभाव पड़ता है?',
    optionsEn: ['Credit availability increases', 'Credit availability decreases', 'Credit remains unchanged', 'Interest rates drop to zero'],
    optionsHi: ['ऋण उपलब्धता बढ़ जाती है', 'ऋण उपलब्धता घट जाती है', 'ऋण पर कोई प्रभाव नहीं पड़ता', 'ब्याज दरें शून्य हो जाती हैं'],
    correctOption: 1,
    explanationEn: 'Increasing CRR requires commercial banks to keep a higher portion of their deposits parked as cash with the RBI, reducing lendable funds and cooling money supply.',
    explanationHi: 'CRR बढ़ाने से बैंकों को अपनी कुल जमा का अधिक हिस्सा RBI के पास रखना पड़ता है, जिससे बैंकों के पास उधार देने योग्य पूंजी कम हो जाती है।'
  },
  {
    id: 5,
    subject: 'Geography & Environment',
    topic: 'Rivers of India',
    questionEn: 'Which of the following West-flowing peninsular rivers flows through a Rift Valley in India?',
    questionHi: 'निम्नलिखित में से कौन सी पश्चिम की ओर बहने वाली प्रायद्वीपीय नदी भारत में भ्रंश घाटी (Rift Valley) से होकर बहती है?',
    optionsEn: ['Godavari', 'Narmada', 'Krishna', 'Cauvery'],
    optionsHi: ['गोदावरी', 'नर्मदा', 'कृष्णा', 'कावेरी'],
    correctOption: 1,
    explanationEn: 'Narmada and Tapi are the prominent peninsular rivers that flow westwards through rift valleys between the Vindhya and Satpura ranges and drain into the Arabian Sea.',
    explanationHi: 'नर्मदा और तापी नदियां विंध्य और सतपुड़ा पर्वत श्रेणियों के बीच भ्रंश घाटी से होकर पश्चिम की ओर बहती हैं और अरब सागर में गिरती हैं।'
  }
];

export default function QuizPlayerPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [visited, setVisited] = useState<number[]>([0]);
  
  // Timer State (10 Minutes = 600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Anti-Cheat Proctoring States
  const [warningsCount, setWarningsCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const currentQ = SAMPLE_QUESTIONS[currentIndex];

  // Anti-Cheat: Visibility Change & Window Blur Detector
  const handleCheatAttempt = useCallback(() => {
    if (isSubmitted) return;
    setWarningsCount((prev) => {
      const nextCount = prev + 1;
      setShowWarningModal(true);
      if (nextCount >= 3) {
        setIsSubmitted(true);
      }
      return nextCount;
    });
  }, [isSubmitted]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleCheatAttempt();
      }
    };

    const handleWindowBlur = () => {
      handleCheatAttempt();
    };

    // Disable Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleCheatAttempt]);

  // Timer Tick
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Format Time: MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  const handleClearResponse = () => {
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentIndex];
      return updated;
    });
  };

  const handleToggleReview = () => {
    setMarkedForReview((prev) =>
      prev.includes(currentIndex)
        ? prev.filter((i) => i !== currentIndex)
        : [...prev, currentIndex]
    );
  };

  const navigateTo = (index: number) => {
    setCurrentIndex(index);
    if (!visited.includes(index)) {
      setVisited((prev) => [...prev, index]);
    }
  };

  // Performance Evaluation Metrics
  const resultMetrics = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    SAMPLE_QUESTIONS.forEach((q, idx) => {
      const ans = answers[idx];
      if (ans === undefined) {
        unattempted += 1;
      } else if (ans === q.correctOption) {
        correct += 1;
      } else {
        incorrect += 1;
      }
    });

    const rawScore = correct * 2 - incorrect * 0.66;
    const maxScore = SAMPLE_QUESTIONS.length * 2;
    const accuracy = correct + incorrect > 0 ? (correct / (correct + incorrect)) * 100 : 0;
    const timeSpent = 600 - timeLeft;

    return {
      correct,
      incorrect,
      unattempted,
      rawScore: rawScore.toFixed(2),
      maxScore,
      accuracy: accuracy.toFixed(1),
      timeSpentFormatted: formatTime(timeSpent),
    };
  }, [answers, timeLeft]);

  // --------------------------------------------------------------------------
  // SCREEN 1: POST-TEST DIAGNOSTIC SCORECARD
  // --------------------------------------------------------------------------
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white pb-20">
        {/* Top Sticky Bar */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4 text-blue-600" />
              Back to Practice Bank
            </Link>
            <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full uppercase">
              Evaluation Completed
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Test Performance &amp; AI Diagnostic Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              अखिल भारतीय अभ्यास परीक्षण परिणाम • Detailed accuracy, time efficiency and solutions breakdown.
            </p>

            {/* Score Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Final Score</p>
                <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
                  {resultMetrics.rawScore} <span className="text-xs text-slate-400">/ {resultMetrics.maxScore}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Accuracy Index</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                  {resultMetrics.accuracy}%
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time Consumed</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {resultMetrics.timeSpentFormatted}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Breakdown</p>
                <p className="text-xs font-bold text-slate-700 mt-2">
                  <span className="text-emerald-600 font-black">+{resultMetrics.correct}</span> / <span className="text-rose-600 font-black">-{resultMetrics.incorrect}</span> / <span className="text-slate-400 font-black">0</span>
                </p>
              </div>
            </div>
          </div>

          {/* Solutions & Question-by-Question Detailed Review */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Detailed Solutions &amp; Question Review (विस्तृत उत्तर एवं व्याख्या)
            </h2>

            {SAMPLE_QUESTIONS.map((q, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === q.correctOption;
              const isUnattempted = userAns === undefined;

              return (
                <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  {/* Question Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                      Question #{idx + 1} • {q.subject}
                    </span>
                    <div>
                      {isUnattempted ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                          Unattempted (अनुत्तरित)
                        </span>
                      ) : isCorrect ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+2.00)
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect (-0.66)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Bilingual Text */}
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {q.questionEn}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                      {q.questionHi}
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {q.optionsEn.map((opt, optIdx) => {
                      const isThisCorrect = optIdx === q.correctOption;
                      const isThisUserSelected = optIdx === userAns;

                      let style = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isThisCorrect) {
                        style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400';
                      } else if (isThisUserSelected && !isCorrect) {
                        style = 'bg-rose-50 border-rose-400 text-rose-900 font-bold ring-1 ring-rose-400';
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-xl border text-xs leading-tight ${style}`}>
                          <div className="flex items-start gap-2">
                            <span className="font-black text-[10px] uppercase">{String.fromCharCode(65 + optIdx)}.</span>
                            <div>
                              <span>{opt}</span>
                              <span className="block text-[11px] opacity-75 mt-0.5">{q.optionsHi[optIdx]}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Editorial Explanation (उत्तर व्याख्या):
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {q.explanationEn}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-blue-100">
                      {q.explanationHi}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <Link
              href="/practice"
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition text-center"
            >
              Attempt Another Subject Drill
            </Link>
            <Link
              href="/olympiad"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition text-center shadow-md shadow-blue-500/20"
            >
              Register for Scholarship Olympiad (₹49) →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 2: ACTIVE LIVE EXAMINATION PLAYER (NTA / TCS-iON STANDARD)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      
      {/* 1. Header Bar: Exam Title, Live Timer & Proctored Badge */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Exam Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-none">
                National Speed Drill Assessment
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {currentQ.subject} • 50 Questions • +2.00 / -0.66 Marking
              </p>
            </div>
          </div>

          {/* Right Status: Timer & Anti-Cheat Badge */}
          <div className="flex items-center gap-3">
            {/* Anti-Cheat Active Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Proctoring Active</span>
            </div>

            {/* Live Countdown Timer */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black tracking-wider ${
              timeLeft < 120
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                : 'bg-slate-900 text-white border-slate-800'
            }`}>
              <Timer className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
            >
              Submit Test
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Examination Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-grow">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Active Question & Options (Span 8) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Question Sub-Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3 py-1 bg-slate-900 text-white rounded-lg">
                  Question {currentIndex + 1} of {SAMPLE_QUESTIONS.length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Section: {currentQ.topic}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">+2.00</span>
                <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">-0.66</span>
              </div>
            </div>

            {/* Bilingual Question Text */}
            <div className="space-y-2 py-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.questionEn}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                {currentQ.questionHi}
              </p>
            </div>

            {/* 4 Interactive Option Cards */}
            <div className="space-y-3 pt-2">
              {currentQ.optionsEn.map((opt, optIndex) => {
                const isSelected = answers[currentIndex] === optIndex;
                return (
                  <button
                    key={optIndex}
                    onClick={() => handleSelectOption(optIndex)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <div className="text-xs sm:text-sm">
                      <span className="font-semibold block text-slate-900">{opt}</span>
                      <span className="text-slate-500 font-medium block mt-0.5">{currentQ.optionsHi[optIndex]}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Question Actions Toolbar */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleReview}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    markedForReview.includes(currentIndex)
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{markedForReview.includes(currentIndex) ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>

                {answers[currentIndex] !== undefined && (
                  <button
                    onClick={handleClearResponse}
                    className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Clear Choice
                  </button>
                )}
              </div>

              {/* Navigation Prev / Next */}
              <div className="flex items-center gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => navigateTo(currentIndex - 1)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {currentIndex < SAMPLE_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => navigateTo(currentIndex + 1)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Finish Drill</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: NTA-Style Question Palette & Legend (Span 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
              Question Palette (प्रश्न ग्रिड)
            </h3>

            {/* Question Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Answered ({Object.keys(answers).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span>Review ({markedForReview.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span>Not Visited</span>
              </div>
            </div>

            {/* Question Grid Buttons */}
            <div className="grid grid-cols-5 gap-2.5 pt-3 border-t border-slate-100">
              {SAMPLE_QUESTIONS.map((_, qIdx) => {
                const isCurrent = qIdx === currentIndex;
                const isAnswered = answers[qIdx] !== undefined;
                const isMarked = markedForReview.includes(qIdx);
                const isVisited = visited.includes(qIdx);

                let badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
                if (isMarked) {
                  badgeStyle = 'bg-purple-600 text-white border-purple-600 font-bold';
                } else if (isAnswered) {
                  badgeStyle = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                } else if (isVisited) {
                  badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                }

                return (
                  <button
                    key={qIdx}
                    onClick={() => navigateTo(qIdx)}
                    className={`h-10 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${badgeStyle} ${
                      isCurrent ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                    }`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            {/* Anti-Cheat Security Notice */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Anti-Cheat Integrity Monitor
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Do not switch browser tabs or minimize window. Screen switching will trigger an official security warning.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Anti-Cheat Violation Warning Modal */}
      {showWarningModal && !isSubmitted && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full uppercase">
                Security Violation #{warningsCount} / 3
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">
                Screen Focus Lost / Tab Switch Detected
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You navigated away from the active examination screen. As per the Abhyaas Examination Integrity Code, <strong>3 consecutive violations will auto-submit your test and forfeit merit ranking</strong>.
              </p>
            </div>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              I Understand, Return to Test
            </button>
          </div>
        </div>
      )}

      {/* 4. Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Confirm Test Submission</h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p>Are you sure you want to finalize and submit your responses?</p>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <p>• Answered: <strong className="text-emerald-600">{Object.keys(answers).length}</strong></p>
                <p>• Unanswered: <strong className="text-rose-600">{SAMPLE_QUESTIONS.length - Object.keys(answers).length}</strong></p>
                <p>• Marked for Review: <strong className="text-purple-600">{markedForReview.length}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Continue Test
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setIsSubmitted(true);
                }}
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}