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
  Sigma, Pi, Target, ArrowUpDown
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
    { en: 'Science (Physics/Chem/Bio)', hi: 'विज्ञान' },
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
  "Strict Per-Question Timer (e.g. 50s limit with No Backtracking) to prevent AI-relay exploits.",
  "Full-Screen Browser Lock: Tab-switching or minimizing prompts a penalty; 2 warnings leads to immediate auto-submission.",
  "Front Camera & Microphone verification authorization required prior to entering the arena.",
  "Mandatory 1-on-1 Recorded Video Viva within 24 hours for top rankers (must answer 3 out of 5 questions correctly).",
  "Minimum written test cutoff of 75% marks required to be eligible for academic grants.",
  "Disqualification of any candidate immediately cascades the fellowship to the next eligible merit ranker.",
  "Zero-Tolerance Blacklist: Cheating or proxy use permanently blacklists Name, Phone, UPI ID, and Government KYC verification across Abhyaas."
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

  // Olympiad Creation Modal State
  const [isOlympiadModalOpen, setIsOlympiadModalOpen] = useState(false);
  const [newOlyTitle, setNewOlyTitle] = useState('');
  const [newOlyDesc, setNewOlyDesc] = useState('');
  const [newOlyFee, setNewOlyFee] = useState<number>(49);
  const [newOlyGrantPool, setNewOlyGrantPool] = useState('₹15,000');
  const [newOlySlots, setNewOlySlots] = useState<number>(500);
  const [newOlyDuration, setNewOlyDuration] = useState<number>(45);
  const [newOlyQuestions, setNewOlyQuestions] = useState<number>(50);
  
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

  // Hierarchy Form State (Tab 3)
  const [activeLevel, setActiveLevel] = useState<TaxonomyLevel>('CLASS');
  const [presetChoice, setPresetChoice] = useState<string>('');
  const [manualNameEn, setManualNameEn] = useState('');
  const [manualNameHi, setManualNameHi] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  // Question Studio State (Tab 1)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAutoPushModalOpen, setIsAutoPushModalOpen] = useState(false);

  // Master Target Dropdown & Ribbon Tabs for Question Studio
  const [insertTargetField, setInsertTargetField] = useState<string>('qStatementEn');
  const [ribbonTab, setRibbonTab] = useState<'home' | 'insert' | 'equations' | 'symbols'>('home');
  const [visualEquation, setVisualEquation] = useState('');

  // Bulk Importer States
  const [bulkMode, setBulkMode] = useState<'paste' | 'file'>('paste');
  const [pasteData, setPasteData] = useState('');
  const [bulkParsedQuestions, setBulkParsedQuestions] = useState<QuestionData[]>([]);
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);
  const [isImportingBulk, setIsImportingBulk] = useState(false);
  const bulkFileRef = useRef<HTMLInputElement | null>(null);

  // Filters (Tab 1)
  const [searchFilter, setSearchFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | QuestionSegment>('ALL');
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
  const [qPyqYear, setQPyqYear] = useState('2024');

  const [qStatementEn, setQStatementEn] = useState('');
  const [qStatementHi, setQStatementHi] = useState('');
  const [qOptionsEn, setQOptionsEn] = useState(['', '', '', '']);
  const [qOptionsHi, setQOptionsHi] = useState(['', '', '', '']);
  const [qOptionsDiagrams, setQOptionsDiagrams] = useState<string[]>(['', '', '', '']);
  const [qCorrectOpt, setQCorrectOpt] = useState(0);
  const [qExplanationEn, setQExplanationEn] = useState('');
  const [qExplanationHi, setQExplanationHi] = useState('');
  const [qDiagramUrl, setQDiagramUrl] = useState('');

  // Auto-Push Pipeline State
  const [pushTargetExam, setPushTargetExam] = useState('');
  const [pushTargetSegment, setPushTargetSegment] = useState<'PRACTICE' | 'PYQ'>('PRACTICE');
  const [pushPyqYear, setPushPyqYear] = useState('2026');

  const fileAttachmentRef = useRef<HTMLInputElement | null>(null);
  const opt0FileRef = useRef<HTMLInputElement | null>(null);
  const opt1FileRef = useRef<HTMLInputElement | null>(null);
  const opt2FileRef = useRef<HTMLInputElement | null>(null);
  const opt3FileRef = useRef<HTMLInputElement | null>(null);

  const getOptRef = (index: number) => {
    if (index === 0) return opt0FileRef;
    if (index === 1) return opt1FileRef;
    if (index === 2) return opt2FileRef;
    return opt3FileRef;
  };

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

  // =========================================================================
  // MASTER INSERTER FOR EXACT TARGET DROPDOWN SECTION
  // =========================================================================
  const insertIntoTargetField = (textToInsert: string) => {
    if (insertTargetField === 'qStatementEn') setQStatementEn(prev => prev + textToInsert);
    else if (insertTargetField === 'qStatementHi') setQStatementHi(prev => prev + textToInsert);
    else if (insertTargetField === 'qOptionsEn0') { const o = [...qOptionsEn]; o[0] += textToInsert; setQOptionsEn(o); }
    else if (insertTargetField === 'qOptionsEn1') { const o = [...qOptionsEn]; o[1] += textToInsert; setQOptionsEn(o); }
    else if (insertTargetField === 'qOptionsEn2') { const o = [...qOptionsEn]; o[2] += textToInsert; setQOptionsEn(o); }
    else if (insertTargetField === 'qOptionsEn3') { const o = [...qOptionsEn]; o[3] += textToInsert; setQOptionsEn(o); }
    else if (insertTargetField === 'qOptionsHi0') { const o = [...qOptionsHi]; o[0] += textToInsert; setQOptionsHi(o); }
    else if (insertTargetField === 'qOptionsHi1') { const o = [...qOptionsHi]; o[1] += textToInsert; setQOptionsHi(o); }
    else if (insertTargetField === 'qOptionsHi2') { const o = [...qOptionsHi]; o[2] += textToInsert; setQOptionsHi(o); }
    else if (insertTargetField === 'qOptionsHi3') { const o = [...qOptionsHi]; o[3] += textToInsert; setQOptionsHi(o); }
    else if (insertTargetField === 'qExplanationEn') setQExplanationEn(prev => prev + textToInsert);
    else if (insertTargetField === 'qExplanationHi') setQExplanationHi(prev => prev + textToInsert);
  };

  // =========================================================================
  // EXCEL-FIRST BULK IMPORT LOGIC & TEMPLATE GENERATOR
  // =========================================================================
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
          segment: segment,
          className: row[1] || 'Civil Services / Competitive',
          examName: row[2] || 'General Studies',
          subjectName: row[3] || 'General Subject',
          topicName: row[4] || 'General Topic',
          category: row[2] || 'General Studies',
          subject: row[3] || 'General Subject',
          class: row[1] || 'Civil Services / Competitive',
          topic: row[4] || 'General Topic',
          pyqYear: row[5] || '',
          questionEn: (row[6] || '').trim(),
          questionHi: (row[7] || row[6] || '').trim(),
          optionsEn: [
            (row[8] || '').trim(),
            (row[9] || '').trim(),
            (row[10] || '').trim(),
            (row[11] || '').trim()
          ],
          optionsHi: [
            (row[12] || row[8] || '').trim(),
            (row[13] || row[9] || '').trim(),
            (row[14] || row[10] || '').trim(),
            (row[15] || row[11] || '').trim()
          ],
          optionsDiagrams: ['', '', '', ''],
          correctOption: correctIndex,
          explanationEn: (row[17] || '').trim(),
          explanationHi: (row[18] || row[17] || '').trim(),
          diagramUrl: row[19] || '',
          attachmentType: parseAttachment(row[19] || '').type,
          isArchived: false,
          status: 'ACTIVE',
          timesUsedInOlympiad: 0
        });
      }

      setBulkParsedQuestions(parsed);
      if (parsed.length === 0) {
        setBulkParseError("No valid question rows could be identified. Make sure each row has at least columns A to R.");
      }
    } catch (err: any) {
      setBulkParseError("Error reading Excel data: " + err.message);
      setBulkParsedQuestions([]);
    }
  };

  const handleDownloadExcelTemplate = () => {
    const headers = [
      "Segment (PRACTICE/PYQ/OLYMPIAD)",
      "Class",
      "Exam",
      "Subject",
      "Topic",
      "PYQ Year",
      "Question (English)",
      "Question (Hindi)",
      "Option A (En)",
      "Option B (En)",
      "Option C (En)",
      "Option D (En)",
      "Option A (Hi)",
      "Option B (Hi)",
      "Option C (Hi)",
      "Option D (Hi)",
      "Correct Option (1-4 or A-D)",
      "Explanation (English)",
      "Explanation (Hindi)",
      "Diagram or GDrive URL"
    ];

    const sampleRows = [
      [
        "PRACTICE",
        "Engineering & Technology (JEE / B.Tech)",
        "IIT JEE (Advanced / Mains)",
        "Mathematics & Quantitative Calculus",
        "Advanced Calculus & Mathematical Physics",
        "2026",
        "Evaluate the definite integral: $I = \\int_{0}^{\\pi} \\frac{x \\sin x}{1 + \\cos^2 x} \\, dx$.",
        "निश्चित समाकल $I = \\int_{0}^{\\pi} \\frac{x \\sin x}{1 + \\cos^2 x} \\, dx$ का मान ज्ञात कीजिए।",
        "$\\frac{\\pi^2}{2}$",
        "$\\frac{\\pi^2}{4}$",
        "$\\frac{\\pi}{4}$",
        "$\\frac{\\pi^2}{8}$",
        "$\\frac{\\pi^2}{2}$",
        "$\\frac{\\pi^2}{4}$",
        "$\\frac{\\pi}{4}$",
        "$\\frac{\\pi^2}{8}$",
        "B",
        "Applying King's property $\\int_0^a f(x)\\,dx = \\int_0^a f(a-x)\\,dx$: $I = \\frac{\\pi^2}{4}$.",
        "गुणधर्म का उपयोग करने पर $I = \\frac{\\pi^2}{4}$ प्राप्त होता है।",
        ""
      ]
    ];

    const csvContent = "\uFEFF" + [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...sampleRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Abhyaas_Standard_Question_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      return alert("No valid questions parsed. Please paste data or upload a template file first.");
    }

    setIsImportingBulk(true);
    try {
      const count = await bulkUploadQuestions(bulkParsedQuestions);
      setQuestionsList(prev => [...bulkParsedQuestions, ...prev]);
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

  const handleBulkMoveQuestionsToRecycleBin = async () => {
    if (selectedQuestionIds.length === 0) return;
    if (!confirm(`Move ${selectedQuestionIds.length} selected question(s) to Recycle Bin?`)) return;

    try {
      await Promise.all(selectedQuestionIds.map(id => archiveQuestion(id)));
      setQuestionsList(prev => prev.map(q => selectedQuestionIds.includes(q.id) ? { ...q, isArchived: true, status: 'ARCHIVED' } : q));
      setSelectedQuestionIds([]);
      alert("Selected questions moved to Recycle Bin!");
    } catch (err: any) {
      alert("Error archiving questions: " + err.message);
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
    if (!confirm(`Delete ${selectedOlyIds.length} selected Olympiad tournament(s) permanently from database?`)) return;

    try {
      await Promise.all(selectedOlyIds.map(id => deleteOlympiadTournament(id)));
      setOlympiadsList(prev => prev.filter(o => !selectedOlyIds.includes(o.id)));
      setSelectedOlyIds([]);
      alert("Selected Olympiads deleted successfully!");
    } catch (err: any) {
      alert("Error deleting Olympiads: " + err.message);
    }
  };

  const handleCreateOlympiadSubmit = async (e: React.FormEvent) => {
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

    const newOly: OlympiadTournament = {
      id: `oly-${Date.now()}`,
      title: newOlyTitle.trim(),
      descriptionEn: newOlyDesc.trim() || 'Standardized All-India academic scholarship evaluation.',
      fee: Number(newOlyFee) >= 0 ? Number(newOlyFee) : 49,
      totalGrantPool: newOlyGrantPool.trim() || '₹15,000',
      totalSlots: Number(newOlySlots) || 500,
      bookedSlots: 0,
      durationMinutes: Number(newOlyDuration) || 45,
      questionsCount: Number(newOlyQuestions) || 50,
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
      status: 'UPCOMING',
      createdAt: Timestamp.now()
    };

    try {
      await saveOlympiadTournament(newOly);
      setOlympiadsList(prev => [newOly, ...prev]);
      setIsOlympiadModalOpen(false);
      setNewOlyTitle('');
      setNewOlyDesc('');
      alert("🎉 Olympiad Tournament Created!");
    } catch (err: any) {
      alert("Error creating tournament: " + err.message);
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
    setVisualEquation('');
    setQStatementEn(''); setQStatementHi('');
    setQOptionsEn(['', '', '', '']); setQOptionsHi(['', '', '', '']);
    setQOptionsDiagrams(['', '', '', '']);
    setQCorrectOpt(0); setQExplanationEn(''); setQExplanationHi('');
    setQDiagramUrl(''); setQSegment('PRACTICE');
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: QuestionData) => {
    setEditingQuestionId(q.id);
    setDuplicateWarning(null);
    setVisualEquation('');
    setQClass(q.className || q.class || '');
    setQExam(q.examName || q.category || '');
    setQSubject(q.subjectName || q.subject || '');
    setQTopic(q.topicName || q.topic || '');
    setQSegment(q.segment || 'PRACTICE');
    setQPyqYear(q.pyqYear || '2024');
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
      className: finalClass,
      examName: finalExam,
      subjectName: finalSubject,
      topicName: finalTopic || 'General',
      category: finalExam,
      subject: finalSubject,
      class: finalClass,
      topic: finalTopic || 'General',
      segment: qSegment,
      pyqYear: qSegment === 'PYQ' ? qPyqYear : '',
      questionEn: qStatementEn.trim(),
      questionHi: qStatementHi.trim() || qStatementEn.trim(),
      optionsEn: qOptionsEn.map(o => o.trim()),
      optionsHi: qOptionsHi.map(o => o.trim()),
      optionsDiagrams: qOptionsDiagrams,
      correctOption: qCorrectOpt,
      explanationEn: qExplanationEn.trim(),
      explanationHi: qExplanationHi.trim(),
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
        alert(`Saved question to [${qSegment}]!`);
      }
      setIsQuestionModalOpen(false);
    } catch (err: any) {
      alert("Error saving question: " + err.message);
    }
  };

  const handleMoveToRecycleBin = async (id: string, text: string) => {
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
    const matchesSearch = cleanStr(q.questionEn).includes(cleanStr(searchFilter)) || cleanStr(q.questionHi).includes(cleanStr(searchFilter)) || cleanStr(q.subjectName || q.subject).includes(cleanStr(searchFilter)) || cleanStr(q.topicName || q.topic).includes(cleanStr(searchFilter));
    const matchesSegment = segmentFilter === 'ALL' || q.segment === segmentFilter;
    const matchesClass = filterClass === 'ALL' || q.className === filterClass || q.class === filterClass;
    const matchesExam = filterExam === 'ALL' || q.examName === filterExam || q.category === filterExam;
    const matchesSubject = filterSubject === 'ALL' || q.subjectName === filterSubject || q.subject === filterSubject;
    return matchesSearch && matchesSegment && matchesClass && matchesExam && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
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
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 bg-slate-800 p-2 rounded-xl">
              <LogOut className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">

        {/* 4-Tab Navigation */}
        <div className="bg-white p-2 border border-slate-200 rounded-3xl shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setAdminTab('questions')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              adminTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 1. Question Bank & Practice Vault ({activeQuestions.length})
          </button>

          <button
            onClick={() => setAdminTab('olympiad')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              adminTab === 'olympiad' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" /> 2. 🛡️ Olympiad Arena & Viva ({olympiadsList.length})
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

        {/* ========================================================================= */}
        {/* TAB 1: QUESTION BANK & PRACTICE VAULT */}
        {/* ========================================================================= */}
        {adminTab === 'questions' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Active Question Bank & Practice Vault
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload via standard Excel templates or Single Question Studio with LaTeX and chemical subscript support.
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
                      setIsBulkModalOpen(true);
                    }}
                    className="px-4 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Excel Power Importer
                  </button>
                  <button
                    onClick={() => setIsAutoPushModalOpen(true)}
                    className="px-4 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Push Olympiad ➔ PYQ
                  </button>
                </div>
              </div>

              {/* Multi-Tier Filter Bar */}
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
                         seg === 'PYQ' ? `PYQ (${activeQuestions.filter(q=>q.segment==='PYQ').length})` :
                         `🛡️ Olympiad (${activeQuestions.filter(q=>q.segment==='OLYMPIAD').length})`}
                      </button>
                    ))}
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
                      placeholder="Search question, chapter or keywords..."
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Bulk Selection Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-100 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-black text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filteredActiveQuestions.length > 0 && selectedQuestionIds.length === filteredActiveQuestions.length}
                    onChange={handleToggleSelectAllQuestions}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <span>Select All Filtered ({filteredActiveQuestions.length})</span>
                </label>
                {selectedQuestionIds.length > 0 && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                    {selectedQuestionIds.length} Selected
                  </span>
                )}
              </div>

              {selectedQuestionIds.length > 0 && (
                <button
                  onClick={handleBulkMoveQuestionsToRecycleBin}
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
                  const isSelected = selectedQuestionIds.includes(q.id);

                  return (
                    <div
                      key={q.id || idx}
                      className={`bg-white border p-5 rounded-2xl shadow-sm transition space-y-3 relative ${
                        isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectQuestion(q.id)}
                            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                          />

                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            q.segment === 'OLYMPIAD' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            q.segment === 'PYQ' ? `bg-purple-100 text-purple-900 border border-purple-300` :
                            'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {q.segment === 'OLYMPIAD' ? '🛡️ Live Olympiad' :
                             q.segment === 'PYQ' ? `📜 PYQ (${q.pyqYear || 'Past Year'})` :
                             '📘 Free Practice Drill'}
                          </span>

                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                            {q.className || q.class} ➔ {q.examName || q.category} ➔ {q.subjectName || q.subject}
                          </span>

                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                            Topic: {q.topicName || q.topic}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 self-end sm:self-center">
                          <button
                            onClick={() => openEditQuestionModal(q)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Question"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveToRecycleBin(q.id, q.questionEn)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Move to Recycle Bin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-slate-900 leading-loose">
                          <MathRenderer text={q.questionEn} />
                        </div>
                        {q.questionHi && (
                          <div className="text-xs text-slate-600 mt-1 leading-loose">
                            <MathRenderer text={q.questionHi} />
                          </div>
                        )}
                      </div>

                      {att.type !== 'NONE' && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl w-fit max-w-full shadow-xs">
                          {(att.type === 'IMAGE' || (att.type === 'GDRIVE' && !att.rawUrl.includes('.pdf'))) && (
                            <img 
                              src={att.directUrl} 
                              alt="Attached Diagram" 
                              referrerPolicy="no-referrer"
                              className="max-h-72 w-auto min-w-[280px] max-w-full object-contain rounded-xl bg-white p-2 border" 
                            />
                          )}

                          {(att.type === 'PDF' || (att.type === 'GDRIVE' && att.rawUrl.includes('.pdf'))) && (
                            <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 min-w-[280px]">
                              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 font-black">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-xs text-slate-900">Attached Reference Document (.PDF)</p>
                                <p className="text-[10px] text-slate-400">Click below to read / preview</p>
                              </div>
                              <a 
                                href={att.previewUrl || att.directUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
                              >
                                View PDF <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
                        {q.optionsEn?.map((opt, i) => {
                          const optDiag = q.optionsDiagrams?.[i] || '';
                          const optAtt = parseAttachment(optDiag);

                          return (
                            <div
                              key={i}
                              className={`p-3 rounded-2xl border flex flex-col gap-2 transition ${
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
                                <div className="truncate">
                                  <MathRenderer text={opt} />
                                </div>
                              </div>

                              {optAtt.type === 'IMAGE' && optAtt.directUrl && (
                                <div className="mt-1 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center">
                                  <img 
                                    src={optAtt.directUrl} 
                                    alt={`Option ${i + 1}`}
                                    referrerPolicy="no-referrer"
                                    className="max-h-28 w-auto object-contain rounded-lg"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {(q.explanationEn || q.explanationHi) && (
                        <div className="p-3 bg-blue-50/70 rounded-xl text-[11px] text-blue-900 border border-blue-100 leading-loose">
                          <strong className="font-black">💡 Solution:</strong>{' '}
                          <MathRenderer text={q.explanationEn || q.explanationHi || ''} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: OLYMPIAD ARENA STUDIO & VIVA QUEUE */}
        {/* ========================================================================= */}
        {adminTab === 'olympiad' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-wider">
                    High Stakes Arena Manager
                  </span>
                  <span className="text-xs font-bold text-slate-500">{olympiadsList.length} Tournaments Live in DB</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">Olympiad Arena Studio & Viva Verification</h2>
                <p className="text-xs text-slate-500">Configure manual fees, dynamic categories, detailed syllabi, and anti-cheat rules.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsOlympiadModalOpen(true)}
                  className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Custom Tournament
                </button>
              </div>
            </div>

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
                    <span>Select All ({olympiadsList.length})</span>
                  </label>
                  {selectedOlyIds.length > 0 && (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                      {selectedOlyIds.length} Selected
                    </span>
                  )}
                </div>

                {selectedOlyIds.length > 0 && (
                  <button
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
                  <p className="text-xs text-slate-400">Click "Create Custom Tournament" above to publish your first Olympiad.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {olympiadsList.map(oly => {
                    const fillPercent = Math.round(((oly.bookedSlots || 0) / (oly.totalSlots || 500)) * 100);
                    const isThresholdMet = fillPercent >= 50;
                    const isSelected = selectedOlyIds.includes(oly.id);

                    return (
                      <div 
                        key={oly.id} 
                        className={`bg-white border p-5 rounded-3xl shadow-xs space-y-4 transition relative ${
                          isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOly(oly.id)}
                              className="w-4 h-4 rounded text-blue-600 cursor-pointer mt-1"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                                  Fee: ₹{oly.fee}
                                </span>
                                <span className="text-[10px] font-black px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                                  {oly.categorySection}
                                </span>
                                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  {oly.targetExam}
                                </span>
                              </div>
                              <h4 className="font-black text-sm text-slate-900 mt-1.5">{oly.title}</h4>
                              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-blue-600" />
                                {oly.startDateTime ? new Date(oly.startDateTime).toLocaleString('en-IN') : oly.scheduleText}
                              </p>
                            </div>
                          </div>
                          <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-black">
                            <span className="text-slate-600">{oly.bookedSlots || 0} / {oly.totalSlots || 500} Slots</span>
                            <span className={isThresholdMet ? 'text-emerald-600' : 'text-amber-600'}>{fillPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isThresholdMet ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(fillPercent, 100)}%` }}
                            />
                          </div>
                          <p className={`text-[10px] font-black uppercase ${isThresholdMet ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {isThresholdMet ? '✓ 50% Threshold Met' : '⏳ Awaiting 50% Cohort'}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-600">Pool: <strong className="text-blue-600">{oly.totalGrantPool}</strong></span>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete Olympiad "${oly.title}"?`)) {
                                await deleteOlympiadTournament(oly.id);
                                setOlympiadsList(prev => prev.filter(item => item.id !== oly.id));
                                setSelectedOlyIds(prev => prev.filter(id => id !== oly.id));
                              }
                            }}
                            className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-600" />
                Live Candidate Verification & Viva Queue ({participantsList.length})
              </h3>
              {participantsList.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold p-6 text-center">No participants in viva verification queue yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3">Roll Number</th>
                        <th className="py-3 px-3">Candidate</th>
                        <th className="py-3 px-3">Score</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {participantsList.map(p => (
                        <tr key={p.id}>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.rollNo}</td>
                          <td className="py-3 px-3">{p.candidateName}</td>
                          <td className="py-3 px-3 font-black text-blue-600">{p.writtenScore}%</td>
                          <td className="py-3 px-3 font-bold">{p.vivaStatus}</td>
                          <td className="py-3 px-3 text-right">
                            <button onClick={() => handleVivaAction(p.id, 'PASSED', p.candidateName)} className="px-2 py-1 bg-emerald-600 text-white font-bold text-[10px] rounded mr-2 cursor-pointer">Pass</button>
                            <button onClick={() => handleVivaAction(p.id, 'FAILED', p.candidateName)} className="px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded cursor-pointer">Fail</button>
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

        {/* ========================================================================= */}
        {/* TAB 3: CATEGORY & HIERARCHY TREE */}
        {/* ========================================================================= */}
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
                      <option value="">-- Select Parent Entity (Required for sub-categorization) --</option>
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

            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase">Active {activeLevel} Nodes ({taxonomyList.filter(t => t.level === activeLevel).length})</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {taxonomyList.filter(t => t.level === activeLevel).map(item => {
                  const parent = taxonomyList.find(t => t.id === item.parentId);
                  return (
                    <div key={item.id} className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                      <div>
                        <p className="font-extrabold text-sm text-slate-900">{item.nameEn}</p>
                        {item.nameHi && <p className="text-xs text-slate-500">{item.nameHi}</p>}
                        {parent && (
                          <span className="inline-block mt-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            ↳ Linked to: {parent.nameEn}
                          </span>
                        )}
                      </div>
                      <button onClick={() => handleDeleteTaxonomy(item.id, item.nameEn)} className="text-rose-400 hover:text-rose-600 p-2 rounded-xl cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: RECYCLE BIN */}
        {/* ========================================================================= */}
        {adminTab === 'recycle_bin' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-rose-950 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                  Recycle Bin / Archived Questions ({archivedQuestions.length})
                </h2>
                <p className="text-xs text-rose-700 mt-1">
                  Questions deleted from the active bank are held here. Restore them back or permanently wipe them from Firestore.
                </p>
              </div>

              {archivedQuestions.length > 0 && (
                <button
                  onClick={handleWipeAllRecycleBin}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" /> Empty Entire Recycle Bin
                </button>
              )}
            </div>

            <div className="space-y-3">
              {archivedQuestions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-bold shadow-sm">
                  Recycle Bin is completely empty. No deleted questions.
                </div>
              ) : (
                archivedQuestions.map(q => (
                  <div key={q.id} className="bg-white border border-rose-200 p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">
                        {q.className} ➔ {q.examName} ➔ {q.subjectName} (ID: <code className="font-mono text-[10px]">{q.id}</code>)
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestoreFromRecycleBin(q.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore to Bank
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(q)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-800 line-through opacity-80">
                      <MathRenderer text={q.questionEn} />
                    </div>
                    {q.questionHi && (
                      <div className="text-xs text-slate-500">
                        <MathRenderer text={q.questionHi} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: CREATE CUSTOM OLYMPIAD */}
      {isOlympiadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Custom Tournament Engine
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Create Standardized Olympiad</h3>
              </div>
              <button onClick={() => setIsOlympiadModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOlympiadSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tournament Title*</label>
                  <input
                    type="text"
                    placeholder="e.g. All-India Sunday Prelims Arena"
                    value={newOlyTitle}
                    onChange={e => setNewOlyTitle(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Schedule Cadence / Frequency*</label>
                  <select
                    value={newOlySection}
                    onChange={e => setNewOlySection(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                  >
                    <option value="WEEKLY">Weekly Sprints (Sundays)</option>
                    <option value="MONTHLY">Monthly Mega Assessment</option>
                    <option value="QUARTERLY">Quarterly Talent Search (3-Month)</option>
                    <option value="HALF_YEARLY">Half-Yearly Assessment</option>
                    <option value="YEARLY">Annual Grand Fellowship</option>
                    <option value="GRAND">National Convocation (15 Aug / 26 Jan)</option>
                    <option value="SPECIAL">Special Invitational</option>
                    <option value="CUSTOM" className="font-black text-blue-600">✍️ + Type Custom Section...</option>
                  </select>
                  {newOlySection === 'CUSTOM' && (
                    <input
                      type="text"
                      placeholder="Type custom frequency (e.g. Bi-Weekly, Flash Cup)"
                      value={newOlySectionCustom}
                      onChange={e => setNewOlySectionCustom(e.target.value)}
                      className="w-full h-9 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[11px] font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" /> Target Academic Hierarchy
                </span>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">1. Target Class / Standard*</label>
                    <select
                      value={newOlyClass}
                      onChange={e => setNewOlyClass(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                      required
                    >
                      <option value="">-- Choose Class --</option>
                      {classes.map(c => <option key={c.id} value={c.nameEn}>{c.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Type Custom Class...</option>
                    </select>
                    {newOlyClass === 'OTHER' && (
                      <input
                        type="text"
                        placeholder="Type custom class (e.g. Class 8th, B.Sc Honours)"
                        value={newOlyClassCustom}
                        onChange={e => setNewOlyClassCustom(e.target.value)}
                        className="w-full h-9 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">2. Target Examination*</label>
                    <select
                      value={newOlyExam}
                      onChange={e => setNewOlyExam(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                      required
                    >
                      <option value="">-- Choose Examination --</option>
                      {olyAvailableExams.map(e => <option key={e.id} value={e.nameEn}>{e.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Type Custom Exam...</option>
                    </select>
                    {newOlyExam === 'OTHER' && (
                      <input
                        type="text"
                        placeholder="Type custom exam (e.g. NDA, UPPSC, BPSC)"
                        value={newOlyExamCustom}
                        onChange={e => setNewOlyExamCustom(e.target.value)}
                        className="w-full h-9 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">3. Target Subject*</label>
                    <select
                      value={newOlySubject}
                      onChange={e => setNewOlySubject(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                      required
                    >
                      <option value="">-- Choose Subject --</option>
                      {olyAvailableSubjects.map(s => <option key={s.id} value={s.nameEn}>{s.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Type Custom Subject...</option>
                    </select>
                    {newOlySubject === 'OTHER' && (
                      <input
                        type="text"
                        placeholder="Type custom subject (e.g. Constitutional Law, Botany)"
                        value={newOlySubjectCustom}
                        onChange={e => setNewOlySubjectCustom(e.target.value)}
                        className="w-full h-9 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">4. Target Topic / Chapter</label>
                    <select
                      value={newOlyTopic}
                      onChange={e => setNewOlyTopic(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Topic (Optional) --</option>
                      {olyAvailableTopics.map(t => <option key={t.id} value={t.nameEn}>{t.nameEn}</option>)}
                      <option value="OTHER" className="font-black text-blue-600">✍️ + Type Custom Topic...</option>
                    </select>
                    {newOlyTopic === 'OTHER' && (
                      <input
                        type="text"
                        placeholder="Type custom topic (e.g. Fundamental Rights, Thermodynamics)"
                        value={newOlyTopicCustom}
                        onChange={e => setNewOlyTopicCustom(e.target.value)}
                        className="w-full h-9 px-3 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manual Fee (₹)*</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="49"
                    value={newOlyFee}
                    onChange={e => setNewOlyFee(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-blue-600"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Enter 0 for Free Entry</p>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fellowship Pool*</label>
                  <input
                    type="text"
                    placeholder="₹15,000"
                    value={newOlyGrantPool}
                    onChange={e => setNewOlyGrantPool(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slots Capacity*</label>
                  <input
                    type="number"
                    min="10"
                    value={newOlySlots}
                    onChange={e => setNewOlySlots(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Mins)*</label>
                  <input
                    type="number"
                    value={newOlyDuration}
                    onChange={e => setNewOlyDuration(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Scheduled Date & Start Time (Calendar & Clock 2026–2099)*
                </label>
                <input
                  type="datetime-local"
                  min="2026-01-01T00:00"
                  max="2099-12-31T23:59"
                  value={newOlyDateTime}
                  onChange={e => setNewOlyDateTime(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none text-slate-800 cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Examination Description / Overview</label>
                <textarea
                  rows={2}
                  placeholder="Describe examination standards, syllabus coverage, and learning outcomes..."
                  value={newOlyDesc}
                  onChange={e => setNewOlyDesc(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Trophy className="w-4 h-4" /> Save & Publish Olympiad Live
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SINGLE QUESTION STUDIO */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingQuestionId ? 'Edit Question Entry' : 'Smart Visual Question Studio'}
                </h3>
                <p className="text-xs text-slate-500">Excel Ribbon Toolbar (Home, Insert, Equations, Symbols) + MathLive Editor</p>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-5">
              
              {duplicateWarning && (
                <div className="p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 bg-rose-50 border-rose-300 text-rose-800">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-black uppercase text-slate-500">
                  Target Destination / Vault*
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { id: 'PRACTICE', title: '📘 Free Practice Drill', desc: 'Instant student drill access' },
                    { id: 'PYQ', title: '📜 Previous Year (PYQ)', desc: 'Official past year archive' },
                    { id: 'OLYMPIAD', title: '🛡️ Live Olympiad Vault', desc: 'Quarantine lock until exam' },
                  ].map(s => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setQSegment(s.id as QuestionSegment)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        qSegment === s.id 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-black text-xs">{s.title}</p>
                      <p className={`text-[10px] mt-0.5 ${qSegment === s.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {s.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {qSegment === 'PYQ' && (
                  <div className="pt-2 flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-700">Exam Year (PYQ):</label>
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

              {/* ========================================================================= */}
              {/* MASTER CONTROL BAR WITH EXACT TARGET DROPDOWN & ALIGNMENT CONTROLS */}
              {/* ========================================================================= */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">1. Insert in section:</span>
                  </div>
                  <select
                    value={insertTargetField}
                    onChange={e => setInsertTargetField(e.target.value)}
                    className="h-10 px-3 bg-slate-800 border border-slate-700 text-white font-bold rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option value="qStatementEn">Question Statement (English)</option>
                    <option value="qStatementHi">Question Statement (Hindi)</option>
                    <option value="qOptionsEn0">Option A (English)</option>
                    <option value="qOptionsEn1">Option B (English)</option>
                    <option value="qOptionsEn2">Option C (English)</option>
                    <option value="qOptionsEn3">Option D (English)</option>
                    <option value="qOptionsHi0">Option A (Hindi)</option>
                    <option value="qOptionsHi1">Option B (Hindi)</option>
                    <option value="qOptionsHi2">Option C (Hindi)</option>
                    <option value="qOptionsHi3">Option D (Hindi)</option>
                    <option value="qExplanationEn">Detailed Explanation (English)</option>
                    <option value="qExplanationHi">Detailed Explanation (Hindi)</option>
                  </select>
                </div>

                {/* Ribbon Tabs */}
                <div className="flex gap-1 overflow-x-auto pt-1">
                  {[
                    { id: 'home', label: 'Home (Font, Align, Gap)' },
                    { id: 'insert', label: 'Insert (Tables, Shapes)' },
                    { id: 'equations', label: '📐 Equations (Presets)' },
                    { id: 'symbols', label: 'Ω Math Symbols' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRibbonTab(tab.id as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer whitespace-nowrap ${
                        ribbonTab === tab.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Ribbon Tab Content */}
                <div className="pt-2">
                  {ribbonTab === 'home' && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button type="button" onClick={() => insertIntoTargetField('**text**')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded font-bold cursor-pointer">Bold</button>
                      <button type="button" onClick={() => insertIntoTargetField('*text*')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded italic cursor-pointer">Italic</button>
                      <button type="button" onClick={() => insertIntoTargetField('$X_{2}$')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded font-mono cursor-pointer">Subscript</button>
                      <button type="button" onClick={() => insertIntoTargetField('$X^{2}$')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded font-mono cursor-pointer">Power</button>
                      <button type="button" onClick={() => insertIntoTargetField('$\\frac{a}{b}$')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded font-mono cursor-pointer">Fraction</button>
                      
                      <span className="text-slate-600">|</span>
                      {/* Alignment & Spacing Buttons */}
                      <button type="button" onClick={() => insertIntoTargetField('\n\n<div align="left">\n\n', '\n\n</div>\n\n')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-cyan-300 font-bold flex items-center gap-1 cursor-pointer" title="Align Left"><AlignLeft className="w-3.5 h-3.5"/> Left</button>
                      <button type="button" onClick={() => insertIntoTargetField('\n\n<div align="center">\n\n', '\n\n</div>\n\n')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-cyan-300 font-bold flex items-center gap-1 cursor-pointer" title="Align Center"><AlignCenter className="w-3.5 h-3.5"/> Center</button>
                      <button type="button" onClick={() => insertIntoTargetField('\n\n<div align="right">\n\n', '\n\n</div>\n\n')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-cyan-300 font-bold flex items-center gap-1 cursor-pointer" title="Align Right"><AlignRight className="w-3.5 h-3.5"/> Right</button>
                      <button type="button" onClick={() => insertIntoTargetField('\n\n<br/><br/>\n\n')} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-amber-300 font-bold flex items-center gap-1 cursor-pointer" title="Add Gap / Line Break"><ArrowUpDown className="w-3.5 h-3.5"/> Extra Gap</button>
                    </div>
                  )}

                  {ribbonTab === 'insert' && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button type="button" onClick={() => insertIntoTargetField('\n\n| Col 1 | Col 2 |\n| --- | --- |\n| A | B |\n\n')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded font-bold cursor-pointer">Table 2x2</button>
                      <button type="button" onClick={() => insertIntoTargetField('\n> **💡 Note Box:** ')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-amber-300 font-bold cursor-pointer">Note Box</button>
                    </div>
                  )}

                  {ribbonTab === 'equations' && (
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {[
                        { label: 'Area of Circle', formula: '$A = \\pi r^2$' },
                        { label: 'Quadratic Formula', formula: '$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$' },
                        { label: 'Pythagorean Theorem', formula: '$a^2 + b^2 = c^2$' },
                        { label: 'Binomial Theorem', formula: '$(x + a)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^{n-k} a^k$' },
                        { label: 'Fourier Series', formula: '$f(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} (a_n \\cos nx + b_n \\sin nx)$' },
                        { label: 'Taylor Expansion', formula: '$f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x-a)^n$' },
                        { label: 'Limit Expression', formula: '$\\lim_{n \\to \\infty} f(x)$' },
                        { label: 'Trign Identity', formula: '$\\sin^2\\theta + \\cos^2\\theta = 1$' }
                      ].map((eq, i) => (
                        <button key={i} type="button" onClick={() => insertIntoTargetField(` ${eq.formula} `)} className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 rounded text-[11px] font-mono font-bold cursor-pointer">
                          {eq.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {ribbonTab === 'symbols' && (
                    <div className="flex flex-wrap gap-1 text-xs font-mono">
                      {['\\alpha', '\\beta', '\\theta', '\\pi', '\\sigma', '\\Delta', '\\Sigma', '\\omega', '\\infty', '\\int', '\\oint', '\\partial', '\\nabla', '\\pm', '\\times', '\\div', '\\le', '\\ge', '\\approx', '\\in'].map((sym, i) => (
                        <button key={i} type="button" onClick={() => insertIntoTargetField(` $${sym}$ `)} className="px-2 py-0.5 bg-slate-800 hover:bg-purple-600 rounded text-xs font-bold cursor-pointer">
                          {sym}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Visual MathLive Input */}
              <div className="p-3.5 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                  <span>✨ Visual Math Keyboard (Inserts into selected section above)</span>
                  <button type="button" disabled={!visualEquation.trim()} onClick={() => { insertIntoTargetField(` $${visualEquation}$ `); setVisualEquation(''); }} className="px-3 py-1 bg-emerald-600 text-white rounded-lg cursor-pointer">Insert into Selected Section</button>
                </div>
                <VisualMathInput value={visualEquation} onChange={setVisualEquation} />
              </div>

              {/* Question Statement En */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700">Question Statement (English)*</label>
                  <button type="button" onClick={() => setInsertTargetField('qStatementEn')} className={`text-[10px] font-bold px-2 py-0.5 rounded ${insertTargetField === 'qStatementEn' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {insertTargetField === 'qStatementEn' ? '✓ Target Set' : 'Set Target'}
                  </button>
                </div>
                <textarea rows={3} value={qStatementEn} onFocus={() => setInsertTargetField('qStatementEn')} onChange={e => { setQStatementEn(e.target.value); checkDuplicates(e.target.value); }} placeholder="Enter English question..." className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 font-sans" required />
                {qStatementEn.trim() && <div className="p-3 bg-white border rounded-xl overflow-x-auto leading-loose"><MathRenderer text={qStatementEn} /></div>}
              </div>

              {/* Question Statement Hi */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700">Question Statement (Hindi)</label>
                  <button type="button" onClick={() => setInsertTargetField('qStatementHi')} className={`text-[10px] font-bold px-2 py-0.5 rounded ${insertTargetField === 'qStatementHi' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {insertTargetField === 'qStatementHi' ? '✓ Target Set' : 'Set Target'}
                  </button>
                </div>
                <textarea rows={3} value={qStatementHi} onFocus={() => setInsertTargetField('qStatementHi')} onChange={e => setQStatementHi(e.target.value)} placeholder="हिंदी में प्रश्न..." className="w-full p-3 bg-slate-50 border rounded-xl outline-none font-sans" />
                {qStatementHi.trim() && <div className="p-3 bg-white border rounded-xl overflow-x-auto leading-loose"><MathRenderer text={qStatementHi} /></div>}
              </div>

              {/* Diagram URL */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Paste diagram image URL..."
                  value={qDiagramUrl}
                  onChange={e => setQDiagramUrl(e.target.value)}
                  className="w-full h-9 px-3 bg-white border rounded-lg font-mono text-xs outline-none"
                />
                <input type="file" accept="image/*" ref={fileAttachmentRef} onChange={handleLocalFileAttachment} className="hidden" />
                <button type="button" onClick={() => fileAttachmentRef.current?.click()} className="px-3 py-2 bg-slate-900 text-white font-bold rounded-lg shrink-0 cursor-pointer">
                  Browse
                </button>
              </div>

              {/* Options A - D (English & Hindi) */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <span className="font-black uppercase text-slate-700 block">Options & Answer Key*:</span>
                <div className="space-y-3">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="p-3 bg-white border rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input type="radio" name="correctKey" checked={qCorrectOpt === i} onChange={() => setQCorrectOpt(i)} className="w-4 h-4 text-blue-600 cursor-pointer" />
                          <span className="font-black text-slate-700 w-16">Option {String.fromCharCode(65 + i)}</span>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-slate-400 font-bold">English</span>
                            <button type="button" onClick={() => setInsertTargetField(`qOptionsEn${i}`)} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${insertTargetField === `qOptionsEn${i}` ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                              {insertTargetField === `qOptionsEn${i}` ? 'Target' : 'Set Target'}
                            </button>
                          </div>
                          <input type="text" value={qOptionsEn[i]} onFocus={() => setInsertTargetField(`qOptionsEn${i}`)} onChange={e => { const o = [...qOptionsEn]; o[i] = e.target.value; setQOptionsEn(o); }} placeholder={`Option ${String.fromCharCode(65 + i)} (En)`} className="w-full h-9 px-2 bg-slate-50 border rounded-lg text-xs outline-none" required />
                          {qOptionsEn[i].trim() && <div className="text-[11px] font-bold mt-1 overflow-x-auto leading-loose"><MathRenderer text={qOptionsEn[i]} /></div>}
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-slate-400 font-bold">Hindi</span>
                            <button type="button" onClick={() => setInsertTargetField(`qOptionsHi${i}`)} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${insertTargetField === `qOptionsHi${i}` ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                              {insertTargetField === `qOptionsHi${i}` ? 'Target' : 'Set Target'}
                            </button>
                          </div>
                          <input type="text" value={qOptionsHi[i]} onFocus={() => setInsertTargetField(`qOptionsHi${i}`)} onChange={e => { const o = [...qOptionsHi]; o[i] = e.target.value; setQOptionsHi(o); }} placeholder={`Option ${String.fromCharCode(65 + i)} (Hi)`} className="w-full h-9 px-2 bg-slate-50 border rounded-lg text-xs outline-none" />
                          {qOptionsHi[i].trim() && <div className="text-[11px] font-bold mt-1 overflow-x-auto leading-loose"><MathRenderer text={qOptionsHi[i]} /></div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Explanations */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700">Detailed Explanation (English)</label>
                    <button type="button" onClick={() => setInsertTargetField('qExplanationEn')} className={`text-[10px] font-bold px-2 py-0.5 rounded ${insertTargetField === 'qExplanationEn' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {insertTargetField === 'qExplanationEn' ? '✓ Target Set' : 'Set Target'}
                    </button>
                  </div>
                  <textarea rows={3} value={qExplanationEn} onFocus={() => setInsertTargetField('qExplanationEn')} onChange={e => setQExplanationEn(e.target.value)} placeholder="English solution..." className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none" />
                  {qExplanationEn.trim() && <div className="p-2 bg-white border rounded-xl overflow-x-auto leading-loose"><MathRenderer text={qExplanationEn} /></div>}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700">Detailed Explanation (Hindi)</label>
                    <button type="button" onClick={() => setInsertTargetField('qExplanationHi')} className={`text-[10px] font-bold px-2 py-0.5 rounded ${insertTargetField === 'qExplanationHi' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {insertTargetField === 'qExplanationHi' ? '✓ Target Set' : 'Set Target'}
                    </button>
                  </div>
                  <textarea rows={3} value={qExplanationHi} onFocus={() => setInsertTargetField('qExplanationHi')} onChange={e => setQExplanationHi(e.target.value)} placeholder="हिंदी स्पष्टीकरण..." className="w-full p-2.5 bg-slate-50 border rounded-xl outline-none" />
                  {qExplanationHi.trim() && <div className="p-2 bg-white border rounded-xl overflow-x-auto leading-loose"><MathRenderer text={qExplanationHi} /></div>}
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Question Entry to Database
              </button>

            </form>
          </div>
        </div>
      )}

      {/* EXCEL BULK IMPORTER MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Excel Power Importer
              </h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              rows={8}
              value={pasteData}
              onChange={e => { setPasteData(e.target.value); parseBulkInputText(e.target.value); }}
              placeholder="Paste Excel tab-separated rows here..."
              className="w-full p-3 bg-slate-50 border rounded-2xl font-mono text-xs outline-none"
            />
            {bulkParseError && <div className="p-2 bg-rose-50 text-rose-800 text-xs font-bold rounded-lg">{bulkParseError}</div>}
            <button
              type="button"
              disabled={bulkParsedQuestions.length === 0 || isImportingBulk}
              onClick={handleExecuteBulkImport}
              className={`w-full h-11 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                bulkParsedQuestions.length > 0 ? 'bg-emerald-600 text-white cursor-pointer' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {isImportingBulk ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>Confirm & Upload {bulkParsedQuestions.length} Questions</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}