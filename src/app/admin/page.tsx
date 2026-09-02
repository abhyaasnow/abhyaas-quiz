'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers, Plus, Trash2, Tag, BookOpen, Eye, LogOut, KeyRound,
  CheckCircle2, FolderTree, ArrowRight, Activity, ChevronRight,
  Sparkles, Loader2
} from 'lucide-react';

import { 
  getTaxonomyNodes, saveTaxonomyNode, deleteTaxonomyNode, 
  getAllQuestions, TaxonomyNode, TaxonomyLevel, QuestionData 
} from '@/lib/db';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';

export default function EnterpriseAdminPanel() {
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [activeTab, setActiveTab] = useState<'taxonomy' | 'questions' | 'olympiad'>('taxonomy');
  const [loading, setLoading] = useState(false);

  // Taxonomy State
  const [taxonomyList, setTaxonomyList] = useState<TaxonomyNode[]>([]);
  const [activeLevel, setActiveLevel] = useState<TaxonomyLevel>('DOMAIN');
  const [nameEn, setNameEn] = useState('');
  const [nameHi, setNameHi] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  // Questions State
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);

  useEffect(() => {
    const session = localStorage.getItem('abhyaas_admin_auth');
    if (session) setCurrentUser(JSON.parse(session));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tax, qs] = await Promise.all([getTaxonomyNodes(), getAllQuestions()]);
      setTaxonomyList(tax);
      setQuestionsList(qs);
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

  // Create Taxonomy Node
  const handleAddTaxonomy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) return alert("Name is required!");

    const newNode: TaxonomyNode = {
      id: `tax-${Date.now()}`,
      level: activeLevel,
      nameEn: nameEn.trim(),
      nameHi: nameHi.trim() || nameEn.trim(),
      parentId: selectedParentId || undefined
    };

    setTaxonomyList(prev => [newNode, ...prev]);
    setNameEn('');
    setNameHi('');
    
    await saveTaxonomyNode(newNode);
    alert(`Added: ${newNode.nameEn} to ${activeLevel}`);
  };

  const handleDeleteTaxonomy = async (id: string) => {
    if (!confirm("Are you sure you want to delete this taxonomy entity?")) return;
    setTaxonomyList(prev => prev.filter(t => t.id !== id));
    await deleteTaxonomyNode(id);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b1121] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">Abhyaas Master Tower</h2>
            <p className="text-xs text-slate-400">Enterprise Operations Gateway</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm" placeholder="admin@domain.com" required />
            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm" placeholder="••••••••" required />
            <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition">Enter Command Center</button>
          </form>
        </div>
      </div>
    );
  }

  // Filter levels for parent select
  const domains = taxonomyList.filter(t => t.level === 'DOMAIN');
  const exams = taxonomyList.filter(t => t.level === 'EXAM');
  const subjects = taxonomyList.filter(t => t.level === 'SUBJECT');
  const topics = taxonomyList.filter(t => t.level === 'TOPIC');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-base">A</div>
            <h1 className="font-black text-sm sm:text-base tracking-wide flex items-center gap-2">
              ABHYAAS O.S. <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] rounded uppercase">Sprint 1 Live</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/practice" target="_blank" className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg">
              <Eye className="w-4 h-4 text-emerald-400"/> Live Practice Page
            </Link>
            <button onClick={handleLogout} className="text-rose-400 bg-slate-800 p-2 rounded-lg"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-2 sticky top-24 shrink-0">
          <div className="px-3 py-1 text-[11px] font-black uppercase text-slate-400">Core Architecture</div>
          
          <button onClick={() => setActiveTab('taxonomy')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'taxonomy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <FolderTree className="w-5 h-5"/> Master Taxonomy
          </button>
          
          <button onClick={() => setActiveTab('questions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'questions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <BookOpen className="w-5 h-5"/> Question Vault ({questionsList.length})
          </button>

          <div className="pt-4 border-t border-slate-100 px-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Live Hierarchy Count</div>
            <div className="mt-2 space-y-1 text-xs font-bold text-slate-600">
              <div className="flex justify-between"><span>Domains/Classes:</span> <span className="text-blue-600">{domains.length}</span></div>
              <div className="flex justify-between"><span>Exams:</span> <span className="text-blue-600">{exams.length}</span></div>
              <div className="flex justify-between"><span>Subjects:</span> <span className="text-blue-600">{subjects.length}</span></div>
              <div className="flex justify-between"><span>Topics/Chapters:</span> <span className="text-blue-600">{topics.length}</span></div>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-grow w-full space-y-6">

          {activeTab === 'taxonomy' && (
            <div className="space-y-6">
              
              {/* Creator Box */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <FolderTree className="w-6 h-6 text-blue-600" /> Taxonomy & Hierarchy Studio
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Add or remove exam levels in real-time. Reflects instantly on frontend.</p>
                  </div>

                  {/* Level Selector Tabs */}
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs font-black">
                    {(['DOMAIN', 'EXAM', 'SUBJECT', 'TOPIC'] as TaxonomyLevel[]).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => { setActiveLevel(lvl); setSelectedParentId(''); }}
                        className={`px-3.5 py-2 rounded-xl transition ${activeLevel === lvl ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        {lvl === 'DOMAIN' ? '1. Domain / Class' : lvl === 'EXAM' ? '2. Exam' : lvl === 'SUBJECT' ? '3. Subject' : '4. Topic'}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddTaxonomy} className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Name (English)*</label>
                      <input 
                        type="text" 
                        placeholder={activeLevel === 'DOMAIN' ? "e.g. School Entrance (Class 6-8)" : activeLevel === 'EXAM' ? "e.g. JNV NVS Class VI" : activeLevel === 'SUBJECT' ? "e.g. Mathematics" : "e.g. Number System"} 
                        value={nameEn} 
                        onChange={e => setNameEn(e.target.value)} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-500" 
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">नाम (Hindi)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. नवोदय विद्यालय कक्षा 6" 
                        value={nameHi} 
                        onChange={e => setNameHi(e.target.value)} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-500" 
                      />
                    </div>

                    {/* Parent Selector */}
                    {activeLevel !== 'DOMAIN' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Parent {activeLevel === 'EXAM' ? 'Domain' : activeLevel === 'SUBJECT' ? 'Exam' : 'Subject'}
                        </label>
                        <select 
                          value={selectedParentId} 
                          onChange={e => setSelectedParentId(e.target.value)} 
                          className="w-full p-3 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl text-sm"
                        >
                          <option value="">-- None (Stand-alone) --</option>
                          {activeLevel === 'EXAM' && domains.map(d => <option key={d.id} value={d.id}>{d.nameEn}</option>)}
                          {activeLevel === 'SUBJECT' && exams.map(e => <option key={e.id} value={e.id}>{e.nameEn}</option>)}
                          {activeLevel === 'TOPIC' && subjects.map(s => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md flex items-center gap-2">
                    <Plus className="w-4 h-4"/> Save to Live Architecture
                  </button>
                </form>
              </div>

              {/* Real-time Cards of Current Level */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Active {activeLevel} Nodes ({taxonomyList.filter(t => t.level === activeLevel).length})
                </h3>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {taxonomyList.filter(t => t.level === activeLevel).map(node => {
                    const parent = taxonomyList.find(t => t.id === node.parentId);
                    return (
                      <div key={node.id} className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-2xl flex items-center justify-between shadow-sm transition">
                        <div>
                          <p className="font-extrabold text-sm text-slate-900">{node.nameEn}</p>
                          <p className="text-xs text-slate-500 font-medium">{node.nameHi}</p>
                          {parent && (
                            <span className="inline-block mt-2 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              ↳ {parent.nameEn}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleDeleteTaxonomy(node.id)}
                          className="text-rose-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'questions' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
              <h3 className="text-lg font-black text-slate-800">Question Vault Ready</h3>
              <p className="text-sm text-slate-500 mt-1">Sprint 1 me Taxonomy verify hone ke turant baad Sprint 2 me Question Anti-Duplicate Studio live hoga.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}