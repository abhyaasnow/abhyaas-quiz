'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Trophy, Award, ShieldCheck, 
  Search, MapPin, Zap, Flame, CheckCircle2, ChevronRight 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';

interface Scholar {
  rank: number;
  name: string;
  avatar: string;
  state: string;
  score: string;
  accuracy: number;
  timeTaken: string;
  xpEarned: string;
  grantAmount?: string;
  isVerified: boolean;
}

const leaderboardData: Scholar[] = [
  {
    rank: 1,
    name: 'Priya Sharma',
    avatar: 'PS',
    state: 'Uttar Pradesh',
    score: '98/100',
    accuracy: 98,
    timeTaken: '32m 14s',
    xpEarned: '+500 XP',
    grantAmount: '₹5,000 Grant (Paid)',
    isVerified: true,
  },
  {
    rank: 2,
    name: 'Rahul Verma',
    avatar: 'RV',
    state: 'Delhi-NCR',
    score: '94/100',
    accuracy: 94,
    timeTaken: '35m 08s',
    xpEarned: '+400 XP',
    grantAmount: '₹3,000 Grant (Paid)',
    isVerified: true,
  },
  {
    rank: 3,
    name: 'Ananya Roy',
    avatar: 'AR',
    state: 'West Bengal',
    score: '92/100',
    accuracy: 92,
    timeTaken: '38m 45s',
    xpEarned: '+350 XP',
    grantAmount: '₹1,500 Grant (Paid)',
    isVerified: true,
  },
  {
    rank: 4,
    name: 'Vikramaditya Singh',
    avatar: 'VS',
    state: 'Rajasthan',
    score: '90/100',
    accuracy: 90,
    timeTaken: '40m 12s',
    xpEarned: '+250 XP',
    grantAmount: '₹1,000 Grant (Paid)',
    isVerified: true,
  },
  {
    rank: 5,
    name: 'Md. Danish Alam',
    avatar: 'DA',
    state: 'Bihar',
    score: '88/100',
    accuracy: 88,
    timeTaken: '41m 30s',
    xpEarned: '+250 XP',
    grantAmount: '₹1,000 Grant (Paid)',
    isVerified: true,
  },
  {
    rank: 6,
    name: 'Sneha Kulkarni',
    avatar: 'SK',
    state: 'Maharashtra',
    score: '86/100',
    accuracy: 86,
    timeTaken: '42m 00s',
    xpEarned: '+150 XP',
    isVerified: true,
  },
  {
    rank: 7,
    name: 'Aditya Srivastava',
    avatar: 'AS',
    state: 'Madhya Pradesh',
    score: '84/100',
    accuracy: 84,
    timeTaken: '43m 15s',
    xpEarned: '+150 XP',
    isVerified: true,
  },
];

