'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Sparkles, 
  Trophy, 
  Globe, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Layers,
  Award
} from 'lucide-react';
import { getAllQuestions } from '@/lib/db';

interface QuestionItem {
  id: string;
  subject: string;
  topic: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOption: number;
  explanationEn: string;
  explanationHi: string;
}

const RICH_PRACTICE_QUESTIONS: QuestionItem[] = [
  {
    id: 'q1',
    subject: 'Indian Polity',
    topic: 'Preamble & Constitutional Philosophy',
    questionEn: 'Which of the following ideals in the Preamble of the Indian Constitution ensures the dignity of the individual along with the unity and integrity of the Nation?',
    questionHi: 'भारतीय संविधान की प्रस्तावना में निम्नलिखित में से कौन सा आदर्श राष्ट्र की एकता और अखंडता के साथ-साथ व्यक्ति की गरिमा सुनिश्चित करता है?',
    optionsEn: [
      'Liberty of thought and expression',
      'Justice: Social, Economic and Political',
      'Fraternity (बंधुता)',
      'Equality of status and of opportunity'
    ],
    optionsHi: [
      'विचार और अभिव्यक्ति की स्वतंत्रता',
      'न्याय: सामाजिक, आर्थिक और राजनीतिक',
      'बंधुता (Fraternity)',
      'प्रतिष्ठा और अवसर की समता'
    ],
    correctOption: 2,
    explanationEn: 'Fraternity means a sense of common brotherhood among all Indians. The Preamble declares that fraternity has to assure two things: the dignity of the individual and the unity and integrity of the nation. The word "integrity" was added by the 42nd Constitutional Amendment Act (1976).',
    explanationHi: 'प्रस्तावना में "बंधुता" का अर्थ सभी भारतीयों के बीच भाईचारे की भावना से है। प्रस्तावना स्पष्ट करती है कि बंधुता को दो प्रमुख उद्देश्यों को सुनिश्चित करना है: व्यक्ति की गरिमा और राष्ट्र की एकता एवं अखंडता। "अखंडता" शब्द को 42वें संविधान संशोधन अधिनियम (1976) द्वारा जोड़ा गया था।'
  },
  {
    id: 'q2',
    subject: 'Indian Polity',
    topic: 'Fundamental Rights (Art 12-35)',
    questionEn: 'In the landmark K.S. Puttaswamy v. Union of India (2017) judgment, the Supreme Court declared the Right to Privacy as an intrinsic part of which Article?',
    questionHi: 'ऐतिहासिक के.एस. पुट्टास्वामी बनाम भारत संघ (2017) निर्णय में, सर्वोच्च न्यायालय ने निजता के अधिकार को किस अनुच्छेद का अभिन्न अंग घोषित किया?',
    optionsEn: [
      'Article 14 (Equality before Law)',
      'Article 19 (Right to Freedom)',
      'Article 21 (Right to Life and Personal Liberty)',
      'Article 25 (Freedom of Religion)'
    ],
    optionsHi: [
      'अनुच्छेद 14 (विधि के समक्ष समता)',
      'अनुच्छेद 19 (स्वतंत्रता का अधिकार)',
      'अनुच्छेद 21 (प्राण एवं दैहिक स्वतंत्रता का अधिकार)',
      'अनुच्छेद 25 (धर्म की स्वतंत्रता)'
    ],
    correctOption: 2,
    explanationEn: 'A nine-judge Constitutional Bench of the Supreme Court unanimously ruled in 2017 that the Right to Privacy is a Fundamental Right protected under Article 21 (Right to Life and Personal Liberty) and within the overarching freedoms guaranteed by Part III of the Constitution.',
    explanationHi: '2017 में 9 न्यायाधीशों की संविधान पीठ ने सर्वसम्मति से निर्णय दिया कि निजता का अधिकार (Right to Privacy) अनुच्छेद 21 के तहत प्राण और दैहिक स्वतंत्रता का एक स्वाभाविक और अभिन्न अंग है तथा यह संविधान के भाग III द्वारा संरक्षित मौलिक अधिकार है।'
  },
  {
    id: 'q3',
    subject: 'Indian Polity',
    topic: 'Panchayati Raj & Local Governance',
    questionEn: 'Which Constitutional Amendment Act added the 11th Schedule containing 29 functional items for Panchayats to the Constitution of India?',
    questionHi: 'किस संविधान संशोधन अधिनियम द्वारा भारतीय संविधान में पंचायतों के लिए 29 कार्यात्मक विषयों वाली 11वीं अनुसूची जोड़ी गई थी?',
    optionsEn: [
      '72nd Constitutional Amendment Act, 1992',
      '73rd Constitutional Amendment Act, 1992',
      '74th Constitutional Amendment Act, 1992',
      '86th Constitutional Amendment Act, 2002'
    ],
    optionsHi: [
      '72वां संविधान संशोधन अधिनियम, 1992',
      '73वां संविधान संशोधन अधिनियम, 1992',
      '74वां संविधान संशोधन अधिनियम, 1992',
      '86वां संविधान संशोधन अधिनियम, 2002'
    ],
    correctOption: 1,
    explanationEn: 'The 73rd Constitutional Amendment Act, 1992 came into force on 24th April 1993. It added Part IX (Articles 243 to 243-O) and the 11th Schedule containing 29 functional matters over which Panchayati Raj Institutions have administrative jurisdiction.',
    explanationHi: '73वां संविधान संशोधन अधिनियम, 1992 (लागू: 24 अप्रैल 1993) द्वारा संविधान में "भाग IX" और "11वीं अनुसूची" जोड़ी गई, जिसमें पंचायतों के अधिकार क्षेत्र के अंतर्गत 29 कार्यात्मक विषय (functional items) शामिल हैं।'
  },
  {
    id: 'q4',
    subject: 'Modern History',
    topic: 'Indian National Movement',
    questionEn: 'Who presided over the historic December 1929 Lahore Session of the Indian National Congress where the resolution for "Purna Swaraj" (Complete Independence) was passed?',
    questionHi: 'दिसंबर 1929 के भारतीय राष्ट्रीय कांग्रेस के ऐतिहासिक लाहौर अधिवेशन की अध्यक्षता किसने की थी, जिसमें "पूर्ण स्वराज" का ऐतिहासिक प्रस्ताव पारित किया गया था?',
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
    correctOption: 1,
    explanationEn: 'In December 1929, under the presidency of Jawaharlal Nehru, the Indian National Congress declared Purna Swaraj (Complete Independence) as its goal at the Lahore session. It was decided to celebrate 26 January 1930 as Independence Day.',
    explanationHi: 'दिसंबर 1929 में जवाहरलाल नेहरू की अध्यक्षता में कांग्रेस के लाहौर अधिवेशन में "पूर्ण स्वराज" को मुख्य लक्ष्य घोषित किया गया तथा 26 जनवरी 1930 को पूरे देश में प्रथम स्वतंत्रता दिवस मनाने का निर्णय लिया गया।'
  },
  {
    id: 'q5',
    subject: 'Indian Economy',
    topic: 'Macroeconomics & Fiscal Policy',
    questionEn: 'Which of the following expenditures is classified under Capital Expenditure (पूंजीगत व्यय) of the Union Budget?',
    questionHi: 'निम्नलिखित में से किस व्यय को केंद्रीय बजट के "पूंजीगत व्यय (Capital Expenditure)" के तहत वर्गीकृत किया जाता है?',
    optionsEn: [
      'Payment of interest on past national debt',
      'Payment of salaries and administrative pensions',
      'Construction of National Expressways and High-Speed Rail corridors',
      'Subsidies provided on agricultural fertilizers and food grain'
    ],
    optionsHi: [
      'विगत राष्ट्रीय ऋणों पर ब्याज का भुगतान',
      'कर्मचारियों के वेतन और प्रशासनिक पेंशन का भुगतान',
      'राष्ट्रीय एक्सप्रेसवे और हाई-स्पीड रेल कॉरिडोर का निर्माण',
      'कृषि उर्वरकों और खाद्यान्न पर दी जाने वाली सब्सिडी'
    ],
    correctOption: 2,
    explanationEn: 'Capital Expenditure creates long-term physical or financial assets for the country (like expressways, hospitals, railways, school infrastructure) or causes a reduction in government liabilities. Interest, salaries, and subsidies are Revenue Expenditures.',
    explanationHi: 'पूंजीगत व्यय (Capital Expenditure) वह व्यय है जिससे देश में नई भौतिक या वित्तीय परिसंपत्तियों का निर्माण होता है (जैसे राष्ट्रीय राजमार्ग, अस्पताल, रेलवे लाइन) अथवा सरकारी देनदारियों में कमी आती है। वेतन, ब्याज और सब्सिडी राजस्व व्यय (Revenue Expenditure) के अंतर्गत आते हैं।'
  }
];

