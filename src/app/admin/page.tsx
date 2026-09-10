'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Edit3, Eye, LogOut, KeyRound,
  Layers, ChevronDown, Check, X,
  FolderTree, BookOpen, FileSpreadsheet, Upload, Download, RefreshCw,
  Search, AlertTriangle, Image as ImageIcon, ClipboardCheck,
  RotateCcw, ShieldAlert, Copy, Atom, UploadCloud, FileText, ExternalLink,
  Trophy, Users, Video, Award, CheckCircle2, Calendar, Clock, AlertOctagon,
  Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered, Palette,
  AlignLeft, AlignCenter, AlignRight, Table, BarChart2, TrendingUp,
  Shapes, Sparkles, FileDown, Percent, DollarSign, Subscript, Superscript,
  Sigma, Pi, Target, ArrowUpDown, Columns, PlayCircle, StopCircle, Radio,
  EyeOff, CheckCircle, HelpCircle
} from 'lucide-react';

import { 
  getTaxonomyNodes, saveTaxonomyNode, deleteTaxonomyNode, 
  getAllQuestions, createQuestion, updateQuestion,
  archiveQuestion, restoreQuestion, permanentlyDeleteQuestion, wipeAllRecycleBin,
  bulkUploadQuestions, autoPushOlympiadQuestions, formatScientific, parseAttachment,
  getAllOlympiads, saveOlympiadTournament, deleteOlympiadTournament,
  getAllOlympiadParticipants, updateParticipantViva,
  TaxonomyNode, TaxonomyLevel, QuestionData, QuestionSegment,
  OlympiadTournament, OlympiadParticipant, Timestamp
} from '@/lib/db';

import MathRenderer from '@/components/MathRenderer';
import VisualMathInput from '@/components/VisualMathInput';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';

const PRESETS: Record<TaxonomyLevel, { en: string; hi: string }[]> = {
  CLASS: [
    { en: 'Civil Services / Competitive', hi: 'प्रतियोगी परीक्षा / सिविल सेवा' },
    { en: 'Class 6th (Middle School)', hi: 'कक्षा 6' },
    { en: 'Class 9th (Secondary Entrance)', hi: 'कक्षा 9' },
    { en: 'Class 10th (Board / Foundation)', hi: 'कक्षा 10 बोर्ड' },
    { en: 'Class 11th - 12th (Senior Secondary)', hi: 'कक्षा 11-12' },
    { en: 'Engineering & Technology (JEE / B.Tech)', hi: 'इंजीनियरिंग प्रवेश परीक्षा' },
    { en: 'Medical & Dental (NEET / MBBS)', hi: 'मेडिकल प्रवेश परीक्षा' },
    { en: 'Graduate Aptitude (SSC / Banking / CGL)', hi: 'स्नातक प्रतियोगी परीक्षा' }
  ],
  EXAM: [
    { en: 'UPSC Civil Services (Prelims)', hi: 'संघ लोक सेवा आयोग सिविल सेवा' },
    { en: 'IIT JEE (Advanced / Mains)', hi: 'आईआईटी जेईई' },
    { en: 'NEET UG (Medical Entrance)', hi: 'नीट यूजी' },
    { en: 'JNVST (Navodaya Entrance Exam)', hi: 'जवाहर नवोदय विद्यालय प्रवेश परीक्षा' },
    { en: 'AISSEE (All India Sainik School Exam)', hi: 'अखिल भारतीय सैनिक स्कूल परीक्षा' },
    { en: 'SSC CGL & Banking Mains', hi: 'एसएससी सीजीएल एवं बैंकिंग' },
    { en: 'All India Mega Olympiad 2026', hi: 'अखिल भारतीय छात्रवृत्ति ओलंपियाड 2026' }
  ],
  SUBJECT: [
    { en: 'General Studies / Geography', hi: 'सामान्य अध्ययन / भूगोल' },
    { en: 'General Studies / Science', hi: 'सामान्य अध्ययन / विज्ञान' },
    { en: 'General Studies / Economy', hi: 'सामान्य अध्ययन / अर्थव्यवस्था' },
    { en: 'General Studies / Polity', hi: 'सामान्य अध्ययन / राजव्यवस्था' },
    { en: 'Mathematics', hi: 'गणित' },
    { en: 'Physics', hi: 'भौतिकी' },
    { en: 'Chemistry', hi: 'रसायन विज्ञान' },
    { en: 'Biology', hi: 'जीव विज्ञान' },
    { en: 'Mental Ability & Reasoning', hi: 'मानसिक योग्यता एवं तर्कशक्ति' }
  ],
  TOPIC: [
    { en: 'Global Mineral Resources & EV Transition', hi: 'वैश्विक खनिज संसाधन एवं ईवी संक्रमण' },
    { en: 'Number System & Place Value', hi: 'संख्या पद्धति एवं स्थानीय मान' },
    { en: 'Preamble & Fundamental Rights', hi: 'प्रस्तावना एवं मौलिक अधिकार' },
    { en: 'Chemical Bonding & Polycyclic Compounds', hi: 'रासायनिक आबंधन एवं बहुचक्रीय यौगिक' }
  ],
  DOMAIN: []
};

const DEFAULT_RULES = [
  "Strict Per-Question Timer (No Backtracking allowed) to prevent external relay.",
  "Window & Browser Defocus Alert: Maximum 2 warnings permitted before automated script termination.",
  "Grace Entry Window: Candidate login permissible up to 30 minutes past scheduled session commencement.",
  "Mandatory 1-on-1 Recorded Video Viva within 24 hours for top rankers (minimum 60% viva cutoff).",
  "Minimum written evaluation cutoff of 75% marks required to be eligible for academic fellowship grants.",
  "Disqualification of any candidate immediately cascades the fellowship to the next eligible merit ranker.",
  "Zero-Tolerance Blacklist: Impersonation or unauthorized aids permanently blacklist the candidate across the national verification register."
];

function parseCSVProperly(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) rows.push(currentRow);
  }
  return rows;
}

function sanitizeLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\le\s+ft/g, '\\left')
    .replace(/\\ri\s+ght/g, '\\right')
    .replace(/→/g, '\\to ')
    .replace(/←/g, '\\leftarrow ')
    .replace(/↔/g, '\\leftrightarrow ')
    .replace(/⇒/g, '\\implies ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/≠/g, '\\ne ')
    .replace(/±/g, '\\pm ')
    .replace(/×/g, '\\times ')
    .replace(/÷/g, '\\div ')
    .replace(/∞/g, '\\infty ');
}

