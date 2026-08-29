'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Clock, Bookmark, CheckCircle2, ChevronRight, 
  RotateCcw, Award, Globe, ShieldCheck, PlayCircle 
} from 'lucide-react';

interface QuestionData {
  questionText: string;
  options: string[];
  explanation: string;
}

interface BilingualQuestion {
  id: number;
  en: QuestionData;
  hi: QuestionData;
  correctIndex: number;
}

const mockQuestions: BilingualQuestion[] = [
  {
    id: 1,
    correctIndex: 1,
    en: {
      questionText: 'Which Article of the Indian Constitution provides for the adjudication of disputes relating to waters of inter-state rivers or river valleys?',
      options: ['Article 260', 'Article 262', 'Article 263', 'Article 280'],
      explanation: 'Article 262 empowers Parliament to provide for the adjudication of any dispute relating to the use, distribution, or control of waters of inter-state rivers.'
    },
    hi: {
      questionText: 'भारतीय संविधान का कौन सा अनुच्छेद अंतर-राज्यीय नदियों या नदी घाटियों के जल से संबंधित विवादों के न्यायनिर्णयन का प्रावधान करता है?',
      options: ['अनुच्छेद 260', 'अनुच्छेद 262', 'अनुच्छेद 263', 'अनुच्छेद 280'],
      explanation: 'अनुच्छेद 262 संसद को अंतर-राज्यीय नदियों या नदी घाटियों के जल के उपयोग, वितरण या नियंत्रण से संबंधित किसी भी विवाद के न्यायनिर्णयन का अधिकार देता है।'
    }
  },
  {
    id: 2,
    correctIndex: 1,
    en: {
      questionText: 'The concept of "Directive Principles of State Policy" (DPSP) in the Indian Constitution was borrowed from which country?',
      options: ['United States of America', 'Irish Constitution (Ireland)', 'Constitution of Australia', 'Canadian Constitution'],
      explanation: 'The makers of the Constitution borrowed the Directive Principles from the Irish Constitution of 1937, which had copied it from the Spanish Constitution.'
    },
    hi: {
      questionText: 'भारतीय संविधान में "राज्य के नीति निर्देशक तत्व" (DPSP) की अवधारणा किस देश के संविधान से ली गई है?',
      options: ['संयुक्त राज्य अमेरिका', 'आयरलैंड का संविधान', 'ऑस्ट्रेलिया का संविधान', 'कनाडा का संविधान'],
      explanation: 'संविधान निर्माताओं ने 1937 के आयरिश संविधान से नीति निर्देशक तत्वों को ग्रहण किया, जिसने इसे स्पेनिश संविधान से लिया था।'
    }
  },
  {
    id: 3,
    correctIndex: 1,
    en: {
      questionText: 'Under which constitutional amendment was the Right to Property removed from the list of Fundamental Rights?',
      options: ['42nd Amendment Act, 1976', '44th Amendment Act, 1978', '86th Amendment Act, 2002', '91st Amendment Act, 2003'],
      explanation: 'The 44th Constitutional Amendment Act, 1978 deleted the Right to Property from Fundamental Rights and made it a legal right under Article 300A.'
    },
    hi: {
      questionText: 'किस संविधान संशोधन के तहत संपत्ति के अधिकार को मौलिक अधिकारों की सूची से हटा दिया गया था?',
      options: ['42वां संशोधन अधिनियम, 1976', '44वां संशोधन अधिनियम, 1978', '86वां संशोधन अधिनियम, 2002', '91वां संशोधन अधिनियम, 2003'],
      explanation: '44वें संविधान संशोधन अधिनियम, 1978 द्वारा संपत्ति के अधिकार को मौलिक अधिकारों से हटाकर अनुच्छेद 300A के तहत एक विधिक अधिकार बना दिया गया।'
    }
  }
];

