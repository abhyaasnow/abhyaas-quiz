'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Trophy, Award, Zap, Flame, ShieldCheck, 
  Download, Calendar, Clock, CheckCircle2, ChevronRight, BookOpen 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';

export default function ProfileDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {/* 1. Top Navbar */}
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Feed (होम पेज)</span>
        </Link>

        {/* 2. Candidate Profile Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 text-white font-black text-2xl flex items-center justify-center shadow-md ring-4 ring-blue-100">
              AS
            </div>

            {/* Name & Meta */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Asuttosh Singh</h1>
                <span className="p-0.5 bg-blue-100 text-blue-700 rounded-full" title="Verified Candidate">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                UPSC CSE & State PSC Aspirant • Delhi-NCR
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  National AIR #142
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Medium: Bilingual
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                <Zap className="w-4 h-4 fill-amber-500" />
                <span className="text-xs font-bold text-slate-600">Total XP</span>
              </div>
              <span className="text-base sm:text-lg font-black text-slate-900">1,450 XP</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center min-w-[110px]">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-0.5">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span className="text-xs font-bold text-slate-600">Streak</span>
              </div>
              <span className="text-base sm:text-lg font-black text-slate-900">5 Days</span>
            </div>
          </div>

        </div>

        {/* 3. My Registered Olympiad Examination (Slot Card) */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>My Registered Olympiads (पंजीकृत परीक्षाएं)</span>
          </h2>

          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="space-y-1.5 flex-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3 text-slate-950" />
                Slot Confirmed • Registration ID: ABH-OLY-8924
              </span>
              <h3 className="text-base sm:text-lg font-bold">
                National Polity Olympiad : Constitutional Framework
              </h3>
              <p className="text-xs text-slate-300">
                अखिल भारतीय राजव्यवस्था मूल्यांकन • Medium: हिन्दी (Hindi)
              </p>

              <div className="flex items-center gap-4 text-xs text-blue-200 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Upcoming Sunday
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  11:00 AM IST
                </span>
              </div>
            </div>

            <Link
              href="/quiz"
              className="py-2.5 px-5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Attempt Mock Practice</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

          </div>
        </div>

        {/* 4. Verified E-Certificates & Badges */}
        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Academic Certificates & Awards (प्रमाण पत्र)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                  All-India Top 5% Scholar
                </span>
                <h4 className="font-bold text-sm text-slate-900">Modern History Benchmark Olympiad</h4>
                <span className="text-xs text-slate-400 block">Issued: 15 May 2026</span>
              </div>

              <button 
                onClick={() => alert('Certificate downloaded successfully!')}
                className="p-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                title="Download E-Certificate"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                  Topic Mastery Certificate
                </span>
                <h4 className="font-bold text-sm text-slate-900">Indian Polity: Fundamental Rights Drill</h4>
                <span className="text-xs text-slate-400 block">Issued: 02 June 2026</span>
              </div>

              <button 
                onClick={() => alert('Certificate downloaded successfully!')}
                className="p-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors"
                title="Download E-Certificate"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* 5. Footer & Bottom Bar */}
      <Footer />
      <BottomNav />

    </div>
  );
}