function UniversalMathBox({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  rows?: number;
  required?: boolean;
}) {
  const [ribbonTab, setRibbonTab] = useState<'home' | 'formatting' | 'equations' | 'symbols' | 'keyboard'>('home');
  const [visualEquation, setVisualEquation] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inlineImgInputRef = useRef<HTMLInputElement | null>(null);

  const wrapOrInsert = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const el = textareaRef.current;
    if (!el) {
      onChange(value + prefix + defaultPlaceholder + suffix);
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const selectedText = value.substring(start, end);
    const content = selectedText || defaultPlaceholder;
    const replacement = prefix + content + suffix;
    const updated = value.substring(0, start) + replacement + value.substring(end);
    onChange(updated);

    setTimeout(() => {
      el.focus();
      const newPos = start + prefix.length + content.length;
      el.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleInsertImageTag = (url: string, width: string = '280', align: string = 'center') => {
    if (!url.trim()) return;
    const imgTag = `\n[img url=${url.trim()} w=${width} align=${align}]\n`;
    wrapOrInsert(imgTag, '');
  };

  const handleInlineImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return alert("Image size must be less than 4MB");

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = (evt.target?.result as string) || '';
      handleInsertImageTag(b64, '300', 'center');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <label className="text-xs font-black text-slate-800">{label}</label>
        <span className="text-[10px] text-slate-400 font-medium">
          Inline: <code className="bg-slate-200 px-1 rounded text-slate-700">$x$</code> | Centered: <code className="bg-slate-200 px-1 rounded text-slate-700">$$x$$</code>
        </span>
      </div>

      <div className="bg-slate-900 text-white rounded-xl overflow-hidden border border-slate-800 shadow-xs">
        <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 border-b border-slate-800 overflow-x-auto text-[11px]">
          {[
            { id: 'home', label: 'Home (Font, Bold)' },
            { id: 'formatting', label: '🎨 Alignment & Colors' },
            { id: 'equations', label: '📐 Equations' },
            { id: 'symbols', label: 'Ω Symbols' },
            { id: 'keyboard', label: '✨ Visual Keyboard' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRibbonTab(tab.id as any)}
              className={`px-2.5 py-1 font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                ribbonTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-2 text-xs">
          {ribbonTab === 'home' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button type="button" onClick={() => wrapOrInsert('**', '**', 'bold text')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded font-bold cursor-pointer"><b>B</b> Bold</button>
              <button type="button" onClick={() => wrapOrInsert('*', '*', 'italic text')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded italic cursor-pointer"><i>I</i> Italic</button>
              <button type="button" onClick={() => wrapOrInsert('<u>', '</u>', 'underlined text')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded underline cursor-pointer"><u>U</u> Underline</button>
              <span className="text-slate-700">|</span>
              <button type="button" onClick={() => wrapOrInsert('$', '$', 'x')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 font-mono font-bold cursor-pointer">$ Inline $</button>
              <button type="button" onClick={() => wrapOrInsert('\n$$\n', '\n$$\n', 'f(x) = ...')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono font-bold cursor-pointer">$$ Display $$</button>
              <button type="button" onClick={() => wrapOrInsert('$\\frac{', '}{b}$', 'a')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded font-mono cursor-pointer">Fraction</button>
              <button type="button" onClick={() => wrapOrInsert('$\\sqrt{', '}$', 'x')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded font-mono cursor-pointer">Square Root</button>
              <button type="button" onClick={() => wrapOrInsert('^{', '}', '2')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded font-mono cursor-pointer">Power</button>
              <button type="button" onClick={() => wrapOrInsert('_{', '}', '2')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded font-mono cursor-pointer">Subscript</button>
              <span className="text-slate-700">|</span>
              
              <input type="file" accept="image/*" ref={inlineImgInputRef} onChange={handleInlineImageUpload} className="hidden" />
              <button 
                type="button" 
                onClick={() => inlineImgInputRef.current?.click()} 
                className="px-2.5 py-1 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/50 rounded font-bold cursor-pointer flex items-center gap-1"
                title="Insert Diagram at cursor"
              >
                🖼️ + Inline Diagram
              </button>

              <button type="button" onClick={() => wrapOrInsert('\n', '')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded font-bold cursor-pointer">↵ New Line</button>
            </div>
          )}

          {ribbonTab === 'formatting' && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold mr-1">Align:</span>
                <button type="button" onClick={() => wrapOrInsert('\n[center]\n', '\n[/center]\n', 'Centered content')} className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 rounded font-bold cursor-pointer flex items-center gap-1">
                  <AlignCenter className="w-3.5 h-3.5" /> Center Align
                </button>
                <button type="button" onClick={() => wrapOrInsert('\n[right]\n', '\n[/right]\n', 'Right-aligned text')} className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 rounded font-bold cursor-pointer flex items-center gap-1">
                  <AlignRight className="w-3.5 h-3.5" /> Right Align
                </button>
                <span className="text-slate-700 mx-1">|</span>
                <span className="text-[10px] text-slate-400 font-bold mr-1">Lists:</span>
                <button type="button" onClick={() => wrapOrInsert('\n• ', '', 'Point description')} className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 rounded font-bold cursor-pointer flex items-center gap-1">
                  <List className="w-3.5 h-3.5 text-blue-400" /> • Bullet
                </button>
                <button type="button" onClick={() => wrapOrInsert('\n1. ', '', 'First Step')} className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 rounded font-bold cursor-pointer flex items-center gap-1">
                  <ListOrdered className="w-3.5 h-3.5 text-blue-400" /> 1. Numbered Step
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold mr-1">Colors:</span>
                <button type="button" onClick={() => wrapOrInsert('[color=red]', '[/color]', 'important text')} className="px-2 py-0.5 bg-rose-950/80 border border-rose-600 text-rose-300 rounded font-bold cursor-pointer text-xs">Red Tag</button>
                <button type="button" onClick={() => wrapOrInsert('[color=blue]', '[/color]', 'highlighted term')} className="px-2 py-0.5 bg-blue-950/80 border border-blue-600 text-blue-300 rounded font-bold cursor-pointer text-xs">Blue Tag</button>
                <button type="button" onClick={() => wrapOrInsert('[color=green]', '[/color]', 'correct answer')} className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-600 text-emerald-300 rounded font-bold cursor-pointer text-xs">Green Tag</button>
                <button type="button" onClick={() => wrapOrInsert('[color=amber]', '[/color]', 'theorem or law')} className="px-2 py-0.5 bg-amber-950/80 border border-amber-600 text-amber-300 rounded font-bold cursor-pointer text-xs">Amber Tag</button>
              </div>
            </div>
          )}

          {ribbonTab === 'equations' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: 'Limit', formula: '$$\\lim_{n \\to \\infty} \\frac{(1 + \\sin \\frac{\\pi}{x})^n - 1}{(1 + \\sin \\frac{\\pi}{x})^n + 1}$$' },
                { label: 'Definite Integral', formula: '$$\\int_{0}^{\\pi} f(x) \\, dx$$' },
                { label: 'Summation', formula: '$$\\sum_{k=0}^{n} a_k$$' },
                { label: 'Quadratic Formula', formula: '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$' },
                { label: 'Chemical Rxn', formula: '$\\text{CH}_4 + 2\\text{O}_2 \\to \\text{CO}_2 + 2\\text{H}_2\\text{O}$' },
                { label: 'Vector Force', formula: '$\\vec{F} = m\\vec{a}$' }
              ].map((eq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => wrapOrInsert(` ${eq.formula} `)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 rounded text-[11px] font-mono font-bold transition cursor-pointer"
                >
                  {eq.label}
                </button>
              ))}
            </div>
          )}

          {ribbonTab === 'symbols' && (
            <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
              {['\\to', '\\implies', '\\le', '\\ge', '\\ne', '\\pm', '\\infty', '\\pi', '\\alpha', '\\beta', '\\theta', '\\Delta', '\\sigma', '\\lambda', '\\in', '\\notin', '\\boldsymbol{A}'].map((sym, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => wrapOrInsert(` $${sym}$ `)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-purple-600 text-white rounded font-bold transition cursor-pointer"
                >
                  {sym}
                </button>
              ))}
            </div>
          )}

          {ribbonTab === 'keyboard' && (
            <div className="space-y-2 p-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>Visual Equation Builder:</span>
                <button
                  type="button"
                  disabled={!visualEquation.trim()}
                  onClick={() => {
                    wrapOrInsert(` $${visualEquation}$ `);
                    setVisualEquation('');
                  }}
                  className={`px-3 py-0.5 rounded text-[11px] font-bold transition ${
                    visualEquation.trim() ? 'bg-emerald-600 text-white cursor-pointer' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  + Insert Equation
                </button>
              </div>
              <VisualMathInput value={visualEquation} onChange={setVisualEquation} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">Text & Equation Input:</span>
          <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-sans leading-relaxed outline-none focus:border-blue-600 text-slate-900"
            style={{ whiteSpace: 'pre-wrap' }}
            required={required}
          />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase text-blue-600 block mb-1">Live Exam Preview:</span>
          <div className="w-full p-3 bg-white border border-blue-200 rounded-xl text-xs text-slate-900 leading-[2.2] overflow-x-auto min-h-[90px] shadow-2xs">
            {value.trim() ? <MathRenderer text={value} /> : <span className="text-slate-400 italic">Formatted math & bold text will render here live...</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AbhyaasMasterTower() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 4 Primary Navigation Tabs
  const [adminTab, setAdminTab] = useState<'questions' | 'olympiad' | 'hierarchy' | 'recycle_bin'>('questions');
  const [taxonomyList, setTaxonomyList] = useState<TaxonomyNode[]>([]);
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);
  const [olympiadsList, setOlympiadsList] = useState<OlympiadTournament[]>([]);
  const [participantsList, setParticipantsList] = useState<OlympiadParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  // Bulk Selection States
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [selectedOlyIds, setSelectedOlyIds] = useState<string[]>([]);

  // Olympiad Modal (Unified for Create & Edit)
  const [editingOlyId, setEditingOlyId] = useState<string | null>(null);
  const [isOlympiadModalOpen, setIsOlympiadModalOpen] = useState(false);
  const [newOlyTitle, setNewOlyTitle] = useState('');
  const [newOlyDesc, setNewOlyDesc] = useState('');
  const [newOlyFee, setNewOlyFee] = useState<number>(49);
  const [newOlyGrantPool, setNewOlyGrantPool] = useState('₹15,000');
  const [newOlySlots, setNewOlySlots] = useState<number>(500);
  const [newOlyDuration, setNewOlyDuration] = useState<number>(45);
  const [newOlyQuestions, setNewOlyQuestions] = useState<number>(50);
  const [newOlyGraceMinutes, setNewOlyGraceMinutes] = useState<number>(30);
  const [newOlyStatus, setNewOlyStatus] = useState<'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  
  const [newOlySection, setNewOlySection] = useState<string>('WEEKLY');
  const [newOlySectionCustom, setNewOlySectionCustom] = useState<string>('');
  
  const [newOlyClass, setNewOlyClass] = useState<string>('');
  const [newOlyClassCustom, setNewOlyClassCustom] = useState<string>('');
  
  const [newOlyExam, setNewOlyExam] = useState<string>('');
  const [newOlyExamCustom, setNewOlyExamCustom] = useState<string>('');
  
  const [newOlySubject, setNewOlySubject] = useState<string>('');
  const [newOlySubjectCustom, setNewOlySubjectCustom] = useState<string>('');

  const [newOlyTopic, setNewOlyTopic] = useState<string>('');
  const [newOlyTopicCustom, setNewOlyTopicCustom] = useState<string>('');

  const [newOlyDateTime, setNewOlyDateTime] = useState('2026-09-13T10:00');
  const [newOlyRules, setNewOlyRules] = useState<string[]>(DEFAULT_RULES);
  const [newRuleInput, setNewRuleInput] = useState('');
  
  const [newOlySyllabus, setNewOlySyllabus] = useState<{ subject: string; questions: number; topics: string }[]>([
    { subject: 'Indian Polity & Constitution', questions: 20, topics: 'Preamble, Fundamental Rights, Parliament' },
    { subject: 'Modern Indian History', questions: 15, topics: '1857 to 1947, Freedom Struggle' },
    { subject: 'Indian Economy', questions: 15, topics: 'Macroeconomics, Fiscal Policy, Banking' }
  ]);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjQs, setNewSubjQs] = useState(10);
  const [newSubjTopics, setNewSubjTopics] = useState('');

  // Admit Card Preview Modal State (Official NTA / UPSC Standard)
  const [viewingAdmitCardParticipant, setViewingAdmitCardParticipant] = useState<OlympiadParticipant | null>(null);

  // Hierarchy Form State (Tab 3)
  const [activeLevel, setActiveLevel] = useState<TaxonomyLevel>('CLASS');
  const [presetChoice, setPresetChoice] = useState<string>('');
  const [manualNameEn, setManualNameEn] = useState('');
  const [manualNameHi, setManualNameHi] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  // Question Studio State (Tab 1)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Bulk Importer States (Copy-Paste AND CSV File Upload)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<'paste' | 'file'>('paste');
  const [pasteData, setPasteData] = useState('');
  const [bulkParsedQuestions, setBulkParsedQuestions] = useState<QuestionData[]>([]);
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);
  const [isImportingBulk, setIsImportingBulk] = useState(false);
  const [bulkTargetOlympiadId, setBulkTargetOlympiadId] = useState<string>('');
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  // Filters (Tab 1)
  const [searchFilter, setSearchFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | QuestionSegment>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'LIVE' | 'DRAFT'>('ALL');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterExam, setFilterExam] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // 4-Tier Cascading Question Form (Tab 1)
  const [qClass, setQClass] = useState('');
  const [qClassCustom, setQClassCustom] = useState('');
  const [qExam, setQExam] = useState('');
  const [qExamCustom, setQExamCustom] = useState('');
  const [qSubject, setQSubject] = useState('');
  const [qSubjectCustom, setQSubjectCustom] = useState('');
  const [qTopic, setQTopic] = useState('');
  const [qTopicCustom, setQTopicCustom] = useState('');

  const [qSegment, setQSegment] = useState<QuestionSegment>('PRACTICE');
  const [qPyqYear, setQPyqYear] = useState('2026');
  const [qAssignedOlympiadId, setQAssignedOlympiadId] = useState<string>('');
  const [qIsLive, setQIsLive] = useState<boolean>(true);

  // BILINGUAL QUESTION, OPTIONS & EXPLANATIONS STATE
  const [qStatementEn, setQStatementEn] = useState('');
  const [qStatementHi, setQStatementHi] = useState('');
  const [qOptionsEn, setQOptionsEn] = useState(['', '', '', '']);
  const [qOptionsHi, setQOptionsHi] = useState(['', '', '', '']);
  const [qOptionsDiagrams, setQOptionsDiagrams] = useState<string[]>(['', '', '', '']);
  const [qCorrectOpt, setQCorrectOpt] = useState(0);
  const [qExplanationEn, setQExplanationEn] = useState('');
  const [qExplanationHi, setQExplanationHi] = useState('');
  const [qDiagramUrl, setQDiagramUrl] = useState('');

  const fileAttachmentRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const session = localStorage.getItem('abhyaas_admin_auth');
      if (session) setCurrentUser(JSON.parse(session));
    } catch {
      localStorage.removeItem('abhyaas_admin_auth');
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadAllData();
  }, [currentUser]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [taxNodes, questions, olys, parts] = await Promise.all([
        getTaxonomyNodes(), 
        getAllQuestions(),
        getAllOlympiads(),
        getAllOlympiadParticipants()
      ]);
      setTaxonomyList(taxNodes || []);
      setQuestionsList(questions || []);
      setOlympiadsList(olys || []);
      setParticipantsList(parts || []);

      const classes = (taxNodes || []).filter(t => t.level === 'CLASS');
      if (classes.length > 0 && !qClass) setQClass(classes[0].nameEn);
      if (classes.length > 0 && !newOlyClass) setNewOlyClass(classes[0].nameEn);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim() === MASTER_ADMIN_EMAIL && loginPassword === 'Abhyaas@2026') {
      const user = { email: MASTER_ADMIN_EMAIL };
      setCurrentUser(user);
      localStorage.setItem('abhyaas_admin_auth', JSON.stringify(user));
    } else {
      alert("Invalid Credentials.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('abhyaas_admin_auth');
  };

  const handleToggleQuestionLiveStatus = async (q: QuestionData) => {
    const nextLiveStatus = !(q.isLive !== false);
    try {
      await updateQuestion(q.id, { isLive: nextLiveStatus });
      setQuestionsList(prev => prev.map(item => item.id === q.id ? { ...item, isLive: nextLiveStatus } : item));
    } catch (err: any) {
      alert("Error changing visibility: " + err.message);
    }
  };

  const handleQuickAssignOlympiad = async (q: QuestionData, newOlyId: string) => {
    try {
      const targetSeg: QuestionSegment = newOlyId ? 'OLYMPIAD' : 'PRACTICE';
      await updateQuestion(q.id, { olympiadId: newOlyId, segment: targetSeg });
      setQuestionsList(prev => prev.map(item => item.id === q.id ? { ...item, olympiadId: newOlyId, segment: targetSeg } : item));
      alert(newOlyId ? `✓ Assigned to Olympiad (${newOlyId})` : `✓ Moved to General Practice Vault`);
    } catch (err: any) {
      alert("Error assigning Olympiad: " + err.message);
    }
  };

  const handleToggleSelectAllQuestions = () => {
    if (selectedQuestionIds.length === filteredActiveQuestions.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filteredActiveQuestions.map(q => q.id));
    }
  };

  const handleToggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkMoveToRecycleBin = async () => {
    if (selectedQuestionIds.length === 0) return;
    if (!confirm(`🚨 Move ${selectedQuestionIds.length} selected questions to Recycle Bin?`)) return;

    try {
      await Promise.all(selectedQuestionIds.map(id => archiveQuestion(id)));
      setQuestionsList(prev => prev.map(q => selectedQuestionIds.includes(q.id) ? { ...q, isArchived: true, status: 'ARCHIVED' } : q));
      setSelectedQuestionIds([]);
      alert("Selected questions archived successfully!");
    } catch (err: any) {
      alert("Error archiving questions: " + err.message);
    }
  };

  const parseExcelCorrectOption = (val: string): number => {
    const clean = String(val || '').trim().toUpperCase();
    if (clean === 'A' || clean === '1') return 0;
    if (clean === 'B' || clean === '2') return 1;
    if (clean === 'C' || clean === '3') return 2;
    if (clean === 'D' || clean === '4') return 3;
    const num = parseInt(clean);
    if (!isNaN(num) && num >= 1 && num <= 4) return num - 1;
    return 0;
  };

  const parseBulkInputText = (rawText: string) => {
    setBulkParseError(null);
    if (!rawText.trim()) {
      setBulkParsedQuestions([]);
      return;
    }

    try {
      let rows: string[][] = [];
      if (rawText.includes('\t')) {
        const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
        rows = lines.map(line => line.split('\t').map(c => c.trim()));
      } else {
        rows = parseCSVProperly(rawText);
      }

      const parsed: QuestionData[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 7) continue;

        const col0 = (row[0] || '').toLowerCase();
        const col6 = (row[6] || '').toLowerCase();
        if (col0.includes('segment') || col6.includes('question') || col0.includes('class')) {
          continue;
        }

        const rawSeg = (row[0] || 'PRACTICE').toUpperCase().trim();
        const segment: QuestionSegment = (['PRACTICE', 'PYQ', 'OLYMPIAD'].includes(rawSeg) ? rawSeg : 'PRACTICE') as QuestionSegment;

        const newId = `q-bulk-${Date.now()}-${i}`;
        const correctIndex = parseExcelCorrectOption(row[16]);

        parsed.push({
          id: newId,
          docId: newId,
          olympiadId: bulkTargetOlympiadId || (row[20] ? row[20].trim() : ''),
          isLive: true,
          segment: bulkTargetOlympiadId ? 'OLYMPIAD' : segment,
          className: row[1] || 'Civil Services / Competitive',
          examName: row[2] || 'General Studies',
          subjectName: row[3] || 'General Subject',
          topicName: row[4] || 'General Topic',
          category: row[2] || 'General Studies',
          subject: row[3] || 'General Subject',
          class: row[1] || 'Civil Services / Competitive',
          topic: row[4] || 'General Topic',
          pyqYear: row[5] || '',
          questionEn: sanitizeLatex((row[6] || '').trim()),
          questionHi: sanitizeLatex((row[7] || row[6] || '').trim()),
          optionsEn: [
            sanitizeLatex((row[8] || '').trim()),
            sanitizeLatex((row[9] || '').trim()),
            sanitizeLatex((row[10] || '').trim()),
            sanitizeLatex((row[11] || '').trim())
          ],
          optionsHi: [
            sanitizeLatex((row[12] || row[8] || '').trim()),
            sanitizeLatex((row[13] || row[9] || '').trim()),
            sanitizeLatex((row[14] || row[10] || '').trim()),
            sanitizeLatex((row[15] || row[11] || '').trim())
          ],
          optionsDiagrams: ['', '', '', ''],
          correctOption: correctIndex,
          explanationEn: sanitizeLatex((row[17] || '').trim()),
          explanationHi: sanitizeLatex((row[18] || row[17] || '').trim()),
          diagramUrl: row[19] || '',
          attachmentType: parseAttachment(row[19] || '').type,
          isArchived: false,
          status: 'ACTIVE',
          timesUsedInOlympiad: 0
        });
      }

      setBulkParsedQuestions(parsed);
      if (parsed.length === 0) {
        setBulkParseError("No valid question rows could be identified. Make sure each row contains the expected columns.");
      }
    } catch (err: any) {
      setBulkParseError("Error reading tabular data: " + err.message);
      setBulkParsedQuestions([]);
    }
  };

  const handleCSVFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || '';
      setPasteData(text);
      parseBulkInputText(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkImport = async () => {
    if (bulkParsedQuestions.length === 0) {
      return alert("No valid questions parsed. Please paste data or upload a file first.");
    }

    setIsImportingBulk(true);
    try {
      const finalBatch = bulkParsedQuestions.map(q => ({
        ...q,
        olympiadId: bulkTargetOlympiadId || q.olympiadId || ''
      }));

      const count = await bulkUploadQuestions(finalBatch);
      setQuestionsList(prev => [...finalBatch, ...prev]);
      setPasteData('');
      setBulkParsedQuestions([]);
      setIsBulkModalOpen(false);
      alert(`🎉 Success! Uploaded ${count} questions to the database. They are now live!`);
    } catch (err: any) {
      alert("Error importing questions: " + err.message);
    } finally {
      setIsImportingBulk(false);
    }
  };

  const openCreateOlympiadModal = () => {
    setEditingOlyId(null);
    setNewOlyTitle('');
    setNewOlyDesc('');
    setNewOlyFee(49);
    setNewOlyGrantPool('₹15,000');
    setNewOlySlots(500);
    setNewOlyDuration(45);
    setNewOlyQuestions(50);
    setNewOlyGraceMinutes(30);
    setNewOlyStatus('UPCOMING');
    setNewOlySection('WEEKLY');
    setNewOlySectionCustom('');
    setNewOlyClass('');
    setNewOlyClassCustom('');
    setNewOlyExam('');
    setNewOlyExamCustom('');
    setNewOlySubject('');
    setNewOlySubjectCustom('');
    setNewOlyTopic('');
    setNewOlyTopicCustom('');
    
    // Auto-generate Hanuman Ji-inspired ID: ABH-OLY-MMHH-11108xx
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const autoHanumanOlyId = `ABH-OLY-${mm}${hh}-11108${Math.floor(10 + Math.random() * 90)}`;
    setEditingOlyId(autoHanumanOlyId); // We temporarily use editingOlyId state to hold the generated ID for creation!

    setNewOlyRules(DEFAULT_RULES);
    setNewOlySyllabus([
      { subject: 'Indian Polity & Constitution', questions: 20, topics: 'Preamble, Fundamental Rights, Parliament' },
      { subject: 'Modern Indian History', questions: 15, topics: '1857 to 1947, Freedom Struggle' },
      { subject: 'Indian Economy', questions: 15, topics: 'Macroeconomics, Fiscal Policy, Banking' }
    ]);
    setIsOlympiadModalOpen(true);
  };

  const openEditOlympiadModal = (oly: OlympiadTournament) => {
    setEditingOlyId(oly.id);
    setNewOlyTitle(oly.title || '');
    setNewOlyDesc(oly.descriptionEn || '');
    setNewOlyFee(Number(oly.fee) || 0);
    setNewOlyGrantPool(oly.totalGrantPool || '₹15,000');
    setNewOlySlots(Number(oly.totalSlots) || 500);
    setNewOlyDuration(Number(oly.durationMinutes) || 45);
    setNewOlyQuestions(Number(oly.questionsCount) || 50);
    setNewOlyGraceMinutes(Number(oly.graceMinutes) || 30);
    setNewOlyStatus((oly.status as any) || 'UPCOMING');
    
    setNewOlySection(oly.categorySection || 'WEEKLY');
    setNewOlySectionCustom('');
    setNewOlyClass(oly.targetClass || '');
    setNewOlyClassCustom('');
    setNewOlyExam(oly.targetExam || '');
    setNewOlyExamCustom('');
    setNewOlySubject(oly.targetSubject || '');
    setNewOlySubjectCustom('');
    setNewOlyTopic(oly.topicName || '');
    setNewOlyTopicCustom('');
    
    setNewOlyDateTime(oly.startDateTime || '2026-09-13T10:00');
    setNewOlyRules(Array.isArray(oly.rules) && oly.rules.length > 0 ? oly.rules : DEFAULT_RULES);
    setNewOlySyllabus(Array.isArray(oly.syllabus) ? oly.syllabus as any : []);
    setIsOlympiadModalOpen(true);
  };

  const handleSaveOlympiadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOlyTitle.trim()) return alert("Enter Tournament Title");
    if (!newOlyDateTime) return alert("Select start date and time");

    const finalSection = newOlySection === 'CUSTOM' ? newOlySectionCustom.trim() : newOlySection;
    const finalClass = newOlyClass === 'OTHER' ? newOlyClassCustom.trim() : newOlyClass;
    const finalExam = newOlyExam === 'OTHER' ? newOlyExamCustom.trim() : newOlyExam;
    const finalSubject = newOlySubject === 'OTHER' ? newOlySubjectCustom.trim() : newOlySubject;
    const finalTopic = newOlyTopic === 'OTHER' ? newOlyTopicCustom.trim() : newOlyTopic;

    if (!finalSection) return alert("Please specify the Schedule / Section.");
    if (!finalClass) return alert("Please select or enter the Target Class.");
    if (!finalExam) return alert("Please select or enter the Target Examination.");
    if (!finalSubject) return alert("Please select or enter the Target Subject.");

    // If editingOlyId starts with ABH-OLY-, it was auto-generated. If it's a firebase id or custom, keep it.
    const targetId = (editingOlyId && editingOlyId.startsWith('ABH-OLY-')) ? editingOlyId : (editingOlyId || `oly-${Date.now()}`);

    const payload: OlympiadTournament = {
      id: targetId,
      title: newOlyTitle.trim(),
      descriptionEn: newOlyDesc.trim() || 'Standardized All-India academic scholarship evaluation.',
      fee: Number(newOlyFee) >= 0 ? Number(newOlyFee) : 49,
      totalGrantPool: newOlyGrantPool.trim() || '₹15,000',
      totalSlots: Number(newOlySlots) || 500,
      bookedSlots: olympiadsList.find(o => o.id === targetId)?.bookedSlots || 0,
      durationMinutes: Number(newOlyDuration) || 45,
      questionsCount: Number(newOlyQuestions) || 50,
      graceMinutes: Number(newOlyGraceMinutes) || 30,
      categorySection: finalSection.toUpperCase() as any,
      streamType: 'UPSC_PSC',
      targetClass: finalClass,
      targetExam: finalExam,
      targetSubject: finalSubject,
      topicName: finalTopic || 'Comprehensive',
      startDateTime: newOlyDateTime,
      scheduleText: new Date(newOlyDateTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      rules: newOlyRules,
      syllabus: newOlySyllabus,
      status: newOlyStatus,
      updatedAt: Timestamp.now(),
      createdAt: olympiadsList.find(o => o.id === targetId)?.createdAt || Timestamp.now()
    };

    try {
      await saveOlympiadTournament(payload);
      setOlympiadsList(prev => {
        const filtered = prev.filter(o => o.id !== targetId);
        return [payload, ...filtered];
      });
      setIsOlympiadModalOpen(false);
      alert(`🎉 Olympiad Saved Successfully! Unique ID: ${targetId}`);
    } catch (err: any) {
      alert("Error saving Olympiad: " + err.message);
    }
  };

  const handleToggleOlyStatus = async (oly: OlympiadTournament, nextStatus: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED') => {
    const updated: OlympiadTournament = { ...oly, status: nextStatus, updatedAt: Timestamp.now() };
    try {
      await saveOlympiadTournament(updated);
      setOlympiadsList(prev => prev.map(o => o.id === oly.id ? updated : o));

      if (nextStatus === 'COMPLETED') {
        const matchingQuestions = questionsList.filter(q => q.olympiadId === oly.id && !q.isArchived);
        if (matchingQuestions.length > 0) {
          await Promise.all(matchingQuestions.map(q => updateQuestion(q.id, { segment: 'PYQ', isLive: true })));
          setQuestionsList(prev => prev.map(q => q.olympiadId === oly.id ? { ...q, segment: 'PYQ', isLive: true } : q));
          alert(`🎉 Olympiad marked as COMPLETED! ${matchingQuestions.length} questions moved to Past Olympiad Archive.`);
        }
      }
    } catch (err: any) {
      alert("Status update error: " + err.message);
    }
  };

  const handleSingleDeleteOlympiad = async (id: string, title: string) => {
    if (!confirm(`🚨 Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteOlympiadTournament(id);
      setOlympiadsList(prev => prev.filter(o => o.id !== id));
      setSelectedOlyIds(prev => prev.filter(item => item !== id));
      alert("Olympiad tournament deleted successfully!");
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleAddSyllabusItem = () => {
    if (!newSubjName.trim()) return alert("Enter Subject Name");
    setNewOlySyllabus(prev => [
      ...prev,
      { subject: newSubjName.trim(), questions: Number(newSubjQs) || 10, topics: newSubjTopics.trim() }
    ]);
    setNewSubjName('');
    setNewSubjTopics('');
  };

  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setNewOlyRules(prev => [...prev, newRuleInput.trim()]);
    setNewRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    setNewOlyRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleSelectAllOlys = () => {
    if (selectedOlyIds.length === olympiadsList.length) {
      setSelectedOlyIds([]);
    } else {
      setSelectedOlyIds(olympiadsList.map(o => o.id));
    }
  };

  const handleToggleSelectOly = (id: string) => {
    setSelectedOlyIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteOlympiads = async () => {
    if (selectedOlyIds.length === 0) return;
    if (!confirm(`🚨 Delete ${selectedOlyIds.length} selected Olympiad tournament(s) permanently from database?`)) return;

    try {
      await Promise.all(selectedOlyIds.map(id => deleteOlympiadTournament(id)));
      setOlympiadsList(prev => prev.filter(o => !selectedOlyIds.includes(o.id)));
      setSelectedOlyIds([]);
      alert("Selected Olympiads deleted permanently!");
    } catch (err: any) {
      alert("Error deleting Olympiads: " + err.message);
    }
  };

  const handleVivaAction = async (participantId: string, action: 'PASSED' | 'FAILED', candidateName: string) => {
    const grantWon = action === 'PASSED' ? 5000 : 0;
    if (!confirm(`Approve Viva for ${candidateName}?`)) return;

    try {
      await updateParticipantViva(participantId, action, grantWon);
      setParticipantsList(prev => prev.map(p => p.id === participantId ? { ...p, vivaStatus: action, grantAmountWon: grantWon } : p));
      alert(`Candidate Viva marked as ${action}!`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Hierarchy Helpers (Tab 3)
  const handlePresetChange = (val: string) => {
    setPresetChoice(val);
    if (val === 'OTHER') {
      setManualNameEn(''); setManualNameHi('');
    } else if (val) {
      const found = PRESETS[activeLevel]?.find(p => p.en === val);
      if (found) {
        setManualNameEn(found.en); setManualNameHi(found.hi);
      }
    }
  };

  const handleSaveTaxonomy = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEn = manualNameEn.trim();
    const finalHi = manualNameHi.trim() || finalEn;
    if (!finalEn) return alert("Please enter entity name.");

    const newNode: TaxonomyNode = {
      id: `tax-${Date.now()}`,
      level: activeLevel,
      nameEn: finalEn,
      nameHi: finalHi,
      parentId: selectedParentId || undefined
    };

    setTaxonomyList(prev => [newNode, ...prev]);
    setManualNameEn(''); setManualNameHi(''); setPresetChoice('');
    await saveTaxonomyNode(newNode);
    alert(`Saved "${finalEn}" to ${activeLevel}!`);
  };

  const handleDeleteTaxonomy = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from ${activeLevel}?`)) return;
    setTaxonomyList(prev => prev.filter(t => t.id !== id));
    await deleteTaxonomyNode(id);
  };

  // Questions Bank Helpers (Tab 1)
  const cleanStr = (s: any) => String(s || '').toLowerCase().replace(/[^a-z0-9]/gi, '');

  const checkDuplicates = (text: string) => {
    const target = cleanStr(text);
    if (!target || target.length < 6) {
      setDuplicateWarning(null); return;
    }
    const exact = questionsList.find(q => {
      if (editingQuestionId && q.id === editingQuestionId) return false;
      return cleanStr(q.questionEn) === target || cleanStr(q.questionHi) === target;
    });
    if (exact) {
      setDuplicateWarning(`🚨 HARD DUPLICATE DETECTED: This exact question exists in [${exact.segment}] (ID: ${exact.id})!`);
      return;
    }
    setDuplicateWarning(null);
  };

  const handleLocalFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("File size should be less than 5MB.");

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = (evt.target?.result as string) || '';
      setQDiagramUrl(b64);
    };
    reader.readAsDataURL(file);
  };

  const openCreateQuestionModal = () => {
    setEditingQuestionId(null);
    setDuplicateWarning(null);
    setQStatementEn(''); setQStatementHi('');
    setQOptionsEn(['', '', '', '']); setQOptionsHi(['', '', '', '']);
    setQOptionsDiagrams(['', '', '', '']);
    setQCorrectOpt(0); setQExplanationEn(''); setQExplanationHi('');
    setQDiagramUrl(''); 
    setQSegment('PRACTICE');
    setQAssignedOlympiadId('');
    setQIsLive(true);
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: QuestionData) => {
    setEditingQuestionId(q.id);
    setDuplicateWarning(null);
    setQClass(q.className || q.class || '');
    setQExam(q.examName || q.category || '');
    setQSubject(q.subjectName || q.subject || '');
    setQTopic(q.topicName || q.topic || '');
    setQSegment(q.segment || 'PRACTICE');
    setQPyqYear(q.pyqYear || '2026');
    setQAssignedOlympiadId(q.olympiadId || '');
    setQIsLive(q.isLive !== false);
    setQStatementEn(q.questionEn || '');
    setQStatementHi(q.questionHi || '');
    setQOptionsEn([...(q.optionsEn || ['', '', '', ''])]);
    setQOptionsHi([...(q.optionsHi || ['', '', '', ''])]);
    setQOptionsDiagrams(Array.isArray(q.optionsDiagrams) ? [...q.optionsDiagrams] : ['', '', '', '']);
    setQCorrectOpt(q.correctOption || 0);
    setQExplanationEn(q.explanationEn || '');
    setQExplanationHi(q.explanationHi || '');
    setQDiagramUrl(q.diagramUrl || '');
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalClass = qClass === 'OTHER' ? qClassCustom.trim() : qClass;
    const finalExam = qExam === 'OTHER' ? qExamCustom.trim() : qExam;
    const finalSubject = qSubject === 'OTHER' ? qSubjectCustom.trim() : qSubject;
    const finalTopic = qTopic === 'OTHER' ? qTopicCustom.trim() : qTopic;

    if (!finalClass || !finalExam || !finalSubject || !qStatementEn.trim()) {
      return alert("Class, Exam, Subject, and English Question Statement are required!");
    }

    const parsedAtt = parseAttachment(qDiagramUrl);

    const payload: QuestionData = {
      id: editingQuestionId || `q-${Date.now()}`,
      docId: editingQuestionId || `q-${Date.now()}`,
      olympiadId: qAssignedOlympiadId.trim(),
      isLive: qIsLive,
      className: finalClass,
      examName: finalExam,
      subjectName: finalSubject,
      topicName: finalTopic || 'General',
      category: finalExam,
      subject: finalSubject,
      class: finalClass,
      topic: finalTopic || 'General',
      segment: qAssignedOlympiadId ? 'OLYMPIAD' : qSegment,
      pyqYear: qSegment === 'PYQ' ? qPyqYear : '',
      questionEn: sanitizeLatex(qStatementEn.trim()),
      questionHi: sanitizeLatex(qStatementHi.trim() || qStatementEn.trim()),
      optionsEn: qOptionsEn.map(o => sanitizeLatex(o.trim())),
      optionsHi: qOptionsHi.map(o => sanitizeLatex(o.trim())),
      optionsDiagrams: qOptionsDiagrams,
      correctOption: qCorrectOpt,
      explanationEn: sanitizeLatex(qExplanationEn.trim()),
      explanationHi: sanitizeLatex(qExplanationHi.trim()),
      diagramUrl: qDiagramUrl.trim(),
      attachmentType: parsedAtt.type,
      isArchived: false,
      status: 'ACTIVE',
      timesUsedInOlympiad: 0
    };

    try {
      if (editingQuestionId) {
        setQuestionsList(prev => prev.map(item => item.id === editingQuestionId ? payload : item));
        await updateQuestion(editingQuestionId, payload);
        alert("Question updated successfully!");
      } else {
        setQuestionsList(prev => [payload, ...prev]);
        await createQuestion(payload);
        alert(`Saved question to [${payload.segment}]! Status: ${payload.isLive ? '🟢 LIVE' : '🔴 DRAFT'}`);
      }
      setIsQuestionModalOpen(false);
    } catch (err: any) {
      alert("Error saving question: " + err.message);
    }
  };

  const handleMoveToRecycleBin = async (id: string) => {
    if (!confirm(`Move question to Recycle Bin?`)) return;
    try {
      await archiveQuestion(id);
      setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, isArchived: true, status: 'ARCHIVED' } : q));
      setSelectedQuestionIds(prev => prev.filter(item => item !== id));
    } catch (err: any) {
      alert("Error archiving question: " + err.message);
    }
  };

  const handleRestoreFromRecycleBin = async (id: string) => {
    try {
      await restoreQuestion(id);
      setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, isArchived: false, status: 'ACTIVE' } : q));
      alert("Question restored!");
    } catch (err: any) {
      alert("Error restoring: " + err.message);
    }
  };

  const handlePermanentDelete = async (q: QuestionData) => {
    if (!confirm("🚨 PERMANENT DELETE?")) return;
    try {
      await permanentlyDeleteQuestion(q.id, q.altId);
      setQuestionsList(prev => prev.filter(item => item.id !== q.id));
      alert("Deleted permanently!");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleWipeAllRecycleBin = async () => {
    if (!confirm("🚨 Wipe ALL from Recycle Bin?")) return;
    try {
      const count = await wipeAllRecycleBin();
      setQuestionsList(prev => prev.filter(q => !q.isArchived));
      alert(`Wiped ${count} questions!`);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-mono">Loading Abhyaas Command Center...</div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b1121] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">Abhyaas Admin Gateway</h2>
            <p className="text-xs text-slate-400">Enterprise Operations Console</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full h-12 px-4 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm outline-none" placeholder="admin@domain.com" required />
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full h-12 px-4 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm outline-none" placeholder="••••••••" required />
            <button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const classes = taxonomyList.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN');
  const currentClassNode = classes.find(c => c.nameEn === qClass);
  const availableExams = taxonomyList.filter(t => t.level === 'EXAM' && (!currentClassNode || t.parentId === currentClassNode.id));
  const currentExamNode = availableExams.find(e => e.nameEn === qExam);
  const availableSubjects = taxonomyList.filter(t => t.level === 'SUBJECT' && (!currentExamNode || t.parentId === currentExamNode.id));
  const currentSubjectNode = availableSubjects.find(s => s.nameEn === qSubject);
  const availableTopics = taxonomyList.filter(t => t.level === 'TOPIC' && (!currentSubjectNode || t.parentId === currentSubjectNode.id));

  const olyClassNode = classes.find(c => c.nameEn === newOlyClass);
  const olyAvailableExams = taxonomyList.filter(t => t.level === 'EXAM' && (!olyClassNode || t.parentId === olyClassNode.id));
  const olyExamNode = olyAvailableExams.find(e => e.nameEn === newOlyExam);
  const olyAvailableSubjects = taxonomyList.filter(t => t.level === 'SUBJECT' && (!olyExamNode || t.parentId === olyExamNode.id));
  const olySubjectNode = olyAvailableSubjects.find(s => s.nameEn === newOlySubject);
  const olyAvailableTopics = taxonomyList.filter(t => t.level === 'TOPIC' && (!olySubjectNode || t.parentId === olySubjectNode.id));

  const activeQuestions = questionsList.filter(q => !q.isArchived);
  const archivedQuestions = questionsList.filter(q => q.isArchived);

  const filteredActiveQuestions = activeQuestions.filter(q => {
    const matchesSearch = cleanStr(q.questionEn).includes(cleanStr(searchFilter)) || cleanStr(q.questionHi).includes(cleanStr(searchFilter)) || cleanStr(q.subjectName || q.subject).includes(cleanStr(searchFilter)) || cleanStr(q.topicName || q.topic).includes(cleanStr(searchFilter)) || cleanStr(q.olympiadId || '').includes(cleanStr(searchFilter));
    const matchesSegment = segmentFilter === 'ALL' || q.segment === segmentFilter;
    const matchesVisibility = visibilityFilter === 'ALL' || (visibilityFilter === 'LIVE' ? q.isLive !== false : q.isLive === false);
    const matchesClass = filterClass === 'ALL' || q.className === filterClass || q.class === filterClass;
    const matchesExam = filterExam === 'ALL' || q.examName === filterExam || q.category === filterExam;
    const matchesSubject = filterSubject === 'ALL' || q.subjectName === filterSubject || q.subject === filterSubject;
    return matchesSearch && matchesSegment && matchesVisibility && matchesClass && matchesExam && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-base">A</div>
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-wide flex items-center gap-2">
                ABHYAAS O.S. <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] rounded font-mono uppercase">Master Controller</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/practice" target="_blank" className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <Eye className="w-4 h-4 text-emerald-400"/> Live Practice Page
            </Link>
            <Link href="/olympiad" target="_blank" className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <Trophy className="w-4 h-4 text-amber-400"/> Live Olympiad Arena
            </Link>
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 bg-slate-800 p-2 rounded-xl cursor-pointer">
              <LogOut className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6 print:hidden">

        {/* 4-Tab Navigation */}
        <div className="bg-white p-2 border border-slate-200 rounded-3xl shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setAdminTab('questions')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              adminTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 1. Question Warehouse & Vault ({activeQuestions.length})
          </button>

          <button
            onClick={() => setAdminTab('olympiad')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              adminTab === 'olympiad' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" /> 2. 🛡️ Olympiad Arena Studio ({olympiadsList.length})
          </button>

          <button
            onClick={() => setAdminTab('hierarchy')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              adminTab === 'hierarchy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderTree className="w-4 h-4" /> 3. Category & Hierarchy Tree ({taxonomyList.length})
          </button>

          <button
            onClick={() => setAdminTab('recycle_bin')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              adminTab === 'recycle_bin' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-4 h-4" /> 4. Recycle Bin ({archivedQuestions.length})
          </button>
        </div>

        {/* TAB 1: QUESTION BANK & PRACTICE VAULT */}
        {adminTab === 'questions' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Question Bank & Warehouse Inventory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Store raw stock questions, assign to Olympiad sessions on-demand, or publish live instantly with 🟢/🔴 visibility toggles.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={openCreateQuestionModal}
                    className="px-4 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Single Question Studio
                  </button>
                  <button
                    onClick={() => {
                      setBulkParsedQuestions([]);
                      setBulkParseError(null);
                      setPasteData('');
                      setBulkTargetOlympiadId('');
                      setIsBulkModalOpen(true);
                    }}
                    className="px-4 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Excel Power Importer
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-black">
                    {(['ALL', 'PRACTICE', 'PYQ', 'OLYMPIAD'] as const).map(seg => (
                      <button
                        key={seg}
                        onClick={() => { setSegmentFilter(seg); setSelectedQuestionIds([]); }}
                        className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                          segmentFilter === seg ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        {seg === 'ALL' ? `All (${activeQuestions.length})` :
                         seg === 'PRACTICE' ? `Practice (${activeQuestions.filter(q=>q.segment==='PRACTICE').length})` :
                         seg === 'PYQ' ? `Past Archive (${activeQuestions.filter(q=>q.segment==='PYQ').length})` :
                         `🛡️ Olympiad (${activeQuestions.filter(q=>q.segment==='OLYMPIAD').length})`}
                      </button>
                    ))}
                  </div>

                  {/* Visibility State Filter */}
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-black">
                    <button
                      onClick={() => setVisibilityFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        visibilityFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      All States
                    </button>
                    <button
                      onClick={() => setVisibilityFilter('LIVE')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        visibilityFilter === 'LIVE' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Live ({activeQuestions.filter(q=>q.isLive !== false).length})
                    </button>
                    <button
                      onClick={() => setVisibilityFilter('DRAFT')}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        visibilityFilter === 'DRAFT' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Draft / Hidden ({activeQuestions.filter(q=>q.isLive === false).length})
                    </button>
                  </div>

                  <select
                    value={filterClass}
                    onChange={e => { setFilterClass(e.target.value); setSelectedQuestionIds([]); }}
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.nameEn}>{c.nameEn}</option>)}
                  </select>

                  <select
                    value={filterExam}
                    onChange={e => { setFilterExam(e.target.value); setSelectedQuestionIds([]); }}
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Examinations</option>
                    {taxonomyList.filter(t => t.level === 'EXAM').map(e => (
                      <option key={e.id} value={e.nameEn}>{e.nameEn}</option>
                    ))}
                  </select>

                  <select
                    value={filterSubject}
                    onChange={e => { setFilterSubject(e.target.value); setSelectedQuestionIds([]); }}
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Subjects</option>
                    {taxonomyList.filter(t => t.level === 'SUBJECT').map(s => (
                      <option key={s.id} value={s.nameEn}>{s.nameEn}</option>
                    ))}
                  </select>

                  <div className="relative flex-grow min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search question, topic or Olympiad ID..."
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Action Toolbar for Questions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-100 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filteredActiveQuestions.length > 0 && selectedQuestionIds.length === filteredActiveQuestions.length}
                    onChange={handleToggleSelectAllQuestions}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <span>Select All Visible ({filteredActiveQuestions.length})</span>
                </label>
                {selectedQuestionIds.length > 0 && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                    {selectedQuestionIds.length} Selected
                  </span>
                )}
              </div>

              {selectedQuestionIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkMoveToRecycleBin}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move Selected to Recycle Bin ({selectedQuestionIds.length})</span>
                </button>
              )}
            </div>

            {/* Questions Stream */}
            <div className="space-y-3">
              {filteredActiveQuestions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-extrabold text-sm text-slate-800">No Questions Found Matching Filter</p>
                  <p className="text-xs text-slate-400">Add questions using Single Question Studio or Excel Power Importer.</p>
                </div>
              ) : (
                filteredActiveQuestions.map((q, idx) => {
                  const att = parseAttachment(q.diagramUrl);
                  const isLive = q.isLive !== false;
                  const isSelected = selectedQuestionIds.includes(q.id);

                  return (
                    <div
                      key={q.id || idx}
                      className={`bg-white border p-5 rounded-2xl shadow-sm transition space-y-3 relative ${
                        isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' :
                        isLive ? 'border-slate-200 hover:border-blue-300' : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* Row Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectQuestion(q.id)}
                            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                          />

                          {/* Visibility Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleQuestionLiveStatus(q)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border ${
                              isLive 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                                : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                            }`}
                            title="Click to toggle between LIVE and DRAFT"
                          >
                            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            <span>{isLive ? '🟢 LIVE' : '🔴 DRAFT'}</span>
                          </button>

                          {/* Vault Badge */}
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            q.segment === 'OLYMPIAD' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            q.segment === 'PYQ' ? `bg-purple-100 text-purple-900 border border-purple-300` :
                            'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}>
                            {q.segment === 'OLYMPIAD' ? '🛡️ Live Olympiad' :
                             q.segment === 'PYQ' ? `🏛️ Past Archive (${q.pyqYear || 'Retrospective'})` :
                             '📘 Free Practice Drill'}
                          </span>

                          {/* Olympiad ID Tag */}
                          {q.olympiadId ? (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                              <Target className="w-3 h-3 text-amber-600" /> ID: {q.olympiadId}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded border">
                              Unassigned Stock
                            </span>
                          )}

                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                            {q.className || q.class} ➔ {q.examName || q.category} ➔ {q.subjectName || q.subject}
                          </span>

                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                            Topic: {q.topicName || q.topic}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {/* Quick Olympiad Assign Dropdown */}
                          <select
                            value={q.olympiadId || ''}
                            onChange={e => handleQuickAssignOlympiad(q, e.target.value)}
                            className="h-8 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                            title="Quick assign this question to an Olympiad"
                          >
                            <option value="">-- Assign Olympiad --</option>
                            {olympiadsList.map(o => (
                              <option key={o.id} value={o.id}>{o.title.slice(0, 28)}... ({o.id})</option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => openEditQuestionModal(q)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Question"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveToRecycleBin(q.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Move to Recycle Bin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-slate-900 leading-[2.2]">
                          <MathRenderer text={q.questionEn} />
                        </div>
                        {q.questionHi && (
                          <div className="text-xs text-slate-600 mt-1 leading-[2.2]">
                            <MathRenderer text={q.questionHi} />
                          </div>
                        )}
                      </div>

                      {att.type !== 'NONE' && att.type === 'IMAGE' && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl w-fit max-w-full shadow-xs">
                          <img 
                            src={att.directUrl} 
                            alt="Attached Diagram" 
                            referrerPolicy="no-referrer"
                            className="max-h-72 w-auto min-w-[280px] max-w-full object-contain rounded-xl bg-white p-2 border" 
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
                        {q.optionsEn?.map((opt, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-2xl border flex flex-col gap-1 transition ${
                              q.correctOption === i
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                                q.correctOption === i ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                              }`}>
                                {String.fromCharCode(65 + i)}
                              </span>
                              <div className="truncate leading-loose">
                                <MathRenderer text={opt} />
                              </div>
                            </div>
                            {q.optionsHi?.[i] && q.optionsHi[i] !== opt && (
                              <div className="text-[11px] text-slate-500 pl-7">
                                <MathRenderer text={q.optionsHi[i]} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {(q.explanationEn || q.explanationHi) && (
                        <div className="p-3.5 bg-blue-50/70 rounded-xl text-xs text-blue-950 border border-blue-100 leading-[2.2] space-y-1.5">
                          <strong className="font-black text-blue-900 block">💡 Solution & Explanation:</strong>
                          {q.explanationEn && <MathRenderer text={q.explanationEn} />}
                          {q.explanationHi && (
                            <div className="pt-1 border-t border-blue-200/50 text-slate-600">
                              <MathRenderer text={q.explanationHi} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: OLYMPIAD ARENA STUDIO */}
        {adminTab === 'olympiad' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-wider">
                    High Stakes Arena Manager
                  </span>
                  <span className="text-xs font-bold text-slate-500">{olympiadsList.length} Scheduled Evaluations</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">Olympiad Arena Studio & Master Controller</h2>
                <p className="text-xs text-slate-500">
                  Full lifecycle control: Dynamic countdowns, 30-min late join window, instant status toggles, editing, and permanent purging.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openCreateOlympiadModal}
                  className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create New Olympiad
                </button>
              </div>
            </div>

            {/* Batch Action Toolbar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-100 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={olympiadsList.length > 0 && selectedOlyIds.length === olympiadsList.length}
                      onChange={handleToggleSelectAllOlys}
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                    <span>Select All Olympiads ({olympiadsList.length})</span>
                  </label>
                  {selectedOlyIds.length > 0 && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      {selectedOlyIds.length} Selected
                    </span>
                  )}
                </div>

                {selectedOlyIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDeleteOlympiads}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedOlyIds.length})</span>
                  </button>
                )}
              </div>
              
              {olympiadsList.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                  <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-800 text-sm">No Olympiads Created Yet</p>
                  <p className="text-xs text-slate-400">Click "Create New Olympiad" above to configure your first evaluation.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {olympiadsList.map(oly => {
                    const isSelected = selectedOlyIds.includes(oly.id);
                    const isLive = oly.status === 'LIVE';
                    const isCompleted = oly.status === 'COMPLETED';
                    const isCancelled = oly.status === 'CANCELLED';

                    return (
                      <div 
                        key={oly.id} 
                        className={`bg-white border p-5 rounded-3xl shadow-xs space-y-4 transition flex flex-col justify-between ${
                          isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' : 
                          isLive ? 'border-emerald-500 ring-1 ring-emerald-500/30' :
                          'border-slate-200 hover:border-amber-400'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectOly(oly.id)}
                                className="w-4 h-4 rounded text-blue-600 cursor-pointer mt-1"
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                                    isLive ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse' :
                                    isCompleted ? 'bg-slate-100 text-slate-700 border-slate-300' :
                                    isCancelled ? 'bg-rose-100 text-rose-800 border-rose-300' :
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                    ● {oly.status || 'UPCOMING'}
                                  </span>
                                  <span className="text-[10px] font-black px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                                    Fee: ₹{oly.fee}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                    {oly.categorySection}
                                  </span>
                                </div>
                                <h4 className="font-black text-sm text-slate-900 mt-2 leading-snug">{oly.title}</h4>
                                <span className="text-[10px] font-mono text-slate-400">ID: {oly.id}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1 font-medium"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Window:</span>
                              <strong className="text-slate-900">{oly.startDateTime ? new Date(oly.startDateTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : oly.scheduleText}</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-slate-400" /> Duration:</span>
                              <strong className="text-slate-900">{oly.durationMinutes || 45} mins • {oly.questionsCount || 50} Qs</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="flex items-center gap-1 font-medium"><AlertOctagon className="w-3.5 h-3.5 text-amber-500" /> Late Grace Window:</span>
                              <strong className="text-amber-800 font-bold">+{oly.graceMinutes || 30} mins</strong>
                            </div>
                            <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200">
                              <span className="font-medium text-slate-500">Fellowship Grant:</span>
                              <strong className="text-blue-600 font-bold">{oly.totalGrantPool}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-500">State:</span>
                            <div className="flex items-center gap-1">
                              {(['UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'] as const).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleToggleOlyStatus(oly, st)}
                                  className={`px-2 py-1 rounded text-[10px] font-black transition cursor-pointer ${
                                    oly.status === st 
                                      ? 'bg-slate-900 text-white' 
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {st === 'LIVE' ? '🔴 Live' : st === 'UPCOMING' ? '⏳ Wait' : st === 'COMPLETED' ? 'Done' : 'Cancel'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditOlympiadModal(oly)}
                              className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-blue-200"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Configuration
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSingleDeleteOlympiad(oly.id, oly.title)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer border border-rose-200"
                              title="Delete Olympiad Permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Viva Verification & Candidates Queue */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-600" />
                Verified Candidates, Viva Defense & Official Admit Rosters ({participantsList.length})
              </h3>

              {participantsList.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  No registered candidates found. As scholars register from the front-end, their provisional records appear here.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3">Roll Number</th>
                        <th className="py-3 px-3">Candidate Name</th>
                        <th className="py-3 px-3">Session Enrolled</th>
                        <th className="py-3 px-3">Written %</th>
                        <th className="py-3 px-3">Defense Status</th>
                        <th className="py-3 px-3 text-right">Official Documents & Viva Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {participantsList.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.rollNo}</td>
                          <td className="py-3 px-3 font-bold text-slate-800">{p.candidateName}</td>
                          <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">{p.olympiadTier}</td>
                          <td className="py-3 px-3 font-black text-blue-600">{p.writtenScore || 0}%</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              p.vivaStatus === 'PASSED' ? 'bg-emerald-100 text-emerald-800' :
                              p.vivaStatus === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {p.vivaStatus || 'PENDING'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button 
                              type="button"
                              onClick={() => setViewingAdmitCardParticipant(p)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg cursor-pointer inline-flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> Formal Admit Card
                            </button>
                            <button type="button" onClick={() => handleVivaAction(p.id, 'PASSED', p.candidateName)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded cursor-pointer">Pass</button>
                            <button type="button" onClick={() => handleVivaAction(p.id, 'FAILED', p.candidateName)} className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded cursor-pointer">Fail</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: HIERARCHY TREE */}
        {adminTab === 'hierarchy' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-2 border border-slate-200 rounded-3xl shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'CLASS', title: '1. Classes', count: classes.length },
                { id: 'EXAM', title: '2. Examinations', count: taxonomyList.filter(t => t.level === 'EXAM').length },
                { id: 'SUBJECT', title: '3. Subjects', count: taxonomyList.filter(t => t.level === 'SUBJECT').length },
                { id: 'TOPIC', title: '4. Topics', count: taxonomyList.filter(t => t.level === 'TOPIC').length },
              ].map(lvl => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => { 
                    setActiveLevel(lvl.id as TaxonomyLevel); 
                    setPresetChoice(''); setManualNameEn(''); setManualNameHi(''); setSelectedParentId(''); 
                  }}
                  className={`py-3.5 px-4 rounded-2xl text-xs font-black transition flex flex-col items-center gap-1 cursor-pointer ${
                    activeLevel === lvl.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{lvl.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeLevel === lvl.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {lvl.count} active
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Add New {activeLevel}
              </h2>
              <form onSubmit={handleSaveTaxonomy} className="space-y-4">
                <div className="relative">
                  <select
                    value={presetChoice}
                    onChange={e => handlePresetChange(e.target.value)}
                    className="w-full h-11 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer"
                  >
                    <option value="">-- Choose from standard presets --</option>
                    {PRESETS[activeLevel]?.map((p, i) => <option key={i} value={p.en}>{p.en} ({p.hi})</option>)}
                    <option value="OTHER" className="font-black text-blue-600">✍️ + Other (Type Manually)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name in English*"
                    value={manualNameEn}
                    onChange={e => { setManualNameEn(e.target.value); setPresetChoice('OTHER'); }}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="नाम हिंदी में (Optional)"
                    value={manualNameHi}
                    onChange={e => setManualNameHi(e.target.value)}
                    className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>

                {activeLevel !== 'CLASS' && (
                  <div className="relative">
                    <select
                      value={selectedParentId}
                      onChange={e => setSelectedParentId(e.target.value)}
                      className="w-full h-11 px-4 pr-10 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl text-xs appearance-none outline-none cursor-pointer"
                    >
                      <option value="">-- Select Parent Entity --</option>
                      {activeLevel === 'EXAM' && classes.map(c => <option key={c.id} value={c.id}>Belongs to Class: {c.nameEn}</option>)}
                      {activeLevel === 'SUBJECT' && taxonomyList.filter(t => t.level === 'EXAM').map(e => <option key={e.id} value={e.id}>Belongs to Exam: {e.nameEn}</option>)}
                      {activeLevel === 'TOPIC' && taxonomyList.filter(t => t.level === 'SUBJECT').map(s => <option key={s.id} value={s.id}>Belongs to Subject: {s.nameEn}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-blue-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}

                <button type="submit" className="px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" /> Save {activeLevel} Node to Tree
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: RECYCLE BIN */}
        {adminTab === 'recycle_bin' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-rose-950 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                  Recycle Bin / Archived Questions ({archivedQuestions.length})
                </h2>
              </div>
              {archivedQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={handleWipeAllRecycleBin}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" /> Empty Entire Recycle Bin
                </button>
              )}
            </div>
            <div className="space-y-3">
              {archivedQuestions.map(q => (
                <div key={q.id} className="bg-white border border-rose-200 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">{q.className} ➔ {q.examName} ➔ {q.subjectName}</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleRestoreFromRecycleBin(q.id)} className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg cursor-pointer">Restore</button>
                      <button type="button" onClick={() => handlePermanentDelete(q)} className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg cursor-pointer">Delete Forever</button>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-800 line-through opacity-80"><MathRenderer text={q.questionEn} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* OLYMPIAD CREATION & EDIT MODAL (RESTORED & FULLY FUNCTIONAL) */}
      {/* ========================================================================= */}
      {isOlympiadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">Olympiad Arena Configuration Studio</span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  {editingOlyId && !editingOlyId.startsWith('ABH-OLY-') ? 'Edit Olympiad Configuration' : 'Create New National Olympiad'}
                </h3>
                <span className="text-[11px] font-mono text-amber-600 font-bold block mt-0.5">
                  Assigned ID: {editingOlyId}
                </span>
              </div>
              <button type="button" onClick={() => setIsOlympiadModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOlympiadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tournament / Evaluation Title*</label>
                <input
                  type="text"
                  value={newOlyTitle}
                  onChange={e => setNewOlyTitle(e.target.value)}
                  placeholder="e.g. All-India BRICS Geopolitics Fellowship Evaluation"
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-slate-900 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Description & Governance</label>
                <textarea
                  rows={3}
                  value={newOlyDesc}
                  onChange={e => setNewOlyDesc(e.target.value)}
                  placeholder="Comprehensive description of exam objectives and fellowship grants..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 text-xs"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Evaluation Fee (₹)</label>
                  <input
                    type="number"
                    value={newOlyFee}
                    onChange={e => setNewOlyFee(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grant Pool Fund</label>
                  <input
                    type="text"
                    value={newOlyGrantPool}
                    onChange={e => setNewOlyGrantPool(e.target.value)}
                    placeholder="e.g. ₹15,000"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Late Grace Window</label>
                  <input
                    type="number"
                    value={newOlyGraceMinutes}
                    onChange={e => setNewOlyGraceMinutes(Number(e.target.value))}
                    placeholder="30 mins"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newOlyDuration}
                    onChange={e => setNewOlyDuration(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Questions Count</label>
                  <input
                    type="number"
                    value={newOlyQuestions}
                    onChange={e => setNewOlyQuestions(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date & Time (IST)*</label>
                  <input
                    type="datetime-local"
                    value={newOlyDateTime}
                    onChange={e => setNewOlyDateTime(e.target.value)}
                    className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none text-[11px]"
                    required
                  />
                </div>
              </div>

              {/* Cascading Taxonomy for Olympiad with Manual Type Option */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="font-black text-slate-800 block uppercase text-[11px]">Academic Taxonomy Binding (Dropdown or Manual Type):</span>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Frequency Cadence Section:</label>
                    <select
                      value={newOlySection}
                      onChange={e => setNewOlySection(e.target.value)}
                      className="w-full h-9 px-3 bg-white border rounded-xl font-bold outline-none cursor-pointer"
                    >
                      <option value="WEEKLY">WEEKLY</option>
                      <option value="MONTHLY">MONTHLY</option>
                      <option value="QUARTERLY">QUARTERLY</option>
                      <option value="HALF_YEARLY">HALF YEARLY</option>
                      <option value="YEARLY">YEARLY</option>
                      <option value="GRAND">GRAND CONVOCATION</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Target Class / Standard:</label>
                    <select
                      value={newOlyClass}
                      onChange={e => { setNewOlyClass(e.target.value); setNewOlyExam(''); setNewOlySubject(''); }}
                      className="w-full h-9 px-3 bg-white border rounded-xl font-bold outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map(c => <option key={c.id} value={c.nameEn}>{c.nameEn}</option>)}
                      <option value="OTHER" className="font-bold text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    {newOlyClass === 'OTHER' && (
                      <input
                        type="text" placeholder="Type custom Class name" value={newOlyClassCustom} onChange={e => setNewOlyClassCustom(e.target.value)}
                        className="w-full h-9 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none" required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Target Examination:</label>
                    <select
                      value={newOlyExam}
                      onChange={e => { setNewOlyExam(e.target.value); setNewOlySubject(''); }}
                      className="w-full h-9 px-3 bg-white border rounded-xl font-bold outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Exam --</option>
                      {olyAvailableExams.map(ex => <option key={ex.id} value={ex.nameEn}>{ex.nameEn}</option>)}
                      <option value="OTHER" className="font-bold text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    {newOlyExam === 'OTHER' && (
                      <input
                        type="text" placeholder="Type custom Exam name" value={newOlyExamCustom} onChange={e => setNewOlyExamCustom(e.target.value)}
                        className="w-full h-9 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none" required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Target Subject Discipline:</label>
                    <select
                      value={newOlySubject}
                      onChange={e => setNewOlySubject(e.target.value)}
                      className="w-full h-9 px-3 bg-white border rounded-xl font-bold outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Subject --</option>
                      {olyAvailableSubjects.map(sub => <option key={sub.id} value={sub.nameEn}>{sub.nameEn}</option>)}
                      <option value="OTHER" className="font-bold text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    {newOlySubject === 'OTHER' && (
                      <input
                        type="text" placeholder="Type custom Subject name" value={newOlySubjectCustom} onChange={e => setNewOlySubjectCustom(e.target.value)}
                        className="w-full h-9 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none" required
                      />
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-md transition cursor-pointer"
              >
                {editingOlyId && !editingOlyId.startsWith('ABH-OLY-') ? 'Save Olympiad Updates' : 'Publish Olympiad Live to Timetable'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 100% BILINGUAL QUESTION STUDIO WITH OPTIONAL OLYMPIAD & VISIBILITY */}
      {/* ========================================================================= */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingQuestionId ? 'Edit Question Entry' : 'Smart Universal Question Studio (Bilingual)'}
                </h3>
                <p className="text-xs text-slate-500">
                  UPSC/NTA Standard: Hindi & English inputs with optional Olympiad binding and live/hidden controls.
                </p>
              </div>
              <button type="button" onClick={() => setIsQuestionModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-5">
              
              {/* TARGET DESTINATION & DYNAMIC OLYMPIAD SELECTOR */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-black uppercase text-slate-500">Target Vault*</label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { id: 'PRACTICE', title: '📘 Free Practice Drill', desc: 'General conceptual drills' },
                    { id: 'PYQ', title: '🏛️ Past Archive Vault', desc: 'Retrospective historical papers' },
                    { id: 'OLYMPIAD', title: '🛡️ Live Olympiad Vault', desc: 'Session-isolated quarantine' },
                  ].map(s => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setQSegment(s.id as QuestionSegment)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        qSegment === s.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-black text-xs">{s.title}</p>
                      <p className={`text-[10px] mt-0.5 ${qSegment === s.id ? 'text-blue-100' : 'text-slate-400'}`}>{s.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Optional Olympiad ID Dropdown (NOT Mandatory) */}
                <div className="pt-2 grid sm:grid-cols-2 gap-3 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-amber-700" /> Assign to Olympiad Tournament (Optional):
                    </label>
                    <select
                      value={qAssignedOlympiadId}
                      onChange={e => {
                        const val = e.target.value;
                        setQAssignedOlympiadId(val);
                        if (val) setQSegment('OLYMPIAD');
                      }}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="">-- None (Unassigned / General Warehouse) --</option>
                      {olympiadsList.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.title} (ID: {o.id})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400">If assigned, question enters quarantine for that specific tournament.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Visibility State (Puri vs Kadai):
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setQIsLive(true)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                          qIsLive ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> 🟢 Live / Published
                      </button>
                      <button
                        type="button"
                        onClick={() => setQIsLive(false)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                          !qIsLive ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        <EyeOff className="w-3.5 h-3.5" /> 🔴 Draft / Hidden
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400">Draft questions remain in backend inventory and will not appear to students.</span>
                  </div>
                </div>

                {qSegment === 'PYQ' && (
                  <div className="pt-2 flex items-center gap-3 border-t border-slate-200">
                    <label className="text-xs font-bold text-slate-700">Exam / Archive Year:</label>
                    <input
                      type="text"
                      value={qPyqYear}
                      onChange={e => setQPyqYear(e.target.value)}
                      placeholder="e.g. 2026"
                      className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold w-32 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 4-TIER CASCADING DROPDOWNS */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">1. Class / Tier*</label>
                  <div className="relative">
                    <select
                      value={qClass}
                      onChange={e => { setQClass(e.target.value); setQExam(''); setQSubject(''); setQTopic(''); }}
                      className="w-full h-11 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map(c => <option key={c.id} value={c.nameEn}>{c.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {qClass === 'OTHER' && (
                    <input
                      type="text" placeholder="Type custom Class name" value={qClassCustom} onChange={e => setQClassCustom(e.target.value)}
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs outline-none" required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">2. Target Examination*</label>
                  <div className="relative">
                    <select
                      value={qExam}
                      onChange={e => { setQExam(e.target.value); setQSubject(''); setQTopic(''); }}
                      className="w-full h-11 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Exam --</option>
                      {availableExams.map(e => <option key={e.id} value={e.nameEn}>{e.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {qExam === 'OTHER' && (
                    <input
                      type="text" placeholder="Type custom Exam name" value={qExamCustom} onChange={e => setQExamCustom(e.target.value)}
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none" required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">3. Subject*</label>
                  <div className="relative">
                    <select
                      value={qSubject}
                      onChange={e => { setQSubject(e.target.value); setQTopic(''); }}
                      className="w-full h-11 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Subject --</option>
                      {availableSubjects.map(s => <option key={s.id} value={s.nameEn}>{s.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {qSubject === 'OTHER' && (
                    <input
                      type="text" placeholder="Type custom Subject name" value={qSubjectCustom} onChange={e => setQSubjectCustom(e.target.value)}
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none" required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">4. Topic / Chapter</label>
                  <div className="relative">
                    <select
                      value={qTopic}
                      onChange={e => setQTopic(e.target.value)}
                      className="w-full h-11 px-3.5 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold appearance-none outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Topic --</option>
                      {availableTopics.map(t => <option key={t.id} value={t.nameEn}>{t.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Other (Type Manually)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {qTopic === 'OTHER' && (
                    <input
                      type="text" placeholder="Type custom Topic name" value={qTopicCustom} onChange={e => setQTopicCustom(e.target.value)}
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none"
                    />
                  )}
                </div>
              </div>

              {/* 1. Question Statement (Bilingual) */}
              <UniversalMathBox
                label="Question Statement (English)*"
                value={qStatementEn}
                onChange={val => { setQStatementEn(val); checkDuplicates(val); }}
                placeholder="Type English question statement or formula..."
                rows={3}
                required={true}
              />

              <UniversalMathBox
                label="प्रश्न विवरण (हिंदी अनुवाद)*"
                value={qStatementHi}
                onChange={setQStatementHi}
                placeholder="हिंदी में प्रश्न विवरण अथवा सूत्र दर्ज करें..."
                rows={3}
              />

              {/* Standalone Diagram Attachment */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Optional standalone diagram URL or Google Drive link..."
                  value={qDiagramUrl}
                  onChange={e => setQDiagramUrl(e.target.value)}
                  className="w-full h-9 px-3 bg-white border rounded-lg font-mono text-xs outline-none"
                />
                <input type="file" accept="image/*" ref={fileAttachmentRef} onChange={handleLocalFileAttachment} className="hidden" />
                <button type="button" onClick={() => fileAttachmentRef.current?.click()} className="px-3 py-2 bg-slate-900 text-white font-bold rounded-lg shrink-0 cursor-pointer">
                  Browse
                </button>
              </div>

              {/* 2. Options A, B, C, D (Bilingual) */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <span className="font-black uppercase text-slate-700 block text-xs">Options & Answer Key (Bilingual)*:</span>
                <div className="space-y-4">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="p-4 bg-white border rounded-2xl space-y-3 shadow-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <input
                          type="radio"
                          name="correctKey"
                          checked={qCorrectOpt === i}
                          onChange={() => setQCorrectOpt(i)}
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                        />
                        <span className="font-black text-slate-900 text-xs">
                          Option {String.fromCharCode(65 + i)} {qCorrectOpt === i ? '(✓ Correct Key)' : ''}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <UniversalMathBox
                          label={`Option ${String.fromCharCode(65 + i)} (English)`}
                          value={qOptionsEn[i]}
                          onChange={val => { const o = [...qOptionsEn]; o[i] = val; setQOptionsEn(o); }}
                          placeholder={`Option ${String.fromCharCode(65 + i)} English formula or text...`}
                          rows={2}
                          required={true}
                        />
                        <UniversalMathBox
                          label={`विकल्प ${String.fromCharCode(65 + i)} (हिंदी)`}
                          value={qOptionsHi[i]}
                          onChange={val => { const o = [...qOptionsHi]; o[i] = val; setQOptionsHi(o); }}
                          placeholder={`विकल्प ${String.fromCharCode(65 + i)} हिंदी अनुवाद...`}
                          rows={2}
                          required={false}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Detailed Solutions (Bilingual) */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <UniversalMathBox
                  label="Detailed Solution & Explanation (English)"
                  value={qExplanationEn}
                  onChange={setQExplanationEn}
                  placeholder="Step-by-step mathematical proof / solution..."
                  rows={4}
                />
                <UniversalMathBox
                  label="विस्तृत व्याख्या एवं समाधान (हिंदी अनुवाद)"
                  value={qExplanationHi}
                  onChange={setQExplanationHi}
                  placeholder="हिंदी में चरणबद्ध हल एवं व्याख्या..."
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Bilingual Question to Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXCEL & CSV POWER IMPORTER (COPY-PASTE + CSV FILE UPLOAD) */}
      {/* ========================================================================= */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Excel & CSV Power Importer
                </h3>
                <p className="text-xs text-slate-500">Bulk upload questions via Direct Copy-Paste or CSV Spreadsheet file.</p>
              </div>
              <button type="button" onClick={() => setIsBulkModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Optional Target Olympiad for Entire Batch */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-700" /> Assign Uploaded Batch to Olympiad (Optional):
              </label>
              <select
                value={bulkTargetOlympiadId}
                onChange={e => setBulkTargetOlympiadId(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="">-- None (Keep in General Practice / Unassigned Warehouse) --</option>
                {olympiadsList.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.title} (ID: {o.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Switcher: Paste VS CSV File */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setBulkMode('paste')}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  bulkMode === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📋 Direct Copy-Paste from Excel
              </button>
              <button
                type="button"
                onClick={() => setBulkMode('file')}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  bulkMode === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📁 Upload CSV Spreadsheet File
              </button>
            </div>

            {bulkMode === 'paste' ? (
              <textarea
                rows={8}
                value={pasteData}
                onChange={e => { setPasteData(e.target.value); parseBulkInputText(e.target.value); }}
                placeholder="Paste Excel tab-separated rows here (Columns: Segment, Class, Exam, Subject, Topic, Year, QuestionEn, QuestionHi, OptA_En, OptB_En, OptC_En, OptD_En, OptA_Hi, OptB_Hi, OptC_Hi, OptD_Hi, CorrectKey, SolutionEn, SolutionHi, DiagramUrl)..."
                className="w-full p-3 bg-slate-50 border rounded-2xl font-mono text-xs outline-none"
              />
            ) : (
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 bg-slate-50">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <p className="font-bold text-xs text-slate-700">Choose CSV Spreadsheet File</p>
                  <p className="text-[11px] text-slate-400">File must follow the 20-column standard question schema</p>
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  ref={csvFileInputRef}
                  onChange={handleCSVFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => csvFileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Browse Computer for CSV File
                </button>
              </div>
            )}

            {bulkParseError && <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">{bulkParseError}</div>}
            
            {bulkParsedQuestions.length > 0 && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                ✓ Successfully parsed {bulkParsedQuestions.length} questions ready for deployment!
              </div>
            )}

            <button
              type="button"
              disabled={bulkParsedQuestions.length === 0 || isImportingBulk}
              onClick={handleExecuteBulkImport}
              className={`w-full h-11 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                bulkParsedQuestions.length > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {isImportingBulk ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>Confirm & Upload {bulkParsedQuestions.length} Questions to Database</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: OFFICIAL NTA / UPSC STANDARD PROVISIONAL ADMIT CARD */}
      {viewingAdmitCardParticipant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-8 shadow-2xl my-6 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official National Assessment Hall Ticket Generated
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Print / Save Formal PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewingAdmitCardParticipant(null)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="admit-card-container p-6 sm:p-8 border-2 border-slate-900 rounded-2xl bg-white text-slate-900 space-y-5 font-serif mt-4">
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-slate-900 flex items-center justify-center font-black text-lg bg-slate-100 font-sans">
                    A
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900">
                      ABHYAAS NATIONAL TESTING & ACADEMIC FELLOWSHIP DIRECTORATE
                    </h2>
                    <p className="text-xs font-bold text-slate-700 tracking-wide">
                      ALL-INDIA STANDARDIZED COMPETITIVE EVALUATION ROSTER (SESSION 2026)
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <span className="inline-block px-4 py-0.5 bg-slate-900 text-white text-xs font-sans font-bold uppercase tracking-widest rounded-full">
                    PROVISIONAL ADMIT CARD (HALL TICKET)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-slate-300 p-3 rounded-lg text-xs font-sans">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Application Reference No:</span>
                  <span className="font-mono font-bold text-slate-900">ABH-APP-{viewingAdmitCardParticipant.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="text-center my-2 sm:my-0">
                  <span className="font-mono text-xs tracking-widest font-black text-slate-800 bg-slate-200 px-3 py-1 rounded border">
                    ||| | ||||| || |||||| | ||| |||| |
                  </span>
                  <span className="text-[9px] block text-slate-400 mt-0.5 font-mono">{viewingAdmitCardParticipant.rollNo}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Candidate Security Status:</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold rounded">
                    KYC Verified / Proctored
                  </span>
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden text-xs font-sans">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="p-2.5 bg-slate-100 font-bold text-slate-700 w-1/4 border-r border-slate-300">Roll Number:</td>
                      <td className="p-2.5 font-mono font-black text-base text-slate-900 w-1/4 border-r border-slate-300">{viewingAdmitCardParticipant.rollNo}</td>
                      <td className="p-2.5 bg-slate-100 font-bold text-slate-700 w-1/4 border-r border-slate-300">Candidate's Name:</td>
                      <td className="p-2.5 font-black text-slate-900 w-1/4 uppercase">{viewingAdmitCardParticipant.candidateName}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2.5 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">Registered Email:</td>
                      <td className="p-2.5 font-medium border-r border-slate-300">{viewingAdmitCardParticipant.email}</td>
                      <td className="p-2.5 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">Contact Number:</td>
                      <td className="p-2.5 font-medium">{viewingAdmitCardParticipant.phone}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="p-2.5 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">Examination Stream:</td>
                      <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300" colSpan={3}>
                        {viewingAdmitCardParticipant.olympiadTier}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-300 bg-amber-50/50">
                      <td className="p-2.5 font-bold text-amber-900 border-r border-slate-300">Reporting & Start Window:</td>
                      <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">
                        {viewingAdmitCardParticipant.examSlot || '10:00 AM (Synchronized)'}
                      </td>
                      <td className="p-2.5 font-bold text-rose-900 border-r border-slate-300">Gate Closure Time (Strict):</td>
                      <td className="p-2.5 font-bold text-rose-700">
                        +30 Minutes Past Session Start (No Entry Thereafter)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">Fee Status:</td>
                      <td className="p-2.5 font-bold text-emerald-700 border-r border-slate-300">
                        {viewingAdmitCardParticipant.amount === 0 ? 'Exempted (Institutional Merit Grant)' : `₹${viewingAdmitCardParticipant.amount} (Payment Reconciled)`}
                      </td>
                      <td className="p-2.5 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">Test Delivery Mode:</td>
                      <td className="p-2.5 font-bold text-slate-900">Computer Based Proctored Assessment (CBT)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Clean National Standard Print Output */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .admit-card-container, .admit-card-container * {
            visibility: visible;
          }
          .admit-card-container {
            position: absolute;
            files: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15px;
            border: 2px solid #000 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

    </div>
  );
}