export default function LeaderboardPage() {
  const [selectedExam, setSelectedExam] = useState<'polity' | 'history' | 'daily'>('polity');
  const [selectedState, setSelectedState] = useState<string>('All India');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const statesList = ['All India', 'Uttar Pradesh', 'Delhi-NCR', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'Maharashtra', 'West Bengal'];

  const filteredScholars = leaderboardData.filter((scholar) => {
    const matchesState = selectedState === 'All India' || scholar.state === selectedState;
    const matchesSearch = scholar.name.toLowerCase().includes(searchQuery.toLowerCase()) || scholar.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* 1. Header Navbar */}
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <Link 
              href="/" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home Feed</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              अखिल भारतीय मेधा सूची <span className="text-blue-700">| National Merit Leaderboard</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Verified top rankers, scholarship recipients & academic benchmark analysis.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-2xl w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-bold text-emerald-950">100% Verified Disbursement Proofs</span>
          </div>
        </div>

        {/* 2. Exam Category Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'polity', label: '🏆 National Polity Olympiad (₹50,000 Pool)' },
            { id: 'history', label: '⚔️ Modern History Grand Drill' },
            { id: 'daily', label: '⚡ Daily Speed Streak Scholars' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedExam(tab.id as any)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                selectedExam === tab.id
                  ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 3. Top 3 Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
          {/* Rank 2 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col items-center text-center order-2 md:order-1 relative">
            <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center mb-2 border border-slate-300">
              2
            </span>
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center mb-2">
              {leaderboardData[1].avatar}
            </div>
            <h3 className="font-bold text-base text-slate-900">{leaderboardData[1].name}</h3>
            <span className="text-xs text-slate-500 font-medium">{leaderboardData[1].state}</span>
            <span className="mt-2 text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              Score: {leaderboardData[1].score} ({leaderboardData[1].accuracy}%)
            </span>
            <span className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              {leaderboardData[1].grantAmount}
            </span>
          </div>

          {/* Rank 1 (Gold Highlight) */}
          <div className="bg-gradient-to-b from-amber-500/10 via-white to-white rounded-3xl p-6 border-2 border-amber-400 shadow-md flex flex-col items-center text-center order-1 md:order-2 relative -mt-2">
            <span className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center mb-2 shadow-xs ring-4 ring-amber-200">
              🥇
            </span>
            <div className="w-16 h-16 rounded-2xl bg-slate-950 text-amber-400 font-black text-2xl flex items-center justify-center mb-2 shadow-md ring-2 ring-amber-400">
              {leaderboardData[0].avatar}
            </div>
            <div className="flex items-center gap-1">
              <h3 className="font-black text-lg text-slate-900">{leaderboardData[0].name}</h3>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">{leaderboardData[0].state}</span>
            <span className="mt-2 text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Score: {leaderboardData[0].score} (Acc: {leaderboardData[0].accuracy}%)
            </span>
            <span className="mt-2 text-xs font-black text-amber-900 bg-amber-400 px-3 py-1 rounded-md shadow-xs">
              {leaderboardData[0].grantAmount}
            </span>
          </div>

          {/* Rank 3 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col items-center text-center order-3 md:order-3 relative">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center mb-2 border border-amber-300">
              3
            </span>
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center mb-2">
              {leaderboardData[2].avatar}
            </div>
            <h3 className="font-bold text-base text-slate-900">{leaderboardData[2].name}</h3>
            <span className="text-xs text-slate-500 font-medium">{leaderboardData[2].state}</span>
            <span className="mt-2 text-xs font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              Score: {leaderboardData[2].score} ({leaderboardData[2].accuracy}%)
            </span>
            <span className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
              {leaderboardData[2].grantAmount}
            </span>
          </div>
        </div>

        {/* 4. Filter & Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* State Dropdown Filter */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
            >
              {statesList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

        </div>

        {/* 5. Complete Rankings Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
              National Rankings Breakdown
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredScholars.length} Verified Scholars
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredScholars.map((sc) => (
              <div
                key={sc.rank}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
              >
                {/* Rank & Scholar Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0 ${
                    sc.rank === 1
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : sc.rank === 2
                      ? 'bg-slate-200 text-slate-800'
                      : sc.rank === 3
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    #{sc.rank}
                  </span>

                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {sc.avatar}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{sc.name}</span>
                      {sc.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate">{sc.state} • Time: {sc.timeTaken}</span>
                  </div>
                </div>

                {/* Score & Scholarship Badge */}
                <div className="flex items-center gap-3 flex-shrink-0 text-right">
                  <div>
                    <span className="font-black text-xs sm:text-sm text-blue-700 block">{sc.score}</span>
                    <span className="text-[10px] text-slate-400 font-bold block">Acc: {sc.accuracy}%</span>
                  </div>

                  {sc.grantAmount ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block">
                      {sc.grantAmount}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hidden sm:inline-block">
                      {sc.xpEarned}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* 6. Footer & Bottom Bar */}
      <Footer />
      <BottomNav />

    </div>
  );
}