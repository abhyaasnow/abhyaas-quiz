'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, 
  RotateCcw, Sparkles, Languages, Award, Share2, HelpCircle,
  FileText, ExternalLink, ShieldCheck, ShieldAlert, Lock, Play, Maximize2
} from 'lucide-react';

import { 
  getAllQuestions, getAllOlympiads, QuestionData, parseAttachment, 
  getOlympiadQuestionsForCandidate, submitOlympiadResult, OlympiadTournament 
} from '@/lib/db';
import MathRenderer from '@/components/MathRenderer';

export interface QuestionItem {
  id: string;
  category: string;
  subject: string;
  topic: string;
  segment: string;
  pyqYear?: string;
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctOption: number;
  diagramUrl?: string | null;
  explanationEn: string;
  explanationHi: string;
}

function QuizEngine() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode Detector: Standard Practice Drill VS High-Stakes Olympiad
  const modeParam = searchParams.get('mode') || 'practice';
  const rollParam = searchParams.get('roll') || '';
  const olympiadIdParam = searchParams.get('olympiadId') || '';
  const isOlympiadMode = modeParam === 'olympiad';

  // Practice Query Params
  const categoryParam = searchParams.get('category') || '';
  const subjectParam = searchParams.get('subject') || '';
  const topicParam = searchParams.get('topic') || '';
  const segmentParam = searchParams.get('segment') || 'ALL';
  const setParam = parseInt(searchParams.get('set') || '1', 10);

  // Common Assessment States
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [useHindi, setUseHindi] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  // Olympiad Specialized States
  const [olympiadSession, setOlympiadSession] = useState<OlympiadTournament | null>(null);
  const [olympiadGateState, setOlympiadGateState] = useState<'UPCOMING' | 'OPEN' | 'EXPIRED'>('OPEN');
  const [gateCountdown, setGateCountdown] = useState<string>('');
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [vivaQualified, setVivaQualified] = useState<boolean>(false);
  const [examStarted, setExamStarted] = useState<boolean>(!isOlympiadMode);

  // 1. DATA LOADER (Strictly Isolated: Olympiad Vault VS Practice Repository)
  useEffect(() => {
    async function loadTestQuestions() {
      try {
        if (isOlympiadMode) {
          // OLYMPIAD MODE: Fetch exact matching Olympiad Session
          const allOlys = await getAllOlympiads();
          let activeOly: OlympiadTournament | null = null;

          if (olympiadIdParam) {
            activeOly = allOlys.find(o => o.id === olympiadIdParam) || null;
          }
          if (!activeOly) {
            activeOly = allOlys.find(o => o.status === 'LIVE' || o.status === 'UPCOMING') || allOlys[0] || null;
          }

          setOlympiadSession(activeOly);

          // Dedicated Olympiad Questions Fetcher
          const olyTargetFilter = activeOly 
            ? (activeOly.targetSubject || activeOly.targetExam || activeOly.title || '') 
            : '';
          const qLimit = activeOly ? (activeOly.questionsCount || 10) : 10;

          // Pull strictly from Olympiad quarantine vault
          const allVault = await getAllQuestions();
          let olyPool = allVault.filter(q => q.segment === 'OLYMPIAD' && !q.isArchived);

          if (olyTargetFilter.trim() && olyPool.length > 0) {
            const matched = olyPool.filter(q => 
              (q.examName && q.examName.toLowerCase().includes(olyTargetFilter.toLowerCase())) ||
              (q.subjectName && q.subjectName.toLowerCase().includes(olyTargetFilter.toLowerCase())) ||
              (q.topicName && q.topicName.toLowerCase().includes(olyTargetFilter.toLowerCase())) ||
              (q.category && q.category.toLowerCase().includes(olyTargetFilter.toLowerCase()))
            );
            if (matched.length > 0) {
              olyPool = matched;
            }
          }

          const finalOlyQuestions = olyPool.slice(0, qLimit);

          const mappedItems: QuestionItem[] = finalOlyQuestions.map(q => ({
            id: String(q.id),
            category: String(q.examName || q.category || activeOly?.targetExam || 'National Olympiad'),
            subject: String(q.subjectName || q.subject || activeOly?.targetSubject || 'Standardized Assessment'),
            topic: String(q.topicName || q.topic || 'General Module'),
            segment: 'OLYMPIAD',
            pyqYear: q.pyqYear || '',
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
          const totalDurationSecs = activeOly ? (activeOly.durationMinutes * 60) : (mappedItems.length * 60);
          setTimeLeft(totalDurationSecs > 0 ? totalDurationSecs : 600);

        } else {
          // STANDARD PRACTICE DRILL MODE (Original practice logic intact)
          const all = await getAllQuestions();
          let filtered = all.filter(q => q.segment !== 'OLYMPIAD' && !q.isArchived);

          if (segmentParam && segmentParam !== 'ALL') {
            filtered = filtered.filter(q => q.segment === segmentParam);
          }

          if (categoryParam) {
            const matchExam = filtered.filter(q => 
              (q.examName && q.examName.toLowerCase() === categoryParam.toLowerCase()) || 
              (q.category && q.category.toLowerCase() === categoryParam.toLowerCase())
            );
            if (matchExam.length > 0) filtered = matchExam;
          }

          if (subjectParam) {
            const matchSubj = filtered.filter(q => 
              (q.subjectName && q.subjectName.toLowerCase() === subjectParam.toLowerCase()) || 
              (q.subject && q.subject.toLowerCase() === subjectParam.toLowerCase())
            );
            if (matchSubj.length > 0) filtered = matchSubj;
          }

          if (topicParam && topicParam !== 'All') {
            const matchTopic = filtered.filter(q => 
              (q.topicName && q.topicName.toLowerCase() === topicParam.toLowerCase()) || 
              (q.topic && q.topic.toLowerCase() === topicParam.toLowerCase())
            );
            if (matchTopic.length > 0) filtered = matchTopic;
          }

          const sourceList = filtered.length > 0 ? filtered : all.filter(q => q.segment !== 'OLYMPIAD' && !q.isArchived);

          const startIndex = (setParam - 1) * 10;
          const pagedList = sourceList.length > 10 
            ? sourceList.slice(startIndex, startIndex + 10) 
            : sourceList;

          const mappedItems: QuestionItem[] = pagedList.map(q => ({
            id: String(q.id),
            category: String(q.examName || q.category || 'General Studies'),
            subject: String(q.subjectName || q.subject || 'General Studies'),
            topic: String(q.topicName || q.topic || 'General Topic'),
            segment: String(q.segment || 'PRACTICE'),
            pyqYear: q.pyqYear || '',
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
          setTimeLeft(Math.max(mappedItems.length * 90, 300));
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTestQuestions();
  }, [isOlympiadMode, olympiadIdParam, categoryParam, subjectParam, topicParam, segmentParam, setParam]);

  // 2. DYNAMIC 30-MINUTE GRACE WINDOW & COUNTDOWN ENGINE
  useEffect(() => {
    if (!isOlympiadMode || !olympiadSession) return;

    const checkWindow = () => {
      // If Admin sets status directly to LIVE, bypass countdown lock
      if (olympiadSession.status === 'LIVE') {
        setOlympiadGateState('OPEN');
        return;
      }
      if (olympiadSession.status === 'COMPLETED' || olympiadSession.status === 'CANCELLED') {
        setOlympiadGateState('EXPIRED');
        return;
      }

      const scheduledStart = olympiadSession.startDateTime 
        ? new Date(olympiadSession.startDateTime).getTime() 
        : Date.now();
      
      const graceMinutes = Number(olympiadSession.graceMinutes) || 30;
      const gateClosureTime = scheduledStart + (graceMinutes * 60 * 1000);
      const now = Date.now();

      if (now < scheduledStart) {
        // UPCOMING: Render live countdown
        setOlympiadGateState('UPCOMING');
        const diff = scheduledStart - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setGateCountdown(`${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`);
      } else if (now >= scheduledStart && now <= gateClosureTime) {
        // OPEN: Within 30-Minute Grace Window
        setOlympiadGateState('OPEN');
      } else {
        // EXPIRED: 31st minute onwards entry is barred
        setOlympiadGateState('EXPIRED');
      }
    };

    checkWindow();
    const interval = setInterval(checkWindow, 1000);
    return () => clearInterval(interval);
  }, [isOlympiadMode, olympiadSession]);

  // 3. PROCTORING & TAB SWITCH DETECTION
  useEffect(() => {
    if (!isOlympiadMode || !examStarted || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const updated = prev + 1;
          if (updated > 2) {
            handleAutoDisqualifySubmit(updated);
          } else {
            setShowWarningModal(true);
          }
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOlympiadMode, examStarted, isSubmitted]);

  // 4. EXAMINATION TIMER
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0 || loading || !examStarted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, loading, examStarted]);

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
    const scorePercent = Math.round((correct / Math.max(questions.length, 1)) * 100);
    return {
      correct,
      wrong,
      unattempted: questions.length - (correct + wrong),
      marks: Math.max(0, parseFloat(rawMarks.toFixed(2))),
      scorePercent
    };
  };

  const handleFinalSubmit = async () => {
    const stats = calculateScore();
    setIsSubmitted(true);

    if (isOlympiadMode && rollParam) {
      try {
        const res = await submitOlympiadResult(rollParam, stats.scorePercent, tabSwitchCount);
        setVivaQualified(res.vivaEligible);
      } catch (err) {
        console.error("Error submitting Olympiad result:", err);
      }
    }
  };

  const handleAutoDisqualifySubmit = async (switchCount: number) => {
    alert("🚨 Disciplinary Violation: Maximum 2 browser switch warnings exceeded. Script auto-submitted.");
    setIsSubmitted(true);
    if (rollParam) {
      await submitOlympiadResult(rollParam, 0, switchCount);
    }
  };

  const startOlympiadExam = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}
    setExamStarted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">
          Synchronizing Proctored Assessment Room...
        </p>
      </div>
    );
  }

  // =========================================================================
  // VIEW A: OLYMPIAD LOCKED / COUNTDOWN / EXPIRED GATE SCREENS
  // =========================================================================
  if (isOlympiadMode && !examStarted && !isSubmitted) {
    if (olympiadGateState === 'UPCOMING') {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 p-8 rounded-3xl space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                Synchronized National Slot Locked
              </span>
              <h2 className="text-xl font-black mt-2">{olympiadSession?.title || 'Academic Olympiad'}</h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">Roll: {rollParam || 'Verified Candidate'}</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Session Commences In</span>
              <p className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 tracking-wider">
                {gateCountdown}
              </p>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Assessment hall unlocks automatically upon scheduled start time. Candidates are permitted a <strong>30-minute late grace window</strong> past session commencement.
            </p>

            <Link href="/olympiad" className="inline-block text-xs text-slate-400 hover:text-white font-bold underline">
              ← Return to Olympiad Timetable
            </Link>
          </div>
        </div>
      );
    }

    if (olympiadGateState === 'EXPIRED') {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center">
          <div className="max-w-md w-full bg-slate-800/90 border border-rose-900/50 p-8 rounded-3xl space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-rose-300">Admission Gate Closed</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Session admission is strictly locked. The <strong>30-minute late entry grace window</strong> for this national assessment has concluded. Late admission is barred under Directorate rules.
            </p>
            <Link href="/olympiad" className="inline-block px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl">
              Back to National Timetable
            </Link>
          </div>
        </div>
      );
    }

    // OPEN: Ready to Enter Proctored Hall
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-lg w-full bg-slate-800/90 border border-slate-700 p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
              Examination Gate Open
            </span>
            <h2 className="text-xl font-black mt-2">{olympiadSession?.title || 'Academic Olympiad'}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">Verified Roll: {rollParam}</p>
          </div>

          <div className="text-left bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
            <h4 className="font-bold text-white uppercase text-[11px]">Proctoring Instructions:</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc pl-4 leading-relaxed">
              <li>Full screen mode will engage upon clicking start.</li>
              <li>Per-question timer with forward-only navigation (No Backtracking).</li>
              <li>Switching browser windows will prompt disciplinary warnings (Limit: 2 warnings).</li>
              <li>Minimum qualifying cutoff for Research Fellowship is 75% followed by Viva Voce defense.</li>
            </ul>
          </div>

          <button
            onClick={startOlympiadExam}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" /> Start Proctored Assessment Now
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-200 p-8 rounded-3xl space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">
            {isOlympiadMode ? 'No Questions in Olympiad Vault' : 'No Questions In This Topic Yet'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isOlympiadMode 
              ? 'Please ensure questions are assigned to [🛡️ Live Olympiad Vault] for this discipline from the Admin Panel.'
              : 'Please add questions for this exam stream from the Admin Command Center.'}
          </p>
          <Link href={isOlympiadMode ? "/olympiad" : "/practice"} className="inline-block px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md">
            {isOlympiadMode ? 'Back to Olympiads' : 'Back to Practice Streams'}
          </Link>
        </div>
      </div>
    );
  }

  const scoreStats = calculateScore();
  const currentQ = questions[currentIndex];
  const att = parseAttachment(currentQ?.diagramUrl);

  // =========================================================================
  // VIEW B: ACTIVE ASSESSMENT ROOM
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      
      {/* Tab Switch Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border-2 border-rose-600 animate-in zoom-in-95">
            <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
            <h3 className="text-lg font-black text-slate-900">Proctoring Focus Alert</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Window switch or background relay detected. <strong>Warning {tabSwitchCount} of 2.</strong> Exceeding 2 warnings causes immediate automated disqualification and script submission.
            </p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Acknowledge & Resume Assessment
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href={isOlympiadMode ? "/olympiad" : "/practice"} 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> {isOlympiadMode ? 'Exit Olympiad' : 'Exit Drill'}
          </Link>

          <div className="text-center hidden sm:block">
            <p className="text-xs font-black text-slate-900 truncate max-w-xs">{currentQ?.subject}</p>
            <p className="text-[10px] text-slate-500 font-bold truncate max-w-xs">
              {isOlympiadMode ? `Roll No: ${rollParam}` : currentQ?.topic}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseHindi(!useHindi)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-lg border border-slate-300 flex items-center gap-1 transition cursor-pointer"
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
        
        {/* SCORECARD AFTER SUBMISSION */}
        {isSubmitted && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className={`px-3 py-1 text-[10px] font-black rounded uppercase border ${
                  isOlympiadMode && vivaQualified 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                  {isOlympiadMode 
                    ? (vivaQualified ? '✓ Qualified for Research Fellowship Defense' : 'Assessment Concluded') 
                    : 'Drill Completed'}
                </span>
                <h2 className="text-2xl font-black mt-2">
                  {isOlympiadMode ? 'Provisional Result Card' : 'Performance Assessment'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isOlympiadMode ? `Verified Roll: ${rollParam} • Tab Switches: ${tabSwitchCount}` : 'Marking Scheme: +2.00 / -0.66'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-emerald-400">
                  {scoreStats.marks} <span className="text-xs text-slate-400 font-normal">/ {questions.length * 2}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Written Score ({scoreStats.scorePercent}%)</p>
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

            {isOlympiadMode && vivaQualified && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 leading-relaxed space-y-1">
                <strong className="text-emerald-300 font-bold block text-sm">🎉 Viva Voce Defense Pending:</strong>
                Candidate has satisfied the baseline cutoff (&ge;75%). Retain your Roll Number. Academic faculty verification will occur within 24 hours prior to study grant dispatch.
              </div>
            )}
          </div>
        )}

        {/* Question Numbers Navigation Bar (Hidden in Olympiad mode to enforce strict forward-only pacing) */}
        {!isOlympiadMode && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {questions.map((_, i) => {
              const isAnswered = selectedAnswers[i] !== undefined;
              const isCurrent = currentIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-9 h-9 shrink-0 rounded-xl text-xs font-black transition flex items-center justify-center border cursor-pointer ${
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
        )}

        {/* Main Question Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                {currentQ?.category}
              </span>
              {currentQ?.pyqYear && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200">
                  PYQ {currentQ.pyqYear}
                </span>
              )}
              <span className="text-xs font-bold text-slate-600">
                {currentQ?.subject} • {currentQ?.topic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400">
                Q.{currentIndex + 1} of {questions.length}
              </span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                +2.00 / -0.66
              </span>
            </div>
          </div>

          {/* Question Statement */}
          <div className="space-y-2">
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-[2.2]">
              <MathRenderer text={useHindi && currentQ?.questionHi ? currentQ.questionHi : (currentQ?.questionEn || '')} />
            </div>
            {((useHindi && currentQ?.questionEn) || (!useHindi && currentQ?.questionHi)) && (
              <div className="text-xs text-slate-500 font-medium leading-[2.0] pt-1">
                <MathRenderer text={useHindi ? (currentQ?.questionEn || '') : (currentQ?.questionHi || '')} />
              </div>
            )}
          </div>

          {/* Attached Diagram / Map / Scientific Drawing */}
          {att && att.type !== 'NONE' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl w-fit max-w-full shadow-xs">
              {(att.type === 'IMAGE' || (att.type === 'GDRIVE' && !att.rawUrl.includes('.pdf'))) && (
                <img 
                  src={att.directUrl} 
                  alt="Question Illustration" 
                  referrerPolicy="no-referrer"
                  className="max-h-72 w-auto min-w-[260px] max-w-full object-contain rounded-xl bg-white p-2 border" 
                />
              )}
            </div>
          )}

          {/* Options A - D */}
          <div className="space-y-3 pt-2">
            {[0, 1, 2, 3].map(optIdx => {
              const optText = useHindi && currentQ?.optionsHi?.[optIdx] ? currentQ.optionsHi[optIdx] : currentQ?.optionsEn?.[optIdx];
              const optAltText = useHindi ? currentQ?.optionsEn?.[optIdx] : currentQ?.optionsHi?.[optIdx];
              const isSelected = selectedAnswers[currentIndex] === optIdx;
              const isCorrectAnswer = currentQ?.correctOption === optIdx;

              let cardStyle = 'bg-white border-slate-200 hover:border-slate-300';
              if (isSubmitted) {
                if (isCorrectAnswer) cardStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold';
                else if (isSelected && !isCorrectAnswer) cardStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
              } else if (isSelected) {
                cardStyle = 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 text-blue-950 font-bold';
              }

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentIndex, optIdx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${cardStyle}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <div>
                      <div className="text-sm font-semibold leading-relaxed">
                        <MathRenderer text={optText || `Option ${String.fromCharCode(65 + optIdx)}`} />
                      </div>
                      {optAltText && optAltText !== optText && (
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                          <MathRenderer text={optAltText} />
                        </div>
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

          {/* Solution & Analytical Rationale (Available after submission) */}
          {isSubmitted && (
            <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3 text-xs leading-[2.2] animate-in fade-in">
              <div className="flex items-center gap-1.5 text-blue-950 font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>विस्तृत समाधान / Detailed Solution:</span>
              </div>
              <div className="text-slate-900 font-medium">
                <MathRenderer text={useHindi && currentQ?.explanationHi ? currentQ.explanationHi : (currentQ?.explanationEn || '')} />
              </div>
            </div>
          )}

          {/* Navigation Bar */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            {/* Previous disabled in Olympiad Mode to maintain No-Backtracking Policy */}
            {!isOlympiadMode ? (
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Previous
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold font-mono">
                No Backtracking Active
              </span>
            )}

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Next
              </button>
            ) : !isSubmitted ? (
              <button
                onClick={handleFinalSubmit}
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                {isOlympiadMode ? 'Submit Examination Script' : 'Submit Drill'}
              </button>
            ) : !isOlympiadMode ? (
              <button
                onClick={() => { setIsSubmitted(false); setSelectedAnswers({}); setCurrentIndex(0); }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Retake Drill
              </button>
            ) : (
              <Link
                href="/olympiad"
                className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl transition"
              >
                Return to Olympiad Suite
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono">Loading Examination Room...</div>}>
      <QuizEngine />
    </Suspense>
  );
}