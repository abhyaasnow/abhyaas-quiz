'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Eye, LogOut, KeyRound,
  ArrowRight, Layers, ChevronDown, Check, X,
  FolderTree, BookOpen, Sparkles, AlertCircle
} from 'lucide-react';

import { 
  getTaxonomyNodes, saveTaxonomyNode, deleteTaxonomyNode, 
  TaxonomyNode, TaxonomyLevel 
} from '@/lib/db';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';

// Standard Presets for Quick Selection
const PRESETS: Record<TaxonomyLevel, { en: string; hi: string }[]> = {
  CLASS: [
    { en: 'Class 6th (Middle School)', hi: 'कक्षा 6' },
    { en: 'Class 9th (Secondary Entrance)', hi: 'कक्षा 9' },
    { en: 'Class 1st - 5th (Primary)', hi: 'प्राथमिक स्तर (कक्षा 1-5)' },
    { en: 'Class 10th (Board / Foundation)', hi: 'कक्षा 10 बोर्ड' },
    { en: 'Class 11th - 12th (Senior Secondary)', hi: 'कक्षा 11-12' },
    { en: 'Civil Services / Competitive', hi: 'प्रतियोगी परीक्षा / सिविल सेवा' }
  ],
  EXAM: [
    { en: 'JNVST (Navodaya Entrance Exam)', hi: 'जवाहर नवोदय विद्यालय प्रवेश परीक्षा' },
    { en: 'AISSEE (All India Sainik School Exam)', hi: 'अखिल भारतीय सैनिक स्कूल परीक्षा' },
    { en: 'All India Mega Olympiad 2026', hi: 'अखिल भारतीय छात्रवृत्ति ओलंपियाड 2026' },
    { en: 'National Science Olympiad (NSO)', hi: 'राष्ट्रीय विज्ञान ओलंपियाड' },
    { en: 'UPSC Civil Services (Prelims)', hi: 'संघ लोक सेवा आयोग सिविल सेवा' }
  ],
  SUBJECT: [
    { en: 'Mathematics', hi: 'गणित' },
    { en: 'Science (EVS & Physics/Chem/Bio)', hi: 'विज्ञान एवं पर्यावरण' },
    { en: 'Mental Ability & Reasoning', hi: 'मानसिक योग्यता एवं तर्कशक्ति' },
    { en: 'Language Test (Hindi)', hi: 'भाषा परीक्षा (हिंदी)' },
    { en: 'Language Test (English)', hi: 'भाषा परीक्षा (अंग्रेजी)' },
    { en: 'General Studies / Indian Polity', hi: 'सामान्य अध्ययन / भारतीय राजव्यवस्था' }
  ],
  TOPIC: [
    { en: 'Number System & Place Value', hi: 'संख्या पद्धति एवं स्थानीय मान' },
    { en: 'Fractions & Decimals', hi: 'भिन्न एवं दशमलव' },
    { en: 'LCM and HCF', hi: 'लघुत्तम समापवर्त्य एवं महत्तम समापवर्तक' },
    { en: 'Pattern Completion & Analogy', hi: 'चित्र मिलान एवं सादृश्यता' },
    { en: 'Preamble & Fundamental Rights', hi: 'प्रस्तावना एवं मौलिक अधिकार' }
  ],
  DOMAIN: []
};

