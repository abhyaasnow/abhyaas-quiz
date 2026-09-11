'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MegaOlympiadBanner from './components/MegaOlympiadBanner';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Award, 
  ShieldCheck, 
  Trophy, 
  Clock, 
  BookOpen, 
  Zap, 
  Check, 
  X, 
  HelpCircle,
  FileText,
  Wallet,
  Users,
  Brain
} from 'lucide-react';

export default function HomePage() {
  // Question of the Day interactive state
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const dailyQuestion = {
    subject: 'Indian Polity & Constitution',
    topic: 'Preamble & Constitutional Ideals',
    questionHi: 'भारतीय संविधान की प्रस्तावना में "समाजवादी" और "पंथनिरपेक्ष" शब्द किस संविधान संशोधन अधिनियम द्वारा जोड़े गए थे?',
    questionEn: 'By which Constitutional Amendment Act were the words "Socialist" and "Secular" added to the Preamble of the Indian Constitution?',
    options: [
      { hi: '42वां संविधान संशोधन (1976)', en: '42nd Constitutional Amendment (1976)', correct: true },
      { hi: '44वां संविधान संशोधन (1978)', en: '44th Constitutional Amendment (1978)', correct: false },
      { hi: '86वां संविधान संशोधन (2002)', en: '86th Constitutional Amendment (2002)', correct: false },
      { hi: '73वां संविधान संशोधन (1992)', en: '73rd Constitutional Amendment (1992)', correct: false },
    ],
    explanationHi: '42वें संविधान संशोधन अधिनियम, 1976 द्वारा भारतीय संविधान की प्रस्तावना में तीन नए शब्द जोड़े गए थे: "समाजवादी" (Socialist), "पंथनिरपेक्ष" (Secular), और "अखंडता" (Integrity)।',
    explanationEn: 'The 42nd Constitutional Amendment Act, 1976 introduced three new terms into the Preamble: "Socialist", "Secular", and "Integrity".'
  };

  const handleOptionSelect = (index: number) => {
    setSelectedOpt(index);
    setShowExplanation(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white">
      
      {/* 1. Mega Hero Banner with Live Dynamic Category Filtering */}
      <MegaOlympiadBanner />

      {/* 2. Interactive "Question of the Day" Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Daily Academic Pulse</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900">आज का अभ्यास प्रश्न • Question of the Day</h2>
              </div>
            </div>

            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-full self-start sm:self-auto">
              {dailyQuestion.subject}
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <p className="font-extrabold text-base sm:text-lg text-slate-900 leading-relaxed">
              {dailyQuestion.questionHi}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              {dailyQuestion.questionEn}
            </p>
          </div>

          {/* 4 Interactive Options */}
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            {dailyQuestion.options.map((opt, idx) => {
              const isSelected = selectedOpt === idx;
              const isCorrect = opt.correct;

              let cardStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80';
              if (showExplanation) {
                if (isCorrect) {
                  cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500';
                } else if (isSelected && !isCorrect) {
                  cardStyle = 'bg-rose-50 border-rose-400 text-rose-900 ring-1 ring-rose-400';
                }
              }

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={showExplanation}
                  className={`p-4 rounded-2xl border text-xs text-left transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center flex-shrink-0 ${
                      showExplanation && isCorrect 
                        ? 'bg-emerald-600 text-white' 
                        : isSelected && !isCorrect 
                        ? 'bg-rose-600 text-white' 
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{opt.hi}</p>
                      <p className="text-[11px] text-slate-500">{opt.en}</p>
                    </div>
                  </div>

                  {showExplanation && (
                    isCorrect ? (
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : isSelected ? (
                      <X className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    ) : null
                  )}
                </button>
              );
            })}
          </div>

          {/* Solution Box (Appears on click) */}
          {showExplanation && (
            <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>व्याख्या एवं संवैधानिक संदर्भ / Explanation Analysis</span>
              </div>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {dailyQuestion.explanationHi}
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed border-t border-blue-100 pt-2 font-medium">
                {dailyQuestion.explanationEn}
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">
              Want more topic-wise drills? Practice 500+ questions anytime.
            </span>
            <Link
              href="/practice"
              className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <span>Explore Practice Bank</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 3. "How Abhyaas Works" - 3-Step Fellowship Blueprint */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Transparent Assessment Process</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            तीन चरणों में फेलोशिप एवं मूल्यांकन प्रक्रिया
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            From seamless digital admit card generation to AI-proctored rankings and faculty viva defense.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 font-black text-base flex items-center justify-center">
              01
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-slate-900">1. Register &amp; Get Admit Card</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose your fellowship evaluation tier to generate your verified <strong>Candidate Roll Number</strong> and official digital hall ticket.
              </p>
            </div>
            <div className="text-[11px] text-amber-700 font-semibold bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Instant Roll Number allocation</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 font-black text-base flex items-center justify-center">
              02
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-slate-900">2. Proctored Exam &amp; Diagnostics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attempt timed bilingual questions with live proctoring checks, forward-only navigation, and instant diagnostic heatmaps.
              </p>
            </div>
            <div className="text-[11px] text-blue-700 font-semibold bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tab-switch &amp; timing integrity</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 font-black text-base flex items-center justify-center">
              03
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-base text-slate-900">3. Merit Standings &amp; Research Grants</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Qualify via written scores (&ge;75%) and faculty viva voce defense to receive endowed academic research grants directly.
              </p>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              <span>Endowed fellowship grants</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Trust & Platform Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <div className="bg-gradient-to-r from-slate-900 via-[#0b1329] to-slate-900 border border-slate-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> Academic Merit Ecosystem
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                भारत का सबसे पारदर्शी मेधावी मूल्यांकन मंच
              </h3>
            </div>

            <Link
              href="/olympiad"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-md flex items-center gap-2 self-start md:self-auto cursor-pointer"
            >
              <span>Register for Next Evaluation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">UPSC-Standard Pedagogy</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Strict multi-statement and analytical questions framed by civil services subject experts.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Merit Fellowship Grants</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Endowed research grants distributed strictly based on written scores and faculty viva defense.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Anti-Cheat Auditing</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Browser focus trackers and response anomaly detectors ensure 100% fair merit rankings.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">Instant Solution Keys</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Detailed step-by-step Hindi &amp; English solution references right after submission.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}