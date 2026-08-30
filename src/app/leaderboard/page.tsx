'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Award,
  Search,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface RankEntry {
  rank: number;
  candidateName: string;
  avatarInitials: string;
  state: string;
  tier: 'weekly-sprint' | 'monthly-mega' | 'daily-drill';
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpent: string;
  scholarshipStatus: string;
  isVerified: boolean;
}

const LEADERBOARD_DATA: RankEntry[] = [
  // ================= 1. WEEKLY SPEED SPRINT =================
  {
    rank: 1,
    candidateName: 'Aditya Vardhan Sharma',
    avatarInitials: 'AS',
    state: 'Uttar Pradesh',
    tier: 'weekly-sprint',
    score: 96.02,
    maxScore: 100,
    accuracy: 98.0,
    timeSpent: '28m 14s',
    scholarshipStatus: '₹5,000 Fellowship Disbursed',
    isVerified: true,
  },
  {
    rank: 2,
    candidateName: 'Priya Meena',
    avatarInitials: 'PM',
    state: 'Rajasthan',
    tier: 'weekly-sprint',
    score: 93.36,
    maxScore: 100,
    accuracy: 96.0,
    timeSpent: '31m 45s',
    scholarshipStatus: '₹1,500 Book Grant Disbursed',
    isVerified: true,
  },
  {
    rank: 3,
    candidateName: 'Rohan Deshmukh',
    avatarInitials: 'RD',
    state: 'Maharashtra',
    tier: 'weekly-sprint',
    score: 91.38,
    maxScore: 100,
    accuracy: 94.2,
    timeSpent: '33m 10s',
    scholarshipStatus: '₹1,500 Book Grant Disbursed',
    isVerified: true,
  },
  {
    rank: 4,
    candidateName: 'Sneha Kulkarni',
    avatarInitials: 'SK',
    state: 'Karnataka',
    tier: 'weekly-sprint',
    score: 89.40,
    maxScore: 100,
    accuracy: 92.5,
    timeSpent: '34m 20s',
    scholarshipStatus: '₹1,500 Book Grant Disbursed',
    isVerified: true,
  },
  {
    rank: 5,
    candidateName: 'Vikramjit Singh',
    avatarInitials: 'VS',
    state: 'Punjab',
    tier: 'weekly-sprint',
    score: 88.08,
    maxScore: 100,
    accuracy: 91.8,
    timeSpent: '35m 55s',
    scholarshipStatus: '₹1,500 Book Grant Disbursed',
    isVerified: true,
  },
  {
    rank: 6,
    candidateName: 'Ananya Roy',
    avatarInitials: 'AR',
    state: 'West Bengal',
    tier: 'weekly-sprint',
    score: 86.76,
    maxScore: 100,
    accuracy: 90.0,
    timeSpent: '37m 12s',
    scholarshipStatus: '₹500 Subject Grant',
    isVerified: true,
  },
  {
    rank: 7,
    candidateName: 'Manish Kumar Patel',
    avatarInitials: 'MP',
    state: 'Madhya Pradesh',
    tier: 'weekly-sprint',
    score: 85.44,
    maxScore: 100,
    accuracy: 89.4,
    timeSpent: '38m 04s',
    scholarshipStatus: '₹500 Subject Grant',
    isVerified: true,
  },
  {
    rank: 8,
    candidateName: 'Kavita Sundaram',
    avatarInitials: 'KS',
    state: 'Tamil Nadu',
    tier: 'weekly-sprint',
    score: 84.12,
    maxScore: 100,
    accuracy: 88.5,
    timeSpent: '39m 18s',
    scholarshipStatus: '₹500 Subject Grant',
    isVerified: true,
  },
  {
    rank: 9,
    candidateName: 'Abhishek Jha',
    avatarInitials: 'AJ',
    state: 'Bihar',
    tier: 'weekly-sprint',
    score: 83.46,
    maxScore: 100,
    accuracy: 87.8,
    timeSpent: '40m 02s',
    scholarshipStatus: '₹500 Subject Grant',
    isVerified: true,
  },
  {
    rank: 10,
    candidateName: 'Divya Nambiar',
    avatarInitials: 'DN',
    state: 'Kerala',
    tier: 'weekly-sprint',
    score: 82.80,
    maxScore: 100,
    accuracy: 87.0,
    timeSpent: '41m 15s',
    scholarshipStatus: '₹500 Subject Grant',
    isVerified: true,
  },

  // ================= 2. MONTHLY MEGA OLYMPIAD =================
  {
    rank: 1,
    candidateName: 'Siddharth Mukherjee',
    avatarInitials: 'SM',
    state: 'West Bengal',
    tier: 'monthly-mega',
    score: 188.50,
    maxScore: 200,
    accuracy: 95.5,
    timeSpent: '1h 18m',
    scholarshipStatus: '₹25,000 Research Fellowship',
    isVerified: true,
  },
  {
    rank: 2,
    candidateName: 'Akash Deep Chaudhary',
    avatarInitials: 'AC',
    state: 'Haryana',
    tier: 'monthly-mega',
    score: 182.20,
    maxScore: 200,
    accuracy: 93.0,
    timeSpent: '1h 22m',
    scholarshipStatus: '₹10,000 Academic Grant',
    isVerified: true,
  },
  {
    rank: 3,
    candidateName: 'Shreya Iyer',
    avatarInitials: 'SI',
    state: 'Maharashtra',
    tier: 'monthly-mega',
    score: 179.00,
    maxScore: 200,
    accuracy: 91.8,
    timeSpent: '1h 25m',
    scholarshipStatus: '₹10,000 Academic Grant',
    isVerified: true,
  },
  {
    rank: 4,
    candidateName: 'Neeraj Mishra',
    avatarInitials: 'NM',
    state: 'Uttar Pradesh',
    tier: 'monthly-mega',
    score: 174.60,
    maxScore: 200,
    accuracy: 89.5,
    timeSpent: '1h 27m',
    scholarshipStatus: '₹3,000 Educational Grant',
    isVerified: true,
  },

  // ================= 3. DAILY PRACTICE DRILLS =================
  {
    rank: 1,
    candidateName: 'Kunal Rathore',
    avatarInitials: 'KR',
    state: 'Madhya Pradesh',
    tier: 'daily-drill',
    score: 20.00,
    maxScore: 20,
    accuracy: 100.0,
    timeSpent: '4m 12s',
    scholarshipStatus: 'Speed Master Badge',
    isVerified: true,
  },
  {
    rank: 2,
    candidateName: 'Megha Sen',
    avatarInitials: 'MS',
    state: 'Odisha',
    tier: 'daily-drill',
    score: 20.00,
    maxScore: 20,
    accuracy: 100.0,
    timeSpent: '4m 45s',
    scholarshipStatus: 'Speed Master Badge',
    isVerified: true,
  },
  {
    rank: 3,
    candidateName: 'Aman Preet',
    avatarInitials: 'AP',
    state: 'Delhi-NCR',
    tier: 'daily-drill',
    score: 18.66,
    maxScore: 20,
    accuracy: 95.0,
    timeSpent: '5m 02s',
    scholarshipStatus: 'Daily Top Performer',
    isVerified: true,
  },
  {
    rank: 4,
    candidateName: 'Tanya Gupta',
    avatarInitials: 'TG',
    state: 'Gujarat',
    tier: 'daily-drill',
    score: 18.00,
    maxScore: 20,
    accuracy: 92.0,
    timeSpent: '5m 20s',
    scholarshipStatus: 'Daily Top Performer',
    isVerified: true,
  }
];