export default function CategoryAndHierarchyManager() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 4 Core Entity Types
  const [activeLevel, setActiveLevel] = useState<TaxonomyLevel>('CLASS');
  const [taxonomyList, setTaxonomyList] = useState<TaxonomyNode[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [presetChoice, setPresetChoice] = useState<string>(''); // Predefined vs 'OTHER'
  const [manualNameEn, setManualNameEn] = useState('');
  const [manualNameHi, setManualNameHi] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

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
    loadHierarchy();
  }, [currentUser]);

  const loadHierarchy = async () => {
    setLoading(true);
    try {
      const nodes = await getTaxonomyNodes();
      setTaxonomyList(nodes || []);
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

  // Preset Selection Logic (Auto fill or switch to Manual)
  const handlePresetChange = (val: string) => {
    setPresetChoice(val);
    if (val === 'OTHER') {
      setManualNameEn('');
      setManualNameHi('');
    } else if (val) {
      const found = PRESETS[activeLevel]?.find(p => p.en === val);
      if (found) {
        setManualNameEn(found.en);
        setManualNameHi(found.hi);
      }
    }
  };

  // Add Node to Database
  const handleSaveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEn = manualNameEn.trim();
    const finalHi = manualNameHi.trim() || finalEn;

    if (!finalEn) {
      return alert("Please enter or select an Entity Name.");
    }

    const newNode: TaxonomyNode = {
      id: `node-${Date.now()}`,
      level: activeLevel,
      nameEn: finalEn,
      nameHi: finalHi,
      parentId: selectedParentId || undefined
    };

    setTaxonomyList(prev => [newNode, ...prev]);
    setManualNameEn('');
    setManualNameHi('');
    setPresetChoice('');
    
    await saveTaxonomyNode(newNode);
    alert(`Successfully added "${finalEn}" to ${activeLevel}!`);
  };

  // Delete Node from Database
  const handleDeleteNode = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from ${activeLevel}?`)) return;
    setTaxonomyList(prev => prev.filter(item => item.id !== id));
    await deleteTaxonomyNode(id);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-mono">
        Loading Abhyaas Manager...
      </div>
    );
  }

  // Auth Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b1121] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">Abhyaas Admin Gateway</h2>
            <p className="text-xs text-slate-400">Category & Hierarchy Console</p>
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

  // Filtered nodes by Level
  const classes = taxonomyList.filter(t => t.level === 'CLASS' || t.level === 'DOMAIN');
  const exams = taxonomyList.filter(t => t.level === 'EXAM');
  const subjects = taxonomyList.filter(t => t.level === 'SUBJECT');
  const topics = taxonomyList.filter(t => t.level === 'TOPIC');

  const currentLevelNodes = activeLevel === 'CLASS' ? classes
    : activeLevel === 'EXAM' ? exams
    : activeLevel === 'SUBJECT' ? subjects
    : topics;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-base">A</div>
            <div>
              <h1 className="font-black text-base tracking-wide flex items-center gap-2">
                ABHYAAS <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] rounded font-mono uppercase">Category Studio</span>
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
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-8">

        {/* Level Selector Tabs */}
        <div className="bg-white p-2 border border-slate-200 rounded-3xl shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'CLASS', title: '1. Classes', count: classes.length },
            { id: 'EXAM', title: '2. Examinations', count: exams.length },
            { id: 'SUBJECT', title: '3. Subjects', count: subjects.length },
            { id: 'TOPIC', title: '4. Topics', count: topics.length },
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => { 
                setActiveLevel(lvl.id as TaxonomyLevel); 
                setPresetChoice(''); 
                setManualNameEn(''); 
                setManualNameHi(''); 
                setSelectedParentId(''); 
              }}
              className={`py-3.5 px-4 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1 ${
                activeLevel === lvl.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{lvl.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeLevel === lvl.id ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {lvl.count} active
              </span>
            </button>
          ))}
        </div>

        {/* Add Entity Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Add New {activeLevel === 'CLASS' ? 'Class / Stream' : activeLevel === 'EXAM' ? 'Examination' : activeLevel === 'SUBJECT' ? 'Subject' : 'Topic'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pick from standard presets or choose <strong>+ Other (Type Manually)</strong> to type your custom name.
            </p>
          </div>

          <form onSubmit={handleSaveNode} className="space-y-5">
            
            {/* 1. Preset Dropdown with 'Other' Option */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Option or Choose "Other"
              </label>
              <div className="relative">
                <select
                  value={presetChoice}
                  onChange={e => handlePresetChange(e.target.value)}
                  className="w-full h-12 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 appearance-none outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Choose from standard presets --</option>
                  {PRESETS[activeLevel]?.map((p, i) => (
                    <option key={i} value={p.en}>
                      {p.en} ({p.hi})
                    </option>
                  ))}
                  <option value="OTHER" className="font-black text-blue-600">
                    ✍️ + Other (Type Manually)
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Manual Input Fields (Active when 'OTHER' or selected) */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Name in English*
                </label>
                <input
                  type="text"
                  placeholder={
                    activeLevel === 'CLASS' ? "e.g. Class 7th / Foundation" :
                    activeLevel === 'EXAM' ? "e.g. JNVST Class 6 Entrance" :
                    activeLevel === 'SUBJECT' ? "e.g. Mathematics" : "e.g. Number System"
                  }
                  value={manualNameEn}
                  onChange={e => { setManualNameEn(e.target.value); setPresetChoice('OTHER'); }}
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  नाम हिंदी में (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. कक्षा 7 / संख्या पद्धति"
                  value={manualNameHi}
                  onChange={e => setManualNameHi(e.target.value)}
                  className="w-full h-12 px-4 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* 3. Parent Link Selector (Not needed for Classes) */}
            {activeLevel !== 'CLASS' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Parent Link: {activeLevel === 'EXAM' ? 'Belongs to which Class?' : activeLevel === 'SUBJECT' ? 'Belongs to which Exam?' : 'Belongs to which Subject?'}
                </label>
                <div className="relative">
                  <select
                    value={selectedParentId}
                    onChange={e => setSelectedParentId(e.target.value)}
                    className="w-full h-12 px-4 pr-10 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-2xl text-xs appearance-none outline-none cursor-pointer"
                  >
                    <option value="">-- None (Stand-alone Root) --</option>
                    {activeLevel === 'EXAM' && classes.map(c => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
                    {activeLevel === 'SUBJECT' && exams.map(e => <option key={e.id} value={e.id}>{e.nameEn}</option>)}
                    {activeLevel === 'TOPIC' && subjects.map(s => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-blue-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Save {activeLevel} to Live System
            </button>
          </form>
        </div>

        {/* Active List of Current Level with Delete */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Active {activeLevel} List ({currentLevelNodes.length})
            </h3>
          </div>

          {currentLevelNodes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 text-xs font-bold">
              No entities added under {activeLevel} yet. Use the form above to add your first entry.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentLevelNodes.map(item => {
                const parent = taxonomyList.find(t => t.id === item.parentId);
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-2xl flex items-center justify-between shadow-sm transition"
                  >
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-sm text-slate-900">{item.nameEn}</p>
                      {item.nameHi && <p className="text-xs text-slate-500">{item.nameHi}</p>}
                      {parent && (
                        <span className="inline-block mt-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          ↳ {parent.nameEn}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteNode(item.id, item.nameEn)}
                      className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}