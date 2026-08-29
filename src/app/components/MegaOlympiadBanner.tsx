'use client';

import React, { useState, useEffect } from 'react';
import { Award, Users, Clock, ArrowRight, GraduationCap, Globe } from 'lucide-react';
import OlympiadModal from './OlympiadModal';

export default function MegaOlympiadBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 45, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNum = (num: number) => String(num).padStart(2, '0');

  return (
    <>
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-6 lg:p-8 shadow-lg border border-blue-800/40">
          
          {/* Glow */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 sm:gap-6">
            
            {/* Left Column: Dual Language Info */}
            <div className="flex-1 space-y-3">
              
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black bg-amber-400 text-slate-950 shadow-xs uppercase tracking-wider">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-950" />
                  All-India Weekly Olympiad | साप्ताहिक ओलंपियाड
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-blue-500/20 border border-blue-400/30 text-blue-300">
                  <Award className="w-3 h-3 text-blue-400" />
                  ₹50,000 Scholarships / छात्रवृत्ति
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  <Globe className="w-3 h-3 text-emerald-400" />
                  Bilingual (हिन्दी + English)
                </span>
              </div>

              {/* Dual Language Title */}
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                  राष्ट्रीय राजव्यवस्था ओलंपियाड <span className="text-amber-400 font-extrabold">: संवैधानिक ढांचा</span>
                </h2>
                <p className="text-sm sm:text-base font-bold text-blue-200/90 mt-0.5">
                  National Polity Olympiad : Constitutional Framework & Preamble
                </p>
                <p className="text-slate-300 text-xs sm:text-sm mt-1.5 font-normal">
                  UPSC & State PSC अखिल भारतीय मूल्यांकन परीक्षा • All-India Rank, Analysis & Merit Academic Grants.
                </p>
              </div>

              {/* Candidate Progress */}
              <div className="space-y-1.5 pt-0.5 max-w-md">
                <div className="flex justify-between text-[11px] sm:text-xs font-bold">
                  <span className="flex items-center gap-1 text-blue-300">
                    <Users className="w-3.5 h-3.5" /> 380 / 500 Aspirants Registered (पंजीकृत)
                  </span>
                  <span className="text-amber-300">Slots Filling Fast (76%)</span>
                </div>
                <div className="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full w-[76%]" />
                </div>
              </div>

            </div>

            {/* Right Column: Timer & Registration CTA */}
            <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-3 bg-white/5 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-white/10 min-w-[260px]">
              
              {/* Countdown */}
              <div className="text-left lg:text-center">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  <Clock className="w-3 h-3 text-amber-400" /> Starts In / प्रारंभ:
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <div className="bg-slate-950/70 border border-white/10 px-2 py-1 rounded-md text-center min-w-[38px]">
                    <span className="text-sm sm:text-base font-black text-amber-400">{formatNum(timeLeft.hours)}</span>
                    <span className="block text-[8px] text-slate-400">घंटे / H</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">:</span>
                  <div className="bg-slate-950/70 border border-white/10 px-2 py-1 rounded-md text-center min-w-[38px]">
                    <span className="text-sm sm:text-base font-black text-amber-400">{formatNum(timeLeft.minutes)}</span>
                    <span className="block text-[8px] text-slate-400">मिनट / M</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">:</span>
                  <div className="bg-slate-950/70 border border-white/10 px-2 py-1 rounded-md text-center min-w-[38px]">
                    <span className="text-sm sm:text-base font-black text-amber-400">{formatNum(timeLeft.seconds)}</span>
                    <span className="block text-[8px] text-slate-400">सेकंड / S</span>
                  </div>
                </div>
              </div>

              {/* Bilingual CTA */}
              <div className="flex-1 lg:w-full space-y-1">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full group bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>REGISTER • ₹49 | पंजीकरण</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <span className="block text-center text-[10px] text-slate-400 font-medium">
                  One-time Fee (एकल मूल्यांकन शुल्क)
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Registration & Merit Matrix Modal */}
      <OlympiadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}