'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Award,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle2,
  Wallet,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Zap,
  ChevronRight,
  Calendar,
  Layers,
  ArrowUpRight,
  FileCheck
} from 'lucide-react';

interface TestRecord {
  id: string;
  testName: string;
  subject: string;
  date: string;
  score: string;
  maxScore: number;
  accuracy: number;
  status: 'Completed' | 'Audit Passed';
}

const RECENT_TESTS: TestRecord[] = [
  {
    id: 't-101',
    testName: 'Weekly Speed Sprint #14',
    subject: 'Indian Polity & Governance',
    date: '24 Aug 2026',
    score: '42.68',
    maxScore: 50,
    accuracy: 94.0,
    status: 'Audit Passed',
  },
  {
    id: 't-102',
    testName: 'Daily Speed Drill (10Q)',
    subject: 'Modern Indian History',
    date: '22 Aug 2026',
    score: '18.00',
    maxScore: 20,
    accuracy: 90.0,
    status: 'Completed',
  },
  {
    id: 't-103',
    testName: 'CSAT Quantitative Aptitude Drill',
    subject: 'Percentages & Profit-Loss',
    date: '19 Aug 2026',
    score: '16.68',
    maxScore: 20,
    accuracy: 85.5,
    status: 'Completed',
  },
  {
    id: 't-104',
    testName: 'Monthly Mega Assessment #08',
    subject: 'General Studies Full Mock',
    date: '15 Aug 2026',
    score: '78.50',
    maxScore: 100,
    accuracy: 88.2,
    status: 'Audit Passed',
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'wallet'>('overview');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white pb-24">
      {/* Top Banner Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Candidate Identity Profile */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                AS
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    Asuttosh Singh
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> KYC Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Candidate ID: <strong className="text-slate-800 font-mono">#ABH-842910</strong> • Target: UPSC CSE &amp; State PSC
                </p>
                <p className="text-[11px] text-slate-400">
                  Delhi-NCR, India • Member since March 2026
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/quiz"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Launch Speed Drill</span>
              </Link>
              <Link
                href="/olympiad"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Join Olympiad</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex items-center gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px cursor-pointer flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Performance Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px cursor-pointer flex items-center gap-2 ${
                activeTab === 'tests'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Assessment History ({RECENT_TESTS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px cursor-pointer flex items-center gap-2 ${
                activeTab === 'wallet'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-4 h-4 text-amber-500" />
              <span>Scholarship Wallet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Core Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tests Attempted</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">24</p>
                <p className="text-[11px] text-slate-500 mt-1">18 Speed Drills • 6 Olympiads</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Accuracy</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">91.4%</p>
                <p className="text-[11px] text-slate-500 mt-1">Top 5% of all active test-takers</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All-India Percentile</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">98.2 %ile</p>
                <p className="text-[11px] text-slate-500 mt-1">Highest Rank: #1 (Sprint #14)</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scholarships Won</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-purple-600 mt-2">₹7,000</p>
                <p className="text-[11px] text-slate-500 mt-1">Directly credited to verified UPI</p>
              </div>
            </div>

            {/* Subject Mastery & Strengths */}
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Left: Subject Mastery Bars (Span 7) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Subject-Wise Mastery Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluated from over 450+ attempted timed practice questions.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Subject 1 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Indian Polity &amp; Governance (भारतीय राजव्यवस्था)</span>
                      <span className="text-blue-600">94% Mastery</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>

                  {/* Subject 2 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Modern Indian History (आधुनिक भारत)</span>
                      <span className="text-emerald-600">88% Mastery</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>

                  {/* Subject 3 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Indian Economy &amp; Macroeconomics (अर्थव्यवस्था)</span>
                      <span className="text-amber-600">76% Mastery</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '76%' }} />
                    </div>
                  </div>

                  {/* Subject 4 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">CSAT Quantitative &amp; Logical Reasoning</span>
                      <span className="text-purple-600">90% Mastery</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Weak Area Diagnostic & Recommended Drills (Span 5) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    AI Diagnostic Recommendations
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Topics requiring revision before the next Olympiad slot.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Monetary Policy &amp; RBI Instruments</p>
                      <p className="text-[10px] text-rose-600 font-semibold mt-0.5">Accuracy dropped to 68%</p>
                    </div>
                    <Link
                      href="/quiz?topic=Monetary%20Policy"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>Drill</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">19th Century Peasant Movements</p>
                      <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Time per question higher (75s)</p>
                    </div>
                    <Link
                      href="/quiz?topic=Peasant%20Uprisings"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>Drill</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Test History */}
        {activeTab === 'tests' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Detailed Assessment Record</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your historical scorecards and step-by-step solution keys.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3 rounded-l-lg">Assessment Title</th>
                    <th className="py-3 px-3">Subject / Module</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Score</th>
                    <th className="py-3 px-3">Accuracy</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_TESTS.map((test) => (
                    <tr key={test.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {test.testName}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {test.subject}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        {test.date}
                      </td>
                      <td className="py-3.5 px-3 font-black text-slate-900">
                        {test.score} / {test.maxScore}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-600">
                        {test.accuracy}%
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          test.status === 'Audit Passed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {test.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <Link
                          href="/quiz"
                          className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <span>Review Keys</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Scholarship Wallet & KYC */}
        {activeTab === 'wallet' && (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Wallet Balance Card (Span 6) */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md uppercase">
                    Academic Fellowship Wallet
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">Available Grant Balance</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">₹5,000.00</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Ready for Payout</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Awarded for securing <strong>All-India Rank #1</strong> in Weekly Speed Sprint #14.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Linked UPI VPA:</span>
                  <strong className="text-slate-900 font-mono">asuttosh@okhdfcbank</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audit Verification:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                </div>
              </div>

              <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer">
                Withdraw Fellowship to Linked Bank (Zero Fee)
              </button>
            </div>

            {/* KYC & Compliance Verification (Span 6) */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  Statutory KYC &amp; Identity Verification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Required under Indian EdTech merit compliance for grant disbursement.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-emerald-900">Government Identity Proof</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Aadhaar Card / Institutional ID Verified</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-emerald-900">Bank Account / UPI Identifier</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Name match confirmed with registration</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Tax Deducted at Source (TDS Form 16A)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Below ₹10,000 statutory limit (No TDS deducted)</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                    Exempt
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}