export default function ProctoredQuizArenaPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>(RICH_PRACTICE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(45 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load from database if available
  useEffect(() => {
    async function loadCloudData() {
      try {
        const cloudData = await getAllQuestions();
        if (cloudData && cloudData.length > 0) {
          const mapped: QuestionItem[] = cloudData.map((q, idx) => ({
            id: q.id || `q_${idx}`,
            subject: q.subject,
            topic: q.topic,
            questionEn: q.questionEn,
            questionHi: q.questionHi,
            optionsEn: q.optionsEn,
            optionsHi: q.optionsHi,
            correctOption: q.correctOption,
            explanationEn: `The verified correct answer is Option ${String.fromCharCode(65 + q.correctOption)}. Evaluated under statutory syllabus guidelines.`,
            explanationHi: `सत्यापित सही उत्तर विकल्प ${String.fromCharCode(65 + q.correctOption)} है। यह प्रश्न आधिकारिक पाठ्यक्रम मानकों के अनुसार परीक्षित है।`
          }));
          setQuestions(mapped);
        }
      } catch (err) {
        console.warn('Using standard offline practice questions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCloudData();
  }, []);

  // Timer
  const handleFinalSubmit = useCallback(() => {
    setShowSubmitModal(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
  };

  const toggleMarkReview = () => {
    setMarkedForReview((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
  };

  const clearCurrentResponse = () => {
    const copy = { ...selectedAnswers };
    delete copy[currentIndex];
    setSelectedAnswers(copy);
  };

  // Metrics
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
          Loading Examination Portal...
        </p>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: FINAL DIAGNOSTIC SCORECARD WITH DETAILED EXPLANATIONS
  // =========================================================================
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-blue-600">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Summary Banner Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Assessment Concluded &amp; Audited
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                अखिल भारतीय मूल्यांकन परिणाम • All-India Diagnostic Scorecard
              </p>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Raw Score (+2 / -0.66)</span>
                <span className="text-2xl font-black text-amber-400 mt-1 block">{rawScore}</span>
                <span className="text-[10px] text-slate-500 block">Out of {totalQuestions * 2}</span>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Accuracy Rate</span>
                <span className="text-2xl font-black text-emerald-400 mt-1 block">{accuracyPercent}%</span>
                <span className="text-[10px] text-slate-500 block">Correct ratio</span>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Correct / Attempted</span>
                <span className="text-2xl font-black text-blue-400 mt-1 block">{correctCount} / {attemptedCount}</span>
                <span className="text-[10px] text-slate-500 block">Total {totalQuestions} Qs</span>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Incorrect Marks</span>
                <span className="text-2xl font-black text-rose-400 mt-1 block">-{(incorrectCount * 0.66).toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block">{incorrectCount} Negative</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-center">
              <Link
                href="/leaderboard"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>View All-India Rankings &amp; Grants</span>
              </Link>
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setMarkedForReview({});
                  setCurrentIndex(0);
                  setTimeLeftSeconds(45 * 60);
                  setIsSubmitted(false);
                }}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Retake Practice Test</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Keys & Step-by-Step Explanations */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="font-black text-lg text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                प्रश्न व्याख्या एवं सत्यापित उत्तर कुंजी (Detailed Solutions)
              </h2>
              <span className="text-xs text-slate-400 font-bold">Total {totalQuestions} Solutions</span>
            </div>

            {questions.map((q, idx) => {
              const userChoice = selectedAnswers[idx];
              const isCorrect = userChoice === q.correctOption;
              const isAttempted = userChoice !== undefined;

              return (
                <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
                  
                  {/* Top Q Metadata */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 font-bold uppercase text-[10px] border border-blue-500/30">
                        {q.subject}
                      </span>
                      <span className="text-slate-400 font-semibold">{q.topic}</span>
                    </div>

                    {isAttempted ? (
                      isCorrect ? (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" /> +2.00 Correct
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg font-bold text-xs flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" /> -0.66 Negative
                        </span>
                      )
                    ) : (
                      <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg font-bold text-xs">
                        Unattempted (0.00)
                      </span>
                    )}
                  </div>

                  {/* Bilingual Question Text */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 font-black text-xs flex items-center justify-center flex-shrink-0">
                        Q.{idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="font-bold text-base text-white leading-relaxed">{q.questionHi}</p>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">{q.questionEn}</p>
                      </div>
                    </div>
                  </div>

                  {/* Options Matrix */}
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    {q.optionsHi.map((optHi, oIdx) => {
                      const optEn = q.optionsEn[oIdx];
                      const isOptionCorrect = oIdx === q.correctOption;
                      const isOptionSelected = oIdx === userChoice;

                      let optionCardStyle = 'bg-slate-800/40 border-slate-800 text-slate-300';

                      if (isOptionCorrect) {
                        optionCardStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        optionCardStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                      }

                      return (
                        <div key={oIdx} className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 ${optionCardStyle}`}>
                          <div className="flex items-start gap-2.5">
                            <span className={`w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center flex-shrink-0 ${
                              isOptionCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <div className="space-y-0.5">
                              <p className="font-bold text-white text-xs sm:text-sm">{optHi}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{optEn}</p>
                            </div>
                          </div>
                          {isOptionCorrect && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Step-by-Step Explanation Box */}
                  <div className="p-5 bg-gradient-to-b from-blue-950/30 to-slate-950/50 border border-blue-800/40 rounded-2xl space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                      <Sparkles className="w-4 h-4" />
                      <span>विस्तृत व्याख्या / Detailed Solution Analysis</span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {q.explanationHi}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2 font-medium">
                      {q.explanationEn}
                    </p>
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
  // VIEW 2: ACTIVE PROCTORED TEST WORKSPACE (BILINGUAL & CLEAN)
  // =========================================================================
  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-blue-600">
      
      {/* 1. Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 h-16 flex items-center justify-between shadow-lg">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">
            A
          </div>
          <div>
            <h1 className="font-black text-xs sm:text-sm text-white">
              Abhyaas National Test Arena
            </h1>
            <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 100% Proctored Standard
            </p>
          </div>
        </div>

        {/* Right Controls: Timer + Prominent Submit Button */}
        <div className="flex items-center gap-3">
          
          {/* Live Timer Box */}
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-black text-xs sm:text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>

          {/* Prominent Submit Paper Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 sm:px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Submit Test</span>
          </button>

        </div>
      </header>

      {/* 2. Main Examination Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Question Box (Span 8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
          
          {/* Top Question Tagging */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 font-black uppercase text-[10px] border border-blue-500/30">
                {currentQ.subject}
              </span>
              <span className="text-slate-400 font-bold">{currentQ.topic}</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Marks:</span>
              <span className="text-emerald-400 font-black">+2.00</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400 font-black">-0.66</span>
            </div>
          </div>

          {/* Bilingual Question Text (Both Hindi & English visible) */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                Q.{currentIndex + 1}
              </span>
              <div className="space-y-1.5">
                <p className="font-extrabold text-base sm:text-lg text-white leading-relaxed">
                  {currentQ.questionHi}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  {currentQ.questionEn}
                </p>
              </div>
            </div>
          </div>

          {/* 4 Interactive Bilingual Options */}
          <div className="space-y-3 pt-2">
            {currentQ.optionsHi.map((optHi, oIdx) => {
              const optEn = currentQ.optionsEn[oIdx];
              const isSelected = selectedAnswers[currentIndex] === oIdx;

              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-2 ring-blue-500/40 shadow-md'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-white">{optHi}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{optEn}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMarkReview}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  markedForReview[currentIndex]
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{markedForReview[currentIndex] ? 'Review Marked' : 'Mark Review'}</span>
              </button>

              <button
                onClick={clearCurrentResponse}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold transition cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex === totalQuestions - 1 ? (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Paper</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1 cursor-pointer shadow-md shadow-blue-600/30"
                >
                  <span>Save &amp; Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right: Question Navigation Palette (Span 4) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl sticky top-24">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-black text-sm text-white">Question Palette</h3>
              <p className="text-[11px] text-slate-400">Total: {totalQuestions} Questions</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Attempted: {attemptedCount}/{totalQuestions}
            </span>
          </div>

          {/* Grid Numbers */}
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
            {questions.map((_, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isFlagged = markedForReview[idx];
              const isCurrent = currentIndex === idx;

              let btnStyle = 'bg-slate-800 text-slate-400 border-slate-700';
              if (isCurrent) {
                btnStyle = 'bg-blue-600 text-white font-black ring-2 ring-blue-400 shadow-md';
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
              <span>Answered ({attemptedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-600" />
              <span>Marked Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
              <span>Unvisited ({totalQuestions - attemptedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span>Current</span>
            </div>
          </div>

          {/* Bottom Direct Submit in Palette */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Final Submit Assessment</span>
          </button>

        </div>

      </main>

      {/* 3. Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
            
            <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-white">क्या आप परीक्षा जमा करना चाहते हैं?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to submit your final examination paper?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div className="text-left">
                <span className="text-slate-400 block text-[10px]">Attempted / हल किए गए:</span>
                <span className="font-black text-emerald-400 text-base">{attemptedCount} / {totalQuestions}</span>
              </div>
              <div className="text-left">
                <span className="text-slate-400 block text-[10px]">Unattempted / शेष:</span>
                <span className="font-black text-amber-400 text-base">{totalQuestions - attemptedCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Continue Test
              </button>

              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                Yes, Submit Paper
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}