'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Edit3, Eye, LogOut, KeyRound,
  Layers, ChevronDown, Check, X,
  FolderTree, BookOpen, FileSpreadsheet, Upload, Download, RefreshCw,
  Search, AlertTriangle, Image as ImageIcon, ClipboardCheck,
  RotateCcw, ShieldAlert, Copy, Atom, UploadCloud
} from 'lucide-react';

import { 
  getTaxonomyNodes, saveTaxonomyNode, deleteTaxonomyNode, 
  getAllQuestions, createQuestion, updateQuestion,
  archiveQuestion, restoreQuestion, permanentlyDeleteQuestion, wipeAllRecycleBin,
  bulkUploadQuestions, autoPushOlympiadQuestions, formatScientific,
  TaxonomyNode, TaxonomyLevel, QuestionData, QuestionSegment
} from '@/lib/db';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';

const PRESETS: Record<TaxonomyLevel, { en: string; hi: string }[]> = {
  CLASS: [
    { en: 'Civil Services / Competitive', hi: 'प्रतियोगी परीक्षा / सिविल सेवा' },
    { en: 'Class 6th (Middle School)', hi: 'कक्षा 6' },
    { en: 'Class 9th (Secondary Entrance)', hi: 'कक्षा 9' },
    { en: 'Class 10th (Board / Foundation)', hi: 'कक्षा 10 बोर्ड' },
    { en: 'Class 11th - 12th (Senior Secondary)', hi: 'कक्षा 11-12' }
  ],
  EXAM: [
    { en: 'UPSC Civil Services (Prelims)', hi: 'संघ लोक सेवा आयोग सिविल सेवा' },
    { en: 'JNVST (Navodaya Entrance Exam)', hi: 'जवाहर नवोदय विद्यालय प्रवेश परीक्षा' },
    { en: 'AISSEE (All India Sainik School Exam)', hi: 'अखिल भारतीय सैनिक स्कूल परीक्षा' },
    { en: 'All India Mega Olympiad 2026', hi: 'अखिल भारतीय छात्रवृत्ति ओलंपियाड 2026' }
  ],
  SUBJECT: [
    { en: 'General Studies / Geography', hi: 'सामान्य अध्ययन / भूगोल' },
    { en: 'General Studies / Science', hi: 'सामान्य अध्ययन / विज्ञान' },
    { en: 'General Studies / Economy', hi: 'सामान्य अध्ययन / अर्थव्यवस्था' },
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

  // Primary Navigation
  const [adminTab, setAdminTab] = useState<'hierarchy' | 'questions' | 'recycle_bin'>('questions');
  const [taxonomyList, setTaxonomyList] = useState<TaxonomyNode[]>([]);
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(false);

  // Hierarchy Form State
  const [activeLevel, setActiveLevel] = useState<TaxonomyLevel>('CLASS');
  const [presetChoice, setPresetChoice] = useState<string>('');
  const [manualNameEn, setManualNameEn] = useState('');
  const [manualNameHi, setManualNameHi] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  // Question Studio State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAutoPushModalOpen, setIsAutoPushModalOpen] = useState(false);

  const [bulkMode, setBulkMode] = useState<'paste' | 'csv'>('paste');
  const [pasteData, setPasteData] = useState('');
  const [copiedSample, setCopiedSample] = useState(false);

  // Filtering Controls
  const [searchFilter, setSearchFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | QuestionSegment>('ALL');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterExam, setFilterExam] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');

  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // 4-Tier Cascading Question Form
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
  const [qCorrectOpt, setQCorrectOpt] = useState(0);
  const [qExplanationEn, setQExplanationEn] = useState('');
  const [qExplanationHi, setQExplanationHi] = useState('');
  const [qDiagramUrl, setQDiagramUrl] = useState('');

  // Auto-Push Pipeline State
  const [pushTargetExam, setPushTargetExam] = useState('');
  const [pushTargetSegment, setPushTargetSegment] = useState<'PRACTICE' | 'PYQ'>('PRACTICE');
  const [pushPyqYear, setPushPyqYear] = useState('2026');

  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const diagramFileInputRef = useRef<HTMLInputElement | null>(null);

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
      const [taxNodes, questions] = await Promise.all([getTaxonomyNodes(), getAllQuestions()]);
      setTaxonomyList(taxNodes || []);
      setQuestionsList(questions || []);

      const classes = (taxNodes || []).filter(t => t.level === 'CLASS');
      if (classes.length > 0 && !qClass) setQClass(classes[0].nameEn);
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

  const insertSymbol = (sym: string) => {
    setQStatementEn(prev => prev + sym);
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

  // Local Image Upload to Base64 (Zero Reliance on Wikipedia)
  const handleDiagramFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return alert("Image file size should be less than 2MB.");
    }

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
    setQCorrectOpt(0); setQExplanationEn(''); setQExplanationHi('');
    setQDiagramUrl(''); setQSegment('PRACTICE');
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
    setQPyqYear(q.pyqYear || '2024');
    setQStatementEn(q.questionEn || '');
    setQStatementHi(q.questionHi || '');
    setQOptionsEn([...(q.optionsEn || ['', '', '', ''])]);
    setQOptionsHi([...(q.optionsHi || ['', '', '', ''])]);
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

    if (qClass === 'OTHER' && qClassCustom.trim()) {
      const node: TaxonomyNode = { id: `tax-${Date.now()}-c`, level: 'CLASS', nameEn: finalClass };
      saveTaxonomyNode(node);
      setTaxonomyList(prev => [node, ...prev]);
    }
    if (qExam === 'OTHER' && qExamCustom.trim()) {
      const node: TaxonomyNode = { id: `tax-${Date.now()}-e`, level: 'EXAM', nameEn: finalExam };
      saveTaxonomyNode(node);
      setTaxonomyList(prev => [node, ...prev]);
    }
    if (qSubject === 'OTHER' && qSubjectCustom.trim()) {
      const node: TaxonomyNode = { id: `tax-${Date.now()}-s`, level: 'SUBJECT', nameEn: finalSubject };
      saveTaxonomyNode(node);
      setTaxonomyList(prev => [node, ...prev]);
    }

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
      questionEn: formatScientific(qStatementEn.trim()),
      questionHi: formatScientific(qStatementHi.trim() || qStatementEn.trim()),
      optionsEn: qOptionsEn.map(o => formatScientific(o)),
      optionsHi: qOptionsHi.map(o => formatScientific(o)),
      correctOption: qCorrectOpt,
      explanationEn: formatScientific(qExplanationEn.trim()),
      explanationHi: formatScientific(qExplanationHi.trim()),
      diagramUrl: qDiagramUrl.trim(),
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
    if (!confirm(`Move question "${text.slice(0, 40)}..." to Recycle Bin?`)) return;
    try {
      await archiveQuestion(id);
      setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, isArchived: true, status: 'ARCHIVED' } : q));
    } catch (err: any) {
      alert("Error archiving question: " + err.message);
    }
  };

  const handleRestoreFromRecycleBin = async (id: string) => {
    try {
      await restoreQuestion(id);
      setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, isArchived: false, status: 'ACTIVE' } : q));
      alert("Question restored back to Active Question Bank!");
    } catch (err: any) {
      alert("Error restoring question: " + err.message);
    }
  };

  const handlePermanentDelete = async (q: QuestionData) => {
    if (!confirm("🚨 PERMANENT DELETE: Are you absolutely sure? This will be permanently erased from Firestore!")) return;
    try {
      await permanentlyDeleteQuestion(q.id, q.altId);
      setQuestionsList(prev => prev.filter(item => item.id !== q.id));
      alert("Question permanently erased from database!");
    } catch (err: any) {
      alert("Error deleting from database: " + err.message);
    }
  };

  const handleWipeAllRecycleBin = async () => {
    if (!confirm("🚨 DANGER: Wipe ALL questions currently in the Recycle Bin permanently?")) return;
    try {
      const count = await wipeAllRecycleBin();
      setQuestionsList(prev => prev.filter(q => !q.isArchived));
      alert(`Permanently erased ${count} questions from database!`);
    } catch (err: any) {
      alert("Error wiping recycle bin: " + err.message);
    }
  };

  const downloadSampleCsv = () => {
    const headers = [
      "Segment", "Class", "Exam", "Subject", "Topic", "PYQYear",
      "QuestionEn", "QuestionHi",
      "Opt1_En", "Opt2_En", "Opt3_En", "Opt4_En",
      "Opt1_Hi", "Opt2_Hi", "Opt3_Hi", "Opt4_Hi",
      "CorrectOpt", "ExplanationEn", "ExplanationHi", "DiagramUrl"
    ].join(",");
    const sampleRow = [
      "PRACTICE",
      '"Civil Services / Competitive"',
      '"UPSC Civil Services (Prelims)"',
      '"General Studies / Science"',
      '"Chemical Bonding & Polycyclic Compounds"',
      "2024",
      '"Consider the molecular structure of Indigo (formula C16H10N2O2): Determine total sigma bonds, pi bonds, sp2 carbons, and lone pairs:"',
      '"नीचे प्रदर्शित इंडिगो (सूत्र C16H10N2O2) की संरचना में कुल सिग्मा बंध, पाई बंध, sp2 कार्बन, और लोन पेयर ज्ञात करें:"',
      '"33 sigma bonds, 9 pi bonds, 16 sp2 carbons, and 6 lone pairs"',
      '"31 sigma bonds, 8 pi bonds, 14 sp2 carbons, and 4 lone pairs"',
      '"35 sigma bonds, 9 pi bonds, 16 sp2 carbons, and 8 lone pairs"',
      '"33 sigma bonds, 7 pi bonds, 12 sp2 carbons, and 6 lone pairs"',
      '"33 sigma बंध, 9 pi बंध, 16 sp2 कार्बन, और 6 लोन पेयर"',
      '"31 sigma बंध, 8 pi बंध, 14 sp2 कार्बन, और 4 लोन पेयर"',
      '"35 sigma बंध, 9 pi बंध, 16 sp2 कार्बन, और 8 लोन पेयर"',
      '"33 sigma बंध, 7 pi बंध, 12 sp2 कार्बन, और 6 लोन पेयर"',
      "1",
      '"Sigma bonds = 33, Pi bonds = 9, sp2 carbons = 16, Lone pairs = 6."',
      '"सिग्मा बंध = 33, पाई बंध = 9, sp2 कार्बन = 16, कुल लोन पेयर = 6।"',
      '""'
    ].join(",");

    const blob = new Blob(['\uFEFF' + headers + '\n' + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Abhyaas_Bulk_Question_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySampleRowToClipboard = () => {
    const sample = "PRACTICE\tCivil Services / Competitive\tUPSC Civil Services (Prelims)\tGeneral Studies / Science\tChemical Bonding & Polycyclic Compounds\t2024\tConsider the molecular structure of Indigo (formula C16H10N2O2): Determine total sigma bonds, pi bonds, sp2 carbons, and lone pairs:\tइंडिगो (सूत्र C16H10N2O2) की संरचना में कुल सिग्मा बंध, पाई बंध, sp2 कार्बन और लोन पेयर ज्ञात करें:\t33 sigma, 9 pi, 16 sp2, 6 lone pairs\t31 sigma, 8 pi, 14 sp2, 4 lone pairs\t35 sigma, 9 pi, 16 sp2, 8 lone pairs\t33 sigma, 7 pi, 12 sp2, 6 lone pairs\t33 सिग्मा, 9 पाई, 16 sp2, 6 लोन पेयर\t31 सिग्मा, 8 पाई, 14 sp2, 4 लोन पेयर\t35 सिग्मा, 9 पाई, 16 sp2, 8 लोन पेयर\t33 सिग्मा, 7 पाई, 12 sp2, 6 लोन पेयर\t1\tSigma bonds = 33, Pi bonds = 9, sp2 carbons = 16, Lone pairs = 6.\tसिग्मा बंध = 33, पाई बंध = 9, sp2 कार्बन = 16, कुल लोन पेयर = 6।\t";
    navigator.clipboard.writeText(sample);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 3000);
  };

  const handleDirectExcelPaste = async () => {
    if (!pasteData.trim()) return alert("Please paste copied Excel cells.");
    const lines = pasteData.split(/\r?\n/).filter(l => l.trim().length > 0);
    const parsed: QuestionData[] = [];

    for (let i = 0; i < lines.length; i++) {
      const row = lines[i].split('\t');
      if (row.length >= 7) {
        const seg = (row[0] || '').toUpperCase();
        const validSegment: QuestionSegment = (seg === 'PYQ' || seg === 'OLYMPIAD') ? seg : 'PRACTICE';
        const newId = `q-paste-${Date.now()}-${i}`;
        parsed.push({
          id: newId,
          docId: newId,
          segment: validSegment,
          className: row[1] || 'Civil Services / Competitive',
          examName: row[2] || 'UPSC Civil Services (Prelims)',
          subjectName: row[3] || 'General Studies / Science',
          topicName: row[4] || 'Chemical Bonding & Polycyclic Compounds',
          category: row[2] || 'UPSC Civil Services (Prelims)',
          subject: row[3] || 'General Studies / Science',
          class: row[1] || 'Civil Services / Competitive',
          topic: row[4] || 'Chemical Bonding & Polycyclic Compounds',
          pyqYear: row[5] || '2024',
          questionEn: formatScientific(row[6] || ''),
          questionHi: formatScientific(row[7] || row[6] || ''),
          optionsEn: [formatScientific(row[8] || ''), formatScientific(row[9] || ''), formatScientific(row[10] || ''), formatScientific(row[11] || '')],
          optionsHi: [formatScientific(row[12] || row[8] || ''), formatScientific(row[13] || row[9] || ''), formatScientific(row[14] || row[10] || ''), formatScientific(row[15] || row[11] || '')],
          correctOption: (parseInt(row[16]) - 1) >= 0 ? parseInt(row[16]) - 1 : 0,
          explanationEn: formatScientific(row[17] || ''),
          explanationHi: formatScientific(row[18] || ''),
          diagramUrl: row[19] || '',
          isArchived: false,
          status: 'ACTIVE',
          timesUsedInOlympiad: 0
        });
      }
    }

    if (parsed.length === 0) return alert("Could not parse rows. Ensure columns match the template.");
    try {
      const count = await bulkUploadQuestions(parsed);
      setQuestionsList(prev => [...parsed, ...prev]);
      setPasteData('');
      setIsBulkModalOpen(false);
      alert(`🎉 Imported ${count} questions directly from Excel without encoding errors!`);
    } catch (err: any) {
      alert("Error importing from Excel: " + err.message);
    }
  };

  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = (evt.target?.result as string) || '';
      const rows = parseCSVProperly(text);
      if (rows.length <= 1) return alert("Empty CSV file.");

      const parsed: QuestionData[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 7) {
          const seg = (row[0] || '').toUpperCase();
          const validSegment: QuestionSegment = (seg === 'PYQ' || seg === 'OLYMPIAD') ? seg : 'PRACTICE';
          const newId = `q-csv-${Date.now()}-${i}`;

          parsed.push({
            id: newId,
            docId: newId,
            segment: validSegment,
            className: row[1] || 'Civil Services / Competitive',
            examName: row[2] || 'UPSC Civil Services (Prelims)',
            subjectName: row[3] || 'General Studies / Science',
            topicName: row[4] || 'Chemical Bonding & Polycyclic Compounds',
            category: row[2] || 'UPSC Civil Services (Prelims)',
            subject: row[3] || 'General Studies / Science',
            class: row[1] || 'Civil Services / Competitive',
            topic: row[4] || 'Chemical Bonding & Polycyclic Compounds',
            pyqYear: row[5] || '2024',
            questionEn: formatScientific(row[6] || ''),
            questionHi: formatScientific(row[7] || row[6] || ''),
            optionsEn: [formatScientific(row[8] || ''), formatScientific(row[9] || ''), formatScientific(row[10] || ''), formatScientific(row[11] || '')],
            optionsHi: [formatScientific(row[12] || row[8] || ''), formatScientific(row[13] || row[9] || ''), formatScientific(row[14] || row[10] || ''), formatScientific(row[15] || row[11] || '')],
            correctOption: (parseInt(row[16]) - 1) >= 0 ? parseInt(row[16]) - 1 : 0,
            explanationEn: formatScientific(row[17] || ''),
            explanationHi: formatScientific(row[18] || ''),
            diagramUrl: row[19] || '',
            isArchived: false,
            status: 'ACTIVE',
            timesUsedInOlympiad: 0
          });
        }
      }

      try {
        const uploadedCount = await bulkUploadQuestions(parsed);
        setQuestionsList(prev => [...parsed, ...prev]);
        setIsBulkModalOpen(false);
        alert(`🎉 Successfully uploaded ${uploadedCount} questions in bulk!`);
      } catch (err: any) {
        alert("Error saving CSV questions: " + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleExecuteAutoPush = async () => {
    if (!pushTargetExam) return alert("Select an Exam or Subject.");
    if (!confirm(`Push all Olympiad questions in "${pushTargetExam}" to ${pushTargetSegment}?`)) return;
    try {
      const count = await autoPushOlympiadQuestions(pushTargetExam, pushTargetSegment, pushPyqYear);
      alert(`Transferred ${count} questions to ${pushTargetSegment}!`);
      loadAllData();
      setIsAutoPushModalOpen(false);
    } catch (err: any) {
      alert("Error in auto-push pipeline: " + err.message);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-mono">
        Initializing Abhyaas Command Center...
      </div>
    );
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

  const activeQuestions = questionsList.filter(q => !q.isArchived);
  const archivedQuestions = questionsList.filter(q => q.isArchived);

  const filteredActiveQuestions = activeQuestions.filter(q => {
    const matchesSearch = cleanStr(q.questionEn).includes(cleanStr(searchFilter)) || cleanStr(q.questionHi).includes(cleanStr(searchFilter)) || cleanStr(q.subjectName || q.subject).includes(cleanStr(searchFilter));
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
                ABHYAAS O.S. <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] rounded font-mono uppercase">Unified Controller</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/practice" target="_blank" className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
              <Eye className="w-4 h-4 text-emerald-400"/> Live Practice Page
            </Link>
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 bg-slate-800 p-2 rounded-xl">
              <LogOut className="w-4 h-4"/>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">

        {/* Master Navigation */}
        <div className="bg-white p-2 border border-slate-200 rounded-3xl shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setAdminTab('questions')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
              adminTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 1. Question Bank & Vault ({activeQuestions.length})
          </button>

          <button
            onClick={() => setAdminTab('hierarchy')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
              adminTab === 'hierarchy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderTree className="w-4 h-4" /> 2. Category & Hierarchy Tree ({taxonomyList.length})
          </button>

          <button
            onClick={() => setAdminTab('recycle_bin')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
              adminTab === 'recycle_bin' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-4 h-4" /> 3. Recycle Bin ({archivedQuestions.length})
          </button>
        </div>

        {/* TAB 1: QUESTION BANK & VAULT */}
        {adminTab === 'questions' && (
          <div className="space-y-6 animate-in fade-in">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Active Question Vault
                  </h2>
                  <p className="text-xs text-slate-500">Preserved questions with automatic chemical subscripts, formulas, and diagrams.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={openCreateQuestionModal}
                    className="px-4 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" /> Single Question Studio
                  </button>
                  <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="px-4 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Bulk Upload / Excel Paste
                  </button>
                  <button
                    onClick={() => setIsAutoPushModalOpen(true)}
                    className="px-4 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
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
                        onClick={() => setSegmentFilter(seg)}
                        className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition ${
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
                    onChange={e => setFilterClass(e.target.value)}
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="ALL">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.nameEn}>{c.nameEn}</option>)}
                  </select>

                  <select
                    value={filterExam}
                    onChange={e => setFilterExam(e.target.value)}
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="ALL">All Examinations</option>
                    {taxonomyList.filter(t => t.level === 'EXAM').map(e => (
                      <option key={e.id} value={e.nameEn}>{e.nameEn}</option>
                    ))}
                  </select>

                  <select
                    value={filterSubject}
                    onChange={e => setFilterSubject(e.target.value)}
                    className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="ALL">All Subjects</option>
                    {taxonomyList.filter(t => t.level === 'SUBJECT').map(s => (
                      <option key={s.id} value={s.nameEn}>{s.nameEn}</option>
                    ))}
                  </select>

                  <div className="relative flex-grow min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search questions or terms..."
                      value={searchFilter}
                      onChange={e => setSearchFilter(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Stream */}
            <div className="space-y-3">
              {filteredActiveQuestions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-extrabold text-sm text-slate-800">No Questions Found Matching Filter</p>
                  <p className="text-xs text-slate-400">Add questions using Single Question Studio or Bulk Excel Paste.</p>
                </div>
              ) : (
                filteredActiveQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="bg-white border border-slate-200 hover:border-blue-300 p-5 rounded-2xl shadow-sm transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex flex-wrap items-center gap-2">
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
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveToRecycleBin(q.id, q.questionEn)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Move to Recycle Bin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Scientific Statements */}
                    <div>
                      <p className="font-bold text-sm text-slate-900 leading-relaxed">
                        {formatScientific(q.questionEn)}
                      </p>
                      {q.questionHi && (
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {formatScientific(q.questionHi)}
                        </p>
                      )}
                    </div>

                    {/* Robust Diagram Rendering (With Min Width to prevent collapse) */}
                    {q.diagramUrl && (
                      <div className="p-3 bg-white border border-slate-200 rounded-2xl w-fit max-w-full shadow-xs">
                        <img 
                          src={q.diagramUrl} 
                          alt="Diagram / Molecular Structure" 
                          referrerPolicy="no-referrer"
                          className="max-h-72 w-auto min-w-[280px] max-w-full object-contain rounded-xl" 
                        />
                      </div>
                    )}

                    {/* Options with Subscripts */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      {q.optionsEn?.map((opt, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            q.correctOption === i
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                            q.correctOption === i ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                          }`}>
                            {i + 1}
                          </span>
                          <span className="truncate">{formatScientific(opt)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    {(q.explanationEn || q.explanationHi) && (
                      <div className="p-3 bg-blue-50/70 rounded-xl text-[11px] text-blue-900 border border-blue-100 leading-relaxed">
                        <strong className="font-black">💡 Solution:</strong> {formatScientific(q.explanationEn || q.explanationHi || '')}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 2: CATEGORY & HIERARCHY TREE */}
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
                  className={`py-3.5 px-4 rounded-2xl text-xs font-black transition flex flex-col items-center gap-1 ${
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

                <button type="submit" className="px-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2">
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
                      <button onClick={() => handleDeleteTaxonomy(item.id, item.nameEn)} className="text-rose-400 hover:text-rose-600 p-2 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECYCLE BIN */}
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
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
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
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore to Bank
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(q)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800 line-through opacity-80">{formatScientific(q.questionEn)}</p>
                    {q.questionHi && <p className="text-xs text-slate-500">{formatScientific(q.questionHi)}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: SINGLE QUESTION STUDIO (WITH DIRECT DEVICE FILE UPLOAD) */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingQuestionId ? 'Edit Question Entry' : 'Smart Question Studio'}
                </h3>
                <p className="text-xs text-slate-500">Configure hierarchy cascade, bilingual statements, formulas, and diagrams.</p>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
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

              {/* Vault Destination */}
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
                      className={`p-3 rounded-xl border text-left transition ${
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
                      placeholder="e.g. 2024"
                      className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold w-32 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 4-Tier Cascading Hierarchy */}
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
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs outline-none" required
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
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs outline-none" required
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
                      className="w-full h-10 px-3 mt-1.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Scientific Toolbar */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-black text-blue-900 flex items-center gap-1">
                  <Atom className="w-3.5 h-3.5 text-blue-600" />
                  Scientific Toolbar (Click to insert):
                </span>
                
                <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
                  <span className="text-[10px] font-black uppercase text-blue-700 mr-1">Chem:</span>
                  {['H₂O', 'CO₂', 'LiFePO₄', 'SO₄²⁻', 'NO₃⁻', 'O₂', 'N₂', 'Fe²⁺', 'σ', 'π', '→', '⇌', 'Δ', '°C'].map(sym => (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => insertSymbol(sym)}
                      className="px-2 py-0.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-300 rounded font-bold transition shadow-xs"
                    >
                      {sym}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1 text-xs font-mono pt-1 border-t border-blue-200/50">
                  <span className="text-[10px] font-black uppercase text-blue-700 mr-1">Math:</span>
                  {['x²', 'x³', 'x₁', 'x₂', 'sp²', 'sp³', '√', 'π', 'Ω', 'θ', 'λ', 'α', 'β', '∑', '∫', '±', '≠', '≤', '≥', '∞'].map(sym => (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => insertSymbol(sym)}
                      className="px-2 py-0.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-300 rounded font-bold transition shadow-xs"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statements */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Question Statement (English)*
                  </label>
                  <textarea
                    rows={2}
                    value={qStatementEn}
                    onChange={e => { setQStatementEn(e.target.value); checkDuplicates(e.target.value); }}
                    placeholder="Enter English question statement..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    प्रश्न विवरण (हिंदी में)
                  </label>
                  <textarea
                    rows={2}
                    value={qStatementHi}
                    onChange={e => setQStatementHi(e.target.value)}
                    placeholder="हिंदी अनुवाद दर्ज करें..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Dual-Mode Diagram Input: Direct Device Upload + Web URL */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Diagram / Map Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={diagramFileInputRef}
                    onChange={handleDiagramFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => diagramFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg flex items-center gap-1.5 transition shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Upload from Computer / Device
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Or paste direct image URL / Base64 here..."
                  value={qDiagramUrl}
                  onChange={e => setQDiagramUrl(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
                />

                {qDiagramUrl && (
                  <div className="mt-2 p-3 bg-white rounded-xl w-fit border shadow-xs">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Live Diagram Preview:</p>
                    <img 
                      src={qDiagramUrl} 
                      alt="Preview" 
                      referrerPolicy="no-referrer"
                      className="max-h-48 w-auto min-w-[280px] max-w-full rounded-lg object-contain bg-white" 
                    />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-black uppercase text-slate-500">
                  Options & Correct Key*
                </label>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctKey"
                      checked={qCorrectOpt === i}
                      onChange={() => setQCorrectOpt(i)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <span className="text-xs font-black w-6 text-slate-600">Opt {i + 1}</span>
                    <input
                      type="text"
                      placeholder={`Option ${i + 1} English`}
                      value={qOptionsEn[i]}
                      onChange={e => { const o = [...qOptionsEn]; o[i] = e.target.value; setQOptionsEn(o); }}
                      className="flex-1 h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder={`विकल्प ${i + 1} हिंदी`}
                      value={qOptionsHi[i]}
                      onChange={e => { const o = [...qOptionsHi]; o[i] = e.target.value; setQOptionsHi(o); }}
                      className="flex-1 h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Explanations */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Explanation (English)</label>
                  <textarea
                    rows={2}
                    value={qExplanationEn}
                    onChange={e => setQExplanationEn(e.target.value)}
                    placeholder="Solution..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">उत्तर का स्पष्टीकरण (Hindi)</label>
                  <textarea
                    rows={2}
                    value={qExplanationHi}
                    onChange={e => setQExplanationHi(e.target.value)}
                    placeholder="विस्तृत व्याख्या..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingQuestionId ? 'Update Question' : 'Save Question to Vault'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK UPLOAD */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Bulk Question Importer
                </h3>
                <p className="text-xs text-slate-500">Upload questions via Excel paste or CSV file.</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-xs font-black text-blue-950">Official Template File & Sample Data</p>
                <p className="text-[11px] text-blue-700">Pre-formatted with all 20 required columns.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template (.CSV)
                </button>
                <button
                  type="button"
                  onClick={copySampleRowToClipboard}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  {copiedSample ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSample ? 'Copied!' : 'Copy Sample Row'}
                </button>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setBulkMode('paste')}
                className={`flex-1 py-2.5 rounded-lg transition ${bulkMode === 'paste' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                1. Direct Paste from Excel (Recommended)
              </button>
              <button
                onClick={() => setBulkMode('csv')}
                className={`flex-1 py-2.5 rounded-lg transition ${bulkMode === 'csv' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                2. Upload UTF-8 CSV File
              </button>
            </div>

            {bulkMode === 'paste' ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  Click <strong>Copy Sample Row</strong> above or select rows in Excel, press <strong>Ctrl+C</strong>, and paste below with <strong>Ctrl+V</strong>:
                </p>
                <textarea
                  rows={6}
                  value={pasteData}
                  onChange={e => setPasteData(e.target.value)}
                  placeholder="Paste copied cells from Excel here (tab-delimited)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleDirectExcelPaste}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <ClipboardCheck className="w-4 h-4" /> Import Pasted Rows
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-600 leading-relaxed">Upload CSV files.</p>
                <div
                  onClick={() => csvInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50 cursor-pointer transition"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-800">Click to Select UTF-8 CSV</p>
                  <input type="file" accept=".csv" ref={csvInputRef} onChange={handleCsvFile} className="hidden" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: AUTO-PUSH PIPELINE */}
      {isAutoPushModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                Auto-Push Olympiad ➔ PYQ/Practice
              </h3>
              <button onClick={() => setIsAutoPushModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Transfer quarantined Olympiad questions into the Free Practice Bank or official PYQ Archive after a contest.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Examination or Subject:</label>
                <div className="relative">
                  <select
                    value={pushTargetExam}
                    onChange={e => setPushTargetExam(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                  >
                    <option value="">-- Choose Exam or Subject --</option>
                    {taxonomyList.filter(t => t.level === 'EXAM' || t.level === 'SUBJECT').map(item => (
                      <option key={item.id} value={item.nameEn}>{item.nameEn} ({item.level})</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Destination:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPushTargetSegment('PRACTICE')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      pushTargetSegment === 'PRACTICE' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Free Practice Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPushTargetSegment('PYQ')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      pushTargetSegment === 'PYQ' ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    PYQ Archive
                  </button>
                </div>
              </div>

              {pushTargetSegment === 'PYQ' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assign PYQ Year:</label>
                  <input
                    type="text"
                    value={pushPyqYear}
                    onChange={e => setPushPyqYear(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    placeholder="e.g. 2026"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleExecuteAutoPush}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Execute Transfer Now
            </button>

          </div>
        </div>
      )}

    </div>
  );
}