export default function QuizArena() {
  const [lang, setLang] = useState<'en' | 'hi'>('hi');
  const [isStarted, setIsStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    if (!isStarted || timeLeft <= 0 || isSubmitted) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, isSubmitted]);

  const currentQ = mockQuestions[currentIdx][lang];
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: optionIdx });
  };

  const calculateScore = () => {
    let score = 0;
    mockQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) score += 2;
      else if (selectedAnswers[idx] !== undefined) score -= 0.66;
    });
    return Math.max(0, score).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-900">
      
      {/* 1. Pre-Test Instructions Modal */}
      {!isStarted && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 border border-slate-200">
            
            <div className="text-center space-y-1">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Verified Assessment' : 'प्रमाणित मूल्यांकन अभ्यास'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {lang === 'en' ? 'Indian Polity Daily Speed Drill' : 'भारतीय राजव्यवस्था: दैनिक अभ्यास'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'en' ? 'Please review the test instructions before starting.' : 'कृपया शुरू करने से पहले परीक्षा निर्देश पढ़ें।'}
              </p>
            </div>

            {/* Language Selection */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {lang === 'en' ? 'Choose Your Medium (भाषा चुनें):' : 'अपनी भाषा चुनें (Choose Medium):'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all border ${
                    lang === 'hi'
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all border ${
                    lang === 'en'
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between font-bold text-slate-800 pb-1 border-b border-slate-200">
                <span>{lang === 'en' ? 'Test Parameters' : 'परीक्षा विवरण'}</span>
                <span>{mockQuestions.length} MCQs • 3 Mins</span>
              </div>
              <ul className="space-y-1.5 list-disc pl-4 text-[11px] text-slate-600">
                <li>
                  {lang === 'en' 
                    ? 'Marking: +2.0 for correct, -0.66 negative for wrong.' 
                    : 'अंकन योजना: सही उत्तर के लिए +2.0, गलत के लिए -0.66 ऋणात्मक।'}
                </li>
                <li>
                  {lang === 'en' 
                    ? 'You can toggle language anytime during the drill.' 
                    : 'आप टेस्ट के दौरान कभी भी भाषा बदल सकते हैं।'}
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3 pt-1">
              <Link 
                href="/"
                className="flex-1 py-3 text-center border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50"
              >
                {lang === 'en' ? 'Cancel' : 'रद्द करें'}
              </Link>
              <button
                onClick={() => setIsStarted(true)}
                className="flex-[2] py-3 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-700/20 active:scale-[0.98] transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{lang === 'en' ? 'Start Assessment' : 'परीक्षा शुरू करें'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          
          <Link href="/" className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-xs sm:text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Exit Drill' : 'बाहर जाएं'}</span>
          </Link>

          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-mono font-bold text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full text-xs font-black text-slate-800 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'en' ? 'हिन्दी' : 'ENG'}</span>
            </button>
            <button className="text-slate-400 hover:text-amber-500 p-1">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* 3. Question Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {!isSubmitted ? (
          <div className="bg-white rounded-2xl p-4 sm:p-7 border border-slate-200 shadow-sm space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[11px] sm:text-xs font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                {lang === 'en' ? `Question ${currentIdx + 1} of ${mockQuestions.length}` : `प्रश्न ${currentIdx + 1} / ${mockQuestions.length}`}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">
                {lang === 'en' ? 'Marking:' : 'अंकन:'} <strong className="text-emerald-600">+2.0</strong> | <strong className="text-red-500">-0.66</strong>
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {currentQ.questionText}
            </h2>

            <div className="space-y-2.5 pt-1">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentIdx] === oIdx;
                const optLetter = String.fromCharCode(65 + oIdx);

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelect(oIdx)}
                    className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600 text-blue-900 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {optLetter}
                    </span>
                    <span className="text-xs sm:text-sm font-medium flex-1 leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Result */
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-md text-center space-y-5">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-xs">
              <Award className="w-7 h-7" />
            </div>
            
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {lang === 'en' ? 'Drill Completed!' : 'अभ्यास पूर्ण हुआ!'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'en' ? 'National Academic Benchmark Analysis' : 'अखिल भारतीय शैक्षणिक मूल्यांकन विश्लेषण'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold block">
                  {lang === 'en' ? 'Score' : 'प्राप्तांक'}
                </span>
                <span className="text-lg sm:text-2xl font-black text-blue-700">{calculateScore()} / 6.00</span>
              </div>
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold block">
                  {lang === 'en' ? 'Academic XP' : 'अर्जित XP'}
                </span>
                <span className="text-lg sm:text-2xl font-black text-emerald-600">+100 XP</span>
              </div>
            </div>

            <div className="text-left space-y-2.5 pt-3 border-t border-slate-100 max-h-60 overflow-y-auto">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                {lang === 'en' ? 'Verified Answer Explanations:' : 'विस्तृत उत्तर व्याख्या:'}
              </h3>
              {mockQuestions.map((q, qIdx) => {
                const qContent = q[lang];
                return (
                  <div key={q.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>
                        {lang === 'en' ? `Q${qIdx + 1}: Correct Answer: Option ` : `प्र.${qIdx + 1}: सही उत्तर: विकल्प `}
                        {String.fromCharCode(65 + q.correctIndex)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed pl-5">{qContent.explanation}</p>
                  </div>
                );
              })}
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{lang === 'en' ? 'Back to Home Feed' : 'होम पेज पर वापस जाएं'}</span>
            </Link>
          </div>
        )}
      </div>

      {/* 4. Controls */}
      {isStarted && !isSubmitted && (
        <footer className="bg-white border-t border-slate-200 px-3 sm:px-6 py-2.5 sticky bottom-0 z-20">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl disabled:opacity-40 hover:bg-slate-50"
            >
              {lang === 'en' ? 'Previous' : 'पिछला'}
            </button>

            {currentIdx < mockQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1 shadow-xs"
              >
                <span>{lang === 'en' ? 'Next' : 'अगला'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitted(true)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs"
              >
                {lang === 'en' ? 'Submit Drill' : 'जमा करें'}
              </button>
            )}
          </div>
        </footer>
      )}

    </div>
  );
}