export default function LeaderboardPage() {
  const [selectedTier, setSelectedTier] = useState<'weekly-sprint' | 'monthly-mega' | 'daily-drill'>('weekly-sprint');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRanks = useMemo(() => {
    return LEADERBOARD_DATA.filter((entry) => {
      const matchesTier = entry.tier === selectedTier;
      const matchesSearch =
        entry.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [selectedTier, searchQuery]);

  const topThree = filteredRanks.slice(0, 3);
  const remainingRanks = filteredRanks.slice(3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white pb-24">
      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>All-India Merit &amp; Scholarship Board</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                National Merit Standings
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                अखिल भारतीय मेधावी सूची • Transparent Algorithmic Ranking
              </p>
              <p className="mt-3 text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Live rankings calculated based on accuracy ratio, negative marking penalization, and recorded time efficiency under anti-cheat proctoring.
              </p>
            </div>

            {/* Quick Metrics Pill */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Evaluation Audit</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">100% Anti-Cheat Verified</p>
              </div>
            </div>
          </div>

          {/* Tier Selector Filter Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
            <button
              onClick={() => setSelectedTier('weekly-sprint')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                selectedTier === 'weekly-sprint'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Weekly Speed Sprint (Live)</span>
            </button>

            <button
              onClick={() => setSelectedTier('monthly-mega')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                selectedTier === 'monthly-mega'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Monthly Mega Olympiad</span>
            </button>

            <button
              onClick={() => setSelectedTier('daily-drill')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                selectedTier === 'daily-drill'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Daily Practice Drills</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Top 3 Podium Cards */}
        {topThree.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-5 items-end">
            
            {/* Rank 2 (Silver) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm order-2 md:order-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-200">
                  #2
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded flex items-center gap-1">
                  <Medal className="w-3 h-3 text-slate-400" /> Silver Honor
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900">{topThree[1].candidateName}</h3>
                <p className="text-xs text-slate-500">{topThree[1].state}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Score</p>
                  <p className="font-black text-slate-900 mt-0.5">{topThree[1].score} / {topThree[1].maxScore}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</p>
                  <p className="font-black text-emerald-600 mt-0.5">{topThree[1].accuracy}%</p>
                </div>
              </div>

              <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-800 text-center">
                {topThree[1].scholarshipStatus}
              </div>
            </div>

            {/* Rank 1 (Gold - Elevated) */}
            <div className="bg-gradient-to-b from-amber-50/80 to-white border-2 border-amber-300 rounded-3xl p-7 shadow-lg shadow-amber-500/10 order-1 md:order-2 relative overflow-hidden md:-translate-y-2">
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/30">
                  #1
                </span>
                <span className="text-[11px] font-black px-3 py-1 bg-amber-100 text-amber-900 rounded-full flex items-center gap-1 border border-amber-200">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" /> National Gold Rank
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-lg text-slate-900">{topThree[0].candidateName}</h3>
                <p className="text-xs text-slate-600 font-medium">{topThree[0].state}</p>
              </div>

              <div className="mt-5 pt-5 border-t border-amber-100 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Score</p>
                  <p className="font-black text-blue-600 text-sm mt-0.5">{topThree[0].score}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</p>
                  <p className="font-black text-emerald-600 text-sm mt-0.5">{topThree[0].accuracy}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Time</p>
                  <p className="font-black text-slate-900 text-xs mt-0.5">{topThree[0].timeSpent}</p>
                </div>
              </div>

              <div className="mt-5 p-3 bg-amber-100/70 border border-amber-200 rounded-xl text-xs font-black text-amber-950 text-center">
                🏆 {topThree[0].scholarshipStatus}
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm order-3 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200">
                  #3
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded flex items-center gap-1">
                  <Medal className="w-3 h-3 text-orange-500" /> Bronze Honor
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900">{topThree[2].candidateName}</h3>
                <p className="text-xs text-slate-500">{topThree[2].state}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Score</p>
                  <p className="font-black text-slate-900 mt-0.5">{topThree[2].score} / {topThree[2].maxScore}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</p>
                  <p className="font-black text-emerald-600 mt-0.5">{topThree[2].accuracy}%</p>
                </div>
              </div>

              <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-800 text-center">
                {topThree[2].scholarshipStatus}
              </div>
            </div>
          </div>
        )}

        {/* Search & Full Leaderboard Table */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                All-India Merit Standings ({filteredRanks.length} Candidates)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provisional ranking verified via anti-cheat event audit logs.
              </p>
            </div>

            {/* Candidate Search Box */}
            <div className="relative w-full sm:w-72 flex-shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3 rounded-l-lg">Rank</th>
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">State</th>
                  <th className="py-3 px-3">Score (+/ -)</th>
                  <th className="py-3 px-3">Accuracy</th>
                  <th className="py-3 px-3">Time Consumed</th>
                  <th className="py-3 px-3 rounded-r-lg">Merit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {remainingRanks.map((item) => (
                  <tr key={item.rank} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3 font-black text-slate-900">
                      #{item.rank}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-black text-[11px] flex items-center justify-center">
                          {item.avatarInitials}
                        </div>
                        <span className="font-bold text-slate-900">{item.candidateName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-medium">
                      {item.state}
                    </td>
                    <td className="py-3.5 px-3 font-black text-slate-900">
                      {item.score}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600">
                      {item.accuracy}%
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {item.timeSpent}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                        {item.scholarshipStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Audit Footer Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
            <p className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>All rank evaluations audited in strict chronological tie-breaker sequence.</span>
            </p>
            <Link
              href="/scholarship-rules"
              className="text-blue-600 font-semibold hover:underline"
            >
              Read Assessment Tie-Breaker Algorithm →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}